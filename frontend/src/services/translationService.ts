import { apiRequest } from './apiClient';
import { getCachedTranslation, cacheTranslation } from './databaseService';
import dictionaryEntries from '../data/dictionaries/multilingual_dictionary.json';

// Build in-memory offline dictionary lookup map
const offlineDict: Record<string, string> = {};

dictionaryEntries.forEach((entry: any) => {
  const langs = ['en', 'hi', 'or', 'sat', 'ho', 'mun'] as const;
  langs.forEach(src => {
    langs.forEach(tgt => {
      if (src !== tgt && entry[src] && entry[tgt]) {
        const key = `${src}_${tgt}_${String(entry[src]).toLowerCase().trim()}`;
        offlineDict[key] = String(entry[tgt]);
      }
    });
  });
});

export function translateOffline(text: string, sourceLang: string, targetLang: string): string {
  if (sourceLang === targetLang || !text.trim()) return text;
  const clean = text.toLowerCase().trim();
  const directKey = `${sourceLang}_${targetLang}_${clean}`;
  if (offlineDict[directKey]) return offlineDict[directKey];

  // Try word-by-word translation
  const words = clean.split(/\s+/);
  if (words.length > 1) {
    const translatedWords = words.map(w => offlineDict[`${sourceLang}_${targetLang}_${w}`] || w);
    return translatedWords.join(' ');
  }

  return text;
}

export async function translate(text: string, sourceLang: string, targetLang: string): Promise<string> {
  if (sourceLang === targetLang || !text.trim()) return text;
  
  // 1. Check local cache
  const cached = await getCachedTranslation(text, sourceLang, targetLang);
  if (cached) return cached;

  // 2. Try online API
  try {
    const result = await apiRequest<{ translated_text: string }>('/api/translate', {
      method: 'POST',
      body: { text, source_lang: sourceLang, target_lang: targetLang },
      timeout: 3000,
    });
    if (result.success && result.data?.translated_text) {
      await cacheTranslation(text, sourceLang, result.data.translated_text, targetLang);
      return result.data.translated_text;
    }
  } catch (e) {
    // Fallback to offline dictionary
  }

  // 3. Fallback to offline dictionary
  const offlineResult = translateOffline(text, sourceLang, targetLang);
  return offlineResult;
}

export async function translateBatch(
  text: string, sourceLang: string, targetLangs: string[]
): Promise<Record<string, string>> {
  try {
    const result = await apiRequest<{ translations: Record<string, string> }>('/api/translate/batch', {
      method: 'POST',
      body: { text, source_lang: sourceLang, target_langs: targetLangs },
      timeout: 3000,
    });
    if (result.data?.translations) {
      return result.data.translations;
    }
  } catch (e) {}

  // Fallback offline batch translation
  const batchRes: Record<string, string> = { [sourceLang]: text };
  targetLangs.forEach(tgt => {
    batchRes[tgt] = translateOffline(text, sourceLang, tgt);
  });
  return batchRes;
}
