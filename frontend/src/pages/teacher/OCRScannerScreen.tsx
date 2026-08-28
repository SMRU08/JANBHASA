import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { extractText } from '../../services/ocrService';

export function OCRScannerScreen() {
  const theme = useTheme(); const c = theme.colors;
  const { user } = useAuthStore();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ extracted_text: string; translated_text?: string } | null>(null);
  const [sourceLang, setSourceLang] = useState('hi');
  const [translateTo, setTranslateTo] = useState<string | undefined>(user?.selected_language !== 'hi' ? user?.selected_language : 'en');

  const pickImage = async (fromCamera: boolean) => {
    const fn = fromCamera ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
    const res = await fn({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9, base64: false });
    if (!res.canceled && res.assets[0]) { setImageUri(res.assets[0].uri); setResult(null); }
  };

  const handleExtract = async () => {
    if (!imageUri) return;
    setLoading(true);
    const r = await extractText(imageUri, sourceLang, translateTo, user?.id);
    setLoading(false);
    if (r.success) { setResult({ extracted_text: r.extracted_text, translated_text: r.translated_text }); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="OCR Scanner" subtitle="फोटो से टेक्स्ट निकालें" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ color: c.textSecondary, fontSize: 13, marginBottom: 16 }}>Take a photo of a Hindi textbook, worksheet, or blackboard — the app will read the text for you.</Text>
        <View style={styles.btnRow}>
          <Button title="📷 Camera" onPress={() => pickImage(true)} style={{ flex: 1, marginRight: 8 }} variant="outline" />
          <Button title="🖼️ Gallery" onPress={() => pickImage(false)} style={{ flex: 1 }} variant="outline" />
        </View>

        {imageUri && (
          <View style={[styles.imageBox, { borderColor: c.border }]}>
            <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
          </View>
        )}

        {imageUri && <Button title="Extract Text 🔍" onPress={handleExtract} loading={loading} fullWidth size="lg" style={{ marginTop: 12 }} />}

        {result && (
          <>
            <View style={[styles.resultCard, { backgroundColor: c.card, borderColor: c.border }]}>
              <Text style={{ color: c.textMuted, fontSize: 11, fontWeight: '700', marginBottom: 8 }}>EXTRACTED TEXT:</Text>
              <Text style={{ color: c.text, fontSize: 16 }}>{result.extracted_text}</Text>
            </View>
            {result.translated_text && (
              <View style={[styles.resultCard, { backgroundColor: c.primaryLight, borderColor: c.primary }]}>
                <Text style={{ color: c.primary, fontSize: 11, fontWeight: '700', marginBottom: 8 }}>TRANSLATED ({translateTo?.toUpperCase()}):</Text>
                <Text style={{ color: c.primaryDark, fontSize: 16, fontWeight: '600' }}>{result.translated_text}</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  btnRow: { flexDirection: 'row', marginBottom: 16 },
  imageBox: { borderRadius: 14, borderWidth: 1.5, overflow: 'hidden', marginBottom: 4 },
  preview: { width: '100%', height: 220 },
  resultCard: { borderRadius: 14, borderWidth: 1.5, padding: 16, marginTop: 14 },
});
