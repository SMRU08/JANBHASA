import React from 'react';
import { Mic, MicOff, Sparkles, Volume2, Square, Globe, Cpu } from 'lucide-react';

export type VoiceState = 'ready' | 'listening' | 'processing' | 'translating' | 'speaking';

interface Props {
  state: VoiceState;
  onToggle: () => void;
  detectedLang?: string;
  targetLang?: string;
  confidence?: number;
  size?: 'normal' | 'large';
}

export function InteractiveMicrophone({
  state,
  onToggle,
  detectedLang = 'Hindi (हिन्दी)',
  targetLang = 'Santali (ᱥᱟᱱᱛᱟᱲᱤ)',
  confidence = 98,
  size = 'large',
}: Props) {
  const isLarge = size === 'large';
  const btnSize = isLarge ? 'w-32 h-32 md:w-36 md:h-36' : 'w-24 h-24';
  const iconSize = isLarge ? 48 : 32;

  const stateConfigs: Record<
    VoiceState,
    {
      title: string;
      sub: string;
      btnGradient: string;
      glowColor: string;
      icon: React.ReactNode;
      pillColor: string;
    }
  > = {
    ready: {
      title: 'Ready to Listen',
      sub: 'Click microphone or tap anywhere to begin speaking',
      btnGradient: 'from-brand-600 to-brand-700 hover:from-brand-500 hover:to-brand-600',
      glowColor: 'shadow-brand-500/30',
      icon: <Mic size={iconSize} className="text-white" />,
      pillColor: 'bg-brand-50 text-brand-700 dark:bg-brand-950/60 dark:text-brand-300 border-brand-200 dark:border-brand-800',
    },
    listening: {
      title: 'Listening to Your Voice...',
      sub: 'Speak naturally in Hindi, Santali, Ho, Mundari or Odia',
      btnGradient: 'from-saffron-500 to-amber-600 hover:from-saffron-400 hover:to-amber-500',
      glowColor: 'shadow-saffron-500/50',
      icon: <Mic size={iconSize} className="text-white animate-pulse" />,
      pillColor: 'bg-saffron-50 text-saffron-800 dark:bg-saffron-950/60 dark:text-saffron-300 border-saffron-300 dark:border-saffron-800',
    },
    processing: {
      title: 'Understanding Language...',
      sub: 'JANBHASHA neural acoustic model is analyzing speech',
      btnGradient: 'from-purple-600 to-indigo-700',
      glowColor: 'shadow-purple-500/40',
      icon: <Cpu size={iconSize} className="text-white animate-spin" />,
      pillColor: 'bg-purple-50 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-300 dark:border-purple-800',
    },
    translating: {
      title: 'Translating Contextually...',
      sub: `${detectedLang} ➔ ${targetLang}`,
      btnGradient: 'from-indigo-600 to-blue-600',
      glowColor: 'shadow-indigo-500/40',
      icon: <Globe size={iconSize} className="text-white animate-bounce" />,
      pillColor: 'bg-indigo-50 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
    },
    speaking: {
      title: 'Speaking in Mother Tongue...',
      sub: `Synthesizing neural speech in ${targetLang}`,
      btnGradient: 'from-emerald-600 to-teal-700',
      glowColor: 'shadow-emerald-500/40',
      icon: <Volume2 size={iconSize} className="text-white animate-pulse" />,
      pillColor: 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    },
  };

  const current = stateConfigs[state];

  return (
    <div className="flex flex-col items-center justify-center text-center">
      {/* State Status Pill */}
      <div
        className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs md:text-sm font-semibold mb-6 transition-all duration-300 ${current.pillColor}`}
      >
        <span
          className={`w-2.5 h-2.5 rounded-full ${
            state === 'listening'
              ? 'bg-saffron-500 animate-ping'
              : state === 'speaking'
              ? 'bg-emerald-500 animate-ping'
              : state === 'processing'
              ? 'bg-purple-500 animate-pulse'
              : 'bg-brand-500'
          }`}
        />
        <span>{current.title}</span>
        {state === 'listening' && (
          <span className="text-xs bg-saffron-500/20 px-2 py-0.5 rounded-full font-bold">
            98% Live
          </span>
        )}
      </div>

      {/* Signature Animated Multi-Ring Microphone Button */}
      <div className="relative flex items-center justify-center my-2">
        {/* Outer Expanding Pulse Rings (When Listening or Speaking) */}
        {(state === 'listening' || state === 'speaking') && (
          <>
            <div
              className={`absolute -inset-8 rounded-full opacity-30 animate-ping duration-1000 ${
                state === 'listening' ? 'bg-saffron-400' : 'bg-emerald-400'
              }`}
            />
            <div
              className={`absolute -inset-4 rounded-full opacity-40 animate-pulse duration-700 ${
                state === 'listening' ? 'bg-saffron-500' : 'bg-emerald-500'
              }`}
            />
          </>
        )}

        {/* Inner Bevel Microphone Button */}
        <button
          onClick={onToggle}
          className={`${btnSize} rounded-full bg-gradient-to-br ${current.btnGradient} shadow-2xl ${current.glowColor} flex flex-col items-center justify-center cursor-pointer transition-all duration-300 transform active:scale-95 focus:outline-none border-4 border-white/20 dark:border-white/10 group`}
          aria-label={state === 'ready' ? 'Start speaking' : 'Stop voice'}
        >
          <div className="flex flex-col items-center justify-center">
            {current.icon}
            <span className="text-[10px] md:text-xs font-bold text-white/90 uppercase tracking-wider mt-1.5">
              {state === 'ready' ? 'Speak' : state === 'listening' ? 'Done' : state === 'speaking' ? 'Stop' : 'Wait'}
            </span>
          </div>
        </button>
      </div>

      {/* Subtext description */}
      <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 mt-4 max-w-md font-medium">
        {current.sub}
      </p>
    </div>
  );
}
