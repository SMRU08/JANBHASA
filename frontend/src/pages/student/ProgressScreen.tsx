import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../../components/Header';
import { AnimatedCard } from '../../components/AnimatedCard';
import { NipunBharatEmblem, TribalMotifBar } from '../../components/VisualIllustrations';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { useGamificationStore } from '../../store/gamificationStore';

const WEEKDAYS = [
  { day: 'Mon', xp: 40, active: true },
  { day: 'Tue', xp: 75, active: true },
  { day: 'Wed', xp: 60, active: true },
  { day: 'Thu', xp: 90, active: true },
  { day: 'Fri', xp: 50, active: true },
  { day: 'Sat', xp: 110, active: true },
  { day: 'Sun', xp: 30, active: false },
];

export function ProgressScreen() {
  const theme = useTheme();
  const c = theme.colors;
  const nav = useNavigation<any>();
  const { user } = useAuthStore();
  const { totalXp, level, currentStreak, longestStreak, lessonsCompleted, quizzesPassed } = useGamificationStore();

  const [subjectProgress] = useState([
    { name: 'गणित (Math & Numeracy)', progress: 0.75, color: '#1565C0', gradient: ['#1565C0', '#1E88E5'] as [string, string], emoji: '🔢' },
    { name: 'मातृभाषा (Tribal Literacy)', progress: 0.85, color: '#059669', gradient: ['#059669', '#10B981'] as [string, string], emoji: '📖' },
    { name: 'विज्ञान (Science & Discovery)', progress: 0.50, color: '#7C3AED', gradient: ['#7C3AED', '#8B5CF6'] as [string, string], emoji: '🔬' },
    { name: 'पर्यावरण (EVS & Nature)', progress: 0.65, color: '#0D9488', gradient: ['#0D9488', '#14B8A6'] as [string, string], emoji: '🌿' },
    { name: 'English Vocabulary', progress: 0.40, color: '#EA580C', gradient: ['#EA580C', '#F97316'] as [string, string], emoji: '🔤' },
  ]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header
        title="Learning Analytics 📈"
        subtitle="मेरी प्रगति और आंकड़े"
        showBack={false}
        variant="gradient"
        gradientColors={['#D97706', '#F59E0B']}
      />

      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 44 }}>
        {/* Top Level Summary Banner */}
        <LinearGradient
          colors={theme.isDark ? ['#78350F', '#451A03'] : ['#FEF3C7', '#FDE68A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.levelHero, { borderColor: '#F59E0B' }]}
        >
          <View style={styles.levelRing}>
            <Text style={{ fontSize: 26, fontWeight: '900', color: '#78350F' }}>{level}</Text>
            <Text style={{ fontSize: 9, fontWeight: '900', color: '#92400E' }}>LEVEL</Text>
          </View>
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={{ color: '#78350F', fontWeight: '900', fontSize: 16 }}>
              {user?.name || 'Student'} • Scholar Rank
            </Text>
            <Text style={{ color: '#92400E', fontSize: 12, fontWeight: '700', marginTop: 2 }}>
              {totalXp} Total XP Earned • {currentStreak} Day Streak 🔥
            </Text>
          </View>
        </LinearGradient>

        <TribalMotifBar color={theme.isDark ? '#F59E0B' : '#D97706'} height={12} />

        {/* Weekly Activity Graph */}
        <View style={[styles.cardBox, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.cardTitle, { color: c.text }]}>Weekly XP Activity 📊</Text>
          <View style={styles.graphRow}>
            {WEEKDAYS.map((d, i) => {
              const heightPct = Math.min(100, Math.max(15, (d.xp / 120) * 100));
              return (
                <View key={i} style={styles.graphCol}>
                  <View style={styles.graphTrack}>
                    <LinearGradient
                      colors={d.active ? ['#F59E0B', '#D97706'] : ['#E2E8F0', '#CBD5E1']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 0, y: 1 }}
                      style={[styles.graphBar, { height: `${heightPct}%` }]}
                    />
                  </View>
                  <Text style={[styles.dayLabel, { color: d.active ? c.text : c.textMuted }]}>{d.day}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Achievements / Trophy Room Banner */}
        <AnimatedCard
          onPress={() => nav.navigate('Badges')}
          style={[styles.trophyBanner, { backgroundColor: theme.isDark ? '#4C1D95' : '#F5F3FF', borderColor: '#8B5CF6' }]}
        >
          <Text style={{ fontSize: 36 }}>🏆</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontSize: 15, fontWeight: '900', color: theme.isDark ? '#E9D5FF' : '#5B21B6' }}>
              Trophy & Badges Room
            </Text>
            <Text style={{ fontSize: 11, color: theme.isDark ? '#C4B5FD' : '#7C3AED', marginTop: 1 }}>
              View earned medals, streaks & NIPUN rewards
            </Text>
          </View>
          <Text style={{ fontSize: 18, color: '#7C3AED', fontWeight: '900' }}>➔</Text>
        </AnimatedCard>

        {/* Subject Mastery Progress Bars */}
        <View style={[styles.cardBox, { backgroundColor: c.card, borderColor: c.border, marginTop: 14 }]}>
          <View style={styles.cardHeaderRow}>
            <Text style={[styles.cardTitle, { color: c.text }]}>Subject Mastery</Text>
            <NipunBharatEmblem size={30} />
          </View>
          {subjectProgress.map((item, idx) => (
            <View key={idx} style={styles.subjectRow}>
              <Text style={{ fontSize: 20, marginRight: 10 }}>{item.emoji}</Text>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 13, fontWeight: '700', color: c.text }}>{item.name}</Text>
                  <Text style={{ fontSize: 12, fontWeight: '900', color: item.color }}>
                    {Math.round(item.progress * 100)}%
                  </Text>
                </View>
                <View style={[styles.barBg, { backgroundColor: c.borderLight }]}>
                  <LinearGradient
                    colors={item.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.barFill, { width: `${item.progress * 100}%` }]}
                  />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Activity Breakdown Stats */}
        <View style={[styles.cardBox, { backgroundColor: c.card, borderColor: c.border, marginTop: 14 }]}>
          <Text style={[styles.cardTitle, { color: c.text }]}>Activity Summary</Text>
          <View style={styles.activityRow}>
            <Text style={{ color: c.textSecondary, fontWeight: '600' }}>📖 Lessons Completed</Text>
            <Text style={{ fontWeight: '900', color: c.text }}>{lessonsCompleted}</Text>
          </View>
          <View style={styles.activityRow}>
            <Text style={{ color: c.textSecondary, fontWeight: '600' }}>❓ Quizzes Passed</Text>
            <Text style={{ fontWeight: '900', color: c.text }}>{quizzesPassed}</Text>
          </View>
          <View style={[styles.activityRow, { borderBottomWidth: 0 }]}>
            <Text style={{ color: c.textSecondary, fontWeight: '600' }}>🔥 Longest Streak Record</Text>
            <Text style={{ fontWeight: '900', color: '#EA580C' }}>{longestStreak} Days</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  levelHero: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 2,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  levelRing: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#F59E0B',
  },
  cardBox: {
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  graphRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 100,
    paddingTop: 10,
  },
  graphCol: {
    alignItems: 'center',
    flex: 1,
  },
  graphTrack: {
    width: 14,
    height: 70,
    backgroundColor: '#F1F5F9',
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  graphBar: {
    width: '100%',
    borderRadius: 7,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: '800',
    marginTop: 6,
  },
  trophyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 14,
    marginTop: 14,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  barBg: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: 8,
    borderRadius: 4,
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
});
