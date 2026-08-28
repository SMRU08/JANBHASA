/**
 * JANBHASHA Theme - Combined exports, theme objects, and useTheme hook
 */
import { useColorScheme } from 'react-native';
import { Colors } from './colors';
import { Typography, Spacing, Radius, Shadows } from './typography';
import { useSettingsStore } from '../store/settingsStore';

export { Colors, Typography, Spacing, Radius, Shadows };

export type ThemeColors = typeof Colors.light | typeof Colors.dark;

export interface Theme {
  colors: ThemeColors;
  typography: typeof Typography;
  spacing: typeof Spacing;
  radius: typeof Radius;
  shadows: typeof Shadows;
  isDark: boolean;
}

export const lightTheme: Theme = {
  colors: Colors.light,
  typography: Typography,
  spacing: Spacing,
  radius: Radius,
  shadows: Shadows,
  isDark: false,
};

export const darkTheme: Theme = {
  colors: Colors.dark,
  typography: Typography,
  spacing: Spacing,
  radius: Radius,
  shadows: Shadows,
  isDark: true,
};

/** Hook to get the current theme based on settings + system preference */
export function useTheme(): Theme {
  const systemScheme = useColorScheme();
  let darkMode: string;
  try {
    darkMode = useSettingsStore.getState().darkMode;
  } catch {
    darkMode = 'system';
  }
  const isDark =
    darkMode === 'dark' || (darkMode === 'system' && systemScheme === 'dark');
  return isDark ? darkTheme : lightTheme;
}

// Navigation theme adapter for React Navigation
export const lightNavTheme = {
  dark: false,
  colors: {
    primary: Colors.light.primary,
    background: Colors.light.background,
    card: Colors.light.surface,
    text: Colors.light.text,
    border: Colors.light.border,
    notification: Colors.light.secondary,
  },
};

export const darkNavTheme = {
  dark: true,
  colors: {
    primary: Colors.dark.primary,
    background: Colors.dark.background,
    card: Colors.dark.surface,
    text: Colors.dark.text,
    border: Colors.dark.border,
    notification: Colors.dark.secondary,
  },
};
