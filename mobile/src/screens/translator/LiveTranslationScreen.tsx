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
  NativeEventEmitter,
  NativeModules,
  TextInput,
} from 'react-native';
import { JanbhashaTheme } from '../../theme/janbhashaTheme';
import { JanbhashaHeader } from '../../components/common/JanbhashaHeader';
import { useAppStore } from '../../store/useAppStore';
import { apiService } from '../../services/apiService';
import { audioService } from '../../services/audioService';

const { JanbhashaModule } = NativeModules;
const janbhashaEmitter = JanbhashaModule ? new NativeEventEmitter(JanbhashaModule) : null;

type PipelineStage =
  | 'IDLE'
  | 'RECORDING'
  | 'TRANSCRIBING'
  | 'TRANSLATING'
  | 'GENERATING_AUDIO'
  | 'PLAYING';

export const LiveTranslationScreen: React.FC = () => {
  const { audioOutput, setAudioOutput, selectedBluetoothDevice, navigate, setLastTranslation } = useAppStore();

  const [stage, setStage] = useState<PipelineStage>('IDLE');
  const [hindiTranscript, setHindiTranscript] = useState<string>('');
  const [customTextInput, setCustomTextInput] = useState<string>('');
  const [santaliTranslation, setSantaliTranslation] = useState<string>('');
  const [romanPronunciation, setRomanPronunciation] = useState<string>('');
  const [latencyMs, setLatencyMs] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);

  // Pulse animation for recording
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const isCancelledRef = useRef<boolean>(false);
  const lastTapTimeRef = useRef<number>(0);
  const recordingStartTimeRef = useRef<number>(0);
  const isProcessingRef = useRef<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (stage === 'RECORDING') {
      setRecordingSeconds(0);
      interval = setInterval(() => {
        setRecordingSeconds((sec) => sec + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [stage]);

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

  // Subscribe to live partial results from SpeechRecognizer
  useEffect(() => {
    if (!janbhashaEmitter) return;
    const partialSub = janbhashaEmitter.addListener('onSpeechPartialResults', (event) => {
      if (event?.partialText) {
        setHindiTranscript(event.partialText);
        setCustomTextInput(event.partialText);
      }
    });
    return () => {
      partialSub.remove();
    };
  }, []);

  const handleToggleMicrophone = async () => {
    const now = Date.now();
    if (now - lastTapTimeRef.current < 500) {
      return; // Debounce fast accidental double taps
    }
    lastTapTimeRef.current = now;

    if (stage === 'RECORDING') {
      await handleStopRecordingAndProcess();
    } else if (stage === 'IDLE') {
      await handleStartLiveRecording();
    }
  };

  const handleStartLiveRecording = async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      setErrorMessage('');
      const hasPerm = await audioService.requestMicrophonePermission();
      if (!hasPerm) {
        setErrorMessage('माइक्रोफोन अनुमति आवश्यक है (Microphone permission required)');
        Alert.alert(
          'Microphone Permission',
          'JANBHASHA needs access to your microphone to transcribe and translate classroom speech. Please allow microphone permission.'
        );
        isProcessingRef.current = false;
        return;
      }

      setHindiTranscript('');
      setSantaliTranslation('');
      setRomanPronunciation('');
      recordingStartTimeRef.current = Date.now();

      // Step 1: Start native 16,000 Hz Mono 16-bit PCM AudioRecord in Scoped Storage
      await audioService.startRecording();
      setStage('RECORDING');
    } catch (err: any) {
      console.error('Start recording error:', err);
      setErrorMessage(err.message || 'Failed to start recording');
      setStage('IDLE');
    } finally {
      isProcessingRef.current = false;
    }
  };

  const handleStopRecordingAndProcess = async () => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;

    try {
      const recordingDuration = Date.now() - recordingStartTimeRef.current;
      if (recordingDuration < 500) {
        try {
          await audioService.stopRecording();
        } catch {}
        setErrorMessage('रिकॉर्डिंग बहुत छोटी थी। कृपया बोलते समय माइक चालू रखें। (Recording too short. Please speak into the mic while recording.)');
        setStage('IDLE');
        return;
      }

      setStage('TRANSCRIBING');

      // Step 1 Finish: Finalize 44-byte RIFF 16kHz mono WAV file in Scoped Storage
      let wavPath = '';
      try {
        wavPath = await audioService.stopRecording();
      } catch (stopErr: any) {
        console.warn('stopRecording notice:', stopErr);
      }

      // Step 2: ASR (Whisper Offline / Native / API Bridge)
      let transcript = '';
      if (wavPath) {
        try {
          const asrRes = await apiService.transcribeAudio(wavPath, 'hi');
          transcript = (asrRes?.transcription || '').trim();
        } catch (asrErr) {
          console.warn('Whisper ASR notice:', asrErr);
        }
      }

      // STRICT VALIDATION: If no speech was detected, HALT the pipeline immediately.
      // NEVER substitute dummy fallback strings.
      if (!transcript || !transcript.trim()) {
        setErrorMessage('कोई आवाज़ दर्ज नहीं हुई। कृपया माइक दबाकर साफ़ आवाज़ में बोलें। (No speech detected. Please speak clearly into the microphone.)');
        setStage('IDLE');
        return;
      }

      setHindiTranscript(transcript);
      setCustomTextInput(transcript);

      // Steps 3, 4, 5: Translation -> VITS TTS -> Playback
      await processTextPipeline(transcript, recordingStartTimeRef.current);
    } catch (err: any) {
      console.error('Pipeline processing error:', err);
      setErrorMessage(err.message || 'Pipeline processing failed');
      setStage('IDLE');
    } finally {
      isProcessingRef.current = false;
    }
  };

  const processTextPipeline = async (text: string, startTime: number = Date.now()) => {
    try {
      setErrorMessage('');
      setHindiTranscript(text);

      // Step 3: Translation (Hindi -> Santali Ol Chiki)
      setStage('TRANSLATING');
      let translated = '';
      let roman = '';
      try {
        const { translationProvider } = require('../../core/providers/TranslationProvider');
        const offlineRes = await translationProvider.translate(text, 'hin_Deva', 'sat_Olck');
        translated = offlineRes.translatedText;
        roman = offlineRes.romanText || '';
      } catch (offlineErr) {
        console.warn('Offline translation error, checking server fallback:', offlineErr);
        try {
          const transRes = await apiService.translateText(text, 'hin_Deva', 'sat_Olck');
          translated = transRes.translated_text || '';
        } catch {}
      }

      if (!translated) {
        setErrorMessage('अनुवाद उपलब्ध नहीं है (Translation not found for this input)');
        setStage('IDLE');
        return;
      }

      setSantaliTranslation(translated);
      setRomanPronunciation(roman);

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

      // Step 4: TTS (Santali Text -> VITS Audio / Acoustic Model Synthesis)
      setStage('GENERATING_AUDIO');
      const calculatedLatency = Date.now() - startTime;
      setLatencyMs(calculatedLatency);
      setLastTranslation({
        sourceText: text,
        targetText: translated,
        sourceLang: 'hin_Deva',
        targetLang: 'sat_Olck',
        durationSec: Math.round(calculatedLatency / 1000),
        engineUsed: 'FLN Lexicon + VITS Neural Acoustic TTS (Offline)',
      });

      let audioResultUri = '';
      try {
        const ttsRes = await apiService.synthesizeSpeech(translated, 0, 'sat_Olck');
        if (ttsRes && ttsRes.audio_base64) {
          audioResultUri = ttsRes.audio_base64;
        }
      } catch (vitsErr) {
        console.warn('VITS TTS synthesis notice:', vitsErr);
      }

      // Step 5: Playback (Play VITS audio or native transliterated speech)
      if (!isCancelledRef.current) {
        setStage('PLAYING');
        try {
          await audioService.stopAudio();
          if (audioResultUri) {
            await audioService.playAudio(audioResultUri, translated, 'sat_Olck');
          } else {
            await audioService.speakText(translated, 'sat_Olck');
          }
        } catch (playErr) {
          console.warn('Audio playback notice:', playErr);
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
      await audioService.stopAudio();
      await audioService.speakText(santaliTranslation, 'sat_Olck');
    } catch (e) {
      console.warn('Replay audio notice:', e);
    }
    setStage('IDLE');
  };

  const sampleClassroomPrompts = [
    { text: 'नमस्ते', label: '1. Greeting (जोहार)' },
    { text: 'अपनी किताब खोलो', label: '2. Classroom Command' },
    { text: 'एक से पाँच तक गिनो', label: '3. Numeracy Activity' },
    { text: 'तुम्हारा नाम क्या है?', label: '4. Inquiry / Question' },
    { text: 'यह महुआ का पेड़ है', label: '5. Nature & Environment' },
    { text: 'चलो हम सब मिलकर दस तक गिनती करें', label: '6. Group Count' },
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
              {romanPronunciation ? (
                <Text style={styles.romanPronunciationText}>🗣️ {romanPronunciation}</Text>
              ) : null}

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

        {/* Manual Hindi Text Input & Translate Trigger */}
        <View style={styles.textInputCard}>
          <View style={styles.textInputHeader}>
            <Text style={styles.textInputLabel}>TYPE OR EDIT HINDI (वैकल्पिक रूप से लिखें):</Text>
            {customTextInput.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setCustomTextInput('');
                  setHindiTranscript('');
                  setSantaliTranslation('');
                  setRomanPronunciation('');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.clearBtnText}>✕ साफ़ करें</Text>
              </TouchableOpacity>
            )}
          </View>
          <TextInput
            style={styles.textInputField}
            value={customTextInput}
            onChangeText={setCustomTextInput}
            placeholder="यहाँ हिन्दी में लिखें या माइक से बोलें (e.g. नमस्ते, अपनी किताब खोलो)..."
            placeholderTextColor={JanbhashaTheme.colors.mutedText}
            multiline
            editable={stage === 'IDLE'}
          />
          <TouchableOpacity
            style={[
              styles.translateSpeakBtn,
              (!customTextInput.trim() || stage !== 'IDLE') && styles.translateSpeakBtnDisabled,
            ]}
            onPress={() => processTextPipeline(customTextInput.trim())}
            disabled={!customTextInput.trim() || stage !== 'IDLE'}
            activeOpacity={0.8}
          >
            <Text style={styles.translateSpeakBtnIcon}>🔊</Text>
            <Text style={styles.translateSpeakBtnText}>Translate & Speak (अनुवाद और बोलें)</Text>
          </TouchableOpacity>
        </View>

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
              onPress={handleToggleMicrophone}
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
            {stage === 'IDLE' && 'TAP TO SPEAK (माइक दबाकर बोलें)'}
            {stage === 'RECORDING' && `RECORDING ${Math.floor(recordingSeconds / 60)}:${(recordingSeconds % 60).toString().padStart(2, '0')} (TAP TO STOP & TRANSLATE)`}
            {stage === 'TRANSCRIBING' && 'WHISPER ASR TRANSCRIBING...'}
            {stage === 'TRANSLATING' && 'TRANSLATING TO OL CHIKI...'}
            {stage === 'GENERATING_AUDIO' && 'VITS TTS SYNTHESIZING AUDIO...'}
            {stage === 'PLAYING' && 'PLAYING SANTALI AUDIO (बोल रहा है)...'}
          </Text>
          <Text style={styles.micStatusSub}>
            {stage === 'RECORDING' ? 'Speak clearly in Hindi • Tap button when done' : 'Speak Hindi • Automatic Santali Playback'}
          </Text>
        </View>

        {/* Sample Classroom Prompts */}
        <View style={styles.quickPromptsSection}>
          <Text style={styles.quickPromptsHeader}>Quick Classroom Prompts (1-Tap Test):</Text>
          <View style={styles.promptList}>
            {sampleClassroomPrompts.map((prompt, pIdx) => (
              <TouchableOpacity
                key={pIdx}
                style={styles.promptChip}
                onPress={() => {
                  setCustomTextInput(prompt.text);
                  processTextPipeline(prompt.text);
                }}
                disabled={stage !== 'IDLE'}
                activeOpacity={0.7}
              >
                <View style={styles.promptChipHeaderRow}>
                  <Text style={styles.promptChipBadge}>{prompt.label}</Text>
                  <Text style={styles.promptChipAction}>Translate ➔</Text>
                </View>
                <Text style={styles.promptChipText}>"{prompt.text}"</Text>
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
  romanPronunciationText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: JanbhashaTheme.colors.deepGreen,
    marginTop: 6,
    lineHeight: 20,
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
  textInputCard: {
    backgroundColor: JanbhashaTheme.colors.white,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.cardBorder,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: JanbhashaTheme.colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  textInputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  textInputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: JanbhashaTheme.colors.mutedText,
    letterSpacing: 0.5,
  },
  clearBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: JanbhashaTheme.colors.errorRed,
  },
  textInputField: {
    backgroundColor: JanbhashaTheme.colors.creamBgLight,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.cardBorder,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    color: JanbhashaTheme.colors.charcoalText,
    minHeight: 48,
    maxHeight: 90,
    textAlignVertical: 'top',
    marginBottom: 10,
  },
  translateSpeakBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: JanbhashaTheme.colors.deepGreen,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 3,
  },
  translateSpeakBtnDisabled: {
    backgroundColor: '#CBD5E1',
    elevation: 0,
  },
  translateSpeakBtnIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  translateSpeakBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: JanbhashaTheme.colors.white,
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
  promptChipHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  promptChipBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: JanbhashaTheme.colors.deepGreen,
  },
  promptChipAction: {
    fontSize: 11,
    fontWeight: '600',
    color: JanbhashaTheme.colors.mutedText,
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
