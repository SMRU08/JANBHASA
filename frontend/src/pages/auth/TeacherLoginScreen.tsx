import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Button } from '../../components/Button';
import { Header } from '../../components/Header';
import { TeacherHeroIllustration, TribalMotifBar } from '../../components/VisualIllustrations';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { login } from '../../services/authService';

export function TeacherLoginScreen() {
  const theme = useTheme();
  const { t } = useTranslation();
  const nav = useNavigation<any>();
  const { setUser } = useAuthStore();
  const [identifier, setIdentifier] = useState('teacher@gmail.com');
  const [password, setPassword] = useState('Teacher@1234');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (overrideId?: string, overridePass?: string) => {
    const id = (overrideId || identifier).trim();
    const pwd = overridePass || password;
    if (!id || !pwd) {
      setError('Please enter teacher credentials');
      return;
    }
    setLoading(true);
    setError('');
    const result = await login(id, pwd, 'teacher');
    setLoading(false);
    if (result.success && result.data) {
      setUser(result.data);
    } else {
      setError(result.message || t('errors.login_failed'));
    }
  };

  const fillDemo = () => {
    setIdentifier('teacher@gmail.com');
    setPassword('Teacher@1234');
    handleLogin('teacher@gmail.com', 'Teacher@1234');
  };

  const c = theme.colors;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header
        title="Teacher Portal"
        subtitle="शिक्षक लॉगिन • लाइव प्रसारण"
        variant="gradient"
        gradientColors={['#059669', '#10B981']}
      />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll}>
          {/* Avatar Illustration */}
          <View style={styles.avatarCenter}>
            <TeacherHeroIllustration size={100} />
          </View>

          <Text style={[styles.title, { color: c.text }]}>Teacher Login</Text>
          <Text style={[styles.subTitle, { color: c.textSecondary }]}>
            Access your live classroom broadcasting hub and NIPUN tools
          </Text>

          {error ? (
            <View style={[styles.errBox, { backgroundColor: '#FEE2E2', borderColor: '#EF4444' }]}>
              <Text style={{ color: '#991B1B', fontWeight: '700' }}>⚠️ {error}</Text>
            </View>
          ) : null}

          {/* 1-Tap Demo Fill */}
          <TouchableOpacity
            onPress={fillDemo}
            style={[styles.demoCard, { backgroundColor: theme.isDark ? '#064E3B' : '#ECFDF5', borderColor: '#10B981' }]}
            activeOpacity={0.85}
          >
            <Text style={{ fontSize: 20 }}>⚡</Text>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={{ color: '#065F46', fontWeight: '900', fontSize: 12 }}>1-TAP DEMO TEACHER LOGIN</Text>
              <Text style={{ color: '#047857', fontSize: 11 }}>teacher@gmail.com • Teacher@1234</Text>
            </View>
            <Text style={{ color: '#059669', fontWeight: '900', fontSize: 13 }}>FILL & LOGIN ➔</Text>
          </TouchableOpacity>

          <View style={styles.field}>
            <Text style={[styles.label, { color: c.textSecondary }]}>Email or Phone</Text>
            <TextInput
              style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
              value={identifier}
              onChangeText={setIdentifier}
              placeholder="e.g. teacher@gmail.com"
              placeholderTextColor={c.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: c.textSecondary }]}>{t('auth.password')}</Text>
            <View style={{ position: 'relative' }}>
              <TextInput
                style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text, paddingRight: 52 }]}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                placeholder="Password"
                placeholderTextColor={c.textMuted}
              />
              <TouchableOpacity onPress={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                <Text style={{ fontSize: 18 }}>{showPass ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Button
            title="Open Teacher Hub 🚀"
            onPress={() => handleLogin()}
            loading={loading}
            fullWidth
            size="lg"
            variant="primary"
            style={{ marginTop: 8 }}
          />

          <TouchableOpacity onPress={() => nav.navigate('TeacherRegister')} style={styles.linkRow}>
            <Text style={{ color: c.primary, fontWeight: '700' }}>New educator? Register institution account</Text>
          </TouchableOpacity>

          <TribalMotifBar color={theme.isDark ? '#10B981' : '#059669'} height={12} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    padding: 22,
    paddingBottom: 44,
  },
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
    marginBottom: 16,
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
  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 12,
    marginBottom: 16,
  },
  field: {
    marginBottom: 14,
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    borderRadius: 14,
    borderWidth: 1.5,
    padding: 14,
    fontSize: 15,
  },
  eyeBtn: {
    position: 'absolute',
    right: 14,
    top: 14,
  },
  linkRow: {
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 12,
  },
});
