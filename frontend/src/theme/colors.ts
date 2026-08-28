/**
 * JANBHASHA Color Tokens
 * Modern, accessible palette designed for Indian rural and multilingual education.
 */
export const Colors = {
  light: {
    primary: '#059669',        // Emerald Green
    primaryDark: '#047857',
    primaryLight: '#D1FAE5',
    secondary: '#D97706',      // Saffron Amber
    secondaryDark: '#B45309',
    secondaryLight: '#FEF3C7',
    accent: '#7C3AED',         // Royal Purple
    accentLight: '#EDE9FE',
    background: '#F8FAFC',     // Clean Soft Slate
    surface: '#FFFFFF',
    card: '#FFFFFF',
    border: '#E2E8F0',
    borderLight: '#F1F5F9',
    text: '#0F172A',
    textSecondary: '#475569',
    textMuted: '#94A3B8',
    textOnPrimary: '#FFFFFF',
    error: '#E11D48',          // Rose Red
    errorLight: '#FFE4E6',
    success: '#10B981',
    successLight: '#D1FAE5',
    warning: '#F59E0B',
    warningDark: '#D97706',
    warningLight: '#FEF3C7',
    info: '#0284C7',           // Sky Blue
    infoLight: '#E0F2FE',
    // Role colors
    teacher: '#059669',
    student: '#D97706',
    admin: '#7C3AED',
    parent: '#0284C7',
    // Gamification
    xp: '#F59E0B',
    streak: '#EA580C',
    badge: '#7C3AED',
    // Subjects
    math: '#2563EB',
    language: '#059669',
    science: '#7C3AED',
    evs: '#0D9488',
    english: '#DC2626',
    // Status
    online: '#10B981',
    offline: '#94A3B8',
    pending: '#F59E0B',
    locked: '#E11D48',
  },
  dark: {
    primary: '#10B981',
    primaryDark: '#059669',
    primaryLight: '#064E3B',
    secondary: '#F59E0B',
    secondaryDark: '#D97706',
    secondaryLight: '#78350F',
    accent: '#8B5CF6',
    accentLight: '#4C1D95',
    background: '#0F172A',     // Dark Slate
    surface: '#1E293B',
    card: '#1E293B',
    border: '#334155',
    borderLight: '#1E293B',
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
    textOnPrimary: '#FFFFFF',
    error: '#F43F5E',
    errorLight: '#881337',
    success: '#10B981',
    successLight: '#064E3B',
    warning: '#FBBF24',
    warningDark: '#F59E0B',
    warningLight: '#78350F',
    info: '#38BDF8',
    infoLight: '#0C4A6E',
    teacher: '#10B981',
    student: '#FBBF24',
    admin: '#C084FC',
    parent: '#38BDF8',
    xp: '#FBBF24',
    streak: '#FB923C',
    badge: '#C084FC',
    math: '#60A5FA',
    language: '#34D399',
    science: '#C084FC',
    evs: '#2DD4BF',
    english: '#F87171',
    online: '#10B981',
    offline: '#64748B',
    pending: '#FBBF24',
    locked: '#F43F5E',
  },
} as const;
