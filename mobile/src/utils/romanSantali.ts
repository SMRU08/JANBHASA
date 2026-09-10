/**
 * Roman Santali & Ol Chiki Bidirectional Transliteration Utility
 * Unicode Ol Chiki Range: U+1C50 to U+1C7F
 */

export const OL_CHIKI_TO_ROMAN_MAP: Record<string, string> = {
  // Consonants & basic letters
  'ᱚ': 'a',   'ᱛ': 't',   'ᱜ': 'g',   'ᱝ': 'ng',  'ᱞ': 'l',
  'ᱟ': 'aa',  'ᱠ': 'k',   'ᱡ': 'j',   'ᱢ': 'm',   'ᱣ': 'w',
  'ᱤ': 'i',   'ᱥ': 's',   'ᱦ': 'h',   'ᱧ': 'ny',  'ᱨ': 'r',
  'ᱩ': 'u',   'ᱪ': 'c',   'ᱫ': 'd',   'ᱬ': 'n',   'ᱭ': 'y',
  'ᱮ': 'e',   'ᱯ': 'p',   'ᱰ': 'd',   'ᱱ': 'n',   'ᱲ': 'r',
  'ᱳ': 'o',   'ᱴ': 't',   'ᱵ': 'b',   'ᱶ': 'v',   'ᱷ': 'h',
  // Modifiers
  'ᱸ': 'n',   'ᱹ': "'",   'ᱺ': 'h',   'ᱼ': '-',   'ᱽ': "'",
  // Punctuation
  '᱾': '.',   '᱿': '.',
  // Digits
  '᱐': '0',   '᱑': '1',   '᱒': '2',   '᱓': '3',   '᱔': '4',
  '᱕': '5',   '᱖': '6',   '᱗': '7',   '᱘': '8',   '᱙': '9',
};

export const ROMAN_TO_OL_CHIKI_MULTI: [string, string][] = [
  ['aa', 'ᱟ'], ['ng', 'ᱝ'], ['ny', 'ᱧ'], ['kh', 'ᱠᱷ'], ['gh', 'ᱜᱷ'],
  ['ch', 'ᱪᱷ'], ['jh', 'ᱡᱷ'], ['th', 'ᱛᱷ'], ['dh', 'ᱫᱷ'], ['ph', 'ᱯᱷ'],
  ['bh', 'ᱵᱷ'], ['rh', 'ᱲᱷ']
];

export const ROMAN_TO_OL_CHIKI_SINGLE: Record<string, string> = {
  'a': 'ᱚ', 't': 'ᱛ', 'g': 'ᱜ', 'l': 'ᱞ', 'k': 'ᱠ',
  'j': 'ᱡ', 'm': 'ᱢ', 'w': 'ᱣ', 'i': 'ᱤ', 's': 'ᱥ',
  'h': 'ᱦ', 'r': 'ᱨ', 'u': 'ᱩ', 'c': 'ᱪ', 'd': 'ᱫ',
  'n': 'ᱱ', 'y': 'ᱭ', 'e': 'ᱮ', 'p': 'ᱯ', 'o': 'ᱳ',
  'b': 'ᱵ', 'v': 'ᱶ',
  '0': '᱐', '1': '᱑', '2': '᱒', '3': '᱓', '4': '᱔',
  '5': '᱕', '6': '᱖', '7': '᱗', '8': '᱘', '9': '᱙',
};

export function olChikiToRoman(text: string): string {
  if (!text) return '';
  let out = '';
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (OL_CHIKI_TO_ROMAN_MAP[ch] !== undefined) {
      out += OL_CHIKI_TO_ROMAN_MAP[ch];
    } else {
      out += ch;
    }
  }
  return out;
}

export function romanToOlChiki(text: string): string {
  if (!text) return '';
  let str = text.toLowerCase();
  let i = 0;
  let out = '';
  while (i < str.length) {
    let matched = false;
    for (const [multi, ol] of ROMAN_TO_OL_CHIKI_MULTI) {
      if (str.startsWith(multi, i)) {
        out += ol;
        i += multi.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    const ch = str[i];
    if (ROMAN_TO_OL_CHIKI_SINGLE[ch]) {
      out += ROMAN_TO_OL_CHIKI_SINGLE[ch];
    } else {
      out += ch;
    }
    i++;
  }
  return out;
}

export function isOlChikiScript(text: string): boolean {
  if (!text) return false;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code >= 0x1C50 && code <= 0x1C7F) return true;
  }
  return false;
}
