/**
 * Offline NLP Engine for JANBHASHA
 * Provides word-level, phrase-level, and sentence-level translation
 * across Hindi, Odia, Santali, Ho, Mundari, and English
 * 100% offline using bundled ground-truth JSON dictionaries
 */
import dictionary from '../data/dictionaries/multilingual_dictionary.json';

type LangCode = 'hi' | 'en' | 'or' | 'sat' | 'ho' | 'mun';

// Build fast lookup maps on module load
const lookup: Record<string, Record<LangCode, string>> = {};
const reverseIndex: Record<LangCode, Map<string, string[]>> = {
  hi: new Map(), en: new Map(), or: new Map(),
  sat: new Map(), ho: new Map(), mun: new Map(),
};

const LANGS: LangCode[] = ['hi', 'en', 'or', 'sat', 'ho', 'mun'];

// Build indices
(dictionary as any[]).forEach((entry: any) => {
  const key = String(entry.hi || entry.en || '').toLowerCase().trim();
  if (!key) return;
  lookup[key] = {
    hi: entry.hi || '', en: entry.en || '', or: entry.or || '',
    sat: entry.sat || '', ho: entry.ho || '', mun: entry.mun || '',
  };
  // Build reverse index per language
  LANGS.forEach(lang => {
    const val = String(entry[lang] || '').toLowerCase().trim();
    if (!val) return;
    if (!reverseIndex[lang].has(val)) reverseIndex[lang].set(val, []);
    reverseIndex[lang].get(val)!.push(key); // maps to hindi key
  });
});

/**
 * Translate a single word offline
 */
export function translateWord(word: string, fromLang: LangCode, toLang: LangCode): string {
  if (fromLang === toLang) return word;
  const clean = word.toLowerCase().trim();

  // Direct lookup (Hindi key)
  if (lookup[clean]?.[toLang]) return lookup[clean][toLang];

  // Reverse lookup via source language index
  const hiKeys = reverseIndex[fromLang].get(clean) || [];
  for (const hiKey of hiKeys) {
    if (lookup[hiKey]?.[toLang]) return lookup[hiKey][toLang];
  }

  return word; // Return original if no match
}

/**
 * Translate a full sentence or phrase offline using word-by-word cascade
 * + phrase detection for multi-word expressions
 */
export function translateOfflineFull(text: string, fromLang: LangCode, toLang: LangCode): string {
  if (fromLang === toLang || !text.trim()) return text;

  const words = text.toLowerCase().trim().split(/\s+/);
  const result: string[] = [];
  let i = 0;

  while (i < words.length) {
    // Try bigram (2-word phrase) first
    if (i + 1 < words.length) {
      const bigram = `${words[i]} ${words[i + 1]}`;
      const bigramTranslation = translateWord(bigram, fromLang, toLang);
      if (bigramTranslation !== bigram) {
        result.push(bigramTranslation);
        i += 2;
        continue;
      }
    }

    // Single word translation
    const single = translateWord(words[i], fromLang, toLang);
    result.push(single);
    i++;
  }

  return result.join(' ');
}

/**
 * Batch translate a text into multiple target languages simultaneously
 */
export function batchTranslateOffline(
  text: string,
  fromLang: LangCode,
  targetLangs: LangCode[]
): Record<string, string> {
  const result: Record<string, string> = { [fromLang]: text };
  targetLangs.forEach(lang => {
    result[lang] = translateOfflineFull(text, fromLang, lang);
  });
  return result;
}

/**
 * Translate FLN curriculum script sentence by sentence
 */
export function translateFlnScript(
  script: string,
  fromLang: LangCode,
  toLang: LangCode
): string {
  if (fromLang === toLang) return script;
  const sentences = script.split(/[।.!?]+/).filter(s => s.trim());
  return sentences
    .map(s => translateOfflineFull(s.trim(), fromLang, toLang))
    .join('. ');
}

/**
 * Get all dictionary entries for a category
 */
export function getDictionaryByCategory(category: string) {
  return (dictionary as any[]).filter(e => e.category === category);
}

/**
 * Get all available categories
 */
export function getAllCategories(): string[] {
  const cats = new Set<string>();
  (dictionary as any[]).forEach(e => cats.add(e.category));
  return Array.from(cats).sort();
}

/**
 * Generate flashcard data from dictionary by category
 */
export function generateFlashcardsFromDictionary(
  category: string,
  fromLang: LangCode = 'hi',
  toLang: LangCode = 'en'
) {
  const entries = getDictionaryByCategory(category);
  return entries.map((e: any, idx: number) => ({
    id: e.id || idx + 1,
    front_text: e[fromLang] || e.hi,
    back_text: e[toLang] || e.en,
    front_lang: fromLang,
    back_lang: toLang,
    image_emoji: e.emoji || '📖',
    category: e.category,
  }));
}

/**
 * Auto-generate NIPUN Bharat quiz questions from dictionary
 */
export function generateNipunQuestions(
  category: string,
  fromLang: LangCode = 'hi',
  toLang: LangCode = 'en',
  count = 5
) {
  const entries = getDictionaryByCategory(category);
  const shuffled = [...entries].sort(() => Math.random() - 0.5).slice(0, count);

  return shuffled.map((correct: any) => {
    // Pick 3 wrong answers from same category
    const wrongPool = entries.filter((e: any) => e.id !== correct.id);
    const wrongs = wrongPool.sort(() => Math.random() - 0.5).slice(0, 3);

    const answers = [
      { text: correct[toLang] || correct.en, is_correct: 1 },
      ...wrongs.map((w: any) => ({ text: w[toLang] || w.en, is_correct: 0 })),
    ].sort(() => Math.random() - 0.5);

    return {
      id: correct.id,
      text_hi: `"${correct[fromLang]}" का अर्थ क्या है?`,
      text_en: `What does "${correct[fromLang]}" mean?`,
      subject: category.toLowerCase(),
      difficulty: 1,
      image_emoji: correct.emoji || '❓',
      answers,
    };
  });
}
