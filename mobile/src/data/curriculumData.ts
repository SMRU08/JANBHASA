export interface Lesson {
  id: string;
  titleHindi: string;
  titleSantali: string;
  conceptHindi: string;
  conceptSantali: string;
  culturalMetaphor: string;
  audioText: string;
}

export interface Subject {
  id: string;
  category: 'Stories' | 'Science' | 'Math';
  title: string;
  titleHindi: string;
  titleSantali: string;
  icon: string;
  lessonCount: number;
  description: string;
  lessons: Lesson[];
}

export interface Flashcard {
  id: number;
  english: string;
  hindi: string;
  santaliOlChiki: string;
  phonetic: string;
  category: string;
  icon: string;
  exampleSentenceHindi: string;
  exampleSentenceSantali: string;
}

export const CurriculumSubjects: Subject[] = [
  {
    id: 'env',
    category: 'Science',
    title: 'Our Environment',
    titleHindi: 'हमारा पर्यावरण',
    titleSantali: 'ᱟᱵᱚᱣᱟᱜ ᱯᱚᱨᱤᱵᱮᱥ',
    icon: '🌳',
    lessonCount: 5,
    description: 'Explore trees, rivers, and seasonal cycles through village nature.',
    lessons: [
      {
        id: 'env-1',
        titleHindi: 'पेड़ और पत्तियाँ (Photosynthesis)',
        titleSantali: 'ᱫᱟᱨᱮ ᱟᱨ ᱥᱟᱠᱟᱢ',
        conceptHindi: 'पेड़ सूर्य के प्रकाश और पानी से अपना भोजन बनाते हैं।',
        conceptSantali: 'ᱫᱟᱨᱮ ᱠᱚᱫᱚ ᱥᱤᱛᱩᱝ ᱟᱨ ᱫᱟᱜ ᱛᱮ ᱟᱠᱚᱣᱟᱜ ᱡᱚᱢᱟᱜ ᱠᱚ ᱛᱮᱭᱟᱨᱟ ᱾',
        culturalMetaphor: 'Sal tree leaves cook morning sunbeams just like family chulha creates nourishment.',
        audioText: 'ᱫᱟᱨᱮ ᱠᱚᱫᱚ ᱥᱤᱛᱩᱝ ᱟᱨ ᱫᱟᱜ ᱛᱮ ᱟᱠᱚᱣᱟᱜ ᱡᱚᱢᱟᱜ ᱠᱚ ᱛᱮᱭᱟᱨᱟ ᱾',
      },
      {
        id: 'env-2',
        titleHindi: 'जल चक्र (Water Cycle)',
        titleSantali: 'ᱫᱟᱜ ᱪᱚᱠᱨᱚ',
        conceptHindi: 'नदियों का पानी भाप बनकर बादलों में जाता है और बारिश लाता है।',
        conceptSantali: 'ᱜᱟᱰᱟ ᱠᱷᱚᱱ ᱫᱟᱜ ᱨᱟᱠᱟᱵ ᱠᱟᱛᱮ ᱨᱤᱢᱤᱞ ᱵᱮᱱᱟᱣᱜ-ᱟ ᱟᱨ ᱡᱟᱹᱲᱤ ᱧᱩᱨᱩᱜ-ᱟ ᱾',
        culturalMetaphor: 'The sacred river drinks the sky and dances back as monsoon rain for our paddy crops.',
        audioText: 'ᱜᱟᱰᱟ ᱠᱷᱚᱱ ᱫᱟᱜ ᱨᱟᱠᱟᱵ ᱠᱟᱛᱮ ᱨᱤᱢᱤᱞ ᱵᱮᱱᱟᱣᱜ-ᱟ ᱾',
      },
    ],
  },
  {
    id: 'helpers',
    category: 'Stories',
    title: 'Community Helpers',
    titleHindi: 'हमारे सहायक',
    titleSantali: 'ᱟᱵᱚᱣᱟᱜ ᱜᱚᱲᱚᱣᱟᱱ ᱦᱚᱲ',
    icon: '👥',
    lessonCount: 4,
    description: 'Farmers, teachers, artisans, and doctors who help our community.',
    lessons: [
      {
        id: 'hlp-1',
        titleHindi: 'किसान (The Farmer)',
        titleSantali: 'ᱪᱟᱥᱤ (Farmer)',
        conceptHindi: 'किसान खेतों में अनाज उगाते हैं और सबका पेट भरते हैं।',
        conceptSantali: 'ᱪᱟᱥᱤ ᱠᱚᱫᱚ ᱠᱷᱮᱛ ᱨᱮ ᱦᱳᱲᱳ ᱠᱚ ᱪᱟᱥᱟ ᱟᱨ ᱡᱚᱛᱚ ᱦᱚᱲ ᱠᱚ ᱡᱚᱢ ᱚᱪᱚ ᱠᱚᱣᱟ ᱾',
        culturalMetaphor: 'Honoring the soil and bullock carts during the Maghe parab festival.',
        audioText: 'ᱪᱟᱥᱤ ᱠᱚᱫᱚ ᱠᱷᱮᱛ ᱨᱮ ᱦᱳᱲᱳ ᱠᱚ ᱪᱟᱥᱟ ᱾',
      },
    ],
  },
  {
    id: 'culture',
    category: 'Stories',
    title: 'Local Culture & Folklore',
    titleHindi: 'स्थानीय संस्कृति',
    titleSantali: 'ᱟᱛᱳ ᱞᱟᱠᱪᱟᱨ',
    icon: '🪘',
    lessonCount: 6,
    description: 'Traditional Sohrai art, folk rhythms, and harvest tales.',
    lessons: [
      {
        id: 'cul-1',
        titleHindi: 'सोहराय पर्व (Sohrai Festival)',
        titleSantali: 'ᱥᱚᱦᱨᱟᱭ ᱯᱚᱨᱚᱵ',
        conceptHindi: 'सोहराय पर्व पर हम पशुओं की पूजा करते हैं और घरों को सजाते हैं।',
        conceptSantali: 'ᱥᱚᱦᱨᱟᱭ ᱨᱮ ᱟᱵᱚ ᱜᱟᱹᱭ ᱰᱟᱝᱜᱽᱨᱟ ᱵᱚ ᱵᱚᱝᱜᱟ ᱟᱠᱚᱣᱟ ᱟᱨ ᱚᱲᱟᱜ ᱵᱚ ᱥᱟᱡᱟᱣᱟ ᱾',
        culturalMetaphor: 'Mural wall art made from natural white kaolin clay and red river silt.',
        audioText: 'ᱥᱚᱦᱨᱟᱭ ᱨᱮ ᱟᱵᱚ ᱚᱲᱟᱜ ᱵᱚ ᱥᱟᱡᱟᱣᱟ ᱾',
      },
    ],
  },
  {
    id: 'health',
    category: 'Science',
    title: 'Health & Hygiene',
    titleHindi: 'स्वास्थ्य और स्वच्छता',
    titleSantali: 'ᱦᱚᱲᱢᱳ ᱟᱨ ᱥᱟᱯᱷᱟ',
    icon: '🍃',
    lessonCount: 5,
    description: 'Clean drinking water, hand washing, and nutritious forest herbs.',
    lessons: [
      {
        id: 'hlth-1',
        titleHindi: 'हाथ धोना (Hand Washing)',
        titleSantali: 'ᱛᱤ ᱟᱹᱨᱩᱵ',
        conceptHindi: 'खाने से पहले साबुन से हाथ धोने से कीटाणु दूर रहते हैं।',
        conceptSantali: 'ᱡᱚᱢ ᱞᱟᱦᱟ ᱨᱮ ᱥᱟᱵᱚᱱ ᱛᱮ ᱛᱤ ᱟᱹᱨᱩᱵ ᱞᱮᱠᱷᱟᱱ ᱵᱮᱢᱟᱨ ᱵᱟᱝ ᱧᱟᱢᱟ ᱾',
        culturalMetaphor: 'Clear spring water from the village chulha well.',
        audioText: 'ᱡᱚᱢ ᱞᱟᱦᱟ ᱨᱮ ᱥᱟᱵᱚᱱ ᱛᱮ ᱛᱤ ᱟᱹᱨᱩᱵ ᱯᱮ ᱾',
      },
    ],
  },
];

export const FlashcardItems: Flashcard[] = [
  {
    id: 1,
    english: 'Bird',
    hindi: 'पक्षी',
    santaliOlChiki: 'ᱪᱮᱬᱮ',
    phonetic: 'Chen-e',
    category: 'Nature',
    icon: '🐦',
    exampleSentenceHindi: 'पक्षी आकाश में उड़ते हैं।',
    exampleSentenceSantali: 'ᱪᱮᱬᱮ ᱥᱮᱨᱢᱟ ᱨᱮ ᱠᱚ ᱩᱰᱟᱹᱣᱜ-ᱟ ᱾',
  },
  {
    id: 2,
    english: 'Tree',
    hindi: 'पेड़',
    santaliOlChiki: 'ᱫᱟᱨᱮ',
    phonetic: 'Dare',
    category: 'Nature',
    icon: '🌳',
    exampleSentenceHindi: 'पेड़ हमें ठंडी छाया देते हैं।',
    exampleSentenceSantali: 'ᱫᱟᱨᱮ ᱟᱵᱚ ᱩᱢᱩᱞ ᱮ ᱮᱢᱟᱵᱚᱱᱟ ᱾',
  },
  {
    id: 3,
    english: 'Water',
    hindi: 'पानी',
    santaliOlChiki: 'ᱫᱟᱜ',
    phonetic: 'Daak',
    category: 'Essentials',
    icon: '💧',
    exampleSentenceHindi: 'पानी जीवन के लिए जरूरी है।',
    exampleSentenceSantali: 'ᱫᱟᱜ ᱫᱚ ᱡᱤᱣᱤ ᱞᱟᱹᱜᱤᱫ ᱞᱟᱹᱠᱛᱤᱭᱟᱱᱟ ᱾',
  },
  {
    id: 4,
    english: 'Sun',
    hindi: 'सूरज',
    santaliOlChiki: 'ᱥᱤᱧ ᱪᱟᱸᱫᱚ',
    phonetic: 'Sin Chando',
    category: 'Sky',
    icon: '☀️',
    exampleSentenceHindi: 'सूरज सुबह पूर्व में उगता है।',
    exampleSentenceSantali: 'ᱥᱤᱧ ᱪᱟᱸᱫᱚ ᱥᱮᱛᱟᱜ ᱨᱮ ᱨᱟᱠᱟᱵ-ᱟ ᱾',
  },
  {
    id: 5,
    english: 'Flower',
    hindi: 'फूल',
    santaliOlChiki: 'ᱵᱟᱦᱟ',
    phonetic: 'Baha',
    category: 'Nature',
    icon: '🌸',
    exampleSentenceHindi: 'जंगल में सुंदर फूल खिले हैं।',
    exampleSentenceSantali: 'ᱵᱤᱨ ᱨᱮ ᱱᱟᱯᱟᱭ ᱵᱟᱦᱟ ᱯᱷᱩᱴᱟᱹᱣ ᱟᱠᱟᱱᱟ ᱾',
  },
  {
    id: 6,
    english: 'Book',
    hindi: 'किताब',
    santaliOlChiki: 'ᱯᱩᱛᱷᱤ',
    phonetic: 'Puthi',
    category: 'Education',
    icon: '📖',
    exampleSentenceHindi: 'हम रोज नई किताब पढ़ते हैं।',
    exampleSentenceSantali: 'ᱟᱵᱚ ᱫᱤᱱᱟᱹᱢ ᱱᱟᱣᱟ ᱯᱩᱛᱷᱤ ᱵᱚ ᱯᱟᱲᱦᱟᱣᱟ ᱾',
  },
  {
    id: 7,
    english: 'Fish',
    hindi: 'मछली',
    santaliOlChiki: 'ᱦᱟᱹᱠᱩ',
    phonetic: 'Haku',
    category: 'Animals',
    icon: '🐟',
    exampleSentenceHindi: 'मछली तालाब में तैरती है।',
    exampleSentenceSantali: 'ᱦᱟᱹᱠᱩ ᱯᱩᱠᱷᱨᱤ ᱨᱮ ᱠᱚ ᱯᱟᱭᱨᱟᱜ-ᱟ ᱾',
  },
  {
    id: 8,
    english: 'Rain',
    hindi: 'बारिश',
    santaliOlChiki: 'ᱫᱟᱜ ᱡᱟᱹᱲᱤ',
    phonetic: 'Daak Jari',
    category: 'Weather',
    icon: '🌧️',
    exampleSentenceHindi: 'बारिश से फसल हरी-भरी होती है।',
    exampleSentenceSantali: 'ᱫᱟᱜ ᱡᱟᱹᱲᱤ ᱛᱮ ᱪᱟᱥ ᱦᱟᱹᱨᱭᱟᱹᱲᱚᱜ-ᱟ ᱾',
  },
  {
    id: 9,
    english: 'Mango',
    hindi: 'आम',
    santaliOlChiki: 'ᱩᱞ',
    phonetic: 'Ul',
    category: 'Fruits',
    icon: '🥭',
    exampleSentenceHindi: 'पके आम मीठे होते हैं।',
    exampleSentenceSantali: 'ᱵᱤᱞᱤ ᱩᱞ ᱫᱚ ᱦᱮᱲᱮᱢ ᱜᱮᱭᱟ ᱾',
  },
  {
    id: 10,
    english: 'Mother Earth',
    hindi: 'धरती',
    santaliOlChiki: 'ᱫᱷᱟᱹᱨᱛᱤ',
    phonetic: 'Dharti',
    category: 'Nature',
    icon: '🌍',
    exampleSentenceHindi: 'धरती हमारी माँ है।',
    exampleSentenceSantali: 'ᱫᱷᱟᱹᱨᱛᱤ ᱫᱚ ᱟᱵᱚᱣᱟᱜ ᱟᱭᱳ ᱠᱟᱱᱟᱭ ᱾',
  },
];
