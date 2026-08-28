"""
Database connection manager for JANBHASHA
Uses aiosqlite for async SQLite access with WAL mode.
Seeds comprehensive multilingual datasets (Hindi, English, Odia, Santali, Ho, Mundari).
"""

import os
import json
import sqlite3
import aiosqlite
import logging
from pathlib import Path
from typing import Any, Optional

logger = logging.getLogger("janbhasha.db")

DB_PATH = os.getenv("DB_PATH", str(Path(__file__).parent.parent.parent / "database" / "janbhasha.db"))
SCHEMA_PATH = Path(__file__).parent / "schema.sql"
DATA_DIR = Path(__file__).parent.parent.parent / "data"


async def get_db() -> aiosqlite.Connection:
    """Get an async database connection."""
    db = await aiosqlite.connect(DB_PATH)
    db.row_factory = aiosqlite.Row
    await db.execute("PRAGMA journal_mode=WAL")
    await db.execute("PRAGMA foreign_keys=ON")
    await db.execute("PRAGMA synchronous=NORMAL")
    return db


async def init_db():
    """Initialize the database with the schema."""
    Path(DB_PATH).parent.mkdir(parents=True, exist_ok=True)
    logger.info(f"Initializing database at: {DB_PATH}")

    schema_sql = SCHEMA_PATH.read_text(encoding="utf-8")

    async with aiosqlite.connect(DB_PATH) as db:
        await db.executescript(schema_sql)
        await db.commit()

    logger.info("Database schema applied successfully")

    # Seed default data if needed
    await seed_defaults()


async def seed_defaults():
    """Seed essential default data and datasets on first run."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row

        # Check if admin exists
        cur = await db.execute("SELECT COUNT(*) as cnt FROM users WHERE role='admin'")
        row = await cur.fetchone()
        if row["cnt"] == 0:
            import bcrypt
            admin_pw_hash = bcrypt.hashpw(b"Admin@1234", bcrypt.gensalt()).decode()
            teacher_pw_hash = bcrypt.hashpw(b"Teacher@1234", bcrypt.gensalt()).decode()
            pin_hash = bcrypt.hashpw(b"000000", bcrypt.gensalt()).decode()

            # Super Admin
            await db.execute(
                """INSERT INTO users (name, email, password_hash, role, status, selected_language, recovery_pin_hash)
                   VALUES (?, ?, ?, 'admin', 'active', 'hi', ?)""",
                ("Super Admin", "admin@gmail.com", admin_pw_hash, pin_hash)
            )
            admin_user_id = (await (await db.execute("SELECT last_insert_rowid()")).fetchone())[0]
            await db.execute("INSERT INTO admins (user_id) VALUES (?)", (admin_user_id,))

            # Default school
            await db.execute(
                """INSERT INTO schools (name, district, state) VALUES (?, ?, ?)""",
                ("JANBHASHA Model School", "Demo District", "Jharkhand")
            )
            school_id = 1

            # Default Verified Teacher
            await db.execute(
                """INSERT INTO users (name, phone, email, password_hash, role, status, selected_language, recovery_pin_hash)
                   VALUES (?, ?, ?, ?, 'teacher', 'active', 'hi', ?)""",
                ("Pooja Sharma", "9876543210", "teacher@gmail.com", teacher_pw_hash, pin_hash)
            )
            teacher_user_id = (await (await db.execute("SELECT last_insert_rowid()")).fetchone())[0]
            await db.execute(
                """INSERT INTO teachers (user_id, school_id, qualification) VALUES (?, ?, ?)""",
                (teacher_user_id, school_id, "B.Ed, Primary Educator")
            )

            # Default Student (STU001)
            student_pw_hash = bcrypt.hashpw(b"STU001", bcrypt.gensalt()).decode()
            await db.execute(
                """INSERT INTO users (name, password_hash, role, status, selected_language, recovery_pin_hash)
                   VALUES (?, ?, 'student', 'active', 'hi', ?)""",
                ("Ramesh Kumar", student_pw_hash, pin_hash)
            )
            student_user_id = (await (await db.execute("SELECT last_insert_rowid()")).fetchone())[0]
            await db.execute(
                """INSERT INTO students (user_id, student_code, class_id, school_id) VALUES (?, ?, ?, ?)""",
                (student_user_id, "STU001", 1, school_id)
            )
            await db.execute("INSERT INTO student_stats (student_id) VALUES (1)")

            # Default settings
            settings = [
                ("app_version", "1.0.0", "system"),
                ("default_language", "hi", "app"),
                ("performance_mode", "standard", "app"),
                ("dark_mode", "system", "app"),
                ("backend_url", "http://localhost:8000", "network"),
                ("auto_backup", "false", "system"),
            ]
            await db.executemany(
                "INSERT OR IGNORE INTO settings (key, value, category) VALUES (?, ?, ?)",
                settings
            )

            # Default language packs
            packs = [
                ("hindi_v1", "hi", "Hindi", "हिंदी", "1.0.0", 1, 1, 1, 1, 1, 0.0),
                ("english_v1", "en", "English", "English", "1.0.0", 1, 1, 1, 1, 0, 0.0),
                ("odia_v1", "or", "Odia", "ଓଡ଼ିଆ", "1.0.0", 0, 1, 1, 1, 0, 0.0),
                ("santali_v1", "sat", "Santali", "ᱥᱟᱱᱛᱟᱲᱤ", "1.0.0", 0, 1, 1, 1, 0, 0.0),
                ("ho_v1", "ho", "Ho", "हो", "1.0.0", 0, 0, 1, 1, 0, 0.0),
                ("mundari_v1", "mun", "Mundari", "मुंडारी", "1.0.0", 0, 0, 1, 1, 0, 0.0),
            ]
            await db.executemany(
                """INSERT OR IGNORE INTO language_packs
                   (pack_id, code, name, native_name, version, is_installed,
                    has_translation, has_tts, has_dictionary, has_lessons, size_mb)
                   VALUES (?,?,?,?,?,?,?,?,?,?,?)""",
                packs
            )

            # Default badges
            badges = [
                ("vocab_master", "🏆", "शब्द विशेषज्ञ", "Vocabulary Master", "50 फ्लैशकार्ड पूरे करें", "Complete 50 flashcards", 100, "flashcards_completed", 50),
                ("speaking_star", "🎙", "बोलने का सितारा", "Speaking Star", "10 बार वॉयस ट्रांसलेशन", "Use voice translation 10 times", 80, "voice_uses", 10),
                ("story_explorer", "📖", "कहानी अन्वेषक", "Story Explorer", "5 कहानियाँ पढ़ें", "Read 5 stories", 60, "stories_read", 5),
                ("number_ninja", "🔢", "संख्या निंजा", "Number Ninja", "10 गणित क्विज़ पास करें", "Pass 10 math quizzes", 100, "quizzes_passed", 10),
                ("quick_learner", "🧠", "तेज़ सीखने वाला", "Quick Learner", "3 पाठ पूरे करें", "Complete 3 lessons", 50, "lessons_completed", 3),
                ("streak_7", "🔥", "7 दिन का सिलसिला", "7-Day Streak", "7 दिन लगातार सीखें", "Learn for 7 days in a row", 150, "streak", 7),
                ("perfect_score", "🌟", "पूर्ण अंक", "Perfect Score", "किसी क्विज़ में 100% पाएं", "Score 100% in any quiz", 200, "perfect_quiz", 1),
                ("reading_champion", "📚", "पठन चैंपियन", "Reading Champion", "20 पाठ पूरे करें", "Complete 20 lessons", 120, "lessons_completed", 20),
                ("streak_30", "💫", "30 दिन योद्धा", "30-Day Warrior", "30 दिन लगातार सीखें", "Learn for 30 days in a row", 500, "streak", 30),
                ("first_classroom", "🏫", "कक्षा तैयार", "Classroom Ready", "पहली कक्षा में शामिल हों", "Join your first classroom", 30, "classroom_joined", 1),
                ("ai_explorer", "🤖", "AI खोजकर्ता", "AI Explorer", "AI से 5 प्रश्न पूछें", "Ask AI 5 questions", 40, "ai_questions", 5),
                ("attendance_star", "⭐", "उपस्थिति सितारा", "Attendance Star", "10 दिन उपस्थित रहें", "Attend 10 days", 75, "attendance", 10),
            ]
            await db.executemany(
                """INSERT OR IGNORE INTO badges
                   (badge_key, icon, name_hi, name_en, description_hi, description_en,
                    xp_reward, condition_type, condition_value)
                   VALUES (?,?,?,?,?,?,?,?,?)""",
                badges
            )

            # Import Multilingual Dictionary Dataset
            dict_path = DATA_DIR / "dictionaries" / "multilingual_dictionary.json"
            if dict_path.exists():
                try:
                    dict_items = json.loads(dict_path.read_text(encoding="utf-8"))
                    languages = ["en", "hi", "or", "sat", "ho", "mun"]
                    rows_to_insert = []
                    for item in dict_items:
                        cat = item.get("category", "General")
                        for src in languages:
                            for tgt in languages:
                                if src != tgt and item.get(src) and item.get(tgt):
                                    rows_to_insert.append((
                                        item[src].strip(),
                                        item[tgt].strip(),
                                        src,
                                        tgt,
                                        cat
                                    ))
                    await db.executemany(
                        """INSERT OR IGNORE INTO dictionary (word, translation, source_lang, target_lang, category)
                           VALUES (?, ?, ?, ?, ?)""",
                        rows_to_insert
                    )
                    logger.info(f"✅ Imported {len(rows_to_insert)} multilingual dictionary translations into DB.")
                except Exception as e:
                    logger.error(f"Error importing dictionary dataset: {e}")

            # Import Multilingual Flashcards Dataset
            flashcard_path = DATA_DIR / "flashcards" / "primary_vocab.json"
            if flashcard_path.exists():
                try:
                    fc_items = json.loads(flashcard_path.read_text(encoding="utf-8"))
                    fc_rows = [
                        (
                            f.get("front_text"), f.get("front_lang", "hi"),
                            f.get("back_text"), f.get("back_lang", "en"),
                            f.get("image_emoji", "📚"), f.get("category", "General"),
                            f.get("class_level", "1")
                        )
                        for f in fc_items
                    ]
                    await db.executemany(
                        """INSERT OR IGNORE INTO flashcards (front_text, front_lang, back_text, back_lang, image_emoji, category, class_level)
                           VALUES (?, ?, ?, ?, ?, ?, ?)""",
                        fc_rows
                    )
                    logger.info(f"✅ Imported {len(fc_rows)} multilingual flashcards into DB.")
                except Exception as e:
                    logger.error(f"Error importing flashcards: {e}")

            # Import Multilingual Lessons Dataset
            lessons_path = DATA_DIR / "lessons" / "class1_5_lessons.json"
            if lessons_path.exists():
                try:
                    lesson_items = json.loads(lessons_path.read_text(encoding="utf-8"))
                    lesson_rows = [
                        (
                            l.get("title"), l.get("title_hi"), l.get("class_level", "1"),
                            l.get("content_hi"), l.get("content_en"), l.get("content_or"), l.get("content_sat"),
                            l.get("difficulty", 1), l.get("xp_reward", 20), l.get("icon", "📚")
                        )
                        for l in lesson_items
                    ]
                    await db.executemany(
                        """INSERT OR IGNORE INTO lessons (title, title_hi, class_level, content_hi, content_en, content_or, content_sat, difficulty, xp_reward, icon)
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                        lesson_rows
                    )
                    logger.info(f"✅ Imported {len(lesson_rows)} multilingual curriculum lessons into DB.")
                except Exception as e:
                    logger.error(f"Error importing lessons: {e}")

            await db.commit()
            logger.info("✅ Database successfully initialized with all multilingual datasets.")
        else:
            logger.info("Database already seeded, skipping.")


async def fetchone(query: str, params: tuple = ()) -> Optional[dict]:
    """Execute a query and return one row as dict."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cur = await db.execute(query, params)
        row = await cur.fetchone()
        return dict(row) if row else None


async def fetchall(query: str, params: tuple = ()) -> list[dict]:
    """Execute a query and return all rows as list of dicts."""
    async with aiosqlite.connect(DB_PATH) as db:
        db.row_factory = aiosqlite.Row
        cur = await db.execute(query, params)
        rows = await cur.fetchall()
        return [dict(r) for r in rows]


async def execute(query: str, params: tuple = ()) -> int:
    """Execute an INSERT/UPDATE/DELETE and return lastrowid."""
    async with aiosqlite.connect(DB_PATH) as db:
        cur = await db.execute(query, params)
        await db.commit()
        return cur.lastrowid


async def executemany(query: str, params_list: list) -> None:
    """Execute a query for multiple parameter sets."""
    async with aiosqlite.connect(DB_PATH) as db:
        await db.executemany(query, params_list)
        await db.commit()
