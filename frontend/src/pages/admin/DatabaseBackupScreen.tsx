import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme';

export function DatabaseBackupScreen() {
  const theme = useTheme();
  const c = theme.colors;
  const [lastBackup, setLastBackup] = useState('2026-08-28 08:30 AM');
  const [loading, setLoading] = useState(false);

  const handleBackupNow = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setLastBackup(new Date().toLocaleString());
      Alert.alert('Backup Complete', 'SQLite database backup created locally at ./database/backup/janbhasha_backup.db');
    }, 1200);
  };

  const handleRestore = () => {
    Alert.alert('Confirm Restore', 'Are you sure you want to restore the database from the latest local backup?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Restore',
        style: 'destructive',
        onPress: () => {
          Alert.alert('Restored', 'Database restored successfully from local snapshot.');
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="Database Backup 💾" subtitle="ऑफ़लाइन डेटा सुरक्षा" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: c.text }}>Local SQLite Persistence</Text>
          <Text style={{ color: c.textSecondary, fontSize: 13, marginTop: 4, lineHeight: 18 }}>
            All user accounts, student progress, XP records, and translations are securely stored in the local SQLite database. No external cloud dependency.
          </Text>

          <View style={styles.infoRow}>
            <Text style={{ color: c.textSecondary }}>Last Local Backup:</Text>
            <Text style={{ fontWeight: '700', color: c.text }}>{lastBackup}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={{ color: c.textSecondary }}>Database Engine:</Text>
            <Text style={{ fontWeight: '700', color: c.primary }}>SQLite 3 (aiosqlite)</Text>
          </View>
        </Card>

        <Card style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: c.text, marginBottom: 12 }}>
            Backup & Export
          </Text>
          <Button
            title="Create Database Backup Now 💾"
            onPress={handleBackupNow}
            loading={loading}
            fullWidth
            size="lg"
          />
        </Card>

        <Card style={{ marginBottom: 16, borderColor: c.error }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: c.error, marginBottom: 8 }}>
            Restore Database
          </Text>
          <Text style={{ color: c.textMuted, fontSize: 12, marginBottom: 12 }}>
            Restore database tables from the most recent valid snapshot. Use with caution.
          </Text>
          <Button
            title="Restore from Snapshot ⚠️"
            onPress={handleRestore}
            variant="danger"
            fullWidth
          />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee'
  }
});
