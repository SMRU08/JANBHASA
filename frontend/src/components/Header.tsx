import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../theme';

interface Props {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  showBack?: boolean;
  rightIcon?: string;
  onRightPress?: () => void;
  backgroundColor?: string;
}

export function Header({
  title,
  subtitle,
  onBack,
  showBack = true,
  rightIcon,
  onRightPress,
  backgroundColor,
}: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleBack = onBack || (() => navigation.goBack());

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 8,
          backgroundColor: backgroundColor || theme.colors.surface,
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
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
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
  subPill: {
    marginTop: 3,
    paddingHorizontal: 8,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: '700',
  },
});
