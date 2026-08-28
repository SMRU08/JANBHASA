import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { RoleCard } from '../../components/RoleCard';
import { useTheme } from '../../theme';

export function RoleSelectionScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const nav = useNavigation<any>();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.emoji}>👋</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('role.title')}</Text>
        <Text style={[styles.sub, { color: theme.colors.textSecondary }]}>JANBHASHA</Text>

        <RoleCard role="teacher" title={t('role.teacher')} description={t('role.teacher_desc')} onPress={() => nav.navigate('TeacherLogin')} />
        <RoleCard role="student" title={t('role.student')} description={t('role.student_desc')} onPress={() => nav.navigate('StudentLogin')} />
        <RoleCard role="admin" title={t('role.admin')} description={t('role.admin_desc')} onPress={() => nav.navigate('AdminLogin')} />

        <Text style={[styles.offlineNote, { color: theme.colors.textMuted }]}>🔒 Fully offline & secure</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 40 },
  emoji: { fontSize: 52, textAlign: 'center', marginBottom: 10 },
  title: { fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  sub: { fontSize: 15, textAlign: 'center', marginBottom: 32 },
  offlineNote: { fontSize: 12, textAlign: 'center', marginTop: 24 },
});
