import React from 'react';
import { Mic, Heart, Globe, Shield, Sparkles, BookOpen } from 'lucide-react';

interface Props {
  onNavigate: (path: string) => void;
}

export function Footer({ onNavigate }: Props) {
  return (
    <footer className="bg-white dark:bg-navy-950 border-t border-slate-200 dark:border-slate-800/80 pt-16 pb-24 md:pb-12 text-slate-600 dark:text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-200 dark:border-slate-800/60">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 via-saffron-500 to-emerald-500 p-0.5 shadow-md">
                <div className="w-full h-full bg-white dark:bg-navy-900 rounded-[10px] flex items-center justify-center">
                  <span className="text-lg">🎙️</span>
                </div>
              </div>
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                JANBHASHA
              </span>
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm">
              “Teach in Hindi. Learn in Your Mother Tongue.” An indigenous multilingual AI education platform bridging classroom dialogue across Ho, Mundari, Santali, Odia, and Hindi.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>100% Offline AI Operation • Zero Data Needed</span>
            </div>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              AI Features
            </h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <button onClick={() => onNavigate('/voice-ai')} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  🎙️ Voice AI Studio
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/ai')} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  🤖 Multilingual AI Tutor
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/translate')} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  🌐 Real-Time Translation
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/ocr')} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  📷 Textbook OCR Scanner
                </button>
              </li>
            </ul>
          </div>

          {/* Learning & Teachers */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              Education
            </h4>
            <ul className="space-y-2.5 text-sm font-medium">
              <li>
                <button onClick={() => onNavigate('/learn')} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  📚 Student Adventure Trail
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/teacher')} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  👩‍🏫 Teacher Command Hub
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/languages')} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  🗣️ 6 Tribal Languages
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/offline')} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  💾 Offline Language Packs
                </button>
              </li>
            </ul>
          </div>

          {/* Indigenous Trust */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-4">
              National Mission
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-3">
              Aligned with NIPUN Bharat FLN (Foundational Literacy & Numeracy) and NEP 2020 Mother Tongue Education Guidelines.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-saffron-600 dark:text-saffron-400 font-bold">
              <span>🇮🇳</span>
              <span>Made for Indian Tribal Learners</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright & credits */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium">
          <p>© 2026 JANBHASHA. Developed by Team Xerses for Rural & Tribal Education.</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-500">
              Built with <Heart size={13} className="text-rose-500 fill-rose-500" /> for India's Future
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
