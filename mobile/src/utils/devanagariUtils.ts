/**
 * Devanagari Script Utilities & Universal Phonetic Transducer for JANBHASHA.
 *
 * Guarantees that Hindi speech transcriptions are ALWAYS displayed
 * in authentic Hindi Devanagari script (e.g. 'नमस्ते बच्चों, आज हम पढ़ाई करेंगे।')
 * and NEVER in Romanized/English letters.
 */

// Core vocabulary lookup for highest orthographic precision on common classroom phrases
const HINDI_WORD_MAP: Record<string, string> = {
  // Greetings & Politeness
  'namaste': 'नमस्ते',
  'namaskar': 'नमस्कार',
  'pranam': 'प्रणाम',
  'dhanyawad': 'धन्यवाद',
  'dhanyavaad': 'धन्यवाद',
  'shukriya': 'शुक्रिया',
  'alvida': 'अलविदा',

  // Pronouns
  'aap': 'आप',
  'aapka': 'आपका',
  'aapki': 'आपकी',
  'aapke': 'आपके',
  'tum': 'तुम',
  'tumhara': 'तुम्हारा',
  'tumhari': 'तुम्हारी',
  'tumhare': 'तुम्हारे',
  'hum': 'हम',
  'ham': 'हम',
  'humara': 'हमारा',
  'hamara': 'हमारा',
  'humari': 'हमारी',
  'hamari': 'हमारी',
  'humare': 'हमारे',
  'hamare': 'हमारे',
  'main': 'मैं',
  'mera': 'मेरा',
  'meri': 'मेरी',
  'mere': 'मेरे',
  'mujhe': 'मुझे',
  'mujhko': 'मुझको',
  'tumhe': 'तुम्हें',
  'aapko': 'आपको',
  'yeh': 'यह',
  'ye': 'ये',
  'voh': 'वह',
  'woh': 'वह',
  've': 'वे',
  'inka': 'इनका',
  'unka': 'उनका',
  'sab': 'सब',
  'sabhi': 'सभी',
  'kya': 'क्या',
  'kyon': 'क्यों',
  'kyu': 'क्यों',
  'kyun': 'क्यों',
  'kaun': 'कौन',
  'kaisa': 'कैसा',
  'kaisi': 'कैसी',
  'kaise': 'कैसे',
  'kahan': 'कहाँ',
  'kidhar': 'किधर',
  'kab': 'कब',
  'kitna': 'कितना',
  'kitni': 'कितनी',
  'kitne': 'कितने',
  'apna': 'अपना',
  'apne': 'अपने',
  'apni': 'अपनी',
  'bare': 'बारे',
  'baare': 'बारे',
  'samajh': 'समझ',
  'shant': 'शांत',
  'shanti': 'शांति',
  'aawaz': 'आवाज़',
  'awaz': 'आवाज़',
  'kripya': 'कृपया',
  'kripaya': 'कृपया',
  'madad': 'मदद',
  'ghar': 'घर',
  'gaon': 'गाँव',
  // Classroom, Education & Teaching
  'bachchon': 'बच्चों',
  'bachcho': 'बच्चों',
  'bachche': 'बच्चे',
  'bachcha': 'बच्चा',
  'bacche': 'बच्चे',
  'baccho': 'बच्चों',
  'baccha': 'बच्चा',
  'aaj': 'आज',
  'kal': 'कल',
  'parson': 'परसों',
  'padhai': 'पढ़ाई',
  'padhenge': 'पढ़ेंगे',
  'padho': 'पढ़ो',
  'padhiye': 'पढ़िए',
  'padhna': 'पढ़ना',
  'karenge': 'करेंगे',
  'karo': 'करो',
  'kariye': 'करिए',
  'karna': 'करना',
  'kare': 'करें',
  'karein': 'करें',
  'kitab': 'किताब',
  'kitabein': 'किताबें',
  'kholo': 'खोलो',
  'kholiye': 'खोलिए',
  'kholna': 'खोलना',
  'band': 'बंद',
  'sankhya': 'संख्या',
  'ginti': 'गिनती',
  'seekhenge': 'सीखेंगे',
  'seekho': 'सीखो',
  'seekhna': 'सीखना',
  'dhyan': 'ध्यान',
  'se': 'से',
  'baat': 'बात',
  'suno': 'सुनो',
  'suniye': 'सुनिए',
  'sunna': 'सुनना',
  'dekho': 'देखो',
  'dekhiye': 'देखिए',
  'dekhna': 'देखना',
  'likho': 'लिखो',
  'likhiye': 'लिखिए',
  'likhna': 'लिखना',
  'bolo': 'बोलो',
  'boliye': 'बोलिए',
  'bolna': 'बोलना',
  'shikshak': 'शिक्षक',
  'adhyapak': 'अध्यापक',
  'vidyalaya': 'विद्यालय',
  'school': 'स्कूल',
  'kaksha': 'कक्षा',
  'class': 'क्लास',
  'board': 'बोर्ड',
  'shyamapatt': 'श्यामपट्ट',
  'pencil': 'पेंसिल',
  'kalam': 'कलम',
  'copy': 'कॉपी',
  'kopi': 'कॉपी',
  'uttar': 'उत्तर',
  'jawaab': 'जवाब',
  'jawab': 'जवाब',
  'sawal': 'सवाल',
  'prashna': 'प्रश्न',
  'kahani': 'कहानी',
  'kavita': 'कविता',
  'paath': 'पाठ',
  'path': 'पाठ',

  // Auxiliaries & Prepositions
  'hai': 'है',
  'hain': 'हैं',
  'ho': 'हो',
  'hoon': 'हूँ',
  'hun': 'हूँ',
  'tha': 'था',
  'thi': 'थी',
  'the': 'थे',
  'hoga': 'होगा',
  'hogi': 'होगी',
  'honge': 'होंगे',
  'nahi': 'नहीं',
  'nahin': 'नहीं',
  'na': 'ना',
  'bhi': 'भी',
  'hi': 'ही',
  'to': 'तो',
  'aur': 'और',
  'ya': 'या',
  'lekin': 'लेकिन',
  'par': 'पर',
  'mein': 'में',
  'me': 'में',
  'ko': 'को',
  'ka': 'का',
  'ki': 'की',
  'ke': 'के',
  'ne': 'ने',
  'liye': 'लिए',
  'saath': 'साथ',
  'paas': 'पास',
  'andar': 'अंदर',
  'bahar': 'बाहर',
  'upar': 'ऊपर',
  'neeche': 'नीचे',
  'aage': 'आगे',
  'peeche': 'पीछे',
  'yahan': 'यहाँ',
  'wahan': 'वहाँ',
  'vahan': 'वहाँ',
  'achha': 'अच्छा',
  'achhe': 'अच्छे',
  'achhi': 'अच्छी',
  'theek': 'ठीक',
  'shabash': 'शाबाश',
  'bahut': 'बहुत',
  'thoda': 'थोड़ा',
  'kam': 'कम',
  'zyada': 'ज्यादा',
  'jyada': 'ज्यादा',
  'jaldi': 'जल्दी',
  'dheere': 'धीरे',
  'chalo': 'चलो',
  'ruko': 'रुको',
  'baitho': 'बैठो',
  'baithiye': 'बैठिए',
  'khade': 'खड़े',
  'utho': 'उठो',
  'pani': 'पानी',
  'khana': 'खाना',
  'khao': 'खाओ',
  'piyo': 'पियो',
  'samay': 'समय',
  'chhutti': 'छुट्टी',
};

// Multi-character conjunct & consonant mappings for general Hindi speech
const MULTI_CONSONANTS: [string, string][] = [
  ['ksha', 'क्ष'], ['kshi', 'क्षि'], ['kshu', 'क्षु'], ['kshe', 'क्षे'], ['ksho', 'क्षो'], ['ksh', 'क्ष्'],
  ['gya', 'ज्ञा'], ['gyi', 'ज्ञि'], ['gyu', 'ज्ञु'], ['gye', 'ज्ञे'], ['gyo', 'ज्ञो'], ['gy', 'ज्ञ्'],
  ['tra', 'त्रा'], ['tri', 'त्रि'], ['tru', 'त्रु'], ['tre', 'त्रे'], ['tro', 'त्रो'], ['tr', 'त्र्'],
  ['shh', 'ष्'],
  ['chh', 'छ्'],
  ['kh', 'ख्'], ['gh', 'घ्'],
  ['ch', 'च्'], ['jh', 'झ्'],
  ['th', 'थ्'], ['dh', 'ध्'],
  ['ph', 'फ्'], ['bh', 'भ्'],
  ['sh', 'श्'], ['zh', 'ज़्'],
];

const SINGLE_CONSONANTS: Record<string, string> = {
  k: 'क्', g: 'ग्', c: 'च्', j: 'ज्',
  t: 'त्', d: 'द्', n: 'न्', p: 'प्',
  f: 'फ़्', b: 'ब्', m: 'म्', y: 'य्',
  r: 'र्', l: 'ल्', v: 'व्', w: 'व्',
  s: 'स्', h: 'ह्', z: 'ज़्', q: 'क़्',
};

const VOWEL_MATRAS: Record<string, string> = {
  a: '',
  aa: 'ा',
  i: 'ि',
  ee: 'ी',
  u: 'ु',
  oo: 'ू',
  e: 'े',
  ai: 'ै',
  o: 'ो',
  au: 'ौ',
};

const INDEPENDENT_VOWELS: Record<string, string> = {
  a: 'अ',
  aa: 'आ',
  i: 'इ',
  ee: 'ई',
  u: 'उ',
  oo: 'ऊ',
  e: 'ए',
  ai: 'ऐ',
  o: 'ओ',
  au: 'औ',
};

/**
 * Checks if a string contains any Devanagari Unicode characters (U+0900..U+097F).
 */
export function isDevanagari(text: string): boolean {
  if (!text) return false;
  return /[\u0900-\u097F]/.test(text);
}

/**
 * Checks if a string contains Latin/ASCII alphabetic characters.
 */
export function hasLatin(text: string): boolean {
  if (!text) return false;
  return /[a-zA-Z]/.test(text);
}

/**
 * Algorithmic phonetic transliterator for arbitrary Hindi words.
 * Works for any general spoken Hindi word, not just a fixed list.
 */
export function transliterateWord(rawWord: string): string {
  const clean = rawWord.toLowerCase().replace(/[^a-z]/g, '');
  if (!clean) return rawWord;

  // 1. Check exact dictionary match
  if (HINDI_WORD_MAP[clean]) {
    return HINDI_WORD_MAP[clean];
  }

  // 2. Algorithmic syllable transducer
  let out = '';
  let i = 0;
  const len = clean.length;
  let lastWasConsonantHalant = false;

  while (i < len) {
    let matched = false;

    // Check multi-character consonants
    for (const [latin, halantDeva] of MULTI_CONSONANTS) {
      if (clean.startsWith(latin, i)) {
        if (halantDeva.endsWith('्')) {
          out += halantDeva;
          lastWasConsonantHalant = true;
        } else {
          out += halantDeva;
          lastWasConsonantHalant = false;
        }
        i += latin.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // Check 2-letter vowels: aa, ee, oo, ai, au
    const twoVowel = clean.substring(i, i + 2);
    if (twoVowel === 'aa' || twoVowel === 'ee' || twoVowel === 'oo' || twoVowel === 'ai' || twoVowel === 'au') {
      if (lastWasConsonantHalant) {
        // Strip halant and attach matra
        out = out.slice(0, -1) + VOWEL_MATRAS[twoVowel];
      } else {
        out += INDEPENDENT_VOWELS[twoVowel];
      }
      lastWasConsonantHalant = false;
      i += 2;
      continue;
    }

    const ch = clean[i];

    // Single vowel: a, i, u, e, o
    if (ch === 'a' || ch === 'i' || ch === 'u' || ch === 'e' || ch === 'o') {
      if (lastWasConsonantHalant) {
        // Strip halant: 'a' inherent vowel makes it full consonant, other vowels attach matra
        out = out.slice(0, -1) + VOWEL_MATRAS[ch];
      } else {
        out += INDEPENDENT_VOWELS[ch];
      }
      lastWasConsonantHalant = false;
      i += 1;
      continue;
    }

    // Anusvara: 'n' before consonant or at end of syllable
    if (ch === 'n' && (i === len - 1 || (i + 1 < len && SINGLE_CONSONANTS[clean[i + 1]]))) {
      if (lastWasConsonantHalant) {
        out = out.slice(0, -1) + 'ं';
        lastWasConsonantHalant = false;
        i += 1;
        continue;
      }
    }

    // Single consonant
    if (SINGLE_CONSONANTS[ch]) {
      out += SINGLE_CONSONANTS[ch];
      lastWasConsonantHalant = true;
      i += 1;
      continue;
    }

    // Fallback
    out += ch;
    lastWasConsonantHalant = false;
    i += 1;
  }

  // If word ends with a halant consonant in Hindi speech (e.g. 'karenge', 'hum', 'naam'),
  // remove the terminal virama to make it natural Hindi schwa-deleted consonant (हम, नाम)
  if (out.endsWith('्')) {
    out = out.slice(0, -1);
  }

  return out;
}

/**
 * Phonetically transliterates arbitrary Romanized Hindi text into authentic Devanagari script.
 * Preserves punctuation, spaces, numbers, and existing Devanagari characters.
 */
export function romanToDevanagari(text: string): string {
  if (!text) return '';
  let res = text.replace(/[a-zA-Z]+/g, (word) => {
    return transliterateWord(word);
  });
  // Replace sentence-ending periods with Devanagari purna viram (।)
  // Avoid replacing periods in decimal numbers (e.g. 1.5)
  res = res.replace(/(?<!\d)\.(?!\d)/g, '।');
  return res;
}

/**
 * GUARANTEES that the given text is in authentic Hindi Devanagari script.
 *
 * Rules:
 * 1. If text is already predominantly Devanagari (e.g. from Whisper or typed Hindi),
 *    returns it 100% UNTOUCHED (zero stripping, zero alteration, all matras preserved),
 *    standardizing any terminal dot to Devanagari purna viram (।).
 * 2. If text contains Roman/Latin letters, converts the Romanized Hindi words into
 *    authentic Devanagari Hindi words.
 */
export function ensureDevanagari(text: string): string {
  if (!text || !text.trim()) return '';
  const trimmed = text.trim();

  const devaCount = (trimmed.match(/[\u0900-\u097F]/g) || []).length;
  const latinCount = (trimmed.match(/[a-zA-Z]/g) || []).length;

  // If already Devanagari and has no Latin letters, preserve authentic script
  // and convert any sentence-ending period to Devanagari purna viram
  if (devaCount > 0 && latinCount === 0) {
    return trimmed.replace(/(?<!\d)\.(?!\d)/g, '।');
  }

  // If Latin letters are present (e.g. Whisper returned Romanized Hindi),
  // convert to Devanagari while preserving existing punctuation and Devanagari
  return romanToDevanagari(trimmed);
}
