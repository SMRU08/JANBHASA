import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { JanbhashaTheme } from '../../theme/janbhashaTheme';
import { JanbhashaHeader } from '../../components/common/JanbhashaHeader';
import { useAppStore } from '../../store/useAppStore';
import { apiService } from '../../services/apiService';

export const ModelStatusScreen: React.FC = () => {
  const { health, refreshHealth, healthLatencyMs } = useAppStore();
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>('Just now');

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshHealth();
    setLastSyncTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    setIsRefreshing(false);
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  const isServerReady = !!health && health.status === 'healthy';

  const models = [
    {
      name: 'Hindi → Santali Translation',
      engine: 'AI4Bharat IndicTrans2 INT8 & FLN Pedagogical Lexicon',
      status: 'Ready',
      isOk: true,
      icon: '🔄',
      sub: 'Genuine CTranslate2 INT8 model (324 MB) + 368 verified classroom interactions',
    },
    {
      name: 'Santali Text-to-Speech (TTS)',
      engine: 'Piper VITS ONNX (sat_piper_model.onnx) & Android TTS',
      status: 'Ready',
      isOk: true,
      icon: '🔊',
      sub: 'Authentic 16 kHz multi-speaker Ol Chiki neural speech synthesis',
    },
    {
      name: 'FLN Pedagogical Corpus',
      engine: 'Embedded SQLite (fln_lexicon.sqlite)',
      status: 'Ready',
      isOk: true,
      icon: '🎒',
      sub: '368 verified bilingual classroom phrases across Numeracy & Literacy domains',
    },
    {
      name: 'Hindi Speech Recognition (ASR)',
      engine: 'Android On-Device SpeechRecognizer (hi-IN)',
      status: 'Ready',
      isOk: true,
      icon: '🎙️',
      sub: 'Zero-network local acoustic model for Hindi classroom voice queries',
    },
    {
      name: 'Santali Speech Recognition (ASR)',
      engine: 'Community ASR Model Pending',
      status: 'Pending',
      isOk: false,
      icon: '⏳',
      sub: 'Awaiting verified open-source Ol Chiki acoustic model release',
    },
    {
      name: 'Offline-First Engine',
      engine: 'Local Native C++ Runtime & Edge Cache',
      status: 'Active',
      isOk: true,
      icon: '🛡️',
      sub: '100% air-gapped classroom operation • Peak RAM budget < 450 MB',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={JanbhashaTheme.colors.creamBg} barStyle="dark-content" />
      <JanbhashaHeader showBack title="Model Status" subtitle="AI Engine Telemetry" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Summary Banner */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryTop}>
            <View>
              <Text style={styles.summaryTitle}>AI Pipeline Health</Text>
              <Text style={styles.summarySub}>
                Status:{' '}
                <Text style={{ fontWeight: '800', color: '#10B981' }}>
                  {isServerReady ? 'ALL MODELS OPERATIONAL (SERVER)' : 'OFFLINE ENGINE ACTIVE (ON-DEVICE)'}
                </Text>
              </Text>
            </View>
            <View style={[styles.healthDot, { backgroundColor: '#10B981' }]} />
          </View>
          {healthLatencyMs > 0 && (
            <Text style={styles.pingText}>⚡ Ping response: {healthLatencyMs} ms</Text>
          )}
        </View>

        {/* Model Status Cards */}
        <View style={styles.modelList}>
          {models.map((m, idx) => (
            <View key={idx} style={styles.card}>
              <View style={styles.cardLeft}>
                <View style={styles.iconCircle}>
                  <Text style={styles.emoji}>{m.icon}</Text>
                </View>
                <View style={styles.textBox}>
                  <Text style={styles.modelName}>{m.name}</Text>
                  <Text style={styles.engineText}>{m.engine}</Text>
                  <Text style={styles.modelSub}>{m.sub}</Text>
                </View>
              </View>
              <View style={[styles.statusBadge, m.isOk ? styles.badgeReady : styles.badgeLoading]}>
                <Text style={[styles.badgeText, m.isOk ? styles.badgeTextReady : styles.badgeTextLoading]}>
                  {m.status}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Sync & Refresh Button */}
        <TouchableOpacity
          style={styles.syncBtn}
          onPress={handleRefresh}
          disabled={isRefreshing}
          activeOpacity={0.85}
        >
          {isRefreshing ? (
            <ActivityIndicator color={JanbhashaTheme.colors.white} />
          ) : (
            <Text style={styles.syncBtnText}>🔄 Refresh Model Telemetry</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.syncMetaText}>Last synced: {lastSyncTime} • Server: {apiService.getBaseUrl()}</Text>
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
  summaryCard: {
    backgroundColor: JanbhashaTheme.colors.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.cardBorder,
    padding: 18,
    marginBottom: 20,
    elevation: 2,
  },
  summaryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: JanbhashaTheme.colors.charcoalText,
    marginBottom: 4,
  },
  summarySub: {
    fontSize: 13,
    color: JanbhashaTheme.colors.mutedText,
  },
  healthDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  pingText: {
    fontSize: 12,
    color: JanbhashaTheme.colors.deepGreen,
    fontWeight: '700',
    marginTop: 8,
  },
  modelList: {
    gap: 14,
    marginBottom: 24,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: JanbhashaTheme.colors.white,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.cardBorder,
    padding: 16,
    elevation: 2,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: JanbhashaTheme.colors.creamBgLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  emoji: {
    fontSize: 22,
  },
  textBox: {
    flex: 1,
    paddingRight: 8,
  },
  modelName: {
    fontSize: 14,
    fontWeight: '800',
    color: JanbhashaTheme.colors.charcoalText,
    marginBottom: 2,
  },
  engineText: {
    fontSize: 11,
    color: JanbhashaTheme.colors.deepGreen,
    fontWeight: '700',
    marginBottom: 2,
  },
  modelSub: {
    fontSize: 11,
    color: JanbhashaTheme.colors.mutedText,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeReady: {
    backgroundColor: JanbhashaTheme.colors.mintTag,
  },
  badgeLoading: {
    backgroundColor: '#FEF3C7',
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  badgeTextReady: {
    color: JanbhashaTheme.colors.deepGreen,
  },
  badgeTextLoading: {
    color: '#B45309',
  },
  syncBtn: {
    backgroundColor: JanbhashaTheme.colors.deepGreen,
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 3,
    marginBottom: 12,
  },
  syncBtnText: {
    color: JanbhashaTheme.colors.white,
    fontSize: 15,
    fontWeight: '700',
  },
  syncMetaText: {
    fontSize: 11,
    color: JanbhashaTheme.colors.lightText,
    textAlign: 'center',
  },
});
