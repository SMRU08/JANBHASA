import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { QRGenerator } from '../../components/OfflineBanner';
import { useTheme } from '../../theme';
import { useClassroomStore } from '../../store/classroomStore';
import { useNavigation } from '@react-navigation/native';
import { connectToClassroom } from '../../services/classroomService';
import { useAuthStore } from '../../store/authStore';

export function ClassroomModeScreen({ route }: any) {
  const theme = useTheme(); const c = theme.colors;
  const nav = useNavigation<any>();
  const sessionData = route?.params?.sessionData || {};
  const { user } = useAuthStore();
  const { students, isConnected, setConnected, setConnecting } = useClassroomStore();

  const startLive = () => {
    setConnecting(true);
    connectToClassroom(sessionData.session_id, sessionData.host_ip, sessionData.host_port, {
      role: 'teacher', name: user?.name || 'Teacher', language: user?.selected_language || 'hi',
    });
    nav.navigate('LiveClassroom', { sessionData });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="Classroom Ready" subtitle={`Session: ${sessionData.session_id || 'LOCAL'}`} />
      <ScrollView contentContainerStyle={{ padding: 20, alignItems: 'center' }}>
        <Text style={{ fontSize: 18, fontWeight: '700', color: c.text, marginBottom: 6 }}>Share this QR with students</Text>
        <Text style={{ color: c.textSecondary, fontSize: 13, marginBottom: 20, textAlign: 'center' }}>Students open JANBHASHA → Join Classroom → Scan QR</Text>
        <QRGenerator data={sessionData.qr_data || sessionData.session_id || 'JANBHASHA_DEMO'} size={220} title={`${sessionData.class_name || 'Class'} • ${sessionData.subject || 'General'}`} />
        <View style={[styles.infoBox, { backgroundColor: c.card, borderColor: c.border }]}>
          <InfoRow label="Session ID" value={sessionData.session_id || 'N/A'} color={c.primary} />
          <InfoRow label="Server" value={`${sessionData.host_ip || '127.0.0.1'}:${sessionData.host_port || '8000'}`} color={c.textSecondary} />
          <InfoRow label="Subject" value={sessionData.subject || 'General'} color={c.secondary} />
          <InfoRow label="Teacher" value={sessionData.teacher_name || user?.name || 'Teacher'} color={c.text} />
        </View>
        <Button title="Open Live Classroom →" onPress={startLive} fullWidth size="lg" icon="radio" style={{ marginTop: 8 }} />
        <Text style={{ color: c.textMuted, fontSize: 12, marginTop: 16, textAlign: 'center' }}>🔒 Offline mode — no internet needed. Works on local hotspot.</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, { color }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  infoBox: { width: '100%', borderRadius: 16, borderWidth: 1, padding: 16, marginVertical: 20 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  infoLabel: { fontSize: 13, color: '#999', fontWeight: '600' },
  infoValue: { fontSize: 13, fontWeight: '700' },
});
