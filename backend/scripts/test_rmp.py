import requests
import json

SCU = "U2Nob29sLTg4Mg=="
query = """
query TeacherSearchResultsPageQuery($query: TeacherSearchQuery!) {
  search: newSearch {
    teachers(query: $query, first: 5) {
      edges { node { firstName lastName department school { name } avgRatingRounded numRatings } }
    }
  }
}
"""
r = requests.post(
    "https://www.ratemyprofessors.com/graphql",
    json={"query": query, "variables": {"query": {"text": "", "schoolID": SCU}}},
    headers={
        "Authorization": "Basic dGVzdDp0ZXN0",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0",
        "Referer": "https://www.ratemyprofessors.com/",
    },
    timeout=30,
)
print(r.status_code)
body = r.json()
print(json.dumps(body, indent=2)[:3000])
if body.get("data"):
    search = body["data"].get("search") or {}
    teachers = search.get("teachers") or {}
    edges = teachers.get("edges") or []
    print("count", len(edges))
