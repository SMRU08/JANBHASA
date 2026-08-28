import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme';
import { apiRequest } from '../../services/apiClient';

export function OMRScannerScreen() {
  const theme = useTheme(); const c = theme.colors;
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [answerKey, setAnswerKey] = useState<Record<string, string>>({});
  const [totalQ, setTotalQ] = useState(10);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const OPTIONS = ['A', 'B', 'C', 'D'];
  const pickImage = async (cam: boolean) => {
    const fn = cam ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
    const res = await fn({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
    if (!res.canceled) { setImageUri(res.assets[0].uri); setResult(null); }
  };

  const evaluate = async () => {
    if (!imageUri) return;
    setLoading(true);
    const form = new FormData();
    form.append('image', { uri: imageUri, type: 'image/jpeg', name: 'omr.jpg' } as any);
    form.append('answer_key', JSON.stringify(answerKey));
    form.append('total_questions', String(totalQ));
    const r = await apiRequest<any>('/api/omr/evaluate', { method: 'POST', body: form });
    setLoading(false);
    if (r.success) setResult(r.data);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="OMR Scanner" subtitle="उत्तर पुस्तिका स्वचालित जाँच" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ color: c.textSecondary, fontSize: 13, marginBottom: 16 }}>Scan a filled MCQ answer sheet. Set the correct answers below and tap Evaluate.</Text>
        <View style={styles.btnRow}>
          <Button title="📷 Camera" onPress={() => pickImage(true)} style={{ flex: 1, marginRight: 8 }} variant="outline" />
          <Button title="🖼️ Gallery" onPress={() => pickImage(false)} style={{ flex: 1 }} variant="outline" />
        </View>
        {imageUri && <Image source={{ uri: imageUri }} style={[styles.preview, { borderColor: c.border }]} resizeMode="contain" />}

        <Text style={[styles.sectionLabel, { color: c.text }]}>Set Answer Key (tap to select)</Text>
        {Array.from({ length: totalQ }, (_, i) => i + 1).map(q => (
          <View key={q} style={styles.questionRow}>
            <Text style={{ color: c.textSecondary, width: 24, fontWeight: '700' }}>Q{q}</Text>
            {OPTIONS.map(opt => (
              <Button key={opt} title={opt} onPress={() => setAnswerKey(k => ({ ...k, [q.toString()]: opt }))}
                variant={answerKey[q] === opt ? 'primary' : 'outline'} size="sm" style={{ marginLeft: 8, minWidth: 42 }} />
            ))}
          </View>
        ))}

        <Button title="Evaluate Sheet 🔍" onPress={evaluate} loading={loading} fullWidth size="lg" style={{ marginTop: 16 }} disabled={!imageUri} />

        {result && (
          <View style={[styles.resultBox, { backgroundColor: c.card, borderColor: result.percentage >= 60 ? c.success : c.error }]}>
            <Text style={{ fontSize: 48, textAlign: 'center' }}>{result.percentage >= 90 ? '🥇' : result.percentage >= 60 ? '✅' : '📚'}</Text>
            <Text style={[styles.grade, { color: result.percentage >= 60 ? c.success : c.error }]}>{result.grade}</Text>
            <Text style={{ fontSize: 22, fontWeight: '800', textAlign: 'center', color: c.text }}>{result.score}/{result.max_score}</Text>
            <Text style={{ textAlign: 'center', color: c.textSecondary }}>{result.percentage}% correct</Text>
            {result.wrong_questions.length > 0 && (
              <Text style={{ color: c.error, fontSize: 13, marginTop: 12, textAlign: 'center' }}>Wrong: Q{result.wrong_questions.join(', Q')}</Text>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  btnRow: { flexDirection: 'row', marginBottom: 12 },
  preview: { width: '100%', height: 180, borderRadius: 12, borderWidth: 1.5, marginBottom: 16 },
  sectionLabel: { fontSize: 15, fontWeight: '700', marginBottom: 12, marginTop: 8 },
  questionRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  resultBox: { borderRadius: 18, borderWidth: 2, padding: 24, marginTop: 20, alignItems: 'center' },
  grade: { fontSize: 36, fontWeight: '900', textAlign: 'center', marginTop: 8 },
});
