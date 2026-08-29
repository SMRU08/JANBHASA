import React, { useState, useEffect } from 'react';
import { Mic, Moon, Sun, Globe, Wifi, WifiOff, Menu, X, Sparkles, BookOpen, Layers, Camera, ShieldCheck, GraduationCap } from 'lucide-react';

interface Props {
  currentPath: string;
  onNavigate: (path: string) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export function Navbar({ currentPath, onNavigate, isDarkMode, onToggleTheme }: Props) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Voice AI', path: '/voice-ai', badge: 'LIVE' },
    { label: 'AI Tutor', path: '/ai' },
    { label: 'Translate', path: '/translate' },
    { label: 'OCR Scanner', path: '/ocr' },
    { label: 'Learn', path: '/learn' },
    { label: 'Languages', path: '/languages' },
    { label: 'Teacher Hub', path: '/teacher' },
    { label: 'Offline Mode', path: '/offline' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/85 dark:bg-navy-950/85 backdrop-blur-md shadow-sm border-b border-slate-200/60 dark:border-slate-800/60 py-3'
          : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <button
          onClick={() => {
            onNavigate('/');
            setMobileMenuOpen(false);
          }}
          className="flex items-center gap-3 group text-left cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-saffron-500 to-emerald-500 p-0.5 shadow-md group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-white dark:bg-navy-900 rounded-[10px] flex items-center justify-center">
              <span className="text-xl">🎙️</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg md:text-xl font-black tracking-tight text-slate-900 dark:text-white">
                JANBHASHA
              </span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <span className="text-[10px] font-semibold text-saffron-600 dark:text-saffron-400 block -mt-1 tracking-wider uppercase">
              जनभाषा • ᱥᱟᱱᱛᱟᱲᱤ • ᱦᱳ
            </span>
          </div>
        </button>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <button
                key={link.path}
                onClick={() => onNavigate(link.path)}
                className={`px-3 py-1.5 rounded-lg text-xs xl:text-sm font-semibold transition-all relative cursor-pointer ${
                  isActive
                    ? 'text-brand-600 dark:text-brand-400 bg-brand-50/80 dark:bg-brand-950/60 font-bold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/60'
                }`}
              >
                {link.label}
                {link.badge && (
                  <span className="ml-1.5 text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-saffron-500 text-white animate-pulse">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Right Actions */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Offline Status Badge */}
          <button
            onClick={() => onNavigate('/offline')}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
            title="Offline AI Engine Ready"
          >
            <Wifi size={13} className="text-emerald-500" />
            <span className="hidden md:inline">Offline AI Ready</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? <Sun size={18} className="text-saffron-400" /> : <Moon size={18} />}
          </button>

          {/* Try Voice AI Main CTA */}
          <button
            onClick={() => onNavigate('/voice-ai')}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-brand-600 to-saffron-600 hover:from-brand-500 hover:to-saffron-500 text-white font-bold text-xs md:text-sm shadow-md shadow-brand-500/20 hover:shadow-brand-500/30 active:scale-95 transition-all cursor-pointer"
          >
            <Mic size={15} />
            <span>Try Voice AI</span>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex sm:hidden items-center gap-2">
          <button
            onClick={onToggleTheme}
            className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300"
          >
            {isDarkMode ? <Sun size={18} className="text-saffron-400" /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-navy-900 border-b border-slate-200 dark:border-slate-800 px-4 pt-3 pb-6 shadow-xl space-y-2 mt-2">
          {navLinks.map((link) => {
            const isActive = currentPath === link.path;
            return (
              <button
                key={link.path}
                onClick={() => {
                  onNavigate(link.path);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-left ${
                  isActive
                    ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 font-bold'
                    : 'text-slate-700 dark:text-slate-300'
                }`}
              >
                <span>{link.label}</span>
                {link.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-saffron-500 text-white">
                    {link.badge}
                  </span>
                )}
              </button>
            );
          })}
          <div className="pt-3">
            <button
              onClick={() => {
                onNavigate('/voice-ai');
                setMobileMenuOpen(false);
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-brand-600 to-saffron-600 text-white font-bold text-sm shadow-md"
            >
              <Mic size={16} />
              <span>Launch Voice AI Studio</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
