import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/Button';
import { Header } from '../../components/Header';
import { useTheme } from '../../theme';
import { registerTeacher } from '../../services/authService';

export function TeacherRegisterScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: '', phone: '', email: '', school_name: '', password: '', confirm_password: '', recovery_pin: '', qualification: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleRegister = async () => {
    if (!form.name || !form.phone || !form.school_name || !form.password) { setError('Please fill all required fields.'); return; }
    if (form.password !== form.confirm_password) { setError('Passwords do not match.'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    const result = await registerTeacher({ name: form.name, phone: form.phone, email: form.email, school_name: form.school_name, password: form.password, recovery_pin: form.recovery_pin || '000000', qualification: form.qualification });
    setLoading(false);
    if (result.success) { setSuccess(true); } else { setError(result.message || 'Registration failed.'); }
  };

  const c = theme.colors;
  const fields = [
    { key: 'name', label: 'Full Name *', placeholder: 'Your full name', keyboard: 'default' as any },
    { key: 'phone', label: 'Phone Number *', placeholder: '10-digit mobile number', keyboard: 'phone-pad' as any },
    { key: 'email', label: 'Email (optional)', placeholder: 'your@email.com', keyboard: 'email-address' as any },
    { key: 'school_name', label: 'School Name *', placeholder: 'Government Primary School...', keyboard: 'default' as any },
    { key: 'qualification', label: 'Qualification', placeholder: 'B.Ed, M.A...', keyboard: 'default' as any },
    { key: 'password', label: 'Password *', placeholder: 'Min 6 characters', keyboard: 'default' as any },
    { key: 'confirm_password', label: 'Confirm Password *', placeholder: 'Repeat password', keyboard: 'default' as any },
    { key: 'recovery_pin', label: 'Recovery PIN (6 digits)', placeholder: 'e.g. 123456', keyboard: 'number-pad' as any },
  ];

  if (success) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <Text style={{ fontSize: 64 }}>✅</Text>
      <Text style={{ fontSize: 22, fontWeight: '800', color: c.text, textAlign: 'center', marginTop: 16 }}>Registration Submitted!</Text>
      <Text style={{ fontSize: 15, color: c.textSecondary, textAlign: 'center', marginTop: 12 }}>{t('auth.register_success')}</Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="Teacher Registration" subtitle="नया शिक्षक पंजीकरण" />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 48 }}>
          {error ? <View style={[styles.errBox, { backgroundColor: c.errorLight }]}><Text style={{ color: c.error, fontWeight: '600' }}>{error}</Text></View> : null}
          {fields.map(f => (
            <View key={f.key} style={styles.field}>
              <Text style={[styles.label, { color: c.textSecondary }]}>{f.label}</Text>
              <TextInput style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
                value={(form as any)[f.key]} onChangeText={v => update(f.key, v)}
                placeholder={f.placeholder} placeholderTextColor={c.textMuted}
                keyboardType={f.keyboard} secureTextEntry={f.key.includes('password') || f.key === 'recovery_pin'}
                autoCapitalize={f.key === 'email' ? 'none' : 'words'} />
            </View>
          ))}
          <View style={[styles.noteBox, { backgroundColor: c.warningLight, borderColor: c.warning }]}>
            <Text style={{ color: c.textSecondary, fontSize: 13 }}>⏳ After submitting, your account will be reviewed and activated by the school admin within 24 hours.</Text>
          </View>
          <Button title="Submit Registration" onPress={handleRegister} loading={loading} fullWidth size="lg" style={{ marginTop: 16 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  errBox: { borderRadius: 10, padding: 12, marginBottom: 16 },
  noteBox: { borderRadius: 10, borderWidth: 1, padding: 12, marginTop: 8 },
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { borderRadius: 10, borderWidth: 1.5, padding: 14, fontSize: 15 },
});
