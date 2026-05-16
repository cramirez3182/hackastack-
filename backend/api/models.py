from pydantic import BaseModel
from typing import Optional


class TimeSlot(BaseModel):
    day: str  # "Monday", "Tuesday", etc.
    start_time: str  # "09:00"
    end_time: str  # "10:15"
    course_code: str
    course_name: str
    room: Optional[str] = None


class Professor(BaseModel):
    id: str
    first_name: str
    last_name: str
    full_name: str
    department: str
    school: str  # college within SCU
    title: str
    tenure_track: bool
    email: Optional[str] = None
    photo_url: Optional[str] = None
    bio: Optional[str] = None
    profile_url: Optional[str] = None

    # RateMyProfessors data
    rmp_id: Optional[str] = None
    avg_rating: float = 0.0
    avg_difficulty: float = 0.0
    num_ratings: int = 0
    would_take_again_percent: float = -1.0
    tags: list[str] = []
    courses_taught: list[str] = []

    # Schedule
    schedule: list[TimeSlot] = []


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatMessage] = []
    active_filters: dict = {}
    visible_professor_ids: list[str] = []
