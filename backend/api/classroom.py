"""
Classroom API + WebSocket for JANBHASHA Live Classroom
The teacher's device acts as the hub; students connect via WebSocket.
No Internet required — works on local Wi-Fi / hotspot.
"""
import uuid, json, logging, socket
from datetime import datetime
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Request
from pydantic import BaseModel
from typing import Optional
from database.db import fetchone, fetchall, execute
from models.classroom import CreateSessionRequest, SessionInfo
from models.response import ok, error
from services.classroom.classroom_service import ClassroomManager

logger = logging.getLogger("janbhasha.classroom")
router = APIRouter()
manager = ClassroomManager()


def get_local_ip() -> str:
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "127.0.0.1"


@router.post("/create")
async def create_session(req: CreateSessionRequest, request: Request):
    """Teacher creates a new classroom session. Returns QR data."""
    # In real usage, teacher_id comes from auth token; using header for now
    teacher_id = int(request.headers.get("X-Teacher-Id", 1))

    teacher = await fetchone(
        """SELECT u.name, s.name as school_name, t.school_id
           FROM teachers t JOIN users u ON u.id=t.user_id
           LEFT JOIN schools s ON s.id=t.school_id
           WHERE t.id=?""",
        (teacher_id,)
    )
    if not teacher:
        return error("Teacher not found.", "NOT_FOUND")

    session_id = str(uuid.uuid4())[:8].upper()
    host_ip = get_local_ip()
    host_port = int(request.app.extra.get("port", 8000))
    class_name = None

    if req.class_id:
        cls = await fetchone("SELECT name, section FROM classes WHERE id=?", (req.class_id,))
        if cls:
            class_name = f"Class {cls['name']}-{cls['section']}"

    # Save session to DB
    await execute(
        """INSERT INTO classroom_sessions (session_id, teacher_id, class_id, subject, host_ip, host_port)
           VALUES (?,?,?,?,?,?)""",
        (session_id, teacher_id, req.class_id, req.subject, host_ip, host_port)
    )

    # QR payload — students scan this to connect
    qr_data = json.dumps({
        "app": "janbhasha",
        "session": session_id,
        "host": host_ip,
        "port": host_port,
        "teacher": teacher["name"],
        "class": class_name or "General",
        "subject": req.subject or "General",
    })

    return ok({
        "session_id": session_id,
        "qr_data": qr_data,
        "host_ip": host_ip,
        "host_port": host_port,
        "teacher_name": teacher["name"],
        "class_name": class_name,
        "subject": req.subject,
        "ws_url": f"ws://{host_ip}:{host_port}/api/classroom/ws/{session_id}",
    })


@router.get("/session/{session_id}")
async def get_session(session_id: str):
    """Get session info and connected students."""
    session = await fetchone(
        """SELECT cs.*, u.name as teacher_name
           FROM classroom_sessions cs
           JOIN teachers t ON t.id=cs.teacher_id
           JOIN users u ON u.id=t.user_id
           WHERE cs.session_id=?""",
        (session_id,)
    )
    if not session:
        return error("Session not found.", "NOT_FOUND")

    connected = manager.get_student_list(session_id)
    return ok({**dict(session), "connected_students": connected, "student_count": len(connected)})


@router.post("/session/{session_id}/end")
async def end_session(session_id: str):
    """Teacher ends the classroom session."""
    await execute(
        "UPDATE classroom_sessions SET status='ended', ended_at=? WHERE session_id=?",
        (datetime.now().isoformat(), session_id)
    )
    await manager.broadcast(session_id, {"event": "session_ended", "message": "Classroom session has ended."})
    manager.close_session(session_id)
    return ok(message="Session ended.")


@router.post("/session/{session_id}/broadcast")
async def broadcast_message(session_id: str, payload: dict):
    """Teacher broadcasts a message (text/translation/quiz) to all students."""
    await manager.broadcast(session_id, payload)
    return ok(message="Broadcast sent.")


@router.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """
    WebSocket endpoint for real-time classroom communication.
    Teacher and students connect here. Teacher broadcasts to all students.

    Message format (JSON):
    { "role": "teacher"|"student", "student_id": int, "name": str, "language": str }
    """
    session = await fetchone(
        "SELECT * FROM classroom_sessions WHERE session_id=? AND status='active'",
        (session_id,)
    )
    if not session:
        await websocket.close(code=4004)
        return

    await manager.connect(websocket, session_id)
    client_info = {}
    try:
        # First message should be identification
        raw = await websocket.receive_text()
        try:
            client_info = json.loads(raw)
        except Exception:
            client_info = {"role": "unknown"}

        role = client_info.get("role", "student")
        name = client_info.get("name", "Unknown")
        student_id = client_info.get("student_id")
        language = client_info.get("language", "hi")

        if role == "student" and student_id:
            await execute(
                """INSERT OR IGNORE INTO classroom_members (session_id, student_id)
                   VALUES (?,?)""",
                (session_id, student_id)
            )
            manager.register_student(session_id, websocket, {
                "student_id": student_id, "name": name, "language": language
            })
            # Notify teacher of new student
            await manager.notify_teacher(session_id, {
                "event": "student_joined",
                "student": {"id": student_id, "name": name, "language": language}
            })

        # Listen for messages from teacher
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
            except Exception:
                continue

            if role == "teacher":
                # Teacher broadcasting to all students
                await manager.broadcast_to_students(session_id, msg)
            else:
                # Student sending response to teacher
                await manager.send_to_teacher(session_id, {
                    "from": name,
                    "student_id": student_id,
                    "message": msg
                })

    except WebSocketDisconnect:
        manager.disconnect(websocket, session_id)
        if client_info.get("role") == "student":
            await manager.notify_teacher(session_id, {
                "event": "student_left",
                "student": {"id": client_info.get("student_id"), "name": client_info.get("name")}
            })
    except Exception as e:
        logger.error(f"WebSocket error in session {session_id}: {e}")
        manager.disconnect(websocket, session_id)
