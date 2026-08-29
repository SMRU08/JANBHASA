import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme';
import { AnimatedCard } from './AnimatedCard';

interface BadgeData {
  id: number;
  icon: string;
  name_hi: string;
  name_en: string;
  description_en: string;
  xp_reward: number;
  earned_at?: string;
}

interface Props {
  badge: BadgeData;
  onPress?: () => void;
}

export function BadgeCard({ badge, onPress }: Props) {
  const theme = useTheme();
  const earned = !!badge.earned_at;

  return (
    <AnimatedCard
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: theme.colors.card,
          borderColor: earned ? '#F59E0B' : theme.colors.border,
          opacity: earned ? 1 : 0.55,
        },
      ]}
    >
      {earned ? (
        <LinearGradient
          colors={['#FDE68A', '#F59E0B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconAura}
        >
          <Text style={styles.icon}>{badge.icon}</Text>
        </LinearGradient>
      ) : (
        <View style={[styles.iconAura, { backgroundColor: theme.colors.borderLight }]}>
          <Text style={[styles.icon, { opacity: 0.6 }]}>{badge.icon}</Text>
        </View>
      )}

      <Text style={[styles.name, { color: theme.colors.text }]} numberOfLines={1}>
        {badge.name_en}
      </Text>

      <View style={[styles.xpPill, { backgroundColor: earned ? '#FEF3C7' : theme.colors.borderLight }]}>
        <Text style={[styles.xp, { color: earned ? '#B45309' : theme.colors.textMuted }]}>
          +{badge.xp_reward} XP
        </Text>
      </View>

      {!earned && (
        <View style={styles.lockBadge}>
          <Text style={{ fontSize: 10 }}>🔒</Text>
        </View>
      )}
    </AnimatedCard>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '47%',
    borderRadius: 20,
    borderWidth: 2,
    padding: 14,
    alignItems: 'center',
    marginBottom: 12,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  iconAura: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  icon: {
    fontSize: 32,
  },
  name: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
  xpPill: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginTop: 6,
  },
  xp: {
    fontSize: 11,
    fontWeight: '900',
  },
  lockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    padding: 3,
  },
});

interface LessonCardProps {
  lesson: {
    title: string;
    icon?: string;
    class_level?: string;
    difficulty?: number;
    xp_reward?: number;
    status?: string;
  };
  onPress: () => void;
}

export function LessonCard({ lesson, onPress }: LessonCardProps) {
  const theme = useTheme();
  const statusColors: Record<string, string> = {
    completed: '#10B981',
    in_progress: '#F59E0B',
    not_started: theme.colors.textMuted,
  };
  const status = lesson.status || 'not_started';

  return (
    <AnimatedCard
      onPress={onPress}
      style={[
        styles2.card,
        { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
      ]}
    >
      <View style={[styles2.iconBox, { backgroundColor: theme.colors.primaryLight }]}>
        <Text style={styles2.icon}>{lesson.icon || '📚'}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles2.title, { color: theme.colors.text }]} numberOfLines={2}>
          {lesson.title}
        </Text>
        <Text style={[styles2.meta, { color: theme.colors.textMuted }]}>
          Class {lesson.class_level} • +{lesson.xp_reward || 20} XP
        </Text>
      </View>
      <View style={[styles2.statusDot, { backgroundColor: statusColors[status] }]} />
    </AnimatedCard>
  );
}

const styles2 = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 26,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
  },
  meta: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '600',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginLeft: 8,
  },
});
