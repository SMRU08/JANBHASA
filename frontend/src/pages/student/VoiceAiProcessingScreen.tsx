import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { LiveWaveform } from '../../components/LiveWaveform';

const { width } = Dimensions.get('window');

const STEPS = [
  { key: 'listening', icon: 'mic', label: 'Listening' },
  { key: 'processing', icon: 'hardware-chip', label: 'Processing' },
  { key: 'translating', icon: 'globe', label: 'Translating' },
  { key: 'speaking', icon: 'volume-high', label: 'Speaking' },
];

export function VoiceAiProcessingScreen() {
  const nav = useNavigation<any>();
  const [activeStep, setActiveStep] = useState('processing');
  const [isPlayingSource, setIsPlayingSource] = useState(false);
  const [isPlayingTarget, setIsPlayingTarget] = useState(false);

  useEffect(() => {
    // Step progression animation: Processing -> Translating -> Speaking
    const timer1 = setTimeout(() => setActiveStep('translating'), 1800);
    const timer2 = setTimeout(() => {
      setActiveStep('speaking');
      // Auto navigate to final Translation Result screen after speech completes
      setTimeout(() => {
        nav.navigate('TranslationResult' as any);
      }, 2500);
    }, 3600);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  const handlePlayAudio = (text: string, isTarget = false) => {
    Speech.stop();
    if (isTarget) {
      setIsPlayingTarget(true);
      setIsPlayingSource(false);
    } else {
      setIsPlayingSource(true);
      setIsPlayingTarget(false);
    }

    Speech.speak(text, {
      language: 'hi-IN',
      rate: 0.85,
      onDone: () => {
        setIsPlayingSource(false);
        setIsPlayingTarget(false);
      },
      onError: () => {
        setIsPlayingSource(false);
        setIsPlayingTarget(false);
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#030712', '#0B132B', '#030712']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Voice AI</Text>

        <View style={styles.liveBadge}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>LIVE</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Horizontal Progress Steps Bar */}
        <View style={styles.stepsRow}>
          {STEPS.map((step, idx) => {
            const isActive = activeStep === step.key;
            return (
              <View key={step.key} style={styles.stepItem}>
                <View
                  style={[
                    styles.stepIconBox,
                    {
                      backgroundColor: isActive ? '#3B82F6' : 'rgba(30, 41, 59, 0.8)',
                      borderColor: isActive ? '#60A5FA' : 'rgba(255, 255, 255, 0.1)',
                    },
                  ]}
                >
                  <Ionicons
                    name={step.icon as any}
                    size={16}
                    color={isActive ? '#FFFFFF' : '#94A3B8'}
                  />
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    { color: isActive ? '#60A5FA' : '#64748B', fontWeight: isActive ? '800' : '600' },
                  ]}
                >
                  {step.label}
                </Text>
                {idx < STEPS.length - 1 && <View style={styles.stepConnector} />}
              </View>
            );
          })}
        </View>

        {/* Central Glowing AI Sphere */}
        <View style={styles.centralStage}>
          <View style={styles.waveformBackground}>
            <LiveWaveform state="processing" height={130} width={width - 24} />
          </View>

          <View style={styles.aiOrbOuter}>
            <View style={styles.aiOrbMiddle}>
              <LinearGradient
                colors={['#1E1B4B', '#2563EB', '#06B6D4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.aiOrbInner}
              >
                <Text style={styles.aiOrbText}>AI</Text>
              </LinearGradient>
            </View>
          </View>

          <Text style={styles.processingTitle}>
            {activeStep === 'translating'
              ? 'Translating Context...'
              : activeStep === 'speaking'
              ? 'Speaking in Odia...'
              : 'Processing...'}
          </Text>
          <Text style={styles.processingHindi}>आपकी बात समझ रहा हूँ...</Text>
        </View>

        {/* Dual Input/Output Speech Cards */}
        <View style={styles.dualCardsRow}>
          {/* Your Speech (Hindi) */}
          <View style={styles.speechCard}>
            <Text style={styles.cardHeaderLabel}>Your Speech (Hindi)</Text>
            <Text style={styles.cardMainText}>आज हम जल संरक्षण के बारे में पढ़ेंगे।</Text>
            <TouchableOpacity
              onPress={() => handlePlayAudio('आज हम जल संरक्षण के बारे में पढ़ेंगे।', false)}
              style={styles.audioPlayRow}
            >
              <Ionicons
                name={isPlayingSource ? 'pause-circle' : 'play-circle'}
                size={22}
                color="#60A5FA"
              />
              <View style={styles.miniWave} />
            </TouchableOpacity>
          </View>

          {/* Direction Indicator */}
          <View style={styles.arrowCircle}>
            <Ionicons name="arrow-forward" size={16} color="#FFFFFF" />
          </View>

          {/* Translating to (Odia) */}
          <View style={styles.speechCard}>
            <Text style={styles.cardHeaderLabel}>Translating to (Odia)</Text>
            <Text style={[styles.cardMainText, { color: '#67E8F9' }]}>
              ଆଜି ଆମେ ଜଳ ସଂରକ୍ଷଣ ବିଷୟରେ ପଢ଼ିବୁ ।
            </Text>
            <TouchableOpacity
              onPress={() => handlePlayAudio('ଆଜି ଆମେ ଜଳ ସଂରକ୍ଷଣ ବିଷୟରେ ପଢ଼ିବୁ ।', true)}
              style={styles.audioPlayRow}
            >
              <Ionicons
                name={isPlayingTarget ? 'pause-circle' : 'play-circle'}
                size={22}
                color="#06B6D4"
              />
              <View style={[styles.miniWave, { backgroundColor: '#06B6D4' }]} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom Bar: Detected <-> Translate to */}
        <View style={styles.bottomBar}>
          <View style={styles.langPill}>
            <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
            <Text style={styles.langPillText}>Detected: Hindi</Text>
          </View>

          <TouchableOpacity
            onPress={() => nav.navigate('TranslationResult' as any)}
            style={styles.swapCircle}
          >
            <Ionicons name="swap-horizontal" size={18} color="#FFFFFF" />
          </TouchableOpacity>

          <View style={styles.langPill}>
            <Text style={styles.langPillText}>Translate to: Odia</Text>
            <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
          </View>
        </View>

        {/* View Full Translation Button */}
        <TouchableOpacity
          onPress={() => nav.navigate('TranslationResult' as any)}
          style={styles.viewResultBtn}
          activeOpacity={0.85}
        >
          <Text style={styles.viewResultBtnText}>View Detailed Translation & Breakdown ➔</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    borderWidth: 1,
    borderColor: '#10B981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  liveText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '900',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 36,
  },
  stepsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 14,
    paddingHorizontal: 8,
  },
  stepItem: {
    alignItems: 'center',
    position: 'relative',
    flex: 1,
  },
  stepIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    marginBottom: 4,
  },
  stepLabel: {
    fontSize: 10,
  },
  stepConnector: {
    position: 'absolute',
    top: 18,
    right: -15,
    width: 30,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  centralStage: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    position: 'relative',
  },
  waveformBackground: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiOrbOuter: {
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 2,
    borderColor: 'rgba(6, 182, 212, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
  },
  aiOrbMiddle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 2,
    borderColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#38BDF8',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 18,
  },
  aiOrbInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  aiOrbText: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '900',
  },
  processingTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 24,
  },
  processingHindi: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
  },
  dualCardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 18,
  },
  speechCard: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.75)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 14,
    minHeight: 120,
    justifyContent: 'space-between',
  },
  cardHeaderLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  cardMainText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  audioPlayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  miniWave: {
    flex: 1,
    height: 3,
    backgroundColor: '#60A5FA',
    borderRadius: 1.5,
  },
  arrowCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(30, 41, 59, 0.6)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 8,
    marginTop: 18,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  langPillText: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '700',
  },
  swapCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewResultBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 18,
    alignItems: 'center',
    marginTop: 14,
  },
  viewResultBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});
