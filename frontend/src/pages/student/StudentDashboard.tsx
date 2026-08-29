import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { useGamificationStore } from '../../store/gamificationStore';
import { XPBadge, StreakBadge } from '../../components/XPBadge';
import { Card } from '../../components/Card';
import { apiRequest } from '../../services/apiClient';

export function StudentDashboard() {
  const theme = useTheme();
  const c = theme.colors;
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
      setStats({
        totalXp: statsRes.data.total_xp || 0,
        level: statsRes.data.level || 1,
        currentStreak: statsRes.data.current_streak || 0,
        lessonsCompleted: statsRes.data.lessons_completed || 0,
      });
    }
    if (progressRes.success && progressRes.data) setRecentLessons(progressRes.data.slice(0, 3));
    setRefreshing(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const xpInCurrentLevel = totalXp % 100;
  const xpPercent = Math.min(100, Math.max(5, xpInCurrentLevel));

  const features = [
    {
      icon: '📖',
      label: t('student.lessons'),
      sub: 'Class 1-5 Lessons',
      color: c.primary,
      bg: c.primaryLight,
      action: () => nav.navigate('Learn', { screen: 'LearningPath' }),
    },
    {
      icon: '🃏',
      label: t('student.flashcards'),
      sub: 'Multi-lingual Cards',
      color: '#7C3AED',
      bg: '#EDE9FE',
      action: () => nav.navigate('Learn', { screen: 'Flashcards' }),
    },
    {
      icon: '❓',
      label: t('student.quiz'),
      sub: 'Earn XP & Badges',
      color: c.secondary,
      bg: '#FEF3C7',
      action: () => nav.navigate('Learn', { screen: 'Quiz' }),
    },
    {
      icon: '📚',
      label: t('student.story_time'),
      sub: 'Tribal Folk Tales',
      color: '#059669',
      bg: '#D1FAE5',
      action: () => nav.navigate('Learn', { screen: 'StoryMode' }),
    },
    {
      icon: '🤖',
      label: t('student.ai_explain'),
      sub: 'Ask in Mother Tongue',
      color: '#0284C7',
      bg: '#E0F2FE',
      action: () => nav.navigate('AI'),
    },
    {
      icon: '📡',
      label: t('student.join_classroom'),
      sub: 'Live Teacher Broadcast',
      color: '#EA580C',
      bg: '#FFEDD5',
      action: () => nav.navigate('Home', { screen: 'JoinClassroom' }),
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Modern Hero Card */}
        <View style={[styles.hero, { backgroundColor: c.secondary }]}>
          <View style={styles.heroTopRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroGreet}>{t('student.hello')}</Text>
              <Text style={styles.heroName}>{user?.name || 'Student'} 🎓</Text>
            </View>
            <View style={{ alignItems: 'flex-end', gap: 6 }}>
              <XPBadge xp={totalXp} level={level} compact />
              <StreakBadge streak={currentStreak} />
            </View>
          </View>

          {/* Level Progress Bar */}
          <View style={styles.levelProgressBox}>
            <View style={styles.levelRow}>
              <Text style={styles.levelText}>Level {level}</Text>
              <Text style={styles.levelText}>{xpInCurrentLevel}/100 XP to Level {level + 1}</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${xpPercent}%` }]} />
            </View>
          </View>
        </View>

        <View style={{ padding: 18 }}>
          {/* Stats row */}
          <View style={styles.statsRow}>
            {[
              { label: 'Level', value: `Lv.${level}`, emoji: '⭐', color: c.xp },
              { label: 'Streak', value: `${currentStreak}d`, emoji: '🔥', color: c.streak },
              { label: 'Lessons', value: lessonsCompleted, emoji: '📖', color: c.primary },
              { label: 'Total XP', value: totalXp, emoji: '🏆', color: c.badge },
            ].map((s, i) => (
              <View
                key={i}
                style={[
                  styles.statCard,
                  { backgroundColor: c.surface, borderColor: c.border },
                ]}
              >
                <Text style={{ fontSize: 22 }}>{s.emoji}</Text>
                <Text style={{ color: s.color, fontWeight: '900', fontSize: 16 }}>{s.value}</Text>
                <Text style={{ color: c.textSecondary, fontSize: 11, fontWeight: '600' }}>
                  {s.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Feature Grid */}
          <Text style={[styles.sectionTitle, { color: c.text }]}>Learning Activities 🚀</Text>
          <View style={styles.featureGrid}>
            {features.map((f, i) => (
              <TouchableOpacity
                key={i}
                onPress={f.action}
                style={[
                  styles.featureCard,
                  { backgroundColor: f.bg, borderColor: f.color },
                ]}
                activeOpacity={0.85}
              >
                <Text style={styles.featureIcon}>{f.icon}</Text>
                <Text style={[styles.featureLabel, { color: f.color }]}>{f.label}</Text>
                <Text style={[styles.featureSub, { color: f.color }]} numberOfLines={1}>
                  {f.sub}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Continue Learning */}
          {recentLessons.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: c.text, marginTop: 8 }]}>
                📌 Continue Learning
              </Text>
              {recentLessons.map((l, i) => (
                <TouchableOpacity
                  key={i}
                  onPress={() => nav.navigate('Learn')}
                  style={[
                    styles.lessonRow,
                    { backgroundColor: c.surface, borderColor: c.border },
                  ]}
                  activeOpacity={0.85}
                >
                  <Text style={{ fontSize: 28, marginRight: 14 }}>{l.icon || '📚'}</Text>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{ color: c.text, fontWeight: '700', fontSize: 15 }}
                      numberOfLines={1}
                    >
                      {l.title}
                    </Text>
                    <View style={[styles.progressBar, { backgroundColor: c.borderLight }]}>
                      <View
                        style={[
                          styles.lessonProgressFill,
                          { width: `${l.progress_percent || 0}%`, backgroundColor: c.primary },
                        ]}
                      />
                    </View>
                  </View>
                  <Text style={{ color: c.primary, fontWeight: '800', fontSize: 13, marginLeft: 8 }}>
                    {l.progress_percent || 0}%
                  </Text>
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
  hero: {
    padding: 22,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  heroGreet: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    fontWeight: '600',
  },
  heroName: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 2,
  },
  levelProgressBox: {
    backgroundColor: 'rgba(0,0,0,0.18)',
    borderRadius: 14,
    padding: 12,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  levelText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  progressTrack: {
    height: 7,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  progressFill: {
    height: 7,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
    marginTop: 4,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    alignItems: 'center',
    gap: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  featureCard: {
    width: '48%',
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
    alignItems: 'flex-start',
    justifyContent: 'center',
    minHeight: 110,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  featureIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  featureLabel: {
    fontSize: 14,
    fontWeight: '800',
  },
  featureSub: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    opacity: 0.85,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    marginTop: 8,
    overflow: 'hidden',
  },
  lessonProgressFill: {
    height: 6,
    borderRadius: 3,
  },
});
