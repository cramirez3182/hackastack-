"""
Scrapes SCU faculty directory pages for professor metadata:
name, department, title, tenure status, email, photo, bio, profile URL.
"""

import re
import time
import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; SCUProfessorFinder/1.0 Educational Project)",
}

TENURE_KEYWORDS = ["associate professor", "professor", "full professor"]
NON_TENURE_KEYWORDS = ["lecturer", "adjunct", "instructor", "visiting", "professor of practice"]

# SCU faculty directory pages per school
FACULTY_PAGES = {
    "College of Arts & Sciences": [
        "https://www.scu.edu/cas/directory/",
    ],
    "Leavey School of Business": [
        "https://www.scu.edu/business/faculty/",
    ],
    "School of Engineering": [
        "https://www.scu.edu/engineering/faculty-research/faculty/",
    ],
    "School of Law": [
        "https://law.scu.edu/faculty/",
    ],
    "School of Education & Counseling Psychology": [
        "https://www.scu.edu/ecp/faculty/",
    ],
    "Jesuit School of Theology": [
        "https://www.scu.edu/jst/faculty/",
    ],
}


def is_tenure_track(title: str) -> bool:
    title_lower = title.lower()
    if any(k in title_lower for k in NON_TENURE_KEYWORDS):
        return False
    if any(k in title_lower for k in TENURE_KEYWORDS):
        return True
    return False


def scrape_cas_directory(url: str, school: str) -> list[dict]:
    """Generic scraper for SCU directory pages using common patterns."""
    professors = []
    try:
        resp = requests.get(url, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "lxml")

        # Try common SCU faculty listing patterns
        cards = (
            soup.select(".faculty-card")
            or soup.select(".directory-listing .person")
            or soup.select(".faculty-list li")
            or soup.select("article.faculty-member")
            or soup.select(".people-listing .person-card")
        )

        for card in cards:
            name_el = card.select_one("h2, h3, .name, .faculty-name, a[href*='/faculty/']")
            if not name_el:
                continue

            name = name_el.get_text(strip=True)
            if not name or len(name) < 4:
                continue

            parts = name.split()
            if len(parts) < 2:
                continue

            title_el = card.select_one(".title, .position, .faculty-title, .rank")
            title = title_el.get_text(strip=True) if title_el else "Faculty"

            dept_el = card.select_one(".department, .dept, .faculty-dept")
            dept = dept_el.get_text(strip=True) if dept_el else "Unknown"

            email_el = card.select_one("a[href^='mailto:']")
            email = email_el["href"].replace("mailto:", "") if email_el else None

            photo_el = card.select_one("img")
            photo_url = photo_el.get("src") or photo_el.get("data-src") if photo_el else None

            profile_el = card.select_one("a[href]")
            profile_url = profile_el["href"] if profile_el else None
            if profile_url and not profile_url.startswith("http"):
                profile_url = "https://www.scu.edu" + profile_url

            professors.append({
                "first_name": parts[0],
                "last_name": " ".join(parts[1:]),
                "full_name": name,
                "title": title,
                "department": dept,
                "school": school,
                "tenure_track": is_tenure_track(title),
                "email": email,
                "photo_url": photo_url,
                "profile_url": profile_url,
                "bio": None,
            })

    except Exception as e:
        print(f"[SCU] Error scraping {url}: {e}")

    return professors


def scrape_engineering_faculty(url: str, school: str) -> list[dict]:
    """Scraper tailored for engineering faculty page."""
    professors = []
    try:
        resp = requests.get(url, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, "lxml")

        for item in soup.select(".faculty-item, .person, .faculty-profile, article"):
            name_el = item.select_one("h2, h3, h4, .name")
            if not name_el:
                continue
            name = name_el.get_text(strip=True)
            if not name or len(name.split()) < 2:
                continue

            title_el = item.select_one(".position, .title, p")
            title = title_el.get_text(strip=True) if title_el else "Faculty"

            dept_el = item.select_one(".department, .dept")
            dept = dept_el.get_text(strip=True) if dept_el else "Engineering"

            email_el = item.select_one("a[href^='mailto:']")
            email = email_el["href"].replace("mailto:", "") if email_el else None

            photo_el = item.select_one("img")
            photo_url = None
            if photo_el:
                photo_url = photo_el.get("src") or photo_el.get("data-src")

            link_el = item.select_one("a[href]")
            profile_url = None
            if link_el:
                href = link_el["href"]
                if not href.startswith("mailto:"):
                    profile_url = href if href.startswith("http") else "https://www.scu.edu" + href

            parts = name.split()
            professors.append({
                "first_name": parts[0],
                "last_name": " ".join(parts[1:]),
                "full_name": name,
                "title": title,
                "department": dept,
                "school": school,
                "tenure_track": is_tenure_track(title),
                "email": email,
                "photo_url": photo_url,
                "profile_url": profile_url,
                "bio": None,
            })

    except Exception as e:
        print(f"[SCU] Engineering scrape error: {e}")

    return professors


def scrape_all_faculty() -> list[dict]:
    all_faculty = []
    seen_names: set[str] = set()

    for school, urls in FACULTY_PAGES.items():
        print(f"\n[SCU] Scraping: {school}")
        for url in urls:
            time.sleep(0.5)
            if "engineering" in url.lower():
                profs = scrape_engineering_faculty(url, school)
            else:
                profs = scrape_cas_directory(url, school)

            for p in profs:
                key = p["full_name"].lower()
                if key not in seen_names:
                    seen_names.add(key)
                    all_faculty.append(p)

        print(f"[SCU]  → Found {len(all_faculty)} unique faculty so far")

    return all_faculty


if __name__ == "__main__":
    faculty = scrape_all_faculty()
    print(f"\nTotal scraped: {len(faculty)}")
    for f in faculty[:5]:
        print(f)
