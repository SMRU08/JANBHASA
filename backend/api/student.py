"""Student API - Progress, XP, badges, submissions, adaptive learning"""
import logging
from fastapi import APIRouter
from typing import Optional
from datetime import datetime, date
from database.db import fetchone, fetchall, execute
from models.response import ok, error

logger = logging.getLogger("janbhasha.student")
router = APIRouter()


@router.get("/{student_id}/profile")
async def student_profile(student_id: int):
    row = await fetchone(
        """SELECT s.id, s.student_code, u.name, u.selected_language,
                  c.name as class_name, c.section, sch.name as school_name,
                  ss.total_xp, ss.level, ss.current_streak, ss.longest_streak,
                  ss.lessons_completed, ss.quizzes_passed, ss.last_activity_date
           FROM students s JOIN users u ON u.id=s.user_id
           LEFT JOIN classes c ON c.id=s.class_id
           LEFT JOIN schools sch ON sch.id=s.school_id
           LEFT JOIN student_stats ss ON ss.student_id=s.id
           WHERE s.id=?""",
        (student_id,)
    )
    if not row:
        return error("Student not found.", "NOT_FOUND")
    return ok(row)


@router.get("/{student_id}/progress")
async def student_progress(student_id: int, subject: Optional[str] = None):
    rows = await fetchall(
        """SELECT sp.*, l.title, l.subject_id, l.class_level, l.icon, l.xp_reward
           FROM student_progress sp JOIN lessons l ON l.id=sp.lesson_id
           WHERE sp.student_id=? ORDER BY sp.updated_at DESC""",
        (student_id,)
    )
    return ok(rows)


@router.post("/{student_id}/progress")
async def update_progress(student_id: int, payload: dict):
    lesson_id = payload.get("lesson_id")
    status = payload.get("status", "in_progress")
    progress_pct = payload.get("progress_percent", 0)
    score = payload.get("score")

    await execute(
        """INSERT INTO student_progress (student_id, lesson_id, status, progress_percent, score, updated_at)
           VALUES (?,?,?,?,?,?)
           ON CONFLICT(student_id, lesson_id) DO UPDATE SET
           status=excluded.status, progress_percent=excluded.progress_percent,
           score=excluded.score, updated_at=excluded.updated_at""",
        (student_id, lesson_id, status, progress_pct, score, datetime.now().isoformat())
    )

    if status == "completed":
        lesson = await fetchone("SELECT xp_reward FROM lessons WHERE id=?", (lesson_id,))
        xp = lesson["xp_reward"] if lesson else 20
        await award_xp(student_id, xp, "lesson_completed", lesson_id, "lesson")
        await execute(
            "UPDATE student_stats SET lessons_completed=lessons_completed+1, updated_at=? WHERE student_id=?",
            (datetime.now().isoformat(), student_id)
        )
        await check_badges(student_id)

    return ok(message="Progress updated.")


@router.get("/{student_id}/badges")
async def student_badges(student_id: int):
    earned = await fetchall(
        """SELECT b.*, sb.earned_at FROM badges b
           JOIN student_badges sb ON sb.badge_id=b.id
           WHERE sb.student_id=? ORDER BY sb.earned_at DESC""",
        (student_id,)
    )
    all_badges = await fetchall("SELECT * FROM badges ORDER BY xp_reward")
    earned_ids = {r["id"] for r in earned}
    locked = [b for b in all_badges if b["id"] not in earned_ids]
    return ok({"earned": earned, "locked": locked})


@router.post("/{student_id}/xp")
async def add_xp(student_id: int, payload: dict):
    amount = payload.get("amount", 10)
    reason = payload.get("reason", "activity")
    ref_id = payload.get("reference_id")
    ref_type = payload.get("reference_type")
    await award_xp(student_id, amount, reason, ref_id, ref_type)
    stats = await fetchone("SELECT total_xp, level FROM student_stats WHERE student_id=?", (student_id,))
    return ok({"total_xp": stats["total_xp"] if stats else amount, "level": stats["level"] if stats else 1})


async def award_xp(student_id: int, amount: int, reason: str, ref_id=None, ref_type=None):
    """Award XP and update level."""
    await execute(
        "INSERT INTO xp_transactions (student_id, amount, reason, reference_id, reference_type) VALUES (?,?,?,?,?)",
        (student_id, amount, reason, ref_id, ref_type)
    )
    await execute(
        "UPDATE student_stats SET total_xp=total_xp+?, updated_at=? WHERE student_id=?",
        (amount, datetime.now().isoformat(), student_id)
    )
    # Level up check
    stats = await fetchone("SELECT total_xp FROM student_stats WHERE student_id=?", (student_id,))
    if stats:
        new_level = max(1, stats["total_xp"] // 100 + 1)
        await execute("UPDATE student_stats SET level=? WHERE student_id=?", (new_level, student_id))


async def check_badges(student_id: int):
    """Check if student has earned any new badges."""
    stats = await fetchone("SELECT * FROM student_stats WHERE student_id=?", (student_id,))
    if not stats:
        return
    all_badges = await fetchall("SELECT * FROM badges WHERE condition_type IS NOT NULL")
    earned = {r["badge_id"] for r in await fetchall(
        "SELECT badge_id FROM student_badges WHERE student_id=?", (student_id,)
    )}

    stat_map = {
        "flashcards_completed": stats.get("flashcards_completed", 0),
        "voice_uses": stats.get("voice_uses", 0),
        "stories_read": stats.get("stories_read", 0),
        "quizzes_passed": stats.get("quizzes_passed", 0),
        "lessons_completed": stats.get("lessons_completed", 0),
        "streak": stats.get("current_streak", 0),
        "classroom_joined": 1 if stats.get("last_activity_date") else 0,
    }

    for badge in all_badges:
        if badge["id"] in earned:
            continue
        val = stat_map.get(badge["condition_type"], 0)
        if val >= (badge["condition_value"] or 999):
            await execute(
                "INSERT OR IGNORE INTO student_badges (student_id, badge_id) VALUES (?,?)",
                (student_id, badge["id"])
            )
            await award_xp(student_id, badge["xp_reward"], "badge_earned", badge["id"], "badge")
            logger.info(f"Badge '{badge['badge_key']}' unlocked for student {student_id}")


@router.get("/{student_id}/assignments")
async def student_assignments(student_id: int):
    student = await fetchone("SELECT class_id FROM students WHERE id=?", (student_id,))
    if not student:
        return error("Student not found.", "NOT_FOUND")
    rows = await fetchall(
        """SELECT a.*, sub.score, sub.submitted_at,
                  CASE WHEN sub.id IS NOT NULL THEN 'submitted' ELSE 'pending' END as status
           FROM assignments a
           LEFT JOIN submissions sub ON sub.assignment_id=a.id AND sub.student_id=?
           WHERE a.class_id=? AND a.is_active=1
           ORDER BY a.due_date ASC""",
        (student_id, student["class_id"])
    )
    return ok(rows)


@router.post("/{student_id}/submissions")
async def submit_assignment(student_id: int, payload: dict):
    assignment_id = payload.get("assignment_id")
    answers = payload.get("answers", {})
    score = payload.get("score", 0)
    max_score = payload.get("max_score", 100)
    xp = payload.get("xp_award", 50)

    import json
    await execute(
        """INSERT OR REPLACE INTO submissions (assignment_id, student_id, score, max_score, answers_json, xp_awarded, submitted_at)
           VALUES (?,?,?,?,?,?,?)""",
        (assignment_id, student_id, score, max_score, json.dumps(answers), xp, datetime.now().isoformat())
    )
    await award_xp(student_id, xp, "assignment_submitted", assignment_id, "assignment")
    await execute(
        "UPDATE student_stats SET quizzes_passed=quizzes_passed+1, updated_at=? WHERE student_id=?",
        (datetime.now().isoformat(), student_id)
    )
    return ok({"score": score, "xp_awarded": xp}, "Submission recorded.")


@router.post("/{student_id}/attendance")
async def mark_attendance(student_id: int, payload: dict):
    class_id = payload.get("class_id")
    att_date = payload.get("date", date.today().isoformat())
    status = payload.get("status", "present")
    await execute(
        """INSERT OR IGNORE INTO attendance (student_id, class_id, date, status)
           VALUES (?,?,?,?)""",
        (student_id, class_id, att_date, status)
    )
    # Update streak
    await update_streak(student_id, att_date)
    return ok(message="Attendance recorded.")


async def update_streak(student_id: int, activity_date: str):
    """Update daily login streak."""
    stats = await fetchone("SELECT * FROM student_stats WHERE student_id=?", (student_id,))
    if not stats:
        return
    last = stats.get("last_activity_date")
    today = activity_date[:10]
    if last == today:
        return
    from datetime import timedelta
    yesterday = (date.fromisoformat(today) - timedelta(days=1)).isoformat()
    if last == yesterday:
        new_streak = stats["current_streak"] + 1
    else:
        new_streak = 1
    longest = max(stats["longest_streak"], new_streak)
    await execute(
        "UPDATE student_stats SET current_streak=?, longest_streak=?, last_activity_date=? WHERE student_id=?",
        (new_streak, longest, today, student_id)
    )
    await check_badges(student_id)
