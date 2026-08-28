import React, { useRef } from 'react';
import { TouchableOpacity, View, Text, StyleSheet, Animated } from 'react-native';
import { useTheme } from '../theme';

type Role = 'teacher' | 'student' | 'admin';

const ROLE_CONFIG: Record<Role, { emoji: string; bg: string; border: string }> = {
  teacher: { emoji: '👩‍🏫', bg: '#E8F5E9', border: '#4CAF50' },
  student: { emoji: '👨‍🎓', bg: '#FFF3E0', border: '#FF9800' },
  admin:   { emoji: '🔐', bg: '#F3E5F5', border: '#7B1FA2' },
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
            transform: [{ scale }]
          }
        ]}
      >
        <Text style={styles.emoji}>{config.emoji}</Text>
        <View style={styles.textBox}>
          <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
          {description && <Text style={[styles.desc, { color: theme.colors.textSecondary }]}>{description}</Text>}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 18, borderWidth: 2, padding: 20, marginBottom: 14 },
  emoji: { fontSize: 44, marginRight: 18 },
  textBox: { flex: 1 },
  title: { fontSize: 20, fontWeight: '700' },
  desc: { fontSize: 13, marginTop: 3 },
});
