import { apiRequest } from './apiClient';
import { getCachedTranslation, cacheTranslation } from './databaseService';

export async function translate(text: string, sourceLang: string, targetLang: string): Promise<string> {
  if (sourceLang === targetLang || !text.trim()) return text;
  const cached = await getCachedTranslation(text, sourceLang, targetLang);
  if (cached) return cached;
  const result = await apiRequest<{ translated_text: string }>('/api/translate', {
    method: 'POST',
    body: { text, source_lang: sourceLang, target_lang: targetLang },
  });
  if (result.success && result.data?.translated_text) {
    await cacheTranslation(text, sourceLang, result.data.translated_text, targetLang);
    return result.data.translated_text;
  }
  return text;
}

export async function translateBatch(
  text: string, sourceLang: string, targetLangs: string[]
): Promise<Record<string, string>> {
  const result = await apiRequest<{ translations: Record<string, string> }>('/api/translate/batch', {
    method: 'POST',
    body: { text, source_lang: sourceLang, target_langs: targetLangs },
  });
  return result.data?.translations ?? { [sourceLang]: text };
}
