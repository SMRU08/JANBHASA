import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { translate } from '../../services/translationService';
import { synthesize } from '../../services/ttsService';

const COMMON_CONCEPTS = [
  { term: 'प्रकाश संश्लेषण (Photosynthesis)', query: 'पौधे सूर्य के प्रकाश से अपना भोजन बनाते हैं। इस प्रक्रिया को प्रकाश संश्लेषण कहते हैं।' },
  { term: 'गुरुत्वाकर्षण (Gravity)', query: 'पृथ्वी सभी वस्तुओं को अपने केंद्र की ओर खींचती है, इसे गुरुत्वाकर्षण बल कहते हैं।' },
  { term: 'जल चक्र (Water Cycle)', query: 'समुद्र का पानी भाप बनकर बादल बनता है और फिर वर्षा के रूप में वापस धरती पर आता है।' },
  { term: 'जोड़ और घटाव (Maths)', query: 'चीजों को मिलाना जोड़ है (+), और चीजों को अलग करना या कम करना घटाव है (-)।' }
];

export function AIExplainScreen() {
  const theme = useTheme();
  const c = theme.colors;
  const { user } = useAuthStore();
  const [query, setQuery] = useState('');
  const [explanationHi, setExplanationHi] = useState('');
  const [explanationTranslated, setExplanationTranslated] = useState('');
  const [loading, setLoading] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  const targetLang = user?.selected_language || 'hi';

  const handleExplain = async (textToExplain?: string) => {
    const q = textToExplain || query;
    if (!q.trim()) return;

    setLoading(true);
    setExplanationHi(q);

    if (targetLang !== 'hi') {
      try {
        const trans = await translate(q, 'hi', targetLang);
        setExplanationTranslated(trans);
      } catch (e) {
        setExplanationTranslated(q);
      }
    } else {
      setExplanationTranslated('');
    }
    setLoading(false);
  };

  const handleSpeak = async (text: string, lang: string) => {
    const audioUrl = await synthesize(text, lang);
    if (audioUrl) {
      try {
        if (sound) {
          await sound.unloadAsync();
        }
        const { sound: s } = await Audio.Sound.createAsync({ uri: audioUrl });
        setSound(s);
        await s.playAsync();
      } catch (err) {
        console.warn('Playback error', err);
      }
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="AI Tutor 🤖" subtitle="सरल भाषा में समझें" showBack={false} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Input Box */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={{ fontSize: 14, fontWeight: '700', color: c.text, marginBottom: 8 }}>
            Ask anything or choose a concept:
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: c.background, borderColor: c.border, color: c.text }]}
            value={query}
            onChangeText={setQuery}
            placeholder="Type any sentence or word in Hindi..."
            placeholderTextColor={c.textMuted}
            multiline
          />
          <Button
            title="Explain in Mother Tongue 💡"
            onPress={() => handleExplain()}
            loading={loading}
            fullWidth
            style={{ marginTop: 10 }}
          />
        </Card>

        {/* Quick Concepts */}
        <Text style={[styles.sectionTitle, { color: c.text }]}>📚 Popular Topics</Text>
        <View style={styles.conceptList}>
          {COMMON_CONCEPTS.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => {
                setQuery(item.query);
                handleExplain(item.query);
              }}
              style={[styles.conceptChip, { backgroundColor: c.card, borderColor: c.border }]}
            >
              <Text style={{ color: c.primary, fontWeight: '700', fontSize: 13 }}>{item.term}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Output */}
        {explanationHi ? (
          <Card style={{ marginTop: 16, borderColor: c.primary }}>
            <View style={styles.outputHeader}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: c.textMuted }}>ORIGINAL (HINDI):</Text>
              <TouchableOpacity onPress={() => handleSpeak(explanationHi, 'hi')}>
                <Text style={{ fontSize: 18 }}>🔊</Text>
              </TouchableOpacity>
            </View>
            <Text style={{ fontSize: 16, color: c.text, lineHeight: 24, marginTop: 4 }}>
              {explanationHi}
            </Text>

            {explanationTranslated ? (
              <View style={{ marginTop: 16, borderTopWidth: 0.5, borderTopColor: '#eee', paddingTop: 12 }}>
                <View style={styles.outputHeader}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: c.primary }}>
                    YOUR LANGUAGE ({targetLang.toUpperCase()}):
                  </Text>
                  <TouchableOpacity onPress={() => handleSpeak(explanationTranslated, targetLang)}>
                    <Text style={{ fontSize: 18 }}>🔊</Text>
                  </TouchableOpacity>
                </View>
                <Text style={{ fontSize: 17, color: c.primaryDark, fontWeight: '600', lineHeight: 26, marginTop: 4 }}>
                  {explanationTranslated}
                </Text>
              </View>
            ) : null}
          </Card>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  input: {
    borderRadius: 12,
    borderWidth: 1.5,
    padding: 12,
    fontSize: 15,
    minHeight: 70,
    textAlignVertical: 'top'
  },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  conceptList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  conceptChip: {
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  outputHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }
});
