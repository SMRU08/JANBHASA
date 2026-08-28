import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/Button';
import { Header } from '../../components/Header';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { login } from '../../services/authService';

export function TeacherLoginScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const nav = useNavigation<any>();
  const { setUser } = useAuthStore();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!identifier.trim() || !password) { setError('Please enter credentials'); return; }
    setLoading(true); setError('');
    const result = await login(identifier.trim(), password, 'teacher');
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
      <Header title={t('auth.login')} subtitle="शिक्षक लॉगिन" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={styles.emoji}>👩‍🏫</Text>
          <Text style={[styles.title, { color: c.text }]}>Teacher Login</Text>
          {error ? <View style={[styles.errBox, { backgroundColor: c.errorLight }]}><Text style={{ color: c.error, fontWeight: '600' }}>{error}</Text></View> : null}
          <View style={styles.field}>
            <Text style={[styles.label, { color: c.textSecondary }]}>{t('auth.phone')} / {t('auth.email')}</Text>
            <TextInput style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
              value={identifier} onChangeText={setIdentifier} placeholder="Phone or email" placeholderTextColor={c.textMuted}
              keyboardType="email-address" autoCapitalize="none" />
          </View>
          <View style={styles.field}>
            <Text style={[styles.label, { color: c.textSecondary }]}>{t('auth.password')}</Text>
            <View style={{ position: 'relative' }}>
              <TextInput style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text, paddingRight: 52 }]}
                value={password} onChangeText={setPassword} secureTextEntry={!showPass} placeholder="Password" placeholderTextColor={c.textMuted} />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                <Text style={{ fontSize: 18 }}>{showPass ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>
          <Button title={t('auth.login')} onPress={handleLogin} loading={loading} fullWidth size="lg" style={{ marginTop: 8 }} />
          <TouchableOpacity onPress={() => nav.navigate('TeacherRegister')} style={styles.linkRow}>
            <Text style={{ color: c.primary, fontWeight: '600' }}>New teacher? Register here</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkRow}>
            <Text style={{ color: c.textMuted }}>{t('auth.forgot_password')} — {t('auth.ask_teacher')}</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: { padding: 24, paddingBottom: 48 },
  emoji: { fontSize: 56, textAlign: 'center', marginVertical: 12 },
  title: { fontSize: 24, fontWeight: '800', textAlign: 'center', marginBottom: 24 },
  errBox: { borderRadius: 10, padding: 12, marginBottom: 16 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderRadius: 10, borderWidth: 1.5, padding: 14, fontSize: 15 },
  eyeBtn: { position: 'absolute', right: 14, top: 12 },
  linkRow: { alignItems: 'center', marginTop: 20 },
});
