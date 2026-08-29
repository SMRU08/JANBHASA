import React, { useState, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { useGamificationStore } from '../../store/gamificationStore';
import { generateNipunQuestions, getAllCategories } from '../../services/offlineNlpEngine';

const QUIZ_CATEGORIES = ['Numbers', 'Colors', 'Animals', 'Actions', 'Nature', 'Family', 'Food', 'School'];

export function QuizScreen({ route }: any) {
  const theme = useTheme(); const c = theme.colors;
  const { user } = useAuthStore();
  const { addXp } = useGamificationStore();

  const userLang = (user?.selected_language as any) || 'en';

  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [streak, setStreak] = useState(0);

  const startQuiz = (cat: string) => {
    const qs = generateNipunQuestions(cat, 'hi', userLang, 5);
    if (qs.length === 0) {
      // Fallback to English
      const fallback = generateNipunQuestions(cat, 'hi', 'en', 5);
      setQuestions(fallback);
    } else {
      setQuestions(qs);
    }
    setSelectedCat(cat);
    setCurrent(0); setSelected(null); setAnswered(false); setScore(0); setDone(false); setStreak(0);
  };

  const handleAnswer = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    const isCorrect = !!questions[current].answers[idx].is_correct;
    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setScore(s => s + 1);
      const xp = newStreak >= 3 ? 20 : 10; // Bonus XP for streaks
      addXp(xp);
    } else {
      setStreak(0);
    }
  };

  const next = () => {
    setSelected(null); setAnswered(false);
    if (current + 1 >= questions.length) setDone(true);
    else setCurrent(p => p + 1);
  };

  // Category select screen
  if (!selectedCat) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background as string }}>
        <Header title="NIPUN Quiz ❓" subtitle="FLN Aligned — विषय चुनें" />
        <ScrollView contentContainerStyle={{ padding: 20 }}>
          <Text style={{ color: c.textMuted as string, fontSize: 13, marginBottom: 20 }}>
            Select a category to start your quiz. Questions are aligned to NIPUN Bharat FLN outcomes.
          </Text>
          <View style={styles.catGrid}>
            {QUIZ_CATEGORIES.map(cat => {
              const emoji = CAT_EMOJIS[cat] || '📚';
              return (
                <TouchableOpacity key={cat} onPress={() => startQuiz(cat)}
                  style={[styles.catCard, { backgroundColor: c.card, borderColor: c.border }]}>
                  <Text style={{ fontSize: 36 }}>{emoji}</Text>
                  <Text style={{ color: c.text, fontWeight: '700', fontSize: 13, marginTop: 8, textAlign: 'center' }}>{cat}</Text>
                  <Text style={{ color: c.textMuted, fontSize: 10, marginTop: 4 }}>5 Questions</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Quiz done screen
  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    const medal = pct === 100 ? '🏆' : pct >= 60 ? '🥈' : '📚';
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background, alignItems: 'center', justifyContent: 'center', padding: 32 }}>
        <Text style={{ fontSize: 80 }}>{medal}</Text>
        <Text style={{ fontSize: 26, fontWeight: '800', color: c.text, marginTop: 16 }}>Quiz Complete!</Text>
        <Text style={{ color: c.textSecondary, fontSize: 18, marginTop: 8 }}>{score}/{questions.length} correct • {pct}%</Text>
        <Text style={{ color: '#F59E0B', fontWeight: '800', fontSize: 20, marginTop: 6 }}>+{score * 10} XP earned! ⚡</Text>
        {streak > 1 && <Text style={{ color: '#EF4444', fontWeight: '700', fontSize: 16, marginTop: 4 }}>🔥 Best streak: {streak}</Text>}
        <View style={{ flexDirection: 'row', gap: 12, marginTop: 28 }}>
          <Button title="Try Again 🔄" onPress={() => startQuiz(selectedCat)} style={{ flex: 1 }} variant="outline" />
          <Button title="New Topic 📚" onPress={() => setSelectedCat(null)} style={{ flex: 1 }} />
        </View>
      </SafeAreaView>
    );
  }

  const q = questions[current];
  if (!q) return null;

  const progress = ((current + 1) / questions.length) * 100;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title={`${CAT_EMOJIS[selectedCat] || '❓'} ${selectedCat} Quiz`} subtitle={`Question ${current + 1} of ${questions.length}`} />

      {/* Progress bar */}
      <View style={[styles.progressTrack, { backgroundColor: c.border }]}>
        <View style={[styles.progressFill, { backgroundColor: c.primary, width: `${progress}%` as any }]} />
      </View>
      {/* Streak badge */}
      {streak > 1 && (
        <View style={[styles.streakBadge, { backgroundColor: '#FEF3C7' }]}>
          <Text style={{ color: '#D97706', fontWeight: '800', fontSize: 13 }}>🔥 Streak: {streak}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={[styles.qCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={styles.qEmoji}>{q.image_emoji}</Text>
          <Text style={[styles.qText, { color: c.text }]}>{q.text_hi}</Text>
          {q.text_en !== q.text_hi && <Text style={{ color: c.textMuted, fontSize: 13, marginTop: 6 }}>{q.text_en}</Text>}
        </View>

        <View style={styles.answers}>
          {q.answers.map((ans: any, i: number) => {
            let bg: string = c.card as string;
            let borderColor: string = c.border as string;
            let textColor: string = c.text as string;
            if (answered) {
              if (ans.is_correct) { bg = '#D1FAE5'; borderColor = '#10B981'; textColor = '#065F46'; }
              else if (i === selected && !ans.is_correct) { bg = '#FEE2E2'; borderColor = '#EF4444'; textColor = '#EF4444'; }
            } else if (i === selected) { bg = '#EFF6FF'; borderColor = c.primary as string; textColor = c.primary as string; }
            return (
              <TouchableOpacity key={i} onPress={() => handleAnswer(i)}
                style={[styles.answerBtn, { backgroundColor: bg, borderColor }]} activeOpacity={0.8}>
                <Text style={[styles.answerLetter, { backgroundColor: borderColor }]}>{String.fromCharCode(65 + i)}</Text>
                <Text style={[styles.answerText, { color: textColor }]}>{ans.text}</Text>
                {answered && ans.is_correct && <Text style={{ marginLeft: 8, fontSize: 18 }}>✅</Text>}
                {answered && !ans.is_correct && i === selected && <Text style={{ marginLeft: 8, fontSize: 18 }}>❌</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        {answered && (
          <Button
            title={current + 1 < questions.length ? 'Next Question →' : 'See Results 🏆'}
            onPress={next} fullWidth size="lg" style={{ marginTop: 16 }} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const CAT_EMOJIS: Record<string, string> = {
  Numbers: '🔢', Colors: '🎨', Animals: '🐘', Actions: '🏃',
  Nature: '🌿', Family: '👨‍👩‍👧', Food: '🍽️', School: '🏫',
  Math: '➕', Body: '🧍', Classroom: '📋', Language: '💬',
};

const styles = StyleSheet.create({
  progressTrack: { height: 5, width: '100%' },
  progressFill: { height: 5 },
  streakBadge: { paddingHorizontal: 16, paddingVertical: 6, alignSelf: 'center', borderRadius: 20, marginTop: 8 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  catCard: { width: '47%', borderRadius: 16, borderWidth: 1.5, alignItems: 'center', paddingVertical: 20, paddingHorizontal: 8 },
  qCard: { borderRadius: 18, borderWidth: 1.5, padding: 24, alignItems: 'center', marginBottom: 24 },
  qEmoji: { fontSize: 52, marginBottom: 12 },
  qText: { fontSize: 20, fontWeight: '700', textAlign: 'center', lineHeight: 28 },
  answers: { gap: 12 },
  answerBtn: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 2, padding: 16 },
  answerLetter: { width: 28, height: 28, borderRadius: 14, marginRight: 12, color: '#fff', fontWeight: '800', fontSize: 13, textAlign: 'center', lineHeight: 28 },
  answerText: { fontSize: 16, fontWeight: '600', flex: 1 },
});
