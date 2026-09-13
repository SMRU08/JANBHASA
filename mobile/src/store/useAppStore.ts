import { create } from 'zustand';
import { apiService, HealthResponse } from '../services/apiService';
import { audioService, BluetoothDevice } from '../services/audioService';

export type AppScreen =
  | 'Splash'
  | 'Welcome'
  | 'LanguageSelection'
  | 'RoleSelection'
  | 'TeacherLogin'
  | 'StudentLogin'
  | 'TeacherDashboard'
  | 'StudentDashboard'
  | 'LiveTranslation'
  | 'TranslationResult'
  | 'AudioOutput'
  | 'BluetoothDevice'
  | 'Classroom'
  | 'StudentClassroom'
  | 'Curriculum'
  | 'LessonDetails'
  | 'Worksheets'
  | 'BilingualPdfGenerator'
  | 'Flashcards'
  | 'ModelStatus'
  | 'Settings'
  | 'Profile'
  | 'VoiceConversation'
  | 'OfflineDictionary'
  | 'OfflineModelManager';

export type AppLanguage = 'hi' | 'en' | 'sat';
export type UserRole = 'teacher' | 'student' | null;
export type AudioOutputMode = 'speaker' | 'bluetooth';

export interface TranslationData {
  sourceText: string;
  targetText: string;
  sourceLang: string;
  targetLang: string;
  audioUri?: string;
  durationSec?: number;
  engineUsed?: string;
}

interface AppState {
  currentScreen: AppScreen;
  screenHistory: AppScreen[];
  appLanguage: AppLanguage;
  role: UserRole;
  audioOutput: AudioOutputMode;
  selectedBluetoothDevice: BluetoothDevice | null;
  serverUrl: string;
  isOfflineMode: boolean;
  health: HealthResponse | null;
  healthLatencyMs: number;
  selectedSubject: any | null;
  selectedWorksheet: any | null;
  lastTranslation: TranslationData | null;

  // Actions
  navigate: (screen: AppScreen) => void;
  goBack: () => void;
  setAppLanguage: (lang: AppLanguage) => void;
  setRole: (role: UserRole) => void;
  setAudioOutput: (mode: AudioOutputMode) => void;
  setSelectedBluetoothDevice: (dev: BluetoothDevice | null) => void;
  setServerUrl: (url: string) => void;
  toggleOfflineMode: () => void;
  refreshHealth: () => Promise<void>;
  setSelectedSubject: (subject: any) => void;
  setSelectedWorksheet: (worksheet: any) => void;
  setLastTranslation: (trans: TranslationData | null) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentScreen: 'Splash',
  screenHistory: [],
  appLanguage: 'en',
  role: null,
  audioOutput: 'speaker',
  selectedBluetoothDevice: null,
  serverUrl: 'http://localhost:8000',
  isOfflineMode: false,
  health: null,
  healthLatencyMs: 0,
  selectedSubject: null,
  selectedWorksheet: null,
  lastTranslation: null,

  navigate: (screen: AppScreen) => {
    const current = get().currentScreen;
    if (current === screen) return;
    set((state) => ({
      currentScreen: screen,
      screenHistory: [...state.screenHistory, current],
    }));
  },

  goBack: () => {
    const history = get().screenHistory;
    if (history.length === 0) {
      const role = get().role;
      if (role === 'teacher') set({ currentScreen: 'TeacherDashboard' });
      else if (role === 'student') set({ currentScreen: 'StudentDashboard' });
      else set({ currentScreen: 'RoleSelection' });
      return;
    }
    const previous = history[history.length - 1];
    set({
      currentScreen: previous,
      screenHistory: history.slice(0, history.length - 1),
    });
  },

  setAppLanguage: (appLanguage) => set({ appLanguage }),
  setRole: (role) => set({ role }),

  setAudioOutput: async (audioOutput) => {
    set({ audioOutput });
    try {
      await audioService.setAudioOutputMode(audioOutput);
    } catch (err) {
      console.warn('setAudioOutput failed:', err);
    }
  },

  setSelectedBluetoothDevice: (selectedBluetoothDevice) => set({ selectedBluetoothDevice }),

  setServerUrl: (serverUrl) => {
    apiService.setBaseUrl(serverUrl);
    set({ serverUrl });
  },

  toggleOfflineMode: () => set((state) => ({ isOfflineMode: !state.isOfflineMode })),

  refreshHealth: async () => {
    const res = await apiService.checkHealth();
    if (res.isHealthy && res.data) {
      set({ health: res.data, healthLatencyMs: res.latencyMs });
    }
  },

  setSelectedSubject: (selectedSubject) => set({ selectedSubject }),
  setSelectedWorksheet: (selectedWorksheet) => set({ selectedWorksheet }),
  setLastTranslation: (lastTranslation) => set({ lastTranslation }),
}));
