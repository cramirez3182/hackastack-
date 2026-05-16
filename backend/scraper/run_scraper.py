"""
Master scraper: combines SCU faculty directory + RateMyProfessors data.
Run with: python -m scraper.run_scraper
"""

import asyncio
import hashlib
import json
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api.database import init_db, upsert_professor, get_db
from scraper.scu_scraper import scrape_all_faculty
from scraper.rmp_scraper import fetch_all_scu_professors, normalize_rmp_professor


def make_id(name: str, dept: str) -> str:
    key = f"{name.lower().strip()}|{dept.lower().strip()}"
    return hashlib.md5(key.encode()).hexdigest()[:16]


def fuzzy_match(name1: str, name2: str) -> bool:
    """Simple name matching: both names share same first+last token."""
    n1 = name1.lower().split()
    n2 = name2.lower().split()
    if not n1 or not n2:
        return False
    return (n1[0] == n2[0] and n1[-1] == n2[-1]) or n1[-1] == n2[-1]


async def run():
    print("=" * 60)
    print("SCU Professor Finder — Data Scraper")
    print("=" * 60)

    await init_db()

    # Step 1: Scrape SCU faculty directory
    print("\n[Step 1] Scraping SCU faculty directory...")
    scu_faculty = scrape_all_faculty()
    print(f"  Found {len(scu_faculty)} faculty members from SCU website")

    # Step 2: Fetch RateMyProfessors data
    print("\n[Step 2] Fetching RateMyProfessors data for SCU...")
    rmp_nodes = fetch_all_scu_professors()
    rmp_profs = [normalize_rmp_professor(n) for n in rmp_nodes]
    print(f"  Found {len(rmp_profs)} professors on RateMyProfessors")

    # Build RMP lookup by last name -> list of rmp profs
    rmp_by_lastname: dict[str, list[dict]] = {}
    for rp in rmp_profs:
        key = rp["last_name"].lower()
        rmp_by_lastname.setdefault(key, []).append(rp)

    # Step 3: Merge and save
    print("\n[Step 3] Merging and saving to database...")
    merged_count = 0
    rmp_only: list[dict] = []
    rmp_matched = set()

    async with await get_db() as db:
        # Process SCU faculty first
        for fac in scu_faculty:
            prof_id = make_id(fac["full_name"], fac["department"])
            prof = {**fac, "id": prof_id, "rmp_id": None, "avg_rating": 0.0,
                    "avg_difficulty": 0.0, "num_ratings": 0,
                    "would_take_again_percent": -1.0, "tags": [], "courses_taught": [],
                    "schedule": []}

            # Try to find matching RMP entry
            last = fac["last_name"].lower()
            candidates = rmp_by_lastname.get(last, [])
            for rmp in candidates:
                if fuzzy_match(fac["full_name"], rmp["full_name"]):
                    prof.update({
                        "rmp_id": rmp["rmp_id"],
                        "avg_rating": rmp["avg_rating"],
                        "avg_difficulty": rmp["avg_difficulty"],
                        "num_ratings": rmp["num_ratings"],
                        "would_take_again_percent": rmp["would_take_again_percent"],
                        "tags": rmp["tags"],
                        "courses_taught": rmp["courses_taught"],
                    })
                    rmp_matched.add(rmp["rmp_id"])
                    merged_count += 1
                    break

            await upsert_professor(db, prof)

        # Add RMP-only professors (not found in SCU directory)
        for rmp in rmp_profs:
            if rmp["rmp_id"] in rmp_matched:
                continue
            prof_id = make_id(rmp["full_name"], rmp["department"])
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
                "courses_taught": rmp["courses_taught"],
                "schedule": [],
            }
            await upsert_professor(db, prof)
            rmp_only.append(prof)

    total = len(scu_faculty) + len(rmp_only)
    print(f"\n{'='*60}")
    print(f"  SCU directory faculty:    {len(scu_faculty)}")
    print(f"  Merged with RMP data:     {merged_count}")
    print(f"  RMP-only (not in dir):    {len(rmp_only)}")
    print(f"  Total professors saved:   {total}")
    print("  Database ready at: ./data/professors.db")
    print(f"{'='*60}\n")


if __name__ == "__main__":
    asyncio.run(run())
