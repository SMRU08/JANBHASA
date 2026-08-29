import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { useGamificationStore } from '../../store/gamificationStore';
import { XPBadge, StreakBadge } from '../../components/XPBadge';
import { AnimatedCard } from '../../components/AnimatedCard';
import {
  StudentHeroIllustration,
  TribalMotifBar,
  NipunBharatEmblem,
} from '../../components/VisualIllustrations';
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
      label: t('student.lessons') || 'पाठ्यक्रम',
      sub: 'Class 1-5 FLN Lessons',
      gradient: ['#059669', '#10B981'] as [string, string],
      bg: theme.isDark ? '#064E3B' : '#ECFDF5',
      border: '#10B981',
      action: () => nav.navigate('Learn', { screen: 'LearningPath' }),
    },
    {
      icon: '🃏',
      label: t('student.flashcards') || 'फ्लैशकार्ड्स',
      sub: 'Multilingual NIPUN Cards',
      gradient: ['#7C3AED', '#8B5CF6'] as [string, string],
      bg: theme.isDark ? '#4C1D95' : '#F5F3FF',
      border: '#8B5CF6',
      action: () => nav.navigate('Learn', { screen: 'Flashcards' }),
    },
    {
      icon: '❓',
      label: t('student.quiz') || 'प्रश्नोत्तरी',
      sub: 'Earn XP & Streak Badges',
      gradient: ['#D97706', '#F59E0B'] as [string, string],
      bg: theme.isDark ? '#78350F' : '#FFFBEB',
      border: '#F59E0B',
      action: () => nav.navigate('Learn', { screen: 'Quiz' }),
    },
    {
      icon: '📚',
      label: t('student.story_time') || 'कहानी विधा',
      sub: 'Tribal Folk Tales & Audio',
      gradient: ['#0284C7', '#38BDF8'] as [string, string],
      bg: theme.isDark ? '#0C4A6E' : '#F0F9FF',
      border: '#38BDF8',
      action: () => nav.navigate('Learn', { screen: 'StoryMode' }),
    },
    {
      icon: '🤖',
      label: t('student.ai_explain') || 'AI व्याख्या',
      sub: 'Ask in Mother Tongue',
      gradient: ['#6366F1', '#818CF8'] as [string, string],
      bg: theme.isDark ? '#312E81' : '#EEF2FF',
      border: '#818CF8',
      action: () => nav.navigate('AI'),
    },
    {
      icon: '📡',
      label: t('student.join_classroom') || 'कक्षा में जुड़ें',
      sub: 'Live Teacher Hotspot Stream',
      gradient: ['#EA580C', '#F97316'] as [string, string],
      bg: theme.isDark ? '#7C2D12' : '#FFF7ED',
      border: '#F97316',
      action: () => nav.navigate('Home', { screen: 'JoinClassroom' }),
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Lush Hero Banner */}
        <LinearGradient
          colors={theme.isDark ? ['#B45309', '#78350F'] : ['#D97706', '#F59E0B']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroTopRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.roleTag}>
                <Text style={styles.roleTagText}>🎓 FLN SCHOLAR</Text>
              </View>
              <Text style={styles.heroGreet}>{t('student.hello') || 'नमस्ते'},</Text>
              <Text style={styles.heroName}>{user?.name || 'Student'}</Text>
              <Text style={styles.heroSub}>Mother Tongue: {user?.selected_language?.toUpperCase() || 'HINDI'}</Text>
            </View>

            {/* Realistic Illustration */}
            <View style={styles.illustrationWrapper}>
              <StudentHeroIllustration size={96} />
            </View>
          </View>

          {/* Badges Pill Row */}
          <View style={styles.badgesRow}>
            <XPBadge xp={totalXp} level={level} compact />
            <StreakBadge streak={currentStreak} />
          </View>

          {/* Level Progress Bar */}
          <View style={styles.levelProgressBox}>
            <View style={styles.levelRow}>
              <Text style={styles.levelText}>Level {level}</Text>
              <Text style={styles.levelText}>{xpInCurrentLevel}/100 XP to Level {level + 1}</Text>
            </View>
            <View style={styles.progressTrack}>
              <LinearGradient
                colors={['#FFFFFF', '#FEF3C7']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.progressFill, { width: `${xpPercent}%` }]}
              />
            </View>
          </View>
        </LinearGradient>

        {/* Tribal Motif Decorator Bar */}
        <TribalMotifBar color={theme.isDark ? '#F59E0B' : '#D97706'} height={14} />

        <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          {/* NIPUN Bharat FLN Alignment Banner */}
          <View style={[styles.nipunBanner, { backgroundColor: theme.isDark ? '#064E3B' : '#D1FAE5', borderColor: '#10B981' }]}>
            <NipunBharatEmblem size={44} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.nipunTitle, { color: theme.isDark ? '#A7F3D0' : '#065F46' }]}>
                NIPUN Bharat FLN Aligned
              </Text>
              <Text style={[styles.nipunSub, { color: theme.isDark ? '#6EE7B7' : '#047857' }]}>
                Foundational Literacy & Numeracy in Ho, Mundari & Santali
              </Text>
            </View>
          </View>

          {/* Stats Row */}
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
                <Text style={{ fontSize: 20 }}>{s.emoji}</Text>
                <Text style={{ color: s.color, fontWeight: '900', fontSize: 16 }}>{s.value}</Text>
                <Text style={{ color: c.textSecondary, fontSize: 10, fontWeight: '700' }}>
                  {s.label}
                </Text>
              </View>
            ))}
          </View>

          {/* Feature Grid */}
          <Text style={[styles.sectionTitle, { color: c.text }]}>Learning Activities 🚀</Text>
          <View style={styles.featureGrid}>
            {features.map((f, i) => (
              <AnimatedCard
                key={i}
                onPress={f.action}
                style={[
                  styles.featureCard,
                  { backgroundColor: f.bg, borderColor: f.border },
                ]}
              >
                <View style={styles.featureHeaderRow}>
                  <Text style={styles.featureIcon}>{f.icon}</Text>
                  <View style={[styles.miniPill, { backgroundColor: f.border }]}>
                    <Text style={{ color: '#fff', fontSize: 9, fontWeight: '900' }}>FLN</Text>
                  </View>
                </View>
                <Text style={[styles.featureLabel, { color: theme.isDark ? '#F8FAFC' : '#0F172A' }]}>
                  {f.label}
                </Text>
                <Text style={[styles.featureSub, { color: c.textSecondary }]} numberOfLines={2}>
                  {f.sub}
                </Text>
              </AnimatedCard>
            ))}
          </View>

          {/* Continue Learning */}
          {recentLessons.length > 0 && (
            <>
              <Text style={[styles.sectionTitle, { color: c.text, marginTop: 10 }]}>
                📌 Continue Learning
              </Text>
              {recentLessons.map((l, i) => (
                <AnimatedCard
                  key={i}
                  onPress={() => nav.navigate('Learn')}
                  style={[
                    styles.lessonRow,
                    { backgroundColor: c.surface, borderColor: c.border },
                  ]}
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
                </AnimatedCard>
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
    padding: 20,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 14,
    elevation: 6,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  roleTag: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  roleTagText: {
    color: '#FEF3C7',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  heroGreet: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    fontWeight: '700',
  },
  heroName: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  heroSub: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  illustrationWrapper: {
    marginLeft: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  levelProgressBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.22)',
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
    fontWeight: '800',
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    overflow: 'hidden',
  },
  progressFill: {
    height: 8,
    borderRadius: 4,
  },
  nipunBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 12,
    marginTop: 10,
    marginBottom: 16,
  },
  nipunTitle: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  nipunSub: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
    lineHeight: 15,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1,
    paddingVertical: 10,
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
    fontWeight: '900',
    marginBottom: 14,
    letterSpacing: 0.2,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  featureCard: {
    width: '48%',
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 14,
    minHeight: 116,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  featureHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  featureIcon: {
    fontSize: 28,
  },
  miniPill: {
    borderRadius: 6,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  featureLabel: {
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  featureSub: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
  },
  lessonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
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
