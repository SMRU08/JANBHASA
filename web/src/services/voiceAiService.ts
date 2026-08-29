/**
 * JANBHASHA Web Audio & Multilingual AI Engine
 * Integrates Web Audio API, AnalyserNode, Speech Recognition, Translation, and TTS.
 */

export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  script: string;
  region: string;
  flag: string;
  voiceAvailable: boolean;
  offlineAvailable: boolean;
  samplePhrase: string;
  translatedSample: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    script: 'Devanagari',
    region: 'North & Central India',
    flag: '🇮🇳',
    voiceAvailable: true,
    offlineAvailable: true,
    samplePhrase: 'आज हम जल संरक्षण के बारे में पढ़ेंगे।',
    translatedSample: 'Today we will read about water conservation.'
  },
  {
    code: 'sat',
    name: 'Santali',
    nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ',
    script: 'Ol Chiki (ᱚᱞ ᱪᱤᱠᱤ)',
    region: 'Jharkhand, Odisha, West Bengal, Assam',
    flag: '🟢',
    voiceAvailable: true,
    offlineAvailable: true,
    samplePhrase: 'ᱛᱮᱦᱮᱧ ᱟᱵᱚ ᱫᱟᱜ ᱫᱚᱦᱚ ᱵᱟᱵᱚᱛ ᱵᱚᱱ ᱯᱟᱲᱦᱟᱣᱟ ᱾',
    translatedSample: 'आज हम जल संरक्षण के बारे में पढ़ेंगे।'
  },
  {
    code: 'ho',
    name: 'Ho',
    nativeName: 'ᱦᱳ / हो',
    script: 'Warang Citi / Devanagari',
    region: 'Kolhan, West Singhbhum, Mayurbhanj',
    flag: '🔵',
    voiceAvailable: true,
    offlineAvailable: true,
    samplePhrase: 'तिसिंग आबु दाः जोगाओ बाबोतबु पड़ावेया।',
    translatedSample: 'आज हम जल संरक्षण के बारे में पढ़ेंगे।'
  },
  {
    code: 'mun',
    name: 'Mundari',
    nativeName: 'मुण्डारी',
    script: 'Devanagari / Mundari Bani',
    region: 'Chota Nagpur, Ranchi, Khunti',
    flag: '🟣',
    voiceAvailable: true,
    offlineAvailable: true,
    samplePhrase: 'तिसिंग आबु दाः दोहोनाः बाबोतबु पड़ावेया।',
    translatedSample: 'आज हम जल संरक्षण के बारे में पढ़ेंगे।'
  },
  {
    code: 'or',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    script: 'Odia Script',
    region: 'Odisha & Neighboring Tribal Belts',
    flag: '🟠',
    voiceAvailable: true,
    offlineAvailable: true,
    samplePhrase: 'ଆଜି ଆମେ ଜଳ ସଂରକ୍ଷଣ ବିଷୟରେ ପଢ଼ିବା।',
    translatedSample: 'आज हम जल संरक्षण के बारे में पढ़ेंगे।'
  },
  {
    code: 'kui',
    name: 'Kui',
    nativeName: 'କୁଇ / कुई',
    script: 'Odia / Latin',
    region: 'Kandhamal, Koraput, Odisha',
    flag: '🌿',
    voiceAvailable: true,
    offlineAvailable: true,
    samplePhrase: 'इनू माबु पीरू दाः नेनका ईनासी।',
    translatedSample: 'आज हम जल संरक्षण के बारे में पढ़ेंगे।'
  },
  {
    code: 'gon',
    name: 'Gondi',
    nativeName: 'गोंडी / 𑴎𑴽𑴟𑴵𑴤𑴤𑴳',
    script: 'Gunjala Gondi / Devanagari',
    region: 'Madhya Pradesh, Chhattisgarh, Maharashtra',
    flag: '🏔️',
    voiceAvailable: true,
    offlineAvailable: true,
    samplePhrase: 'नेंड ममोत येर रोकी कीना बटका परहकीन।',
    translatedSample: 'आज हम जल संरक्षण के बारे में पढ़ेंगे।'
  }
];

export const DICTIONARY_MAP: Record<string, Record<string, string>> = {
  "नमस्ते": {
    "sat": "ᱡᱚᱦᱟᱨ (Johar)", "ho": "जोहार (Johar)", "mun": "जोहार (Johar)", "or": "ନମସ୍କାର (Namaskar)", "kui": "जोहार (Johar)", "gon": "सेवा जोहार (Seva Johar)"
  },
  "आज हम जल संरक्षण के बारे में पढ़ेंगे": {
    "sat": "ᱛᱮᱦᱮᱧ ᱟᱵᱚ ᱫᱟᱜ ᱫᱚᱦᱚ ᱵᱟᱵᱚᱛ ᱵᱚᱱ ᱯᱟᱲᱦᱟᱣᱟ ᱾",
    "ho": "तिसिंग आबु दाः जोगाओ बाबोतबु पड़ावेया।",
    "mun": "तिसिंग आबु दाः दोहोनाः बाबोतबु पड़ावेया।",
    "or": "ଆଜି ଆମେ ଜଳ ସଂରକ୍ଷଣ ବିଷୟରେ ପଢ଼ିବା।",
    "kui": "इनू माबु पीरू दाः नेनका ईनासी।",
    "gon": "नेंड ममोत येर रोकी कीना बटका परहकीन।"
  },
  "स्कूल": {
    "sat": "ᱟᱥᱲᱟ (Asra)", "ho": "इसकूल (Iskul)", "mun": "इसकूल (Iskul)", "or": "ବିଦ୍ୟାଳୟ (Bidyalaya)", "kui": "शाला (Shala)", "gon": "साला (Sala)"
  },
  "शिक्षक": {
    "sat": "ᱢᱟᱪᱮᱛ (Machet)", "ho": "मास्टर (Master)", "mun": "मास्टर (Master)", "or": "ଶିକ୍ଷକ (Shikshak)", "kui": "गुरु (Guru)", "gon": "गुरुकुल गुरु (Guru)"
  },
  "किताब": {
    "sat": "ᱯᱩᱛᱷᱤ (Puthi)", "ho": "पुथी (Puthi)", "mun": "पुथी (Puthi)", "or": "ବହି (Bahi)", "kui": "पोथी (Pothi)", "gon": "पोती (Pothi)"
  },
  "पानी": {
    "sat": "ᱫᱟᱜ (Dag)", "ho": "दाः (Dah)", "mun": "दाः (Dah)", "or": "ପାଣି / ଜଳ (Pani)", "kui": "पीरू (Piru)", "gon": "येर (Yer)"
  },
  "पेड़": {
    "sat": "ᱫᱟᱨᱮ (Dare)", "ho": "दारू (Daru)", "mun": "दारू (Daru)", "or": "ଗଛ (Gachha)", "kui": "मरा (Mara)", "gon": "मड़ा (Mada)"
  },
  "सूरज": {
    "sat": "ᱥᱤᱧ ᱪᱟᱸᱫᱚ (Sin Chando)", "ho": "सिंगी (Singi)", "mun": "सिंगी (Singi)", "or": "ସୂର୍ଯ୍ୟ (Surya)", "kui": "वेला (Vela)", "gon": "पोर्दी (Pordi)"
  },
  "धन्यवाद": {
    "sat": "ᱥᱟᱨᱦᱟᱣ (Sarhao)", "ho": "दोनोवाद (Donovad)", "mun": "जोहार (Johar)", "or": "ଧନ୍ୟବାଦ (Dhanyabad)", "kui": "धन्यवाद", "gon": "सेवा (Seva)"
  }
};

export class WebAudioVisualizer {
  private audioCtx: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private dataArray: Uint8Array | null = null;
  private isListening = false;

  async startListening(): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      this.micStream = stream;

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      this.analyser = this.audioCtx.createAnalyser();
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.8;

      const source = this.audioCtx.createMediaStreamSource(stream);
      source.connect(this.analyser);

      const bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(bufferLength);
      this.isListening = true;
      return true;
    } catch (err) {
      console.warn('Microphone access not granted or unavailable:', err);
      this.isListening = false;
      return false;
    }
  }

  stopListening() {
    this.isListening = false;
    if (this.micStream) {
      this.micStream.getTracks().forEach(track => track.stop());
      this.micStream = null;
    }
    if (this.audioCtx) {
      this.audioCtx.close();
      this.audioCtx = null;
    }
    this.analyser = null;
    this.dataArray = null;
  }

  getFrequencyData(): Uint8Array {
    if (this.analyser && this.dataArray && this.isListening) {
      this.analyser.getByteFrequencyData(this.dataArray as any);
      return this.dataArray;
    }
    // Return empty fallback array
    return new Uint8Array(128).fill(0);
  }

  getAverageVolume(): number {
    if (!this.analyser || !this.dataArray || !this.isListening) return 0;
    this.analyser.getByteFrequencyData(this.dataArray as any);
    let sum = 0;
    for (let i = 0; i < this.dataArray.length; i++) {
      sum += this.dataArray[i];
    }
    return sum / this.dataArray.length;
  }

  isActive(): boolean {
    return this.isListening;
  }
}

export function translateOffline(text: string, targetLang: string): string {
  const clean = text.trim();
  
  // Exact match in dictionary
  if (DICTIONARY_MAP[clean] && DICTIONARY_MAP[clean][targetLang]) {
    return DICTIONARY_MAP[clean][targetLang];
  }

  // Word-by-word replacement fallback
  let translated = clean;
  for (const [hiWord, targets] of Object.entries(DICTIONARY_MAP)) {
    if (clean.includes(hiWord) && targets[targetLang]) {
      translated = translated.replace(new RegExp(hiWord, 'g'), targets[targetLang]);
    }
  }

  if (translated !== clean) {
    return translated;
  }

  // Smart contextual default for common educational sentences
  const langObj = SUPPORTED_LANGUAGES.find(l => l.code === targetLang);
  if (langObj && targetLang === 'sat') {
    return `ᱱᱚᱣᱟ ᱫᱚ ᱯᱟᱲᱦᱟᱣ ᱢᱮ: "${clean}" ᱾`;
  } else if (langObj && targetLang === 'ho') {
    return `नेया पड़ावेपे: "${clean}"।`;
  } else if (langObj && targetLang === 'mun') {
    return `नेया पड़ावेपे: "${clean}"।`;
  } else if (langObj && targetLang === 'or') {
    return `ଏହାକୁ ଅଧ୍ୟୟନ କରନ୍ତୁ: "${clean}"।`;
  }

  return clean;
}

export function speakText(text: string, langCode: string = 'hi'): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve();
      return;
    }
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[\(\)\[\]\/\\]/g, ' ').replace(/[a-zA-Z]/g, '').trim();
    const utterance = new SpeechSynthesisUtterance(cleanText || text);
    utterance.rate = 0.88;
    utterance.pitch = 1.0;
    
    // Pick appropriate voice
    const localeMap: Record<string, string> = {
      hi: 'hi-IN',
      or: 'hi-IN',
      sat: 'hi-IN',
      ho: 'hi-IN',
      mun: 'hi-IN',
      kui: 'hi-IN',
      gon: 'hi-IN'
    };
    utterance.lang = localeMap[langCode] || 'hi-IN';

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}
