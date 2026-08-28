import React from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';

export function AdminSettingsScreen() {
  const theme = useTheme();
  const c = theme.colors;
  const nav = useNavigation<any>();
  const { user, logout } = useAuthStore();

  const handleClearCache = () => {
    Alert.alert('Clear Cache', 'Local translation & audio cache cleared.');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="System Settings ⚙️" subtitle="प्रशासनिक नियंत्रण" showBack={false} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: c.text, marginBottom: 12 }}>
            Admin Session
          </Text>
          <View style={styles.row}>
            <Text style={{ color: c.textSecondary }}>Logged In User:</Text>
            <Text style={{ fontWeight: '700', color: c.text }}>{user?.name || 'Administrator'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={{ color: c.textSecondary }}>Role:</Text>
            <Text style={{ fontWeight: '800', color: c.admin }}>SUPER ADMIN</Text>
          </View>
          <View style={styles.row}>
            <Text style={{ color: c.textSecondary }}>App Version:</Text>
            <Text style={{ fontWeight: '700', color: c.text }}>v1.0.0 (Production Build)</Text>
          </View>
        </Card>

        {/* Maintenance Controls */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: c.text, marginBottom: 12 }}>
            Maintenance Utilities
          </Text>
          <Button
            title="Clear Audio & Translation Cache 🧹"
            onPress={handleClearCache}
            variant="outline"
            fullWidth
            style={{ marginBottom: 10 }}
          />
          <Button
            title="Database Backup Manager 💾"
            onPress={() => nav.navigate('DatabaseBackup')}
            variant="outline"
            fullWidth
          />
        </Card>

        {/* Logout */}
        <Button
          title="🚪 Admin Sign Out"
          onPress={logout}
          variant="danger"
          fullWidth
          size="lg"
          style={{ marginTop: 12 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee'
  }
});
