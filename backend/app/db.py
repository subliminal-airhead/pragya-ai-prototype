from sqlmodel import SQLModel, Field, Column
from typing import Optional
from datetime import datetime
import uuid

class Session(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    last_seen: datetime = Field(default_factory=datetime.utcnow)

class ProfileRow(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    session_id: str = Field(index=True)
    profile_json: str  # JSON string of the StudentProfile
    raw_text_hash: str = Field(index=True)  # Hash of the raw text for deduplication

class RoadmapRow(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    session_id: str = Field(index=True)
    profile_id: str = Field(index=True)
    roadmap_json: str  # JSON string of the Roadmap
    status: str = Field(default="building")  # building, done, failed
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class ResumeRow(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    session_id: str = Field(index=True)
    profile_id: str = Field(index=True)
    resume_json: str  # JSON string of the ResumeRewrite
    score_before: Optional[int] = None
    score_after: Optional[int] = None

class InterviewRow(SQLModel, table=True):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()), primary_key=True)
    session_id: str = Field(index=True)
    role_id: str
    difficulty: str
    turns_json: str  # JSON string of the interview turns
    status: str = Field(default="in_progress")  # in_progress, finished

class LLMCache(SQLModel, table=True):
    key: str = Field(primary_key=True)  # sha256 of the prompt
    response_json: str  # JSON string of the cached response
    created_at: datetime = Field(default_factory=datetime.utcnow)