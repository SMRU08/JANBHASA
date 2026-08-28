import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme';

interface BadgeData { id: number; icon: string; name_hi: string; name_en: string; description_en: string; xp_reward: number; earned_at?: string; }
interface Props { badge: BadgeData; onPress?: () => void; }

export function BadgeCard({ badge, onPress }: Props) {
  const theme = useTheme();
  const earned = !!badge.earned_at;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.card, { backgroundColor: theme.colors.card, borderColor: earned ? theme.colors.badge : theme.colors.border, opacity: earned ? 1 : 0.45 }]}>
      <Text style={styles.icon}>{badge.icon}</Text>
      <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>{badge.name_en}</Text>
      <Text style={[styles.xp, { color: theme.colors.badge }]}>+{badge.xp_reward} XP</Text>
      {!earned && <Text style={styles.lock}>🔒</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { width: '30%', borderRadius: 14, borderWidth: 1.5, padding: 12, alignItems: 'center', margin: '1.5%' },
  icon: { fontSize: 32, marginBottom: 6 },
  name: { fontSize: 11, fontWeight: '600', textAlign: 'center' },
  xp: { fontSize: 10, fontWeight: '700', marginTop: 2 },
  lock: { position: 'absolute', top: 6, right: 6, fontSize: 12 },
});

interface LessonCardProps { lesson: { title: string; icon?: string; class_level?: string; difficulty?: number; xp_reward?: number; status?: string }; onPress: () => void; }
export function LessonCard({ lesson, onPress }: LessonCardProps) {
  const theme = useTheme();
  const statusColors: Record<string, string> = { completed: theme.colors.success, in_progress: theme.colors.secondary, not_started: theme.colors.textMuted };
  const status = lesson.status || 'not_started';
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles2.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <Text style={styles2.icon}>{lesson.icon || '📚'}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[styles2.title, { color: theme.colors.text }]} numberOfLines={2}>{lesson.title}</Text>
        <Text style={[styles2.meta, { color: theme.colors.textMuted }]}>Class {lesson.class_level} • +{lesson.xp_reward || 20} XP</Text>
      </View>
      <View style={[styles2.statusDot, { backgroundColor: statusColors[status] }]} />
    </TouchableOpacity>
  );
}
const styles2 = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10 },
  icon: { fontSize: 32, marginRight: 14 },
  title: { fontSize: 15, fontWeight: '600' },
  meta: { fontSize: 12, marginTop: 3 },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginLeft: 8 },
});
