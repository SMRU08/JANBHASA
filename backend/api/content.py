"""Content API - Lessons, chapters, flashcards, questions, stories"""
import logging
from fastapi import APIRouter
from typing import Optional
from database.db import fetchall, fetchone, execute
from models.response import ok, error

logger = logging.getLogger("janbhasha.content")
router = APIRouter()


@router.get("/lessons")
async def get_lessons(class_level: Optional[str] = None, subject_id: Optional[int] = None, lang: str = "hi"):
    query = "SELECT * FROM lessons WHERE is_active=1"
    params = []
    if class_level:
        query += " AND class_level=?"; params.append(class_level)
    if subject_id:
        query += " AND subject_id=?"; params.append(subject_id)
    query += " ORDER BY order_index ASC"
    rows = await fetchall(query, tuple(params))
    return ok(rows)


@router.get("/lessons/{lesson_id}")
async def get_lesson_detail(lesson_id: int):
    lesson = await fetchone("SELECT * FROM lessons WHERE id=?", (lesson_id,))
    if not lesson:
        return error("Lesson not found.", "NOT_FOUND")
    chapters = await fetchall("SELECT * FROM chapters WHERE lesson_id=? ORDER BY order_index", (lesson_id,))
    questions = await fetchall("SELECT * FROM questions WHERE lesson_id=?", (lesson_id,))
    for q in questions:
        q["answers"] = await fetchall("SELECT * FROM answers WHERE question_id=? ORDER BY order_index", (q["id"],))
    return ok({"lesson": lesson, "chapters": chapters, "questions": questions})


@router.get("/flashcards")
async def get_flashcards(class_level: Optional[str] = None, category: Optional[str] = None,
                          target_lang: Optional[str] = None, lesson_id: Optional[int] = None):
    query = "SELECT * FROM flashcards WHERE 1=1"
    params = []
    if class_level:
        query += " AND class_level=?"; params.append(class_level)
    if category:
        query += " AND category=?"; params.append(category)
    if target_lang:
        query += " AND back_lang=?"; params.append(target_lang)
    if lesson_id:
        query += " AND lesson_id=?"; params.append(lesson_id)
    query += " ORDER BY difficulty ASC"
    rows = await fetchall(query, tuple(params))
    return ok(rows)


@router.get("/questions")
async def get_questions(class_level: Optional[str] = None, subject: Optional[str] = None,
                         difficulty: Optional[int] = None, lesson_id: Optional[int] = None):
    query = "SELECT * FROM questions WHERE 1=1"
    params = []
    if class_level:
        query += " AND class_level=?"; params.append(class_level)
    if subject:
        query += " AND subject=?"; params.append(subject)
    if difficulty:
        query += " AND difficulty=?"; params.append(difficulty)
    if lesson_id:
        query += " AND lesson_id=?"; params.append(lesson_id)
    query += " ORDER BY difficulty ASC"
    rows = await fetchall(query, tuple(params))
    for q in rows:
        q["answers"] = await fetchall("SELECT * FROM answers WHERE question_id=? ORDER BY order_index", (q["id"],))
    return ok(rows)


@router.get("/dictionary/lookup")
async def lookup_word(word: str, source_lang: str = "hi", target_lang: str = "en"):
    row = await fetchone(
        "SELECT * FROM dictionary WHERE word=? AND source_lang=? AND target_lang=?",
        (word, source_lang, target_lang)
    )
    if not row:
        return error("Word not found in offline dictionary.", "NOT_FOUND")
    return ok(row)


@router.get("/subjects")
async def get_subjects(class_id: Optional[int] = None):
    query = "SELECT * FROM subjects WHERE 1=1"
    params = []
    if class_id:
        query += " AND class_id=?"; params.append(class_id)
    rows = await fetchall(query, tuple(params))
    return ok(rows)


@router.post("/lessons")
async def create_lesson(payload: dict):
    """Admin/Teacher creates a new lesson."""
    required = ["title", "class_level"]
    for field in required:
        if not payload.get(field):
            return error(f"'{field}' is required.", "MISSING_FIELD")
    lesson_id = await execute(
        """INSERT INTO lessons (title, title_hi, class_level, content_hi, content_en,
           lesson_type, difficulty, estimated_minutes, xp_reward, icon, subject_id)
           VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
        (payload.get("title"), payload.get("title_hi"), payload["class_level"],
         payload.get("content_hi"), payload.get("content_en"),
         payload.get("lesson_type", "text"), payload.get("difficulty", 1),
         payload.get("estimated_minutes", 10), payload.get("xp_reward", 20),
         payload.get("icon", "📚"), payload.get("subject_id"))
    )
    return ok({"lesson_id": lesson_id}, "Lesson created.")


@router.post("/questions")
async def create_question(payload: dict):
    q_id = await execute(
        """INSERT INTO questions (lesson_id, text_hi, text_en, question_type, difficulty,
           explanation_hi, explanation_en, image_emoji, subject, class_level)
           VALUES (?,?,?,?,?,?,?,?,?,?)""",
        (payload.get("lesson_id"), payload.get("text_hi", ""), payload.get("text_en"),
         payload.get("question_type", "mcq"), payload.get("difficulty", 1),
         payload.get("explanation_hi"), payload.get("explanation_en"),
         payload.get("image_emoji"), payload.get("subject"), payload.get("class_level"))
    )
    for idx, ans in enumerate(payload.get("answers", [])):
        await execute(
            "INSERT INTO answers (question_id, text_hi, text_en, is_correct, order_index) VALUES (?,?,?,?,?)",
            (q_id, ans.get("text_hi", ""), ans.get("text_en"), 1 if ans.get("is_correct") else 0, idx)
        )
    return ok({"question_id": q_id}, "Question created.")
