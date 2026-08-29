import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as Speech from 'expo-speech';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { extractText } from '../../services/ocrService';
import { translateOfflineFull } from '../../services/offlineNlpEngine';

type LangCode = 'hi' | 'en' | 'or' | 'sat' | 'ho' | 'mun';
const LANGS: { code: LangCode; label: string }[] = [
  { code: 'hi', label: 'Hindi' }, { code: 'en', label: 'English' },
  { code: 'or', label: 'Odia' }, { code: 'sat', label: 'Santali' },
  { code: 'ho', label: 'Ho' }, { code: 'mun', label: 'Mundari' },
];
const TTS_LOCALES: Record<LangCode, string> = {
  hi: 'hi-IN', en: 'en-IN', or: 'or-IN', sat: 'hi-IN', ho: 'hi-IN', mun: 'hi-IN',
};

export function OCRScannerScreen() {
  const theme = useTheme(); const c = theme.colors;
  const { user } = useAuthStore();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [extracted, setExtracted] = useState('');
  const [translated, setTranslated] = useState('');
  const [sourceLang, setSourceLang] = useState<LangCode>('hi');
  const [targetLang, setTargetLang] = useState<LangCode>(
    (user?.selected_language as LangCode) || 'en'
  );

  const pickImage = async (fromCamera: boolean) => {
    const fn = fromCamera ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
    const res = await fn({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.9 });
    if (!res.canceled && res.assets[0]) {
      setImageUri(res.assets[0].uri);
      setExtracted(''); setTranslated('');
    }
  };

  const handleExtract = async () => {
    if (!imageUri) return;
    setLoading(true);
    try {
      const r = await extractText(imageUri, sourceLang, targetLang, user?.id);
      if (r.success && r.extracted_text) {
        setExtracted(r.extracted_text);
        // Use online translation if available, else offline NLP
        const trans = r.translated_text || translateOfflineFull(r.extracted_text, sourceLang, targetLang);
        setTranslated(trans);
      } else {
        setExtracted('Could not extract text. Please ensure the image is clear and well-lit.');
        setTranslated('');
      }
    } catch {
      setExtracted('Extraction failed. Ensure camera permission is granted and image is readable.');
      setTranslated('');
    }
    setLoading(false);
  };

  const speakTranslation = async () => {
    const textToSpeak = translated || extracted;
    if (!textToSpeak) return;
    setSpeaking(true);
    try {
      await Speech.speak(textToSpeak, {
        language: TTS_LOCALES[translated ? targetLang : sourceLang],
        rate: 0.8,
        onDone: () => setSpeaking(false),
        onError: () => setSpeaking(false),
      });
    } catch { setSpeaking(false); }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="OCR Scanner" subtitle="फोटो से टेक्स्ट निकालें और अनुवाद करें" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ color: c.textSecondary, fontSize: 13, marginBottom: 16 }}>
          📷 Take a photo of a textbook, blackboard, or any printed text. The app will read and translate it — completely offline!
        </Text>

        {/* Language selectors */}
        <View style={[styles.langSection, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={{ color: c.textMuted, fontSize: 11, fontWeight: '700', marginBottom: 6 }}>TEXT LANGUAGE</Text>
          <View style={styles.langRow}>
            {LANGS.map(l => (
              <TouchableOpacity key={l.code} onPress={() => setSourceLang(l.code)}
                style={[styles.langChip, { backgroundColor: sourceLang === l.code ? c.primary : c.surface, borderColor: sourceLang === l.code ? c.primary : c.border }]}>
                <Text style={{ color: sourceLang === l.code ? '#fff' : c.text, fontSize: 11, fontWeight: '600' }}>{l.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={{ color: c.textMuted, fontSize: 11, fontWeight: '700', marginBottom: 6, marginTop: 12 }}>TRANSLATE TO</Text>
          <View style={styles.langRow}>
            {LANGS.map(l => (
              <TouchableOpacity key={l.code} onPress={() => setTargetLang(l.code)}
                style={[styles.langChip, { backgroundColor: targetLang === l.code ? c.secondary || '#D97706' : c.surface, borderColor: targetLang === l.code ? c.secondary || '#D97706' : c.border }]}>
                <Text style={{ color: targetLang === l.code ? '#fff' : c.text, fontSize: 11, fontWeight: '600' }}>{l.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Image picker */}
        <View style={styles.btnRow}>
          <Button title="📷 Camera" onPress={() => pickImage(true)} style={{ flex: 1, marginRight: 8 }} variant="outline" />
          <Button title="🖼️ Gallery" onPress={() => pickImage(false)} style={{ flex: 1 }} variant="outline" />
        </View>

        {imageUri && (
          <View style={[styles.imageBox, { borderColor: c.border }]}>
            <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
          </View>
        )}

        {imageUri && (
          <Button title={loading ? 'Extracting Text...' : 'Extract & Translate 🔍'} onPress={handleExtract} fullWidth size="lg" style={{ marginTop: 12 }} disabled={loading} />
        )}
        {loading && <ActivityIndicator size="large" color={c.primary} style={{ marginTop: 16 }} />}

        {extracted ? (
          <>
            <View style={[styles.resultCard, { backgroundColor: c.card, borderColor: c.border }]}>
              <Text style={{ color: c.textMuted, fontSize: 11, fontWeight: '700', marginBottom: 8 }}>EXTRACTED TEXT ({sourceLang.toUpperCase()}):</Text>
              <Text style={{ color: c.text, fontSize: 16, lineHeight: 24 }}>{extracted}</Text>
            </View>
            {translated && translated !== extracted && (
              <View style={[styles.resultCard, { backgroundColor: c.primaryLight || '#D1FAE5', borderColor: c.primary }]}>
                <Text style={{ color: c.primary, fontSize: 11, fontWeight: '700', marginBottom: 8 }}>TRANSLATION ({targetLang.toUpperCase()}):</Text>
                <Text style={{ color: c.primaryDark || '#065F46', fontSize: 16, fontWeight: '600', lineHeight: 24 }}>{translated}</Text>
              </View>
            )}
            <TouchableOpacity onPress={speakTranslation}
              style={[styles.speakBtn, { backgroundColor: speaking ? c.error : c.primary }]}>
              <Text style={{ color: '#fff', fontWeight: '800', fontSize: 16 }}>
                {speaking ? '⏹️ Stop Audio' : '🔊 Speak Translation'}
              </Text>
            </TouchableOpacity>
          </>
        ) : null}

        <View style={[styles.infoBox, { backgroundColor: c.card, borderColor: c.border, marginTop: 20 }]}>
          <Text style={{ color: c.textMuted, fontSize: 12, lineHeight: 18 }}>
            💡 Works best with clear, well-lit Hindi/English text. For tribal languages with special scripts, the offline dictionary will try to translate word-by-word.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  langSection: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 16 },
  langRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  langChip: { borderRadius: 10, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 6 },
  btnRow: { flexDirection: 'row', marginBottom: 16 },
  imageBox: { borderRadius: 14, borderWidth: 1.5, overflow: 'hidden', marginBottom: 4 },
  preview: { width: '100%', height: 220 },
  resultCard: { borderRadius: 14, borderWidth: 1.5, padding: 16, marginTop: 14 },
  speakBtn: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  infoBox: { borderRadius: 12, borderWidth: 1, padding: 14 },
});
