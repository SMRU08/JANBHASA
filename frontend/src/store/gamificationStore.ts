import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Badge {
  id: number;
  badge_key: string;
  icon: string;
  name_hi: string;
  name_en: string;
  description_en: string;
  xp_reward: number;
  earned_at?: string;
}

interface GamificationState {
  totalXp: number;
  level: number;
  currentStreak: number;
  longestStreak: number;
  earnedBadges: Badge[];
  lessonsCompleted: number;
  quizzesPassed: number;
  lastActivityDate: string | null;
  pendingXp: number; // XP to animate

  setStats: (stats: Partial<GamificationState>) => void;
  addXp: (amount: number) => void;
  addBadge: (badge: Badge) => void;
  updateStreak: (streak: number) => void;
  setPendingXp: (xp: number) => void;
}

function xpToLevel(xp: number): number {
  return Math.max(1, Math.floor(xp / 100) + 1);
}

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      totalXp: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      earnedBadges: [],
      lessonsCompleted: 0,
      quizzesPassed: 0,
      lastActivityDate: null,
      pendingXp: 0,

      setStats: (stats) => set((s) => ({ ...s, ...stats })),
      addXp: (amount) =>
        set((s) => {
          const newXp = s.totalXp + amount;
          return { totalXp: newXp, level: xpToLevel(newXp), pendingXp: amount };
        }),
      addBadge: (badge) =>
        set((s) => ({
          earnedBadges: s.earnedBadges.some((b) => b.id === badge.id)
            ? s.earnedBadges
            : [...s.earnedBadges, badge],
        })),
      updateStreak: (streak) =>
        set((s) => ({
          currentStreak: streak,
          longestStreak: Math.max(s.longestStreak, streak),
        })),
      setPendingXp: (pendingXp) => set({ pendingXp }),
    }),
    { name: 'janbhasha-gamification', storage: createJSONStorage(() => AsyncStorage) }
  )
);
