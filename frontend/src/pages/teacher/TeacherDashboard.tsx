import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { AnimatedCard } from '../../components/AnimatedCard';
import {
  TeacherHeroIllustration,
  TribalMotifBar,
  NipunBharatEmblem,
} from '../../components/VisualIllustrations';
import { apiRequest } from '../../services/apiClient';

export function TeacherDashboard() {
  const theme = useTheme();
  const c = theme.colors;
  const { t } = useTranslation();
  const nav = useNavigation<any>();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    setRefreshing(true);
    const result = await apiRequest<any>(`/api/teachers/${user?.teacher_id || 1}/analytics`);
    if (result.success) setStats(result.data);
    setRefreshing(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const quickActions = [
    {
      icon: '📡',
      label: 'Live Classroom\nBroadcast',
      sub: 'Wi-Fi Hotspot & QR',
      color: '#059669',
      border: '#10B981',
      bg: theme.isDark ? '#064E3B' : '#ECFDF5',
      badge: 'LIVE',
      badgeBg: '#EF4444',
      screen: 'Classroom',
      params: { screen: 'ClassroomManagement' },
    },
    {
      icon: '📝',
      label: 'NIPUN Bharat\nWorksheets',
      sub: 'Auto Bilingual PDF',
      color: '#7C3AED',
      border: '#8B5CF6',
      bg: theme.isDark ? '#4C1D95' : '#F5F3FF',
      badge: 'NIPUN',
      badgeBg: '#7C3AED',
      screen: 'AI',
      params: { screen: 'WorksheetGenerator' },
    },
    {
      icon: '🎤',
      label: 'Voice-to-Voice\nBridge',
      sub: '≤3s Latency Translator',
      color: '#D97706',
      border: '#F59E0B',
      bg: theme.isDark ? '#78350F' : '#FFFBEB',
      badge: 'AI',
      badgeBg: '#D97706',
      screen: 'AI',
      params: { screen: 'VoiceTranslation' },
    },
    {
      icon: '📷',
      label: 'Textbook\nOCR Scanner',
      sub: 'Photo → Mother Tongue',
      color: '#0284C7',
      border: '#38BDF8',
      bg: theme.isDark ? '#0C4A6E' : '#F0F9FF',
      badge: 'OCR',
      badgeBg: '#0284C7',
      screen: 'AI',
      params: { screen: 'OCRScanner' },
    },
    {
      icon: '📋',
      label: 'Assignments\n& Homework',
      sub: 'Multi-lingual Tasks',
      color: '#EA580C',
      border: '#FB923C',
      bg: theme.isDark ? '#7C2D12' : '#FFF7ED',
      badge: 'TEST',
      badgeBg: '#EA580C',
      screen: 'Assignments',
      params: { screen: 'Assignments' },
    },
    {
      icon: '📊',
      label: 'Classroom\nAnalytics',
      sub: 'Student Progress & XP',
      color: '#059669',
      border: '#34D399',
      bg: theme.isDark ? '#064E3B' : '#ECFDF5',
      badge: 'DATA',
      badgeBg: '#059669',
      screen: 'Home',
      params: { screen: 'TeacherAnalytics' },
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchStats} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Lush Emerald Hero Banner */}
        <LinearGradient
          colors={theme.isDark ? ['#064E3B', '#022C22'] : ['#059669', '#10B981']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.hero}
        >
          <View style={styles.heroTopRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.educatorTag}>
                <Text style={styles.educatorTagText}>🌟 PRIMARY FLN EDUCATOR</Text>
              </View>
              <Text style={styles.heroGreet}>{t('teacher.welcome') || 'स्वागत है'},</Text>
              <Text style={styles.heroName}>{user?.name || 'Educator'}</Text>
              <Text style={styles.heroSub}>Language Hub: Hindi • Ho • Mundari • Santali</Text>
            </View>

            {/* Realistic Teacher Illustration */}
            <View style={styles.illustrationWrapper}>
              <TeacherHeroIllustration size={96} />
            </View>
          </View>

          {/* Quick Broadcast Launch Bar */}
          <AnimatedCard
            onPress={() => nav.navigate('Classroom', { screen: 'ClassroomManagement' })}
            style={styles.broadcastBanner}
          >
            <View style={styles.livePulseDot} />
            <Text style={styles.broadcastText}>Start Live Classroom Audio Broadcast</Text>
            <Text style={styles.broadcastArrow}>➔</Text>
          </AnimatedCard>
        </LinearGradient>

        {/* Tribal Motif Decorator Bar */}
        <TribalMotifBar color={theme.isDark ? '#10B981' : '#059669'} height={14} />

        <View style={{ paddingHorizontal: 16, paddingBottom: 24 }}>
          {/* NIPUN Bharat Alignment Badge */}
          <View style={[styles.nipunBanner, { backgroundColor: theme.isDark ? '#064E3B' : '#D1FAE5', borderColor: '#10B981' }]}>
            <NipunBharatEmblem size={44} />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.nipunTitle, { color: theme.isDark ? '#A7F3D0' : '#065F46' }]}>
                Teacher FLN Command Engine
              </Text>
              <Text style={[styles.nipunSub, { color: theme.isDark ? '#6EE7B7' : '#047857' }]}>
                Live Speech Translation & NIPUN Bharat Worksheet Builder
              </Text>
            </View>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            {[
              { label: 'Students', value: stats?.total_students || '28', emoji: '👩‍🎓', color: c.secondary },
              { label: 'Avg XP', value: stats?.avg_xp != null ? Math.round(stats.avg_xp) : '340', emoji: '⭐', color: c.xp },
              { label: 'Avg Streak', value: stats?.avg_streak != null ? `${Math.round(stats.avg_streak)}d` : '5d', emoji: '🔥', color: c.streak },
              { label: 'Sessions', value: stats?.total_sessions || '12', emoji: '📡', color: c.primary },
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

          {/* Command Center Action Grid */}
          <Text style={[styles.sectionTitle, { color: c.text }]}>Teacher Command Center 🛠️</Text>
          <View style={styles.actionGrid}>
            {quickActions.map((a, i) => (
              <AnimatedCard
                key={i}
                onPress={() => nav.navigate(a.screen, a.params)}
                style={[
                  styles.actionCard,
                  { backgroundColor: a.bg, borderColor: a.border },
                ]}
              >
                <View style={styles.actionHeaderRow}>
                  <Text style={styles.actionIcon}>{a.icon}</Text>
                  <View style={[styles.badgePill, { backgroundColor: a.badgeBg }]}>
                    <Text style={styles.badgePillText}>{a.badge}</Text>
                  </View>
                </View>
                <Text style={[styles.actionLabel, { color: theme.isDark ? '#F8FAFC' : '#0F172A' }]}>
                  {a.label}
                </Text>
                <Text style={[styles.actionSub, { color: c.textSecondary }]} numberOfLines={2}>
                  {a.sub}
                </Text>
              </AnimatedCard>
            ))}
          </View>
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
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 6,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  educatorTag: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  educatorTagText: {
    color: '#D1FAE5',
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
  broadcastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  livePulseDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    marginRight: 10,
  },
  broadcastText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    flex: 1,
  },
  broadcastArrow: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
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
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16,
  },
  actionCard: {
    width: '48%',
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 14,
    minHeight: 126,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  actionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionIcon: {
    fontSize: 28,
  },
  badgePill: {
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
  },
  badgePillText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
    marginBottom: 2,
  },
  actionSub: {
    fontSize: 10,
    fontWeight: '600',
    lineHeight: 14,
  },
});
