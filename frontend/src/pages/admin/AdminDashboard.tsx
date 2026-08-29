import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { AnalyticsCard } from '../../components/OfflineBanner';
import { AnimatedCard } from '../../components/AnimatedCard';
import { TribalMotifBar } from '../../components/VisualIllustrations';
import { apiRequest } from '../../services/apiClient';

export function AdminDashboard() {
  const theme = useTheme();
  const c = theme.colors;
  const nav = useNavigation<any>();
  const { user } = useAuthStore();
  const [overview, setOverview] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOverview = async () => {
    setRefreshing(true);
    const res = await apiRequest<any>('/api/admin/overview');
    if (res.success && res.data) {
      setOverview(res.data);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  const adminShortcuts = [
    { label: 'Teacher Verification', icon: '👩‍🏫', badge: overview?.teachers_pending, tab: 'Dashboard', screen: 'TeacherVerification', color: '#059669', bg: theme.isDark ? '#064E3B' : '#ECFDF5' },
    { label: 'Account Recovery', icon: '🔑', tab: 'Dashboard', screen: 'AccountRecovery', color: '#D97706', bg: theme.isDark ? '#78350F' : '#FFFBEB' },
    { label: 'Database Backup', icon: '💾', tab: 'Dashboard', screen: 'DatabaseBackup', color: '#0284C7', bg: theme.isDark ? '#0C4A6E' : '#F0F9FF' },
    { label: 'System Diagnostics', icon: '🩺', tab: 'Dashboard', screen: 'SystemDiagnostics', color: '#7C3AED', bg: theme.isDark ? '#4C1D95' : '#F5F3FF' },
    { label: 'Content CMS', icon: '📚', tab: 'Content', screen: 'ContentManagement', color: '#10B981', bg: theme.isDark ? '#064E3B' : '#ECFDF5' },
    { label: 'Language Packs', icon: '🌐', tab: 'Content', screen: 'LanguagePackManagement', color: '#EA580C', bg: theme.isDark ? '#7C2D12' : '#FFF7ED' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchOverview} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Admin Royal Gradient Header */}
        <LinearGradient
          colors={theme.isDark ? ['#4C1D95', '#2E1065'] : ['#7C3AED', '#6D28D9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerBox}
        >
          <View style={styles.headerRow}>
            <View style={styles.shieldWrapper}>
              <Text style={{ fontSize: 32 }}>🔐</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 14 }}>
              <View style={styles.adminTag}>
                <Text style={styles.adminTagText}>● ROOT CONSOLE</Text>
              </View>
              <Text style={styles.adminTitle}>{user?.name || 'System Administrator'}</Text>
              <Text style={styles.adminSub}>Multi-School & Offline Node Manager</Text>
            </View>
          </View>
        </LinearGradient>

        <TribalMotifBar color={theme.isDark ? '#A78BFA' : '#7C3AED'} height={14} />

        <View style={{ paddingHorizontal: 16 }}>
          {/* Overview Stats */}
          <Text style={[styles.sectionTitle, { color: c.text }]}>📊 Platform Live Metrics</Text>
          <View style={styles.statsGrid}>
            <AnalyticsCard title="Active Teachers" value={overview?.teachers || 1} icon="👩‍🏫" color={c.primary} />
            <AnalyticsCard title="Pending Approvals" value={overview?.teachers_pending || 0} icon="⏳" color={c.warning} />
          </View>
          <View style={[styles.statsGrid, { marginTop: 10 }]}>
            <AnalyticsCard title="Total Students" value={overview?.students || 24} icon="👨‍🎓" color={c.secondary} />
            <AnalyticsCard title="Schools" value={overview?.schools || 1} icon="🏫" color="#1976D2" />
          </View>
          <View style={[styles.statsGrid, { marginTop: 10 }]}>
            <AnalyticsCard title="Active Classrooms" value={overview?.active_classrooms_today || 1} icon="📡" color={c.success} />
            <AnalyticsCard title="DB Size" value={`${overview?.db_size_mb || 2.4} MB`} icon="💾" color={c.textMuted} />
          </View>

          {/* Shortcuts */}
          <Text style={[styles.sectionTitle, { color: c.text, marginTop: 24 }]}>⚡ Quick Management</Text>
          <View style={styles.actionGrid}>
            {adminShortcuts.map((sc, i) => (
              <AnimatedCard
                key={i}
                onPress={() => nav.navigate(sc.tab, { screen: sc.screen })}
                style={[
                  styles.shortcutCard,
                  { backgroundColor: sc.bg, borderColor: sc.color },
                ]}
              >
                <Text style={{ fontSize: 30 }}>{sc.icon}</Text>
                <Text style={[styles.shortcutText, { color: theme.isDark ? '#F8FAFC' : '#0F172A' }]}>
                  {sc.label}
                </Text>
                {sc.badge ? (
                  <View style={[styles.badgePill, { backgroundColor: c.error }]}>
                    <Text style={{ color: '#fff', fontSize: 10, fontWeight: '900' }}>{sc.badge}</Text>
                  </View>
                ) : null}
              </AnimatedCard>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerBox: {
    padding: 22,
    borderBottomLeftRadius: 26,
    borderBottomRightRadius: 26,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  shieldWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  adminTag: {
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  adminTagText: {
    color: '#E9D5FF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  adminTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  adminSub: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 12,
    marginTop: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 10,
  },
  shortcutCard: {
    width: '48%',
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 115,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  shortcutText: {
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
    marginTop: 8,
  },
  badgePill: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
});
