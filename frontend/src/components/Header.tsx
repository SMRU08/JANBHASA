import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
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

export function Header({ title, subtitle, onBack, showBack = true, rightIcon, onRightPress, backgroundColor }: Props) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();

  const handleBack = onBack || (() => navigation.goBack());

  return (
    <View style={[styles.container, { paddingTop: insets.top + 8, backgroundColor: backgroundColor || theme.colors.surface, borderBottomColor: theme.colors.border }]}>
      <View style={styles.row}>
        {showBack ? (
          <TouchableOpacity onPress={handleBack} style={styles.iconBtn} accessibilityRole="button" accessibilityLabel="Go back">
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        ) : <View style={styles.iconBtn} />}
        <View style={styles.center}>
          <Text style={[styles.title, { color: theme.colors.text }]} numberOfLines={1}>{title}</Text>
          {subtitle && <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]} numberOfLines={1}>{subtitle}</Text>}
        </View>
        {rightIcon ? (
          <TouchableOpacity onPress={onRightPress} style={styles.iconBtn} accessibilityRole="button">
            <Ionicons name={rightIcon as any} size={24} color={theme.colors.text} />
          </TouchableOpacity>
        ) : <View style={styles.iconBtn} />}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { borderBottomWidth: 0.5, paddingBottom: 10, paddingHorizontal: 4 },
  row: { flexDirection: 'row', alignItems: 'center' },
  iconBtn: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, alignItems: 'center' },
  title: { fontSize: 17, fontWeight: '700' },
  subtitle: { fontSize: 12, marginTop: 1 },
});
