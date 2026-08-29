import React, { useRef } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme';

type Role = 'teacher' | 'student' | 'admin';

const ROLE_CONFIG: Record<
  Role,
  {
    emoji: string;
    gradient: [string, string];
    border: string;
    badgeText: string;
    badgeBg: string;
    badgeColor: string;
    tagline: string;
  }
> = {
  teacher: {
    emoji: '👩‍🏫',
    gradient: ['#059669', '#10B981'],
    border: '#10B981',
    badgeText: 'Teacher Portal • लाइव कक्षा',
    badgeBg: '#D1FAE5',
    badgeColor: '#047857',
    tagline: 'Live Hotspot Stream • NIPUN Worksheets',
  },
  student: {
    emoji: '🎓',
    gradient: ['#D97706', '#F59E0B'],
    border: '#F59E0B',
    badgeText: 'Student Learning • मातृभाषा',
    badgeBg: '#FEF3C7',
    badgeColor: '#B45309',
    tagline: 'Stories • Flashcards • XP Quizzes',
  },
  admin: {
    emoji: '🔐',
    gradient: ['#7C3AED', '#8B5CF6'],
    border: '#8B5CF6',
    badgeText: 'Admin Console • सिस्टम',
    badgeBg: '#EDE9FE',
    badgeColor: '#5B21B6',
    tagline: 'Schools • Language Packs • Diagnostics',
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
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true, speed: 28, bounciness: 4 }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 24, bounciness: 8 }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={{ width: '100%', marginBottom: 16 }}
    >
      <Animated.View
        style={[
          styles.cardWrapper,
          {
            backgroundColor: theme.isDark ? theme.colors.card : '#FFFFFF',
            borderColor: theme.isDark ? config.border : '#E2E8F0',
            transform: [{ scale }],
          },
        ]}
      >
        {/* Left Color Accent Strip */}
        <LinearGradient
          colors={config.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.accentStrip}
        />

        <View style={styles.contentRow}>
          {/* Avatar Box with Gradient Bevel */}
          <LinearGradient
            colors={config.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.avatarGlow}
          >
            <View style={[styles.avatarInner, { backgroundColor: theme.isDark ? theme.colors.card : '#FFFFFF' }]}>
              <Text style={styles.emoji}>{config.emoji}</Text>
            </View>
          </LinearGradient>

          <View style={styles.textBox}>
            <View style={[styles.badgeChip, { backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : config.badgeBg }]}>
              <Text style={[styles.badgeText, { color: theme.isDark ? '#F8FAFC' : config.badgeColor }]}>
                {config.badgeText}
              </Text>
            </View>
            <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
            <Text style={[styles.tagline, { color: config.border }]}>{config.tagline}</Text>
            {description && (
              <Text style={[styles.desc, { color: theme.colors.textSecondary }]} numberOfLines={2}>
                {description}
              </Text>
            )}
          </View>

          {/* Right Action Circle */}
          <LinearGradient
            colors={config.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.arrowBtn}
          >
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </LinearGradient>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  accentStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 6,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    paddingLeft: 20,
  },
  avatarGlow: {
    width: 62,
    height: 62,
    borderRadius: 20,
    padding: 2.5,
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  avatarInner: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 32,
  },
  textBox: {
    flex: 1,
  },
  badgeChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginBottom: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  tagline: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: 1,
    marginBottom: 3,
  },
  desc: {
    fontSize: 12,
    lineHeight: 16,
  },
  arrowBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
});
