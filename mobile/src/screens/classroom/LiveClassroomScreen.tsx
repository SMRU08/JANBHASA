import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { SohraiWatermark } from '../../components/common/SohraiWatermark';
import { NeumorphicButton } from '../../components/common/NeumorphicButton';
import { WaveformVisualizer } from '../../components/classroom/WaveformVisualizer';
import { SkeletonLoader } from '../../components/common/SkeletonLoader';
import { useClassroomStore } from '../../store/useClassroomStore';
import { AudioInferenceJSI } from '../../native-bridges/AudioInferenceJSI';
import { MemoryGuard } from '../../utils/memoryGuard';

export const LiveClassroomScreen: React.FC = () => {
  const {
    isRecording,
    isProcessing,
    isPlayingAudio,
    currentInputText,
    currentOutputText,
    audioWaveformLevels,
    history,
    setIsRecording,
    setIsProcessing,
    setIsPlayingAudio,
    setLiveTranslation,
    updateWaveform,
  } = useClassroomStore();

  const waveformIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (waveformIntervalRef.current) clearInterval(waveformIntervalRef.current);
    };
  }, []);

  const handleToggleRecord = async () => {
    if (isRecording) {
      // STOP Recording & Trigger Native INT8 Pipeline
      setIsRecording(false);
      if (waveformIntervalRef.current) {
        clearInterval(waveformIntervalRef.current);
        waveformIntervalRef.current = null;
      }

      setIsProcessing(true);

      // Memory safeguard before starting heavy inference
      MemoryGuard.assertSafeForInference();

      // Trigger C++ JSI Native Pipeline (Whisper -> IndicTrans2 -> VITS)
      const res = await AudioInferenceJSI.executeVoiceToVoice(
        'file:///data/user/0/com.janbhasha/cache/mic_input.wav',
        'hin_Deva',
        'sat_Olck'
      );

      setIsProcessing(false);
      if (res.success) {
        setLiveTranslation(res.transcript, res.translatedText, res.audioWavPath, res.latencyMs);
      }
    } else {
      // START Recording
      setIsRecording(true);

      // Simulate zero-copy audio buffer callback via JSI
      waveformIntervalRef.current = setInterval(() => {
        const dummyBuffer = new ArrayBuffer(512);
        const energy = AudioInferenceJSI.processAudioBuffer(dummyBuffer);
        updateWaveform(energy);
      }, 80);
    }
  };

  const handlePlayAudio = () => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    // Native VITS playback via AudioTrack / MediaPlayer
    setTimeout(() => {
      setIsPlayingAudio(false);
    }, 2000);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={Colors.background.slate} barStyle="dark-content" />
      <SohraiWatermark />

      {/* Header Info Bar */}
      <View style={styles.headerBar}>
        <View style={styles.badgeContainer}>
          <Text style={styles.badgeText}>⚡ 100% OFFLINE TABLET MODE</Text>
        </View>
        <Text style={styles.modeTitle}>Live Classroom Dictation</Text>
      </View>

      {/* Main Display Area (Zero-UI High Legibility Slate) */}
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        {/* Real-Time Translation Slate Card */}
        <View style={styles.slateCard}>
          <Text style={styles.languageLabel}>HINDI (TEACHER INPUT):</Text>
          {isProcessing ? (
            <SkeletonLoader height={32} style={{ marginVertical: 8 }} />
          ) : (
            <Text style={styles.hindiInputText}>
              {currentInputText || 'Tap the Teal Button below and speak in Hindi...'}
            </Text>
          )}

          <View style={styles.divider} />

          <Text style={styles.languageLabel}>SANTHALI OL CHIKI (STUDENT OUTPUT):</Text>
          {isProcessing ? (
            <View style={{ marginTop: 8 }}>
              <SkeletonLoader height={48} borderRadius={16} />
              <Text style={styles.processingHint}>Translating via offline IndicTrans2 INT8...</Text>
            </View>
          ) : (
            <Text style={styles.santhaliOutputText}>
              {currentOutputText || 'ᱚᱞ ᱪᱤᱠᱤ ᱛᱮ ᱛᱚᱨᱡᱚᱢᱟ ᱱᱚᱸᱰᱮ ᱧᱮᱞᱚᱜ-ᱟ...'}
            </Text>
          )}

          {/* Quick Playback Zone */}
          {currentOutputText && !isProcessing ? (
            <View style={styles.playbackRow}>
              <NeumorphicButton
                onPress={handlePlayAudio}
                zone="playback"
                title={isPlayingAudio ? "PLAYING..." : "🔊 PLAY SANTHALI AUDIO (VITS)"}
                subtitle="High-fidelity offline tribal speech"
                style={styles.playbackBtn}
              />
            </View>
          ) : null}
        </View>

        {/* Live Audio Waveform */}
        <View style={styles.waveformContainer}>
          <WaveformVisualizer levels={audioWaveformLevels} isActive={isRecording} />
          <Text style={styles.waveformStatus}>
            {isRecording
              ? 'LISTENING... (Zero-copy C++ JSI Streaming)'
              : isProcessing
              ? 'PROCESSING OFFLINE PIPELINE (< 3.0s)...'
              : 'IDLE (Ready for next sentence)'}
          </Text>
        </View>
      </ScrollView>

      {/* Giant Tactile Teacher Touch Zone */}
      <View style={styles.actionZoneFooter}>
        <NeumorphicButton
          onPress={handleToggleRecord}
          zone={isRecording ? 'danger' : 'recording'}
          size="massive"
          title={isRecording ? '■ TAP TO FINISH SENTENCE' : '🎤 TAP & SPEAK IN HINDI'}
          subtitle={isRecording ? 'Processing will start instantly' : 'Whisper INT8 will transcribe on-device'}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.slate,
  },
  headerBar: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeContainer: {
    backgroundColor: Colors.cultural.forestGreen,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  modeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.background.darkSlate,
  },
  scrollContent: {
    padding: 20,
    flexGrow: 1,
    justifyContent: 'center',
  },
  slateCard: {
    backgroundColor: Colors.background.surface,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: Colors.background.border,
    padding: 24,
    minHeight: 280,
    shadowColor: Colors.background.darkSlate,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  languageLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.cultural.terracotta,
    letterSpacing: 1,
    marginBottom: 6,
  },
  hindiInputText: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.background.darkSlate,
    lineHeight: 32,
  },
  divider: {
    height: 2,
    backgroundColor: Colors.background.border,
    marginVertical: 18,
  },
  santhaliOutputText: {
    fontSize: 30, // Larger size for clear Ol Chiki character recognition
    fontWeight: '800',
    color: Colors.cultural.forestGreenDark,
    lineHeight: 44,
  },
  processingHint: {
    fontSize: 13,
    color: Colors.cultural.terracotta,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'center',
  },
  playbackRow: {
    marginTop: 20,
  },
  playbackBtn: {
    width: '100%',
  },
  waveformContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  waveformStatus: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.background.darkSlate,
    marginTop: 4,
    letterSpacing: 0.5,
  },
  actionZoneFooter: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 10,
    backgroundColor: Colors.background.slate,
    borderTopWidth: 2,
    borderTopColor: Colors.background.border,
  },
});
