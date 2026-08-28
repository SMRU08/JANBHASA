import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Button } from '../../components/Button';
import { Header } from '../../components/Header';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { login } from '../../services/authService';

export function AdminLoginScreen() {
  const theme = useTheme();
  const { setUser } = useAuthStore();
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email || !password) { setError('Enter credentials'); return; }
    setLoading(true); setError('');
    const result = await login(email.trim(), password, 'admin');
    setLoading(false);
    if (result.success && result.data) { setUser(result.data); }
    else { setError(result.message || 'Login failed. Check credentials.'); }
  };

  const c = theme.colors;
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="Admin Login" subtitle="सिस्टम प्रशासन" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
          <Text style={{ fontSize: 64, textAlign: 'center', marginVertical: 16 }}>🔐</Text>
          <Text style={{ fontSize: 22, fontWeight: '800', color: c.text, textAlign: 'center', marginBottom: 28 }}>Admin Hub</Text>
          {error ? <View style={[styles.errBox, { backgroundColor: c.errorLight }]}><Text style={{ color: c.error, fontWeight: '600' }}>{error}</Text></View> : null}
          <View style={styles.field}>
            <Text style={[styles.label, { color: c.textSecondary }]}>Admin Email</Text>
            <TextInput style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
              value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholderTextColor={c.textMuted} />
          </View>
          <View style={styles.field}>
            <Text style={[styles.label, { color: c.textSecondary }]}>Password</Text>
            <TextInput style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
              value={password} onChangeText={setPassword} secureTextEntry={!showPass} placeholder="Admin password" placeholderTextColor={c.textMuted} />
          </View>
          <View style={[styles.hint, { backgroundColor: c.infoLight }]}>
            <Text style={{ color: c.info, fontSize: 12 }}>🔑 Default: admin@gmail.com / Admin@1234</Text>
          </View>
          <Button title="Login to Admin Hub" onPress={handleLogin} loading={loading} fullWidth size="lg" style={{ marginTop: 16 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  errBox: { borderRadius: 10, padding: 12, marginBottom: 16 },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderRadius: 10, borderWidth: 1.5, padding: 14, fontSize: 15 },
  hint: { borderRadius: 10, padding: 12, marginTop: 4 },
});
