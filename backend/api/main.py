import os
import json
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, Query as FastAPIQuery, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import aiosqlite

from .database import init_db, get_db, row_to_prof
from .models import ChatRequest

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
DB_PATH = os.getenv("DATABASE_PATH", "./data/professors.db")


@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield


app = FastAPI(title="SCU Professor Finder", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/professors")
async def get_professors(
    department: Optional[str] = None,
    school: Optional[str] = None,
    min_rating: float = 0.0,
    max_difficulty: float = 5.0,
    min_would_take_again: float = 0.0,
    tenure_track: Optional[bool] = None,
    course: Optional[str] = None,
    tags: list[str] = FastAPIQuery(default=[]),
    search: Optional[str] = None,
    sort_by: str = "avg_rating",
    sort_dir: str = "desc",
    limit: int = 500,
    offset: int = 0,
):
    conditions = []
    params = []

    if department:
        conditions.append("LOWER(department) LIKE ?")
        params.append(f"%{department.lower()}%")

    if school:
        conditions.append("LOWER(school) LIKE ?")
        params.append(f"%{school.lower()}%")

    if min_rating > 0:
        conditions.append("avg_rating >= ?")
        params.append(min_rating)

    if max_difficulty < 5.0:
        conditions.append("avg_difficulty <= ?")
        params.append(max_difficulty)

    if min_would_take_again > 0:
        conditions.append("would_take_again_percent >= ?")
        params.append(min_would_take_again)

    if tenure_track is not None:
        conditions.append("tenure_track = ?")
        params.append(1 if tenure_track else 0)

    if course:
        conditions.append("LOWER(courses_taught) LIKE ?")
        params.append(f"%{course.lower()}%")

    if search:
        conditions.append("(LOWER(full_name) LIKE ? OR LOWER(department) LIKE ?)")
        params.extend([f"%{search.lower()}%", f"%{search.lower()}%"])

    for tag in tags:
        conditions.append("LOWER(tags) LIKE ?")
        params.append(f"%{tag.lower()}%")

    where_clause = ("WHERE " + " AND ".join(conditions)) if conditions else ""

    valid_sorts = {"avg_rating", "avg_difficulty", "num_ratings", "would_take_again_percent", "last_name"}
    sort_col = sort_by if sort_by in valid_sorts else "avg_rating"
    sort_direction = "DESC" if sort_dir.lower() == "desc" else "ASC"

    query = f"""
        SELECT * FROM professors
        {where_clause}
        ORDER BY {sort_col} {sort_direction}
        LIMIT ? OFFSET ?
    """
    params.extend([limit, offset])

    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute(query, params) as cursor:
            rows = await cursor.fetchall()
            result = []
            for row in rows:
                d = dict(row)
                d["tenure_track"] = bool(d["tenure_track"])
                d["tags"] = json.loads(d.get("tags") or "[]")
                d["courses_taught"] = json.loads(d.get("courses_taught") or "[]")
                d["schedule"] = json.loads(d.get("schedule") or "[]")
                result.append(d)

    return {"professors": result, "total": len(result)}


@app.get("/api/professors/{professor_id}")
async def get_professor(professor_id: str):
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        async with db.execute("SELECT * FROM professors WHERE id = ?", (professor_id,)) as cursor:
            row = await cursor.fetchone()
            if not row:
                raise HTTPException(status_code=404, detail="Professor not found")
            d = dict(row)
            d["tenure_track"] = bool(d["tenure_track"])
            d["tags"] = json.loads(d.get("tags") or "[]")
            d["courses_taught"] = json.loads(d.get("courses_taught") or "[]")
            d["schedule"] = json.loads(d.get("schedule") or "[]")
            return d


@app.get("/api/departments")
async def get_departments():
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT DISTINCT department, school FROM professors ORDER BY school, department") as cursor:
            rows = await cursor.fetchall()
            return [{"department": r[0], "school": r[1]} for r in rows]


@app.get("/api/tags")
async def get_tags():
    async with aiosqlite.connect(DB_PATH) as db:
        async with db.execute("SELECT tags FROM professors WHERE tags != '[]'") as cursor:
            rows = await cursor.fetchall()
            tag_counts: dict[str, int] = {}
            for row in rows:
                for tag in json.loads(row[0]):
                    tag_counts[tag] = tag_counts.get(tag, 0) + 1
            sorted_tags = sorted(tag_counts.items(), key=lambda x: -x[1])
            return [{"tag": t, "count": c} for t, c in sorted_tags[:50]]


@app.post("/api/chat")
async def chat(req: ChatRequest):
    if not ANTHROPIC_API_KEY:
        raise HTTPException(status_code=500, detail="ANTHROPIC_API_KEY not configured")

    from anthropic import Anthropic
    client = Anthropic(api_key=ANTHROPIC_API_KEY)

    # Fetch a snapshot of visible professors for context
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        if req.visible_professor_ids:
            placeholders = ",".join("?" * len(req.visible_professor_ids[:30]))
            async with db.execute(
                f"SELECT full_name, department, avg_rating, avg_difficulty, would_take_again_percent, tags, courses_taught, tenure_track FROM professors WHERE id IN ({placeholders})",
                req.visible_professor_ids[:30]
            ) as cursor:
                rows = await cursor.fetchall()
        else:
            async with db.execute(
                "SELECT full_name, department, avg_rating, avg_difficulty, would_take_again_percent, tags, courses_taught, tenure_track FROM professors ORDER BY avg_rating DESC LIMIT 30"
            ) as cursor:
                rows = await cursor.fetchall()

        prof_context = []
        for row in rows:
            d = dict(row)
            prof_context.append(
                f"- {d['full_name']} ({d['department']}): rating={d['avg_rating']:.1f}/5, "
                f"difficulty={d['avg_difficulty']:.1f}/5, "
                f"would-take-again={d['would_take_again_percent']:.0f}%, "
                f"tenure={'yes' if d['tenure_track'] else 'no'}, "
                f"tags=[{', '.join(json.loads(d['tags'] or '[]')[:5])}], "
                f"courses=[{', '.join(json.loads(d['courses_taught'] or '[]')[:5])}]"
            )

    system_prompt = f"""You are a friendly and knowledgeable academic advisor for Santa Clara University (SCU).
Help students find the best professors based on their preferences and needs.

Here are the currently visible professors (filtered from the database):
{chr(10).join(prof_context) if prof_context else "No professors loaded yet — ask the user to run the scraper first or check their filters."}

Active filters: {json.dumps(req.active_filters)}

Guidelines:
- Be conversational, warm, and helpful
- Recommend specific professors when asked, citing their ratings and traits
- Explain tradeoffs (e.g., high difficulty but great learning experience)
- If the student describes what they want, map it to the professor traits you know
- Keep responses concise (2-4 sentences) unless asked for detail
- If asked a voice question, respond as if speaking naturally"""

    messages = [{"role": m.role, "content": m.content} for m in req.history]
    messages.append({"role": "user", "content": req.message})

    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1024,
        system=system_prompt,
        messages=messages,
    )

    return {"reply": response.content[0].text}


@app.get("/api/health")
async def health():
    return {"status": "ok"}
