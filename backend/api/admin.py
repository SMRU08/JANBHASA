"""Admin API - Teacher verification, user management, system overview"""
import logging
from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import Optional
from database.db import fetchone, fetchall, execute
from models.response import ok, error

logger = logging.getLogger("janbhasha.admin")
router = APIRouter()


@router.get("/overview")
async def system_overview():
    """Dashboard statistics for admin."""
    teachers = await fetchone("SELECT COUNT(*) as cnt FROM teachers WHERE verification_status='approved'")
    pending = await fetchone("SELECT COUNT(*) as cnt FROM teachers WHERE verification_status='pending'")
    students = await fetchone("SELECT COUNT(*) as cnt FROM students")
    schools = await fetchone("SELECT COUNT(*) as cnt FROM schools")
    sessions_today = await fetchone(
        "SELECT COUNT(*) as cnt FROM classroom_sessions WHERE date(started_at)=date('now')"
    )
    langs = await fetchone("SELECT COUNT(*) as cnt FROM language_packs WHERE is_installed=1")

    import os
    from pathlib import Path
    db_path = os.getenv("DB_PATH", "../database/janbhasha.db")
    try:
        db_size_mb = round(os.path.getsize(db_path) / 1_000_000, 2)
    except Exception:
        db_size_mb = 0.0

    return ok({
        "teachers": teachers["cnt"] if teachers else 0,
        "teachers_pending": pending["cnt"] if pending else 0,
        "students": students["cnt"] if students else 0,
        "schools": schools["cnt"] if schools else 0,
        "active_classrooms_today": sessions_today["cnt"] if sessions_today else 0,
        "installed_languages": langs["cnt"] if langs else 0,
        "db_size_mb": db_size_mb,
    })


@router.get("/teachers/pending")
async def pending_teachers():
    """List teachers pending admin verification."""
    rows = await fetchall(
        """SELECT t.id as teacher_id, u.id as user_id, u.name, u.email, u.phone,
                  u.created_at, t.qualification, s.name as school_name
           FROM teachers t
           JOIN users u ON u.id=t.user_id
           LEFT JOIN schools s ON s.id=t.school_id
           WHERE t.verification_status='pending'
           ORDER BY u.created_at DESC"""
    )
    return ok(rows)


@router.post("/teachers/{teacher_id}/approve")
async def approve_teacher(teacher_id: int):
    """Approve a pending teacher."""
    teacher = await fetchone("SELECT * FROM teachers WHERE id=?", (teacher_id,))
    if not teacher:
        return error("Teacher not found.", "NOT_FOUND")
    from datetime import datetime
    await execute(
        "UPDATE teachers SET verification_status='approved', verified_at=? WHERE id=?",
        (datetime.now().isoformat(), teacher_id)
    )
    await execute(
        "UPDATE users SET status='active' WHERE id=?", (teacher["user_id"],)
    )
    logger.info(f"Teacher {teacher_id} approved")
    return ok(message="Teacher approved successfully.")


@router.post("/teachers/{teacher_id}/reject")
async def reject_teacher(teacher_id: int, reason: Optional[str] = None):
    """Reject a pending teacher."""
    teacher = await fetchone("SELECT * FROM teachers WHERE id=?", (teacher_id,))
    if not teacher:
        return error("Teacher not found.", "NOT_FOUND")
    await execute(
        "UPDATE teachers SET verification_status='rejected' WHERE id=?", (teacher_id,)
    )
    await execute("UPDATE users SET status='inactive' WHERE id=?", (teacher["user_id"],))
    return ok(message="Teacher rejected.")


@router.get("/users")
async def list_users(role: Optional[str] = None, status: Optional[str] = None, search: Optional[str] = None):
    """List all users with optional filters."""
    query = "SELECT id, name, email, phone, role, status, selected_language, created_at FROM users WHERE 1=1"
    params = []
    if role:
        query += " AND role=?"; params.append(role)
    if status:
        query += " AND status=?"; params.append(status)
    if search:
        query += " AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)"
        params.extend([f"%{search}%"] * 3)
    query += " ORDER BY created_at DESC"
    rows = await fetchall(query, tuple(params))
    return ok(rows)


@router.post("/users/{user_id}/lock")
async def lock_user(user_id: int):
    await execute("UPDATE users SET status='locked' WHERE id=?", (user_id,))
    return ok(message="Account locked.")


@router.post("/users/{user_id}/unlock")
async def unlock_user(user_id: int):
    await execute("UPDATE users SET status='active' WHERE id=?", (user_id,))
    return ok(message="Account unlocked.")


@router.get("/recovery/records")
async def recovery_records():
    rows = await fetchall(
        """SELECT r.*, u.name as user_name, p.name as performed_by_name
           FROM recovery_records r
           JOIN users u ON u.id=r.user_id
           LEFT JOIN users p ON p.id=r.performed_by
           ORDER BY r.created_at DESC LIMIT 100"""
    )
    return ok(rows)


@router.get("/language-packs")
async def get_language_packs():
    rows = await fetchall("SELECT * FROM language_packs ORDER BY name")
    return ok(rows)


@router.post("/language-packs/{pack_id}/install")
async def install_language_pack(pack_id: str):
    from datetime import datetime
    await execute(
        "UPDATE language_packs SET is_installed=1, installed_at=? WHERE pack_id=?",
        (datetime.now().isoformat(), pack_id)
    )
    return ok(message=f"Language pack '{pack_id}' marked as installed.")


@router.post("/language-packs/{pack_id}/uninstall")
async def uninstall_language_pack(pack_id: str):
    await execute(
        "UPDATE language_packs SET is_installed=0, installed_at=NULL WHERE pack_id=?",
        (pack_id,)
    )
    return ok(message=f"Language pack '{pack_id}' uninstalled.")
