import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { apiRequest } from '../../services/apiClient';

export function AccountRecoveryScreen() {
  const theme = useTheme();
  const c = theme.colors;
  const { user } = useAuthStore();
  const [identifier, setIdentifier] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [generatedPin, setGeneratedPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async () => {
    if (!identifier.trim() || !newPassword.trim()) {
      Alert.alert('Required', 'Please enter user identifier (phone/email/student code) and new password.');
      return;
    }

    setLoading(true);
    const res = await apiRequest('/api/auth/admin/recover-account', {
      method: 'POST',
      body: {
        identifier: identifier.trim(),
        action: 'reset_password',
        new_password: newPassword.trim(),
        admin_id: user?.id || 1
      }
    });
    setLoading(false);

    if (res.success) {
      Alert.alert('Success', 'Password has been successfully updated.');
      setNewPassword('');
    } else {
      Alert.alert('Error', res.message || 'Failed to reset password.');
    }
  };

  const handleGeneratePin = async () => {
    if (!identifier.trim()) {
      Alert.alert('Required', 'Please enter user identifier.');
      return;
    }

    setLoading(true);
    const res = await apiRequest<any>('/api/auth/admin/recover-account', {
      method: 'POST',
      body: {
        identifier: identifier.trim(),
        action: 'generate_pin',
        admin_id: user?.id || 1
      }
    });
    setLoading(false);

    if (res.success && res.data?.new_pin) {
      setGeneratedPin(res.data.new_pin);
    } else {
      Alert.alert('Error', res.message || 'Could not generate recovery PIN.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="Account Recovery 🔑" subtitle="ऑफ़लाइन पासवर्ड रीसेट" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: c.text, marginBottom: 6 }}>
            Admin Recovery Authority
          </Text>
          <Text style={{ color: c.textSecondary, fontSize: 13, lineHeight: 18 }}>
            In offline environments where SMS/Email is unavailable, admins can directly generate a new 6-digit PIN or set a temporary password for any teacher or student.
          </Text>
        </Card>

        {/* Form */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={[styles.label, { color: c.textSecondary }]}>USER IDENTIFIER (Phone / Email / Student Code)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: c.background, borderColor: c.border, color: c.text }]}
            placeholder="e.g. 9876543210 or STU101"
            placeholderTextColor={c.textMuted}
            value={identifier}
            onChangeText={setIdentifier}
            autoCapitalize="none"
          />

          <Text style={[styles.label, { color: c.textSecondary, marginTop: 14 }]}>NEW PASSWORD (Optional Direct Reset)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: c.background, borderColor: c.border, color: c.text }]}
            placeholder="Enter temporary password"
            placeholderTextColor={c.textMuted}
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <View style={{ marginTop: 16, gap: 10 }}>
            <Button
              title="Reset Password Directly 🔄"
              onPress={handleResetPassword}
              loading={loading}
              fullWidth
            />
            <Button
              title="Generate 6-Digit Emergency PIN 🎲"
              onPress={handleGeneratePin}
              loading={loading}
              variant="outline"
              fullWidth
            />
          </View>
        </Card>

        {/* Display Generated PIN */}
        {generatedPin ? (
          <View style={[styles.pinBox, { backgroundColor: c.successLight, borderColor: c.success }]}>
            <Text style={{ color: c.success, fontSize: 13, fontWeight: '700' }}>
              EMERGENCY 6-DIGIT RECOVERY PIN:
            </Text>
            <Text style={[styles.pinText, { color: c.primaryDark }]}>{generatedPin}</Text>
            <Text style={{ color: c.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 4 }}>
              Give this PIN to the user to reset their password on their own device.
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 12, fontWeight: '700', marginBottom: 6 },
  input: { borderRadius: 10, borderWidth: 1.5, padding: 12, fontSize: 15 },
  pinBox: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 20,
    alignItems: 'center',
    marginTop: 10
  },
  pinText: { fontSize: 36, fontWeight: '900', letterSpacing: 8, marginVertical: 8 }
});
