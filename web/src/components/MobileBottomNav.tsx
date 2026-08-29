import React from 'react';
import { Home, BookOpen, Mic, Globe, User } from 'lucide-react';

interface Props {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export function MobileBottomNav({ currentPath, onNavigate }: Props) {
  const tabs = [
    { label: 'Home', path: '/', icon: <Home size={19} /> },
    { label: 'Learn', path: '/learn', icon: <BookOpen size={19} /> },
    { label: 'Voice AI', path: '/voice-ai', isCenter: true },
    { label: 'Translate', path: '/translate', icon: <Globe size={19} /> },
    { label: 'Teacher', path: '/teacher', icon: <User size={19} /> },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-navy-950/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800/80 px-3 py-1.5 shadow-2xl">
      <div className="flex items-center justify-around relative">
        {tabs.map((tab) => {
          const isActive = currentPath === tab.path;

          if (tab.isCenter) {
            return (
              <div key={tab.path} className="relative -top-5 flex flex-col items-center">
                <button
                  onClick={() => onNavigate(tab.path)}
                  className="w-14 h-14 rounded-full bg-gradient-to-tr from-brand-600 to-saffron-500 hover:from-brand-500 hover:to-saffron-400 text-white flex items-center justify-center shadow-lg shadow-saffron-500/30 border-4 border-white dark:border-navy-950 active:scale-95 transition-all cursor-pointer group"
                  aria-label="Launch Voice AI"
                >
                  <Mic size={24} className="group-hover:scale-110 transition-transform" />
                </button>
                <span className="text-[10px] font-bold text-saffron-600 dark:text-saffron-400 mt-0.5">
                  Voice AI
                </span>
              </div>
            );
          }

          return (
            <button
              key={tab.path}
              onClick={() => onNavigate(tab.path)}
              className={`flex flex-col items-center py-1 px-2 rounded-lg transition-colors cursor-pointer ${
                isActive
                  ? 'text-brand-600 dark:text-brand-400 font-bold'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <div className="mb-0.5">{tab.icon}</div>
              <span className="text-[10px] font-semibold">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
