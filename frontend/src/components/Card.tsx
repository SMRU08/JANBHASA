import React from 'react';
import { View, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { useTheme } from '../theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  elevation?: 'none' | 'sm' | 'md' | 'lg';
  noPadding?: boolean;
}

export function Card({ children, style, onPress, elevation = 'md', noPadding = false }: Props) {
  const theme = useTheme();
  const shadow = theme.shadows[elevation] || {};
  const content = (
    <View style={[styles.card, { backgroundColor: theme.colors.card, borderRadius: theme.radius.lg, borderColor: theme.colors.border }, shadow, !noPadding && styles.padding, style]}>
      {children}
    </View>
  );
  if (onPress) {
    return <TouchableOpacity onPress={onPress} activeOpacity={0.85} accessibilityRole="button">{content}</TouchableOpacity>;
  }
  return content;
}

const styles = StyleSheet.create({
  card: { borderWidth: 0.5, overflow: 'hidden' },
  padding: { padding: 16 },
});
