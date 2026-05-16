"""
RateMyProfessors scraper using their public GraphQL API.
SCU School ID on RMP: 1078 (encoded: U2Nob29sLTEwNzg=)
"""

import requests
import time
import re

RMP_GRAPHQL = "https://www.ratemyprofessors.com/graphql"
SCU_SCHOOL_ID = "U2Nob29sLTg4Mg=="  # base64("School-882") — Santa Clara University

HEADERS = {
    "Authorization": "Basic dGVzdDp0ZXN0",
    "Content-Type": "application/json",
    "User-Agent": "Mozilla/5.0 (compatible; SCUProfessorFinder/1.0)",
    "Referer": "https://www.ratemyprofessors.com/",
}

SEARCH_QUERY = """
query TeacherSearchResultsPageQuery(
  $query: TeacherSearchQuery!
) {
  search: newSearch {
    teachers(query: $query, first: 1000) {
      didFallback
      edges {
        node {
          id
          legacyId
          firstName
          lastName
          department
          school {
            name
            id
          }
          avgRatingRounded
          avgDifficulty
          numRatings
          wouldTakeAgainPercent
          teacherRatingTags {
            legacyId
            tagName
            tagCount
          }
          courseCodes {
            courseName
            courseCount
          }
        }
      }
    }
  }
}
"""


def search_professors(query: str = "") -> list[dict]:
    """Search all professors at SCU on RateMyProfessors."""
    payload = {
        "query": SEARCH_QUERY,
        "variables": {
            "query": {"text": query, "schoolID": SCU_SCHOOL_ID},
        },
    }

    try:
        resp = requests.post(RMP_GRAPHQL, json=payload, headers=HEADERS, timeout=30)
        resp.raise_for_status()
        data = resp.json()
        if data.get("errors"):
            print(f"[RMP] GraphQL errors: {data['errors'][:1]}")
            return []
        search = (data.get("data") or {}).get("search") or {}
        teachers = search.get("teachers") or {}
        edges = teachers.get("edges") or []
        return [e["node"] for e in edges if e.get("node")]
    except Exception as e:
        print(f"[RMP] Error fetching professors: {e}")
        return []


def fetch_all_scu_professors() -> list[dict]:
    """
    Fetch all SCU professors from RMP by querying with empty string (returns all).
    RMP paginates to ~1000 results per query, so we also query by letter to catch more.
    """
    print("[RMP] Fetching all SCU professors...")
    all_profs: dict[str, dict] = {}

    # Main query
    profs = search_professors("")
    for p in profs:
        all_profs[p["id"]] = p
    print(f"[RMP] Main query returned {len(profs)} professors")

    # Query by first-letter to catch anyone missed
    for letter in "ABCDEFGHIJKLMNOPQRSTUVWXYZ":
        time.sleep(0.3)
        profs = search_professors(letter)
        new = 0
        for p in profs:
            if p["id"] not in all_profs:
                all_profs[p["id"]] = p
                new += 1
        if new:
            print(f"[RMP] Letter {letter}: +{new} new professors")

    print(f"[RMP] Total unique professors found: {len(all_profs)}")
    return list(all_profs.values())


def normalize_rmp_professor(node: dict) -> dict:
    """Convert an RMP GraphQL node to our internal professor dict."""
    tags = sorted(
        node.get("teacherRatingTags", []),
        key=lambda t: -t.get("tagCount", 0)
    )
    tag_names = [t["tagName"] for t in tags if t.get("tagCount", 0) > 0]

    courses = [c["courseName"] for c in node.get("courseCodes", []) if c.get("courseName")]

    return {
        "rmp_id": node.get("id", ""),
        "rmp_legacy_id": node.get("legacyId"),
        "first_name": node.get("firstName", ""),
        "last_name": node.get("lastName", ""),
        "full_name": f"{node.get('firstName', '')} {node.get('lastName', '')}".strip(),
        "department": node.get("department", "Unknown"),
        "avg_rating": node.get("avgRatingRounded") or 0.0,
        "avg_difficulty": node.get("avgDifficulty") or 0.0,
        "num_ratings": node.get("numRatings") or 0,
        "would_take_again_percent": node.get("wouldTakeAgainPercent") or -1.0,
        "tags": tag_names,
        "courses_taught": courses,
    }


if __name__ == "__main__":
    profs = fetch_all_scu_professors()
    for p in profs[:5]:
        norm = normalize_rmp_professor(p)
        print(norm)
