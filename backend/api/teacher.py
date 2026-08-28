"""Teacher API - Classes, students, assignments, analytics"""
import logging
from fastapi import APIRouter, Request
from pydantic import BaseModel
from typing import Optional, List
from database.db import fetchone, fetchall, execute
from models.response import ok, error

logger = logging.getLogger("janbhasha.teacher")
router = APIRouter()


@router.get("/{teacher_id}/profile")
async def teacher_profile(teacher_id: int):
    row = await fetchone(
        """SELECT t.id, t.user_id, u.name, u.email, u.phone, u.selected_language,
                  t.school_id, s.name as school_name, t.verification_status,
                  t.qualification, t.experience_years, u.created_at
           FROM teachers t JOIN users u ON u.id=t.user_id
           LEFT JOIN schools s ON s.id=t.school_id WHERE t.id=?""",
        (teacher_id,)
    )
    if not row:
        return error("Teacher not found.", "NOT_FOUND")
    return ok(row)


@router.get("/{teacher_id}/classes")
async def teacher_classes(teacher_id: int):
    rows = await fetchall(
        """SELECT DISTINCT c.id, c.name, c.section, c.academic_year, s.name as school_name,
                  COUNT(st.id) as student_count
           FROM teacher_classes tc JOIN classes c ON c.id=tc.class_id
           LEFT JOIN schools s ON s.id=c.school_id
           LEFT JOIN students st ON st.class_id=c.id
           WHERE tc.teacher_id=? GROUP BY c.id""",
        (teacher_id,)
    )
    return ok(rows)


@router.post("/{teacher_id}/classes")
async def create_class(teacher_id: int, payload: dict):
    name = payload.get("name", "")
    section = payload.get("section", "A")
    school_id = payload.get("school_id")
    if not name:
        return error("Class name is required.", "MISSING_FIELD")
    class_id = await execute(
        "INSERT INTO classes (name, section, school_id) VALUES (?,?,?)",
        (name, section, school_id)
    )
    await execute(
        "INSERT OR IGNORE INTO teacher_classes (teacher_id, class_id) VALUES (?,?)",
        (teacher_id, class_id)
    )
    return ok({"class_id": class_id}, "Class created.")


@router.get("/{teacher_id}/students")
async def teacher_students(teacher_id: int, class_id: Optional[int] = None):
    query = """SELECT s.id, s.student_code, u.name, s.class_id,
                      c.name as class_name, c.section, ss.total_xp, ss.level, ss.current_streak
               FROM students s JOIN users u ON u.id=s.user_id
               LEFT JOIN classes c ON c.id=s.class_id
               LEFT JOIN student_stats ss ON ss.student_id=s.id
               WHERE s.class_id IN (
                   SELECT class_id FROM teacher_classes WHERE teacher_id=?
               )"""
    params = [teacher_id]
    if class_id:
        query += " AND s.class_id=?"
        params.append(class_id)
    rows = await fetchall(query, tuple(params))
    return ok(rows)


@router.post("/{teacher_id}/students")
async def add_student(teacher_id: int, payload: dict):
    """Teacher adds a student to their class."""
    name = payload.get("name", "").strip()
    student_code = payload.get("student_code", "").strip()
    class_id = payload.get("class_id")
    recovery_pin = payload.get("recovery_pin", "000000")
    if not name or not student_code:
        return error("Name and student code are required.", "MISSING_FIELDS")

    existing = await fetchone("SELECT id FROM students WHERE student_code=?", (student_code,))
    if existing:
        return error("Student code already exists.", "DUPLICATE_CODE")

    import bcrypt
    pw_hash = bcrypt.hashpw(student_code.encode(), bcrypt.gensalt()).decode()
    pin_hash = bcrypt.hashpw(recovery_pin.encode(), bcrypt.gensalt()).decode()
    user_id = await execute(
        "INSERT INTO users (name, password_hash, role, status, recovery_pin_hash) VALUES (?,?,'student','active',?)",
        (name, pw_hash, pin_hash)
    )
    # Get school_id from teacher
    teacher = await fetchone("SELECT school_id FROM teachers WHERE id=?", (teacher_id,))
    student_id = await execute(
        "INSERT INTO students (user_id, student_code, class_id, school_id) VALUES (?,?,?,?)",
        (user_id, student_code, class_id, teacher["school_id"] if teacher else None)
    )
    await execute("INSERT INTO student_stats (student_id) VALUES (?)", (student_id,))
    return ok({"student_id": student_id, "student_code": student_code}, "Student added.")


@router.get("/{teacher_id}/analytics")
async def teacher_analytics(teacher_id: int):
    """Class performance analytics."""
    avg_xp = await fetchone(
        """SELECT AVG(ss.total_xp) as avg_xp, AVG(ss.current_streak) as avg_streak
           FROM student_stats ss JOIN students s ON s.id=ss.student_id
           WHERE s.class_id IN (SELECT class_id FROM teacher_classes WHERE teacher_id=?)""",
        (teacher_id,)
    )
    lessons_data = await fetchall(
        """SELECT l.title, COUNT(sp.id) as completions, AVG(sp.score) as avg_score
           FROM lessons l LEFT JOIN student_progress sp ON sp.lesson_id=l.id AND sp.status='completed'
           GROUP BY l.id ORDER BY completions DESC LIMIT 10"""
    )
    return ok({
        "avg_xp": round(avg_xp["avg_xp"] or 0, 1),
        "avg_streak": round(avg_xp["avg_streak"] or 0, 1),
        "top_lessons": lessons_data,
    })


@router.get("/{teacher_id}/assignments")
async def teacher_assignments(teacher_id: int):
    rows = await fetchall(
        """SELECT a.*, COUNT(sub.id) as submission_count,
                  c.name as class_name, c.section
           FROM assignments a
           LEFT JOIN submissions sub ON sub.assignment_id=a.id
           LEFT JOIN classes c ON c.id=a.class_id
           WHERE a.teacher_id=? GROUP BY a.id ORDER BY a.created_at DESC""",
        (teacher_id,)
    )
    return ok(rows)


@router.post("/{teacher_id}/assignments")
async def create_assignment(teacher_id: int, payload: dict):
    title = payload.get("title", "")
    if not title:
        return error("Title is required.", "MISSING_FIELD")
    assignment_id = await execute(
        """INSERT INTO assignments (title, description, teacher_id, class_id, subject_id, due_date, max_score, xp_reward)
           VALUES (?,?,?,?,?,?,?,?)""",
        (title, payload.get("description"), teacher_id, payload.get("class_id"),
         payload.get("subject_id"), payload.get("due_date"), payload.get("max_score", 100),
         payload.get("xp_reward", 50))
    )
    return ok({"assignment_id": assignment_id}, "Assignment created.")
