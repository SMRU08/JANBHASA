import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { Card } from '../../components/Card';
import { AnalyticsCard } from '../../components/OfflineBanner';
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
      label: 'Live\nClassroom',
      color: c.primary,
      bg: c.primaryLight,
      screen: 'Classroom',
    },
    {
      icon: '📋',
      label: 'Assignments\n& Tests',
      color: c.secondary,
      bg: '#FEF3C7',
      screen: 'Assignments',
    },
    {
      icon: '🎤',
      label: 'Voice\nTranslate',
      color: '#7C3AED',
      bg: '#EDE9FE',
      screen: 'AI',
    },
    {
      icon: '📷',
      label: 'Textbook\nOCR Scan',
      color: '#0284C7',
      bg: '#E0F2FE',
      screen: 'AI',
    },
    {
      icon: '📝',
      label: 'OMR Sheet\nAuto-Grade',
      color: '#EA580C',
      bg: '#FFEDD5',
      screen: 'AI',
    },
    {
      icon: '📊',
      label: 'Student\nAnalytics',
      color: '#059669',
      bg: '#D1FAE5',
      screen: 'Home',
    },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchStats} />}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Banner */}
        <View style={[styles.hero, { backgroundColor: c.primary }]}>
          <View style={styles.avatarBox}>
            <Text style={styles.heroEmoji}>👩‍🏫</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.heroGreet}>{t('teacher.welcome')}</Text>
            <Text style={styles.heroName}>{user?.name || 'Pooja Sharma'}</Text>
            <View style={styles.badgePill}>
              <Text style={styles.heroBadge}>✅ Verified Primary Educator</Text>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          {/* Stats Row */}
          <View style={styles.statsRow}>
            <AnalyticsCard
              title="Students"
              value={stats?.total_students || '28'}
              icon="👩‍🎓"
              color={c.secondary}
            />
            <AnalyticsCard
              title="Avg XP"
              value={stats?.avg_xp != null ? Math.round(stats.avg_xp) : '340'}
              icon="⭐"
              color={c.xp}
            />
            <AnalyticsCard
              title="Avg Streak"
              value={stats?.avg_streak != null ? `${Math.round(stats.avg_streak)}d` : '5d'}
              icon="🔥"
              color={c.streak}
            />
          </View>

          {/* Quick Actions */}
          <Text style={[styles.sectionTitle, { color: c.text }]}>Teacher Command Center 🛠️</Text>
          <View style={styles.actionGrid}>
            {quickActions.map((a, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => nav.navigate(a.screen)}
                style={[
                  styles.actionCard,
                  { backgroundColor: a.bg, borderColor: a.color },
                ]}
                activeOpacity={0.85}
              >
                <Text style={styles.actionIcon}>{a.icon}</Text>
                <Text style={[styles.actionLabel, { color: a.color }]}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* AI Suite Overview */}
          <Card style={{ marginBottom: 18, borderRadius: 20 }}>
            <View style={styles.aiHeader}>
              <Text style={{ fontSize: 24 }}>🤖</Text>
              <View>
                <Text style={[styles.aiTitle, { color: c.text }]}>Offline AI Classroom Engine</Text>
                <Text style={[styles.aiSub, { color: c.textSecondary }]}>
                  High-speed inference on local teacher device
                </Text>
              </View>
            </View>

            <View style={styles.aiFeatureList}>
              {[
                { icon: '🎙️', text: 'Live Speech-to-Speech into 6 tribal languages' },
                { icon: '📖', text: 'OCR textbook digitizer with instant translation' },
                { icon: '📸', text: 'Camera-based OMR answer sheet auto-grading' },
                { icon: '🔒', text: 'Zero cloud latency — runs fully offline on hotspot' },
              ].map((f, i) => (
                <View key={i} style={styles.featureRow}>
                  <Text style={{ fontSize: 16, marginRight: 8 }}>{f.icon}</Text>
                  <Text style={[styles.featureText, { color: c.textSecondary }]}>
                    {f.text}
                  </Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Offline Ready Banner */}
          <View
            style={[
              styles.offlineBanner,
              { backgroundColor: c.primaryLight, borderColor: c.primary },
            ]}
          >
            <Text style={{ color: c.primaryDark, fontWeight: '800', fontSize: 14 }}>
              📡 Hotspot Classroom Ready
            </Text>
            <Text style={{ color: c.primaryDark, fontSize: 12, marginTop: 3, textAlign: 'center' }}>
              Connect student tablets/phones to your phone hotspot without any internet connection.
            </Text>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 4,
  },
  avatarBox: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  heroEmoji: {
    fontSize: 34,
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
  badgePill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  heroBadge: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  content: {
    padding: 18,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 14,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 22,
  },
  actionCard: {
    width: '31%',
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 14,
    alignItems: 'center',
    minHeight: 100,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 30,
    marginBottom: 6,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 14,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  aiTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  aiSub: {
    fontSize: 12,
    marginTop: 1,
  },
  aiFeatureList: {
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  offlineBanner: {
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
});
