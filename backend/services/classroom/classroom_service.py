"""
WebSocket Classroom Session Manager
Manages teacher and student connections for live classroom sessions.
No Internet required - works over local Wi-Fi/hotspot.
"""
import json
import logging
from typing import Dict, List, Optional
from fastapi import WebSocket

logger = logging.getLogger("janbhasha.classroom")


class ClassroomManager:
    def __init__(self):
        # session_id → {"teacher": ws, "students": [{ws, info}]}
        self._sessions: Dict[str, dict] = {}

    def _ensure_session(self, session_id: str):
        if session_id not in self._sessions:
            self._sessions[session_id] = {"teacher": None, "students": []}

    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self._ensure_session(session_id)
        logger.info(f"WebSocket connected to session {session_id}")

    def disconnect(self, websocket: WebSocket, session_id: str):
        if session_id not in self._sessions:
            return
        session = self._sessions[session_id]
        if session["teacher"] == websocket:
            session["teacher"] = None
        session["students"] = [s for s in session["students"] if s["ws"] != websocket]
        logger.info(f"WebSocket disconnected from session {session_id}")

    def register_student(self, session_id: str, websocket: WebSocket, info: dict):
        self._ensure_session(session_id)
        # Remove existing entry for this student if reconnecting
        self._sessions[session_id]["students"] = [
            s for s in self._sessions[session_id]["students"]
            if s["info"].get("student_id") != info.get("student_id")
        ]
        self._sessions[session_id]["students"].append({"ws": websocket, "info": info})
        logger.info(f"Student {info.get('name')} joined session {session_id}")

    def register_teacher(self, session_id: str, websocket: WebSocket):
        self._ensure_session(session_id)
        self._sessions[session_id]["teacher"] = websocket

    def get_student_list(self, session_id: str) -> List[dict]:
        if session_id not in self._sessions:
            return []
        return [s["info"] for s in self._sessions[session_id]["students"]]

    async def broadcast(self, session_id: str, message: dict):
        """Broadcast to teacher and all students."""
        if session_id not in self._sessions:
            return
        payload = json.dumps(message)
        session = self._sessions[session_id]
        dead = []
        targets = []
        if session["teacher"]:
            targets.append(session["teacher"])
        targets.extend([s["ws"] for s in session["students"]])
        for ws in targets:
            try:
                await ws.send_text(payload)
            except Exception:
                dead.append(ws)
        # Clean up dead connections
        for ws in dead:
            self.disconnect(ws, session_id)

    async def broadcast_to_students(self, session_id: str, message: dict):
        """Teacher → all students broadcast."""
        if session_id not in self._sessions:
            return
        payload = json.dumps(message)
        dead = []
        for student in self._sessions[session_id]["students"]:
            try:
                await student["ws"].send_text(payload)
            except Exception:
                dead.append(student["ws"])
        for ws in dead:
            self.disconnect(ws, session_id)

    async def notify_teacher(self, session_id: str, message: dict):
        """Send a message only to the teacher."""
        if session_id not in self._sessions:
            return
        teacher_ws = self._sessions[session_id].get("teacher")
        if teacher_ws:
            try:
                await teacher_ws.send_text(json.dumps(message))
            except Exception:
                self._sessions[session_id]["teacher"] = None

    async def send_to_teacher(self, session_id: str, message: dict):
        await self.notify_teacher(session_id, message)

    def close_session(self, session_id: str):
        if session_id in self._sessions:
            del self._sessions[session_id]
