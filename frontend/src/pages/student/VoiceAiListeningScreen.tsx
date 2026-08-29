import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { LiveWaveform } from '../../components/LiveWaveform';

const { width } = Dimensions.get('window');

export function VoiceAiListeningScreen() {
  const nav = useNavigation<any>();
  const [isListening, setIsListening] = useState(true);

  // Auto transition to processing after 3.5 seconds of simulated listening
  useEffect(() => {
    const timer = setTimeout(() => {
      nav.navigate('VoiceAiProcessing' as any);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Dark Futuristic Background */}
      <LinearGradient
        colors={['#030712', '#0B132B', '#030712']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Top Header Bar */}
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

      {/* Main Center Stage */}
      <View style={styles.centerStage}>
        {/* Real-time Spectrum Audio Waveform */}
        <View style={styles.waveformWrapper}>
          <LiveWaveform state={isListening ? 'listening' : 'idle'} height={150} width={width - 24} />
        </View>

        {/* Center Glowing Circular Microphone */}
        <View style={styles.micRingOuter}>
          <View style={styles.micRingMiddle}>
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => nav.navigate('VoiceAiProcessing' as any)}
              style={styles.micButton}
            >
              <LinearGradient
                colors={['#1E1B4B', '#312E81']}
                style={styles.micGradient}
              >
                <Ionicons name="mic" size={44} color="#FFFFFF" />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Listening Status Texts */}
        <View style={styles.statusTextContainer}>
          <Text style={styles.statusTitle}>Listening...</Text>
          <Text style={styles.statusHindi}>आप बोलें, मैं समझता हूँ...</Text>
          <Text style={styles.statusSub}>Speak naturally in your language.</Text>
        </View>
      </View>

      {/* Bottom Metrics Cards */}
      <View style={styles.bottomArea}>
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Detected Language</Text>
            <View style={styles.metricValueRow}>
              <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.metricValue}>Hindi</Text>
            </View>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Confidence</Text>
            <View style={styles.metricValueRow}>
              <Ionicons name="checkmark-circle" size={14} color="#10B981" />
              <Text style={styles.metricValue}>98%</Text>
            </View>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Mode</Text>
            <View style={styles.metricValueRow}>
              <View style={[styles.statusDot, { backgroundColor: '#10B981' }]} />
              <Text style={styles.metricValue}>Offline AI</Text>
            </View>
          </View>
        </View>

        {/* Red Stop Listening Action Button */}
        <TouchableOpacity
          onPress={() => nav.navigate('VoiceAiProcessing' as any)}
          style={styles.stopButton}
          activeOpacity={0.85}
        >
          <View style={styles.stopSquare} />
          <Text style={styles.stopButtonText}>Stop Listening</Text>
        </TouchableOpacity>
      </View>
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
    letterSpacing: 0.5,
  },
  centerStage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  waveformWrapper: {
    position: 'absolute',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micRingOuter: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 2,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.05)',
  },
  micRingMiddle: {
    width: 124,
    height: 124,
    borderRadius: 62,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
  },
  micButton: {
    width: 98,
    height: 98,
    borderRadius: 49,
    overflow: 'hidden',
  },
  micGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusTextContainer: {
    alignItems: 'center',
    marginTop: 40,
  },
  statusTitle: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    marginBottom: 4,
  },
  statusHindi: {
    color: '#E2E8F0',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  statusSub: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '500',
  },
  bottomArea: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  metricCard: {
    flex: 1,
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 12,
  },
  metricLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 4,
  },
  metricValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  stopButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EF4444',
    paddingVertical: 16,
    borderRadius: 20,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  stopSquare: {
    width: 14,
    height: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
});
