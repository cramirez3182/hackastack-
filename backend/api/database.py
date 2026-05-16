import aiosqlite
import json
import os

DB_PATH = os.getenv("DATABASE_PATH", "./data/professors.db")


async def get_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    return await aiosqlite.connect(DB_PATH)


async def init_db():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    async with aiosqlite.connect(DB_PATH) as db:
        await db.execute("""
            CREATE TABLE IF NOT EXISTS professors (
                id TEXT PRIMARY KEY,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                full_name TEXT NOT NULL,
                department TEXT NOT NULL,
                school TEXT NOT NULL,
                title TEXT NOT NULL,
                tenure_track INTEGER NOT NULL DEFAULT 0,
                email TEXT,
                photo_url TEXT,
                bio TEXT,
                profile_url TEXT,
                rmp_id TEXT,
                avg_rating REAL DEFAULT 0.0,
                avg_difficulty REAL DEFAULT 0.0,
                num_ratings INTEGER DEFAULT 0,
                would_take_again_percent REAL DEFAULT -1.0,
                tags TEXT DEFAULT '[]',
                courses_taught TEXT DEFAULT '[]',
                schedule TEXT DEFAULT '[]',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        await db.commit()


async def upsert_professor(db: aiosqlite.Connection, prof: dict):
    await db.execute("""
        INSERT INTO professors (
            id, first_name, last_name, full_name, department, school, title,
            tenure_track, email, photo_url, bio, profile_url, rmp_id,
            avg_rating, avg_difficulty, num_ratings, would_take_again_percent,
            tags, courses_taught, schedule, updated_at
        ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, CURRENT_TIMESTAMP)
        ON CONFLICT(id) DO UPDATE SET
            avg_rating=excluded.avg_rating,
            avg_difficulty=excluded.avg_difficulty,
            num_ratings=excluded.num_ratings,
            would_take_again_percent=excluded.would_take_again_percent,
            tags=excluded.tags,
            courses_taught=excluded.courses_taught,
            schedule=excluded.schedule,
            rmp_id=excluded.rmp_id,
            updated_at=CURRENT_TIMESTAMP
    """, (
        prof["id"], prof["first_name"], prof["last_name"], prof["full_name"],
        prof["department"], prof["school"], prof["title"],
        1 if prof.get("tenure_track") else 0,
        prof.get("email"), prof.get("photo_url"), prof.get("bio"),
        prof.get("profile_url"), prof.get("rmp_id"),
        prof.get("avg_rating", 0.0), prof.get("avg_difficulty", 0.0),
        prof.get("num_ratings", 0), prof.get("would_take_again_percent", -1.0),
        json.dumps(prof.get("tags", [])),
        json.dumps(prof.get("courses_taught", [])),
        json.dumps(prof.get("schedule", [])),
    ))
    await db.commit()


def row_to_prof(row, cursor) -> dict:
    cols = [d[0] for d in cursor.description]
    d = dict(zip(cols, row))
    d["tenure_track"] = bool(d["tenure_track"])
    d["tags"] = json.loads(d["tags"] or "[]")
    d["courses_taught"] = json.loads(d["courses_taught"] or "[]")
    d["schedule"] = json.loads(d["schedule"] or "[]")
    return d
