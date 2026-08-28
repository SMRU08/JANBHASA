import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { useGamificationStore } from '../../store/gamificationStore';
import { XPBadge, StreakBadge } from '../../components/XPBadge';
import { Card } from '../../components/Card';
import { apiRequest } from '../../services/apiClient';

export function StudentDashboard() {
  const theme = useTheme(); const c = theme.colors;
  const { t } = useTranslation();
  const nav = useNavigation<any>();
  const { user } = useAuthStore();
  const { totalXp, level, currentStreak, lessonsCompleted, setStats } = useGamificationStore();
  const [refreshing, setRefreshing] = useState(false);
  const [recentLessons, setRecentLessons] = useState<any[]>([]);

  const fetchData = async () => {
    setRefreshing(true);
    const [statsRes, progressRes] = await Promise.all([
      apiRequest<any>(`/api/students/${user?.student_id || 1}/profile`),
      apiRequest<any[]>(`/api/students/${user?.student_id || 1}/progress`),
    ]);
    if (statsRes.success && statsRes.data) {
      setStats({ totalXp: statsRes.data.total_xp || 0, level: statsRes.data.level || 1, currentStreak: statsRes.data.current_streak || 0, lessonsCompleted: statsRes.data.lessons_completed || 0 });
    }
    if (progressRes.success && progressRes.data) setRecentLessons(progressRes.data.slice(0, 3));
    setRefreshing(false);
  };
  useEffect(() => { fetchData(); }, []);

  const features = [
    { icon: '📖', label: t('student.lessons'), color: c.primary, bg: c.primaryLight, action: () => nav.navigate('Learn') },
    { icon: '🃏', label: t('student.flashcards'), color: '#7B1FA2', bg: '#F3E5F5', action: () => nav.navigate('Learn', { screen: 'Flashcards' }) },
    { icon: '❓', label: t('student.quiz'), color: c.secondary, bg: '#FFF3E0', action: () => nav.navigate('Learn', { screen: 'Quiz' }) },
    { icon: '📚', label: t('student.story_time'), color: '#2E7D32', bg: '#E8F5E9', action: () => nav.navigate('Learn', { screen: 'StoryMode' }) },
    { icon: '🤖', label: t('student.ai_explain'), color: '#1976D2', bg: '#E3F2FD', action: () => nav.navigate('AI') },
    { icon: '📡', label: t('student.join_classroom'), color: '#F57C00', bg: '#FFF3E0', action: () => nav.navigate('JoinClassroom') },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} />} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={[styles.hero, { backgroundColor: c.secondary }]}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroGreet}>{t('student.hello')}</Text>
            <Text style={styles.heroName}>{user?.name || 'Student'} 🎓</Text>
          </View>
          <View style={{ alignItems: 'flex-end', gap: 8 }}>
            <XPBadge xp={totalXp} level={level} compact />
            <StreakBadge streak={currentStreak} />
          </View>
        </View>

        <View style={{ padding: 16 }}>
          {/* Stats row */}
          <View style={styles.statsRow}>
            {[
              { label: 'Level', value: `Lv.${level}`, emoji: '⭐', color: c.xp },
              { label: 'Streak', value: `${currentStreak}d`, emoji: '🔥', color: c.streak },
              { label: 'Lessons', value: lessonsCompleted, emoji: '📖', color: c.primary },
              { label: 'XP', value: totalXp, emoji: '🏆', color: c.badge },
            ].map((s, i) => (
              <View key={i} style={[styles.statCard, { backgroundColor: c.card, borderColor: c.border }]}>
                <Text style={{ fontSize: 20 }}>{s.emoji}</Text>
                <Text style={{ color: s.color, fontWeight: '800', fontSize: 16 }}>{s.value}</Text>
                <Text style={{ color: c.textMuted, fontSize: 10 }}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* Feature grid */}
          <Text style={[styles.sectionTitle, { color: c.text }]}>What do you want to do today?</Text>
          <View style={styles.featureGrid}>
            {features.map((f, i) => (
              <TouchableOpacity key={i} onPress={f.action} style={[styles.featureCard, { backgroundColor: f.bg }]} activeOpacity={0.8}>
                <Text style={styles.featureIcon}>{f.icon}</Text>
                <Text style={[styles.featureLabel, { color: f.color }]}>{f.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Continue learning */}
          {recentLessons.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: c.text }]}>📌 Continue Learning</Text>
              {recentLessons.map((l, i) => (
                <TouchableOpacity key={i} onPress={() => nav.navigate('Learn')} style={[styles.lessonRow, { backgroundColor: c.card, borderColor: c.border }]}>
                  <Text style={{ fontSize: 24, marginRight: 12 }}>{l.icon || '📚'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: c.text, fontWeight: '600', fontSize: 14 }} numberOfLines={1}>{l.title}</Text>
                    <View style={[styles.progressBar, { backgroundColor: c.border }]}>
                      <View style={[styles.progressFill, { width: `${l.progress_percent || 0}%`, backgroundColor: c.primary }]} />
                    </View>
                  </View>
                  <Text style={{ color: c.textMuted, fontSize: 12 }}>{l.progress_percent || 0}%</Text>
                </TouchableOpacity>
              ))}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: { padding: 24, flexDirection: 'row', alignItems: 'center' },
  heroGreet: { color: 'rgba(255,255,255,0.85)', fontSize: 13 },
  heroName: { color: '#fff', fontSize: 20, fontWeight: '800', marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: 8, marginBottom: 20 },
  statCard: { flex: 1, borderRadius: 12, borderWidth: 1, padding: 10, alignItems: 'center', gap: 2 },
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  featureGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 24 },
  featureCard: { width: '31%', borderRadius: 16, padding: 14, alignItems: 'center', justifyContent: 'center', minHeight: 84 },
  featureIcon: { fontSize: 30, marginBottom: 6 },
  featureLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  lessonRow: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, padding: 12, marginBottom: 8 },
  progressBar: { height: 4, borderRadius: 2, marginTop: 6, overflow: 'hidden' },
  progressFill: { height: 4, borderRadius: 2 },
});
