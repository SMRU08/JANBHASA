/**
 * SQLite local database service for JANBHASHA
 * Supports Native (expo-sqlite) and Web (AsyncStorage fallback) for offline-first operation
 */
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

let db: any = null;

export async function initDatabase(): Promise<void> {
  if (Platform.OS === 'web') {
    // Web environment uses AsyncStorage fallback safely
    return;
  }

  try {
    const SQLite = require('expo-sqlite');
    db = await SQLite.openDatabaseAsync('janbhasha_local.db');
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      PRAGMA foreign_keys = ON;

      CREATE TABLE IF NOT EXISTS local_settings (
        key TEXT PRIMARY KEY,
        value TEXT
      );

      CREATE TABLE IF NOT EXISTS cached_translations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        source_text TEXT NOT NULL,
        source_lang TEXT NOT NULL,
        target_text TEXT NOT NULL,
        target_lang TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        UNIQUE(source_text, source_lang, target_lang)
      );

      CREATE TABLE IF NOT EXISTS cached_audio (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        text_hash TEXT UNIQUE,
        text TEXT,
        language TEXT,
        audio_path TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS local_progress (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        lesson_id INTEGER,
        status TEXT DEFAULT 'in_progress',
        progress_percent INTEGER DEFAULT 0,
        score INTEGER,
        updated_at TEXT DEFAULT (datetime('now')),
        synced INTEGER DEFAULT 0,
        UNIQUE(student_id, lesson_id)
      );

      CREATE TABLE IF NOT EXISTS local_xp_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        student_id INTEGER,
        amount INTEGER,
        reason TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        synced INTEGER DEFAULT 0
      );
    `);
  } catch (e) {
    console.warn('Native SQLite init fallback to storage:', e);
  }
}

export async function cacheTranslation(
  sourceText: string, sourceLang: string, targetText: string, targetLang: string
): Promise<void> {
  if (db && Platform.OS !== 'web') {
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO cached_translations (source_text, source_lang, target_text, target_lang)
         VALUES (?, ?, ?, ?)`,
        [sourceText, sourceLang, targetText, targetLang]
      );
      return;
    } catch (e) {}
  }
  const key = `@trans_${sourceLang}_${targetLang}_${sourceText}`;
  await AsyncStorage.setItem(key, targetText);
}

export async function getCachedTranslation(
  sourceText: string, sourceLang: string, targetLang: string
): Promise<string | null> {
  if (db && Platform.OS !== 'web') {
    try {
      const row = await db.getFirstAsync<{ target_text: string }>(
        'SELECT target_text FROM cached_translations WHERE source_text=? AND source_lang=? AND target_lang=?',
        [sourceText, sourceLang, targetLang]
      );
      return row?.target_text ?? null;
    } catch (e) {}
  }
  const key = `@trans_${sourceLang}_${targetLang}_${sourceText}`;
  return AsyncStorage.getItem(key);
}

export async function saveLocalProgress(
  studentId: number, lessonId: number, status: string, progress: number, score?: number
): Promise<void> {
  if (db && Platform.OS !== 'web') {
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO local_progress (student_id, lesson_id, status, progress_percent, score, updated_at, synced)
         VALUES (?, ?, ?, ?, ?, datetime('now'), 0)`,
        [studentId, lessonId, status, progress, score ?? null]
      );
      return;
    } catch (e) {}
  }
  const key = `@progress_${studentId}_${lessonId}`;
  await AsyncStorage.setItem(key, JSON.stringify({ status, progress_percent: progress, score }));
}

export async function getLocalSetting(key: string): Promise<string | null> {
  if (db && Platform.OS !== 'web') {
    try {
      const row = await db.getFirstAsync<{ value: string }>(
        'SELECT value FROM local_settings WHERE key=?', [key]
      );
      return row?.value ?? null;
    } catch (e) {}
  }
  return AsyncStorage.getItem(`@setting_${key}`);
}

export async function setLocalSetting(key: string, value: string): Promise<void> {
  if (db && Platform.OS !== 'web') {
    try {
      await db.runAsync(
        'INSERT OR REPLACE INTO local_settings (key, value) VALUES (?, ?)', [key, value]
      );
      return;
    } catch (e) {}
  }
  await AsyncStorage.setItem(`@setting_${key}`, value);
}
