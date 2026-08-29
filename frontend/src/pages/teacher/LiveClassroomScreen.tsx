import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import QRCode from 'react-native-qrcode-svg';
import { useTranslation } from 'react-i18next';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { StudentCard } from '../../components/OfflineBanner';
import { useTheme } from '../../theme';
import { useClassroomStore } from '../../store/classroomStore';
import { broadcastToStudents, endSession } from '../../services/classroomService';
import { transcribeAudio } from '../../services/sttService';
import { translateBatch } from '../../services/translationService';
import { useAuthStore } from '../../store/authStore';
import { useNavigation } from '@react-navigation/native';

export function LiveClassroomScreen({ route }: any) {
  const theme = useTheme(); const c = theme.colors;
  const { t } = useTranslation();
  const nav = useNavigation<any>();
  const { user } = useAuthStore();
  const { sessionId, students, wsInstance, messages } = useClassroomStore();
  const [recording, setRecording] = useState(false);
  const [transcribedText, setTranscribedText] = useState('');
  const [textInput, setTextInput] = useState('');
  const [busyTab, setBusyTab] = useState<'voice' | 'text' | 'qr' | 'students'>('voice');
  const recordingRef = useRef<Audio.Recording | null>(null);
  const sessionData = route?.params?.sessionData || { session_id: sessionId || 'LIVE' };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      setRecording(true);
    } catch (e) { Alert.alert('Microphone Error', 'Could not start recording.'); }
  };

  const stopAndTranslate = async () => {
    if (!recordingRef.current) return;
    setRecording(false);
    await recordingRef.current.stopAndUnloadAsync();
    const uri = recordingRef.current.getURI();
    recordingRef.current = null;
    if (!uri) return;

    const stt = await transcribeAudio(uri, user?.selected_language || 'hi');
    if (stt.success && stt.text) {
      setTranscribedText(stt.text);
      const targetLangs = ['en', 'hi', 'or', 'sat', 'ho', 'mun'].filter(l => l !== (user?.selected_language || 'hi'));
      const translations = await translateBatch(stt.text, user?.selected_language || 'hi', targetLangs);
      broadcastToStudents(wsInstance, {
        message_type: 'translation', source_text: stt.text,
        source_lang: user?.selected_language || 'hi', translations,
      });
    }
  };

  const sendText = async () => {
    if (!textInput.trim()) return;
    const targetLangs = ['en', 'hi', 'or', 'sat', 'ho', 'mun'].filter(l => l !== (user?.selected_language || 'hi'));
    const translations = await translateBatch(textInput, user?.selected_language || 'hi', targetLangs);
    broadcastToStudents(wsInstance, { message_type: 'text', source_text: textInput, source_lang: user?.selected_language || 'hi', translations });
    setTextInput('');
  };

  const handleEndSession = async () => {
    Alert.alert('End Session?', 'All students will be disconnected.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'End', style: 'destructive', onPress: async () => { if (sessionId) await endSession(sessionId); nav.popToTop(); } },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <View style={[styles.topBar, { backgroundColor: c.primary }]}>
        <View>
          <Text style={styles.liveLabel}>🔴 LIVE</Text>
          <Text style={styles.sessionId}>{sessionData.session_id}</Text>
        </View>
        <Text style={styles.studentCount}>👩‍🎓 {students.length} Students</Text>
        <TouchableOpacity onPress={handleEndSession} style={styles.endBtn}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>END</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { backgroundColor: c.surface }]}>
        {(['voice', 'text', 'qr', 'students'] as const).map(tab => (
          <TouchableOpacity key={tab} onPress={() => setBusyTab(tab)} style={[styles.tab, busyTab === tab && { borderBottomColor: c.primary, borderBottomWidth: 2.5 }]}>
            <Text style={{ color: busyTab === tab ? c.primary : c.textMuted, fontWeight: '700', fontSize: 12 }}>
              {tab === 'voice' ? '🎤' : tab === 'text' ? '💬' : tab === 'qr' ? '📷 QR' : `👥 (${students.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
        {busyTab === 'voice' && (
          <View style={{ alignItems: 'center' }}>
            <TouchableOpacity onPressIn={startRecording} onPressOut={stopAndTranslate} style={[styles.micBtn, { backgroundColor: recording ? c.error : c.primary }]} activeOpacity={0.8}>
              <Text style={{ fontSize: 52 }}>{recording ? '⏹️' : '🎤'}</Text>
            </TouchableOpacity>
            <Text style={{ color: c.textSecondary, marginTop: 12, fontSize: 14 }}>
              {recording ? 'Recording... Release to translate' : 'Hold to speak → auto-translates to all students'}
            </Text>
            {transcribedText ? (
              <View style={[styles.transcriptBox, { backgroundColor: c.card, borderColor: c.border }]}>
                <Text style={{ color: c.textMuted, fontSize: 11, marginBottom: 4 }}>Your speech:</Text>
                <Text style={{ color: c.text, fontSize: 16, fontWeight: '600' }}>{transcribedText}</Text>
                <Text style={{ color: c.success, fontSize: 12, marginTop: 8 }}>✅ Translated & sent to all students</Text>
              </View>
            ) : null}
          </View>
        )}
        {busyTab === 'text' && (
          <View>
            <TextInput style={[styles.textArea, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
              value={textInput} onChangeText={setTextInput} placeholder="Type message to broadcast..."
              placeholderTextColor={c.textMuted} multiline numberOfLines={4} />
            <Button title="Send to All Students 📤" onPress={sendText} fullWidth disabled={!textInput.trim()} style={{ marginTop: 12 }} />
            <View style={[styles.historyBox, { backgroundColor: c.card }]}>
              <Text style={{ color: c.textMuted, fontSize: 12, marginBottom: 8 }}>Recent messages:</Text>
              {messages.slice(0, 5).map(m => (
                <Text key={m.id} style={{ color: c.textSecondary, fontSize: 13, marginBottom: 6 }}>📢 {m.source_text}</Text>
              ))}
            </View>
          </View>
        )}
        {busyTab === 'qr' && (
          <View style={{ alignItems: 'center', paddingVertical: 20 }}>
            <Text style={{ color: c.text, fontWeight: '700', fontSize: 16, marginBottom: 16 }}>
              📷 Students Scan This QR Code
            </Text>
            <View style={{ backgroundColor: '#fff', borderRadius: 16, padding: 16, elevation: 4 }}>
              <QRCode
                value={`janbhasha://session?id=${sessionData.session_id}`}
                size={200}
                color="#000"
                backgroundColor="#fff"
              />
            </View>
            <View style={{ marginTop: 20, alignItems: 'center' }}>
              <Text style={{ color: c.textMuted, fontSize: 12, marginBottom: 4 }}>Session Code</Text>
              <Text style={{ color: c.text, fontWeight: '800', fontSize: 22, letterSpacing: 2 }}>
                {sessionData.session_id}
              </Text>
            </View>
            <View style={[{ backgroundColor: c.card, borderRadius: 12, padding: 14, marginTop: 16, width: '100%', borderWidth: 1, borderColor: c.border }]}>
              <Text style={{ color: c.textMuted, fontSize: 12 }}>
                📡 Make sure students are connected to the same Wi-Fi or hotspot. Share the session code above if they cannot scan the QR.
              </Text>
            </View>
          </View>
        )}
        {busyTab === 'students' && (
          students.length === 0
            ? <Text style={{ color: c.textMuted, textAlign: 'center', marginTop: 40 }}>No students connected yet. Share QR code from the QR tab.</Text>
            : students.map((s, i) => <StudentCard key={s.student_id || i} student={{ name: s.name, is_active: true }} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, paddingTop: 16 },
  liveLabel: { color: '#fff', fontSize: 12, fontWeight: '800' },
  sessionId: { color: 'rgba(255,255,255,0.8)', fontSize: 11 },
  studentCount: { color: '#fff', fontWeight: '700' },
  endBtn: { backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  tabs: { flexDirection: 'row', borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center' },
  micBtn: { width: 140, height: 140, borderRadius: 70, alignItems: 'center', justifyContent: 'center', marginVertical: 24, elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  transcriptBox: { borderRadius: 14, borderWidth: 1, padding: 16, marginTop: 16, width: '100%' },
  textArea: { borderRadius: 12, borderWidth: 1.5, padding: 14, fontSize: 15, minHeight: 100, textAlignVertical: 'top' },
  historyBox: { borderRadius: 12, padding: 14, marginTop: 12 },
});
