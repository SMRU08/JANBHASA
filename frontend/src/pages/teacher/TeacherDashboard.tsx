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

interface Stats { teachers: number; students: number; active_classrooms_today: number; }

export function TeacherDashboard() {
  const theme = useTheme(); const c = theme.colors;
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
  useEffect(() => { fetchStats(); }, []);

  const quickActions = [
    { icon: '📡', label: 'Live\nClassroom', color: c.primary, bg: c.primaryLight, screen: 'Classroom' },
    { icon: '📋', label: 'Assignments', color: c.secondary, bg: '#FFF3E0', screen: 'Assignments' },
    { icon: '🎤', label: 'Voice\nTranslate', color: '#7B1FA2', bg: '#F3E5F5', screen: 'AI' },
    { icon: '📷', label: 'OCR\nScan', color: '#1976D2', bg: '#E3F2FD', screen: 'AI' },
    { icon: '📝', label: 'OMR\nCheck', color: '#F57C00', bg: '#FFF3E0', screen: 'AI' },
    { icon: '📊', label: 'Analytics', color: '#2E7D32', bg: '#E8F5E9', screen: 'Home' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchStats} />} showsVerticalScrollIndicator={false}>
        {/* Hero banner */}
        <View style={[styles.hero, { backgroundColor: c.primary }]}>
          <Text style={styles.heroEmoji}>👩‍🏫</Text>
          <View>
            <Text style={styles.heroGreet}>{t('teacher.welcome')}</Text>
            <Text style={styles.heroName}>{user?.name || 'Teacher'}</Text>
            <Text style={styles.heroBadge}>✅ Verified Teacher</Text>
          </View>
        </View>

        <View style={styles.content}>
          {/* Stats row */}
          <View style={styles.statsRow}>
            <AnalyticsCard title="Students" value={stats?.total_students || '--'} icon="👩‍🎓" color={c.secondary} />
            <AnalyticsCard title="Avg XP" value={stats?.avg_xp != null ? Math.round(stats.avg_xp) : '--'} icon="⭐" color={c.xp} />
            <AnalyticsCard title="Streak" value={stats?.avg_streak != null ? `${Math.round(stats.avg_streak)}d` : '--'} icon="🔥" color={c.streak} />
          </View>

          {/* Quick Actions */}
          <Text style={[styles.sectionTitle, { color: c.text }]}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            {quickActions.map((a, i) => (
              <TouchableOpacity key={i} onPress={() => nav.navigate(a.screen)} style={[styles.actionCard, { backgroundColor: a.bg }]} activeOpacity={0.8}>
                <Text style={styles.actionIcon}>{a.icon}</Text>
                <Text style={[styles.actionLabel, { color: a.color }]}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* AI Features highlight */}
          <Card style={{ marginBottom: 16 }}>
            <Text style={[styles.sectionTitle, { color: c.text, marginTop: 0 }]}>🤖 AI Features (Offline)</Text>
            <View style={styles.aiFeatureList}>
              {['🎤 Live classroom voice translation', '🌐 Hindi ↔ 6 regional languages', '📷 Hindi textbook OCR reader', '📝 Auto answer sheet grader', '🔊 Text-to-Speech for all languages'].map((f, i) => (
                <Text key={i} style={{ color: c.textSecondary, fontSize: 13, marginBottom: 6 }}>{f}</Text>
              ))}
            </View>
          </Card>

          {/* Offline Banner */}
          <View style={[styles.offlineBanner, { backgroundColor: c.successLight, borderColor: c.success }]}>
            <Text style={{ color: c.success, fontWeight: '700' }}>✅ All features work offline</Text>
            <Text style={{ color: c.success, fontSize: 12, marginTop: 2 }}>No internet required for classroom mode</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  hero: { padding: 24, paddingTop: 28, flexDirection: 'row', alignItems: 'center', gap: 16 },
  heroEmoji: { fontSize: 52 },
  heroGreet: { color: 'rgba(255,255,255,0.85)', fontSize: 14 },
  heroName: { color: '#fff', fontSize: 22, fontWeight: '800', marginTop: 2 },
  heroBadge: { color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 4 },
  content: { padding: 16 },
  statsRow: { flexDirection: 'row', marginBottom: 20, marginTop: 4 },
  sectionTitle: { fontSize: 17, fontWeight: '700', marginBottom: 14, marginTop: 8 },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
  actionCard: { width: '30.5%', borderRadius: 16, padding: 14, alignItems: 'center', minHeight: 80, justifyContent: 'center' },
  actionIcon: { fontSize: 28, marginBottom: 6 },
  actionLabel: { fontSize: 11, fontWeight: '700', textAlign: 'center' },
  aiFeatureList: { marginTop: 8 },
  offlineBanner: { borderRadius: 14, borderWidth: 1, padding: 16, alignItems: 'center', marginBottom: 24 },
});
