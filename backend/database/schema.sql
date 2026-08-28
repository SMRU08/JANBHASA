-- JANBHASHA Database Schema
-- SQLite with WAL mode for performance
-- All timestamps stored as ISO 8601 strings

PRAGMA journal_mode=WAL;
PRAGMA foreign_keys=ON;
PRAGMA synchronous=NORMAL;

-- ============================================================
-- SETTINGS
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    category TEXT DEFAULT 'general',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================================
-- USERS (base table for all roles)
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin','teacher','student','parent')),
    status TEXT DEFAULT 'active' CHECK(status IN ('active','pending','locked','inactive')),
    selected_language TEXT DEFAULT 'hi',
    recovery_pin_hash TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    last_login TEXT
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email) WHERE email IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone ON users(phone) WHERE phone IS NOT NULL;

-- ============================================================
-- ADMINS
-- ============================================================
CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permissions TEXT DEFAULT 'all',
    created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================================
-- SCHOOLS
-- ============================================================
CREATE TABLE IF NOT EXISTS schools (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    district TEXT,
    state TEXT DEFAULT 'Jharkhand',
    address TEXT,
    contact_phone TEXT,
    admin_id INTEGER REFERENCES users(id),
    created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================================
-- CLASSES
-- ============================================================
CREATE TABLE IF NOT EXISTS classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,  -- e.g. "5", "6"
    section TEXT DEFAULT 'A',
    school_id INTEGER REFERENCES schools(id),
    academic_year TEXT DEFAULT '2026-27',
    created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================================
-- SUBJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS subjects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    name_hi TEXT,
    icon TEXT,
    color TEXT,
    class_id INTEGER REFERENCES classes(id),
    created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================================
-- TEACHERS
-- ============================================================
CREATE TABLE IF NOT EXISTS teachers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    school_id INTEGER REFERENCES schools(id),
    qualification TEXT,
    experience_years INTEGER DEFAULT 0,
    verification_status TEXT DEFAULT 'pending' CHECK(verification_status IN ('pending','approved','rejected')),
    verified_by INTEGER REFERENCES users(id),
    verified_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Teacher-Class mapping
CREATE TABLE IF NOT EXISTS teacher_classes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id INTEGER REFERENCES teachers(id),
    class_id INTEGER REFERENCES classes(id),
    subject_id INTEGER REFERENCES subjects(id),
    UNIQUE(teacher_id, class_id, subject_id)
);

-- ============================================================
-- STUDENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    student_code TEXT UNIQUE,
    class_id INTEGER REFERENCES classes(id),
    school_id INTEGER REFERENCES schools(id),
    parent_name TEXT,
    parent_phone TEXT,
    date_of_birth TEXT,
    gender TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================================
-- LESSONS & CONTENT
-- ============================================================
CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    title_hi TEXT,
    subject_id INTEGER REFERENCES subjects(id),
    class_level TEXT NOT NULL,  -- "1","2",...,"10"
    content_hi TEXT,
    content_en TEXT,
    content_or TEXT,
    content_sat TEXT,
    lesson_type TEXT DEFAULT 'text' CHECK(lesson_type IN ('text','story','video','interactive')),
    difficulty INTEGER DEFAULT 1 CHECK(difficulty BETWEEN 1 AND 5),
    estimated_minutes INTEGER DEFAULT 10,
    xp_reward INTEGER DEFAULT 20,
    icon TEXT DEFAULT '📚',
    order_index INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS chapters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_id INTEGER REFERENCES lessons(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content_hi TEXT,
    content_en TEXT,
    content_sat TEXT,
    content_or TEXT,
    order_index INTEGER DEFAULT 0,
    audio_key TEXT,
    image_url TEXT
);

-- ============================================================
-- FLASHCARDS
-- ============================================================
CREATE TABLE IF NOT EXISTS flashcards (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    front_text TEXT NOT NULL,
    front_lang TEXT DEFAULT 'hi',
    back_text TEXT NOT NULL,
    back_lang TEXT NOT NULL,
    image_emoji TEXT,
    image_url TEXT,
    audio_key TEXT,
    category TEXT,
    class_level TEXT DEFAULT '1',
    difficulty INTEGER DEFAULT 1,
    lesson_id INTEGER REFERENCES lessons(id),
    created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================================
-- QUESTIONS & ANSWERS
-- ============================================================
CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lesson_id INTEGER REFERENCES lessons(id),
    text_hi TEXT NOT NULL,
    text_en TEXT,
    text_sat TEXT,
    question_type TEXT DEFAULT 'mcq' CHECK(question_type IN ('mcq','truefalse','short','fill')),
    difficulty INTEGER DEFAULT 1,
    explanation_hi TEXT,
    explanation_en TEXT,
    image_emoji TEXT,
    subject TEXT,
    class_level TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id INTEGER REFERENCES questions(id) ON DELETE CASCADE,
    text_hi TEXT NOT NULL,
    text_en TEXT,
    is_correct INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0
);

-- ============================================================
-- WORKSHEETS
-- ============================================================
CREATE TABLE IF NOT EXISTS worksheets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    class_id INTEGER REFERENCES classes(id),
    subject_id INTEGER REFERENCES subjects(id),
    teacher_id INTEGER REFERENCES teachers(id),
    omr_template TEXT,
    total_questions INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================================
-- ASSIGNMENTS & SUBMISSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS assignments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    teacher_id INTEGER REFERENCES teachers(id),
    class_id INTEGER REFERENCES classes(id),
    subject_id INTEGER REFERENCES subjects(id),
    due_date TEXT,
    max_score INTEGER DEFAULT 100,
    xp_reward INTEGER DEFAULT 50,
    is_active INTEGER DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS assignment_questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assignment_id INTEGER REFERENCES assignments(id),
    question_id INTEGER REFERENCES questions(id),
    order_index INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    assignment_id INTEGER REFERENCES assignments(id),
    student_id INTEGER REFERENCES students(id),
    score INTEGER,
    max_score INTEGER,
    answers_json TEXT,
    submitted_at TEXT DEFAULT (datetime('now')),
    graded_at TEXT,
    xp_awarded INTEGER DEFAULT 0,
    UNIQUE(assignment_id, student_id)
);

-- ============================================================
-- STUDENT PROGRESS & GAMIFICATION
-- ============================================================
CREATE TABLE IF NOT EXISTS student_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER REFERENCES students(id),
    lesson_id INTEGER REFERENCES lessons(id),
    status TEXT DEFAULT 'not_started' CHECK(status IN ('not_started','in_progress','completed')),
    progress_percent INTEGER DEFAULT 0,
    score INTEGER,
    completed_at TEXT,
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(student_id, lesson_id)
);

CREATE TABLE IF NOT EXISTS badges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    badge_key TEXT UNIQUE NOT NULL,
    icon TEXT NOT NULL,
    name_hi TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_hi TEXT,
    description_en TEXT,
    xp_reward INTEGER DEFAULT 50,
    condition_type TEXT,
    condition_value INTEGER,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS student_badges (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER REFERENCES students(id),
    badge_id INTEGER REFERENCES badges(id),
    earned_at TEXT DEFAULT (datetime('now')),
    UNIQUE(student_id, badge_id)
);

CREATE TABLE IF NOT EXISTS xp_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER REFERENCES students(id),
    amount INTEGER NOT NULL,
    reason TEXT NOT NULL,
    reference_id INTEGER,
    reference_type TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS student_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER UNIQUE REFERENCES students(id),
    total_xp INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    last_activity_date TEXT,
    lessons_completed INTEGER DEFAULT 0,
    quizzes_passed INTEGER DEFAULT 0,
    flashcards_completed INTEGER DEFAULT 0,
    voice_uses INTEGER DEFAULT 0,
    stories_read INTEGER DEFAULT 0,
    updated_at TEXT DEFAULT (datetime('now'))
);

-- ============================================================
-- TRANSLATION & LANGUAGE
-- ============================================================
CREATE TABLE IF NOT EXISTS translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    source_text TEXT NOT NULL,
    source_lang TEXT NOT NULL,
    target_text TEXT NOT NULL,
    target_lang TEXT NOT NULL,
    model_used TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_translations ON translations(source_text, source_lang, target_lang);

CREATE TABLE IF NOT EXISTS dictionary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    word TEXT NOT NULL,
    source_lang TEXT NOT NULL DEFAULT 'hi',
    target_lang TEXT NOT NULL,
    translation TEXT NOT NULL,
    pronunciation TEXT,
    example_sentence TEXT,
    category TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(word, source_lang, target_lang)
);

CREATE TABLE IF NOT EXISTS language_packs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pack_id TEXT UNIQUE NOT NULL,
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    native_name TEXT,
    version TEXT DEFAULT '1.0.0',
    is_installed INTEGER DEFAULT 0,
    has_translation INTEGER DEFAULT 0,
    has_tts INTEGER DEFAULT 0,
    has_dictionary INTEGER DEFAULT 0,
    has_lessons INTEGER DEFAULT 0,
    size_mb REAL DEFAULT 0,
    installed_at TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================================
-- CLASSROOM SESSIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS classroom_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE NOT NULL,
    teacher_id INTEGER REFERENCES teachers(id),
    class_id INTEGER REFERENCES classes(id),
    subject TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active','ended')),
    host_ip TEXT,
    host_port INTEGER DEFAULT 8000,
    started_at TEXT DEFAULT (datetime('now')),
    ended_at TEXT
);

CREATE TABLE IF NOT EXISTS classroom_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT REFERENCES classroom_sessions(session_id),
    student_id INTEGER REFERENCES students(id),
    joined_at TEXT DEFAULT (datetime('now')),
    left_at TEXT,
    is_active INTEGER DEFAULT 1
);

-- ============================================================
-- ATTENDANCE
-- ============================================================
CREATE TABLE IF NOT EXISTS attendance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER REFERENCES students(id),
    class_id INTEGER REFERENCES classes(id),
    date TEXT NOT NULL,
    status TEXT DEFAULT 'present' CHECK(status IN ('present','absent','late')),
    session_id TEXT,
    marked_at TEXT DEFAULT (datetime('now')),
    UNIQUE(student_id, date)
);

-- ============================================================
-- OCR & OMR HISTORY
-- ============================================================
CREATE TABLE IF NOT EXISTS ocr_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    image_path TEXT,
    extracted_text TEXT,
    translated_text TEXT,
    target_lang TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS omr_results (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    teacher_id INTEGER REFERENCES teachers(id),
    student_id INTEGER REFERENCES students(id),
    worksheet_id INTEGER REFERENCES worksheets(id),
    image_path TEXT,
    answers_detected TEXT,
    answer_key TEXT,
    score INTEGER,
    max_score INTEGER,
    wrong_questions TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================================
-- AUDIO & TRANSLATION CACHE
-- ============================================================
CREATE TABLE IF NOT EXISTS audio_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    text_hash TEXT UNIQUE NOT NULL,
    text TEXT NOT NULL,
    language TEXT NOT NULL,
    audio_path TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS translation_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    source_text TEXT,
    source_lang TEXT,
    target_text TEXT,
    target_lang TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================================
-- RECOVERY RECORDS
-- ============================================================
CREATE TABLE IF NOT EXISTS recovery_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER REFERENCES users(id),
    action TEXT NOT NULL,
    performed_by INTEGER REFERENCES users(id),
    notes TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- ============================================================
-- MULTILINGUAL DICTIONARY
-- ============================================================
CREATE TABLE IF NOT EXISTS dictionary (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    word TEXT NOT NULL,
    translation TEXT NOT NULL,
    source_lang TEXT NOT NULL,
    target_lang TEXT NOT NULL,
    category TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    UNIQUE(word, source_lang, target_lang)
);
