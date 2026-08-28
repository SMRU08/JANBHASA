import React, { useRef } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';

type Role = 'teacher' | 'student' | 'admin';

const ROLE_CONFIG: Record<
  Role,
  { emoji: string; bg: string; border: string; badgeText: string; badgeBg: string; badgeColor: string }
> = {
  teacher: {
    emoji: '👩‍🏫',
    bg: '#ECFDF5',
    border: '#059669',
    badgeText: 'Teacher Portal',
    badgeBg: '#D1FAE5',
    badgeColor: '#047857',
  },
  student: {
    emoji: '👨‍🎓',
    bg: '#FFFBEB',
    border: '#D97706',
    badgeText: 'Student Learning',
    badgeBg: '#FEF3C7',
    badgeColor: '#B45309',
  },
  admin: {
    emoji: '🔐',
    bg: '#F5F3FF',
    border: '#7C3AED',
    badgeText: 'Admin Control',
    badgeBg: '#EDE9FE',
    badgeColor: '#5B21B6',
  },
};

interface Props {
  role: Role;
  title: string;
  description?: string;
  onPress: () => void;
}

export function RoleCard({ role, title, description, onPress }: Props) {
  const theme = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const config = ROLE_CONFIG[role];

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: false }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: false }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={{ width: '100%' }}
    >
      <Animated.View
        style={[
          styles.card,
          {
            backgroundColor: theme.isDark ? theme.colors.card : config.bg,
            borderColor: config.border,
            transform: [{ scale }],
          },
        ]}
      >
        <View style={[styles.avatarBox, { backgroundColor: theme.isDark ? theme.colors.surface : '#FFFFFF' }]}>
          <Text style={styles.emoji}>{config.emoji}</Text>
        </View>

        <View style={styles.textBox}>
          <View style={[styles.badgeChip, { backgroundColor: config.badgeBg }]}>
            <Text style={[styles.badgeText, { color: config.badgeColor }]}>{config.badgeText}</Text>
          </View>
          <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
          {description && (
            <Text style={[styles.desc, { color: theme.colors.textSecondary }]}>{description}</Text>
          )}
        </View>

        <View style={[styles.arrowBtn, { backgroundColor: config.border }]}>
          <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 2,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  avatarBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  emoji: {
    fontSize: 34,
  },
  textBox: {
    flex: 1,
  },
  badgeChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 19,
    fontWeight: '800',
  },
  desc: {
    fontSize: 13,
    marginTop: 2,
    lineHeight: 18,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
});
