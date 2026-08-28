import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { Header } from '../../components/Header';
import { Flashcard } from '../../components/Flashcard';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme';
import { useGamificationStore } from '../../store/gamificationStore';
import { synthesize } from '../../services/ttsService';
import vocabCards from '../../data/flashcards/primary_vocab.json';

export function FlashcardsScreen() {
  const theme = useTheme(); const c = theme.colors;
  const { addXp } = useGamificationStore();
  const [cards] = useState(vocabCards);
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
    try {
      const url = await synthesize(text, lang);
      if (url) {
        const { sound } = await Audio.Sound.createAsync({ uri: url });
        await sound.playAsync();
      }
    } catch {}
  };

  if (done) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <Text style={{ fontSize: 64 }}>🎉</Text>
      <Text style={{ fontSize: 24, fontWeight: '800', color: c.text, marginTop: 12 }}>Session Complete!</Text>
      <Text style={{ color: c.textSecondary, marginTop: 8, fontSize: 15 }}>{correct}/{cards.length} correct • +{correct * 5} XP earned</Text>
      <Button title="Play Again" onPress={() => { setCurrent(0); setCorrect(0); setDone(false); }} fullWidth style={{ marginTop: 24 }} />
    </SafeAreaView>
  );

  const card = cards[current] || cards[0];
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
