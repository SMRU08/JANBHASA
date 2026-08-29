import React, { useState } from 'react';
import {
  Wifi, WifiOff, HardDrive, Download, CheckCircle2, ShieldCheck,
  RefreshCw, Trash2, ArrowDown, Database, Cpu
} from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '../services/voiceAiService';

const PACKS = [
  { id: 'hi', name: 'Hindi Base Model & NLP Dictionary', size: '420 MB', status: 'downloaded', date: '2026-08-20' },
  { id: 'sat', name: 'Santali (Ol Chiki) NMT & Speech Synthesis', size: '680 MB', status: 'downloaded', date: '2026-08-22' },
  { id: 'ho', name: 'Ho Language Lexicon & Acoustic Pack', size: '510 MB', status: 'downloaded', date: '2026-08-25' },
  { id: 'mun', name: 'Mundari (Hasada) 26K TSV Parallel Corpus', size: '480 MB', status: 'downloaded', date: '2026-08-28' },
  { id: 'or', name: 'Odia Standard Primary Education Pack', size: '320 MB', status: 'downloaded', date: '2026-08-28' },
  { id: 'kui', name: 'Kui & Gondi Tribal Vocabulary Pack', size: '240 MB', status: 'available', date: 'Available' },
];

export function OfflineManagerPage() {
  const [packs, setPacks] = useState(PACKS);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = (id: string) => {
    setDownloadingId(id);
    setTimeout(() => {
      setPacks((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'downloaded', date: 'Just now' } : p))
      );
      setDownloadingId(null);
    }, 1500);
  };

  return (
    <div className="min-h-screen pt-24 pb-24 bg-stone-50 dark:bg-navy-950 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-bold uppercase">
            <Wifi size={13} />
            <span>Zero Data Network Dependency</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Offline Storage & Language Packs
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            “Learn anywhere, even without a network connection.”
          </p>
        </div>

        {/* Offline Ready Status Banner */}
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black uppercase backdrop-blur-md">
              <ShieldCheck size={14} />
              <span>🟢 OFFLINE AI READY</span>
            </div>
            <h2 className="text-2xl font-black">All Core Indigenous Models Cached</h2>
            <p className="text-xs text-emerald-100 font-medium">
              Microphone translation, OCR, and AI Tutor operate fully on device memory.
            </p>
          </div>

          <div className="bg-white/20 backdrop-blur-md px-6 py-4 rounded-2xl text-center border border-white/30 shrink-0">
            <div className="text-2xl font-black">2.4 GB / 4 GB</div>
            <div className="text-[10px] uppercase font-bold text-white/80">Local Storage Used</div>
          </div>
        </div>

        {/* Language Packs List */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-4">
          <h3 className="text-base font-black text-slate-900 dark:text-white">
            Downloaded Indigenous Language Packs
          </h3>

          <div className="space-y-3">
            {packs.map((pack) => {
              const isDownloaded = pack.status === 'downloaded';
              const isLoading = downloadingId === pack.id;

              return (
                <div
                  key={pack.id}
                  className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 bg-slate-50/50 dark:bg-navy-950/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-emerald-600">
                      <Database size={20} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {pack.name}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {pack.size} • {pack.date}
                      </p>
                    </div>
                  </div>

                  <div>
                    {isDownloaded ? (
                      <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 size={14} />
                        <span>Ready Offline</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleDownload(pack.id)}
                        disabled={isLoading}
                        className="flex items-center gap-1.5 text-xs font-bold text-white bg-saffron-600 hover:bg-saffron-500 px-4 py-2 rounded-xl shadow cursor-pointer"
                      >
                        <Download size={14} />
                        <span>{isLoading ? 'Downloading...' : 'Download Pack'}</span>
                      </button>
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
