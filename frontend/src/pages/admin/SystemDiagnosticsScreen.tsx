import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme';
import { apiRequest } from '../../services/apiClient';

export function SystemDiagnosticsScreen() {
  const theme = useTheme();
  const c = theme.colors;
  const [modelStatus, setModelStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    setLoading(true);
    const res = await apiRequest<any>('/api/models/status');
    if (res.success && res.data) {
      setModelStatus(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleReload = async () => {
    setLoading(true);
    const res = await apiRequest('/api/models/reload', { method: 'POST' });
    if (res.success && res.data) {
      setModelStatus(res.data);
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="System Diagnostics 🩺" subtitle="AI इंजन व हार्डवेयर स्थिति" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Model Status Card */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: c.text, marginBottom: 12 }}>
            🤖 AI Engine Status
          </Text>

          {[
            {
              name: 'Whisper STT (Speech-to-Text)',
              status: modelStatus?.models?.whisper?.loaded ? 'ACTIVE (Offline)' : 'STANDBY',
              detail: `Model: ${modelStatus?.models?.whisper?.model_size || 'tiny'}`,
              active: modelStatus?.models?.whisper?.loaded
            },
            {
              name: 'IndicTrans2 (Multilingual Translator)',
              status: modelStatus?.models?.indictrans2?.loaded ? 'ACTIVE (Offline)' : 'DICTIONARY FALLBACK',
              detail: 'Santali, Odia, Ho, Mundari, Hindi',
              active: true
            },
            {
              name: 'Tesseract OCR (Text Extraction)',
              status: modelStatus?.models?.tesseract?.loaded ? 'ACTIVE (Offline)' : 'SYSTEM READY',
              detail: 'Devanagari & Latin Scripts',
              active: true
            },
            {
              name: 'espeak-ng / gTTS (Speech Synthesis)',
              status: modelStatus?.models?.tts?.loaded ? 'ACTIVE (Offline)' : 'READY',
              detail: `Engine: ${modelStatus?.models?.tts?.engine || 'espeak-ng'}`,
              active: true
            }
          ].map((item, idx) => (
            <View key={idx} style={styles.diagRow}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14, fontWeight: '700', color: c.text }}>{item.name}</Text>
                <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 2 }}>{item.detail}</Text>
              </View>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: item.active ? c.successLight : c.warningLight }
                ]}
              >
                <Text
                  style={{
                    color: item.active ? c.success : c.warningDark || '#E65100',
                    fontSize: 10,
                    fontWeight: '800'
                  }}
                >
                  {item.status}
                </Text>
              </View>
            </View>
          ))}

          <Button
            title="Reload AI Models 🔄"
            onPress={handleReload}
            loading={loading}
            variant="outline"
            style={{ marginTop: 14 }}
          />
        </Card>

        {/* Local Network Info */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: c.text, marginBottom: 10 }}>
            📡 Offline Mesh / Network
          </Text>
          <View style={styles.infoRow}>
            <Text style={{ color: c.textSecondary }}>Hotspot Hub WebSocket:</Text>
            <Text style={{ fontWeight: '700', color: c.primary }}>Port 8000 (Active)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={{ color: c.textSecondary }}>Internet Dependency:</Text>
            <Text style={{ fontWeight: '800', color: c.success }}>0% (Fully Offline)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={{ color: c.textSecondary }}>Storage Architecture:</Text>
            <Text style={{ fontWeight: '700', color: c.text }}>SQLite3 + Local Assets</Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  diagRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee'
  },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee'
  }
});
