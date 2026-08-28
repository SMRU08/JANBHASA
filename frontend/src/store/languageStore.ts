import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setLanguage } from '../locales/i18n';

interface LanguageState {
  selectedLanguage: string;
  setSelectedLanguage: (code: string) => Promise<void>;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      selectedLanguage: 'hi',
      setSelectedLanguage: async (code: string) => {
        await setLanguage(code);
        set({ selectedLanguage: code });
      },
    }),
    { name: 'janbhasha-language', storage: createJSONStorage(() => AsyncStorage) }
  )
);
