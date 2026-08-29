/**
 * Asset Generator Service
 * Auto-generates bilingual worksheets and flashcard sets
 * aligned to NIPUN Bharat learning outcomes
 */
import {
  getDictionaryByCategory,
  getAllCategories,
  translateOfflineFull,
  generateFlashcardsFromDictionary,
} from './offlineNlpEngine';

type LangCode = 'hi' | 'en' | 'or' | 'sat' | 'ho' | 'mun';

const LANG_NAMES: Record<LangCode, string> = {
  hi: 'Hindi', en: 'English', or: 'Odia',
  sat: 'Santali', ho: 'Ho', mun: 'Mundari',
};

const NIPUN_OUTCOMES: Record<string, string> = {
  Numbers: 'Count and recognise numbers 1–100 (FLN Numeracy Grade 1)',
  Alphabet: 'Identify letters and letter sounds (FLN Literacy Grade 1)',
  Actions: 'Understand action words in context (FLN Oral Language Grade 1–2)',
  Nature: 'Describe natural environment using vocabulary (EVS Grade 2)',
  Animals: 'Classify living things using local language terms (EVS Grade 2)',
  Food: 'Name common foods in mother tongue and Hindi (FLN Grade 1)',
  Colors: 'Identify and name colors across languages (FLN Grade 1)',
  Family: 'Describe family relationships in mother tongue (Hindi Grade 2)',
  Math: 'Use mathematical vocabulary in mother tongue (Numeracy Grade 2)',
  Body: 'Name body parts and describe sensations (FLN Grade 1)',
  Classroom: 'Follow classroom instructions in Hindi and mother tongue (FLN Grade 1)',
};

/**
 * Generate a bilingual worksheet for a given category and target language
 * Returns HTML-ready string
 */
export function generateWorksheetHtml(
  category: string,
  fromLang: LangCode,
  toLang: LangCode,
  studentName = 'Student'
): string {
  const entries = getDictionaryByCategory(category);
  const nipunOutcome = NIPUN_OUTCOMES[category] || `${category} vocabulary development`;

  const rows = entries
    .slice(0, 15)
    .map((e: any, i: number) => {
      const fromText = e[fromLang] || e.hi || '';
      const toText = e[toLang] || e.en || '';
      return `
      <tr>
        <td style="text-align:center;padding:8px;border:1px solid #ddd;font-size:22px">${e.emoji || ''}</td>
        <td style="padding:8px;border:1px solid #ddd;font-size:16px;font-weight:bold">${fromText}</td>
        <td style="padding:8px;border:1px solid #ddd;font-size:16px;color:#059669">${toText}</td>
        <td style="padding:8px;border:1px solid #ddd;font-size:14px;color:#aaa">______________</td>
      </tr>`;
    })
    .join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Noto Sans', Arial, sans-serif; padding: 32px; background: #fff; }
    h1 { color: #059669; font-size: 24px; margin: 0; }
    h2 { color: #D97706; font-size: 18px; margin: 4px 0 20px; }
    .header { border-bottom: 3px solid #059669; padding-bottom: 12px; margin-bottom: 20px; }
    .outcome { background: #D1FAE5; border-left: 4px solid #059669; padding: 8px 12px; margin-bottom: 20px; font-size: 13px; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th { background: #059669; color: white; padding: 10px; border: 1px solid #059669; text-align: left; }
    .footer { margin-top: 24px; font-size: 12px; color: #888; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <h1>📚 JANBHASHA — NIPUN Bharat Worksheet</h1>
    <h2>${category} — ${LANG_NAMES[fromLang]} → ${LANG_NAMES[toLang]}</h2>
    <p>Student: <strong>${studentName}</strong> &nbsp;&nbsp; Date: _______________</p>
  </div>
  <div class="outcome">🎯 <strong>Learning Outcome:</strong> ${nipunOutcome}</div>
  <table>
    <thead>
      <tr>
        <th>Symbol</th>
        <th>${LANG_NAMES[fromLang]}</th>
        <th>${LANG_NAMES[toLang]}</th>
        <th>Practice Writing</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">
    JANBHASHA • Developed by Team Xerses • Powered by NIPUN Bharat FLN Framework
  </div>
</body>
</html>`;
}

/**
 * Generate flashcard set for a category
 */
export function generateFlashcardSet(
  category: string,
  fromLang: LangCode = 'hi',
  toLang: LangCode = 'en'
) {
  return generateFlashcardsFromDictionary(category, fromLang, toLang);
}

/**
 * Get NIPUN Bharat outcome for a category
 */
export function getNipunOutcome(category: string): string {
  return NIPUN_OUTCOMES[category] || `${category} vocabulary building aligned to FLN framework`;
}

/**
 * List all available worksheet categories with NIPUN alignment
 */
export function getWorksheetCategories() {
  return getAllCategories().map(cat => ({
    name: cat,
    emoji: getCategoryEmoji(cat),
    nipunOutcome: NIPUN_OUTCOMES[cat] || 'FLN aligned vocabulary',
  }));
}

function getCategoryEmoji(cat: string): string {
  const map: Record<string, string> = {
    Numbers: '🔢', Alphabet: '🔤', Actions: '🏃', Nature: '🌿',
    Animals: '🐘', Food: '🍽️', Colors: '🎨', Family: '👨‍👩‍👧',
    Math: '➕', Body: '🧍', Classroom: '🏫', Language: '💬',
    Greetings: '🙏', Directions: '🧭', Time: '⏰', Opposites: '↔️',
  };
  return map[cat] || '📚';
}
