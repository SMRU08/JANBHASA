import React, { useState } from 'react';
import { Camera, Layers, Volume2, Copy, Check, Sparkles, RefreshCw, Upload, ArrowDown } from 'lucide-react';
import { SUPPORTED_LANGUAGES, translateOffline, speakText } from '../services/voiceAiService';

const SAMPLE_TEXTBOOK_PAGES = [
  {
    title: 'Science Grade 3: Water Cycle (जल चक्र)',
    imageEmoji: '🌊 ☀️ ☁️ 🌧️',
    extractedHi: 'सूर्य की गर्मी से नदियों और तालाबों का पानी भाप बनकर ऊपर आसमान में जाता है और बादल बनता है। बादलों से बारिश होती है।',
  },
  {
    title: 'Environmental Studies: Trees & Forest (हमारे वन)',
    imageEmoji: '🌲 🌳 🍃 🦌',
    extractedHi: 'पेड़-पौधे हमारे वातावरण को स्वच्छ और शुद्ध रखते हैं। हमें पेड़ों की कटाई रोकनी चाहिए और नए पौधे लगाने चाहिए।',
  },
  {
    title: 'Mathematics FLN: Numbers & Counting (संख्या ज्ञान)',
    imageEmoji: '🔢 ➕ ➖ ✖️',
    extractedHi: 'गिनती और पहाड़े हमारे जीवन में रोज़ काम आते हैं। दस और दस मिलकर बीस होते हैं।',
  }
];

export function OcrScannerPage() {
  const [selectedSample, setSelectedSample] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [extractedText, setExtractedText] = useState(SAMPLE_TEXTBOOK_PAGES[0].extractedHi);
  const [targetLang, setTargetLang] = useState('sat');
  const [translatedText, setTranslatedText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleScan = (index: number) => {
    setSelectedSample(index);
    setIsScanning(true);
    setExtractedText('');
    setTranslatedText('');

    setTimeout(() => {
      setIsScanning(false);
      const raw = SAMPLE_TEXTBOOK_PAGES[index].extractedHi;
      setExtractedText(raw);
      setTranslatedText(translateOffline(raw, targetLang));
    }, 1200);
  };

  const handleSpeak = (text: string, lang: string) => {
    setIsSpeaking(true);
    speakText(text, lang).then(() => setIsSpeaking(false));
  };

  const targetLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === targetLang) || SUPPORTED_LANGUAGES[1];

  return (
    <div className="min-h-screen pt-24 pb-24 bg-stone-50 dark:bg-navy-950 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-bold uppercase">
            <Camera size={13} />
            <span>Textbook AI Vision Engine</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            “Turn Any Text Into Understanding.”
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Scan physical Hindi textbooks with on-device OCR and read aloud in your tribal mother tongue.
          </p>
        </div>

        {/* Camera Viewfinder Mockup */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="relative w-full h-64 sm:h-72 rounded-2xl bg-gradient-to-br from-slate-900 via-navy-950 to-slate-900 overflow-hidden flex flex-col items-center justify-center border border-slate-700 text-white p-6 shadow-inner">
            {/* Viewfinder Target Borders */}
            <div className="absolute inset-6 border-2 border-dashed border-white/40 rounded-2xl pointer-events-none flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="text-5xl">{SAMPLE_TEXTBOOK_PAGES[selectedSample].imageEmoji}</div>
                <div className="text-xs font-bold uppercase text-white/80 bg-white/10 px-3 py-1 rounded-full backdrop-blur-md">
                  {SAMPLE_TEXTBOOK_PAGES[selectedSample].title}
                </div>
              </div>
            </div>

            {/* Laser Scanning Animation */}
            {isScanning && (
              <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-lg shadow-purple-500/80 animate-bounce top-1/4" />
            )}

            <div className="absolute bottom-4 flex items-center gap-2 text-xs text-white/80 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
              <Sparkles size={13} className="text-saffron-400" />
              <span>{isScanning ? 'Scanning and recognizing textbook text...' : 'Aligned with NIPUN Grade 1-5 Books'}</span>
            </div>
          </div>

          {/* Sample Textbook Pickers */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs font-black uppercase text-slate-500">
              Select Sample Textbook Page:
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_TEXTBOOK_PAGES.map((page, idx) => (
                <button
                  key={idx}
                  onClick={() => handleScan(idx)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedSample === idx
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  Page {idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* OCR Extracted & Translated Result Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            {/* Extracted Hindi Text */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span>📖 EXTRACTED TEXT (HINDI)</span>
                <button
                  onClick={() => handleSpeak(extractedText, 'hi')}
                  className="p-1 text-slate-600 dark:text-slate-300 hover:text-purple-600"
                >
                  <Volume2 size={16} />
                </button>
              </div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white leading-relaxed min-h-[70px]">
                {extractedText || <span className="text-slate-400 italic">Scanning...</span>}
              </p>
            </div>

            {/* Mother Tongue Translation */}
            <div className="p-4 rounded-2xl bg-saffron-50 dark:bg-saffron-950/40 border border-saffron-200 dark:border-saffron-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <select
                  value={targetLang}
                  onChange={(e) => {
                    setTargetLang(e.target.value);
                    setTranslatedText(translateOffline(extractedText, e.target.value));
                  }}
                  className="bg-transparent font-black text-saffron-800 dark:text-saffron-300 focus:outline-none cursor-pointer"
                >
                  {SUPPORTED_LANGUAGES.filter((l) => l.code !== 'hi').map((lang) => (
                    <option key={lang.code} value={lang.code} className="bg-white dark:bg-navy-900 text-slate-900 dark:text-white">
                      {lang.flag} {lang.name} ({lang.nativeName})
                    </option>
                  ))}
                </select>
                <button
                  onClick={() => handleSpeak(translatedText || extractedText, targetLang)}
                  className="p-1 text-saffron-700 dark:text-saffron-300 hover:text-saffron-900"
                >
                  <Volume2 size={16} />
                </button>
              </div>
              <p className="text-sm font-bold text-saffron-950 dark:text-saffron-100 leading-relaxed min-h-[70px]">
                {translatedText || translateOffline(extractedText, targetLang)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
