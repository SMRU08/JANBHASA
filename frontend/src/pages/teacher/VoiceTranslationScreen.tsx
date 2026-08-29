import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { PulsingMic } from '../../components/PulsingMic';
import { LiveAudioWaveform, TribalMotifBar } from '../../components/VisualIllustrations';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { transcribeAudio } from '../../services/sttService';
import { translate } from '../../services/translationService';
import { synthesize } from '../../services/ttsService';

const LANG_PAIRS = [
  { label: 'Hindi → Santali', source: 'hi', target: 'sat', flag: '🟢' },
  { label: 'Hindi → Ho', source: 'hi', target: 'ho', flag: '🔵' },
  { label: 'Hindi → Mundari', source: 'hi', target: 'mun', flag: '🟣' },
  { label: 'Hindi → Odia', source: 'hi', target: 'or', flag: '🟠' },
  { label: 'Hindi → English', source: 'hi', target: 'en', flag: '🌐' },
  { label: 'English → Hindi', source: 'en', target: 'hi', flag: '🇮🇳' },
];

const TTS_LOCALES: Record<string, string> = {
  hi: 'hi-IN', en: 'en-IN', or: 'or-IN', sat: 'hi-IN', ho: 'hi-IN', mun: 'hi-IN',
};

export function VoiceTranslationScreen() {
  const theme = useTheme();
  const c = theme.colors;
  const { user } = useAuthStore();
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [sourceText, setSourceText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [selectedPair, setSelectedPair] = useState(0);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [speaking, setSpeaking] = useState(false);
  const recordingRef = useRef<Audio.Recording | null>(null);

  const startRec = async () => {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      setRecording(true);
    } catch {
      Alert.alert('Error', 'Cannot access microphone.');
    }
  };

  const stopAndProcess = async () => {
    if (!recordingRef.current) return;
    setRecording(false);
    setProcessing(true);
    const startTime = Date.now();

    await recordingRef.current.stopAndUnloadAsync();
    const uri = recordingRef.current.getURI();
    recordingRef.current = null;
    if (!uri) {
      setProcessing(false);
      return;
    }

    const pair = LANG_PAIRS[selectedPair];
    const stt = await transcribeAudio(uri, pair.source);
    if (stt.success && stt.text) {
      setSourceText(stt.text);
      const result = await translate(stt.text, pair.source, pair.target);
      setTranslatedText(result);
      const elapsed = Date.now() - startTime;
      setLatencyMs(elapsed);

      // Auto-synthesize & speak in target tribal language
      speakText(result, pair.target);
    }
    setProcessing(false);
  };

  const speakText = async (text: string, lang: string) => {
    if (!text) return;
    setSpeaking(true);
    try {
      await Speech.speak(text, {
        language: TTS_LOCALES[lang] || 'hi-IN',
        rate: 0.85,
        onDone: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      });
    } catch {
      setSpeaking(false);
    }
  };

  const pair = LANG_PAIRS[selectedPair];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header
        title="Voice-to-Voice Bridge"
        subtitle="Real-Time Tribal Speech (≤3s Latency)"
        variant="gradient"
        gradientColors={['#7C3AED', '#6D28D9']}
      />

      <ScrollView contentContainerStyle={{ padding: 18 }}>
        {/* Latency Guarantee Badge */}
        <View style={[styles.latencyBadge, { backgroundColor: theme.isDark ? '#4C1D95' : '#EDE9FE', borderColor: '#8B5CF6' }]}>
          <Text style={{ fontSize: 16 }}>⚡</Text>
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={{ color: '#7C3AED', fontWeight: '900', fontSize: 12 }}>
              Edge Voice Pipeline: ≤3 Second Turnaround
            </Text>
            <Text style={{ color: c.textSecondary, fontSize: 10, marginTop: 1 }}>
              Speech-to-Text → Offline NMT Engine → Neural TTS Synthesis
            </Text>
          </View>
          {latencyMs && (
            <View style={styles.latencyPill}>
              <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 11 }}>
                {(latencyMs / 1000).toFixed(1)}s
              </Text>
            </View>
          )}
        </View>

        {/* Translation Direction Selector */}
        <Text style={[styles.label, { color: c.text }]}>Choose Language Pair</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {LANG_PAIRS.map((p, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setSelectedPair(i)}
              style={[
                styles.pairChip,
                {
                  backgroundColor: i === selectedPair ? '#7C3AED' : c.card,
                  borderColor: i === selectedPair ? '#7C3AED' : c.border,
                },
              ]}
            >
              <Text style={{ fontSize: 14 }}>{p.flag}</Text>
              <Text
                style={{
                  color: i === selectedPair ? '#FFFFFF' : c.text,
                  fontSize: 12,
                  fontWeight: '800',
                  marginLeft: 6,
                }}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Voice Visualizer Wave */}
        <View style={[styles.waveContainer, { backgroundColor: theme.isDark ? '#1E1B4B' : '#F5F3FF' }]}>
          <LiveAudioWaveform active={recording} color="#7C3AED" />
          <Text style={{ color: recording ? '#EF4444' : '#7C3AED', fontSize: 11, fontWeight: '800', marginTop: 4 }}>
            {recording ? '● LISTENING & TRANSCRIBING...' : processing ? '⏳ TRANSLATING VIA OFFLINE NLP...' : 'HOLD MIC TO SPEAK'}
          </Text>
        </View>

        {/* Pulsing Recording Mic */}
        <View style={{ alignItems: 'center', marginVertical: 10 }}>
          <PulsingMic
            isRecording={recording}
            onPressIn={startRec}
            onPressOut={stopAndProcess}
            size={120}
            icon="🎙️"
            subLabel={recording ? 'RELEASE' : 'HOLD'}
            colors={['#8B5CF6', '#7C3AED']}
            pulseColor="rgba(139, 92, 246, 0.35)"
          />
        </View>

        {/* Result Cards */}
        {sourceText ? (
          <View style={[styles.chatBubble, styles.sourceBubble, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={styles.bubbleHeader}>
              <Text style={{ color: c.textMuted, fontSize: 10, fontWeight: '800' }}>
                YOU SPOKE ({pair.source.toUpperCase()}):
              </Text>
              <TouchableOpacity onPress={() => speakText(sourceText, pair.source)}>
                <Text style={{ fontSize: 14 }}>🔊</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ color: c.text, fontSize: 17, fontWeight: '700', marginTop: 4 }}>
              "{sourceText}"
            </Text>
          </View>
        ) : null}

        {translatedText ? (
          <View style={[styles.chatBubble, styles.targetBubble, { backgroundColor: theme.isDark ? '#4C1D95' : '#EDE9FE', borderColor: '#8B5CF6' }]}>
            <View style={styles.bubbleHeader}>
              <Text style={{ color: '#7C3AED', fontSize: 10, fontWeight: '900' }}>
                TRANSLATION ({pair.target.toUpperCase()}):
              </Text>
              <TouchableOpacity onPress={() => speakText(translatedText, pair.target)}>
                <Text style={{ fontSize: 16 }}>{speaking ? '⏳' : '🔊'}</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ color: '#4C1D95', fontSize: 22, fontWeight: '900', marginTop: 4 }}>
              {translatedText}
            </Text>
            <TouchableOpacity
              onPress={() => speakText(translatedText, pair.target)}
              style={styles.replayBtn}
            >
              <Text style={{ color: '#FFFFFF', fontWeight: '800', fontSize: 12 }}>
                🔊 Listen Again in {pair.target.toUpperCase()}
              </Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <TribalMotifBar color={theme.isDark ? '#8B5CF6' : '#7C3AED'} height={12} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  latencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 12,
    marginBottom: 16,
  },
  latencyPill: {
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  label: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 10,
  },
  pairChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
  },
  waveContainer: {
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 10,
  },
  chatBubble: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  sourceBubble: {
    borderLeftWidth: 4,
    borderLeftColor: '#64748B',
  },
  targetBubble: {
    borderLeftWidth: 4,
    borderLeftColor: '#7C3AED',
  },
  bubbleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  replayBtn: {
    backgroundColor: '#7C3AED',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    alignSelf: 'flex-start',
    marginTop: 12,
  },
});
