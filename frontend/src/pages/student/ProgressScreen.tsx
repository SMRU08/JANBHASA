import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../../components/Header';
import { ProgressCircle } from '../../components/ProgressCircle';
import { Card } from '../../components/Card';
import { AnalyticsCard } from '../../components/OfflineBanner';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { useGamificationStore } from '../../store/gamificationStore';
import { apiRequest } from '../../services/apiClient';

export function ProgressScreen() {
  const theme = useTheme();
  const c = theme.colors;
  const nav = useNavigation<any>();
  const { user } = useAuthStore();
  const { totalXp, level, currentStreak, longestStreak, lessonsCompleted, quizzesPassed } = useGamificationStore();
  const [subjectProgress, setSubjectProgress] = useState([
    { name: 'गणित (Math)', progress: 0.65, color: '#1565C0' },
    { name: 'हिंदी (Hindi)', progress: 0.80, color: '#2E7D32' },
    { name: 'विज्ञान (Science)', progress: 0.40, color: '#6A1B9A' },
    { name: 'पर्यावरण (EVS)', progress: 0.50, color: '#00695C' },
    { name: 'English', progress: 0.30, color: '#B71C1C' },
  ]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="My Progress 📈" subtitle="मेरी प्रगति" showBack={false} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Top Summary Cards */}
        <View style={styles.statsRow}>
          <AnalyticsCard title="Total XP" value={totalXp} icon="⭐" color={c.xp} />
          <AnalyticsCard title="Current Level" value={`Lv.${level}`} icon="🏆" color={c.badge} />
        </View>

        <View style={[styles.statsRow, { marginTop: 10 }]}>
          <AnalyticsCard title="Streak" value={`${currentStreak} days`} icon="🔥" color={c.streak} />
          <AnalyticsCard title="Longest Streak" value={`${longestStreak} days`} icon="⚡" color={c.primary} />
        </View>

        {/* Badges Banner */}
        <TouchableOpacity
          onPress={() => nav.navigate('Badges')}
          style={[styles.badgeBanner, { backgroundColor: c.card, borderColor: c.border }]}
          activeOpacity={0.8}
        >
          <Text style={{ fontSize: 32 }}>🏆</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: c.text }}>Achievements & Badges</Text>
            <Text style={{ fontSize: 12, color: c.textMuted }}>View unlocked badges and rewards</Text>
          </View>
          <Text style={{ fontSize: 18, color: c.primary, fontWeight: '800' }}>→</Text>
        </TouchableOpacity>

        {/* Subject Mastery */}
        <Card style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 14 }}>
            Subject Mastery
          </Text>
          {subjectProgress.map((item, idx) => (
            <View key={idx} style={styles.subjectRow}>
              <View style={{ flex: 1, marginRight: 12 }}>
                <Text style={{ fontSize: 14, fontWeight: '600', color: c.text }}>{item.name}</Text>
                <View style={[styles.barBg, { backgroundColor: c.border }]}>
                  <View style={[styles.barFill, { width: `${item.progress * 100}%`, backgroundColor: item.color }]} />
                </View>
              </View>
              <Text style={{ fontSize: 13, fontWeight: '700', color: item.color }}>
                {Math.round(item.progress * 100)}%
              </Text>
            </View>
          ))}
        </Card>

        {/* Activity Summary */}
        <Card style={{ marginTop: 14 }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 10 }}>
            Activity Breakdown
          </Text>
          <View style={styles.activityRow}>
            <Text style={{ color: c.textSecondary }}>Lessons Completed</Text>
            <Text style={{ fontWeight: '700', color: c.text }}>{lessonsCompleted}</Text>
          </View>
          <View style={styles.activityRow}>
            <Text style={{ color: c.textSecondary }}>Quizzes Passed</Text>
            <Text style={{ fontWeight: '700', color: c.text }}>{quizzesPassed}</Text>
          </View>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  statsRow: { flexDirection: 'row', gap: 10 },
  badgeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginTop: 14
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14
  },
  barBg: {
    height: 8,
    borderRadius: 4,
    marginTop: 6,
    overflow: 'hidden'
  },
  barFill: {
    height: 8,
    borderRadius: 4
  },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee'
  }
});
