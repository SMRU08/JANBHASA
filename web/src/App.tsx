import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { HomePage } from './pages/HomePage';
import { VoiceAiPage } from './pages/VoiceAiPage';
import { AiChatPage } from './pages/AiChatPage';
import { TranslatePage } from './pages/TranslatePage';
import { LanguagesPage } from './pages/LanguagesPage';
import { OcrScannerPage } from './pages/OcrScannerPage';
import { LearnDashboardPage } from './pages/LearnDashboardPage';
import { TeacherDashboardPage } from './pages/TeacherDashboardPage';
import { OfflineManagerPage } from './pages/OfflineManagerPage';

export function App() {
  const [currentPath, setCurrentPath] = useState('/');
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleNavigate = (path: string) => {
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContent = () => {
    switch (currentPath) {
      case '/voice-ai':
        return <VoiceAiPage onNavigate={handleNavigate} />;
      case '/ai':
        return <AiChatPage />;
      case '/translate':
        return <TranslatePage />;
      case '/languages':
        return <LanguagesPage />;
      case '/ocr':
        return <OcrScannerPage />;
      case '/learn':
        return <LearnDashboardPage onNavigate={handleNavigate} />;
      case '/teacher':
        return <TeacherDashboardPage onNavigate={handleNavigate} />;
      case '/offline':
        return <OfflineManagerPage />;
      default:
        return <HomePage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50 dark:bg-navy-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Top Navbar */}
      <Navbar
        currentPath={currentPath}
        onNavigate={handleNavigate}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />

      {/* Main Page Body */}
      <main className="flex-1">
        {renderContent()}
      </main>

      {/* Floating Center Mic Mobile Bottom Navigation */}
      <MobileBottomNav currentPath={currentPath} onNavigate={handleNavigate} />

      {/* Global Footer */}
      <Footer onNavigate={handleNavigate} />
    </div>
  );
}
