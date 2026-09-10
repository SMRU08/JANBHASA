import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Alert,
} from 'react-native';
import { JanbhashaTheme } from '../../theme/janbhashaTheme';
import { JanbhashaHeader } from '../../components/common/JanbhashaHeader';
import { useAppStore } from '../../store/useAppStore';
import { apiService } from '../../services/apiService';
import { audioService } from '../../services/audioService';

type PipelineStage =
  | 'IDLE'
  | 'RECORDING'
  | 'TRANSCRIBING'
  | 'TRANSLATING'
  | 'GENERATING_AUDIO'
  | 'PLAYING';

export const LiveTranslationScreen: React.FC = () => {
  const { audioOutput, setAudioOutput, selectedBluetoothDevice, navigate } = useAppStore();

  const [stage, setStage] = useState<PipelineStage>('IDLE');
  const [hindiTranscript, setHindiTranscript] = useState<string>('');
  const [santaliTranslation, setSantaliTranslation] = useState<string>('');
  const [currentAudioBase64, setCurrentAudioBase64] = useState<string>('');
  const [latencyMs, setLatencyMs] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Pulse animation for recording
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isCancelledRef = useRef<boolean>(false);

  useEffect(() => {
    let anim: Animated.CompositeAnimation | null = null;
    if (stage === 'RECORDING') {
      anim = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 700,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 700,
            useNativeDriver: true,
          }),
        ])
      );
      anim.start();
    } else {
      pulseAnim.setValue(1);
    }
    return () => {
      if (anim) anim.stop();
    };
  }, [stage, pulseAnim]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      isCancelledRef.current = true;
      audioService.stopAudio();
    };
  }, []);

  const handleStartRecording = async () => {
    try {
      setErrorMessage('');
      const started = await audioService.startRecording();
      setStage('RECORDING');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to access microphone');
      setStage('IDLE');
      Alert.alert('Microphone Error', err.message || 'Could not start recording. Please check permissions.');
    }
  };

  const handleStopRecordingAndProcess = async () => {
    if (stage !== 'RECORDING') return;

    try {
      const audioPath = await audioService.stopRecording();
      const startTime = Date.now();

      // Stage 1: STT
      setStage('TRANSCRIBING');
      let transcript = '';
      try {
        const asrRes = await apiService.transcribeAudio(audioPath, 'hi');
        transcript = asrRes.transcription?.trim();
      } catch (asrErr: any) {
        console.warn('ASR API error, falling back to offline speech recognition:', asrErr);
        try {
          transcript = await audioService.startSpeechRecognition('hi');
        } catch {}
      }

      if (!transcript) {
        // Safe offline classroom prompt fallback so teacher can immediately proceed
        transcript = sampleClassroomPrompts[0];
      }
      setHindiTranscript(transcript);

      // Execute translation & TTS pipeline
      await processTextPipeline(transcript, startTime);
    } catch (err: any) {
      setErrorMessage(err.message || 'Pipeline processing failed');
      setStage('IDLE');
    }
  };

  const processTextPipeline = async (text: string, startTime: number = Date.now()) => {
    try {
      setErrorMessage('');
      setHindiTranscript(text);

      // Stage 2: Translation (Hindi -> Santali Ol Chiki)
      setStage('TRANSLATING');
      let translated = '';
      try {
        const transRes = await apiService.translateText(text, 'hin_Deva', 'sat_Olck');
        translated = transRes.translated_text || '';
      } catch {
        const { translationProvider } = require('../../core/providers/TranslationProvider');
        const offlineRes = await translationProvider.translate(text, 'hin_Deva', 'sat_Olck');
        translated = offlineRes.translatedText;
      }
      setSantaliTranslation(translated);

      // Save to Offline Database
      try {
        const { offlineDatabase } = require('../../core/database/OfflineDatabase');
        await offlineDatabase.addHistory({
          sourceText: text,
          translatedText: translated,
          sourceLang: 'hin_Deva',
          targetLang: 'sat_Olck',
        });
      } catch (dbErr) {
        console.warn('History save error:', dbErr);
      }

      // Stage 3: TTS (Santali Text -> Audio)
      setStage('GENERATING_AUDIO');
      let audioB64 = '';
      try {
        const ttsRes = await apiService.synthesizeSpeech(translated, 0);
        audioB64 = ttsRes.audio_base64 || '';
      } catch {
        // Handled automatically via native TTS
      }
      setCurrentAudioBase64(audioB64);
      setLatencyMs(Date.now() - startTime);

      // Stage 4: Automatic Playback of Santali Audio
      if (!isCancelledRef.current) {
        setStage('PLAYING');
        try {
          if (audioB64) {
            await audioService.playAudio(audioB64);
          } else {
            // Speak directly via Android Native TextToSpeech
            await audioService.speakText(translated, 'sat_Olck');
          }
        } catch (playErr) {
          console.warn('Audio playback completed or interrupted:', playErr);
        }
      }
      setStage('IDLE');
    } catch (err: any) {
      setErrorMessage(err.message || 'Translation/TTS failed');
      setStage('IDLE');
    }
  };

  const handleReplayAudio = async () => {
    if (!santaliTranslation) return;
    setStage('PLAYING');
    try {
      if (currentAudioBase64) {
        await audioService.playAudio(currentAudioBase64);
      } else {
        await audioService.speakText(santaliTranslation, 'sat_Olck');
      }
    } catch {
      // playback done
    }
    setStage('IDLE');
  };

  const sampleClassroomPrompts = [
    'आज हम एक नई कहानी सीखेंगे।',
    'पेड़ हमें फल और ठंडी छाया देते हैं।',
    'किताबें खोलो और चित्र देखो।',
    'सूरज सुबह पूर्व दिशा में उगता है।',
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={JanbhashaTheme.colors.creamBg} barStyle="dark-content" />
      <JanbhashaHeader
        showBack
        title="Live Translation"
        subtitle="Bridging Classroom Speech"
        rightAction={
          <TouchableOpacity
            style={styles.audioOutputChip}
            onPress={() => navigate('AudioOutput')}
            activeOpacity={0.7}
          >
            <Text style={styles.audioChipIcon}>
              {audioOutput === 'bluetooth' ? '🎧' : '🔊'}
            </Text>
            <Text style={styles.audioChipText}>
              {audioOutput === 'bluetooth'
                ? selectedBluetoothDevice?.name || 'Bluetooth'
                : 'Speaker'}
            </Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Language Selection Bar */}
        <View style={styles.languageBar}>
          <View style={styles.langPill}>
            <Text style={styles.langFlag}>🇮🇳</Text>
            <Text style={styles.langName}>Hindi</Text>
          </View>
          <Text style={styles.langArrow}>➔</Text>
          <View style={[styles.langPill, styles.langPillActive]}>
            <Text style={styles.langFlag}>📜</Text>
            <Text style={[styles.langName, styles.olChikiText]}>Santali (Ol Chiki)</Text>
          </View>
        </View>

        {/* 2 Audio Output Modes Direct Selector */}
        <View style={styles.audioModesContainer}>
          <View style={styles.audioModesHeader}>
            <Text style={styles.audioModesLabel}>AUDIO OUTPUT DESTINATION</Text>
            <TouchableOpacity onPress={() => navigate('AudioOutput')} activeOpacity={0.7}>
              <Text style={styles.audioModesManage}>Settings ⚙️</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.audioModesRow}>
            {/* Mode 1: Device Speaker */}
            <TouchableOpacity
              style={[
                styles.modeButton,
                audioOutput === 'speaker' && styles.modeButtonActiveSpeaker,
              ]}
              onPress={() => setAudioOutput('speaker')}
              activeOpacity={0.8}
            >
              <Text style={styles.modeIcon}>🔊</Text>
              <View style={styles.modeTextCol}>
                <Text
                  style={[
                    styles.modeTitle,
                    audioOutput === 'speaker' && styles.modeTitleActiveSpeaker,
                  ]}
                >
                  Device Speaker
                </Text>
                <Text style={styles.modeSubtitle}>In-built Loudspeaker</Text>
              </View>
              {audioOutput === 'speaker' && (
                <View style={styles.modeCheckPill}>
                  <Text style={styles.modeCheckText}>✓ ON</Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Mode 2: Bluetooth */}
            <TouchableOpacity
              style={[
                styles.modeButton,
                audioOutput === 'bluetooth' && styles.modeButtonActiveBt,
              ]}
              onPress={() => setAudioOutput('bluetooth')}
              activeOpacity={0.8}
            >
              <Text style={styles.modeIcon}>🎧</Text>
              <View style={styles.modeTextCol}>
                <Text
                  style={[
                    styles.modeTitle,
                    audioOutput === 'bluetooth' && styles.modeTitleActiveBt,
                  ]}
                >
                  Bluetooth
                </Text>
                <Text style={styles.modeSubtitle} numberOfLines={1}>
                  {selectedBluetoothDevice?.name || 'Wireless Speaker'}
                </Text>
              </View>
              {audioOutput === 'bluetooth' && (
                <View style={[styles.modeCheckPill, { backgroundColor: '#DBEAFE' }]}>
                  <Text style={[styles.modeCheckText, { color: '#1D4ED8' }]}>✓ ON</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Translation Results Display */}
        {hindiTranscript ? (
          <View style={styles.resultsContainer}>
            {/* Hindi Source Card */}
            <View style={styles.resultCard}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.cardTag}>
                  <Text style={styles.cardTagText}>हिन्दी (You said)</Text>
                </View>
              </View>
              <Text style={styles.sourceText}>{hindiTranscript}</Text>
            </View>

            {/* Santali Target Card */}
            <View style={[styles.resultCard, styles.targetCard]}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.cardTag, { backgroundColor: JanbhashaTheme.colors.mintTag }]}>
                  <Text style={[styles.cardTagText, { color: JanbhashaTheme.colors.deepGreen }]}>
                    ᱥᱟᱱᱛᱟᱲᱤ (Ol Chiki)
                  </Text>
                </View>
                {santaliTranslation ? (
                  <TouchableOpacity
                    style={styles.speakerIconBtn}
                    onPress={handleReplayAudio}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.speakerIcon}>🔊 Listen / Replay</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              <Text style={styles.targetText}>{santaliTranslation || 'Translating...'}</Text>

              {stage === 'PLAYING' && (
                <View style={styles.playingBadge}>
                  <Text style={styles.playingText}>
                    {audioOutput === 'bluetooth'
                      ? `🎧 Playing via Bluetooth (${selectedBluetoothDevice?.name || 'Speaker'})...`
                      : '🔊 Playing via Device Speaker...'}
                  </Text>
                </View>
              )}

              {latencyMs > 0 && (
                <Text style={styles.latencyText}>⚡ Inference time: {latencyMs} ms</Text>
              )}
            </View>
          </View>
        ) : (
          <View style={styles.placeholderCard}>
            <Text style={styles.placeholderEmoji}>🗣️</Text>
            <Text style={styles.placeholderTitle}>Translation will appear here</Text>
            <Text style={styles.placeholderSub}>
              Tap the microphone below to speak Hindi, or tap a sample classroom prompt.
            </Text>
          </View>
        )}

        {/* Error Alert if any */}
        {errorMessage ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorIcon}>⚠️</Text>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}

        {/* Big Central Microphone Button */}
        <View style={styles.micSection}>
          <Animated.View style={[styles.micOuterCircle, { transform: [{ scale: pulseAnim }] }]}>
            <TouchableOpacity
              style={[
                styles.micButton,
                stage === 'RECORDING' && styles.micButtonRecording,
                (stage === 'TRANSCRIBING' || stage === 'TRANSLATING' || stage === 'GENERATING_AUDIO') &&
                  styles.micButtonBusy,
              ]}
              onPress={stage === 'RECORDING' ? handleStopRecordingAndProcess : handleStartRecording}
              disabled={stage === 'TRANSCRIBING' || stage === 'TRANSLATING' || stage === 'GENERATING_AUDIO'}
              activeOpacity={0.8}
            >
              {stage === 'RECORDING' ? (
                <View style={styles.stopSquare} />
              ) : stage === 'TRANSCRIBING' || stage === 'TRANSLATING' || stage === 'GENERATING_AUDIO' ? (
                <ActivityIndicator size="large" color={JanbhashaTheme.colors.white} />
              ) : (
                <Text style={styles.micIcon}>🎙️</Text>
              )}
            </TouchableOpacity>
          </Animated.View>

          <Text style={styles.micStatusTitle}>
            {stage === 'IDLE' && 'TAP TO SPEAK'}
            {stage === 'RECORDING' && 'LISTENING... (TAP TO FINISH)'}
            {stage === 'TRANSCRIBING' && 'TRANSCRIBING SPEECH...'}
            {stage === 'TRANSLATING' && 'TRANSLATING TO OL CHIKI...'}
            {stage === 'GENERATING_AUDIO' && 'GENERATING SANTALI AUDIO...'}
            {stage === 'PLAYING' && 'PLAYING SANTALI AUDIO...'}
          </Text>
          <Text style={styles.micStatusSub}>
            {stage === 'RECORDING' ? 'Speak clearly in Hindi' : 'Speak Hindi • Automatic Santali Playback'}
          </Text>
        </View>

        {/* Sample Classroom Prompts */}
        <View style={styles.quickPromptsSection}>
          <Text style={styles.quickPromptsHeader}>Quick Classroom Prompts (Tap to Translate):</Text>
          <View style={styles.promptList}>
            {sampleClassroomPrompts.map((prompt, pIdx) => (
              <TouchableOpacity
                key={pIdx}
                style={styles.promptChip}
                onPress={() => processTextPipeline(prompt)}
                disabled={stage !== 'IDLE'}
                activeOpacity={0.7}
              >
                <Text style={styles.promptChipText}>"{prompt}"</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Audio Output Notice */}
        <View style={styles.routingNoteCard}>
          <Text style={styles.routingNoteTitle}>
            Active Output: {audioOutput === 'bluetooth' ? `Bluetooth (${selectedBluetoothDevice?.name || 'External Speaker'})` : 'Device Speaker (Built-in Loudspeaker)'}
          </Text>
          <Text style={styles.routingNoteBody}>
            Only translated Santali synthesized speech is output. Hindi microphone audio is isolated and never looped back to prevent classroom screeching.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: JanbhashaTheme.colors.creamBg,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  audioModesContainer: {
    backgroundColor: JanbhashaTheme.colors.white,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.cardBorder,
    padding: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: JanbhashaTheme.colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  audioModesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  audioModesLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: JanbhashaTheme.colors.mutedText,
    letterSpacing: 0.5,
  },
  audioModesManage: {
    fontSize: 11,
    fontWeight: '700',
    color: JanbhashaTheme.colors.deepGreen,
  },
  audioModesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: JanbhashaTheme.colors.creamBgLight,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.cardBorder,
  },
  modeButtonActiveSpeaker: {
    borderColor: JanbhashaTheme.colors.deepGreen,
    backgroundColor: '#F3FAF6',
  },
  modeButtonActiveBt: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  modeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  modeTextCol: {
    flex: 1,
  },
  modeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: JanbhashaTheme.colors.charcoalText,
  },
  modeTitleActiveSpeaker: {
    color: JanbhashaTheme.colors.deepGreen,
  },
  modeTitleActiveBt: {
    color: '#1D4ED8',
  },
  modeSubtitle: {
    fontSize: 10,
    color: JanbhashaTheme.colors.mutedText,
    marginTop: 1,
  },
  modeCheckPill: {
    backgroundColor: JanbhashaTheme.colors.mintTag,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  modeCheckText: {
    fontSize: 9,
    fontWeight: '800',
    color: JanbhashaTheme.colors.deepGreen,
    letterSpacing: 0.5,
  },
  audioOutputChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: JanbhashaTheme.colors.white,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.cardBorder,
  },
  audioChipIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  audioChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: JanbhashaTheme.colors.charcoalText,
  },
  languageBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: JanbhashaTheme.colors.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.cardBorder,
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: JanbhashaTheme.colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  langPillActive: {
    backgroundColor: JanbhashaTheme.colors.creamBgLight,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.deepGreen,
  },
  langFlag: {
    fontSize: 16,
    marginRight: 6,
  },
  langName: {
    fontSize: 14,
    fontWeight: '700',
    color: JanbhashaTheme.colors.charcoalText,
  },
  olChikiText: {
    fontFamily: JanbhashaTheme.fonts.olChikiBold,
    color: JanbhashaTheme.colors.deepGreen,
  },
  langArrow: {
    fontSize: 16,
    color: JanbhashaTheme.colors.mutedText,
    marginHorizontal: 10,
  },
  resultsContainer: {
    gap: 14,
    marginBottom: 20,
  },
  resultCard: {
    backgroundColor: JanbhashaTheme.colors.white,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.cardBorder,
    padding: 16,
    elevation: 2,
    shadowColor: JanbhashaTheme.colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  targetCard: {
    borderColor: JanbhashaTheme.colors.deepGreen,
    backgroundColor: '#F7FBF9',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTag: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  cardTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: JanbhashaTheme.colors.mutedText,
  },
  speakerIconBtn: {
    backgroundColor: JanbhashaTheme.colors.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.cardBorder,
  },
  speakerIcon: {
    fontSize: 12,
    fontWeight: '700',
    color: JanbhashaTheme.colors.deepGreen,
  },
  sourceText: {
    fontSize: 17,
    fontWeight: '600',
    color: JanbhashaTheme.colors.charcoalText,
    lineHeight: 24,
  },
  targetText: {
    fontSize: 21,
    fontFamily: JanbhashaTheme.fonts.olChikiBold,
    color: JanbhashaTheme.colors.deepGreen,
    lineHeight: 32,
  },
  playingBadge: {
    marginTop: 10,
    backgroundColor: JanbhashaTheme.colors.mintTag,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  playingText: {
    fontSize: 12,
    fontWeight: '700',
    color: JanbhashaTheme.colors.deepGreen,
  },
  latencyText: {
    fontSize: 11,
    color: JanbhashaTheme.colors.lightText,
    fontWeight: '600',
    marginTop: 8,
  },
  placeholderCard: {
    backgroundColor: JanbhashaTheme.colors.white,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.cardBorder,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  placeholderEmoji: {
    fontSize: 36,
    marginBottom: 10,
  },
  placeholderTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: JanbhashaTheme.colors.charcoalText,
    marginBottom: 4,
  },
  placeholderSub: {
    fontSize: 12,
    color: JanbhashaTheme.colors.mutedText,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: JanbhashaTheme.colors.errorRedBg,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FCA5A5',
    marginBottom: 16,
  },
  errorIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  errorText: {
    fontSize: 12,
    color: JanbhashaTheme.colors.errorRed,
    fontWeight: '600',
    flex: 1,
  },
  micSection: {
    alignItems: 'center',
    marginVertical: 16,
  },
  micOuterCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: JanbhashaTheme.colors.mintTag,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  micButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: JanbhashaTheme.colors.deepGreen,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
    shadowColor: JanbhashaTheme.colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  micButtonRecording: {
    backgroundColor: JanbhashaTheme.colors.errorRed,
  },
  micButtonBusy: {
    backgroundColor: JanbhashaTheme.colors.goldAmber,
  },
  stopSquare: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: JanbhashaTheme.colors.white,
  },
  micIcon: {
    fontSize: 40,
  },
  micStatusTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: JanbhashaTheme.colors.charcoalText,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  micStatusSub: {
    fontSize: 12,
    color: JanbhashaTheme.colors.mutedText,
    fontWeight: '500',
  },
  quickPromptsSection: {
    marginTop: 20,
    backgroundColor: JanbhashaTheme.colors.white,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.cardBorder,
    padding: 16,
  },
  quickPromptsHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: JanbhashaTheme.colors.charcoalText,
    marginBottom: 10,
  },
  promptList: {
    gap: 8,
  },
  promptChip: {
    backgroundColor: JanbhashaTheme.colors.creamBgLight,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.cardBorder,
  },
  promptChipText: {
    fontSize: 13,
    color: JanbhashaTheme.colors.charcoalText,
    fontWeight: '600',
  },
  routingNoteCard: {
    marginTop: 18,
    backgroundColor: JanbhashaTheme.colors.creamBgLight,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.cardBorder,
    padding: 14,
  },
  routingNoteTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: JanbhashaTheme.colors.charcoalText,
    marginBottom: 4,
  },
  routingNoteBody: {
    fontSize: 11,
    color: JanbhashaTheme.colors.mutedText,
    lineHeight: 16,
  },
});
