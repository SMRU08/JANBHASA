import { create } from 'zustand';
import { Language, LanguageCode, LanguagePair } from '../types/language';

const INITIAL_LANGUAGES: Record<LanguageCode, Language> = {
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'मानक हिंदी',
    defaultScript: 'Deva',
    supportedScripts: ['Deva'],
  },
  sat: {
    code: 'sat',
    name: 'Santali',
    nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ',
    defaultScript: 'Olck',
    supportedScripts: ['Olck', 'Deva'],
  },
  hoc: {
    code: 'hoc',
    name: 'Ho',
    nativeName: 'ᱦᱚ',
    defaultScript: 'Wara',
    supportedScripts: ['Wara', 'Deva'],
  },
  unr: {
    code: 'unr',
    name: 'Mundari',
    nativeName: 'ᱢᱩᱱᱰᱟᱨᱤ',
    defaultScript: 'Deva',
    supportedScripts: ['Deva'],
  },
};

const INITIAL_PAIRS: LanguagePair[] = [
  {
    id: 'hi-sat',
    sourceLanguage: 'hi',
    sourceScript: 'Deva',
    targetLanguage: 'sat',
    targetScript: 'Olck',
    isAvailableOffline: true,
  },
  {
    id: 'sat-hi',
    sourceLanguage: 'sat',
    sourceScript: 'Olck',
    targetLanguage: 'hi',
    targetScript: 'Deva',
    isAvailableOffline: true,
  },
  {
    id: 'hi-hoc',
    sourceLanguage: 'hi',
    sourceScript: 'Deva',
    targetLanguage: 'hoc',
    targetScript: 'Wara',
    isAvailableOffline: false, // Discovered dynamically
  },
  {
    id: 'hi-unr',
    sourceLanguage: 'hi',
    sourceScript: 'Deva',
    targetLanguage: 'unr',
    targetScript: 'Deva',
    isAvailableOffline: false, // Discovered dynamically
  },
];

interface LanguageState {
  sourceLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  supportedLanguages: Record<LanguageCode, Language>;
  supportedPairs: LanguagePair[];

  setSourceLanguage: (code: LanguageCode) => void;
  setTargetLanguage: (code: LanguageCode) => void;
  swapLanguages: () => void;
  updateSupportedPairs: (pairs: LanguagePair[]) => void;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  sourceLanguage: 'hi',
  targetLanguage: 'sat',
  supportedLanguages: INITIAL_LANGUAGES,
  supportedPairs: INITIAL_PAIRS,

  setSourceLanguage: (sourceLanguage) => set({ sourceLanguage }),
  setTargetLanguage: (targetLanguage) => set({ targetLanguage }),
  swapLanguages: () => {
    const { sourceLanguage, targetLanguage, supportedPairs } = get();
    // Validate if reverse pair is supported offline
    const hasReverse = supportedPairs.some(
      (p) => p.sourceLanguage === targetLanguage && p.targetLanguage === sourceLanguage && p.isAvailableOffline
    );
    if (hasReverse) {
      set({ sourceLanguage: targetLanguage, targetLanguage: sourceLanguage });
    }
  },
  updateSupportedPairs: (supportedPairs) => set({ supportedPairs }),
}));
