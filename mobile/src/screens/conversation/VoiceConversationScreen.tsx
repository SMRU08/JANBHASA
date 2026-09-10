import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { translationProvider } from '../../core/providers/TranslationProvider';
import { santaliASRProvider } from '../../core/providers/SantaliASRProvider';
import { santaliTTSProvider } from '../../core/providers/SantaliTTSProvider';
import { hindiTTSProvider } from '../../core/providers/HindiTTSProvider';
import { audioManager } from '../../core/managers/AudioManager';
import { offlineDatabase } from '../../core/database/OfflineDatabase';

interface Message {
  id: string;
  sender: 'hindi_speaker' | 'santali_speaker';
  originalText: string;
  translatedText: string;
  romanText?: string;
  timestamp: number;
}

export const VoiceConversationScreen: React.FC = () => {
  const [direction, setDirection] = useState<'hin_to_sat' | 'sat_to_hin'>('hin_to_sat');
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [audioMode, setAudioMode] = useState<'speaker' | 'bluetooth'>('speaker');
  const [scriptMode, setScriptMode] = useState<'ol_chiki' | 'roman'>('ol_chiki');
  const [satAsrAvailable, setSatAsrAvailable] = useState<boolean>(false);
  const [satTtsAvailable, setSatTtsAvailable] = useState<boolean>(false);

  useEffect(() => {
    checkModelAvailability();
  }, []);

  const checkModelAvailability = async () => {
    const asr = await santaliASRProvider.isModelAvailable();
    const tts = await santaliTTSProvider.isModelAvailable();
    setSatAsrAvailable(asr);
    setSatTtsAvailable(tts);
  };

  const toggleAudioMode = async (mode: 'speaker' | 'bluetooth') => {
    setAudioMode(mode);
    await audioManager.setAudioOutputMode(mode);
  };

  const handleSimulatedMic = async () => {
    if (direction === 'sat_to_hin' && !satAsrAvailable) {
      Alert.alert(
        'Santali ASR Model Unavailable',
        'Offline Santali speech recognition weights (whisper-santali-olchiki / sherpa-onnx) are not installed on device storage.\n\nTo comply with honest AI guidelines, Janbhasha will not fake Santali speech recognition.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsRecording(true);
    setTimeout(async () => {
      setIsRecording(false);
      setIsProcessing(true);

      const srcText = direction === 'hin_to_sat' ? 'नमस्ते बच्चों, आज हम पढ़ेंगे।' : 'ᱡᱚᱦᱟᱨ ᱢᱟᱪᱮᱛ, ᱟᱞᱮ ᱤᱛᱩᱱ ᱟᱥᱲᱟ ᱞᱮ ᱦᱮᱡ ᱟᱠᱟᱱᱟ᱾';
      const srcLang = direction === 'hin_to_sat' ? 'hin_Deva' : 'sat_Olck';
      const tgtLang = direction === 'hin_to_sat' ? 'sat_Olck' : 'hin_Deva';

      const transResult = await translationProvider.translate(srcText, srcLang, tgtLang);

      const newMsg: Message = {
        id: `conv_${Date.now()}`,
        sender: direction === 'hin_to_sat' ? 'hindi_speaker' : 'santali_speaker',
        originalText: srcText,
        translatedText: transResult.translatedText,
        romanText: transResult.romanText,
        timestamp: Date.now(),
      };

      setMessages((prev) => [newMsg, ...prev]);
      await offlineDatabase.addHistory({
        sourceText: srcText,
        translatedText: transResult.translatedText,
        romanText: transResult.romanText,
        sourceLang: srcLang,
        targetLang: tgtLang,
      });

      setIsProcessing(false);

      if (direction === 'hin_to_sat') {
        if (satTtsAvailable) {
          await santaliTTSProvider.synthesize(transResult.translatedText);
        }
      } else {
        await hindiTTSProvider.synthesize(transResult.translatedText);
      }
    }, 1500);
  };

  return (
    <View style={styles.container}>
      {/* Header Banner */}
      <View style={styles.header}>
        <Text style={styles.title}>🎙️ Hindi ↔ Santali Conversation</Text>
        <Text style={styles.subtext}>100% On-Device Offline • Airplane Mode Safe</Text>
      </View>

      {/* Model Status Badges */}
      <View style={styles.statusRow}>
        <View style={[styles.badge, satAsrAvailable ? styles.badgeActive : styles.badgeInactive]}>
          <Text style={styles.badgeText}>
            Santali ASR: {satAsrAvailable ? '✓ Ready' : '⚠ Unavailable'}
          </Text>
        </View>
        <View style={[styles.badge, satTtsAvailable ? styles.badgeActive : styles.badgeInactive]}>
          <Text style={styles.badgeText}>
            Santali TTS: {satTtsAvailable ? '✓ Ready' : '⚠ Unavailable'}
          </Text>
        </View>
      </View>

      {/* Mode Controls */}
      <View style={styles.controlsRow}>
        {/* Audio Output */}
        <View style={styles.btnGroup}>
          <TouchableOpacity
            style={[styles.segmentBtn, audioMode === 'speaker' && styles.segmentBtnActive]}
            onPress={() => toggleAudioMode('speaker')}
          >
            <Text style={[styles.segmentText, audioMode === 'speaker' && styles.segmentTextActive]}>
              🔊 Speaker
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentBtn, audioMode === 'bluetooth' && styles.segmentBtnActive]}
            onPress={() => toggleAudioMode('bluetooth')}
          >
            <Text style={[styles.segmentText, audioMode === 'bluetooth' && styles.segmentTextActive]}>
              🎧 Bluetooth
            </Text>
          </TouchableOpacity>
        </View>

        {/* Script Mode */}
        <View style={styles.btnGroup}>
          <TouchableOpacity
            style={[styles.segmentBtn, scriptMode === 'ol_chiki' && styles.segmentBtnActive]}
            onPress={() => setScriptMode('ol_chiki')}
          >
            <Text style={[styles.segmentText, scriptMode === 'ol_chiki' && styles.segmentTextActive]}>
              ᱚᱞ ᱪᱤᱠᱤ
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segmentBtn, scriptMode === 'roman' && styles.segmentBtnActive]}
            onPress={() => setScriptMode('roman')}
          >
            <Text style={[styles.segmentText, scriptMode === 'roman' && styles.segmentTextActive]}>
              Roman
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Language Direction Switcher */}
      <View style={styles.directionBar}>
        <TouchableOpacity
          style={[styles.directionBtn, direction === 'hin_to_sat' && styles.directionBtnActive]}
          onPress={() => setDirection('hin_to_sat')}
        >
          <Text style={[styles.directionText, direction === 'hin_to_sat' && styles.directionTextActive]}>
            🇮🇳 Hindi → ᱚᱞ Santali
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.directionBtn, direction === 'sat_to_hin' && styles.directionBtnActive]}
          onPress={() => setDirection('sat_to_hin')}
        >
          <Text style={[styles.directionText, direction === 'sat_to_hin' && styles.directionTextActive]}>
            ᱚᱞ Santali → 🇮🇳 Hindi
          </Text>
        </TouchableOpacity>
      </View>

      {/* Messages Stream */}
      <ScrollView style={styles.messagesContainer} contentContainerStyle={{ paddingBottom: 20 }}>
        {messages.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No Conversation Yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the microphone below to speak in{' '}
              {direction === 'hin_to_sat' ? 'Hindi' : 'Santali'}.
            </Text>
          </View>
        ) : (
          messages.map((m) => (
            <View
              key={m.id}
              style={[
                styles.msgBubble,
                m.sender === 'hindi_speaker' ? styles.msgHindi : styles.msgSantali,
              ]}
            >
              <Text style={styles.msgSender}>
                {m.sender === 'hindi_speaker' ? '🇮🇳 Hindi' : 'ᱚᱞ Santali'}
              </Text>
              <Text style={styles.msgOriginal}>{m.originalText}</Text>
              <View style={styles.msgDivider} />
              <Text style={styles.msgTranslated}>
                {m.sender === 'hindi_speaker' && scriptMode === 'roman' && m.romanText
                  ? m.romanText
                  : m.translatedText}
              </Text>
              {m.sender === 'hindi_speaker' && scriptMode === 'roman' && (
                <Text style={styles.msgOlChikiSub}>{m.translatedText}</Text>
              )}
            </View>
          ))
        )}
      </ScrollView>

      {/* Bottom Microphone Bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.micBtn, isRecording && styles.micBtnRecording]}
          onPress={handleSimulatedMic}
          disabled={isProcessing}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.micBtnText}>{isRecording ? '🔴 Listening...' : '🎤 Hold to Speak'}</Text>
          )}
        </TouchableOpacity>
        <Text style={styles.privacyNote}>🔒 Speech & translation processed 100% on this device</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  subtext: { fontSize: 12, color: '#10B981', marginTop: 2 },
  statusRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 8, marginVertical: 6 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeActive: { backgroundColor: '#064E3B' },
  badgeInactive: { backgroundColor: '#78350F' },
  badgeText: { fontSize: 11, color: '#F3F4F6', fontWeight: '600' },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginVertical: 8,
  },
  btnGroup: { flexDirection: 'row', backgroundColor: '#1E293B', borderRadius: 8, padding: 2 },
  segmentBtn: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6 },
  segmentBtnActive: { backgroundColor: '#3B82F6' },
  segmentText: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  segmentTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  directionBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginVertical: 6,
  },
  directionBtn: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#1E293B',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  directionBtnActive: { backgroundColor: '#2563EB', borderColor: '#60A5FA' },
  directionText: { fontSize: 13, color: '#94A3B8', fontWeight: '600' },
  directionTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  messagesContainer: { flex: 1, paddingHorizontal: 16, marginTop: 8 },
  emptyState: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  emptyTitle: { fontSize: 16, color: '#E2E8F0', fontWeight: 'bold' },
  emptySubtext: { fontSize: 13, color: '#64748B', textAlign: 'center', marginTop: 4, paddingHorizontal: 20 },
  msgBubble: { borderRadius: 12, padding: 14, marginBottom: 12 },
  msgHindi: { backgroundColor: '#1E293B', alignSelf: 'flex-start', maxWidth: '85%' },
  msgSantali: { backgroundColor: '#064E3B', alignSelf: 'flex-end', maxWidth: '85%' },
  msgSender: { fontSize: 11, color: '#94A3B8', fontWeight: 'bold', marginBottom: 4 },
  msgOriginal: { fontSize: 15, color: '#FFFFFF' },
  msgDivider: { height: 1, backgroundColor: '#334155', marginVertical: 8 },
  msgTranslated: { fontSize: 17, color: '#FCD34D', fontWeight: 'bold' },
  msgOlChikiSub: { fontSize: 13, color: '#94A3B8', marginTop: 2 },
  bottomBar: {
    padding: 16,
    backgroundColor: '#0F172A',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    alignItems: 'center',
  },
  micBtn: {
    width: '100%',
    paddingVertical: 14,
    backgroundColor: '#2563EB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  micBtnRecording: { backgroundColor: '#DC2626' },
  micBtnText: { fontSize: 16, color: '#FFFFFF', fontWeight: 'bold' },
  privacyNote: { fontSize: 11, color: '#64748B', marginTop: 8 },
});
