import React, { useState } from 'react';
import { Globe, Volume2, CheckCircle2, MapPin, Layers, Sparkles, BookOpen } from 'lucide-react';
import { SUPPORTED_LANGUAGES, speakText } from '../services/voiceAiService';

export function LanguagesPage() {
  const [activeLang, setActiveLang] = useState(SUPPORTED_LANGUAGES[1]);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = (text: string, langCode: string) => {
    setIsSpeaking(true);
    speakText(text, langCode).then(() => setIsSpeaking(false));
  };

  return (
    <div className="min-h-screen pt-24 pb-24 bg-stone-50 dark:bg-navy-950 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-saffron-50 dark:bg-saffron-950 border border-saffron-200 dark:border-saffron-800 text-saffron-700 dark:text-saffron-300 text-xs font-bold uppercase">
            <Sparkles size={13} />
            <span>Indo-Aryan & Austroasiatic Linguistic Heritage</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
            “Your Language. Your Identity.”
          </h1>
          <p className="text-slate-600 dark:text-slate-300 font-medium">
            Explore the 6 indigenous and state languages supported by JANBHASHA for 100% offline classroom AI.
          </p>
        </div>

        {/* Language Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = activeLang.code === lang.code;
            return (
              <div
                key={lang.code}
                onClick={() => setActiveLang(lang)}
                className={`p-6 rounded-3xl border transition-all cursor-pointer space-y-4 ${
                  isSelected
                    ? 'bg-white dark:bg-navy-900 border-saffron-500 ring-2 ring-saffron-500/20 shadow-xl'
                    : 'bg-white/80 dark:bg-navy-900/80 border-slate-200 dark:border-slate-800 hover:border-slate-300 shadow-sm'
                }`}
              >
                {/* Card Top */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{lang.flag}</span>
                    <div>
                      <h3 className="text-lg font-black text-slate-900 dark:text-white">
                        {lang.name}
                      </h3>
                      <p className="text-xs font-bold text-saffron-600 dark:text-saffron-400">
                        {lang.nativeName}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {lang.script}
                  </span>
                </div>

                {/* Region */}
                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  <MapPin size={13} className="text-rose-500 shrink-0" />
                  <span>{lang.region}</span>
                </div>

                {/* Sample Sentence & Pronunciation */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200/80 dark:border-slate-800 space-y-2">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Sample Educational Phrase
                  </div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {lang.samplePhrase}
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-800/60">
                    <span className="text-xs text-slate-500 font-medium">
                      {lang.translatedSample}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSpeak(lang.samplePhrase, lang.code);
                      }}
                      className="p-1.5 text-saffron-600 hover:bg-saffron-100 dark:hover:bg-saffron-950 rounded-lg transition-colors cursor-pointer"
                      title="Pronounce"
                    >
                      <Volume2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 pt-1 text-[11px] font-bold">
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={13} />
                    <span>Voice AI: ✓ Available</span>
                  </span>
                  <span className="flex items-center gap-1 text-brand-600 dark:text-brand-400">
                    <CheckCircle2 size={13} />
                    <span>Offline: ✓ Ready</span>
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
