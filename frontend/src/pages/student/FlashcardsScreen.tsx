import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { Header } from '../../components/Header';
import { Flashcard } from '../../components/Flashcard';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { useGamificationStore } from '../../store/gamificationStore';
import { apiRequest } from '../../services/apiClient';
import { synthesize } from '../../services/ttsService';

const SAMPLE_FLASHCARDS = [
  { id: 1, front_text: 'एक', back_text: 'One', front_lang: 'hi', back_lang: 'en', image_emoji: '1️⃣' },
  { id: 2, front_text: 'दो', back_text: 'Two', front_lang: 'hi', back_lang: 'en', image_emoji: '2️⃣' },
  { id: 3, front_text: 'तीन', back_text: 'Three', front_lang: 'hi', back_lang: 'en', image_emoji: '3️⃣' },
  { id: 4, front_text: 'पानी', back_text: 'Water', front_lang: 'hi', back_lang: 'en', image_emoji: '💧' },
  { id: 5, front_text: 'आग', back_text: 'Fire', front_lang: 'hi', back_lang: 'en', image_emoji: '🔥' },
];

export function FlashcardsScreen() {
  const theme = useTheme(); const c = theme.colors;
  const { user } = useAuthStore();
  const { addXp } = useGamificationStore();
  const [cards, setCards] = useState(SAMPLE_FLASHCARDS);
  const [current, setCurrent] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [done, setDone] = useState(false);

  const handleCorrect = () => {
    setCorrect(c => c + 1);
    addXp(5);
    nextCard();
  };

  const handleIncorrect = () => { nextCard(); };

  const nextCard = () => {
    if (current + 1 >= cards.length) { setDone(true); }
    else { setCurrent(c => c + 1); }
  };

  const handleListen = async (text: string, lang: string) => {
    const url = await synthesize(text, lang);
    if (url) {
      const { sound } = await Audio.Sound.createAsync({ uri: url });
      await sound.playAsync();
    }
  };

  if (done) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <Text style={{ fontSize: 64 }}>🎉</Text>
      <Text style={{ fontSize: 24, fontWeight: '800', color: c.text, marginTop: 12 }}>Session Complete!</Text>
      <Text style={{ color: c.textSecondary, marginTop: 8, fontSize: 15 }}>{correct}/{cards.length} correct • +{correct * 5} XP earned</Text>
      <Button title="Play Again" onPress={() => { setCurrent(0); setCorrect(0); setDone(false); }} fullWidth style={{ marginTop: 24 }} />
    </SafeAreaView>
  );

  const card = cards[current];
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="Flashcards 🃏" subtitle={`${current + 1} / ${cards.length}`} />
      <View style={{ flex: 1, padding: 20 }}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${((current) / cards.length) * 100}%`, backgroundColor: c.primary }]} />
        </View>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Flashcard front_text={card.front_text} back_text={card.back_text} front_lang={card.front_lang} back_lang={card.back_lang} image_emoji={card.image_emoji}
            onCorrect={handleCorrect} onIncorrect={handleIncorrect} onListen={handleListen} />
        </View>
        <Text style={{ color: c.textMuted, textAlign: 'center', fontSize: 12 }}>✅ {correct} correct so far</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  progressBar: { height: 6, backgroundColor: '#eee', borderRadius: 3, marginBottom: 20, overflow: 'hidden' },
  progressFill: { height: 6, borderRadius: 3 },
});
