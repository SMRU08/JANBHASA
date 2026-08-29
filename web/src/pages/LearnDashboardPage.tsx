import React, { useState } from 'react';
import {
  Flame, Award, BookOpen, CheckCircle2, Play, Star, Sparkles,
  ChevronRight, Volume2, ArrowRight, Clock, Trophy
} from 'lucide-react';
import { SUPPORTED_LANGUAGES, speakText } from '../services/voiceAiService';

const LESSONS = [
  { id: 1, title: 'अक्षर ज्ञान व ध्वनियां (Phonics & Letters)', subject: 'Hindi/Santali', xp: 40, status: 'completed', icon: '🔤' },
  { id: 2, title: 'गिनती 1 से 20 (Numbers 1-20 in Ho/Mundari)', subject: 'Mathematics', xp: 50, status: 'completed', icon: '🔢' },
  { id: 3, title: 'हमारे आस-पास के पेड़-पौधे (Trees & Nature)', subject: 'EVS & Science', xp: 45, status: 'active', icon: '🌿' },
  { id: 4, title: 'परिवार और रिश्ते (Family & Kinship)', subject: 'Social Studies', xp: 35, status: 'locked', icon: '👨‍👩‍👧' },
];

export function LearnDashboardPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [streak] = useState(7);
  const [xp] = useState(480);
  const [level] = useState(3);
  const [selectedLang, setSelectedLang] = useState('sat');

  return (
    <div className="min-h-screen pt-24 pb-24 bg-stone-50 dark:bg-navy-950 px-4 sm:px-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Greeting & Stats Banner */}
        <div className="bg-gradient-to-r from-saffron-500 via-amber-500 to-orange-500 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase backdrop-blur-md">
              <Sparkles size={13} />
              <span>NIPUN Bharat FLN Path</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black">
              Good Morning, Arjun! 👋
            </h1>
            <p className="text-xs md:text-sm text-white/90 font-medium">
              You are on a <strong>7-Day Learning Streak</strong>. Keep going to earn the Tribal Scholar Badge!
            </p>
          </div>

          {/* Gamification Badges Row */}
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-md px-4 py-3 rounded-2xl text-center border border-white/30">
              <div className="flex items-center justify-center gap-1 text-xl font-black">
                <Flame size={20} className="text-yellow-200 fill-yellow-200" />
                <span>{streak}d</span>
              </div>
              <div className="text-[10px] uppercase font-bold text-white/80">Streak</div>
            </div>

            <div className="bg-white/20 backdrop-blur-md px-4 py-3 rounded-2xl text-center border border-white/30">
              <div className="text-xl font-black">⚡ {xp}</div>
              <div className="text-[10px] uppercase font-bold text-white/80">Total XP</div>
            </div>

            <div className="bg-white/20 backdrop-blur-md px-4 py-3 rounded-2xl text-center border border-white/30">
              <div className="text-xl font-black">Lv.{level}</div>
              <div className="text-[10px] uppercase font-bold text-white/80">Rank</div>
            </div>
          </div>
        </div>

        {/* Daily Goal & Progress Bar */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 dark:text-white">Today's Goal: 80% Completed</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">3 of 4 activities finished today</p>
            </div>
            <span className="text-sm font-black text-saffron-600 dark:text-saffron-400">12 / 15 Mins</span>
          </div>

          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3.5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-saffron-500 to-emerald-500 h-full rounded-full transition-all duration-500 w-[80%]" />
          </div>

          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs font-bold text-slate-600 dark:text-slate-300">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
              <div className="text-base font-black text-slate-900 dark:text-white">12</div>
              <div>Lessons Done</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
              <div className="text-base font-black text-slate-900 dark:text-white">148</div>
              <div>Words Learned</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
              <div className="text-base font-black text-slate-900 dark:text-white">42m</div>
              <div>Voice Practice</div>
            </div>
          </div>
        </div>

        {/* Stepping Stones Adventure Trail */}
        <div className="space-y-3">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">
            Class 3 Foundational Lessons
          </h2>

          <div className="space-y-3">
            {LESSONS.map((lesson) => {
              const isCompleted = lesson.status === 'completed';
              const isActive = lesson.status === 'active';

              return (
                <div
                  key={lesson.id}
                  className={`p-5 rounded-3xl border transition-all flex items-center justify-between gap-4 ${
                    isCompleted
                      ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800'
                      : isActive
                      ? 'bg-white dark:bg-navy-900 border-saffron-500 shadow-md ring-2 ring-saffron-500/20'
                      : 'bg-white/60 dark:bg-navy-900/40 border-slate-200 dark:border-slate-800 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-3xl">{lesson.icon}</div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          {lesson.subject}
                        </span>
                        <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-full bg-saffron-100 dark:bg-saffron-950 text-saffron-800 dark:text-saffron-300">
                          +{lesson.xp} XP
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                        {lesson.title}
                      </h4>
                    </div>
                  </div>

                  <div>
                    {isCompleted ? (
                      <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50 px-3 py-1.5 rounded-xl">
                        <CheckCircle2 size={15} />
                        <span>Completed</span>
                      </span>
                    ) : isActive ? (
                      <button
                        onClick={() => onNavigate('/voice-ai')}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-saffron-500 hover:bg-saffron-400 text-white font-bold text-xs shadow-md cursor-pointer"
                      >
                        <Play size={13} fill="white" />
                        <span>Start Lesson</span>
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400 font-bold">🔒 Locked</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
