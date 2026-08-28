/**
 * i18next configuration for JANBHASHA
 * Supports: Hindi (hi), English (en), Odia (or), Santali (sat), Ho (ho), Mundari (mun)
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import hi from './hi.json';
import en from './en.json';
import or from './or.json';
import sat from './sat.json';
import ho from './ho.json';
import mun from './mun.json';

const LANGUAGE_KEY = '@janbhasha_language';

export const SUPPORTED_LANGUAGES = [
  { code: 'hi', name: 'हिंदी', nativeName: 'हिंदी', englishName: 'Hindi', script: 'Devanagari', flag: '🇮🇳' },
  { code: 'en', name: 'English', nativeName: 'English', englishName: 'English', script: 'Latin', flag: '🌐' },
  { code: 'or', name: 'ଓଡ଼ିଆ', nativeName: 'ଓଡ଼ିଆ', englishName: 'Odia', script: 'Odia', flag: '🇮🇳' },
  { code: 'sat', name: 'ᱥᱟᱱᱛᱟᱲᱤ', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', englishName: 'Santali', script: 'Ol_Chiki', flag: '🌿' },
  { code: 'ho', name: 'हो', nativeName: 'हो', englishName: 'Ho', script: 'Devanagari', flag: '🌿' },
  { code: 'mun', name: 'मुंडारी', nativeName: 'मुंडारी', englishName: 'Mundari', script: 'Devanagari', flag: '🌿' },
];

async function getStoredLanguage(): Promise<string> {
  try {
    const lang = await AsyncStorage.getItem(LANGUAGE_KEY);
    return lang || 'hi';
  } catch {
    return 'hi';
  }
}

export async function setLanguage(code: string): Promise<void> {
  await AsyncStorage.setItem(LANGUAGE_KEY, code);
  await i18n.changeLanguage(code);
}

export async function initI18n(): Promise<void> {
  const lang = await getStoredLanguage();
  if (!i18n.isInitialized) {
    await i18n
      .use(initReactI18next)
      .init({
        resources: { hi: { translation: hi }, en: { translation: en }, or: { translation: or }, sat: { translation: sat }, ho: { translation: ho }, mun: { translation: mun } },
        lng: lang,
        fallbackLng: 'hi',
        interpolation: { escapeValue: false },
        compatibilityJSON: 'v4',
      });
  }
}

// Auto-initialize
initI18n().catch(console.warn);

export default i18n;
