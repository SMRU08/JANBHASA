import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { AnimatedCard } from '../../components/AnimatedCard';
import { ConfettiEffect } from '../../components/ConfettiEffect';
import { TribalMotifBar } from '../../components/VisualIllustrations';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { useGamificationStore } from '../../store/gamificationStore';
import { generateNipunQuestions } from '../../services/offlineNlpEngine';

const QUIZ_CATEGORIES = [
  { name: 'Numbers', emoji: '🔢', color: '#059669', bg: '#ECFDF5' },
  { name: 'Colors', emoji: '🎨', color: '#EA580C', bg: '#FFF7ED' },
  { name: 'Animals', emoji: '🐘', color: '#7C3AED', bg: '#F5F3FF' },
  { name: 'Actions', emoji: '🏃', color: '#0284C7', bg: '#F0F9FF' },
  { name: 'Nature', emoji: '🌿', color: '#10B981', bg: '#ECFDF5' },
  { name: 'Family', emoji: '👨‍👩‍👧', color: '#D97706', bg: '#FFFBEB' },
  { name: 'Food', emoji: '🍽️', color: '#E11D48', bg: '#FFF1F2' },
  { name: 'School', emoji: '🏫', color: '#6366F1', bg: '#EEF2FF' },
];

export function QuizScreen() {
  const theme = useTheme();
  const c = theme.colors;
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
  const [showConfetti, setShowConfetti] = useState(false);

  const startQuiz = (cat: string) => {
    const qs = generateNipunQuestions(cat, 'hi', userLang, 5);
    setQuestions(qs.length > 0 ? qs : generateNipunQuestions(cat, 'hi', 'en', 5));
    setSelectedCat(cat);
    setCurrent(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setDone(false);
    setStreak(0);
    setShowConfetti(false);
  };

  const handleAnswer = (idx: number) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    const isCorrect = !!questions[current].answers[idx].is_correct;
    if (isCorrect) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      setScore((s) => s + 1);
      const xp = newStreak >= 3 ? 25 : 10;
      addXp(xp);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1400);
    } else {
      setStreak(0);
    }
  };

  const next = () => {
    setSelected(null);
    setAnswered(false);
    if (current + 1 >= questions.length) {
      setDone(true);
      setShowConfetti(true);
    } else {
      setCurrent((p) => p + 1);
    }
  };

  // Category select screen
  if (!selectedCat) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
        <Header
          title="NIPUN Bharat Quiz ❓"
          subtitle="FLN Aligned Multilingual Challenges"
          variant="gradient"
          gradientColors={['#D97706', '#F59E0B']}
        />
        <ScrollView contentContainerStyle={{ padding: 18 }}>
          <Text style={{ color: c.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 16 }}>
            Select a learning topic. Each quiz contains 5 questions mapped to foundational numeracy & literacy outcomes:
          </Text>

          <View style={styles.catGrid}>
            {QUIZ_CATEGORIES.map((cat) => (
              <AnimatedCard
                key={cat.name}
                onPress={() => startQuiz(cat.name)}
                style={[
                  styles.catCard,
                  {
                    backgroundColor: theme.isDark ? c.card : cat.bg,
                    borderColor: cat.color,
                  },
                ]}
              >
                <Text style={{ fontSize: 36 }}>{cat.emoji}</Text>
                <Text style={[styles.catName, { color: theme.isDark ? '#F8FAFC' : '#0F172A' }]}>
                  {cat.name}
                </Text>
                <View style={[styles.catBadge, { backgroundColor: cat.color }]}>
                  <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '900' }}>5 QUESTIONS</Text>
                </View>
              </AnimatedCard>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Quiz completed screen
  if (done) {
    const pct = Math.round((score / questions.length) * 100);
    const medal = pct === 100 ? '🏆' : pct >= 60 ? '🥈' : '📚';

    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
        <ConfettiEffect active={showConfetti} count={36} />
        <View style={styles.doneContainer}>
          <Text style={{ fontSize: 84 }}>{medal}</Text>
          <Text style={[styles.doneTitle, { color: c.text }]}>Quiz Complete!</Text>
          <Text style={{ color: c.textSecondary, fontSize: 16, marginTop: 6, fontWeight: '700' }}>
            Score: {score}/{questions.length} Correct ({pct}%)
          </Text>

          <LinearGradient
            colors={['#F59E0B', '#D97706']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.rewardPill}
          >
            <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 18 }}>
              +{score * 10} XP EARNED ⚡
            </Text>
          </LinearGradient>

          {streak > 1 && (
            <View style={styles.streakNotice}>
              <Text style={{ color: '#EA580C', fontWeight: '900', fontSize: 14 }}>
                🔥 Best Streak: {streak} in a row!
              </Text>
            </View>
          )}

          <View style={{ flexDirection: 'row', gap: 12, marginTop: 32, width: '100%' }}>
            <Button
              title="Try Again 🔄"
              onPress={() => startQuiz(selectedCat)}
              style={{ flex: 1 }}
              variant="outline"
            />
            <Button
              title="Topics 📚"
              onPress={() => setSelectedCat(null)}
              style={{ flex: 1 }}
              variant="primary"
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const q = questions[current];
  if (!q) return null;
  const progress = ((current + 1) / questions.length) * 100;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <ConfettiEffect active={showConfetti} count={18} />
      <Header
        title={`${selectedCat} Quiz`}
        subtitle={`Question ${current + 1} of ${questions.length}`}
        variant="gradient"
        gradientColors={['#D97706', '#F59E0B']}
      />

      {/* Progress Track */}
      <View style={[styles.progressTrack, { backgroundColor: c.border }]}>
        <LinearGradient
          colors={['#F59E0B', '#10B981']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.progressFill, { width: `${progress}%` as any }]}
        />
      </View>

      {/* Streak Chip */}
      {streak > 1 && (
        <View style={styles.streakBadge}>
          <Text style={{ color: '#D97706', fontWeight: '900', fontSize: 12 }}>
            🔥 STREAK: {streak} (+BONUS XP)
          </Text>
        </View>
      )}

      <ScrollView contentContainerStyle={{ padding: 18 }}>
        {/* Question Card */}
        <View style={[styles.qCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={styles.qEmoji}>{q.image_emoji}</Text>
          <Text style={[styles.qText, { color: c.text }]}>{q.text_hi}</Text>
          {q.text_en !== q.text_hi && (
            <Text style={{ color: c.textMuted, fontSize: 13, marginTop: 6, fontWeight: '600' }}>
              {q.text_en}
            </Text>
          )}
        </View>

        {/* Answers List */}
        <View style={styles.answersList}>
          {q.answers.map((ans: any, i: number) => {
            let bg: string = c.card as string;
            let borderColor: string = c.border as string;
            let textColor: string = c.text as string;

            if (answered) {
              if (ans.is_correct) {
                bg = '#D1FAE5';
                borderColor = '#10B981';
                textColor = '#065F46';
              } else if (i === selected && !ans.is_correct) {
                bg = '#FEE2E2';
                borderColor = '#EF4444';
                textColor = '#991B1B';
              }
            } else if (i === selected) {
              bg = '#FEF3C7';
              borderColor = '#D97706';
              textColor = '#D97706';
            }

            return (
              <AnimatedCard
                key={i}
                onPress={() => handleAnswer(i)}
                style={[styles.answerBtn, { backgroundColor: bg, borderColor }]}
              >
                <View style={[styles.answerLetter, { backgroundColor: borderColor }]}>
                  <Text style={{ color: '#FFFFFF', fontWeight: '900', fontSize: 12 }}>
                    {String.fromCharCode(65 + i)}
                  </Text>
                </View>
                <Text style={[styles.answerText, { color: textColor }]}>{ans.text}</Text>
                {answered && ans.is_correct && <Text style={{ fontSize: 20 }}>✅</Text>}
                {answered && !ans.is_correct && i === selected && <Text style={{ fontSize: 20 }}>❌</Text>}
              </AnimatedCard>
            );
          })}
        </View>

        {answered && (
          <Button
            title={current + 1 < questions.length ? 'Next Question →' : 'See Results 🏆'}
            onPress={next}
            fullWidth
            size="lg"
            variant="secondary"
            style={{ marginTop: 18 }}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  progressTrack: {
    height: 6,
    width: '100%',
  },
  progressFill: {
    height: 6,
  },
  streakBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  catGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  catCard: {
    width: '48%',
    borderRadius: 20,
    borderWidth: 1.5,
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  catName: {
    fontWeight: '900',
    fontSize: 14,
    marginTop: 8,
  },
  catBadge: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginTop: 6,
  },
  doneContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  doneTitle: {
    fontSize: 28,
    fontWeight: '900',
    marginTop: 14,
  },
  rewardPill: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 24,
    marginTop: 18,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  streakNotice: {
    backgroundColor: '#FFEDD5',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginTop: 12,
  },
  qCard: {
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 22,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  qEmoji: {
    fontSize: 48,
    marginBottom: 10,
  },
  qText: {
    fontSize: 19,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 26,
  },
  answersList: {
    gap: 10,
  },
  answerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 2,
    padding: 14,
  },
  answerLetter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  answerText: {
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
  },
});
