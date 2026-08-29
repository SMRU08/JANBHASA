import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme';

interface Props {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showBack?: boolean;
  rightIcon?: string;
  onRightPress?: () => void;
  gradientColors?: [string, string];
  variant?: 'standard' | 'gradient';
}

export function Header({
  title,
  subtitle,
  onBack,
  showBack = true,
  rightIcon,
  onRightPress,
  gradientColors,
  variant = 'standard',
}: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleBack = onBack || (() => navigation.goBack());

  if (variant === 'gradient' || gradientColors) {
    const colors = gradientColors || (theme.isDark ? ['#065F46', '#047857'] : ['#059669', '#10B981']);
    return (
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradientContainer, { paddingTop: insets.top + 8 }]}
      >
        <View style={styles.row}>
          {showBack ? (
            <TouchableOpacity
              onPress={handleBack}
              style={styles.gradientIconBtn}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholderBtn} />
          )}

          <View style={styles.center}>
            <Text style={styles.gradientTitle} numberOfLines={1}>
              {title}
            </Text>
            {subtitle && (
              <View style={styles.gradientSubPill}>
                <Text style={styles.gradientSubtitle} numberOfLines={1}>
                  {subtitle}
                </Text>
              </View>
            )}
          </View>

          {rightIcon ? (
            <TouchableOpacity
              onPress={onRightPress}
              style={styles.gradientIconBtn}
              accessibilityRole="button"
              activeOpacity={0.7}
            >
              <Ionicons name={rightIcon as any} size={20} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <View style={styles.placeholderBtn} />
          )}
        </View>
      </LinearGradient>
    );
  }

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 8,
          backgroundColor: theme.colors.surface,
          borderBottomColor: theme.colors.border,
        },
      ]}
    >
      <View style={styles.row}>
        {showBack ? (
          <TouchableOpacity
            onPress={handleBack}
            style={[styles.iconBtn, { backgroundColor: theme.isDark ? theme.colors.card : '#F1F5F9' }]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={theme.colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholderBtn} />
        )}

        <View style={styles.center}>
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>
            {title}
          </Text>
          {subtitle && (
            <View style={[styles.subPill, { backgroundColor: theme.colors.primaryLight }]}>
              <Text style={[styles.subtitle, { color: theme.colors.primaryDark }]} numberOfLines={1}>
                {subtitle}
              </Text>
            </View>
          )}
        </View>

        {rightIcon ? (
          <TouchableOpacity
            onPress={onRightPress}
            style={[styles.iconBtn, { backgroundColor: theme.isDark ? theme.colors.card : '#F1F5F9' }]}
            accessibilityRole="button"
            activeOpacity={0.7}
          >
            <Ionicons name={rightIcon as any} size={20} color={theme.colors.text} />
          </TouchableOpacity>
        ) : (
          <View style={styles.placeholderBtn} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    paddingBottom: 12,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  gradientContainer: {
    paddingBottom: 14,
    paddingHorizontal: 12,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  placeholderBtn: {
    width: 40,
    height: 40,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  gradientTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  subPill: {
    marginTop: 3,
    paddingHorizontal: 8,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  gradientSubPill: {
    marginTop: 3,
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '700',
  },
  gradientSubtitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
