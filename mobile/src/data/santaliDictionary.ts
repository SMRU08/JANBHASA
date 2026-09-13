/**
 * Janbhasha Offline Santali-Hindi Domain Lexicon
 * Curated from AdiBhasha parallel corpus and Bharatavani terminology.
 * Total core domain entries: 51
 */

export interface DictionaryEntry {
  id: string;
  hindi: string;
  olChiki: string;
  roman: string;
  category: 'daily' | 'education' | 'healthcare' | 'agriculture' | 'governance';
  pos: string;
  exampleHin: string;
  exampleSat: string;
}

export const SANTALI_DICTIONARY: DictionaryEntry[] = [
  {
    "id": "d1",
    "hindi": "नमस्ते",
    "olChiki": "ᱡᱚᱦᱟᱨ",
    "roman": "Johar",
    "category": "daily",
    "pos": "interjection",
    "exampleHin": "आप सभी को मेरा नमस्ते।",
    "exampleSat": "ᱟᱯᱮ ᱡᱚᱛᱚ ᱠᱚ ᱤᱧᱟᱜ ᱡᱚᱦᱟᱨ᱾"
  },
  {
    "id": "d2",
    "hindi": "आप कैसे हैं?",
    "olChiki": "ᱟᱢ ᱪᱮᱫ ᱠᱟᱱᱟ?",
    "roman": "Aam ced kana?",
    "category": "daily",
    "pos": "phrase",
    "exampleHin": "नमस्ते भाई, आप कैसे हैं?",
    "exampleSat": "ᱡᱚᱦᱟᱨ ᱵᱚᱭᱦᱟ, ᱟᱢ ᱪᱮᱫ ᱠᱟᱱᱟ?"
  },
  {
    "id": "d3",
    "hindi": "मैं ठीक हूँ",
    "olChiki": "ᱤᱧ ᱵᱮᱥ ᱜᱮ ᱢᱮᱱᱟᱹᱧᱟ",
    "roman": "Inj bes ge menany-a",
    "category": "daily",
    "pos": "phrase",
    "exampleHin": "चिंता मत कीजिए, मैं ठीक हूँ।",
    "exampleSat": "ᱟᱞᱚᱢ ᱪᱤᱱᱛᱟᱹᱭᱟ, ᱤᱧ ᱵᱮᱥ ᱜᱮ ᱢᱮᱱᱟᱹᱧᱟ᱾"
  },
  {
    "id": "d4",
    "hindi": "आपका नाम क्या है?",
    "olChiki": "ᱟᱢᱟᱜ ᱧᱩᱛᱩᱢ ᱪᱮᱫ?",
    "roman": "Aamag nyutum ced?",
    "category": "daily",
    "pos": "phrase",
    "exampleHin": "कृपया बताइए, आपका नाम क्या है?",
    "exampleSat": "ᱫᱟᱭᱟ ᱠᱟᱛᱮ ᱞᱟᱹᱭ ᱢᱮ, ᱟᱢᱟᱜ ᱧᱩᱛᱩᱢ ᱪᱮᱫ?"
  },
  {
    "id": "d5",
    "hindi": "मेरा नाम",
    "olChiki": "ᱤᱧᱟᱜ ᱧᱩᱛᱩᱢ",
    "roman": "Injag nyutum",
    "category": "daily",
    "pos": "noun",
    "exampleHin": "मेरा नाम रमेश है।",
    "exampleSat": "ᱤᱧᱟᱜ ᱧᱩᱛᱩᱢ ᱨᱚᱢᱮᱥ ᱠᱟᱱᱟ᱾"
  },
  {
    "id": "d6",
    "hindi": "धन्यवाद",
    "olChiki": "ᱥᱟᱨᱦᱟᱣ",
    "roman": "Sarhao",
    "category": "daily",
    "pos": "interjection",
    "exampleHin": "मदद के लिए बहुत धन्यवाद।",
    "exampleSat": "ᱜᱚᱲᱚ ᱞᱟᱹᱜᱤᱫ ᱟᱹᱰᱤ ᱥᱟᱨᱦᱟᱣ᱾"
  },
  {
    "id": "d7",
    "hindi": "हाँ",
    "olChiki": "ᱦᱮᱸ",
    "roman": "He",
    "category": "daily",
    "pos": "adverb",
    "exampleHin": "हाँ, मैं आऊँगा।",
    "exampleSat": "ᱦᱮᱸ, ᱤᱧ ᱦᱤᱡᱩᱜ-ᱟᱹᱧ᱾"
  },
  {
    "id": "d8",
    "hindi": "नहीं",
    "olChiki": "ᱵᱟᱝ",
    "roman": "Bang",
    "category": "daily",
    "pos": "adverb",
    "exampleHin": "नहीं, मुझे नहीं चाहिए।",
    "exampleSat": "ᱵᱟᱝ, ᱤᱧ ᱵᱟᱹᱧ ᱠᱷᱚᱡᱟ᱾"
  },
  {
    "id": "d9",
    "hindi": "पानी",
    "olChiki": "ᱫᱟᱜ",
    "roman": "Daag",
    "category": "daily",
    "pos": "noun",
    "exampleHin": "पीने का साफ़ पानी लाओ।",
    "exampleSat": "ᱧᱩ ᱞᱟᱹᱜᱤᱫ ᱥᱟᱯᱷᱟ ᱫᱟᱜ ᱟᱹᱜᱩᱭ ᱢᱮ᱾"
  },
  {
    "id": "d10",
    "hindi": "खाना / भात",
    "olChiki": "ᱫᱟᱠᱟ",
    "roman": "Daka",
    "category": "daily",
    "pos": "noun",
    "exampleHin": "समय पर खाना खा लो।",
    "exampleSat": "ᱚᱠᱛᱚ ᱨᱮ ᱫᱟᱠᱟ ᱡᱚᱢ ᱢᱮ᱾"
  },
  {
    "id": "d11",
    "hindi": "घर",
    "olChiki": "ᱚᱲᱟᱜ",
    "roman": "Orag",
    "category": "daily",
    "pos": "noun",
    "exampleHin": "मेरा घर पास में है।",
    "exampleSat": "ᱤᱧᱟᱜ ᱚᱲᱟᱜ ᱥᱩᱨ ᱨᱮ ᱢᱮᱱᱟᱜ-ᱟ᱾"
  },
  {
    "id": "d12",
    "hindi": "गाँव",
    "olChiki": "ᱟᱹᱛᱩ",
    "roman": "Aatu",
    "category": "daily",
    "pos": "noun",
    "exampleHin": "हमारा गाँव बहुत सुंदर है।",
    "exampleSat": "ᱟᱞᱮᱭᱟᱜ ᱟᱹᱛᱩ ᱟᱹᱰᱤ ᱪᱚᱨᱚᱠ ᱜᱮᱭᱟ᱾"
  },
  {
    "id": "d13",
    "hindi": "एक",
    "olChiki": "ᱢᱤᱫ",
    "roman": "Mid",
    "category": "daily",
    "pos": "numeral",
    "exampleHin": "एक गिलास पानी दीजिए।",
    "exampleSat": "ᱢᱤᱫ ᱜᱤᱞᱟᱥ ᱫᱟᱜ ᱮᱢᱟᱹᱧ ᱢᱮ᱾"
  },
  {
    "id": "d14",
    "hindi": "दो",
    "olChiki": "ᱵᱟᱨ",
    "roman": "Bar",
    "category": "daily",
    "pos": "numeral",
    "exampleHin": "दो बच्चे खेल रहे हैं।",
    "exampleSat": "ᱵᱟᱨ ᱜᱤᱫᱽᱨᱟᱹ ᱠᱤᱱ ᱮᱱᱮᱡ ᱠᱟᱱᱟ᱾"
  },
  {
    "id": "d15",
    "hindi": "तीन",
    "olChiki": "ᱯᱮ",
    "roman": "Pe",
    "category": "daily",
    "pos": "numeral",
    "exampleHin": "यहाँ तीन रास्ते हैं।",
    "exampleSat": "ᱱᱚᱰᱮ ᱯᱮ ᱦᱚᱨ ᱢᱮᱱᱟᱜ-ᱟ᱾"
  },
  {
    "id": "d16",
    "hindi": "चार",
    "olChiki": "ᱯᱩᱱ",
    "roman": "Pun",
    "category": "daily",
    "pos": "numeral",
    "exampleHin": "चार लोग बैठे हैं।",
    "exampleSat": "ᱯᱩᱱ ᱦᱚᱲ ᱠᱚ ᱫᱩᱲᱩᱵ ᱟᱠᱟᱱᱟ᱾"
  },
  {
    "id": "d17",
    "hindi": "पाँच",
    "olChiki": "ᱢᱚᱬᱮ",
    "roman": "More",
    "category": "daily",
    "pos": "numeral",
    "exampleHin": "पाँच रुपए दीजिए।",
    "exampleSat": "ᱢᱚᱬᱮ ᱴᱟᱠᱟ ᱮᱢᱟᱹᱧ ᱢᱮ᱾"
  },
  {
    "id": "d18",
    "hindi": "दस",
    "olChiki": "ᱜᱮᱞ",
    "roman": "Gel",
    "category": "daily",
    "pos": "numeral",
    "exampleHin": "दस मिनट प्रतीक्षा करें।",
    "exampleSat": "ᱜᱮᱞ ᱴᱤᱯᱤᱡ ᱛᱟᱺᱜᱤ ᱢᱮ᱾"
  },
  {
    "id": "e1",
    "hindi": "विद्यालय / स्कूल",
    "olChiki": "ᱤᱛᱩᱱ ᱟᱥᱲᱟ",
    "roman": "Itun Asra",
    "category": "education",
    "pos": "noun",
    "exampleHin": "बच्चे हर दिन विद्यालय जाते हैं।",
    "exampleSat": "ᱜᱤᱫᱽᱨᱟᱹ ᱫᱤᱱᱟᱹᱢ ᱤᱛᱩᱱ ᱟᱥᱲᱟ ᱠᱚ ᱥᱮᱱᱚᱜ-ᱟ᱾"
  },
  {
    "id": "e2",
    "hindi": "शिक्षक / गुरुजी",
    "olChiki": "ᱢᱟᱪᱮᱛ",
    "roman": "Macet",
    "category": "education",
    "pos": "noun",
    "exampleHin": "हमारे शिक्षक बहुत अच्छे से पढ़ाते हैं।",
    "exampleSat": "ᱟᱞᱮ ᱨᱤᱱ ᱢᱟᱪᱮᱛ ᱟᱹᱰᱤ ᱱᱟᱯᱟᱭ ᱛᱮ ᱯᱟᱲᱦᱟᱣ ᱮᱫᱟᱭ᱾"
  },
  {
    "id": "e3",
    "hindi": "किताब / पुस्तक",
    "olChiki": "ᱯᱚᱛᱚᱵ",
    "roman": "Potob",
    "category": "education",
    "pos": "noun",
    "exampleHin": "अपनी भाषा की किताब खोलो।",
    "exampleSat": "ᱟᱯᱱᱟᱨ ᱯᱟᱹᱨᱥᱤ ᱨᱮᱱᱟᱜ ᱯᱚᱛᱚᱵ ᱡᱷᱤᱡᱽ ᱢᱮ᱾"
  },
  {
    "id": "e4",
    "hindi": "कलम / पेन",
    "olChiki": "ᱠᱚᱞᱚᱢ",
    "roman": "Kalom",
    "category": "education",
    "pos": "noun",
    "exampleHin": "कलम से साफ़ लिखो।",
    "exampleSat": "ᱠᱚᱞᱚᱢ ᱛᱮ ᱥᱟᱯᱷᱟ ᱚᱞ ᱢᱮ᱾"
  },
  {
    "id": "e5",
    "hindi": "पढ़ना",
    "olChiki": "ᱯᱟᱲᱦᱟᱣ",
    "roman": "Parhao",
    "category": "education",
    "pos": "verb",
    "exampleHin": "आज हम नया पाठ पढ़ेंगे।",
    "exampleSat": "ᱛᱮᱦᱮᱧ ᱟᱵᱚ ᱱᱟᱶᱟ ᱯᱟᱴᱷ ᱵᱚᱱ ᱯᱟᱲᱦᱟᱣ-ᱟ᱾"
  },
  {
    "id": "e6",
    "hindi": "लिखना",
    "olChiki": "ᱚᱞ",
    "roman": "Ol",
    "category": "education",
    "pos": "verb",
    "exampleHin": "अपनी कॉपी में उत्तर लिखो।",
    "exampleSat": "ᱟᱯᱱᱟᱨ ᱠᱷᱟᱛᱟ ᱨᱮ ᱛᱮᱞᱟ ᱚᱞ ᱢᱮ᱾"
  },
  {
    "id": "e7",
    "hindi": "विद्यार्थी / छात्र",
    "olChiki": "ᱯᱟᱹᱴᱷᱩᱣᱟᱹ",
    "roman": "Pathua",
    "category": "education",
    "pos": "noun",
    "exampleHin": "कक्षा में सभी विद्यार्थी ध्यान दें।",
    "exampleSat": "ᱠᱞᱟᱥ ᱨᱮ ᱡᱚᱛᱚ ᱯᱟᱹᱴᱷᱩᱣᱟᱹ ᱫᱷᱮᱭᱟᱱ ᱮᱢ ᱯᱮ᱾"
  },
  {
    "id": "e8",
    "hindi": "भाषा",
    "olChiki": "ᱯᱟᱹᱨᱥᱤ",
    "roman": "Parsi",
    "category": "education",
    "pos": "noun",
    "exampleHin": "संताली हमारी मातृभाषा है।",
    "exampleSat": "ᱥᱟᱱᱛᱟᱲᱤ ᱫᱚ ᱟᱵᱚᱣᱟᱜ ᱡᱟᱱᱟᱢ ᱯᱟᱹᱨᱥᱤ ᱠᱟᱱᱟ᱾"
  },
  {
    "id": "e9",
    "hindi": "अक्षर / लिपि",
    "olChiki": "ᱪᱤᱠᱤ",
    "roman": "Chiki",
    "category": "education",
    "pos": "noun",
    "exampleHin": "ओल चिकी संताली की लिपि है।",
    "exampleSat": "ᱚᱞ ᱪᱤᱠᱤ ᱫᱚ ᱥᱟᱱᱛᱟᱲᱤ ᱨᱮᱱᱟᱜ ᱪᱤᱠᱤ ᱠᱟᱱᱟ᱾"
  },
  {
    "id": "e10",
    "hindi": "कक्षा / क्लास",
    "olChiki": "ᱪᱟᱱᱟᱪ",
    "roman": "Canac",
    "category": "education",
    "pos": "noun",
    "exampleHin": "तीसरी कक्षा के बच्चे बाहर आएं।",
    "exampleSat": "ᱯᱮ ᱪᱟᱱᱟᱪ ᱨᱤᱱ ᱜᱤᱫᱽᱨᱟᱹ ᱵᱟᱦᱨᱮ ᱦᱤᱡᱩᱜ ᱯᱮ᱾"
  },
  {
    "id": "e11",
    "hindi": "परीक्षा",
    "olChiki": "ᱵᱤᱰᱟᱹᱣ",
    "roman": "Bidau",
    "category": "education",
    "pos": "noun",
    "exampleHin": "कल गणित की परीक्षा है।",
    "exampleSat": "ᱜᱟᱯᱟ ᱦᱤᱥᱟᱹᱵᱽ ᱨᱮᱱᱟᱜ ᱵᱤᱰᱟᱹᱣ ᱢᱮᱱᱟᱜ-ᱟ᱾"
  },
  {
    "id": "h1",
    "hindi": "चिकित्सक / डॉक्टर",
    "olChiki": "ᱰᱟᱠᱛᱚᱨ",
    "roman": "Daktor",
    "category": "healthcare",
    "pos": "noun",
    "exampleHin": "डॉक्टर साहब को दिखाओ।",
    "exampleSat": "ᱰᱟᱠᱛᱚᱨ ᱜᱚᱢᱠᱮ ᱩᱫᱩᱜ ᱟᱭ ᱢᱮ᱾"
  },
  {
    "id": "h2",
    "hindi": "अस्पताल",
    "olChiki": "ᱦᱟᱥᱯᱟᱛᱟᱞ",
    "roman": "Haspatal",
    "category": "healthcare",
    "pos": "noun",
    "exampleHin": "मरीज़ को अस्पताल ले जाओ।",
    "exampleSat": "ᱨᱩᱜᱤ ᱦᱟᱥᱯᱟᱛᱟᱞ ᱤᱫᱤ ᱮ ᱢᱮ᱾"
  },
  {
    "id": "h3",
    "hindi": "दवा / औषधि",
    "olChiki": "ᱨᱟᱱ",
    "roman": "Ran",
    "category": "healthcare",
    "pos": "noun",
    "exampleHin": "यह दवा दिन में दो बार लो।",
    "exampleSat": "ᱱᱚᱶᱟ ᱨᱟᱱ ᱫᱤᱱ ᱨᱮ ᱵᱟᱨ ᱫᱷᱟᱣ ᱡᱚᱢ ᱢᱮ᱾"
  },
  {
    "id": "h4",
    "hindi": "बुखार",
    "olChiki": "ᱨᱩᱣᱟᱹ",
    "roman": "Rua",
    "category": "healthcare",
    "pos": "noun",
    "exampleHin": "उसे तेज़ बुखार है।",
    "exampleSat": "ᱩᱱᱤ ᱫᱚ ᱟᱹᱰᱤ ᱨᱩᱣᱟᱹ ᱮ ᱧᱟᱢ ᱟᱠᱟᱫᱮᱭᱟ᱾"
  },
  {
    "id": "h5",
    "hindi": "खाँसी",
    "olChiki": "ᱠᱷᱚᱜ",
    "roman": "Khog",
    "category": "healthcare",
    "pos": "noun",
    "exampleHin": "खाँसी के लिए गरम पानी पियो।",
    "exampleSat": "ᱠᱷᱚᱜ ᱞᱟᱹᱜᱤᱫ ᱞᱚᱞᱚ ᱫᱟᱜ ᱧᱩᱭ ᱢᱮ᱾"
  },
  {
    "id": "h6",
    "hindi": "दर्द / पीड़ा",
    "olChiki": "ᱦᱟᱹᱥᱩ",
    "roman": "Hasu",
    "category": "healthcare",
    "pos": "noun",
    "exampleHin": "सिर में बहुत दर्द है।",
    "exampleSat": "ᱵᱚᱦᱚᱜ ᱟᱹᱰᱤ ᱦᱟᱹᱥᱩ ᱠᱟᱱᱟ᱾"
  },
  {
    "id": "h7",
    "hindi": "स्वास्थ्य",
    "olChiki": "ᱦᱚᱲᱢᱚ",
    "roman": "Hormo",
    "category": "healthcare",
    "pos": "noun",
    "exampleHin": "स्वास्थ्य ही सबसे बड़ा धन है।",
    "exampleSat": "ᱦᱚᱲᱢᱚ ᱱᱟᱯᱟᱭ ᱜᱮ ᱡᱚᱛᱚ ᱠᱷᱚᱱ ᱢᱟᱨᱟᱝ ᱫᱷᱚᱱ ᱠᱟᱱᱟ᱾"
  },
  {
    "id": "h8",
    "hindi": "साफ़ / स्वच्छ",
    "olChiki": "ᱥᱟᱯᱷᱟ",
    "roman": "Sapha",
    "category": "healthcare",
    "pos": "adjective",
    "exampleHin": "हाथ साफ़ करके भोजन करें।",
    "exampleSat": "ᱛᱤ ᱥᱟᱯᱷᱟ ᱠᱟᱛᱮ ᱫᱟᱠᱟ ᱡᱚᱢ ᱢᱮ᱾"
  },
  {
    "id": "a1",
    "hindi": "किसान",
    "olChiki": "ᱪᱟᱹᱥᱤ",
    "roman": "Casi",
    "category": "agriculture",
    "pos": "noun",
    "exampleHin": "किसान खेत में काम कर रहा है।",
    "exampleSat": "ᱪᱟᱹᱥᱤ ᱠᱷᱮᱛ ᱨᱮ ᱠᱟᱹᱢᱤ ᱠᱟᱱᱟᱭ᱾"
  },
  {
    "id": "a2",
    "hindi": "खेत",
    "olChiki": "ᱠᱷᱮᱛ / ᱵᱟᱹᱫᱽ",
    "roman": "Khet / Bad",
    "category": "agriculture",
    "pos": "noun",
    "exampleHin": "खेत में धान की फसल अच्छी है।",
    "exampleSat": "ᱵᱟᱹᱫᱽ ᱨᱮ ᱦᱩᱲᱩ ᱟᱹᱰᱤ ᱱᱟᱯᱟᱭ ᱦᱩᱭ ᱟᱠᱟᱱᱟ᱾"
  },
  {
    "id": "a3",
    "hindi": "धान / चावल",
    "olChiki": "ᱦᱩᱲᱩ / ᱪᱟᱣᱞᱮ",
    "roman": "Huru / Cawle",
    "category": "agriculture",
    "pos": "noun",
    "exampleHin": "धान की कटाई शुरू हो गई।",
    "exampleSat": "ᱦᱩᱲᱩ ᱜᱮᱫ ᱮᱦᱚᱵ ᱮᱱᱟ᱾"
  },
  {
    "id": "a4",
    "hindi": "बारिश / वर्षा",
    "olChiki": "ᱫᱟᱜ-ᱡᱟᱹᱲᱤ",
    "roman": "Dag-jari",
    "category": "agriculture",
    "pos": "noun",
    "exampleHin": "आज अच्छी बारिश होगी।",
    "exampleSat": "ᱛᱮᱦᱮᱧ ᱱᱟᱯᱟᱭ ᱫᱟᱜ-ᱡᱟᱹᱲᱤ ᱦᱩᱭᱩᱜ-ᱟ᱾"
  },
  {
    "id": "a5",
    "hindi": "बीज",
    "olChiki": "ᱡᱟᱝ",
    "roman": "Jang",
    "category": "agriculture",
    "pos": "noun",
    "exampleHin": "उन्नत बीज बोने से उपज बढ़ेगी।",
    "exampleSat": "ᱱᱟᱯᱟᱭ ᱡᱟᱝ ᱮᱨ ᱞᱮᱠᱷᱟᱱ ᱟᱨᱡᱟᱣ ᱰᱷᱮᱨᱚᱜ-ᱟ᱾"
  },
  {
    "id": "a6",
    "hindi": "मिट्टी",
    "olChiki": "ᱦᱟᱥᱟ",
    "roman": "Hasa",
    "category": "agriculture",
    "pos": "noun",
    "exampleHin": "काली मिट्टी खेती के लिए अच्छी होती है।",
    "exampleSat": "ᱦᱮᱸᱫᱮ ᱦᱟᱥᱟ ᱪᱟᱥ ᱞᱟᱹᱜᱤᱫ ᱱᱟᱯᱟᱭ ᱜᱮᱭᱟ᱾"
  },
  {
    "id": "a7",
    "hindi": "हल / जोतना",
    "olChiki": "ᱱᱟᱦᱮᱞ / ᱥᱤ",
    "roman": "Nahel / Si",
    "category": "agriculture",
    "pos": "noun/verb",
    "exampleHin": "बैलों से खेत जोत रहे हैं।",
    "exampleSat": "ᱰᱟᱝᱜᱽᱨᱟ ᱛᱮ ᱵᱟᱹᱫᱽ ᱠᱚ ᱥᱤ ᱮᱫᱟ᱾"
  },
  {
    "id": "a8",
    "hindi": "जंगल / वन",
    "olChiki": "ᱵᱤᱨ",
    "roman": "Bir",
    "category": "agriculture",
    "pos": "noun",
    "exampleHin": "जंगल की रक्षा हम सबकी ज़िम्मेदारी है।",
    "exampleSat": "ᱵᱤᱨ ᱨᱩᱠᱷᱤᱭᱟᱹ ᱫᱚ ᱟᱵᱚ ᱡᱚᱛᱚ ᱦᱚᱲᱟᱜ ᱠᱟᱹᱢᱤ ᱠᱟᱱᱟ᱾"
  },
  {
    "id": "g1",
    "hindi": "पंचायत",
    "olChiki": "ᱯᱚᱧᱪᱟᱭᱮᱛ",
    "roman": "Poncayet",
    "category": "governance",
    "pos": "noun",
    "exampleHin": "पंचायत भवन में बैठक है।",
    "exampleSat": "ᱯᱚᱧᱪᱟᱭᱮᱛ ᱚᱲᱟᱜ ᱨᱮ ᱫᱩᱯᱲᱩᱵ ᱢᱮᱱᱟᱜ-ᱟ᱾"
  },
  {
    "id": "g2",
    "hindi": "मुखिया / प्रधान",
    "olChiki": "ᱢᱟᱹᱧᱡᱷᱤ ᱦᱟᱲᱟᱢ",
    "roman": "Manjhi Haram",
    "category": "governance",
    "pos": "noun",
    "exampleHin": "गाँव के मांझी हड़ाम से सलाह लें।",
    "exampleSat": "ᱟᱹᱛᱩ ᱨᱤᱱ ᱢᱟᱹᱧᱡᱷᱤ ᱦᱟᱲᱟᱢ ᱴᱷᱮᱱ ᱠᱷᱚᱱ ᱫᱤᱥᱟᱹ ᱦᱟᱛᱟᱣ ᱢᱮ᱾"
  },
  {
    "id": "g3",
    "hindi": "योजना",
    "olChiki": "ᱡᱚᱡᱚᱱᱟ",
    "roman": "Jojona",
    "category": "governance",
    "pos": "noun",
    "exampleHin": "सरकारी योजना का लाभ उठाएं।",
    "exampleSat": "ᱥᱚᱨᱠᱟᱨᱤ ᱡᱚᱡᱚᱱᱟ ᱨᱮᱱᱟᱜ ᱞᱟᱵᱷ ᱦᱟᱛᱟᱣ ᱯᱮ᱾"
  },
  {
    "id": "g4",
    "hindi": "राशन कार्ड",
    "olChiki": "ᱨᱟᱥᱚᱱ ᱠᱟᱨᱰ",
    "roman": "Rason Kard",
    "category": "governance",
    "pos": "noun",
    "exampleHin": "राशन कार्ड से अनाज मिलता है।",
    "exampleSat": "ᱨᱟᱥᱚᱱ ᱠᱟᱨᱰ ᱛᱮ ᱫᱟᱱᱟ ᱧᱟᱢᱚᱜ-ᱟ᱾"
  },
  {
    "id": "g5",
    "hindi": "अधिकार",
    "olChiki": "ᱦᱚᱠ",
    "roman": "Hok",
    "category": "governance",
    "pos": "noun",
    "exampleHin": "शिक्षा हर बच्चे का अधिकार है।",
    "exampleSat": "ᱥᱤᱠᱷᱱᱟᱹᱛ ᱫᱚ ᱡᱚᱛᱚ ᱜᱤᱫᱽᱨᱟᱹᱣᱟᱜ ᱦᱚᱠ ᱠᱟᱱᱟ᱾"
  },
  {
    "id": "g6",
    "hindi": "नियम / क़ानून",
    "olChiki": "ᱟᱹᱨᱤ",
    "roman": "Aari",
    "category": "governance",
    "pos": "noun",
    "exampleHin": "गाँव के नियमों का पालन करें।",
    "exampleSat": "ᱟᱹᱛᱩ ᱨᱮᱱᱟᱜ ᱟᱹᱨᱤ ᱢᱟᱱᱟᱣ ᱢᱮ᱾"
  },
  {
      "id": "p1",
      "hindi": "मैं / मुझे",
      "olChiki": "ᱤᱧ",
      "roman": "Inj",
      "category": "daily",
      "pos": "pronoun",
      "exampleHin": "मैं स्कूल जाता हूँ।",
      "exampleSat": "ᱤᱧ ᱤᱛᱩᱱ ᱟᱥᱲᱟᱧ ᱥᱮᱱᱚᱜ-ᱟ᱾"
  },
  {
      "id": "p2",
      "hindi": "मेरा / मेरी / मेरे",
      "olChiki": "ᱤᱧᱟᱜ",
      "roman": "Injag",
      "category": "daily",
      "pos": "pronoun",
      "exampleHin": "यह मेरा घर है।",
      "exampleSat": "ᱱᱚᱣᱟ ᱫᱚ ᱤᱧᱟᱜ ᱚᱲᱟᱜ ᱠᱟᱱᱟ᱾"
  },
  {
      "id": "p3",
      "hindi": "हम / हम सब / हमलोग",
      "olChiki": "ᱟᱵᱚ",
      "roman": "Abo",
      "category": "daily",
      "pos": "pronoun",
      "exampleHin": "हम सब साथ हैं।",
      "exampleSat": "ᱟᱵᱚ ᱥᱟᱱᱟᱢ ᱵᱚ ᱢᱤᱫ ᱜᱮᱭᱟ᱾"
  },
  {
      "id": "p4",
      "hindi": "हमारा / हमारी / हमारे",
      "olChiki": "ᱟᱵᱚᱣᱟᱜ",
      "roman": "Abowag",
      "category": "daily",
      "pos": "pronoun",
      "exampleHin": "यह हमारा गाँव है।",
      "exampleSat": "ᱱᱚᱣᱟ ᱫᱚ ᱟᱵᱚᱣᱟᱜ ᱟᱹᱛᱩ ᱠᱟᱱᱟ᱾"
  },
  {
      "id": "p5",
      "hindi": "तुम / आप",
      "olChiki": "ᱟᱢ",
      "roman": "Aam",
      "category": "daily",
      "pos": "pronoun",
      "exampleHin": "तुम कहाँ जा रहे हो?",
      "exampleSat": "ᱟᱢ ᱚᱠᱟᱛᱮᱢ ᱪᱟᱞᱟᱜ ᱠᱟᱱᱟ?"
  },
  {
      "id": "p6",
      "hindi": "तुम्हारा / तुम्हारी / तुम्हारे / आपका / आपकी",
      "olChiki": "ᱟᱢᱟᱜ",
      "roman": "Aamag",
      "category": "daily",
      "pos": "pronoun",
      "exampleHin": "तुम्हारा नाम क्या है?",
      "exampleSat": "ᱟᱢᱟᱜ ᱧᱩᱛᱩᱢ ᱫᱚ ᱪᱮᱫ?"
  },
  {
      "id": "p7",
      "hindi": "तुम सब / आप सब / तुमलोग",
      "olChiki": "ᱟᱯᱮ",
      "roman": "Ape",
      "category": "daily",
      "pos": "pronoun",
      "exampleHin": "आप सब बैठ जाएं।",
      "exampleSat": "ᱟᱯᱮ ᱡᱚᱛᱚ ᱫᱩᱲᱩᱵ ᱯᱮ᱾"
  },
  {
      "id": "p8",
      "hindi": "वह / उसे",
      "olChiki": "ᱩᱱᱤ",
      "roman": "Uni",
      "category": "daily",
      "pos": "pronoun",
      "exampleHin": "वह पढ़ रहा है।",
      "exampleSat": "ᱩᱱᱤ ᱯᱟᱲᱦᱟᱣᱜ ᱠᱟᱱᱟᱭ᱾"
  },
  {
      "id": "p9",
      "hindi": "उसका / उसकी / उसके",
      "olChiki": "ᱩᱱᱤᱭᱟᱜ",
      "roman": "Uniyag",
      "category": "daily",
      "pos": "pronoun",
      "exampleHin": "यह उसकी किताब है।",
      "exampleSat": "ᱱᱚᱣᱟ ᱫᱚ ᱩᱱᱤᱭᱟᱜ ᱯᱚᱛᱚᱵ ᱠᱟᱱᱟ᱾"
  },
  {
      "id": "p10",
      "hindi": "वे / उन्हें / वे लोग",
      "olChiki": "ᱩᱱᱠᱩ",
      "roman": "Unku",
      "category": "daily",
      "pos": "pronoun",
      "exampleHin": "वे खेल रहे हैं।",
      "exampleSat": "ᱩᱱᱠᱩ ᱠᱚ ᱮᱱᱮᱡ ᱠᱟᱱᱟ᱾"
  },
  {
      "id": "p11",
      "hindi": "यह / ये",
      "olChiki": "ᱱᱚᱣᱟ",
      "roman": "Noa",
      "category": "daily",
      "pos": "pronoun",
      "exampleHin": "यह बहुत अच्छा है।",
      "exampleSat": "ᱱᱚᱣᱟ ᱫᱚ ᱟᱹᱰᱤ ᱱᱟᱯᱟᱭ ᱜᱮᱭᱟ᱾"
  },
  {
      "id": "p12",
      "hindi": "वह / वो",
      "olChiki": "ᱦᱟᱱᱟ",
      "roman": "Hana",
      "category": "daily",
      "pos": "pronoun",
      "exampleHin": "वह पेड़ देखो।",
      "exampleSat": "ᱦᱟᱱᱟ ᱫᱟᱨᱮ ᱧᱮᱞ ᱢᱮ᱾"
  },
  {
      "id": "q1",
      "hindi": "क्या",
      "olChiki": "ᱪᱮᱫ",
      "roman": "Ced",
      "category": "daily",
      "pos": "question",
      "exampleHin": "यह क्या है?",
      "exampleSat": "ᱱᱚᱣᱟ ᱫᱚ ᱪᱮᱫ ᱠᱟᱱᱟ?"
  },
  {
      "id": "q2",
      "hindi": "क्यों",
      "olChiki": "ᱪᱮᱫᱟᱜ",
      "roman": "Cedag",
      "category": "daily",
      "pos": "question",
      "exampleHin": "तुम क्यों रो रहे हो?",
      "exampleSat": "ᱟᱢ ᱪᱮᱫᱟᱜ ᱮᱢ ᱨᱟᱜ ᱮᱫᱟ?"
  },
  {
      "id": "q3",
      "hindi": "कहाँ / किधर",
      "olChiki": "ᱚᱠᱟᱨᱮ",
      "roman": "Okare",
      "category": "daily",
      "pos": "question",
      "exampleHin": "स्कूल कहाँ है?",
      "exampleSat": "ᱤᱛᱩᱱ ᱟᱥᱲᱟ ᱫᱚ ᱚᱠᱟᱨᱮ ᱢᱮᱱᱟᱜ-ᱟ?"
  },
  {
      "id": "q4",
      "hindi": "कब",
      "olChiki": "ᱛᱤᱥ",
      "roman": "Tis",
      "category": "daily",
      "pos": "question",
      "exampleHin": "तुम कब आओगे?",
      "exampleSat": "ᱟᱢ ᱛᱤᱥ ᱮᱢ ᱦᱤᱡᱩᱜ-ᱟ?"
  },
  {
      "id": "q5",
      "hindi": "कौन",
      "olChiki": "ᱚᱠᱚᱭ",
      "roman": "Okoy",
      "category": "daily",
      "pos": "question",
      "exampleHin": "वहाँ कौन है?",
      "exampleSat": "ᱦᱟᱸᱰᱮ ᱫᱚ ᱚᱠᱚᱭ ᱢᱮᱱᱟᱭᱟ?"
  },
  {
      "id": "q6",
      "hindi": "कैसे / कैसा / कैसी",
      "olChiki": "ᱪᱮᱫ ᱞᱮᱠᱟ",
      "roman": "Ced leka",
      "category": "daily",
      "pos": "question",
      "exampleHin": "तुम कैसे हो?",
      "exampleSat": "ᱟᱢ ᱪᱮᱫ ᱞᱮᱠᱟ ᱢᱮᱱᱟᱢᱟ?"
  },
  {
      "id": "q7",
      "hindi": "कितना / कितने / कितनी",
      "olChiki": "ᱛᱤᱱᱟᱹᱜ",
      "roman": "Tinag",
      "category": "daily",
      "pos": "question",
      "exampleHin": "कितने बच्चे हैं?",
      "exampleSat": "ᱛᱤᱱᱟᱹᱜ ᱜᱤᱫᱽᱨᱟᱹ ᱢᱮᱱᱟᱜ ᱠᱚᱣᱟ?"
  },
  {
      "id": "t1",
      "hindi": "आज",
      "olChiki": "ᱛᱮᱦᱮᱧ",
      "roman": "Tehenj",
      "category": "daily",
      "pos": "adverb",
      "exampleHin": "आज छुट्टी है।",
      "exampleSat": "ᱛᱮᱦᱮᱧ ᱫᱚ ᱪᱷᱩᱴᱤ ᱠᱟᱱᱟ᱾"
  },
  {
      "id": "t2",
      "hindi": "कल",
      "olChiki": "ᱜᱟᱯᱟ",
      "roman": "Gapa",
      "category": "daily",
      "pos": "adverb",
      "exampleHin": "कल स्कूल आना।",
      "exampleSat": "ᱜᱟᱯᱟ ᱤᱛᱩᱱ ᱟᱥᱲᱟ ᱦᱤᱡᱩᱜ ᱢᱮ᱾"
  },
  {
      "id": "t3",
      "hindi": "अब / अभी",
      "olChiki": "ᱱᱤᱛᱚᱜ",
      "roman": "Nitog",
      "category": "daily",
      "pos": "adverb",
      "exampleHin": "अब शुरू करो।",
      "exampleSat": "ᱱᱤᱛᱚᱜ ᱮᱦᱚᱵ ᱢᱮ᱾"
  },
  {
      "id": "t4",
      "hindi": "और / तथा",
      "olChiki": "ᱟᱨ",
      "roman": "Aar",
      "category": "daily",
      "pos": "conjunction",
      "exampleHin": "तुम और मैं।",
      "exampleSat": "ᱟᱢ ᱟᱨ ᱤᱧ᱾"
  },
  {
      "id": "t5",
      "hindi": "लेकिन / परन्तु",
      "olChiki": "ᱢᱮᱱᱠᱷᱟᱱ",
      "roman": "Menkhan",
      "category": "daily",
      "pos": "conjunction",
      "exampleHin": "लेकिन उसने नहीं सुना।",
      "exampleSat": "ᱢᱮᱱᱠᱷᱟᱱ ᱩᱱᱤ ᱵᱟᱭ ᱟᱸᱡᱚᱢ ᱞᱮᱫᱟ᱾"
  },
  {
      "id": "t6",
      "hindi": "भी",
      "olChiki": "ᱦᱚᱸ",
      "roman": "Ho",
      "category": "daily",
      "pos": "particle",
      "exampleHin": "मैं भी आऊँगा।",
      "exampleSat": "ᱤᱧ ᱦᱚᱸᱧ ᱦᱤᱡᱩᱜ-ᱟ᱾"
  },
  {
      "id": "t7",
      "hindi": "बहुत / ज्यादा / ज़्यादा",
      "olChiki": "ᱟᱹᱰᱤ",
      "roman": "Adi",
      "category": "daily",
      "pos": "adverb",
      "exampleHin": "यह बहुत अच्छा है।",
      "exampleSat": "ᱱᱚᱣᱟ ᱫᱚ ᱟᱹᱰᱤ ᱱᱟᱯᱟᱭ ᱜᱮᱭᱟ᱾"
  },
  {
      "id": "t8",
      "hindi": "सब / सभी",
      "olChiki": "ᱥᱟᱱᱟᱢ",
      "roman": "Sanam",
      "category": "daily",
      "pos": "determiner",
      "exampleHin": "सब लोग सुनो।",
      "exampleSat": "ᱥᱟᱱᱟᱢ ᱦᱚᱲ ᱟᱸᱡᱚᱢ ᱯᱮ᱾"
  },
  {
      "id": "t9",
      "hindi": "के बारे में / बारे में",
      "olChiki": "ᱵᱟᱵᱚᱛ",
      "roman": "Babot",
      "category": "daily",
      "pos": "postposition",
      "exampleHin": "पेड़ों के बारे में।",
      "exampleSat": "ᱫᱟᱨᱮ ᱵᱟᱵᱚᱛ᱾"
  },
  {
      "id": "v1",
      "hindi": "सीखना / सीखेंगे / सीखो",
      "olChiki": "ᱪᱮᱫᱚᱜ",
      "roman": "Cedog",
      "category": "education",
      "pos": "verb",
      "exampleHin": "हम नया पाठ सीखेंगे।",
      "exampleSat": "ᱟᱵᱚ ᱱᱟᱶᱟ ᱯᱟᱴᱷ ᱵᱚ ᱪᱮᱫᱚᱜ-ᱟ᱾"
  },
  {
      "id": "v2",
      "hindi": "करना / करेंगे / करोगे / करो",
      "olChiki": "ᱠᱟᱹᱢᱤ",
      "roman": "Kami",
      "category": "daily",
      "pos": "verb",
      "exampleHin": "अपना काम करो।",
      "exampleSat": "ᱟᱢᱟᱜ ᱠᱟᱹᱢᱤ ᱠᱟᱹᱢᱤᱭ ᱢᱮ᱾"
  },
  {
      "id": "v3",
      "hindi": "खोलना / खोलो",
      "olChiki": "ᱡᱷᱤᱡᱽ",
      "roman": "Jhij",
      "category": "education",
      "pos": "verb",
      "exampleHin": "दरवाज़ा खोलो।",
      "exampleSat": "ᱫᱩᱣᱟᱹᱨ ᱡᱷᱤᱡᱽ ᱢᱮ᱾"
  },
  {
      "id": "v4",
      "hindi": "बंद करना / बंद करो",
      "olChiki": "ᱵᱚᱸᱫᱽ",
      "roman": "Bond",
      "category": "daily",
      "pos": "verb",
      "exampleHin": "किताब बंद करो।",
      "exampleSat": "ᱯᱚᱛᱚᱵ ᱵᱚᱸᱫᱽ ᱢᱮ᱾"
  },
  {
      "id": "v5",
      "hindi": "सुनना / सुनो",
      "olChiki": "ᱟᱸᱡᱚᱢ",
      "roman": "Anjom",
      "category": "daily",
      "pos": "verb",
      "exampleHin": "ध्यान से सुनो।",
      "exampleSat": "ᱫᱷᱮᱭᱟᱱ ᱛᱮ ᱟᱸᱡᱚᱢ ᱢᱮ᱾"
  },
  {
      "id": "v6",
      "hindi": "देखना / देखो",
      "olChiki": "ᱧᱮᱞ",
      "roman": "Nyel",
      "category": "daily",
      "pos": "verb",
      "exampleHin": "बोर्ड पर देखो।",
      "exampleSat": "ᱵᱚᱨᱰ ᱨᱮ ᱧᱮᱞ ᱢᱮ᱾"
  },
  {
      "id": "v7",
      "hindi": "बोलना / बोलो",
      "olChiki": "ᱨᱚᱲ",
      "roman": "Ror",
      "category": "daily",
      "pos": "verb",
      "exampleHin": "साफ़ बोलो।",
      "exampleSat": "ᱥᱟᱯᱷᱟ ᱨᱚᱲ ᱢᱮ᱾"
  },
  {
      "id": "v8",
      "hindi": "बैठना / बैठो / बैठिए",
      "olChiki": "ᱫᱩᱲᱩᱵ",
      "roman": "Durup",
      "category": "daily",
      "pos": "verb",
      "exampleHin": "यहाँ बैठो।",
      "exampleSat": "ᱱᱚᱰᱮ ᱫᱩᱲᱩᱵ ᱢᱮ᱾"
  },
  {
      "id": "v9",
      "hindi": "खड़े होना / खड़े हो जाओ",
      "olChiki": "ᱛᱤᱸᱜᱩᱱ",
      "roman": "Tingun",
      "category": "education",
      "pos": "verb",
      "exampleHin": "सीधे खड़े हो जाओ।",
      "exampleSat": "ᱥᱚᱡᱷᱮ ᱛᱤᱸᱜᱩᱱ ᱢᱮ᱾"
  },
  {
      "id": "v10",
      "hindi": "आना / आओ / आइए",
      "olChiki": "ᱦᱤᱡᱩᱜ",
      "roman": "Hijug",
      "category": "daily",
      "pos": "verb",
      "exampleHin": "अंदर आओ।",
      "exampleSat": "ᱵᱷᱤᱛᱨᱤ ᱦᱤᱡᱩᱜ ᱢᱮ᱾"
  },
  {
      "id": "v11",
      "hindi": "जाना / जाओ / जाइए / जा रहे हैं",
      "olChiki": "ᱪᱟᱞᱟᱜ",
      "roman": "Calag",
      "category": "daily",
      "pos": "verb",
      "exampleHin": "घर जाओ।",
      "exampleSat": "ᱚᱲᱟᱜ ᱪᱟᱞᱟᱜ ᱢᱮ᱾"
  },
  {
      "id": "v12",
      "hindi": "पीना / पियो / पीजिए",
      "olChiki": "ᱧᱩᱭ",
      "roman": "Nyuy",
      "category": "daily",
      "pos": "verb",
      "exampleHin": "पानी पियो।",
      "exampleSat": "ᱫᱟᱜ ᱧᱩᱭ ᱢᱮ᱾"
  },
  {
      "id": "v13",
      "hindi": "खाना / खाओ / खाइए",
      "olChiki": "ᱡᱚᱢ",
      "roman": "Jom",
      "category": "daily",
      "pos": "verb",
      "exampleHin": "फल खाओ।",
      "exampleSat": "ᱡᱚ ᱡᱚᱢ ᱢᱮ᱾"
  },
  {
      "id": "v14",
      "hindi": "गिनना / गिनो / गिनती",
      "olChiki": "ᱞᱮᱠᱷᱟ",
      "roman": "Lekha",
      "category": "education",
      "pos": "verb",
      "exampleHin": "उंगलियों से गिनो।",
      "exampleSat": "ᱴᱤᱯᱤᱡ ᱛᱮ ᱞᱮᱠᱷᱟᱭ ᱢᱮ᱾"
  },
  {
      "id": "v15",
      "hindi": "बताना / बताओ",
      "olChiki": "ᱞᱟᱹᱭ",
      "roman": "Lay",
      "category": "daily",
      "pos": "verb",
      "exampleHin": "उत्तर बताओ।",
      "exampleSat": "ᱛᱮᱞᱟ ᱞᱟᱹᱭ ᱢᱮ᱾"
  },
  {
      "id": "v16",
      "hindi": "पूछना / पूछो",
      "olChiki": "ᱠᱩᱞᱤ",
      "roman": "Kuli",
      "category": "daily",
      "pos": "verb",
      "exampleHin": "सवाल पूछो।",
      "exampleSat": "ᱠᱩᱠᱞᱤ ᱠᱩᱞᱤᱭ ᱢᱮ᱾"
  },
  {
      "id": "v17",
      "hindi": "समझना / समझो",
      "olChiki": "ᱵᱩᱡᱷᱟᱹᱣ",
      "roman": "Bujhau",
      "category": "education",
      "pos": "verb",
      "exampleHin": "पाठ समझो।",
      "exampleSat": "ᱯᱟᱴᱷ ᱵᱩᱡᱷᱟᱹᱣ ᱢᱮ᱾"
  },
  {
      "id": "v18",
      "hindi": "हँसना / हँसो",
      "olChiki": "ᱞᱟᱸᱫᱟ",
      "roman": "Landa",
      "category": "daily",
      "pos": "verb",
      "exampleHin": "खुशी से हँसो।",
      "exampleSat": "ᱨᱟᱹᱥᱠᱟᱹ ᱛᱮ ᱞᱟᱸᱫᱟᱭ ᱢᱮ᱾"
  },
  {
      "id": "v19",
      "hindi": "खेलना / खेलो",
      "olChiki": "ᱮᱱᱮᱡ",
      "roman": "Enej",
      "category": "daily",
      "pos": "verb",
      "exampleHin": "मैदान में खेलो।",
      "exampleSat": "ᱴᱟᱺᱰᱤ ᱨᱮ ᱮᱱᱮᱡ ᱢᱮ᱾"
  },
  {
      "id": "n1",
      "hindi": "जंगल / वन",
      "olChiki": "ᱵᱤᱨ",
      "roman": "Bir",
      "category": "daily",
      "pos": "noun",
      "exampleHin": "जंगल में बहुत सारे पेड़ हैं।",
      "exampleSat": "ᱵᱤᱨ ᱨᱮ ᱟᱹᱰᱤ ᱟᱭᱢᱟ ᱫᱟᱨᱮ ᱢᱮᱱᱟᱜ-ᱟ᱾"
  },
  {
      "id": "n2",
      "hindi": "पेड़ / पेड़ों / वृक्ष",
      "olChiki": "ᱫᱟᱨᱮ",
      "roman": "Dare",
      "category": "daily",
      "pos": "noun",
      "exampleHin": "पेड़ हमें छाया देते हैं।",
      "exampleSat": "ᱫᱟᱨᱮ ᱫᱚ ᱟᱵᱚ ᱩᱢᱩᱞ ᱮ ᱮᱢᱟᱵᱚᱱᱟ᱾"
  },
  {
      "id": "n3",
      "hindi": "पत्ता / पत्ते",
      "olChiki": "ᱥᱟᱠᱟᱢ",
      "roman": "Sakam",
      "category": "daily",
      "pos": "noun",
      "exampleHin": "पेड़ के हरे पत्ते।",
      "exampleSat": "ᱫᱟᱨᱮ ᱨᱮᱱᱟᱜ ᱦᱟᱹᱨᱭᱟᱹᱲ ᱥᱟᱠᱟᱢ᱾"
  },
  {
      "id": "n4",
      "hindi": "फूल",
      "olChiki": "ᱵᱟᱦᱟ",
      "roman": "Baha",
      "category": "daily",
      "pos": "noun",
      "exampleHin": "सुंदर लाल फूल।",
      "exampleSat": "ᱪᱚᱨᱚᱠ ᱟᱨᱟᱜ ᱵᱟᱦᱟ᱾"
  },
  {
      "id": "n5",
      "hindi": "फल",
      "olChiki": "ᱡᱚ",
      "roman": "Jo",
      "category": "daily",
      "pos": "noun",
      "exampleHin": "मीठा फल खाओ।",
      "exampleSat": "ᱦᱮᱲᱮᱢ ᱡᱚ ᱡᱚᱢ ᱢᱮ᱾"
  },
  {
      "id": "n6",
      "hindi": "नदी",
      "olChiki": "ᱜᱟᱰᱟ",
      "roman": "Gada",
      "category": "daily",
      "pos": "noun",
      "exampleHin": "नदी का पानी साफ़ है।",
      "exampleSat": "ᱜᱟᱰᱟ ᱨᱮᱱᱟᱜ ᱫᱟᱜ ᱥᱟᱯᱷᱟ ᱜᱮᱭᱟ᱾"
  },
  {
      "id": "n7",
      "hindi": "पहाड़",
      "olChiki": "ᱵᱩᱨᱩ",
      "roman": "Buru",
      "category": "daily",
      "pos": "noun",
      "exampleHin": "ऊँचा पहाड़।",
      "exampleSat": "ᱩᱥᱩᱞ ᱵᱩᱨᱩ᱾"
  },
  {
      "id": "n8",
      "hindi": "बच्चे / बच्चों / बच्चा",
      "olChiki": "ᱜᱤᱫᱽᱨᱟᱹᱠᱚ",
      "roman": "Gidrako",
      "category": "education",
      "pos": "noun",
      "exampleHin": "बच्चे स्कूल जा रहे हैं।",
      "exampleSat": "ᱜᱤᱫᱽᱨᱟᱹᱠᱚ ᱤᱛᱩᱱ ᱟᱥᱲᱟ ᱠᱚ ᱥᱮᱱᱚᱜ-ᱟ᱾"
  },
  {
      "id": "n9",
      "hindi": "दोस्त / मित्र",
      "olChiki": "ᱜᱟᱛᱮ",
      "roman": "Gate",
      "category": "daily",
      "pos": "noun",
      "exampleHin": "वह मेरा अच्छा दोस्त है।",
      "exampleSat": "ᱩᱱᱤ ᱫᱚ ᱤᱧᱤᱡ ᱵᱮᱥ ᱜᱟᱛᱮ ᱠᱟᱱᱟᱭ᱾"
  },
  {
      "id": "n10",
      "hindi": "माँ / माता",
      "olChiki": "ᱟᱭᱳ",
      "roman": "Ayo",
      "category": "daily",
      "pos": "noun",
      "exampleHin": "माँ खाना बना रही हैं।",
      "exampleSat": "ᱟᱭᱳ ᱫᱟᱠᱟᱭ ᱤᱥᱤᱱ ᱮᱫᱟ᱾"
  },
  {
      "id": "n11",
      "hindi": "पिता / बापू",
      "olChiki": "ᱵᱟᱵᱟ",
      "roman": "Baba",
      "category": "daily",
      "pos": "noun",
      "exampleHin": "पिताजी खेत में हैं।",
      "exampleSat": "ᱵᱟᱵᱟ ᱠᱷᱮᱛ ᱨᱮ ᱢᱮᱱᱟᱭᱟ᱾"
  },
  {
      "id": "n12",
      "hindi": "भाई",
      "olChiki": "ᱵᱚᱭᱦᱟ",
      "roman": "Boyha",
      "category": "daily",
      "pos": "noun",
      "exampleHin": "मेरा छोटा भाई।",
      "exampleSat": "ᱤᱧᱤᱡ ᱦᱩᱰᱤᱧ ᱵᱚᱭᱦᱟ᱾"
  },
  {
      "id": "n13",
      "hindi": "बहन",
      "olChiki": "ᱢᱤᱥᱤ",
      "roman": "Misi",
      "category": "daily",
      "pos": "noun",
      "exampleHin": "मेरी बहन पढ़ती है।",
      "exampleSat": "ᱤᱧᱤᱡ ᱢᱤᱥᱤ ᱯᱟᱲᱦᱟᱣᱜ-ᱟᱭ᱾"
  },
  {
      "id": "n14",
      "hindi": "लड़का",
      "olChiki": "ᱠᱚᱲᱟ",
      "roman": "Kora",
      "category": "daily",
      "pos": "noun",
      "exampleHin": "वह लड़का होशियार है।",
      "exampleSat": "ᱦᱟᱹᱱᱤ ᱠᱚᱲᱟ ᱫᱚ ᱞᱟᱹᱥᱠᱟᱹ ᱜᱮᱭᱟᱭ᱾"
  },
  {
      "id": "n15",
      "hindi": "लड़की",
      "olChiki": "ᱠᱩᱲᱤ",
      "roman": "Kuri",
      "category": "daily",
      "pos": "noun",
      "exampleHin": "वह लड़की गाती है।",
      "exampleSat": "ᱦᱟᱹᱱᱤ ᱠᱩᱲᱤ ᱫᱚ ᱥᱮᱨᱮᱧ ᱮᱫᱟᱭ᱾"
  },
  {
      "id": "num6",
      "hindi": "छह",
      "olChiki": "ᱛᱩᱨᱩᱭ",
      "roman": "Turuy",
      "category": "daily",
      "pos": "numeral",
      "exampleHin": "छह पेड़ हैं।",
      "exampleSat": "ᱛᱩᱨᱩᱭ ᱫᱟᱨᱮ ᱢᱮᱱᱟᱜ-ᱟ᱾"
  },
  {
      "id": "num7",
      "hindi": "सात",
      "olChiki": "ᱮᱭᱟᱭ",
      "roman": "Eyay",
      "category": "daily",
      "pos": "numeral",
      "exampleHin": "हफ़्ते में सात दिन होते हैं।",
      "exampleSat": "ᱦᱟᱯᱛᱟ ᱨᱮ ᱮᱭᱟᱭ ᱢᱟᱦᱟ ᱛᱟᱦᱮᱸᱱᱟ᱾"
  },
  {
      "id": "num8",
      "hindi": "आठ",
      "olChiki": "ᱤᱨᱟᱹᱞ",
      "roman": "Iral",
      "category": "daily",
      "pos": "numeral",
      "exampleHin": "आठ बज गए।",
      "exampleSat": "ᱤᱨᱟᱹᱞ ᱴᱟᱲᱟᱝ ᱦᱩᱭᱮᱱᱟ᱾"
  },
  {
      "id": "num9",
      "hindi": "नौ",
      "olChiki": "ᱟᱨᱮ",
      "roman": "Are",
      "category": "daily",
      "pos": "numeral",
      "exampleHin": "नौ किताबें हैं।",
      "exampleSat": "ᱟᱨᱮ ᱜᱚᱴᱟᱝ ᱯᱚᱛᱚᱵ ᱢᱮᱱᱟᱜ-ᱟ᱾"
  }
];
