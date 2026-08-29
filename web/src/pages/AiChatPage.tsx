import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Mic, Volume2, Sparkles, Bot, User, Globe, Copy, Check, Square,
  RotateCcw, ThumbsUp, ThumbsDown, Bookmark, ArrowRight
} from 'lucide-react';
import { AudioWaveformCanvas } from '../components/AudioWaveformCanvas';
import {
  SUPPORTED_LANGUAGES,
  WebAudioVisualizer,
  translateOffline,
  speakText
} from '../services/voiceAiService';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  textHi: string;
  textTribal?: string;
  langCode: string;
  timestamp: string;
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: '1',
    sender: 'ai',
    textHi: 'नमस्ते! मैं जनभाषा AI शिक्षक हूँ। आप मुझसे विज्ञान, गणित या किसी भी विषय पर अपनी मातृभाषा में पूछ सकते हैं।',
    textTribal: 'ᱡᱚᱦᱟᱨ! ᱤᱧ ᱫᱚ ᱡᱚᱱᱵᱷᱟᱥᱟ AI ᱢᱟᱪᱮᱛ ᱠᱟᱱᱟᱹᱧ ᱾ ᱟᱢ ᱡᱟᱦᱟᱸᱱᱟᱜ ᱠᱩᱠᱞᱤ ᱠᱩᱞᱤ ᱫᱟᱲᱮᱭᱟᱜ-ᱟᱢ ᱾',
    langCode: 'sat',
    timestamp: '10:00 AM'
  },
  {
    id: '2',
    sender: 'user',
    textHi: 'पौधे अपना भोजन कैसे बनाते हैं?',
    langCode: 'hi',
    timestamp: '10:01 AM'
  },
  {
    id: '3',
    sender: 'ai',
    textHi: 'पौधे सूर्य के प्रकाश, पानी और हवा (कार्बन डाइऑक्साइड) की मदद से पत्तियों में अपना भोजन बनाते हैं। इस प्रक्रिया को प्रकाश संश्लेषण कहते हैं।',
    textTribal: 'ᱫᱟᱨᱮ ᱠᱚ ᱥᱤᱧ ᱪᱟᱸᱫᱚ ᱢᱟᱨᱥᱟᱞ, ᱫᱟᱜ ᱟᱨ ᱦᱚᱭ ᱛᱮ ᱥᱟᱠᱟᱢ ᱨᱮ ᱡᱚᱢᱟᱜ ᱠᱚ ᱵᱮᱱᱟᱣᱟ ᱾ ᱱᱚᱣᱟ ᱫᱚ ᱯᱨᱚᱠᱟᱥ ᱥᱚᱝᱥᱞᱮᱥᱚᱱ ᱠᱚ ᱢᱮᱛᱟᱜ-ᱟ ᱾',
    langCode: 'sat',
    timestamp: '10:01 AM'
  }
];

export function AiChatPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputVal, setInputVal] = useState('');
  const [selectedLang, setSelectedLang] = useState('sat');
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const visualizerRef = useRef<WebAudioVisualizer | null>(null);
  const [freqData, setFreqData] = useState<Uint8Array>(new Uint8Array(128));
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!inputVal.trim()) return;

    const userText = inputVal.trim();
    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      textHi: userText,
      langCode: 'hi',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');

    // Generate Contextual AI Response
    setTimeout(() => {
      let aiHi = `बहुत अच्छा प्रश्न! "${userText}" के बारे में आसान व्याख्या: यह हमारी प्रकृति और विज्ञान का एक महत्वपूर्ण हिस्सा है।`;
      if (userText.includes('जल') || userText.includes('पानी')) {
        aiHi = 'जल ही जीवन है। हमें बारिश के पानी को तालाबों और कुओं में संरक्षित करना चाहिए ताकि गर्मियों में पानी की कमी न हो।';
      } else if (userText.includes('पेड़') || userText.includes('जंगल')) {
        aiHi = 'पेड़ हमें ऑक्सीजन, छाया और मीठे फल देते हैं। हमें हर वर्ष नए पौधे लगाने चाहिए।';
      } else if (userText.includes('गणित') || userText.includes('जोड़')) {
        aiHi = 'गणित बहुत सरल है! 5 + 5 मिलकर 10 होते हैं। दैनिक जीवन में हिसाब-किताब के लिए गणित बहुत जरूरी है।';
      }

      const aiTribal = translateOffline(aiHi, selectedLang);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        textHi: aiHi,
        textTribal: aiTribal,
        langCode: selectedLang,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages((prev) => [...prev, aiMsg]);
    }, 800);
  };

  const handleMicToggle = async () => {
    if (!isListening) {
      await visualizerRef.current?.startListening();
      setIsListening(true);
      setTimeout(() => {
        setInputVal('हम पर्यावरण को स्वच्छ कैसे रखें?');
      }, 1500);
    } else {
      visualizerRef.current?.stopListening();
      setIsListening(false);
    }
  };

  const handleSpeak = (msgId: string, text: string, lang: string) => {
    if (speakingMsgId === msgId) {
      window.speechSynthesis?.cancel();
      setSpeakingMsgId(null);
    } else {
      setSpeakingMsgId(msgId);
      speakText(text, lang).then(() => setSpeakingMsgId(null));
    }
  };

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === selectedLang) || SUPPORTED_LANGUAGES[1];

  return (
    <div className="min-h-screen pt-20 pb-24 bg-stone-50 dark:bg-navy-950 flex flex-col">
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 flex-1 flex flex-col my-4">
        {/* Chat Header */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 md:p-6 shadow-sm flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-saffron-500 p-0.5 shadow-md">
              <div className="w-full h-full bg-white dark:bg-navy-950 rounded-[14px] flex items-center justify-center text-xl">
                🤖
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-slate-900 dark:text-white">
                  JANBHASHA AI Tutor
                </h1>
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Offline Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                Bilingual AI explanations in Hindi & Mother Tongue
              </p>
            </div>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <Globe size={15} className="text-saffron-500" />
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="bg-slate-100 dark:bg-navy-950 text-xs font-bold text-slate-800 dark:text-slate-200 rounded-xl px-3 py-2 border border-slate-200 dark:border-slate-800 focus:outline-none cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.filter((l) => l.code !== 'hi').map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.name} ({lang.nativeName})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Live Audio Waveform (Visible during mic recording) */}
        {isListening && (
          <div className="bg-saffron-50/80 dark:bg-saffron-950/60 border border-saffron-300 dark:border-saffron-800 rounded-3xl p-3 mb-4 shadow-md">
            <div className="flex items-center justify-between text-xs font-bold text-saffron-800 dark:text-saffron-300 px-2 mb-1">
              <span>🎙️ Listening to your voice...</span>
              <span className="text-[10px] uppercase bg-saffron-500 text-white px-2 py-0.5 rounded-full">
                Active Mic
              </span>
            </div>
            <AudioWaveformCanvas
              frequencyData={freqData}
              isActive={true}
              state="listening"
              height={100}
            />
          </div>
        )}

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-brand-600 text-white flex items-center justify-center shrink-0 mt-1 shadow">
                    <Bot size={16} />
                  </div>
                )}

                <div
                  className={`max-w-xl rounded-3xl p-4 md:p-5 shadow-sm space-y-2.5 ${
                    isUser
                      ? 'bg-gradient-to-r from-brand-600 to-brand-700 text-white rounded-br-none'
                      : 'bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-bl-none'
                  }`}
                >
                  {/* Hindi Standard Explanation */}
                  <p className="text-sm md:text-base font-semibold leading-relaxed">
                    {msg.textHi}
                  </p>

                  {/* Mother Tongue Translation Card */}
                  {msg.textTribal && (
                    <div className="p-3.5 rounded-2xl bg-saffron-50/80 dark:bg-saffron-950/50 border border-saffron-200 dark:border-saffron-800/80 mt-2">
                      <div className="flex items-center justify-between text-[11px] font-extrabold text-saffron-800 dark:text-saffron-300 mb-1.5">
                        <span>{currentLangObj.flag} {currentLangObj.name.toUpperCase()} ({currentLangObj.script})</span>
                      </div>
                      <p className="text-sm md:text-base font-bold text-saffron-950 dark:text-saffron-100 leading-relaxed">
                        {msg.textTribal}
                      </p>
                    </div>
                  )}

                  {/* Message Bottom Action Bar */}
                  <div className="flex items-center justify-between pt-1 text-xs opacity-70">
                    <span>{msg.timestamp}</span>
                    {!isUser && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleSpeak(msg.id, msg.textTribal || msg.textHi, msg.langCode)}
                          className="hover:opacity-100 transition-opacity p-1 cursor-pointer flex items-center gap-1 font-bold"
                        >
                          {speakingMsgId === msg.id ? <Square size={13} className="text-rose-500" /> : <Volume2 size={13} />}
                          <span>{speakingMsgId === msg.id ? 'Stop' : 'Listen'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-saffron-500 text-white flex items-center justify-center shrink-0 mt-1 shadow">
                    <User size={16} />
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-2 md:p-3 shadow-lg flex items-center gap-2">
          <button
            onClick={handleMicToggle}
            className={`p-3 rounded-2xl transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-saffron-50 hover:text-saffron-600'
            }`}
            title={isListening ? 'Stop voice' : 'Speak question'}
          >
            <Mic size={20} />
          </button>

          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Ask in Hindi or ${currentLangObj.name}...`}
            className="flex-1 bg-transparent px-3 py-2 text-sm font-medium text-slate-900 dark:text-white focus:outline-none placeholder:text-slate-400"
          />

          <button
            onClick={handleSend}
            disabled={!inputVal.trim()}
            className="p-3 rounded-2xl bg-gradient-to-r from-brand-600 to-saffron-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:from-brand-500 hover:to-saffron-500 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
