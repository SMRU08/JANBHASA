import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';

interface Props { xp: number; level: number; compact?: boolean; }

export function XPBadge({ xp, level, compact = false }: Props) {
  const theme = useTheme();
  if (compact) {
    return (
      <View style={[styles.compact, { backgroundColor: theme.colors.primaryLight, borderColor: theme.colors.primary }]}>
        <Text style={styles.star}>⭐</Text>
        <Text style={[styles.xpText, { color: theme.colors.primaryDark }]}>{xp} XP</Text>
      </View>
    );
  }
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <Text style={styles.bigStar}>⭐</Text>
      <Text style={[styles.xpNum, { color: theme.colors.text }]}>{xp}</Text>
      <Text style={[styles.xpLabel, { color: theme.colors.textMuted }]}>XP</Text>
      <View style={[styles.levelBadge, { backgroundColor: theme.colors.primary }]}>
        <Text style={styles.levelText}>Lv.{level}</Text>
      </View>
    </View>
  );
}

interface StreakProps { streak: number; }
export function StreakBadge({ streak }: StreakProps) {
  const theme = useTheme();
  return (
    <View style={[styles.compact, { backgroundColor: '#FFF3E0', borderColor: theme.colors.streak }]}>
      <Text style={styles.star}>🔥</Text>
      <Text style={[styles.xpText, { color: theme.colors.streak }]}>{streak}d</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', padding: 12, borderRadius: 14, borderWidth: 1 },
  compact: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, borderWidth: 1.5, paddingHorizontal: 10, paddingVertical: 4 },
  bigStar: { fontSize: 28 },
  xpNum: { fontSize: 22, fontWeight: '800', marginTop: 2 },
  xpLabel: { fontSize: 12 },
  levelBadge: { borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4 },
  levelText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  star: { fontSize: 14, marginRight: 4 },
  xpText: { fontSize: 13, fontWeight: '700' },
});
