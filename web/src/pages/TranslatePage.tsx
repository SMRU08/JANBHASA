import React, { useState } from 'react';
import {
  ArrowLeftRight, Volume2, Copy, Check, Share2, Bookmark, Globe,
  RotateCcw, Sparkles, Square, ArrowDown
} from 'lucide-react';
import {
  SUPPORTED_LANGUAGES,
  translateOffline,
  speakText
} from '../services/voiceAiService';

export function TranslatePage() {
  const [sourceLang, setSourceLang] = useState('hi');
  const [targetLang, setTargetLang] = useState('sat');
  const [inputText, setInputText] = useState('बच्चे हर रोज़ स्कूल जाते हैं और अपनी मातृभाषा में सीखते हैं।');
  const [translatedText, setTranslatedText] = useState('ᱜᱤᱫᱽᱨᱟᱹ ᱠᱚ ᱫᱤᱱᱟᱹᱢ ᱟᱥᱲᱟ ᱠᱚ ᱪᱟᱞᱟᱜ ᱠᱟᱱᱟ ᱟᱨ ᱟᱯᱱᱟᱨ ᱯᱟᱹᱨᱥᱤ ᱛᱮᱠᱚ ᱪᱮᱫᱚᱜ ᱠᱟᱱᱟ ᱾');
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleTranslate = () => {
    if (!inputText.trim()) return;
    const res = translateOffline(inputText, targetLang);
    setTranslatedText(res);
  };

  const handleSwap = () => {
    const prevSrc = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(prevSrc);
    const prevIn = inputText;
    setInputText(translatedText);
    setTranslatedText(prevIn);
  };

  const handleSpeak = (text: string, lang: string) => {
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(text, lang).then(() => setIsSpeaking(false));
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const srcLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === sourceLang) || SUPPORTED_LANGUAGES[0];
  const tgtLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === targetLang) || SUPPORTED_LANGUAGES[1];

  return (
    <div className="min-h-screen pt-24 pb-24 bg-stone-50 dark:bg-navy-950 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-bold uppercase">
            <Globe size={13} />
            <span>Indigenous NMT Translation Studio</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Instant Multilingual Translation
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Translate foundational education curriculum into Ho, Mundari, Santali, Odia and more.
          </p>
        </div>

        {/* Translation Card Studio */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden">
          {/* Header Language Bar */}
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-navy-950/70">
            {/* Source Lang Picker */}
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
              className="bg-white dark:bg-navy-900 text-sm font-black text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800 focus:outline-none cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name} ({lang.nativeName})
                </option>
              ))}
            </select>

            {/* Swap Button */}
            <button
              onClick={handleSwap}
              className="p-2 rounded-xl bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-saffron-50 hover:text-saffron-600 transition-colors cursor-pointer"
              title="Swap Languages"
            >
              <ArrowLeftRight size={16} />
            </button>

            {/* Target Lang Picker */}
            <select
              value={targetLang}
              onChange={(e) => {
                setTargetLang(e.target.value);
                setTranslatedText(translateOffline(inputText, e.target.value));
              }}
              className="bg-white dark:bg-navy-900 text-sm font-black text-saffron-700 dark:text-saffron-400 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800 focus:outline-none cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name} ({lang.nativeName})
                </option>
              ))}
            </select>
          </div>

          {/* Dual Text Areas */}
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
            {/* Input Box */}
            <div className="p-6 space-y-4 flex flex-col justify-between min-h-[220px]">
              <textarea
                value={inputText}
                onChange={(e) => {
                  setInputText(e.target.value);
                  setTranslatedText(translateOffline(e.target.value, targetLang));
                }}
                placeholder="Type or paste Hindi or tribal text here..."
                rows={5}
                className="w-full bg-transparent text-base font-semibold text-slate-900 dark:text-white focus:outline-none resize-none placeholder:text-slate-400"
              />
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800/60">
                <span className="text-xs text-slate-400 font-medium">
                  {inputText.length} characters
                </span>
                <button
                  onClick={() => handleSpeak(inputText, sourceLang)}
                  className="p-2 text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
                  title="Listen"
                >
                  <Volume2 size={18} />
                </button>
              </div>
            </div>

            {/* Translated Output Box */}
            <div className="p-6 bg-saffron-50/40 dark:bg-saffron-950/20 space-y-4 flex flex-col justify-between min-h-[220px]">
              <p className="text-base font-bold text-saffron-950 dark:text-saffron-100 leading-relaxed min-h-[120px]">
                {translatedText || <span className="text-slate-400 italic">Translation will appear here...</span>}
              </p>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-saffron-200/60 dark:border-saffron-800/40">
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-saffron-500/20 text-saffron-700 dark:text-saffron-300">
                    {tgtLangObj.script}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleSpeak(translatedText, targetLang)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-saffron-600 hover:bg-saffron-500 text-white text-xs font-bold shadow transition-all cursor-pointer"
                  >
                    {isSpeaking ? <Square size={13} /> : <Volume2 size={13} />}
                    <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                  </button>
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-saffron-100 dark:hover:bg-saffron-900/50 cursor-pointer"
                    title="Copy Translation"
                  >
                    {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Sample Translation Chips */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-3">
          <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider">
            💡 Quick Educational Prompts
          </h3>
          <div className="flex flex-wrap gap-2">
            {[
              'नमस्ते',
              'आज हम जल संरक्षण के बारे में पढ़ेंगे',
              'स्कूल',
              'शिक्षक',
              'किताब',
              'पानी',
              'पेड़',
              'सूरज',
              'धन्यवाद',
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  setInputText(prompt);
                  setTranslatedText(translateOffline(prompt, targetLang));
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-saffron-50 dark:hover:bg-saffron-950 text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-saffron-600 transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
