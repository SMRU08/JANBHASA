import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { transcribeAudio } from '../../services/sttService';
import { translate } from '../../services/translationService';
import { synthesize } from '../../services/ttsService';
import { SUPPORTED_LANGUAGES } from '../../locales/i18n';

const LANG_PAIRS = [
  { label: 'Hindi → English', source: 'hi', target: 'en' },
  { label: 'Hindi → Santali', source: 'hi', target: 'sat' },
  { label: 'Hindi → Odia', source: 'hi', target: 'or' },
  { label: 'Hindi → Ho', source: 'hi', target: 'ho' },
  { label: 'Hindi → Mundari', source: 'hi', target: 'mun' },
  { label: 'English → Hindi', source: 'en', target: 'hi' },
];

export function VoiceTranslationScreen() {
  const theme = useTheme(); const c = theme.colors;
  const { user } = useAuthStore();
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [selectedPair, setSelectedPair] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);

  const startRec = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      setRecording(true);
    } catch { Alert.alert('Error', 'Cannot access microphone.'); }
  };

  const stopAndProcess = async () => {
    if (!recordingRef.current) return;
    setRecording(false); setProcessing(true);
    await recordingRef.current.stopAndUnloadAsync();
    const uri = recordingRef.current.getURI();
    recordingRef.current = null;
    if (!uri) { setProcessing(false); return; }
    const pair = LANG_PAIRS[selectedPair];
    const stt = await transcribeAudio(uri, pair.source);
    if (stt.success && stt.text) {
      setSourceText(stt.text);
      const result = await translate(stt.text, pair.source, pair.target);
      setTranslatedText(result);
      const url = await synthesize(result, pair.target);
      setAudioUrl(url);
      if (url) { await playAudio(url); }
    }
    setProcessing(false);
  };

  const playAudio = async (url: string) => {
    try {
      if (soundRef.current) { await soundRef.current.unloadAsync(); }
      const { sound } = await Audio.Sound.createAsync({ uri: url });
      soundRef.current = sound;
      await sound.playAsync();
    } catch { }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="Voice Translation" subtitle="बोलें — सभी भाषाओं में" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Language pair selector */}
        <Text style={[styles.label, { color: c.textSecondary }]}>Translation Direction</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {LANG_PAIRS.map((p, i) => (
            <TouchableOpacity key={i} onPress={() => setSelectedPair(i)} style={[styles.pairChip, { backgroundColor: i === selectedPair ? c.primary : c.card, borderColor: i === selectedPair ? c.primary : c.border }]}>
              <Text style={{ color: i === selectedPair ? '#fff' : c.text, fontSize: 12, fontWeight: '700' }}>{p.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Mic button */}
        <View style={{ alignItems: 'center', marginVertical: 20 }}>
          <TouchableOpacity onPressIn={startRec} onPressOut={stopAndProcess} style={[styles.micBtn, { backgroundColor: recording ? c.error : (processing ? c.secondary : c.primary) }]} activeOpacity={0.8}>
            <Text style={{ fontSize: 52 }}>{recording ? '⏹️' : (processing ? '⏳' : '🎤')}</Text>
          </TouchableOpacity>
          <Text style={{ color: c.textSecondary, marginTop: 12, fontSize: 14, textAlign: 'center' }}>
            {recording ? 'Release to translate...' : processing ? 'Processing...' : 'Hold to speak'}
          </Text>
        </View>

        {/* Result cards */}
        {sourceText ? (
          <View style={[styles.resultCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={{ color: c.textMuted, fontSize: 11, fontWeight: '600' }}>YOU SAID:</Text>
            <Text style={{ color: c.text, fontSize: 18, fontWeight: '700', marginTop: 4 }}>{sourceText}</Text>
          </View>
        ) : null}
        {translatedText ? (
          <View style={[styles.resultCard, { backgroundColor: c.primaryLight, borderColor: c.primary }]}>
            <Text style={{ color: c.primary, fontSize: 11, fontWeight: '600' }}>TRANSLATION ({LANG_PAIRS[selectedPair].target.toUpperCase()}):</Text>
            <Text style={{ color: c.primaryDark, fontSize: 22, fontWeight: '800', marginTop: 4 }}>{translatedText}</Text>
            {audioUrl && (
              <TouchableOpacity onPress={() => playAudio(audioUrl)} style={[styles.playBtn, { backgroundColor: c.primary }]}>
                <Text style={{ color: '#fff', fontWeight: '700' }}>🔊 Play</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13, fontWeight: '600', marginBottom: 10 },
  pairChip: { borderRadius: 20, borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 8, marginRight: 8 },
  micBtn: { width: 130, height: 130, borderRadius: 65, alignItems: 'center', justifyContent: 'center', elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8 },
  resultCard: { borderRadius: 16, borderWidth: 1.5, padding: 18, marginBottom: 14 },
  playBtn: { borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10, alignSelf: 'flex-start', marginTop: 12 },
});
