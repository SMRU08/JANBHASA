import React, { useState, useEffect, useRef } from 'react';
import {
  Mic, Volume2, Globe, Sparkles, ArrowLeft, Square, Copy, Check, RotateCcw,
  Headphones, Radio, Cpu, Share2, Bookmark
} from 'lucide-react';
import { AudioWaveformCanvas } from '../components/AudioWaveformCanvas';
import { InteractiveMicrophone, VoiceState } from '../components/InteractiveMicrophone';
import {
  SUPPORTED_LANGUAGES,
  WebAudioVisualizer,
  translateOffline,
  speakText
} from '../services/voiceAiService';

interface Props {
  onNavigate: (path: string) => void;
}

export function VoiceAiPage({ onNavigate }: Props) {
  const [voiceState, setVoiceState] = useState<VoiceState>('ready');
  const [selectedLang, setSelectedLang] = useState('sat');
  const [spokenText, setSpokenText] = useState('आज हम पेड़-पौधों और जल के बारे में सीखेंगे।');
  const [translatedText, setTranslatedText] = useState('ᱛᱮᱦᱮᱧ ᱟᱵᱚ ᱫᱟᱨᱮ ᱱᱟᱹᱲᱤ ᱟᱨ ᱫᱟᱜ ᱵᱟᱵᱚᱛ ᱵᱚᱱ ᱪᱮᱫᱚᱜ-ᱟ ᱾');
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioSpeed, setAudioSpeed] = useState(0.85);

  const visualizerRef = useRef<WebAudioVisualizer | null>(null);
  const [freqData, setFreqData] = useState<Uint8Array>(new Uint8Array(128));

  useEffect(() => {
    visualizerRef.current = new WebAudioVisualizer();
    return () => {
      if (visualizerRef.current) visualizerRef.current.stopListening();
    };
  }, []);

  useEffect(() => {
    let animId: number;
    const poll = () => {
      if (visualizerRef.current) {
        setFreqData(visualizerRef.current.getFrequencyData());
      }
      animId = requestAnimationFrame(poll);
    };
    animId = requestAnimationFrame(poll);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleToggleVoice = async () => {
    if (voiceState === 'ready') {
      await visualizerRef.current?.startListening();
      setVoiceState('listening');
      setSpokenText('');
      setTranslatedText('');

      setTimeout(() => setSpokenText('आज हम '), 700);
      setTimeout(() => setSpokenText('आज हम पेड़-पौधों '), 1400);
      setTimeout(() => setSpokenText('आज हम पेड़-पौधों और जल के बारे में सीखेंगे।'), 2200);
    } else if (voiceState === 'listening') {
      visualizerRef.current?.stopListening();
      setVoiceState('processing');

      setTimeout(() => {
        setVoiceState('translating');
        const trans = translateOffline(spokenText || 'आज हम पेड़-पौधों और जल के बारे में सीखेंगे।', selectedLang);
        setTranslatedText(trans);

        setTimeout(() => {
          setVoiceState('speaking');
          setIsSpeaking(true);
          speakText(trans, selectedLang).then(() => {
            setIsSpeaking(false);
            setVoiceState('ready');
          });
        }, 800);
      }, 900);
    } else if (voiceState === 'speaking') {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
      setVoiceState('ready');
    } else {
      setVoiceState('ready');
    }
  };

  const handleSpeakOutput = () => {
    if (isSpeaking) {
      window.speechSynthesis?.cancel();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakText(translatedText, selectedLang).then(() => setIsSpeaking(false));
    }
  };

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang) || SUPPORTED_LANGUAGES[1];

  return (
    <div className="min-h-screen pt-20 pb-24 bg-stone-50 dark:bg-navy-950 text-slate-900 dark:text-white flex flex-col">
      {/* Studio Header Bar */}
      <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80">
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center gap-2 text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-xs font-black tracking-widest uppercase text-emerald-600 dark:text-emerald-400">
            ● JANBHASHA LIVE AI STUDIO
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span>Latency: <strong>1.8s</strong></span>
        </div>
      </div>

      {/* Main Studio Interactive Stage */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 flex-1 flex flex-col items-center justify-center my-6">
        {/* Language Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 bg-white dark:bg-navy-900 p-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md">
          {SUPPORTED_LANGUAGES.filter((l) => l.code !== 'hi').map((lang) => {
            const isSelected = lang.code === selectedLang;
            return (
              <button
                key={lang.code}
                onClick={() => {
                  setSelectedLang(lang.code);
                  setTranslatedText(translateOffline(spokenText, lang.code));
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-gradient-to-r from-saffron-500 to-amber-600 text-white shadow-md'
                    : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span>{lang.flag}</span>
                <span>{lang.name}</span>
                <span className="text-[10px] opacity-80 hidden sm:inline">({lang.nativeName})</span>
              </button>
            );
          })}
        </div>

        {/* Live Audio Waveform Canvas */}
        <div className="w-full bg-white/50 dark:bg-navy-900/50 backdrop-blur-md rounded-3xl border border-slate-200 dark:border-slate-800/80 p-4 shadow-inner mb-6">
          <AudioWaveformCanvas
            frequencyData={freqData}
            isActive={voiceState === 'listening' || voiceState === 'speaking'}
            state={voiceState}
            height={180}
          />
        </div>

        {/* Big Center Microphone */}
        <div className="my-2">
          <InteractiveMicrophone
            state={voiceState}
            onToggle={handleToggleVoice}
            detectedLang="Hindi 🇮🇳"
            targetLang={currentLangObj.name}
            confidence={99}
            size="large"
          />
        </div>

        {/* Dual Live Speech Card */}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {/* Spoken Transcription */}
          <div className="p-5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
              <span>🇮🇳 SPOKEN SPEECH (HINDI)</span>
              <span className="text-emerald-500">Live 99%</span>
            </div>
            <p className="text-base font-semibold text-slate-900 dark:text-white leading-relaxed min-h-[60px]">
              {spokenText || <span className="text-slate-400 italic">Listening...</span>}
            </p>
          </div>

          {/* Real-time Tribal Translation */}
          <div className="p-5 rounded-2xl bg-saffron-50 dark:bg-saffron-950/40 border border-saffron-200 dark:border-saffron-800 shadow-sm">
            <div className="flex items-center justify-between text-xs font-bold text-saffron-800 dark:text-saffron-300 mb-2">
              <span>{currentLangObj.flag} TRANSLATED IN {currentLangObj.name.toUpperCase()}</span>
              <span className="text-[10px] bg-saffron-500/20 px-2 py-0.5 rounded-full font-extrabold">
                {currentLangObj.script}
              </span>
            </div>
            <p className="text-base font-bold text-saffron-950 dark:text-saffron-100 leading-relaxed min-h-[60px]">
              {translatedText || <span className="text-slate-400 italic">Translating...</span>}
            </p>

            {/* Audio Control Bar */}
            <div className="flex items-center justify-between pt-3 border-t border-saffron-200 dark:border-saffron-800/60 mt-3">
              <button
                onClick={handleSpeakOutput}
                className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-saffron-600 hover:bg-saffron-500 text-white shadow transition-all cursor-pointer"
              >
                {isSpeaking ? <Square size={13} /> : <Volume2 size={13} />}
                <span>{isSpeaking ? 'Stop Speech' : 'Play Speech'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(translatedText);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-saffron-100 dark:hover:bg-saffron-900/40 cursor-pointer"
                  title="Copy"
                >
                  {copied ? <Check size={16} className="text-emerald-500" /> : <Copy size={16} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
