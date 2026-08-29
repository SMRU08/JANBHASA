import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { Header } from '../../components/Header';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { useGamificationStore } from '../../store/gamificationStore';
import { generateFlashcardsFromDictionary, getAllCategories } from '../../services/offlineNlpEngine';

type LangCode = 'hi' | 'en' | 'or' | 'sat' | 'ho' | 'mun';
const LANG_OPTIONS: { code: LangCode; label: string }[] = [
  { code: 'hi', label: 'हिंदी' }, { code: 'en', label: 'English' },
  { code: 'sat', label: 'ᱥᱟᱱᱛᱟᱞᱤ' }, { code: 'ho', label: 'Ho' },
  { code: 'mun', label: 'Mundari' }, { code: 'or', label: 'ଓଡ଼ିଆ' },
];

const TTS_LOCALE: Record<LangCode, string> = {
  hi: 'hi-IN', en: 'en-IN', or: 'or-IN', sat: 'hi-IN', ho: 'hi-IN', mun: 'hi-IN',
};

export function FlashcardsScreen() {
  const theme = useTheme(); const c = theme.colors;
  const { user } = useAuthStore();
  const { addXp } = useGamificationStore();

  const [selectedCat, setSelectedCat] = useState('Greetings');
  const [fromLang, setFromLang] = useState<LangCode>('hi');
  const [toLang, setToLang] = useState<LangCode>((user?.selected_language as LangCode) || 'en');
  const [flipped, setFlipped] = useState<Record<number, boolean>>({});
  const [known, setKnown] = useState<Set<number>>(new Set());
  const [session, setSession] = useState(0); // to reset state

  const categories = getAllCategories();
  const flashcards = generateFlashcardsFromDictionary(selectedCat, fromLang, toLang);

  const handleFlip = (id: number) => {
    setFlipped(p => ({ ...p, [id]: !p[id] }));
  };

  const handleKnown = (id: number) => {
    if (!known.has(id)) {
      setKnown(prev => new Set(prev).add(id));
      addXp(2);
    }
  };

  const speakCard = (text: string, lang: LangCode) => {
    Speech.speak(text, { language: TTS_LOCALE[lang], rate: 0.8 });
  };

  const resetSession = () => {
    setFlipped({}); setKnown(new Set()); setSession(s => s + 1);
  };

  const progress = flashcards.length > 0 ? (known.size / flashcards.length) * 100 : 0;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="Flashcards 🃏" subtitle="NIPUN Bharat — शब्द सीखें" />

      {/* Category Selector */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 54, paddingHorizontal: 12 }} contentContainerStyle={{ gap: 8, alignItems: 'center', paddingVertical: 8 }}>
        {categories.map(cat => (
          <TouchableOpacity key={cat} onPress={() => { setSelectedCat(cat); setFlipped({}); setKnown(new Set()); }}
            style={[styles.catChip, { backgroundColor: selectedCat === cat ? c.primary : c.card, borderColor: selectedCat === cat ? c.primary : c.border }]}>
            <Text style={{ color: selectedCat === cat ? '#fff' : c.text, fontSize: 12, fontWeight: '700' }}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Language pickers */}
      <View style={[styles.langBar, { backgroundColor: c.surface }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingHorizontal: 12 }}>
          {LANG_OPTIONS.map(l => (
            <TouchableOpacity key={`from-${l.code}`} onPress={() => setFromLang(l.code)}
              style={[styles.langChip, { backgroundColor: fromLang === l.code ? c.primary : c.card, borderColor: fromLang === l.code ? c.primary : c.border }]}>
              <Text style={{ color: fromLang === l.code ? '#fff' : c.textMuted, fontSize: 10 }}>▶ {l.label}</Text>
            </TouchableOpacity>
          ))}
          <Text style={{ color: c.textMuted, alignSelf: 'center' }}>→</Text>
          {LANG_OPTIONS.map(l => (
            <TouchableOpacity key={`to-${l.code}`} onPress={() => setToLang(l.code)}
              style={[styles.langChip, { backgroundColor: toLang === l.code ? c.secondary || '#D97706' : c.card, borderColor: toLang === l.code ? c.secondary || '#D97706' : c.border }]}>
              <Text style={{ color: toLang === l.code ? '#fff' : c.textMuted, fontSize: 10 }}>▶ {l.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Progress */}
      <View style={{ paddingHorizontal: 16, paddingVertical: 6 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ color: c.textMuted, fontSize: 11 }}>Known: {known.size}/{flashcards.length}</Text>
          <TouchableOpacity onPress={resetSession}>
            <Text style={{ color: c.primary, fontSize: 11, fontWeight: '600' }}>↺ Reset</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.progressTrack, { backgroundColor: c.border }]}>
          <View style={[styles.progressFill, { backgroundColor: c.primary, width: `${progress}%` as any }]} />
        </View>
      </View>

      {/* Cards */}
      <FlatList
        key={`${selectedCat}-${fromLang}-${toLang}-${session}`}
        data={flashcards}
        keyExtractor={item => String(item.id)}
        numColumns={2}
        contentContainerStyle={{ padding: 12, gap: 12 }}
        columnWrapperStyle={{ gap: 12 }}
        renderItem={({ item }) => {
          const isFlipped = !!flipped[item.id];
          const isKnown = known.has(item.id);
          return (
            <TouchableOpacity
              onPress={() => handleFlip(item.id)}
              style={[styles.card, {
                backgroundColor: isKnown ? (c.successLight || '#D1FAE5') : (isFlipped ? (c.primaryLight || '#D1FAE5') : c.card),
                borderColor: isKnown ? (c.success || '#10B981') : (isFlipped ? c.primary : c.border),
              }]}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 34 }}>{item.image_emoji}</Text>
              <Text style={{ color: isFlipped ? c.primary : c.text, fontSize: 16, fontWeight: '700', marginTop: 8, textAlign: 'center' }}>
                {isFlipped ? item.back_text : item.front_text}
              </Text>
              <Text style={{ color: c.textMuted, fontSize: 10, marginTop: 4 }}>
                {isFlipped ? toLang.toUpperCase() : fromLang.toUpperCase()}
              </Text>
              <View style={{ flexDirection: 'row', marginTop: 8, gap: 6 }}>
                <TouchableOpacity onPress={() => speakCard(isFlipped ? item.back_text : item.front_text, isFlipped ? toLang : fromLang)}
                  style={[styles.miniBtn, { backgroundColor: c.surface }]}>
                  <Text style={{ fontSize: 14 }}>🔊</Text>
                </TouchableOpacity>
                {isFlipped && !isKnown && (
                  <TouchableOpacity onPress={() => handleKnown(item.id)}
                    style={[styles.miniBtn, { backgroundColor: c.success || '#10B981' }]}>
                    <Text style={{ fontSize: 14 }}>✅</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', padding: 40 }}>
            <Text style={{ fontSize: 48 }}>📭</Text>
            <Text style={{ color: c.textMuted, marginTop: 12 }}>No flashcards for this category.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  catChip: { borderRadius: 20, borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 6 },
  langBar: { paddingVertical: 8 },
  langChip: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4 },
  progressTrack: { height: 6, borderRadius: 3 },
  progressFill: { height: 6, borderRadius: 3 },
  card: { flex: 1, borderRadius: 18, borderWidth: 2, alignItems: 'center', padding: 16, minHeight: 160, justifyContent: 'center' },
  miniBtn: { borderRadius: 10, padding: 6 },
});
