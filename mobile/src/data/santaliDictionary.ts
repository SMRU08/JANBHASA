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
  }
];
