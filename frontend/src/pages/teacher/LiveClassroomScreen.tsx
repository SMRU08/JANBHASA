import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import QRCode from 'react-native-qrcode-svg';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { StudentCard } from '../../components/OfflineBanner';
import { PulsingMic } from '../../components/PulsingMic';
import { LiveAudioWaveform, TribalMotifBar } from '../../components/VisualIllustrations';
import { useTheme } from '../../theme';
import { useClassroomStore } from '../../store/classroomStore';
import { broadcastToStudents, endSession } from '../../services/classroomService';
import { transcribeAudio } from '../../services/sttService';
import { translateBatch } from '../../services/translationService';
import { useAuthStore } from '../../store/authStore';
import { useNavigation } from '@react-navigation/native';

export function LiveClassroomScreen({ route }: any) {
  const theme = useTheme();
  const c = theme.colors;
  const { t } = useTranslation();
  const nav = useNavigation<any>();
  const { user } = useAuthStore();
  const { sessionId, students, wsInstance, messages } = useClassroomStore();
  const [recording, setRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [textInput, setTextInput] = useState('');
  const [busyTab, setBusyTab] = useState<'voice' | 'text' | 'qr' | 'students'>('voice');
  const recordingRef = useRef<Audio.Recording | null>(null);
  const sessionData = route?.params?.sessionData || { session_id: sessionId || 'JAN-2024-LIVE' };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      setRecording(true);
    } catch {
      Alert.alert('Microphone Error', 'Could not start recording.');
    }
  };

  const stopAndTranslate = async () => {
    if (!recordingRef.current) return;
    setRecording(false);
    await recordingRef.current.stopAndUnloadAsync();
    const uri = recordingRef.current.getURI();
    recordingRef.current = null;
    if (!uri) return;

    const sourceLang = user?.selected_language || 'hi';
    const stt = await transcribeAudio(uri, sourceLang);
    if (stt.success && stt.text) {
      setTranscribedText(stt.text);
      const targetLangs = ['en', 'hi', 'or', 'sat', 'ho', 'mun'].filter(l => l !== sourceLang);
      const translations = await translateBatch(stt.text, sourceLang, targetLangs);
      broadcastToStudents(wsInstance, {
        message_type: 'translation',
        source_text: stt.text,
        source_lang: sourceLang,
        translations,
      });
    }
  };

  const sendText = async () => {
    if (!textInput.trim()) return;
    const sourceLang = user?.selected_language || 'hi';
    const targetLangs = ['en', 'hi', 'or', 'sat', 'ho', 'mun'].filter(l => l !== sourceLang);
    const translations = await translateBatch(textInput, sourceLang, targetLangs);
    broadcastToStudents(wsInstance, {
      message_type: 'text',
      source_text: textInput,
      source_lang: sourceLang,
      translations,
    });
    setTextInput('');
  };

  const handleEndSession = async () => {
    Alert.alert('End Broadcast?', 'All connected students will be disconnected.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End Broadcast',
        style: 'destructive',
        onPress: async () => {
          if (sessionId) await endSession(sessionId);
          nav.popToTop();
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      {/* On-Air Studio Header */}
      <LinearGradient
        colors={['#065F46', '#047857']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.topBar}
      >
        <View style={styles.onAirBox}>
          <View style={styles.redDot} />
          <Text style={styles.onAirText}>ON AIR</Text>
        </View>

        <View style={{ alignItems: 'center' }}>
          <Text style={styles.sessionTitle}>Live Classroom Audio Hub</Text>
          <Text style={styles.sessionId}>ID: {sessionData.session_id}</Text>
        </View>

        <TouchableOpacity onPress={handleEndSession} style={styles.endBtn} activeOpacity={0.8}>
          <Text style={styles.endBtnText}>END</Text>
        </TouchableOpacity>
      </LinearGradient>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: c.surface }]}>
        {(['voice', 'text', 'qr', 'students'] as const).map(tab => (
          <TouchableOpacity
            key={tab}
            onPress={() => setBusyTab(tab)}
            style={[styles.tab, busyTab === tab && { borderBottomColor: c.primary, borderBottomWidth: 3 }]}
          >
            <Text
              style={{
                color: busyTab === tab ? c.primary : c.textMuted,
                fontWeight: '800',
                fontSize: 12,
              }}
            >
              {tab === 'voice' ? '🎤 Voice' : tab === 'text' ? '💬 Text' : tab === 'qr' ? '📷 QR Code' : `👥 Students (${students.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 18 }}>
        {busyTab === 'voice' && (
          <View style={{ alignItems: 'center', paddingVertical: 10 }}>
            {/* Live Audio Visualizer */}
            <View style={[styles.waveBox, { backgroundColor: theme.isDark ? '#064E3B' : '#ECFDF5' }]}>
              <LiveAudioWaveform active={recording} color="#10B981" />
              <Text style={{ color: recording ? '#EF4444' : '#059669', fontSize: 11, fontWeight: '800', marginTop: 4 }}>
                {recording ? '● STREAMING LIVE AUDIO' : 'READY TO BROADCAST'}
              </Text>
            </View>

            {/* Pulsing Recording Microphone */}
            <PulsingMic
              isRecording={recording}
              onPressIn={startRecording}
              onPressOut={stopAndTranslate}
              size={120}
              icon="🎤"
              subLabel={recording ? 'RELEASE' : 'HOLD'}
              colors={['#10B981', '#059669']}
              pulseColor="rgba(16, 185, 129, 0.35)"
            />

            <Text style={{ color: c.textSecondary, marginTop: 14, fontSize: 13, textAlign: 'center', fontWeight: '600' }}>
              {recording
                ? '🎙️ Broadcasting live... Release to translate to all tribal languages'
                : '👆 Hold mic button to speak — auto-translates to students in ≤3s'}
            </Text>

            {/* Live Transcript Display */}
            {transcribedText ? (
              <View style={[styles.transcriptCard, { backgroundColor: c.card, borderColor: c.border }]}>
                <View style={styles.transcriptHeader}>
                  <Text style={{ color: c.textMuted, fontSize: 10, fontWeight: '800' }}>YOUR SPEECH (BROADCAST):</Text>
                  <View style={styles.statusPill}>
                    <Text style={{ color: '#065F46', fontSize: 9, fontWeight: '900' }}>SENT ✅</Text>
                  </View>
                </View>
                <Text style={{ color: c.text, fontSize: 16, fontWeight: '700', marginTop: 6, lineHeight: 22 }}>
                  "{transcribedText}"
                </Text>
                <Text style={{ color: '#10B981', fontSize: 11, fontWeight: '700', marginTop: 8 }}>
                  Translated into Santali, Ho, Mundari & Odia
                </Text>
              </View>
            ) : null}
          </View>
        )}

        {busyTab === 'text' && (
          <View>
            <TextInput
              style={[styles.textArea, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
              value={textInput}
              onChangeText={setTextInput}
              placeholder="Type lesson instructions to broadcast..."
              placeholderTextColor={c.textMuted}
              multiline
              numberOfLines={4}
            />
            <Button
              title="Send to All Students 📤"
              onPress={sendText}
              fullWidth
              disabled={!textInput.trim()}
              style={{ marginTop: 14 }}
            />
            <View style={[styles.historyBox, { backgroundColor: c.card, borderColor: c.border }]}>
              <Text style={{ color: c.textMuted, fontSize: 11, fontWeight: '800', marginBottom: 10 }}>
                RECENT BROADCAST MESSAGES:
              </Text>
              {messages.length === 0 ? (
                <Text style={{ color: c.textMuted, fontSize: 12 }}>No messages sent yet in this session.</Text>
              ) : (
                messages.slice(0, 5).map((m) => (
                  <View key={m.id} style={styles.msgItem}>
                    <Text style={{ color: c.text, fontSize: 13, fontWeight: '600' }}>📢 {m.source_text}</Text>
                  </View>
                ))
              )}
            </View>
          </View>
        )}

        {busyTab === 'qr' && (
          <View style={{ alignItems: 'center', paddingVertical: 10 }}>
            <Text style={{ color: c.text, fontWeight: '800', fontSize: 16, marginBottom: 16 }}>
              📷 Students Scan to Join Live Stream
            </Text>

            {/* High-Resolution QR Container */}
            <View style={styles.qrCard}>
              <View style={styles.qrFrame}>
                <QRCode
                  value={`janbhasha://session?id=${sessionData.session_id}`}
                  size={190}
                  color="#0F172A"
                  backgroundColor="#FFFFFF"
                />
              </View>
              <Text style={styles.qrSessionLabel}>SESSION PASSCODE</Text>
              <Text style={styles.qrSessionCode}>{sessionData.session_id}</Text>
            </View>

            <TribalMotifBar color={theme.isDark ? '#10B981' : '#059669'} height={12} />

            <View style={[styles.instructionBox, { backgroundColor: c.card, borderColor: c.border }]}>
              <Text style={{ color: c.text, fontWeight: '700', fontSize: 13 }}>📡 Wi-Fi Hotspot Instructions:</Text>
              <Text style={{ color: c.textSecondary, fontSize: 12, marginTop: 6, lineHeight: 18 }}>
                1. Enable Wi-Fi Hotspot on this device{'\n'}
                2. Have students connect to this Hotspot{'\n'}
                3. Students scan this QR code using the Student app QR scanner
              </Text>
            </View>
          </View>
        )}

        {busyTab === 'students' && (
          <View>
            <Text style={{ color: c.text, fontWeight: '800', fontSize: 15, marginBottom: 12 }}>
              Connected Students ({students.length})
            </Text>
            {students.length === 0 ? (
              <View style={[styles.emptyBox, { backgroundColor: c.card, borderColor: c.border }]}>
                <Text style={{ fontSize: 44 }}>👩‍🎓</Text>
                <Text style={{ color: c.text, fontWeight: '700', fontSize: 15, marginTop: 10 }}>No students connected yet</Text>
                <Text style={{ color: c.textMuted, fontSize: 12, marginTop: 4, textAlign: 'center' }}>
                  Ask students to scan the QR code from the QR Code tab to join this live broadcast.
                </Text>
              </View>
            ) : (
              students.map((s, i) => (
                <StudentCard key={s.student_id || i} student={{ name: s.name, is_active: true }} />
              ))
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
  },
  onAirBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 6,
  },
  redDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  onAirText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  sessionTitle: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  sessionId: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 10,
    fontWeight: '700',
  },
  endBtn: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  endBtnText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 11,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  waveBox: {
    borderRadius: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
    width: '100%',
  },
  transcriptCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 16,
    marginTop: 18,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  transcriptHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusPill: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  textArea: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    fontSize: 15,
    minHeight: 110,
    textAlignVertical: 'top',
  },
  historyBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginTop: 16,
  },
  msgItem: {
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
  },
  qrCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 14,
    elevation: 5,
    marginBottom: 16,
  },
  qrFrame: {
    padding: 10,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qrSessionLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 14,
  },
  qrSessionCode: {
    color: '#0F172A',
    fontWeight: '900',
    fontSize: 22,
    letterSpacing: 2,
    marginTop: 2,
  },
  instructionBox: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    width: '100%',
    marginTop: 12,
  },
  emptyBox: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 32,
    alignItems: 'center',
    marginTop: 20,
  },
});
