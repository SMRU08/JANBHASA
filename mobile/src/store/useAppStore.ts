import { create } from 'zustand';
import { AudioInferenceJSI } from '../native-bridges/AudioInferenceJSI';

export type UserRole = 'teacher' | 'student';
export type TargetLanguage = 'sat_Olck' | 'hoc_Wara' | 'unr_Deva';

interface AppState {
  role: UserRole;
  targetLanguage: TargetLanguage;
  isInitialized: boolean;
  freeRAM_MB: number;
  isLowMemory: boolean;
  modelIntegrity: {
    whisperInt8: boolean;
    indicTrans2Int8: boolean;
    vitsInt8: boolean;
  };
  setRole: (role: UserRole) => void;
  setTargetLanguage: (lang: TargetLanguage) => void;
  checkSystemHealth: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  role: 'teacher',
  targetLanguage: 'sat_Olck',
  isInitialized: false,
  freeRAM_MB: 1200,
  isLowMemory: false,
  modelIntegrity: {
    whisperInt8: true,
    indicTrans2Int8: true,
    vitsInt8: true,
  },
  setRole: (role) => set({ role }),
  setTargetLanguage: (targetLanguage) => set({ targetLanguage }),
  checkSystemHealth: () => {
    const mem = AudioInferenceJSI.getMemoryStatus();
    set({
      freeRAM_MB: mem.freeRAM_MB,
      isLowMemory: mem.isLowMemory,
      isInitialized: true,
    });
  },
}));
