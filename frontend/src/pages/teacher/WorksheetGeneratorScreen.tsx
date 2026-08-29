import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Print from 'expo-print';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { getWorksheetCategories, generateWorksheetHtml, getNipunOutcome } from '../../services/assetGenerator';

type LangCode = 'hi' | 'en' | 'or' | 'sat' | 'ho' | 'mun';
const LANGS: { code: LangCode; label: string; flag: string }[] = [
  { code: 'hi', label: 'Hindi', flag: '🇮🇳' },
  { code: 'en', label: 'English', flag: '🌐' },
  { code: 'or', label: 'Odia', flag: '🟠' },
  { code: 'sat', label: 'Santali', flag: '🟢' },
  { code: 'ho', label: 'Ho', flag: '🔵' },
  { code: 'mun', label: 'Mundari', flag: '🟣' },
];

export function WorksheetGeneratorScreen() {
  const theme = useTheme(); const c = theme.colors;
  const { user } = useAuthStore();
  const [selectedCat, setSelectedCat] = useState('');
  const [fromLang, setFromLang] = useState<LangCode>('hi');
  const [toLang, setToLang] = useState<LangCode>('sat');
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);

  const categories = getWorksheetCategories();

  const handleGenerate = async () => {
    if (!selectedCat) { Alert.alert('Select Category', 'Please choose a learning category first.'); return; }
    setLoading(true);
    try {
      const html = generateWorksheetHtml(selectedCat, fromLang, toLang, studentName || user?.name || 'Student');
      await Print.printAsync({ html });
      setGenerated(true);
    } catch (e) {
      Alert.alert('Error', 'Could not generate worksheet. Please try again.');
    }
    setLoading(false);
  };

  const nipunOutcome = selectedCat ? getNipunOutcome(selectedCat) : '';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="Worksheet Generator" subtitle="NIPUN Bharat — द्विभाषी कार्यपत्रक" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>

        {/* Step 1: Category */}
        <Text style={[styles.stepLabel, { color: c.text }]}>Step 1: Select Learning Category</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
          {categories.map(cat => (
            <TouchableOpacity
              key={cat.name}
              onPress={() => setSelectedCat(cat.name)}
              style={[styles.catChip, {
                backgroundColor: selectedCat === cat.name ? c.primary : c.card,
                borderColor: selectedCat === cat.name ? c.primary : c.border,
              }]}
            >
              <Text style={{ fontSize: 22 }}>{cat.emoji}</Text>
              <Text style={{ color: selectedCat === cat.name ? '#fff' : c.text, fontSize: 11, fontWeight: '700', marginTop: 2 }}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        {nipunOutcome ? (
          <View style={[styles.nipunBadge, { backgroundColor: '#D1FAE5', borderColor: '#059669' }]}>
            <Text style={{ color: '#065F46', fontSize: 12 }}>🎯 NIPUN: {nipunOutcome}</Text>
          </View>
        ) : null}

        {/* Step 2: Languages */}
        <Text style={[styles.stepLabel, { color: c.text, marginTop: 20 }]}>Step 2: Source Language</Text>
        <View style={styles.langRow}>
          {LANGS.map(l => (
            <TouchableOpacity
              key={l.code}
              onPress={() => setFromLang(l.code)}
              style={[styles.langChip, { backgroundColor: fromLang === l.code ? c.primary : c.card, borderColor: fromLang === l.code ? c.primary : c.border }]}
            >
              <Text style={{ fontSize: 16 }}>{l.flag}</Text>
              <Text style={{ color: fromLang === l.code ? '#fff' : c.text, fontSize: 10, marginTop: 2 }}>{l.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.stepLabel, { color: c.text, marginTop: 16 }]}>Step 3: Target Language (Student's Mother Tongue)</Text>
        <View style={styles.langRow}>
          {LANGS.map(l => (
            <TouchableOpacity
              key={l.code}
              onPress={() => setToLang(l.code)}
              style={[styles.langChip, { backgroundColor: toLang === l.code ? c.secondary || '#D97706' : c.card, borderColor: toLang === l.code ? c.secondary || '#D97706' : c.border }]}
            >
              <Text style={{ fontSize: 16 }}>{l.flag}</Text>
              <Text style={{ color: toLang === l.code ? '#fff' : c.text, fontSize: 10, marginTop: 2 }}>{l.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Step 4: Student Name */}
        <Text style={[styles.stepLabel, { color: c.text, marginTop: 20 }]}>Step 4: Student Name (Optional)</Text>
        <TextInput
          style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
          value={studentName}
          onChangeText={setStudentName}
          placeholder="Enter student name..."
          placeholderTextColor={c.textMuted}
        />

        {/* Generate Button */}
        <Button
          title={loading ? 'Generating...' : '📋 Generate & Print Worksheet'}
          onPress={handleGenerate}
          fullWidth
          disabled={loading || !selectedCat}
          style={{ marginTop: 24 }}
        />

        {loading && <ActivityIndicator size="large" color={c.primary} style={{ marginTop: 20 }} />}

        {generated && (
          <View style={[styles.successBox, { backgroundColor: '#D1FAE5', borderColor: '#059669' }]}>
            <Text style={{ color: '#065F46', fontWeight: '700', fontSize: 15 }}>✅ Worksheet Generated!</Text>
            <Text style={{ color: '#065F46', fontSize: 13, marginTop: 4 }}>
              Bilingual {selectedCat} worksheet for {fromLang.toUpperCase()} → {toLang.toUpperCase()} is ready.
            </Text>
          </View>
        )}

        {/* Info */}
        <View style={[styles.infoBox, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={{ color: c.textMuted, fontSize: 12 }}>
            📌 Worksheets are generated using the NIPUN Bharat FLN framework and can be printed directly from your phone or shared as PDF. No internet required.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  stepLabel: { fontSize: 13, fontWeight: '700', marginBottom: 10 },
  catChip: { borderRadius: 12, borderWidth: 1.5, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 12, marginRight: 8 },
  nipunBadge: { borderRadius: 10, borderWidth: 1, padding: 10, marginTop: 6 },
  langRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  langChip: { borderRadius: 12, borderWidth: 1.5, alignItems: 'center', paddingVertical: 8, paddingHorizontal: 12 },
  input: { borderRadius: 12, borderWidth: 1.5, padding: 12, fontSize: 15 },
  successBox: { borderRadius: 14, borderWidth: 1, padding: 16, marginTop: 16 },
  infoBox: { borderRadius: 12, borderWidth: 1, padding: 14, marginTop: 20, marginBottom: 8 },
});
