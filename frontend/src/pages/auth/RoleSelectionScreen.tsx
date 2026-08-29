import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { RoleCard } from '../../components/RoleCard';
import { TribalMotifBar } from '../../components/VisualIllustrations';
import { useTheme } from '../../theme';

export function RoleSelectionScreen() {
  const theme = useTheme();
  const c = theme.colors;
  const { t } = useTranslation();
  const nav = useNavigation<any>();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Brand Header Banner */}
        <LinearGradient
          colors={theme.isDark ? ['#064E3B', '#1E293B'] : ['#ECFDF5', '#F0FDF4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.headerBox, { borderColor: theme.isDark ? '#047857' : '#A7F3D0' }]}
        >
          <View style={styles.brandIconWrapper}>
            <Text style={{ fontSize: 38 }}>🏫</Text>
          </View>
          <Text style={[styles.title, { color: c.text }]}>
            {t('role.title') || 'Select Your Learning Portal'}
          </Text>
          <View style={styles.hindiSubBadge}>
            <Text style={styles.hindiSubText}>जनभाषा • अपनी भाषा में सीखें</Text>
          </View>
          <Text style={[styles.sub, { color: c.textSecondary }]}>
            Designed for Tribal and Multilingual Primary Education (Ho • Mundari • Santali • Hindi)
          </Text>
        </LinearGradient>

        <TribalMotifBar color={theme.isDark ? '#10B981' : '#059669'} height={12} />

        <View style={{ marginTop: 12 }}>
          <RoleCard
            role="teacher"
            title={t('role.teacher') || 'Teacher / शिक्षक'}
            description="Broadcast live hotspot audio, generate NIPUN worksheets, scan textbooks with OCR, and view student analytics."
            onPress={() => nav.navigate('TeacherLogin')}
          />

          <RoleCard
            role="student"
            title={t('role.student') || 'Student / विद्यार्थी'}
            description="Join teacher's live classroom with QR scanner, learn with bilingual flashcards, play FLN quizzes, and earn XP."
            onPress={() => nav.navigate('StudentLogin')}
          />

          <RoleCard
            role="admin"
            title={t('role.admin') || 'Administrator / प्रशासक'}
            description="Verify teacher accounts, monitor multi-school offline deployments, manage language packs, and backup database."
            onPress={() => nav.navigate('AdminLogin')}
          />
        </View>

        {/* Footer Trust Badges */}
        <View style={styles.footerNote}>
          <View style={[styles.pillBadge, { backgroundColor: theme.isDark ? '#064E3B' : '#D1FAE5' }]}>
            <Text style={{ color: '#065F46', fontSize: 11, fontWeight: '800' }}>
              🔒 100% OFFLINE CAPABLE • ZERO DATA REQUIRED
            </Text>
          </View>
          <Text style={[styles.creditNote, { color: c.textMuted }]}>
            JANBHASHA Multilingual Platform • NIPUN Bharat Aligned 🇮🇳
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
    padding: 18,
    paddingBottom: 36,
  },
  headerBox: {
    alignItems: 'center',
    borderRadius: 26,
    borderWidth: 1.5,
    padding: 20,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  brandIconWrapper: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  hindiSubBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 6,
    marginBottom: 6,
  },
  hindiSubText: {
    color: '#B45309',
    fontSize: 12,
    fontWeight: '800',
  },
  sub: {
    fontSize: 12,
    textAlign: 'center',
    paddingHorizontal: 10,
    lineHeight: 18,
    fontWeight: '600',
  },
  footerNote: {
    alignItems: 'center',
    marginTop: 10,
    gap: 8,
  },
  pillBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  creditNote: {
    fontSize: 11,
    fontWeight: '600',
  },
});
