import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type DarkMode = 'light' | 'dark' | 'system';
export type PerformanceMode = 'standard' | 'battery_saver' | 'low_ram';

interface SettingsState {
  darkMode: DarkMode;
  voiceEnabled: boolean;
  soundEffects: boolean;
  animationsEnabled: boolean;
  performanceMode: PerformanceMode;
  backendUrl: string;
  autoBackup: boolean;
  setDarkMode: (mode: DarkMode) => void;
  setVoiceEnabled: (v: boolean) => void;
  setSoundEffects: (v: boolean) => void;
  setAnimationsEnabled: (v: boolean) => void;
  setPerformanceMode: (mode: PerformanceMode) => void;
  setBackendUrl: (url: string) => void;
  setAutoBackup: (v: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      darkMode: 'system',
      voiceEnabled: true,
      soundEffects: true,
      animationsEnabled: true,
      performanceMode: 'standard',
      backendUrl: 'http://localhost:8000',
      autoBackup: false,
      setDarkMode: (darkMode) => set({ darkMode }),
      setVoiceEnabled: (voiceEnabled) => set({ voiceEnabled }),
      setSoundEffects: (soundEffects) => set({ soundEffects }),
      setAnimationsEnabled: (animationsEnabled) => set({ animationsEnabled }),
      setPerformanceMode: (performanceMode) => set({ performanceMode }),
      setBackendUrl: (backendUrl) => set({ backendUrl }),
      setAutoBackup: (autoBackup) => set({ autoBackup }),
    }),
    { name: 'janbhasha-settings', storage: createJSONStorage(() => AsyncStorage) }
  )
);
