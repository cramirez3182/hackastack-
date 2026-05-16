"""
Master scraper: SCU faculty + Workday schedule PDFs + RateMyProfessors.
Run with: python -m scraper.run_scraper
"""

import asyncio
import hashlib
import os
import re
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.database import init_db, upsert_professor, get_db
from scraper.scu_scraper import scrape_all_faculty
from scraper.rmp_scraper import fetch_all_scu_professors, normalize_rmp_professor
from scraper.schedule_scraper import scrape_schedule_sections, build_instructor_records

_COURSE_NORM_RE = re.compile(r'^([A-Z]{2,6})\s*(\d+.*)$')


def normalize_course(code: str) -> str:
    """Normalize 'ANTH2' and 'ANTH 2' to the same canonical 'ANTH 2'."""
    m = _COURSE_NORM_RE.match(code.strip().upper())
    if m:
        return f"{m.group(1)} {m.group(2).strip()}"
    return code.strip().upper()


def make_id(name: str, dept: str) -> str:
    key = f"{name.lower().strip()}|{dept.lower().strip()}"
    return hashlib.md5(key.encode()).hexdigest()[:16]


def fuzzy_match(name1: str, name2: str) -> bool:
    n1 = name1.lower().split()
    n2 = name2.lower().split()
    if not n1 or not n2:
        return False
    return (n1[0] == n2[0] and n1[-1] == n2[-1]) or n1[-1] == n2[-1]


def find_schedule_match(full_name: str, schedule_profs: dict[str, dict]) -> dict | None:
    key = full_name.lower()
    if key in schedule_profs:
        return schedule_profs[key]
    for sname, sdata in schedule_profs.items():
        if fuzzy_match(full_name, sdata["full_name"]):
            return sdata
    return None


def merge_schedule(prof: dict, sched: dict) -> None:
    existing_courses = {normalize_course(c) for c in (prof.get("courses_taught") or [])}
    existing_courses.update(normalize_course(c) for c in (sched.get("courses_taught") or []))
    prof["courses_taught"] = sorted(existing_courses)

    existing_schedule = prof.get("schedule") or []
    seen = {(s["day"], s["start_time"], s["course_code"]) for s in existing_schedule}
    for slot in sched.get("schedule") or []:
        key = (slot["day"], slot["start_time"], slot["course_code"])
        if key not in seen:
            existing_schedule.append(slot)
            seen.add(key)
    prof["schedule"] = existing_schedule


async def run():
    print("=" * 60)
    print("SCU Professor Finder — Data Scraper")
    print("=" * 60)

    await init_db()

    print("\n[Step 1] Parsing Workday schedule PDFs (Registrar)...")
    sections = scrape_schedule_sections()
    schedule_profs = build_instructor_records(sections)

    print("\n[Step 2] Scraping SCU faculty directory...")
    scu_faculty = scrape_all_faculty()
    print(f"  Found {len(scu_faculty)} faculty members from SCU website")

    print("\n[Step 3] Fetching RateMyProfessors data for SCU...")
    rmp_nodes = fetch_all_scu_professors()
    rmp_profs = [normalize_rmp_professor(n) for n in rmp_nodes]
    print(f"  Found {len(rmp_profs)} professors on RateMyProfessors")

    rmp_by_lastname: dict[str, list[dict]] = {}
    for rp in rmp_profs:
        rmp_by_lastname.setdefault(rp["last_name"].lower(), []).append(rp)

    print("\n[Step 4] Merging and saving to database...")
    merged_count = 0
    rmp_only: list[dict] = []
    schedule_matched = 0
    rmp_matched = set()
    saved_ids: set[str] = set()

    db = await get_db()
    try:
        for fac in scu_faculty:
            prof_id = make_id(fac["full_name"], fac["department"])
            prof = {
                **fac,
                "id": prof_id,
                "rmp_id": None,
                "avg_rating": 0.0,
                "avg_difficulty": 0.0,
                "num_ratings": 0,
                "would_take_again_percent": -1.0,
                "tags": [],
                "courses_taught": [],
                "schedule": [],
            }

            sched = find_schedule_match(fac["full_name"], schedule_profs)
            if sched:
                merge_schedule(prof, sched)
                schedule_matched += 1

            last = fac["last_name"].lower()
            for rmp in rmp_by_lastname.get(last, []):
                if fuzzy_match(fac["full_name"], rmp["full_name"]):
                    prof.update({
                        "rmp_id": rmp["rmp_id"],
                        "avg_rating": rmp["avg_rating"],
                        "avg_difficulty": rmp["avg_difficulty"],
                        "num_ratings": rmp["num_ratings"],
                        "would_take_again_percent": rmp["would_take_again_percent"],
                        "tags": rmp["tags"],
                    })
                    prof["courses_taught"] = sorted(
                        {normalize_course(c) for c in prof["courses_taught"]}
                        | {normalize_course(c) for c in (rmp.get("courses_taught") or [])}
                    )
                    rmp_matched.add(rmp["rmp_id"])
                    merged_count += 1
                    break

            await upsert_professor(db, prof)
            saved_ids.add(prof_id)

        for skey, sched in schedule_profs.items():
            if any(fuzzy_match(sched["full_name"], f["full_name"]) for f in scu_faculty):
                continue
            prof_id = make_id(sched["full_name"], sched["department"])
            if prof_id in saved_ids:
                continue
            prof = {
                "id": prof_id,
                **sched,
                "email": None,
                "photo_url": None,
                "bio": None,
                "profile_url": None,
                "rmp_id": None,
                "avg_rating": 0.0,
                "avg_difficulty": 0.0,
                "num_ratings": 0,
                "would_take_again_percent": -1.0,
                "tags": [],
            }
            prof["courses_taught"] = sorted(normalize_course(c) for c in prof.get("courses_taught") or [])
            last = sched["last_name"].lower()
            for rmp in rmp_by_lastname.get(last, []):
                if fuzzy_match(sched["full_name"], rmp["full_name"]):
                    prof.update({
                        "rmp_id": rmp["rmp_id"],
                        "avg_rating": rmp["avg_rating"],
                        "avg_difficulty": rmp["avg_difficulty"],
                        "num_ratings": rmp["num_ratings"],
                        "would_take_again_percent": rmp["would_take_again_percent"],
                        "tags": rmp["tags"],
                    })
                    prof["courses_taught"] = sorted(
                        {normalize_course(c) for c in prof["courses_taught"]}
                        | {normalize_course(c) for c in (rmp.get("courses_taught") or [])}
                    )
                    rmp_matched.add(rmp["rmp_id"])
                    merged_count += 1
                    break
            await upsert_professor(db, prof)
            saved_ids.add(prof_id)

        for rmp in rmp_profs:
            if rmp["rmp_id"] in rmp_matched:
                continue
            prof_id = make_id(rmp["full_name"], rmp["department"])
            if prof_id in saved_ids:
                continue
            prof = {
                "id": prof_id,
                "first_name": rmp["first_name"],
                "last_name": rmp["last_name"],
                "full_name": rmp["full_name"],
                "department": rmp["department"],
                "school": "Santa Clara University",
                "title": "Faculty",
                "tenure_track": False,
                "email": None,
                "photo_url": None,
                "bio": None,
                "profile_url": None,
                "rmp_id": rmp["rmp_id"],
                "avg_rating": rmp["avg_rating"],
                "avg_difficulty": rmp["avg_difficulty"],
                "num_ratings": rmp["num_ratings"],
                "would_take_again_percent": rmp["would_take_again_percent"],
                "tags": rmp["tags"],
                "courses_taught": sorted(normalize_course(c) for c in (rmp.get("courses_taught") or [])),
                "schedule": [],
            }
            await upsert_professor(db, prof)
            saved_ids.add(prof_id)
            rmp_only.append(prof)
    finally:
        await db.close()

    total = len(saved_ids)
    print(f"\n{'='*60}")
    print(f"  Schedule instructors:     {len(schedule_profs)}")
    print(f"  SCU directory faculty:    {len(scu_faculty)}")
    print(f"  Schedule merged:          {schedule_matched}")
    print(f"  RMP merged:               {merged_count}")
    print(f"  RMP-only added:           {len(rmp_only)}")
    print(f"  Total professors saved:   {total}")
    print("  Database ready at: ./data/professors.db")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    asyncio.run(run())
