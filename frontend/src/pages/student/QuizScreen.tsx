import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { useGamificationStore } from '../../store/gamificationStore';

const SAMPLE_QUESTIONS = [
  { id: 1, text_hi: '2 + 3 = ?', text_en: '2 + 3 = ?', subject: 'math', difficulty: 1, image_emoji: '🔢', answers: [{ text_hi: '4', is_correct: 0 }, { text_hi: '5', is_correct: 1 }, { text_hi: '6', is_correct: 0 }, { text_hi: '7', is_correct: 0 }] },
  { id: 2, text_hi: 'पानी का हिंदी में क्या अर्थ है?', text_en: 'What does "Paani" mean?', subject: 'hindi', difficulty: 1, image_emoji: '💧', answers: [{ text_hi: 'Fire', is_correct: 0 }, { text_hi: 'Water', is_correct: 1 }, { text_hi: 'Air', is_correct: 0 }, { text_hi: 'Earth', is_correct: 0 }] },
  { id: 3, text_hi: 'सूर्य किस दिशा में उगता है?', text_en: 'In which direction does the sun rise?', subject: 'evs', difficulty: 1, image_emoji: '🌅', answers: [{ text_hi: 'पश्चिम', is_correct: 0 }, { text_hi: 'उत्तर', is_correct: 0 }, { text_hi: 'पूर्व', is_correct: 1 }, { text_hi: 'दक्षिण', is_correct: 0 }] },
];

export function QuizScreen() {
  const theme = useTheme(); const c = theme.colors;
  const { user } = useAuthStore();
  const { addXp } = useGamificationStore();
  const [questions] = useState(SAMPLE_QUESTIONS);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = questions[current];

  const handleAnswer = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (q.answers[idx].is_correct) { setScore(s => s + 1); addXp(10); }
  };

  const next = () => {
    setSelected(null); setAnswered(false);
    if (current + 1 >= questions.length) setDone(true);
    else setCurrent(c => c + 1);
  };

  if (done) return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
      <Text style={{ fontSize: 64 }}>{score === questions.length ? '🏆' : score > questions.length / 2 ? '✅' : '📚'}</Text>
      <Text style={{ fontSize: 24, fontWeight: '800', color: c.text, marginTop: 12 }}>Quiz Complete!</Text>
      <Text style={{ color: c.textSecondary, fontSize: 16, marginTop: 8 }}>{score}/{questions.length} correct</Text>
      <Text style={{ color: c.xp, fontWeight: '700', fontSize: 18, marginTop: 4 }}>+{score * 10} XP earned!</Text>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="Quiz ❓" subtitle={`Question ${current + 1} of ${questions.length}`} />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={[styles.qCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={styles.qEmoji}>{q.image_emoji}</Text>
          <Text style={[styles.qText, { color: c.text }]}>{q.text_hi}</Text>
          {q.text_en !== q.text_hi && <Text style={{ color: c.textMuted, fontSize: 13, marginTop: 6 }}>{q.text_en}</Text>}
        </View>

        <View style={styles.answers}>
          {q.answers.map((ans, i) => {
            let bg: string = c.card;
            let borderColor: string = c.border;
            let textColor: string = c.text;
            if (answered) {
              if (ans.is_correct) { bg = c.successLight; borderColor = c.success; textColor = c.success; }
              else if (i === selected && !ans.is_correct) { bg = c.errorLight; borderColor = c.error; textColor = c.error; }
            } else if (i === selected) { bg = c.primaryLight; borderColor = c.primary; textColor = c.primary; }
            return (
              <TouchableOpacity key={i} onPress={() => handleAnswer(i)} style={[styles.answerBtn, { backgroundColor: bg, borderColor }]} activeOpacity={0.8}>
                <Text style={[styles.answerLetter, { backgroundColor: borderColor }]}>{String.fromCharCode(65 + i)}</Text>
                <Text style={[styles.answerText, { color: textColor }]}>{ans.text_hi}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {answered && <Button title={current + 1 < questions.length ? "Next Question →" : "See Results 🏆"} onPress={next} fullWidth size="lg" style={{ marginTop: 8 }} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  qCard: { borderRadius: 18, borderWidth: 1.5, padding: 24, alignItems: 'center', marginBottom: 24 },
  qEmoji: { fontSize: 52, marginBottom: 12 },
  qText: { fontSize: 20, fontWeight: '700', textAlign: 'center', lineHeight: 28 },
  answers: { gap: 12 },
  answerBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 2, padding: 16 },
  answerLetter: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginRight: 12, color: '#fff', fontWeight: '800', fontSize: 13, textAlign: 'center', lineHeight: 28 },
  answerText: { fontSize: 16, fontWeight: '600', flex: 1 },
});
