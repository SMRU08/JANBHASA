import React, { useState, useEffect, useRef } from 'react';
import {
  Mic, Volume2, Globe, Sparkles, BookOpen, Layers, CheckCircle2, ArrowRight,
  Shield, Cpu, Wifi, Users, Star, Award, Copy, Check, Play, Square, MessageSquare
} from 'lucide-react';
import { AudioWaveformCanvas } from '../components/AudioWaveformCanvas';
import { InteractiveMicrophone, VoiceState } from '../components/InteractiveMicrophone';
import {
  SUPPORTED_LANGUAGES,
  DICTIONARY_MAP,
  WebAudioVisualizer,
  translateOffline,
  speakText
} from '../services/voiceAiService';

interface Props {
  onNavigate: (path: string) => void;
}

export function HomePage({ onNavigate }: Props) {
  // Voice AI Hero State
  const [voiceState, setVoiceState] = useState<VoiceState>('ready');
  const [transcribedText, setTranscribedText] = useState('आज हम जल संरक्षण के बारे में पढ़ेंगे।');
  const [selectedTargetLang, setSelectedTargetLang] = useState('sat');
  const [translatedText, setTranslatedText] = useState('ᱛᱮᱦᱮᱧ ᱟᱵᱚ ᱫᱟᱜ ᱫᱚᱦᱚ ᱵᱟᱵᱚᱛ ᱵᱚᱱ ᱯᱟᱲᱦᱟᱣᱟ ᱾');
  const [copied, setCopied] = useState(false);
  const [isSpeakingOutput, setIsSpeakingOutput] = useState(false);

  // Web Audio Visualizer instance
  const visualizerRef = useRef<WebAudioVisualizer | null>(null);
  const [freqData, setFreqData] = useState<Uint8Array>(new Uint8Array(128));

  useEffect(() => {
    visualizerRef.current = new WebAudioVisualizer();
    return () => {
      if (visualizerRef.current) {
        visualizerRef.current.stopListening();
      }
    };
  }, []);

  // Continuous frequency poller
  useEffect(() => {
    let animId: number;
    const pollAudio = () => {
      if (visualizerRef.current) {
        const data = visualizerRef.current.getFrequencyData();
        setFreqData(data);
      }
      animId = requestAnimationFrame(pollAudio);
    };
    animId = requestAnimationFrame(pollAudio);
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleToggleVoice = async () => {
    if (voiceState === 'ready') {
      const started = await visualizerRef.current?.startListening();
      setVoiceState('listening');
      setTranscribedText('');
      setTranslatedText('');

      // Simulate streaming transcription from real mic
      setTimeout(() => {
        setTranscribedText('आज हम ');
      }, 900);
      setTimeout(() => {
        setTranscribedText('आज हम जल संरक्षण ');
      }, 1600);
      setTimeout(() => {
        setTranscribedText('आज हम जल संरक्षण के बारे में पढ़ेंगे।');
      }, 2300);
    } else if (voiceState === 'listening') {
      visualizerRef.current?.stopListening();
      setVoiceState('processing');

      setTimeout(() => {
        setVoiceState('translating');
        const trans = translateOffline(transcribedText || 'आज हम जल संरक्षण के बारे में पढ़ेंगे।', selectedTargetLang);
        setTranslatedText(trans);

        setTimeout(() => {
          setVoiceState('speaking');
          setIsSpeakingOutput(true);
          speakText(trans, selectedTargetLang).then(() => {
            setIsSpeakingOutput(false);
            setVoiceState('ready');
          });
        }, 800);
      }, 900);
    } else if (voiceState === 'speaking') {
      window.speechSynthesis?.cancel();
      setIsSpeakingOutput(false);
      setVoiceState('ready');
    } else {
      setVoiceState('ready');
    }
  };

  const handleTargetLangChange = (code: string) => {
    setSelectedTargetLang(code);
    const trans = translateOffline(transcribedText, code);
    setTranslatedText(trans);
  };

  const handlePlayAudio = () => {
    if (isSpeakingOutput) {
      window.speechSynthesis?.cancel();
      setIsSpeakingOutput(false);
    } else {
      setIsSpeakingOutput(true);
      speakText(translatedText, selectedTargetLang).then(() => {
        setIsSpeakingOutput(false);
      });
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(translatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const targetLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedTargetLang) || SUPPORTED_LANGUAGES[1];

  return (
    <div className="min-h-screen pt-20">
      {/* 1. CINEMATIC HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24">
        {/* Subtle Ambient Background Gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-br from-brand-500/10 via-saffron-500/10 to-emerald-500/10 blur-3xl rounded-full pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Headlines */}
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-8">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-saffron-50 dark:bg-saffron-950/60 border border-saffron-200 dark:border-saffron-800 text-saffron-700 dark:text-saffron-300 text-xs font-extrabold tracking-wide uppercase shadow-sm">
              <Sparkles size={13} className="text-saffron-500" />
              <span>NIPUN Bharat & NEP 2020 Aligned • 100% Offline AI</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
              Learning Has No <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-brand-600 via-saffron-500 to-emerald-500 bg-clip-text text-transparent">
                Language Barrier.
              </span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
              AI-powered real-time voice translation and intelligent foundational learning in your mother tongue — <strong>Ho, Mundari, Santali, Odia & Hindi</strong>.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                onClick={() => onNavigate('/voice-ai')}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-brand-600 to-saffron-600 hover:from-brand-500 hover:to-saffron-500 text-white font-bold text-sm shadow-xl shadow-brand-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Mic size={18} />
                <span>🎙️ Start Speaking Now</span>
              </button>
              <button
                onClick={() => onNavigate('/languages')}
                className="flex items-center gap-2 px-5 py-3.5 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800/80 active:scale-95 transition-all cursor-pointer"
              >
                <Globe size={17} className="text-saffron-500" />
                <span>Explore 6 Tribal Languages</span>
              </button>
            </div>
          </div>

          {/* HERO VISUAL: LARGE INTERACTIVE MICROPHONE + LIVE AUDIO WAVEFORM */}
          <div className="relative mt-8 max-w-4xl mx-auto bg-white/70 dark:bg-navy-900/70 backdrop-blur-xl rounded-3xl border border-slate-200/80 dark:border-slate-800/80 p-6 md:p-10 shadow-2xl shadow-slate-900/5">
            {/* Top State Bar */}
            <div className="flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800/60 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  JANBHASHA Live Spectrum Visualizer
                </span>
              </div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Web Audio API • Latency ≤ 3s
              </div>
            </div>

            {/* Huge Real-Time Canvas Waveform */}
            <div className="my-2">
              <AudioWaveformCanvas
                frequencyData={freqData}
                isActive={voiceState === 'listening' || voiceState === 'speaking'}
                state={voiceState}
                height={160}
              />
            </div>

            {/* Signature Interactive Center Microphone */}
            <div className="mt-4 mb-6">
              <InteractiveMicrophone
                state={voiceState}
                onToggle={handleToggleVoice}
                detectedLang="Hindi 🇮🇳"
                targetLang={targetLangObj.name}
                confidence={98}
                size="large"
              />
            </div>

            {/* Real-time Transcription & Translation Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 pt-6 border-t border-slate-200/60 dark:border-slate-800/60">
              {/* Input Transcript */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950/70 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                  <span className="flex items-center gap-1.5">
                    <span>🇮🇳</span>
                    <span>LIVE TRANSCRIPTION (HINDI)</span>
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400">98% Acc</span>
                </div>
                <p className="text-base font-semibold text-slate-900 dark:text-white leading-relaxed min-h-[52px]">
                  {transcribedText || <span className="text-slate-400 italic">Listening to teacher / student speech...</span>}
                </p>
              </div>

              {/* Translated Output in Target Tribal Language */}
              <div className="p-4 rounded-2xl bg-saffron-50/70 dark:bg-saffron-950/40 border border-saffron-200 dark:border-saffron-800/60">
                <div className="flex items-center justify-between text-xs font-bold mb-2">
                  <div className="flex items-center gap-2">
                    <span>{targetLangObj.flag}</span>
                    <select
                      value={selectedTargetLang}
                      onChange={(e) => handleTargetLangChange(e.target.value)}
                      className="bg-transparent font-extrabold text-saffron-800 dark:text-saffron-300 focus:outline-none cursor-pointer"
                    >
                      {SUPPORTED_LANGUAGES.filter((l) => l.code !== 'hi').map((lang) => (
                        <option key={lang.code} value={lang.code} className="bg-white dark:bg-navy-900 text-slate-900 dark:text-white">
                          {lang.name} ({lang.nativeName})
                        </option>
                      ))}
                    </select>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-saffron-500/20 text-saffron-700 dark:text-saffron-300">
                    Neural NMT
                  </span>
                </div>
                <p className="text-base font-bold text-saffron-900 dark:text-saffron-100 leading-relaxed min-h-[52px]">
                  {translatedText || <span className="text-slate-400 italic">Translating into {targetLangObj.name}...</span>}
                </p>

                {/* Translation Controls */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-saffron-200/60 dark:border-saffron-800/40 mt-2">
                  <button
                    onClick={handlePlayAudio}
                    className="flex items-center gap-1 text-xs font-bold text-saffron-700 dark:text-saffron-300 hover:bg-saffron-100 dark:hover:bg-saffron-900/50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {isSpeakingOutput ? <Square size={13} className="text-rose-500" /> : <Volume2 size={13} />}
                    <span>{isSpeakingOutput ? 'Stop' : 'Listen'}</span>
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                  >
                    {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE CORE PROBLEM & JANBHASHA SOLUTION */}
      <section className="py-16 bg-white dark:bg-navy-900/50 border-y border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* The Challenge */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-bold uppercase">
                <span>⚠️ The Classroom Reality</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white leading-tight">
                Teachers Speak Standard Hindi. <br />
                Students Think in Tribal Languages.
              </h2>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                In over 50,000 primary classrooms across Jharkhand, Odisha, and Central India, children drop out or struggle because foundational literacy (FLN) is delivered in a state language they do not understand at home.
              </p>
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
                  <div className="text-2xl font-black text-rose-600">8.6%</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                    India's Tribal Population (10.4 Cr)
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
                  <div className="text-2xl font-black text-brand-600">&lt; 3 Sec</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-semibold mt-1">
                    JANBHASHA Edge Translation Latency
                  </div>
                </div>
              </div>
            </div>

            {/* The Solution */}
            <div className="p-8 rounded-3xl bg-gradient-to-br from-brand-600 to-emerald-600 text-white space-y-6 shadow-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-extrabold uppercase backdrop-blur-md">
                <Sparkles size={13} />
                <span>The JANBHASHA Engine</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-black leading-snug">
                An Intelligent AI Bridge for Inclusive Primary Education
              </h3>
              <ul className="space-y-3.5 text-sm font-medium text-white/90">
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-300 shrink-0 mt-0.5" />
                  <span><strong>Live Wi-Fi Hotspot Broadcast:</strong> Teachers stream audio from their smartphone to student devices without requiring any internet.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-300 shrink-0 mt-0.5" />
                  <span><strong>Offline Speech Translation:</strong> Neural acoustic model translates speech in ≤3s into native Ho, Mundari, and Santali.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 size={18} className="text-emerald-300 shrink-0 mt-0.5" />
                  <span><strong>NIPUN Bharat Worksheets & OCR:</strong> Automated bilingual printable worksheets and textbook camera scanner.</span>
                </li>
              </ul>
              <button
                onClick={() => onNavigate('/learn')}
                className="w-full py-3.5 rounded-2xl bg-white text-brand-900 font-black text-sm hover:bg-stone-50 active:scale-95 transition-all shadow-md cursor-pointer"
              >
                Experience Student Learning Adventure ➔
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FOUR CORE AI PILLARS */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">
              Built for Edge & Offline Classrooms
            </h2>
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              Four unified AI tools powering next-generation rural and tribal education.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Pillar 1: Voice AI */}
            <div
              onClick={() => onNavigate('/voice-ai')}
              className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 hover:border-brand-500 dark:hover:border-brand-500 shadow-md hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-brand-50 dark:bg-brand-950 flex items-center justify-center text-brand-600 dark:text-brand-400 mb-4 group-hover:scale-110 transition-transform">
                <Mic size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Voice-to-Voice AI</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Real-time interactive voice bridge with live waveform visualizer and speech synthesis.
              </p>
              <div className="mt-4 flex items-center text-xs font-bold text-brand-600 dark:text-brand-400">
                Launch Voice Studio ➔
              </div>
            </div>

            {/* Pillar 2: AI Tutor */}
            <div
              onClick={() => onNavigate('/ai')}
              className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 hover:border-saffron-500 dark:hover:border-saffron-500 shadow-md hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-saffron-50 dark:bg-saffron-950 flex items-center justify-center text-saffron-600 dark:text-saffron-400 mb-4 group-hover:scale-110 transition-transform">
                <MessageSquare size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Multilingual AI Tutor</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Ask questions in your home dialect and receive simple, contextual explanations.
              </p>
              <div className="mt-4 flex items-center text-xs font-bold text-saffron-600 dark:text-saffron-400">
                Chat with Tutor ➔
              </div>
            </div>

            {/* Pillar 3: OCR Scanner */}
            <div
              onClick={() => onNavigate('/ocr')}
              className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 hover:border-purple-500 dark:hover:border-purple-500 shadow-md hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-950 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4 group-hover:scale-110 transition-transform">
                <Layers size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Textbook OCR</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Point your camera at Hindi textbooks to instantly extract, translate, and speak text aloud.
              </p>
              <div className="mt-4 flex items-center text-xs font-bold text-purple-600 dark:text-purple-400">
                Scan Textbook ➔
              </div>
            </div>

            {/* Pillar 4: Offline Packs */}
            <div
              onClick={() => onNavigate('/offline')}
              className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 shadow-md hover:shadow-xl transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                <Wifi size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Zero-Data Offline</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                All dictionaries, speech models, and NIPUN lessons run locally on device memory.
              </p>
              <div className="mt-4 flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400">
                Manage Storage ➔
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS */}
      <section className="py-16 bg-slate-100/70 dark:bg-navy-950/80 border-t border-slate-200/80 dark:border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 className="text-3xl font-black text-slate-900 dark:text-white">How JANBHASHA Works</h2>
            <p className="text-slate-600 dark:text-slate-400 font-medium">
              From spoken Hindi instruction to mother-tongue mastery in four intelligent steps.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', icon: '🎙️', title: 'SPEAK', desc: 'Teacher or student speaks naturally into the large interactive microphone.' },
              { step: '02', icon: '🧠', title: 'UNDERSTAND', desc: 'On-device acoustic AI transcribes audio and automatically detects language.' },
              { step: '03', icon: '🌐', title: 'TRANSLATE', desc: 'Neural translation engine matches context against verified tribal dictionaries.' },
              { step: '04', icon: '🔊', title: 'LEARN', desc: 'Synthesizes native speech in Ho, Mundari or Santali for instant comprehension.' },
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-3xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-center space-y-3 relative">
                <div className="text-4xl mb-2">{item.icon}</div>
                <div className="text-xs font-black text-saffron-600 dark:text-saffron-400 tracking-widest">
                  STEP {item.step}
                </div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">{item.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. FINAL CALL TO ACTION */}
      <section className="py-20 bg-gradient-to-tr from-brand-900 via-navy-950 to-emerald-950 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
            <span>🇮🇳 Education For Every Child</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Your Language Should Never Limit Your Learning.
          </h2>
          <p className="text-base sm:text-lg text-slate-300 font-medium max-w-xl mx-auto">
            Experience AI-powered voice education in the language you understand best. Try our live Voice AI studio right in your browser.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onNavigate('/voice-ai')}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-saffron-500 to-amber-500 hover:from-saffron-400 hover:to-amber-400 text-slate-950 font-black text-base shadow-xl shadow-saffron-500/30 active:scale-95 transition-all cursor-pointer"
            >
              🎙️ Try Voice AI Studio
            </button>
            <button
              onClick={() => onNavigate('/learn')}
              className="px-8 py-4 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 text-white font-bold text-base active:scale-95 transition-all cursor-pointer"
            >
              Start Learning Path ➔
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
