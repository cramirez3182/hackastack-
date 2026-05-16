"""
Parse SCU undergraduate schedule PDFs (published from Workday via the Registrar).
These are the same course sections / instructors students see in Workday Find Course Sections.
"""

from __future__ import annotations

import io
import re
import tempfile
from collections import defaultdict

import pdfplumber
import requests

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; SCUProfessorFinder/1.0 Educational Project)",
}

# Registrar publishes Workday schedule exports here (update each term as needed)
SCHEDULE_PDF_URLS = [
    "https://www.scu.edu/media/offices/registrar/Fall-2026-Undergraduate-Schedule-as-of-May-7.pdf",
]

SECTION_RE = re.compile(
    r"^([A-Z]{2,6})\s+(\d+[A-Z]?)-(\d+)\s*-\s*(.+)$"
)
MEETING_TAIL_RE = re.compile(
    r"\s+((?:M|Tu|T|W|Th|F|Sa|Su)(?:\s+(?:M|Tu|T|W|Th|F|Sa|Su))*)\s+"
    r"(\d{1,2}:\d{2}\s*(?:AM|PM))\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM))\s+(.+)$",
    re.IGNORECASE,
)
MEETING_ONLY_RE = re.compile(
    r"^((?:M|Tu|T|W|Th|F|Sa|Su)(?:\s+(?:M|Tu|T|W|Th|F|Sa|Su))*)\s+"
    r"(\d{1,2}:\d{2}\s*(?:AM|PM))\s*-\s*(\d{1,2}:\d{2}\s*(?:AM|PM))\s+(.+)$",
    re.IGNORECASE,
)
HEADER_SKIP_RE = re.compile(
    r"^(Spring|Fall|Winter|Summer)\s+\d{4}|Section Definition|Meeting Days|Undergraduate Schedule",
    re.IGNORECASE,
)

DAY_MAP = {
    "M": "Monday",
    "T": "Tuesday",
    "Tu": "Tuesday",
    "W": "Wednesday",
    "Th": "Thursday",
    "F": "Friday",
    "Sa": "Saturday",
    "Su": "Sunday",
}

SUBJECT_DEPT = {
    "ACTG": "Accounting",
    "COEN": "Computer Science",
    "ELEN": "Electrical Engineering",
    "AMTH": "Applied Mathematics",
    "MATH": "Mathematics",
    "PHYS": "Physics",
    "ECON": "Economics",
    "FIN": "Finance",
    "MKTG": "Marketing",
    "MGMT": "Management",
    "ANTH": "Anthropology",
    "ENGL": "English",
    "PSYC": "Psychology",
    "MECH": "Mechanical Engineering",
    "CIVL": "Civil Engineering",
    "BIOE": "Bioengineering",
}


def _parse_days(day_str: str) -> list[str]:
    tokens = day_str.split()
    days: list[str] = []
    i = 0
    while i < len(tokens):
        tok = tokens[i]
        if tok == "T" and i + 1 < len(tokens) and tokens[i + 1] == "Th":
            days.append("Thursday")
            i += 2
            continue
        if tok in DAY_MAP:
            days.append(DAY_MAP[tok])
        i += 1
    return days


def _to_24h(time_str: str) -> str:
    t = time_str.strip().upper()
    match = re.match(r"(\d{1,2}):(\d{2})\s*(AM|PM)", t)
    if not match:
        return time_str.strip()
    h, m, ap = int(match.group(1)), match.group(2), match.group(3)
    if ap == "PM" and h != 12:
        h += 12
    if ap == "AM" and h == 12:
        h = 0
    return f"{h:02d}:{m}"


def _split_instructors(raw: str) -> list[str]:
    names = []
    for part in re.split(r"\s*\|\s*", raw.strip()):
        part = re.sub(r"\s+", " ", part).strip()
        if part and part not in names:
            names.append(part)
    return names


def _emit_section(
    sections: list[dict],
    current: dict,
    days_raw: str,
    start_t: str,
    end_t: str,
    instructors_raw: str,
) -> None:
    course_code = f"{current['subject']} {current['number']}"
    for instructor in _split_instructors(instructors_raw):
        if not instructor or instructor.lower() in {"tba", "staff", "to be announced"}:
            continue
        for day in _parse_days(days_raw):
            sections.append({
                "instructor": instructor,
                "course_code": course_code,
                "course_name": current["title"],
                "section": current["section"],
                "day": day,
                "start_time": _to_24h(start_t),
                "end_time": _to_24h(end_t),
                "department": SUBJECT_DEPT.get(current["subject"], current["subject"]),
            })


def _parse_schedule_text(text: str) -> list[dict]:
    sections: list[dict] = []
    current: dict | None = None

    for raw_line in text.splitlines():
        line = re.sub(r"\s+", " ", raw_line).strip()
        if not line or HEADER_SKIP_RE.search(line):
            continue

        # Fall 2026 format: section + meeting + instructor on one line
        sec = SECTION_RE.match(line)
        if sec:
            subject, number, section_num, title_rest = sec.groups()
            tail = MEETING_TAIL_RE.search(title_rest)
            if tail:
                title = title_rest[: tail.start()].strip()
                days_raw, start_t, end_t, instructors_raw = tail.groups()
                current = {
                    "subject": subject,
                    "number": number,
                    "section": section_num,
                    "title": title,
                }
                _emit_section(sections, current, days_raw, start_t, end_t, instructors_raw)
                current = None
            else:
                current = {
                    "subject": subject,
                    "number": number,
                    "section": section_num,
                    "title": title_rest.strip(),
                }
            continue

        meeting_only = MEETING_ONLY_RE.match(line)
        if meeting_only and current:
            days_raw, start_t, end_t, instructors_raw = meeting_only.groups()
            _emit_section(sections, current, days_raw, start_t, end_t, instructors_raw)
            current = None
            continue

        if current:
            tail = MEETING_TAIL_RE.search(line)
            if tail:
                title_bit = line[: tail.start()].strip()
                if title_bit:
                    current["title"] = f"{current['title']} {title_bit}".strip()
                days_raw, start_t, end_t, instructors_raw = tail.groups()
                _emit_section(sections, current, days_raw, start_t, end_t, instructors_raw)
                current = None
            elif not re.match(r"^[A-Z]{2,6}\s+\d", line):
                current["title"] = f"{current['title']} {line}".strip()

    return sections


def download_schedule_text(url: str) -> str:
    print(f"[Schedule] Downloading {url}")
    resp = requests.get(url, headers=HEADERS, timeout=120)
    resp.raise_for_status()
    parts: list[str] = []
    with pdfplumber.open(io.BytesIO(resp.content)) as pdf:
        for page in pdf.pages:
            parts.append(page.extract_text() or "")
    return "\n".join(parts)


def scrape_schedule_sections(urls: list[str] | None = None) -> list[dict]:
    urls = urls or SCHEDULE_PDF_URLS
    all_sections: list[dict] = []
    seen: set[tuple] = set()

    for url in urls:
        try:
            text = download_schedule_text(url)
            for sec in _parse_schedule_text(text):
                key = (
                    sec["instructor"].lower(),
                    sec["course_code"],
                    sec["section"],
                    sec["day"],
                    sec["start_time"],
                )
                if key not in seen:
                    seen.add(key)
                    all_sections.append(sec)
        except Exception as e:
            print(f"[Schedule] Failed {url}: {e}")

    print(f"[Schedule] Parsed {len(all_sections)} section meetings with instructors")
    return all_sections


def build_instructor_records(sections: list[dict]) -> dict[str, dict]:
    """Group sections by instructor name into professor-shaped dicts."""
    by_name: dict[str, dict] = defaultdict(lambda: {
        "full_name": "",
        "department": "Unknown",
        "courses": set(),
        "schedule": [],
    })

    for sec in sections:
        name = sec["instructor"]
        rec = by_name[name]
        rec["full_name"] = name
        rec["department"] = sec["department"]
        rec["courses"].add(sec["course_code"])
        rec["schedule"].append({
            "day": sec["day"],
            "start_time": sec["start_time"],
            "end_time": sec["end_time"],
            "course_code": sec["course_code"],
            "course_name": sec["course_name"],
            "room": None,
        })

    result: dict[str, dict] = {}
    for name, rec in by_name.items():
        parts = name.split()
        if len(parts) < 2:
            continue
        result[name.lower()] = {
            "first_name": parts[0],
            "last_name": " ".join(parts[1:]),
            "full_name": name,
            "department": rec["department"],
            "school": "Santa Clara University",
            "title": "Instructor",
            "tenure_track": False,
            "courses_taught": sorted(rec["courses"]),
            "schedule": rec["schedule"],
        }
    print(f"[Schedule] Found {len(result)} unique instructors in schedule PDFs")
    return result


if __name__ == "__main__":
    secs = scrape_schedule_sections()
    profs = build_instructor_records(secs)
    for p in list(profs.values())[:3]:
        print(p["full_name"], len(p["courses_taught"]), "courses", len(p["schedule"]), "slots")
