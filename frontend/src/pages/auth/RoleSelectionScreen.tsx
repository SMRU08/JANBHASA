import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { RoleCard } from '../../components/RoleCard';
import { useTheme } from '../../theme';

export function RoleSelectionScreen() {
  const theme = useTheme();
  const c = theme.colors;
  const { t } = useTranslation();
  const nav = useNavigation<any>();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.headerBox}>
          <Text style={styles.emoji}>🎓</Text>
          <Text style={[styles.title, { color: c.text }]}>{t('role.title')}</Text>
          <Text style={[styles.sub, { color: c.textSecondary }]}>
            Select your role to access your personalized learning portal
          </Text>
        </View>

        <RoleCard
          role="teacher"
          title={t('role.teacher')}
          description="Conduct live multilingual classes, broadcast voice, generate OCR quizzes, and track progress."
          onPress={() => nav.navigate('TeacherLogin')}
        />

        <RoleCard
          role="student"
          title={t('role.student')}
          description="Join live classes, learn in your mother tongue, earn XP badges, flashcards & interactive stories."
          onPress={() => nav.navigate('StudentLogin')}
        />

        <RoleCard
          role="admin"
          title={t('role.admin')}
          description="Manage schools, verify teacher credentials, manage tribal language packs & system diagnostics."
          onPress={() => nav.navigate('AdminLogin')}
        />

        <View style={styles.footerNote}>
          <Text style={[styles.offlineNote, { color: c.textMuted }]}>
            🔒 Fully Offline Operation • No Internet Required
          </Text>
          <Text style={[styles.creditNote, { color: c.textMuted }]}>
            Developed by Team Xerses for Rural & Tribal Education 🇮🇳
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  headerBox: {
    alignItems: 'center',
    marginBottom: 28,
    marginTop: 8,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
  },
  sub: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 16,
    lineHeight: 20,
  },
  footerNote: {
    alignItems: 'center',
    marginTop: 16,
    gap: 4,
  },
  offlineNote: {
    fontSize: 12,
    fontWeight: '600',
  },
  creditNote: {
    fontSize: 11,
  },
});
