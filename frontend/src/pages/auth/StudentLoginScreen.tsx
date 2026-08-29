import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/Button';
import { Header } from '../../components/Header';
import { StudentHeroIllustration, TribalMotifBar } from '../../components/VisualIllustrations';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { login } from '../../services/authService';

export function StudentLoginScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { setUser } = useAuthStore();
  const [studentCode, setStudentCode] = useState('STU001');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (codeOverride?: string) => {
    const code = (codeOverride || studentCode).trim();
    if (!code) {
      setError('Please enter your student ID.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await login(code, code, 'student');
    setLoading(false);
    if (result.success && result.data) {
      setUser(result.data);
    } else {
      setError(result.message || t('errors.login_failed'));
    }
  };

  const c = theme.colors;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header
        title="Student Portal"
        subtitle="विद्यार्थी लॉगिन • मातृभाषा"
        variant="gradient"
        gradientColors={['#D97706', '#F59E0B']}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 22, paddingBottom: 48 }}>
          {/* Avatar Illustration */}
          <View style={styles.avatarCenter}>
            <StudentHeroIllustration size={100} />
          </View>

          <Text style={[styles.title, { color: c.text }]}>Enter Student ID</Text>
          <Text style={[styles.subTitle, { color: c.textSecondary }]}>
            Enter your Student ID to open your offline learning dashboard
          </Text>

          {error ? (
            <View style={[styles.errBox, { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }]}>
              <Text style={{ color: '#991B1B', fontWeight: '700' }}>⚠️ {error}</Text>
            </View>
          ) : null}

          {/* Stylized ID input box */}
          <View style={styles.idBox}>
            <TextInput
              style={[
                styles.bigInput,
                {
                  backgroundColor: c.card,
                  borderColor: '#F59E0B',
                  color: c.text,
                },
              ]}
              value={studentCode}
              onChangeText={setStudentCode}
              placeholder="e.g. STU001"
              placeholderTextColor={c.textMuted}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={20}
            />
          </View>

          {/* 1-Tap Quick Demo Logins */}
          <Text style={[styles.quickLabel, { color: c.textMuted }]}>⚡ 1-TAP DEMO STUDENT IDS:</Text>
          <View style={styles.quickPillsRow}>
            {['STU001', 'STU002', 'STU003', 'DEMO'].map((id) => (
              <TouchableOpacity
                key={id}
                onPress={() => {
                  setStudentCode(id);
                  handleLogin(id);
                }}
                style={[styles.quickPill, { backgroundColor: c.surface, borderColor: '#F59E0B' }]}
                activeOpacity={0.8}
              >
                <Text style={{ color: '#D97706', fontWeight: '800', fontSize: 13 }}>{id}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Button
            title="Start Learning 🚀"
            onPress={() => handleLogin()}
            loading={loading}
            fullWidth
            size="lg"
            variant="secondary"
            style={{ marginTop: 8 }}
          />

          <TribalMotifBar color={theme.isDark ? '#F59E0B' : '#D97706'} height={12} />

          <View style={[styles.infoCard, { backgroundColor: theme.isDark ? '#064E3B' : '#ECFDF5', borderColor: '#10B981' }]}>
            <Text style={{ color: '#065F46', fontSize: 12, fontWeight: '700', textAlign: 'center' }}>
              💡 Zero Internet Needed • Works 100% Offline with Preloaded FLN Lessons
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  avatarCenter: {
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '900',
    textAlign: 'center',
    letterSpacing: 0.2,
  },
  subTitle: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 20,
    paddingHorizontal: 16,
    lineHeight: 18,
    fontWeight: '600',
  },
  errBox: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 12,
    marginBottom: 16,
  },
  idBox: {
    alignItems: 'center',
    marginBottom: 14,
  },
  bigInput: {
    borderRadius: 20,
    borderWidth: 2.5,
    paddingVertical: 16,
    paddingHorizontal: 24,
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    width: '100%',
    letterSpacing: 4,
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
    marginBottom: 8,
  },
  quickPillsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  quickPill: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  infoCard: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 12,
    marginTop: 18,
  },
});
