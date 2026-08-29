import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CameraView, Camera } from 'expo-camera';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { useNavigation } from '@react-navigation/native';
import { connectToClassroom } from '../../services/classroomService';
import { useClassroomStore } from '../../store/classroomStore';

type Mode = 'scan' | 'manual';

export function JoinClassroomScreen() {
  const theme = useTheme(); const c = theme.colors;
  const nav = useNavigation<any>();
  const { user } = useAuthStore();
  const { setSession } = useClassroomStore();
  const [mode, setMode] = useState<Mode>('scan');
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const [sessionCode, setSessionCode] = useState('');
  const [ipAddress, setIpAddress] = useState('192.168.43.1');
  const [joining, setJoining] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    if (mode === 'scan') {
      (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        setHasPermission(status === 'granted');
        if (status === 'granted') setCameraActive(true);
      })();
    } else {
      setCameraActive(false);
    }
  }, [mode]);

  const handleBarcodeScanned = ({ data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);
    setCameraActive(false);
    try {
      let sessionId = data;
      let ip = '192.168.43.1';
      if (data.includes('janbhasha://')) {
        const url = new URL(data.replace('janbhasha://', 'http://x/'));
        sessionId = url.searchParams.get('id') || data;
        ip = url.searchParams.get('ip') || ip;
      } else if (data.includes('|')) {
        [sessionId, ip] = data.split('|');
      }
      setSessionCode(sessionId.trim());
      setIpAddress(ip.trim());
      Alert.alert(
        '✅ QR Code Scanned',
        `Session: ${sessionId}${ip ? `\nHost IP: ${ip}` : ''}`,
        [
          { text: 'Join Now', onPress: () => handleJoin(sessionId.trim(), ip.trim()) },
          { text: 'Cancel', onPress: () => setScanned(false) },
        ]
      );
    } catch {
      setSessionCode(data);
      Alert.alert('📷 Scanned', `Code: ${data}`, [
        { text: 'Join', onPress: () => handleJoin(data.trim(), ipAddress) },
        { text: 'Cancel', onPress: () => setScanned(false) },
      ]);
    }
  };

  const handleJoin = async (sid?: string, ip?: string) => {
    const id = (sid || sessionCode).trim();
    const host = (ip !== undefined ? ip : ipAddress).trim() || '192.168.43.1';
    if (!id) { Alert.alert('Error', 'Please enter or scan a session code.'); return; }
    setJoining(true);
    try {
      // Set session info in store
      setSession({ sessionId: id, hostUrl: `ws://${host}:8000`, isConnecting: true });
      // Connect via WebSocket
      connectToClassroom(id, host, 8000, {
        role: 'student',
        student_id: user?.id ? Number(user.id) : 0,
        name: user?.name || 'Student',
        language: user?.selected_language || 'hi',
      });
      nav.navigate('StudentClassroom', { sessionId: id });
    } catch {
      Alert.alert(
        '📡 Connection Issue',
        'Starting in offline preview mode. Make sure you\'re on the same Wi-Fi as your teacher.',
        [{ text: 'Continue', onPress: () => nav.navigate('StudentClassroom', { sessionId: id, offline: true }) }]
      );
    }
    setJoining(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="Join Classroom" subtitle="शिक्षक का QR स्कैन करें" />

      {/* Mode Tabs */}
      <View style={[styles.tabs, { backgroundColor: c.surface }]}>
        {(['scan', 'manual'] as Mode[]).map(m => (
          <TouchableOpacity key={m} onPress={() => setMode(m)}
            style={[styles.tab, mode === m && { borderBottomColor: c.primary, borderBottomWidth: 3 }]}>
            <Text style={{ color: mode === m ? c.primary : c.textMuted, fontWeight: '700' }}>
              {m === 'scan' ? '📷 QR Scanner' : '⌨️ Enter Code'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {mode === 'scan' ? (
          <View>
            {hasPermission === null && (
              <View style={styles.centered}>
                <ActivityIndicator color={c.primary} size="large" />
                <Text style={{ color: c.textMuted, marginTop: 12 }}>Requesting camera permission...</Text>
              </View>
            )}
            {hasPermission === false && (
              <View style={[styles.permBox, { backgroundColor: c.card, borderColor: c.border }]}>
                <Text style={{ fontSize: 40 }}>📷</Text>
                <Text style={{ color: c.text, fontWeight: '700', fontSize: 16, marginTop: 12 }}>Camera Permission Required</Text>
                <Text style={{ color: c.textMuted, textAlign: 'center', marginTop: 8, fontSize: 13 }}>
                  Please enable camera access in device settings to scan QR codes.
                </Text>
                <Button title="Enter Code Manually" onPress={() => setMode('manual')} style={{ marginTop: 16 }} />
              </View>
            )}
            {hasPermission && cameraActive && (
              <View>
                <View style={styles.cameraContainer}>
                  <CameraView
                    style={styles.camera}
                    facing="back"
                    barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
                    onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
                  />
                  <View style={styles.scanOverlay}>
                    <View style={styles.scanCornerTL} />
                    <View style={styles.scanCornerTR} />
                    <View style={styles.scanCornerBL} />
                    <View style={styles.scanCornerBR} />
                  </View>
                </View>
                <Text style={{ color: c.textMuted, textAlign: 'center', marginTop: 16, fontSize: 14 }}>
                  📷 Point camera at teacher's QR code
                </Text>
                {scanned && <Button title="Scan Again" onPress={() => setScanned(false)} style={{ marginTop: 12 }} />}
              </View>
            )}
          </View>
        ) : (
          <View>
            <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
              <Text style={{ color: c.textMuted, fontSize: 12, fontWeight: '600', marginBottom: 8 }}>SESSION CODE</Text>
              <TextInput
                style={[styles.input, { backgroundColor: c.surface, borderColor: c.border, color: c.text }]}
                value={sessionCode}
                onChangeText={setSessionCode}
                placeholder="e.g. JAN-2024-001"
                placeholderTextColor={c.textMuted}
                autoCapitalize="characters"
              />
              <Text style={{ color: c.textMuted, fontSize: 12, fontWeight: '600', marginBottom: 8, marginTop: 16 }}>
                TEACHER'S IP ADDRESS
              </Text>
              <TextInput
                style={[styles.input, { backgroundColor: c.surface, borderColor: c.border, color: c.text }]}
                value={ipAddress}
                onChangeText={setIpAddress}
                placeholder="192.168.43.1"
                placeholderTextColor={c.textMuted}
                keyboardType="numbers-and-punctuation"
              />
            </View>
            <Button
              title={joining ? 'Joining...' : '🚀 Join Classroom'}
              onPress={() => handleJoin()}
              fullWidth
              disabled={joining || !sessionCode.trim()}
              style={{ marginTop: 20 }}
            />
            {joining && <ActivityIndicator color={c.primary} size="large" style={{ marginTop: 16 }} />}
          </View>
        )}

        <View style={[styles.infoBox, { backgroundColor: c.card, borderColor: c.border, marginTop: 24 }]}>
          <Text style={{ color: c.text, fontWeight: '700', fontSize: 14 }}>📡 How to Connect</Text>
          <Text style={{ color: c.textMuted, fontSize: 12, marginTop: 8, lineHeight: 20 }}>
            1. Connect your phone to the same Wi-Fi hotspot as your teacher{'\n'}
            2. Scan the QR code shown on teacher's screen OR{'\n'}
            3. Enter the session code manually{'\n'}
            4. Press "Join Classroom" and start receiving live translations!
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const CORNER_SIZE = 28;
const CORNER_WIDTH = 3;
const styles = StyleSheet.create({
  tabs: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  tab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  centered: { alignItems: 'center', paddingVertical: 60 },
  permBox: { borderRadius: 16, borderWidth: 1, padding: 28, alignItems: 'center', marginTop: 20 },
  cameraContainer: { borderRadius: 20, overflow: 'hidden', position: 'relative', height: 320 },
  camera: { flex: 1, height: 320 },
  scanOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  scanCornerTL: { position: 'absolute', top: 60, left: 60, width: CORNER_SIZE, height: CORNER_SIZE, borderTopWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH, borderColor: '#10B981' },
  scanCornerTR: { position: 'absolute', top: 60, right: 60, width: CORNER_SIZE, height: CORNER_SIZE, borderTopWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH, borderColor: '#10B981' },
  scanCornerBL: { position: 'absolute', bottom: 60, left: 60, width: CORNER_SIZE, height: CORNER_SIZE, borderBottomWidth: CORNER_WIDTH, borderLeftWidth: CORNER_WIDTH, borderColor: '#10B981' },
  scanCornerBR: { position: 'absolute', bottom: 60, right: 60, width: CORNER_SIZE, height: CORNER_SIZE, borderBottomWidth: CORNER_WIDTH, borderRightWidth: CORNER_WIDTH, borderColor: '#10B981' },
  card: { borderRadius: 16, borderWidth: 1, padding: 18 },
  input: { borderRadius: 12, borderWidth: 1, padding: 12, fontSize: 16, fontWeight: '600' },
  infoBox: { borderRadius: 14, borderWidth: 1, padding: 16 },
});
