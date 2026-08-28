import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/Button';
import { Header } from '../../components/Header';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { login } from '../../services/authService';

export function StudentLoginScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const { setUser } = useAuthStore();
  const [studentCode, setStudentCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!studentCode.trim()) { setError('Please enter your student ID.'); return; }
    setLoading(true); setError('');
    // Students use student_code as both identifier and password
    const result = await login(studentCode.trim(), studentCode.trim(), 'student');
    setLoading(false);
    if (result.success && result.data) { setUser(result.data); }
    else { setError(result.message || t('errors.login_failed')); }
  };

  const c = theme.colors;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="Student Login" subtitle="विद्यार्थी लॉगिन" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
          <Text style={{ fontSize: 64, textAlign: 'center', marginVertical: 16 }}>👨‍🎓</Text>
          <Text style={{ fontSize: 22, fontWeight: '800', color: c.text, textAlign: 'center', marginBottom: 8 }}>Enter Student ID</Text>
          <Text style={{ fontSize: 14, color: c.textSecondary, textAlign: 'center', marginBottom: 28 }}>Your teacher will give you a Student ID</Text>
          {error ? <View style={[styles.errBox, { backgroundColor: c.errorLight }]}><Text style={{ color: c.error, fontWeight: '600' }}>{error}</Text></View> : null}
          <View style={styles.idBox}>
            <TextInput
              style={[styles.bigInput, { backgroundColor: c.card, borderColor: c.primary, color: c.text }]}
              value={studentCode} onChangeText={setStudentCode}
              placeholder="e.g. STU001" placeholderTextColor={c.textMuted}
              autoCapitalize="characters" autoCorrect={false} maxLength={20}
            />
          </View>
          <Text style={{ color: c.textMuted, fontSize: 12, textAlign: 'center', marginBottom: 20 }}>Student ID is case-insensitive. Ask your teacher if you don't know it.</Text>
          <Button title="Join Learning 🚀" onPress={handleLogin} loading={loading} fullWidth size="lg" />
          <View style={[styles.infoCard, { backgroundColor: c.infoLight, borderColor: c.info }]}>
            <Text style={{ color: c.info, fontSize: 13, fontWeight: '600' }}>💡 No internet needed! JANBHASHA works fully offline.</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  errBox: { borderRadius: 10, padding: 12, marginBottom: 16 },
  idBox: { alignItems: 'center', marginBottom: 12 },
  bigInput: { borderRadius: 16, borderWidth: 2.5, padding: 20, fontSize: 28, fontWeight: '800', textAlign: 'center', width: '100%', letterSpacing: 4 },
  infoCard: { borderRadius: 12, borderWidth: 1, padding: 14, marginTop: 20 },
});
