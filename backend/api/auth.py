"""
Authentication API routes for JANBHASHA
Handles: login, register, password recovery (fully offline)
"""

import bcrypt
import logging
from fastapi import APIRouter, HTTPException, Request
from datetime import datetime

from database.db import fetchone, execute, fetchall
from models.user import (
    LoginRequest, LoginResponse, TeacherRegisterRequest,
    PasswordRecoveryRequest, AccountRecoveryAdminRequest, UserOut
)
from models.response import ok, error

logger = logging.getLogger("janbhasha.auth")
router = APIRouter()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(password.encode(), hashed.encode())
    except Exception:
        return False


@router.post("/login")
async def login(req: LoginRequest):
    """Login for teacher, student, or admin. Fully offline."""
    identifier = req.identifier.strip()
    role = req.role.value

    # Find user by email, phone, or student_code (case-insensitive)
    user = await fetchone(
        """SELECT u.*, s.id as student_id, s.student_code, t.id as teacher_id
           FROM users u
           LEFT JOIN students s ON s.user_id = u.id
           LEFT JOIN teachers t ON t.user_id = u.id
           WHERE u.role = ? AND u.status != 'inactive'
           AND (u.email = ? OR u.phone = ? OR s.student_code = ? COLLATE NOCASE)""",
        (role, identifier, identifier, identifier)
    )

    if not user:
        # If student role, create a friendly auto-registered student account on first login
        if role == "student" and identifier:
            pw_hash = hash_password(identifier)
            pin_hash = hash_password("000000")
            user_id = await execute(
                """INSERT INTO users (name, password_hash, role, status, selected_language, recovery_pin_hash)
                   VALUES (?, ?, 'student', 'active', 'hi', ?)""",
                (f"Student {identifier.upper()}", pw_hash, pin_hash)
            )
            student_id = await execute(
                """INSERT INTO students (user_id, student_code, class_id, school_id)
                   VALUES (?, ?, 1, 1)""",
                (user_id, identifier.upper())
            )
            await execute("INSERT OR IGNORE INTO student_stats (student_id) VALUES (?)", (student_id,))
            user = {
                "id": user_id,
                "name": f"Student {identifier.upper()}",
                "role": "student",
                "status": "active",
                "selected_language": "hi",
                "email": None,
                "phone": None,
                "student_id": student_id,
                "student_code": identifier.upper(),
                "last_login": datetime.now().isoformat()
            }
        else:
            return error("User not found. Please check your ID.", "USER_NOT_FOUND")

    if user["status"] == "locked":
        return error("Account is locked. Please contact your admin.", "ACCOUNT_LOCKED")

    if user["status"] == "pending":
        return error("Account is pending approval. Please wait for admin verification.", "ACCOUNT_PENDING")

    # Teachers and Admins require password verification
    if role != "student":
        if not verify_password(req.password, user["password_hash"]):
            return error("Incorrect password. Please try again.", "WRONG_PASSWORD")

    # Update last login
    await execute(
        "UPDATE users SET last_login = ? WHERE id = ?",
        (datetime.now().isoformat(), user["id"])
    )

    return ok({
        "id": user["id"],
        "name": user["name"],
        "role": user["role"],
        "status": user["status"],
        "selected_language": user.get("selected_language") or "hi",
        "email": user.get("email"),
        "phone": user.get("phone"),
        "student_id": user.get("student_id"),
        "student_code": user.get("student_code"),
        "teacher_id": user.get("teacher_id"),
        "last_login": user.get("last_login"),
    }, "Login successful")


@router.post("/register/teacher")
async def register_teacher(req: TeacherRegisterRequest):
    """Register a new teacher (starts as pending, needs admin approval)."""
    existing = await fetchone(
        "SELECT id FROM users WHERE phone = ? OR (email != '' AND email IS NOT NULL AND email = ?)",
        (req.phone, req.email or "")
    )
    if existing:
        return error("A user with this phone or email already exists.", "DUPLICATE_USER")

    pw_hash = hash_password(req.password)
    pin_hash = hash_password(req.recovery_pin)

    try:
        user_id = await execute(
            """INSERT INTO users (name, phone, email, password_hash, role, status, recovery_pin_hash)
               VALUES (?, ?, ?, ?, 'teacher', 'pending', ?)""",
            (req.name, req.phone, req.email, pw_hash, pin_hash)
        )

        school = await fetchone("SELECT id FROM schools WHERE name = ?", (req.school_name,))
        if not school:
            school_id = await execute(
                "INSERT INTO schools (name) VALUES (?)", (req.school_name,)
            )
        else:
            school_id = school["id"]

        await execute(
            """INSERT INTO teachers (user_id, school_id, qualification)
               VALUES (?, ?, ?)""",
            (user_id, school_id, req.qualification)
        )

        logger.info(f"New teacher registered: {req.name} (pending approval)")
        return ok({
            "user_id": user_id,
            "status": "pending",
            "message": "Registration submitted. Please wait for admin approval."
        }, "Registration successful")

    except Exception as e:
        logger.error(f"Teacher registration error: {e}")
        return error("Registration failed. Please try again.", "REGISTRATION_FAILED")


@router.post("/register/student")
async def register_student(req: dict):
    """Register a new student (by teacher or admin)."""
    name = req.get("name", "").strip()
    student_code = req.get("student_code", "").strip().upper()
    class_id = req.get("class_id", 1)
    school_id = req.get("school_id", 1)
    password = req.get("password", student_code)
    recovery_pin = req.get("recovery_pin", "000000")

    if not name or not student_code:
        return error("Name and Student Code are required.", "MISSING_FIELDS")

    existing = await fetchone("SELECT id FROM students WHERE student_code = ?", (student_code,))
    if existing:
        return error("Student code already exists.", "DUPLICATE_CODE")

    pw_hash = hash_password(password)
    pin_hash = hash_password(recovery_pin)

    user_id = await execute(
        """INSERT INTO users (name, password_hash, role, status, recovery_pin_hash)
           VALUES (?, ?, 'student', 'active', ?)""",
        (name, pw_hash, pin_hash)
    )
    student_id = await execute(
        """INSERT INTO students (user_id, student_code, class_id, school_id)
           VALUES (?, ?, ?, ?)""",
        (user_id, student_code, class_id, school_id)
    )
    await execute(
        "INSERT INTO student_stats (student_id) VALUES (?)", (student_id,)
    )

    return ok({"user_id": user_id, "student_id": student_id, "student_code": student_code})


@router.post("/recover")
async def recover_password(req: PasswordRecoveryRequest):
    """Recover password using recovery PIN (offline, no email needed)."""
    identifier = req.identifier.strip()
    user = await fetchone(
        """SELECT u.*, s.student_code FROM users u
           LEFT JOIN students s ON s.user_id = u.id
           WHERE u.email = ? OR u.phone = ? OR s.student_code = ?""",
        (identifier, identifier, identifier)
    )

    if not user:
        return error("User not found.", "USER_NOT_FOUND")

    if not user["recovery_pin_hash"]:
        return error("No recovery PIN set. Please contact your admin.", "NO_RECOVERY_PIN")

    if not verify_password(req.recovery_pin, user["recovery_pin_hash"]):
        return error("Incorrect recovery PIN.", "WRONG_PIN")

    new_hash = hash_password(req.new_password)
    await execute("UPDATE users SET password_hash = ? WHERE id = ?", (new_hash, user["id"]))

    return ok(message="Password reset successfully. You can now log in.")


@router.post("/admin/recover-account")
async def admin_recover_account(req: AccountRecoveryAdminRequest):
    """Admin-assisted account recovery."""
    user = await fetchone("SELECT * FROM users WHERE id = ?", (req.user_id,))
    if not user:
        return error("User not found.", "USER_NOT_FOUND")

    if req.action == "reset_password":
        if not req.new_password:
            return error("New password is required.", "MISSING_PASSWORD")
        new_hash = hash_password(req.new_password)
        await execute("UPDATE users SET password_hash = ? WHERE id = ?", (new_hash, req.user_id))

    elif req.action == "unlock":
        await execute("UPDATE users SET status = 'active' WHERE id = ?", (req.user_id,))

    elif req.action == "lock":
        await execute("UPDATE users SET status = 'locked' WHERE id = ?", (req.user_id,))

    elif req.action == "generate_pin":
        import random
        new_pin = str(random.randint(100000, 999999))
        pin_hash = hash_password(new_pin)
        await execute("UPDATE users SET recovery_pin_hash = ? WHERE id = ?", (pin_hash, req.user_id))
        return ok({"new_pin": new_pin}, "New recovery PIN generated")

    await execute(
        "INSERT INTO recovery_records (user_id, action, notes) VALUES (?, ?, ?)",
        (req.user_id, req.action, req.notes)
    )

    return ok(message=f"Account action '{req.action}' performed successfully.")


@router.put("/update-language")
async def update_language(user_id: int, language: str):
    """Update user's selected UI language."""
    await execute("UPDATE users SET selected_language = ? WHERE id = ?", (language, user_id))
    return ok(message="Language updated")
