"""Pydantic models for Classroom sessions"""
from pydantic import BaseModel
from typing import Optional, List
from enum import Enum


class ClassroomStatus(str, Enum):
    active = "active"
    ended = "ended"


class CreateSessionRequest(BaseModel):
    class_id: Optional[int] = None
    subject: Optional[str] = None
    teacher_language: str = "hi"


class SessionInfo(BaseModel):
    session_id: str
    teacher_name: str
    class_name: Optional[str]
    subject: Optional[str]
    host_ip: str
    host_port: int
    status: ClassroomStatus
    student_count: int = 0
    started_at: str


class StudentInSession(BaseModel):
    student_id: int
    name: str
    student_code: str
    selected_language: str
    is_active: bool
    joined_at: str


class BroadcastMessage(BaseModel):
    message_type: str  # "translation", "text", "question", "quiz_start", "quiz_end"
    content: str
    source_lang: str = "hi"
    translations: Optional[dict] = None  # {lang_code: translated_text}
    audio_urls: Optional[dict] = None   # {lang_code: audio_url}
    metadata: Optional[dict] = None


class ClassroomEvent(BaseModel):
    event_type: str  # "student_joined", "student_left", "message", "end_session"
    session_id: str
    data: dict
