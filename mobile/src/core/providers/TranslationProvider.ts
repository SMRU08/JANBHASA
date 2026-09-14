import { ITranslationProvider, TranslationOptions, TranslationResult } from './ITranslationProvider';
import { SANTALI_DICTIONARY } from '../../data/santaliDictionary';
import { FLN_LEXICON } from '../../data/flnLexiconData';
import { olChikiToRoman } from '../../utils/romanSantali';

// Devanagari to Ol Chiki phonetic transliteration
const DEVA_CONSONANTS: Record<string, string> = {
  'क': 'ᱠ', 'ख': 'ᱠᱷ', 'ग': 'ᱜ', 'घ': 'ᱜᱷ', 'ङ': 'ᱝ',
  'च': 'ᱪ', 'छ': 'ᱪᱷ', 'ज': 'ᱡ', 'झ': 'ᱡᱷ', 'ञ': 'ᱧ',
  'ट': 'ᱴ', 'ठ': 'ᱴᱷ', 'ड': 'ᱰ', 'ढ': 'ᱰᱷ', 'ण': 'ᱬ',
  'त': 'ᱛ', 'थ': 'ᱛᱷ', 'द': 'ᱫ', 'ध': 'ᱫᱷ', 'न': 'ᱱ',
  'प': 'ᱯ', 'फ': 'ᱯᱷ', 'ब': 'ᱵ', 'भ': 'ᱵᱷ', 'म': 'ᱢ',
  'य': 'ᱭ', 'र': 'ᱨ', 'ल': 'ᱞ', 'व': 'ᱣ',
  'श': 'ᱥ', 'ष': 'ᱥ', 'स': 'ᱥ', 'ह': 'ᱦ',
  'ड़': 'ᱲ', 'ढ़': 'ᱲᱷ'
};

const DEVA_VOWELS: Record<string, string> = {
  'अ': 'ᱚ', 'आ': 'ᱟ', 'इ': 'ᱤ', 'ई': 'ᱤ', 'उ': 'ᱩ', 'ऊ': 'ᱩ',
  'ए': 'ᱮ', 'ऐ': 'ᱮ', 'ओ': 'ᱳ', 'औ': 'ᱳ'
};

const DEVA_MATRAS: Record<string, string> = {
  'ा': 'ᱟ', 'ि': 'ᱤ', 'ी': 'ᱤ', 'ु': 'ᱩ', 'ू': 'ᱩ',
  'े': 'ᱮ', 'ै': 'ᱮ', 'ो': 'ᱳ', 'ौ': 'ᱳ'
};

const DEVA_OTHERS: Record<string, string> = {
  'ं': 'ᱸ', 'ँ': 'ᱶ', 'ः': 'ᱺ', '्': '', '।': '᱾', '॥': '᱿',
  '०': '᱐', '१': '᱑', '२': '᱒', '३': '᱓', '४': '᱔',
  '५': '᱕', '६': '᱖', '७': '᱗', '८': '᱘', '९': '᱙'
};

export function devaToOlChiki(text: string): string {
  if (!text) return '';
  const res: string[] = [];
  let i = 0;
  const n = text.length;

  while (i < n) {
    const c = text[i];
    if (i + 1 < n && text.substring(i, i + 2) in DEVA_CONSONANTS) {
      res.push(DEVA_CONSONANTS[text.substring(i, i + 2)]);
      if (i + 2 < n && text[i + 2] in DEVA_MATRAS) {
        res.push(DEVA_MATRAS[text[i + 2]]);
        i += 3;
        continue;
      } else if (i + 2 < n && text[i + 2] === '्') {
        i += 3;
        continue;
      } else {
        i += 2;
        continue;
      }
    }

    if (c in DEVA_CONSONANTS) {
      res.push(DEVA_CONSONANTS[c]);
      if (i + 1 < n && text[i + 1] in DEVA_MATRAS) {
        res.push(DEVA_MATRAS[text[i + 1]]);
        i += 2;
        continue;
      } else if (i + 1 < n && text[i + 1] === '्') {
        i += 2;
        continue;
      } else {
        i += 1;
        continue;
      }
    } else if (c in DEVA_VOWELS) {
      res.push(DEVA_VOWELS[c]);
    } else if (c in DEVA_MATRAS) {
      res.push(DEVA_MATRAS[c]);
    } else if (c in DEVA_OTHERS) {
      res.push(DEVA_OTHERS[c]);
    } else {
      res.push(c);
    }
    i += 1;
  }
  return res.join('');
}

export class TranslationProvider implements ITranslationProvider {
  // FLN Pedagogical Lexicon (368 verified classroom interactions from HF repo)
  private flnHinToSat: Map<string, string> = new Map();
  private flnSatToHin: Map<string, string> = new Map();

  // Core AdiBhasha & Bharatavani Lexicon
  private hinToSatDict: Map<string, string> = new Map();
  private satToHinDict: Map<string, string> = new Map();

  private sortedCompoundPhrases: [string, string][] = [];

  private compoundPhrases: [string, string][] = [
    // Greetings & Introduction
    ['तुम्हारा नाम क्या है', 'ᱟᱢᱟᱜ ᱧᱩᱛᱩᱢ ᱪᱮᱫ?'],
    ['आपका नाम क्या है', 'ᱟᱢᱟᱜ ᱧᱩᱛᱩᱢ ᱪᱮᱫ?'],
    ['आपका नाम', 'ᱟᱢᱟᱜ ᱧᱩᱛᱩᱢ'],
    ['तुम्हारा नाम', 'ᱟᱢᱟᱜ ᱧᱩᱛᱩᱢ'],
    ['मेरा नाम', 'ᱤᱧᱟᱜ ᱧᱩᱛᱩᱢ'],
    ['आप कैसे हैं', 'ᱟᱢ ᱪᱮᱫ ᱞᱮᱠᱟ ᱢᱮᱱᱟᱢᱟ?'],
    ['तुम कैसे हो', 'ᱟᱢ ᱪᱮᱫ ᱞᱮᱠᱟ ᱢᱮᱱᱟᱢᱟ?'],
    ['मैं ठीक हूँ', 'ᱤᱧ ᱵᱮᱥ ᱜᱮ ᱢᱮᱱᱟᱹᱧᱟ'],
    ['सब ठीक है', 'ᱡᱚᱛᱚ ᱵᱮᱥ ᱜᱮᱭᱟ'],
    ['शुभ प्रभात', 'ᱥᱟᱹᱜᱩᱱ ᱥᱮᱛᱟᱜ'],
    ['शुभ रात्रि', 'ᱥᱟᱹᱜᱩᱱ ᱧᱤᱫᱟᱹ'],
    ['अलविदा', 'ᱪᱟᱞᱟᱜ ᱠᱟᱱᱟᱹᱧ'],
    ['फिर मिलेंगे', 'ᱫᱚᱲᱦᱟ ᱵᱚᱱ ᱧᱟᱯᱟᱢᱟ'],
    ['बहुत अच्छा', 'ᱟᱹᱰᱤ ᱵᱮᱥ'],
    ['शाबाश', 'ᱥᱟᱨᱦᱟᱣ'],
    ['धन्यवाद', 'ᱥᱟᱨᱦᱟᱣ'],

    // Classroom Instructions & Commands
    ['अपनी किताब खोलो', 'ᱟᱢᱟᱜ ᱯᱚᱛᱚᱵ ᱡᱷᱤᱡᱽ ᱢᱮ'],
    ['अपनी किताबें खोलो', 'ᱟᱯᱮᱭᱟᱜ ᱯᱚᱛᱚᱵᱠᱚ ᱡᱷᱤᱡᱽ ᱯᱮ'],
    ['किताब खोलो', 'ᱯᱚᱛᱚᱵ ᱡᱷᱤᱡᱽ ᱢᱮ'],
    ['किताब बंद करो', 'ᱯᱚᱛᱚᱵ ᱵᱚᱸᱫᱽ ᱢᱮ'],
    ['कॉपी निकालो', 'ᱠᱷᱟᱛᱟ ᱚᱰᱚᱠ ᱢᱮ'],
    ['कापी निकालो', 'ᱠᱷᱟᱛᱟ ᱚᱰᱚᱠ ᱢᱮ'],
    ['पेंसिल पकड़ो', 'ᱯᱮᱱᱥᱤᱞ ᱥᱟᱵᱽ ᱢᱮ'],
    ['कलम पकड़ो', 'ᱠᱚᱞᱚᱢ ᱥᱟᱵᱽ ᱢᱮ'],
    ['लिखना शुरू करो', 'ᱚᱞ ᱮᱛᱚᱦᱚᱵ ᱢᱮ'],
    ['पढ़ना शुरू करो', 'ᱯᱟᱲᱦᱟᱣ ᱮᱛᱚᱦᱚᱵ ᱢᱮ'],
    ['खड़े हो जाओ', 'ᱛᱤᱸᱜᱩᱱ ᱢᱮ'],
    ['बैठ जाओ', 'ᱫᱩᱲᱩᱵ ᱢᱮ'],
    ['कृपया यहाँ बैठिए', 'ᱫᱟᱭᱟ ᱠᱟᱛᱮ ᱱᱚᱸᱰᱮ ᱫᱩᱲᱩᱵ ᱢᱮ'],
    ['चुप रहो', 'ᱛᱷᱤᱨ ᱛᱟᱦᱮᱸᱱ ᱢᱮ'],
    ['चुपचाप बैठो', 'ᱛᱷᱤᱨ ᱠᱟᱛᱮ ᱫᱩᱲᱩᱵ ᱢᱮ'],
    ['आवाज़ मत करो', 'ᱥᱟᱰᱮ ᱟᱞᱚᱢ ᱚᱰᱚᱠᱟ'],
    ['मेरी बात सुनो', 'ᱤᱧᱟᱜ ᱠᱟᱛᱷᱟ ᱟᱸᱡᱚᱢ ᱢᱮ'],
    ['ध्यान से सुनो', 'ᱫᱷᱮᱭᱟᱱ ᱛᱮ ᱟᱸᱡᱚᱢ ᱢᱮ'],
    ['हाथ उठाओ', 'ᱛᱤ ᱛᱩᱞ ᱢᱮ'],
    ['यहाँ आओ', 'ᱱᱚᱸᱰᱮ ᱦᱤᱡᱩᱜ ᱢᱮ'],
    ['सब बच्चे यहाँ आओ', 'ᱥᱟᱱᱟᱢ ᱜᱤᱫᱽᱨᱟᱹᱠᱚ ᱱᱚᱸᱰᱮ ᱦᱤᱡᱩᱜ ᱯᱮ'],
    ['वहाँ जाओ', 'ᱦᱟᱸᱰᱮ ᱪᱟᱞᱟᱜ ᱢᱮ'],
    ['घर जाओ', 'ᱚᱲᱟᱜ ᱪᱟᱞᱟᱜ ᱢᱮ'],
    ['पानी पियो', 'ᱫᱟᱜ ᱧᱩᱭ ᱢᱮ'],
    ['खाना खाओ', 'ᱫᱟᱠᱟ ᱡᱚᱢ ᱢᱮ'],
    ['हाथ धो लो', 'ᱛᱤ ᱟᱹᱨᱩᱵ ᱢᱮ'],
    ['साफ़ करो', 'ᱥᱟᱯᱷᱟᱭ ᱢᱮ'],
    ['यहाँ देखो', 'ᱱᱚᱸᱰᱮ ᱧᱮᱞ ᱢᱮ'],
    ['बोर्ड पर देखो', 'ᱵᱳᱨᱰ ᱨᱮ ᱧᱮᱞ ᱢᱮ'],
    ['श्यामपट्ट पर देखो', 'ᱵᱳᱨᱰ ᱨᱮ ᱧᱮᱞ ᱢᱮ'],
    ['मेरी तरफ देखो', 'ᱤᱧ ᱥᱮᱫ ᱧᱮᱞ ᱢᱮ'],
    ['उत्तर दो', 'ᱛᱮᱞᱟ ᱮᱢ ᱢᱮ'],
    ['जवाब दो', 'ᱛᱮᱞᱟ ᱮᱢ ᱢᱮ'],
    ['सवाल पूछो', 'ᱠᱩᱠᱞᱤ ᱠᱩᱞᱤ ᱢᱮ'],
    ['प्रश्न पूछो', 'ᱠᱩᱠᱞᱤ ᱠᱩᱞᱤ ᱢᱮ'],
    ['समझ आया', 'ᱵᱩᱡᱷᱟᱹᱣ ᱮᱱᱟ?'],
    ['समझ गए', 'ᱵᱩᱡᱷᱟᱹᱣ ᱮᱱᱟ?'],
    ['फिर से बोलो', 'ᱫᱚᱲᱦᱟ ᱨᱚᱲ ᱢᱮ'],
    ['दोबारा बोलो', 'ᱫᱚᱲᱦᱟ ᱨᱚᱲ ᱢᱮ'],
    ['ज़ोर से बोलो', 'ᱡᱩᱨ ᱛᱮ ᱨᱚᱲ ᱢᱮ'],
    ['जोर से बोलो', 'ᱡᱩᱨ ᱛᱮ ᱨᱚᱲ ᱢᱮ'],
    ['एक साथ बोलो', 'ᱢᱤᱫ ᱥᱟᱶᱛᱮ ᱨᱚᱲ ᱯᱮ'],
    ['ताली बजाओ', 'ᱛᱷᱟᱹᱭᱟᱹ ᱛᱟᱦᱟᱭ ᱯᱮ'],
    ['तालियां बजाओ', 'ᱛᱷᱟᱹᱭᱟᱹ ᱛᱟᱦᱟᱭ ᱯᱮ'],
    ['लाइन में खड़े हो जाओ', 'ᱥᱟᱹᱨᱤ ᱛᱮ ᱛᱤᱸᱜᱩᱱ ᱯᱮ'],
    ['पंक्ति बनाओ', 'ᱥᱟᱹᱨᱤ ᱵᱮᱱᱟᱣ ᱯᱮ'],
    ['प्रार्थना करो', 'ᱱᱮᱦᱚᱸᱨ ᱢᱮ'],
    ['गृहकार्य दिखाओ', 'ᱚᱲᱟᱜ ᱠᱟᱹᱢᱤ ᱩᱫᱩᱜ ᱢᱮ'],
    ['होमवर्क दिखाओ', 'ᱚᱲᱟᱜ ᱠᱟᱹᱢᱤ ᱩᱫᱩᱜ ᱢᱮ'],

    // Numeracy & Counting
    ['एक से पाँच तक गिनो', 'ᱢᱤᱫ ᱠᱷᱚᱱ ᱢᱚᱬᱮ ᱫᱷᱟᱹᱵᱤᱡ ᱞᱮᱠᱷᱟᱭ ᱢᱮ'],
    ['एक से दस तक गिनो', 'ᱢᱤᱫ ᱠᱷᱚᱱ ᱜᱮᱞ ᱫᱷᱟᱹᱵᱤᱡ ᱞᱮᱠᱷᱟᱭ ᱢᱮ'],
    ['चलो हम सब मिलकर दस तक गिनती करें', 'ᱫᱮᱞᱟᱵᱚ ᱥᱟᱱᱟᱢ ᱠᱚ ᱢᱮᱥᱟ ᱠᱟᱛᱮ ᱜᱮᱞ ᱫᱷᱟᱹᱵᱤᱡ ᱞᱮᱠᱷᱟᱭ ᱵᱚ'],
    ['गिनती करो', 'ᱞᱮᱠᱷᱟᱭ ᱢᱮ'],
    ['गिनती सीखो', 'ᱞᱮᱠᱷᱟ ᱪᱮᱫᱚᱜ ᱢᱮ'],
    ['कितने हुए', 'ᱛᱤᱱᱟᱹᱜ ᱦᱩᱭ ᱮᱱᱟ?'],
    ['जोड़ करो', 'ᱡᱩᱲᱟᱹᱣ ᱢᱮ'],
    ['घटाव करो', 'ᱵᱷᱮᱜᱟᱨ ᱢᱮ'],

    // Classroom Activities & Routine
    ['आज स्कूल में कार्यक्रम है', 'ᱛᱮᱦᱮᱧ ᱤᱛᱩᱱ ᱟᱥᱲᱟ ᱨᱮ ᱠᱟᱹᱢᱤᱦᱚᱨᱟ ᱢᱮᱱᱟᱜ-ᱟ'],
    ['आप कल कितने बजे आएंगे', 'ᱟᱯᱮ ᱜᱟᱯᱟ ᱛᱤᱱᱟᱹᱜ ᱵᱟᱡᱟᱣ ᱯᱮ ᱦᱤᱡᱩᱜ-ᱟ?'],
    ['बच्चों को अपनी किताब खोलनी चाहिए', 'ᱜᱤᱫᱽᱨᱟᱹᱠᱚ ᱟᱠᱚᱣᱟᱜ ᱯᱚᱛᱚᱵ ᱡᱷᱤᱡᱽ ᱫᱚᱨᱠᱟᱨ'],
    ['हम अगले सप्ताह नई कक्षा शुरू करेंगे', 'ᱟᱵᱚ ᱫᱟᱨᱟᱭ ᱦᱟᱯᱛᱟ ᱱᱟᱣᱟ ᱪᱟᱱᱟᱪ ᱵᱚ ᱮᱛᱚᱦᱚᱵ-ᱟ'],
    ['मुझे बाजार जाना है', 'ᱤᱧ ᱦᱟᱴ ᱪᱟᱞᱟᱜ ᱦᱩᱭᱩᱜ-ᱟ'],
    ['मैं घर जा रहा हूँ', 'ᱤᱧ ᱚᱲᱟᱜ ᱤᱧ ᱪᱟᱞᱟᱜ ᱠᱟᱱᱟ'],
    ['मैं घर जा रही हूँ', 'ᱤᱧ ᱚᱲᱟᱜ ᱤᱧ ᱪᱟᱞᱟᱜ ᱠᱟᱱᱟ'],
    ['आप क्या कर रहे हैं', 'ᱟᱯᱮ ᱪᱮᱫ ᱯᱮ ᱠᱟᱹᱢᱤ ᱠᱟᱱᱟ?'],
    ['तुम क्या कर रहे हो', 'ᱟᱢ ᱪᱮᱫ ᱮᱢ ᱠᱟᱹᱢᱤ ᱠᱟᱱᱟ?'],
    ['यह बहुत अच्छा है', 'ᱱᱚᱣᱟ ᱫᱚ ᱟᱹᱰᱤ ᱵᱮᱥ ᱜᱮᱭᱟ'],
    ['यह महुआ का पेड़ है', 'ᱱᱚᱣᱟ ᱫᱚ ᱢᱟᱛᱠᱚᱢ ᱫᱟᱨᱮ ᱠᱟᱱᱟ'],
    ['यह किसका है', 'ᱱᱚᱣᱟ ᱫᱚ ᱚᱠᱚᱭᱟᱜ?'],
    ['वह किसका है', 'ᱚᱱᱟ ᱫᱚ ᱚᱠᱚᱭᱟᱜ?'],
    ['आज कौन अनुपस्थित है', 'ᱛᱮᱦᱮᱧ ᱚᱠᱚᱭ ᱵᱟᱹᱱᱩᱜ-ᱮᱭᱟ?'],
    ['सब उपस्थित हैं', 'ᱡᱚᱛᱚ ᱦᱚᱲ ᱢᱮᱱᱟᱜ ᱠᱚᱣᱟ'],
    ['समय हो गया है', 'ᱚᱠᱛᱚ ᱦᱩᱭ ᱮᱱᱟ'],
    ['छुट्टी हो गई', 'ᱪᱷᱩᱴᱤ ᱦᱩᱭ ᱮᱱᱟ'],
    ['कल मिलेंगे', 'ᱜᱟᱯᱟ ᱵᱚᱱ ᱧᱟᱯᱟᱢᱟ'],

    // Common Postpositional Phrases
    ['के बारे में', 'ᱵᱟᱵᱚᱛ'],
    ['के बारे', 'ᱵᱟᱵᱚᱛ'],
    ['के लिए', 'ᱞᱟᱹᱜᱤᱫ'],
    ['के साथ', 'ᱥᱟᱶᱛᱮ'],
    ['के पास', 'ᱥᱩᱨ ᱨᱮ'],
    ['की तरफ', 'ᱥᱮᱫ'],
    ['की ओर', 'ᱥᱮᱫ'],
    ['के नीचे', 'ᱞᱟᱛᱟᱨ ᱨᱮ'],
    ['के ऊपर', 'ᱪᱮᱛᱟᱱ ᱨᱮ'],
    ['के अंदर', 'ᱵᱷᱤᱛᱨᱤ ᱨᱮ'],
    ['के बाहर', 'ᱵᱟᱦᱨᱮ ᱨᱮ'],
    ['के सामने', 'ᱥᱟᱢᱟᱝ ᱨᱮ'],
    ['के पीछे', 'ᱛᱟᱭᱚᱢ ᱨᱮ'],

    // Common Verb Phrases (Continuous & Progressive)
    ['जा रहे हैं', 'ᱪᱟᱞᱟᱜ ᱠᱟᱱᱟᱠᱚ'],
    ['जा रहा है', 'ᱪᱟᱞᱟᱜ ᱠᱟᱱᱟᱭ'],
    ['जा रही है', 'ᱪᱟᱞᱟᱜ ᱠᱟᱱᱟᱭ'],
    ['आ रहे हैं', 'ᱦᱤᱡᱩᱜ ᱠᱟᱱᱟᱠᱚ'],
    ['आ रहा है', 'ᱦᱤᱡᱩᱜ ᱠᱟᱱᱟᱭ'],
    ['आ रही है', 'ᱦᱤᱡᱩᱜ ᱠᱟᱱᱟᱭ'],
    ['कर रहे हैं', 'ᱠᱟᱹᱢᱤ ᱠᱟᱱᱟᱠᱚ'],
    ['कर रहा है', 'ᱠᱟᱹᱢᱤ ᱠᱟᱱᱟᱭ'],
    ['कर रही है', 'ᱠᱟᱹᱢᱤ ᱠᱟᱱᱟᱭ'],
    ['पढ़ा रहे हैं', 'ᱯᱟᱲᱦᱟᱣ ᱮᱫᱟᱠᱚ'],
    ['पढ़ा रहा है', 'ᱯᱟᱲᱦᱟᱣ ᱮᱫᱟᱭ'],
    ['पढ़ रहे हैं', 'ᱯᱟᱲᱦᱟᱣᱜ ᱠᱟᱱᱟᱠᱚ'],
    ['पढ़ रहा है', 'ᱯᱟᱲᱦᱟᱣᱜ ᱠᱟᱱᱟᱭ'],
    ['लिख रहे हैं', 'ᱚᱞ ᱮᱫᱟᱠᱚ'],
    ['लिख रहा है', 'ᱚᱞ ᱮᱫᱟᱭ'],
    ['खेल रहे हैं', 'ᱮᱱᱮᱡ ᱠᱟᱱᱟᱠᱚ'],
    ['खेल रहा है', 'ᱮᱱᱮᱡ ᱠᱟᱱᱟᱭ'],
    ['गा रहे हैं', 'ᱥᱮᱨᱮᱧ ᱮᱫᱟᱠᱚ'],
    ['गा रहा है', 'ᱥᱮᱨᱮᱧ ᱮᱫᱟᱭ'],
    ['नाच रहे हैं', 'ᱮᱱᱮᱡ ᱠᱟᱱᱟᱠᱚ'],
    ['नाच रही है', 'ᱮᱱᱮᱡ ᱠᱟᱱᱟᱭ'],
    ['हँस रहे हैं', 'ᱞᱟᱸᱫᱟᱭ ᱮᱫᱟᱠᱚ'],
    ['हँस रहा है', 'ᱞᱟᱸᱫᱟᱭ ᱮᱫᱟᱭ'],
    ['सो रहे हैं', 'ᱡᱟᱹᱯᱤᱫ ᱟᱠᱟᱫᱟᱠᱚ'],
    ['सो रहा है', 'ᱡᱟᱹᱯᱤᱫ ᱟᱠᱟᱫᱟᱭ'],
  ];

  constructor() {
    // 1. Index 368 verified FLN interactions
    for (const item of FLN_LEXICON) {
      const h = item.sourceHindi.trim().toLowerCase();
      const s = item.targetOlChiki.trim();
      this.flnHinToSat.set(h, s);
      this.flnSatToHin.set(s, item.sourceHindi.trim());
    }

    // 2. Index core vocabulary terms and slash-separated aliases
    for (const item of SANTALI_DICTIONARY) {
      const parts = item.hindi.split('/');
      for (const part of parts) {
        const cleanPart = part.trim().toLowerCase();
        if (cleanPart) {
          this.hinToSatDict.set(cleanPart, item.olChiki);
        }
      }
      this.satToHinDict.set(item.olChiki.trim(), item.hindi);
    }

    // 3. Common pedagogical and conversational classroom inflections
    const commonClassroomPairs: [string, string][] = [
      ['बच्चे', 'ᱜᱤᱫᱽᱨᱟᱹᱠᱚ'],
      ['बच्चा', 'ᱜᱤᱫᱽᱨᱟᱹ'],
      ['बच्चों', 'ᱜᱤᱫᱽᱨᱟᱹᱠᱚ'],
      ['किताबें', 'ᱯᱚᱛᱚᱵᱠᱚ'],
      ['किताब', 'ᱯᱚᱛᱚᱵ'],
      ['स्कूल', 'ᱤᱛᱩᱱ ᱟᱥᱲᱟ'],
      ['विद्यालय', 'ᱤᱛᱩᱱ ᱟᱥᱲᱟ'],
      ['कलम', 'ᱠᱚᱞᱚᱢ'],
      ['पेन', 'ᱠᱚᱞᱚᱢ'],
      ['छात्र', 'ᱯᱟᱹᱴᱷᱩᱣᱟᱹ'],
      ['विद्यार्थी', 'ᱯᱟᱹᱴᱷᱩᱣᱟᱹ'],
      ['शिक्षक', 'ᱢᱟᱪᱮᱛ'],
      ['गुरुजी', 'ᱢᱟᱪᱮᱛ'],
      ['कक्षा', 'ᱪᱟᱱᱟᱪ'],
      ['क्लास', 'ᱪᱟᱱᱟᱪ'],
      ['जाओ', 'ᱪᱟᱞᱟᱜ ᱢᱮ'],
      ['जाना', 'ᱥᱮᱱᱚᱜ'],
      ['आओ', 'ᱦᱤᱡᱩᱜ ᱢᱮ'],
      ['बैठो', 'ᱫᱩᱲᱩᱵ ᱢᱮ'],
      ['खड़े हो जाओ', 'ᱛᱤᱸᱜᱩᱱ ᱢᱮ'],
      ['सुनो', 'ᱟᱸᱡᱚᱢ ᱢᱮ'],
      ['देखो', 'ᱧᱮᱞ ᱢᱮ'],
      ['पियो', 'ᱧᱩᱭ ᱢᱮ'],
      ['पीना', 'ᱧᱩᱭ'],
      ['खाओ', 'ᱡᱚᱢ ᱢᱮ'],
      ['खाना', 'ᱫᱟᱠᱟ'],
      ['पेड़', 'ᱫᱟᱨᱮ'],
      ['पेड़ों', 'ᱫᱟᱨᱮᱠᱚ'],
      ['जंगल', 'ᱵᱤᱨ'],
      ['पानी', 'ᱫᱟᱜ'],
      ['घर', 'ᱚᱲᱟᱜ'],
      ['गाँव', 'ᱟᱹᱛᱩ'],
      ['नाम', 'ᱧᱩᱛᱩᱢ'],
      ['में', 'ᱨᱮ'],
      ['पर', 'ᱨᱮ'],
      ['से', 'ᱠᱷᱚᱱ'],
      ['तक', 'ᱫᱷᱟᱹᱵᱤᱡ'],
      ['का', 'ᱨᱮᱱᱟᱜ'],
      ['के', 'ᱨᱮᱱᱟᱜ'],
      ['की', 'ᱨᱮᱱᱟᱜ'],
      ['को', 'ᱫᱚ'],
      ['और', 'ᱟᱨ'],
      ['तथा', 'ᱟᱨ'],
      ['या', 'ᱥᱮ'],
      ['लेकिन', 'ᱢᱮᱱᱠᱷᱟᱱ'],
      ['भी', 'ᱦᱚᱸ'],
      ['तो', 'ᱠᱷᱟᱱ'],
      ['है', 'ᱠᱟᱱᱟ'],
      ['हैं', 'ᱠᱟᱱᱟᱠᱚ'],
      ['था', 'ᱛᱟᱦᱮᱸᱠᱟᱱᱟ'],
      ['थी', 'ᱛᱟᱦᱮᱸᱠᱟᱱᱟ'],
      ['थे', 'ᱛᱟᱦᱮᱸᱠᱟᱱᱟ'],
      ['होगा', 'ᱦᱩᱭᱩᱜ-ᱟ'],
      ['नहीं', 'ᱵᱟᱝ'],
      ['हाँ', 'ᱦᱮᱸ'],
      ['मत', 'ᱟᱞᱚ'],
      ['क्या', 'ᱪᱮᱫ'],
      ['कहाँ', 'ᱚᱠᱟᱨᱮ'],
      ['कब', 'ᱛᱤᱥ'],
      ['क्यों', 'ᱪᱮᱫᱟᱜ'],
      ['कौन', 'ᱚᱠᱚᱭ'],
      ['कैसे', 'ᱪᱮᱫ ᱞᱮᱠᱟ'],
      ['कैसा', 'ᱪᱮᱫ ᱞᱮᱠᱟ'],
      ['कितना', 'ᱛᱤᱱᱟᱹᱜ'],
      ['यह', 'ᱱᱚᱣᱟ'],
      ['ये', 'ᱱᱚᱣᱟᱠᱚ'],
      ['वह', 'ᱦᱟᱱᱟ'],
      ['वे', 'ᱩᱱᱠᱩ'],
      ['यहाँ', 'ᱱᱚᱸᱰᱮ'],
      ['वहाँ', 'ᱦᱟᱸᱰᱮ'],
      ['हम', 'ᱟᱵᱚ'],
      ['हमारा', 'ᱟᱵᱚᱣᱟᱜ'],
      ['तुम', 'ᱟᱢ'],
      ['तुम्हारा', 'ᱟᱢᱟᱜ'],
      ['आप', 'ᱟᱯᱮ'],
      ['आपका', 'ᱟᱯᱮᱭᱟᱜ'],
      ['मैं', 'ᱤᱧ'],
      ['मेरा', 'ᱤᱧᱟᱜ'],
      ['सब', 'ᱡᱚᱛᱚ'],
      ['सभी', 'ᱥᱟᱱᱟᱢ'],
      ['आज', 'ᱛᱮᱦᱮᱧ'],
      ['कल', 'ᱜᱟᱯᱟ'],
      ['अब', 'ᱱᱤᱛ'],
      ['सीखेंगे', 'ᱪᱮᱫᱚᱜ ᱵᱚ'],
      ['सीखना', 'ᱪᱮᱫᱚᱜ'],
      ['पढ़ना', 'ᱯᱟᱲᱦᱟᱣ'],
      ['लिखना', 'ᱚᱞ'],
      ['बोलना', 'ᱨᱚᱲ'],
      ['बड़ा', 'ᱢᱟᱨᱟᱝ'],
      ['छोटा', 'ᱦᱩᱰᱤᱧ'],
      ['अच्छा', 'ᱵᱮᱥ'],
      ['साफ़', 'ᱥᱟᱯᱷᱟ'],
      ['सुंदर', 'ᱪᱚᱨᱚᱠ'],
      ['नमस्ते', 'ᱡᱚᱦᱟᱨ'],
      ['प्रणाम', 'ᱡᱚᱦᱟᱨ'],
      ['धन्यवाद', 'ᱥᱟᱨᱦᱟᱣ'],
      ['सब्जी', 'ᱩᱛᱩ'],
      ['रोटी', 'ᱯᱤᱴᱷᱟᱹ'],
      ['चावल', 'ᱫᱟᱠᱟ'],
      ['दूध', 'ᱛᱚᱣᱟ'],
      ['बाजार', 'ᱦᱟᱴ'],
      ['सप्ताह', 'ᱦᱟᱯᱛᱟ'],
      ['समय', 'ᱚᱠᱛᱚ'],
      ['कार्यक्रम', 'ᱠᱟᱹᱢᱤᱦᱚᱨᱟ'],
      ['शुरू', 'ᱮᱛᱚᱦᱚᱵ'],
      ['चाहिए', 'ᱫᱚᱨᱠᱟᱨ'],
      ['नया', 'ᱱᱟᱣᱟ'],
      ['नई', 'ᱱᱟᱣᱟ'],
      ['नए', 'ᱱᱟᱣᱟ'],
      ['पुराना', 'ᱢᱟᱨᱮ'],
      ['दिन', 'ᱢᱟᱦᱟ'],
      ['रात', 'ᱧᱤᱫᱟᱹ'],
      ['सुबह', 'ᱥᱮᱛᱟᱜ'],
      ['शाम', 'ᱟᱹᱭᱩᱵ'],
      ['दोपहर', 'ᱛᱤᱠᱤᱱ'],

      // School & Classroom Objects
      ['कॉपी', 'ᱠᱷᱟᱛᱟ'],
      ['कापी', 'ᱠᱷᱟᱛᱟ'],
      ['पेंसिल', 'ᱯᱮᱱᱥᱤᱞ'],
      ['कलम', 'ᱠᱚᱞᱚᱢ'],
      ['बस्ता', 'ᱛᱷᱚᱞᱟ'],
      ['बैग', 'ᱛᱷᱚᱞᱟ'],
      ['घंटी', 'ᱜᱷᱟᱹᱱᱴᱤ'],
      ['श्यामपट्ट', 'ᱵᱳᱨᱰ'],
      ['बोर्ड', 'ᱵᱳᱨᱰ'],
      ['चौक', 'ᱪᱚᱠ'],
      ['डस्टर', 'ᱰᱟᱥᱴᱟᱨ'],
      ['मेज', 'ᱴᱮᱵᱩᱞ'],
      ['कुर्सी', 'ᱪᱚᱣᱠᱤ'],
      ['कमरा', 'ᱚᱲᱟᱜ'],
      ['दरवाजा', 'ᱫᱩᱣᱟᱹᱨ'],
      ['खिड़की', 'ᱡᱷᱟᱨᱠᱷᱟ'],
      ['मैदान', 'ᱴᱟᱺᱰᱤ'],
      ['खेल', 'ᱮᱱᱮᱡ'],
      ['कविता', 'ᱚᱱᱚᱬᱦᱮ'],
      ['कहानी', 'ᱠᱟᱹᱦᱱᱤ'],
      ['पाठ', 'ᱯᱟᱴᱷ'],
      ['अध्याय', 'ᱦᱟᱹᱴᱤᱧ'],
      ['सवाल', 'ᱠᱩᱠᱞᱤ'],
      ['प्रश्न', 'ᱠᱩᱠᱞᱤ'],
      ['जवाब', 'ᱛᱮᱞᱟ'],
      ['उत्तर', 'ᱛᱮᱞᱟ'],
      ['परीक्षा', 'ᱵᱤᱱᱤᱰ'],
      ['गिनती', 'ᱞᱮᱠᱷᱟ'],
      ['संख्या', 'ᱞᱮᱠᱷᱟ'],
      ['अंक', 'ᱮᱞ'],
      ['जोड़', 'ᱡᱩᱲᱟᱹᱣ'],
      ['घटाव', 'ᱵᱷᱮᱜᱟᱨ'],
      ['गुणा', 'ᱜᱟᱵᱟᱬ'],
      ['भाग', 'ᱦᱟᱹᱴᱤᱧ'],
      ['गणित', 'ᱞᱮᱠᱷᱟ'],
      ['विज्ञान', 'ᱥᱟᱬᱮᱥ'],
      ['भूगोल', 'ᱚᱛᱱᱚᱜ'],
      ['इतिहास', 'ᱱᱟᱜᱟᱢ'],
      ['चित्र', 'ᱪᱤᱛᱟᱹᱨ'],
      ['रंग', 'ᱨᱚᱝ'],
      ['गृहकार्य', 'ᱚᱲᱟᱜ ᱠᱟᱹᱢᱤ'],
      ['होमवर्क', 'ᱚᱲᱟᱜ ᱠᱟᱹᱢᱤ'],
      ['प्रार्थना', 'ᱱᱮᱦᱚᱸᱨ'],
      ['छुट्टी', 'ᱪᱷᱩᱴᱤ'],

      // Colors
      ['लाल', 'ᱟᱨᱟᱜ'],
      ['हरा', 'ᱦᱟᱹᱨᱭᱟᱹᱲ'],
      ['नीला', 'ᱞᱤᱞ'],
      ['पीला', 'ᱥᱟᱥᱟᱝ'],
      ['सफेद', 'ᱯᱩᱸᱰ'],
      ['सफ़ेद', 'ᱯᱩᱸᱰ'],
      ['काला', 'ᱦᱮᱸᱫᱮ'],
      ['भूरा', 'ᱠᱷᱟᱹᱭᱨᱟ'],

      // Family & People
      ['माता', 'ᱟᱭᱳ'],
      ['माँ', 'ᱟᱭᱳ'],
      ['पिता', 'ᱵᱟᱵᱟ'],
      ['पिताजी', 'ᱵᱟᱵᱟ'],
      ['बापू', 'ᱵᱟᱵᱟ'],
      ['भाई', 'ᱵᱚᱭᱦᱟ'],
      ['बहन', 'ᱢᱤᱥᱤ'],
      ['बड़ा भाई', 'ᱫᱟᱫᱟ'],
      ['छोटा भाई', 'ᱵᱚᱠᱚᱧ'],
      ['बड़ी बहन', 'ᱫᱟᱹᱭ'],
      ['छोटी बहन', 'ᱵᱚᱠᱚᱧ ᱠᱩᱲᱤ'],
      ['दादा', 'ᱜᱚᱲᱚᱢ ᱦᱟᱲᱟᱢ'],
      ['दादी', 'ᱜᱚᱲᱚᱢ ᱵᱩᱰᱷᱤ'],
      ['दोस्त', 'ᱜᱟᱛᱮ'],
      ['मित्र', 'ᱜᱟᱛᱮ'],
      ['साथी', 'ᱜᱟᱛᱮ'],
      ['लोग', 'ᱦᱚᱲ'],
      ['आदमी', 'ᱦᱮᱨᱮᱞ'],
      ['पुरुष', 'ᱦᱮᱨᱮᱞ'],
      ['महिला', 'ᱛᱤᱨᱞᱟᱹ'],
      ['स्त्री', 'ᱛᱤᱨᱞᱟᱹ'],
      ['लड़का', 'ᱠᱚᱲᱟ'],
      ['लड़के', 'ᱠᱚᱲᱟᱠᱚ'],
      ['लड़की', 'ᱠᱩᱲᱤ'],
      ['लड़कियां', 'ᱠᱩᱲᱤᱠᱚ'],
      ['परिवार', 'ᱜᱷᱟᱨᱚᱸᱡᱽ'],

      // Nature & Environment
      ['पौधा', 'ᱫᱟᱨᱮ'],
      ['पत्ता', 'ᱥᱟᱠᱟᱢ'],
      ['पत्ते', 'ᱥᱟᱠᱟᱢᱠᱚ'],
      ['फल', 'ᱡᱚ'],
      ['फूल', 'ᱵᱟᱦᱟ'],
      ['जड़', 'ᱨᱮᱦᱮᱫ'],
      ['घास', 'ᱜᱷᱟᱥ'],
      ['सूरज', 'ᱥᱤᱸᱜᱤ'],
      ['सूर्य', 'ᱥᱤᱸᱜᱤ'],
      ['धूप', 'ᱥᱤᱛᱩᱝ'],
      ['चाँद', 'ᱪᱟᱸᱫᱚ'],
      ['चंद्रमा', 'ᱪᱟᱸᱫᱚ'],
      ['तारे', 'ᱤᱯᱤᱞᱠᱚ'],
      ['तारा', 'ᱤᱯᱤᱞ'],
      ['आसमान', 'ᱥᱮᱨᱢᱟ'],
      ['आकाश', 'ᱥᱮᱨᱢᱟ'],
      ['बादल', 'ᱨᱤᱢᱤᱞ'],
      ['बारिश', 'ᱫᱟᱜ'],
      ['हवा', 'ᱦᱚᱭ'],
      ['आग', 'ᱥᱮᱸᱜᱮᱞ'],
      ['मिट्टी', 'ᱦᱟᱥᱟ'],
      ['पत्थर', 'ᱫᱷᱤᱨᱤ'],
      ['नदी', 'ᱜᱟᱰᱟ'],
      ['तालाब', 'ᱯᱩᱠᱷᱨᱤ'],
      ['पहाड़', 'ᱵᱩᱨᱩ'],
      ['रास्ता', 'ᱦᱚᱨ'],
      ['सड़क', 'ᱦᱚᱨ'],

      // Animals & Birds
      ['पक्षी', 'ᱪᱮᱬᱮ'],
      ['चिड़िया', 'ᱪᱮᱬᱮ'],
      ['जानवर', 'ᱡᱤᱭᱟᱹᱞᱤ'],
      ['गाय', 'ᱜᱟᱹᱭ'],
      ['बैल', 'ᱰᱟᱝᱜᱽᱨᱟ'],
      ['बकरी', 'ᱢᱮᱨᱚᱢ'],
      ['कुत्ता', 'ᱥᱮᱛᱟ'],
      ['बिल्ली', 'ᱯᱩᱥᱤ'],
      ['मछली', 'ᱦᱟᱹᱠᱩ'],
      ['मुर्गी', 'ᱥᱤᱢ'],
      ['सांप', 'ᱵᱤᱧ'],
      ['हाथी', 'ᱦᱟᱹᱛᱤ'],
      ['बाघ', 'ᱛᱟᱹᱨᱩᱵ'],
      ['शेर', 'ᱠᱩᱞ'],
      ['घोड़ा', 'ᱥᱟᱫᱚᱢ'],

      // Body Parts
      ['आँख', 'ᱢᱮᱫ'],
      ['आंख', 'ᱢᱮᱫ'],
      ['आँखें', 'ᱢᱮᱫᱠᱚ'],
      ['कान', 'ᱞᱩᱛᱩᱨ'],
      ['नाक', 'ᱢᱩᱸ'],
      ['मुँह', 'ᱢᱚᱪᱟ'],
      ['मुंह', 'ᱢᱚᱪᱟ'],
      ['हाथ', 'ᱛᱤ'],
      ['पैर', 'ᱡᱟᱝᱜᱟ'],
      ['सिर', 'ᱵᱚᱦᱚᱜ'],
      ['सर', 'ᱵᱚᱦᱚᱜ'],
      ['बाल', 'ᱩᱵ'],
      ['दाँत', 'ᱰᱟᱴᱟ'],
      ['दांत', 'ᱰᱟᱴᱟ'],
      ['जीभ', 'ᱟᱞᱟᱝ'],
      ['पेट', 'ᱞᱟᱹᱭᱤᱝ'],
      ['पीठ', 'ᱫᱮᱭᱟ'],

      // Food & Essentials
      ['भात', 'ᱫᱟᱠᱟ'],
      ['दाल', 'ᱫᱟᱹᱞ'],
      ['दही', 'ᱫᱟᱹᱦᱤ'],
      ['चाय', 'ᱪᱟ'],
      ['नमक', 'ᱵᱩᱞᱩᱝ'],
      ['मीठा', 'ᱦᱮᱲᱮᱢ'],
      ['तीखा', 'ᱦᱟᱫ'],
      ['भूख', 'ᱨᱮᱸᱜᱮᱡ'],
      ['प्यास', 'ᱛᱮᱛᱟᱝ'],

      // Numbers & Quantities
      ['शून्य', 'ᱥᱩᱱ'],
      ['एक', 'ᱢᱤᱫ'],
      ['दो', 'ᱵᱟᱨ'],
      ['तीन', 'ᱯᱮ'],
      ['चार', 'ᱯᱳᱱ'],
      ['पाँच', 'ᱢᱚᱬᱮ'],
      ['पांच', 'ᱢᱚᱬᱮ'],
      ['छह', 'ᱛᱩᱨᱩᱭ'],
      ['सात', 'ᱮᱨᱟᱭ'],
      ['आठ', 'ᱤᱨᱟᱹᱞ'],
      ['नौ', 'ᱟᱨᱮ'],
      ['दस', 'ᱜᱮᱞ'],
      ['बीस', 'ᱤᱥᱤ'],
      ['सौ', 'ᱥᱟᱭ'],
      ['हज़ार', 'ᱦᱟᱡᱟᱨ'],
      ['बहुत', 'ᱟᱹᱰᱤ'],
      ['थोड़ा', 'ᱠᱟᱹᱴᱤᱡ'],
      ['कम', 'ᱠᱚᱢ'],
      ['ज्यादा', 'ᱵᱟᱹᱲᱛᱤ'],

      // Classroom Imperatives & Action Verbs
      ['खोलो', 'ᱡᱷᱤᱡᱽ ᱢᱮ'],
      ['खोलना', 'ᱡᱷᱤᱡᱽ'],
      ['बंद करो', 'ᱵᱚᱸᱫᱽ ᱢᱮ'],
      ['लिखो', 'ᱚᱞ ᱢᱮ'],
      ['पढ़ो', 'ᱯᱟᱲᱦᱟᱣ ᱢᱮ'],
      ['बोलो', 'ᱨᱚᱲ ᱢᱮ'],
      ['सुनाओ', 'ᱟᱸᱡᱚᱢ ᱢᱮ'],
      ['देखो', 'ᱧᱮᱞ ᱢᱮ'],
      ['दिखाओ', 'ᱩᱫᱩᱜ ᱢᱮ'],
      ['बताओ', 'ᱞᱟᱹᱭ ᱢᱮ'],
      ['पूछो', 'ᱠᱩᱞᱤ ᱢᱮ'],
      ['बैठो', 'ᱫᱩᱲᱩᱵ ᱢᱮ'],
      ['उठो', 'ᱵᱮᱨᱮᱫ ᱢᱮ'],
      ['खड़े हो', 'ᱛᱤᱸᱜᱩᱱ ᱢᱮ'],
      ['सोओ', 'ᱡᱟᱹᱯᱤᱫ ᱢᱮ'],
      ['जागो', 'ᱵᱮᱨᱮᱫ ᱢᱮ'],
      ['खेलो', 'ᱮᱱᱮᱡ ᱢᱮ'],
      ['गाओ', 'ᱥᱮᱨᱮᱧ ᱢᱮ'],
      ['नाचो', 'ᱮᱱᱮᱡ ᱢᱮ'],
      ['हँसो', 'ᱞᱟᱸᱫᱟᱭ ᱢᱮ'],
      ['हंसो', 'ᱞᱟᱸᱫᱟᱭ ᱢᱮ'],
      ['रोओ', 'ᱨᱟᱜ ᱢᱮ'],
      ['दौड़ो', 'ᱫᱟᱹᱲ ᱢᱮ'],
      ['चलो', 'ᱫᱮᱞᱟ'],
      ['रुको', 'ᱛᱤᱸᱜᱩᱱ ᱢᱮ'],
      ['रखो', 'ᱫᱚᱦᱚᱭ ᱢᱮ'],
      ['लाओ', 'ᱟᱹᱜᱩᱭ ᱢᱮ'],
      ['ले जाओ', 'ᱤᱫᱤᱭ ᱢᱮ'],
      ['दो', 'ᱮᱢ ᱢᱮ'],
      ['लो', 'ᱦᱟᱛᱟᱣ ᱢᱮ'],
      ['याद रखो', 'ᱩᱭᱦᱟᱹᱨ ᱫᱚᱦᱚᱭ ᱢᱮ'],
      ['याद करो', 'ᱩᱭᱦᱟᱹᱨ ᱢᱮ'],
    ];
    for (const [h, s] of commonClassroomPairs) {
      if (!this.hinToSatDict.has(h)) {
        this.hinToSatDict.set(h, s);
      }
    }

    // Sort compound phrases by length descending so longest specific phrases match first
    this.sortedCompoundPhrases = [...this.compoundPhrases].sort((a, b) => b[0].length - a[0].length);
  }

  async translate(
    text: string,
    sourceLang: 'hin_Deva' | 'sat_Olck',
    targetLang: 'hin_Deva' | 'sat_Olck',
    options?: TranslationOptions
  ): Promise<TranslationResult> {
    const t0 = Date.now();
    const clean = text.trim();
    if (!clean) {
      return {
        sourceText: text,
        translatedText: '',
        sourceLang,
        targetLang,
        inferenceTimeMs: 0,
        engineUsed: 'fln_verified_lexicon',
      };
    }

    const lookupKey = clean.toLowerCase();

    // ---------------------------------------------------------------
    // 1. Hindi -> Santali Ol Chiki Translation
    // ---------------------------------------------------------------
    if (sourceLang === 'hin_Deva' && targetLang === 'sat_Olck') {
      // 1A. Exact match in FLN Pedagogical Corpus (Ashraf01k/vernacular-pedagogy-santhali)
      if (this.flnHinToSat.has(lookupKey)) {
        const trans = this.flnHinToSat.get(lookupKey)!;
        console.log('[JANBHASHA][NMT] Exact FLN match:', clean, '->', trans);
        return {
          sourceText: clean,
          translatedText: trans,
          romanText: olChikiToRoman(trans),
          sourceLang,
          targetLang,
          inferenceTimeMs: Date.now() - t0,
          engineUsed: 'fln_verified_lexicon',
        };
      }

      // 1B. Exact dictionary match (AdiBhasha)
      if (this.hinToSatDict.has(lookupKey)) {
        const trans = this.hinToSatDict.get(lookupKey)!;
        console.log('[JANBHASHA][NMT] Exact dictionary match:', clean, '->', trans);
        return {
          sourceText: clean,
          translatedText: trans,
          romanText: olChikiToRoman(trans),
          sourceLang,
          targetLang,
          inferenceTimeMs: Date.now() - t0,
          engineUsed: 'adibhasha_lexicon',
        };
      }

      // 1C. Attempt Native IndicTrans2 JSI Inference if available
      try {
        const g = global as unknown as { __janbhasha?: any };
        if (g.__janbhasha && typeof g.__janbhasha.translate === 'function') {
          const res = await g.__janbhasha.translate(clean, 'hin', 'Deva', 'sat', 'Olck');
          if (res && res.translatedText) {
            console.log('[JANBHASHA][NMT] Native IndicTrans2 inference:', clean, '->', res.translatedText);
            return {
              sourceText: clean,
              translatedText: res.translatedText,
              romanText: olChikiToRoman(res.translatedText),
              sourceLang,
              targetLang,
              inferenceTimeMs: Date.now() - t0,
              engineUsed: 'indictrans2_int8',
            };
          }
        }
      } catch (nativeErr) {
        // Fall back gracefully to lexicon decomposition
      }

      // 1D. Subword & multi-token compound lookup
      let workingText = clean;
      for (const [phrase, sat] of this.sortedCompoundPhrases) {
        const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const regex = new RegExp(`(^|\\s)${escaped}($|\\s|[,?.!|।])`, 'gi');
        workingText = workingText.replace(regex, (match, prefix, suffix) => {
          return `${prefix}${sat}${suffix}`;
        });
      }

      const words = workingText.trim().split(/\s+/);
      let hitCount = 0;
      const translatedWords = words.map((w) => {
        // If already translated into Ol Chiki by compound phrase match, preserve as-is
        if (/[\u1C50-\u1C7F]/.test(w)) {
          hitCount++;
          return w;
        }

        const punctuation = w.match(/[,?.!|।]+$/)?.[0] || '';
        const bareWord = w.replace(/[,?.!|।]+$/, '').toLowerCase();
        
        // 1. Check FLN verified pedagogical terms first
        if (this.flnHinToSat.has(bareWord)) {
          hitCount++;
          return this.flnHinToSat.get(bareWord)! + (punctuation === '।' ? '᱾' : punctuation);
        }

        // 2. Check core dictionary
        if (this.hinToSatDict.has(bareWord)) {
          hitCount++;
          return this.hinToSatDict.get(bareWord)! + (punctuation === '।' ? '᱾' : punctuation);
        }

        // 3. Morphological plural stemming for '-ों' (e.g. पेड़ों -> dareko, किताबों -> potobko)
        if (bareWord.endsWith('ों') && bareWord.length > 2) {
          const stemDirect = bareWord.slice(0, -2);
          const stemA = stemDirect + 'ा';
          const stemI = stemDirect + 'ी';
          const found = this.hinToSatDict.get(stemDirect) || this.hinToSatDict.get(stemA) || this.hinToSatDict.get(stemI);
          if (found) {
            hitCount++;
            return found + 'ᱠᱚ' + (punctuation === '।' ? '᱾' : punctuation);
          }
        }

        // 4. Morphological plural stemming for '-ें' or '-एं' (e.g. किताबें -> potobko, कक्षाएं -> chanacko)
        if ((bareWord.endsWith('ें') || bareWord.endsWith('एं')) && bareWord.length > 2) {
          const stemDirect = bareWord.endsWith('एं') ? bareWord.slice(0, -2) : bareWord.slice(0, -2);
          const stemA = stemDirect + 'ा';
          const found = this.hinToSatDict.get(stemDirect) || this.hinToSatDict.get(stemA);
          if (found) {
            hitCount++;
            return found + 'ᱠᱚ' + (punctuation === '।' ? '᱾' : punctuation);
          }
        }

        // 5. Morphological imperative verb stemming for '-ो' (e.g. पढ़ो -> paṛhaw me, लिखो -> ol me)
        if (bareWord.endsWith('ो') && bareWord.length > 2) {
          const stemVerb = bareWord.slice(0, -1);
          const stemNa = stemVerb + 'ना';
          const found = this.hinToSatDict.get(stemNa) || this.hinToSatDict.get(stemVerb);
          if (found) {
            hitCount++;
            return found + ' ᱢᱮ' + (punctuation === '।' ? '᱾' : punctuation);
          }
        }

        // 6. Direct numeral conversion (e.g. 1..9 or ०..९ to Ol Chiki digits ᱐..᱙)
        const digitMap: Record<string, string> = {
          '0': '᱐', '1': '᱑', '2': '᱒', '3': '᱓', '4': '᱔',
          '5': '᱕', '6': '᱖', '7': '᱗', '8': '᱘', '9': '᱙',
          '०': '᱐', '१': '᱑', '२': '᱒', '३': '᱓', '४': '᱔',
          '५': '᱕', '६': '᱖', '७': '᱗', '८': '᱘', '९': '᱙',
        };
        if (/^[0-9०-९]+$/.test(bareWord)) {
          const converted = bareWord.split('').map(d => digitMap[d] || d).join('');
          hitCount++;
          return converted + (punctuation === '।' ? '᱾' : punctuation);
        }

        // 7. Unmatched words: transliterate Devanagari phonetically to Ol Chiki
        // so VITS TTS model can speak in authentic Ol Chiki phonemes
        if (/[\u0900-\u097F]/.test(bareWord)) {
          return devaToOlChiki(bareWord) + (punctuation === '।' ? '᱾' : punctuation);
        }
        return w;
      });

      const translated = translatedWords.join(' ');
      console.log('[JANBHASHA][NMT] Decomposed translation:', clean, '->', translated);
      return {
        sourceText: clean,
        translatedText: translated,
        romanText: olChikiToRoman(translated),
        sourceLang,
        targetLang,
        inferenceTimeMs: Date.now() - t0,
        engineUsed: hitCount > 0 ? 'fln_verified_lexicon' : 'offline_hybrid_lexicon',
      };
    } else {
      // ---------------------------------------------------------------
      // 2. Santali Ol Chiki -> Hindi Translation
      // (Honest status: Lexicon lookup; neural sat->hin pending in bucket)
      // ---------------------------------------------------------------
      if (this.flnSatToHin.has(clean)) {
        const trans = this.flnSatToHin.get(clean)!;
        return {
          sourceText: clean,
          translatedText: trans,
          sourceLang,
          targetLang,
          inferenceTimeMs: Date.now() - t0,
          engineUsed: 'fln_verified_lexicon',
        };
      }

      if (this.satToHinDict.has(clean)) {
        const trans = this.satToHinDict.get(clean)!;
        return {
          sourceText: clean,
          translatedText: trans,
          sourceLang,
          targetLang,
          inferenceTimeMs: Date.now() - t0,
          engineUsed: 'adibhasha_lexicon',
        };
      }

      const words = clean.split(/\s+/);
      let hitCount = 0;
      const translatedWords = words.map((w) => {
        const punctuation = w.match(/[,?.!᱾]+$/)?.[0] || '';
        const bareWord = w.replace(/[,?.!᱾]+$/, '');
        if (this.flnSatToHin.has(bareWord)) {
          hitCount++;
          return this.flnSatToHin.get(bareWord)! + (punctuation === '᱾' ? '।' : punctuation);
        }
        if (this.satToHinDict.has(bareWord)) {
          hitCount++;
          return this.satToHinDict.get(bareWord)! + (punctuation === '᱾' ? '।' : punctuation);
        }
        return bareWord + (punctuation === '᱾' ? '।' : punctuation);
      });

      return {
        sourceText: clean,
        translatedText: translatedWords.join(' '),
        sourceLang,
        targetLang,
        inferenceTimeMs: Date.now() - t0,
        engineUsed: hitCount > 0 ? 'fln_verified_lexicon' : 'adibhasha_lexicon',
      };
    }
  }
}

export const translationProvider = new TranslationProvider();
