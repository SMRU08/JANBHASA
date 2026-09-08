import { create } from 'zustand';
import { MemoryAlertLevel, MemoryStats } from '../types/model';

export type UserRole = 'teacher' | 'student';
export type AppScreen = 'onboarding' | 'role_select' | 'teacher_dash' | 'student_dash' | 'classroom' | 'translator' | 'flashcards' | 'worksheets';

interface AppState {
  isInitialized: boolean;
  currentRole: UserRole;
  currentScreen: AppScreen;
  memoryStats: MemoryStats;
  
  setInitialized: (val: boolean) => void;
  setCurrentRole: (role: UserRole) => void;
  setCurrentScreen: (screen: AppScreen) => void;
  updateMemoryStats: (stats: MemoryStats) => void;
}

export const useAppStore = create<AppState>((set) => ({
  isInitialized: false,
  currentRole: 'teacher',
  currentScreen: 'onboarding',
  memoryStats: {
    freeRamMb: 1100,
    totalRamMb: 2048,
    residentAppMemoryMb: 320,
    residentBudgetMb: 600,
    alertLevel: 'normal',
  },

  setInitialized: (isInitialized) => set({ isInitialized }),
  setCurrentRole: (currentRole) => set({ currentRole }),
  setCurrentScreen: (currentScreen) => set({ currentScreen }),
  updateMemoryStats: (memoryStats) => set({ memoryStats }),
}));
