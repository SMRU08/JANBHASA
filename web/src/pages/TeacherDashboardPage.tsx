import React, { useState } from 'react';
import {
  Users, BookPlus, Wifi, Radio, BarChart3, Award, FileText,
  Sparkles, CheckCircle2, ChevronRight, Play, Download
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area
} from 'recharts';

const CLASS_DATA = [
  { subject: 'Math FLN', completion: 82, accuracy: 78 },
  { subject: 'Santali Literacy', completion: 94, accuracy: 88 },
  { subject: 'Ho Language', completion: 76, accuracy: 70 },
  { subject: 'EVS & Nature', completion: 89, accuracy: 84 },
  { subject: 'English Words', completion: 65, accuracy: 60 },
];

const WEEKLY_HOURS = [
  { day: 'Mon', hours: 3.2 },
  { day: 'Tue', hours: 4.1 },
  { day: 'Wed', hours: 3.8 },
  { day: 'Thu', hours: 4.5 },
  { day: 'Fri', hours: 4.0 },
  { day: 'Sat', hours: 2.5 },
];

export function TeacherDashboardPage({ onNavigate }: { onNavigate: (path: string) => void }) {
  const [broadcastActive, setBroadcastActive] = useState(false);
  const [activeTab, setActiveTab] = useState<'analytics' | 'worksheets' | 'hotspot'>('analytics');

  return (
    <div className="min-h-screen pt-24 pb-24 bg-stone-50 dark:bg-navy-950 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Teacher Header Banner */}
        <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-3xl p-6 md:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase backdrop-blur-md">
              <span>👩‍🏫 Head Educator Portal</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black">
              Govt. Primary School, Kolhan 🏫
            </h1>
            <p className="text-xs md:text-sm text-emerald-100 font-medium">
              34 Students Active • 6 Tribal Language Packs Loaded • Hotspot Broadcast Ready
            </p>
          </div>

          <button
            onClick={() => setBroadcastActive(!broadcastActive)}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl font-black text-sm shadow-lg transition-all cursor-pointer active:scale-95 ${
              broadcastActive
                ? 'bg-rose-500 hover:bg-rose-400 text-white animate-pulse'
                : 'bg-white text-emerald-900 hover:bg-emerald-50'
            }`}
          >
            <Radio size={18} />
            <span>{broadcastActive ? '🔴 Broadcasting ON AIR' : '🎙️ Start Classroom Hotspot'}</span>
          </button>
        </div>

        {/* Quick Shortcut Tabs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={() => onNavigate('/voice-ai')}
            className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-brand-500 transition-all cursor-pointer space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center text-brand-600 font-bold">
              🎙️
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">Live Voice Bridge</h3>
            <p className="text-xs text-slate-500">Speak Hindi → Stream Santali / Ho to 34 tablets</p>
          </div>

          <div
            onClick={() => onNavigate('/ocr')}
            className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-purple-500 transition-all cursor-pointer space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 flex items-center justify-center text-purple-600 font-bold">
              📷
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">Textbook OCR</h3>
            <p className="text-xs text-slate-500">Scan lesson pages to generate bilingual quizzes</p>
          </div>

          <div
            onClick={() => onNavigate('/offline')}
            className="p-5 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500 transition-all cursor-pointer space-y-2"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 font-bold">
              💾
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">Offline Packs</h3>
            <p className="text-xs text-slate-500">Manage on-device dictionaries and voice audio models</p>
          </div>
        </div>

        {/* Analytics Charts Section (Recharts) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Subject Mastery Performance */}
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Classroom FLN Mastery (%)
              </h3>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Avg: 81.2%
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CLASS_DATA}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderRadius: '12px',
                      color: '#FFF',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="completion" fill="#10B981" radius={[6, 6, 0, 0]} name="Completion %" />
                  <Bar dataKey="accuracy" fill="#3B82F6" radius={[6, 6, 0, 0]} name="Accuracy %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekly Broadcast Hours */}
          <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                Weekly Multilingual Audio Streamed
              </h3>
              <span className="text-xs font-bold text-saffron-600 dark:text-saffron-400">
                22.1 Hours Total
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={WEEKLY_HOURS}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderRadius: '12px',
                      color: '#FFF',
                      border: 'none',
                      fontSize: '12px',
                    }}
                  />
                  <Area type="monotone" dataKey="hours" stroke="#F59E0B" fill="#FEF3C7" fillOpacity={0.4} name="Hours Broadcasted" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
