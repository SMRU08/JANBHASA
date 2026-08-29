import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { AnalyticsCard } from '../../components/OfflineBanner';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
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
    { label: 'Teacher Verification', icon: '👩‍🏫', badge: overview?.teachers_pending, tab: 'Dashboard', screen: 'TeacherVerification', color: c.primary },
    { label: 'Account Recovery', icon: '🔑', tab: 'Dashboard', screen: 'AccountRecovery', color: c.secondary },
    { label: 'Database Backup', icon: '💾', tab: 'Dashboard', screen: 'DatabaseBackup', color: '#1976D2' },
    { label: 'System Diagnostics', icon: '🩺', tab: 'Dashboard', screen: 'SystemDiagnostics', color: '#7B1FA2' },
    { label: 'Content CMS', icon: '📚', tab: 'Content', screen: 'ContentManagement', color: '#00796B' },
    { label: 'Language Packs', icon: '🌐', tab: 'Content', screen: 'LanguagePackManagement', color: '#E65100' },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <ScrollView
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchOverview} />}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
      >
        {/* Admin Header */}
        <View style={[styles.headerBox, { backgroundColor: c.admin }]}>
          <Text style={{ fontSize: 36 }}>🔐</Text>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>System Administrator</Text>
            <Text style={{ color: '#fff', fontSize: 20, fontWeight: '800' }}>{user?.name || 'Admin Hub'}</Text>
          </View>
        </View>

        {/* Overview Stats */}
        <Text style={[styles.sectionTitle, { color: c.text }]}>📊 Platform Overview</Text>
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
            <TouchableOpacity
              key={i}
              onPress={() => nav.navigate(sc.tab, { screen: sc.screen })}
              style={[styles.shortcutCard, { backgroundColor: c.card, borderColor: c.border }]}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 28 }}>{sc.icon}</Text>
              <Text style={[styles.shortcutText, { color: c.text }]}>{sc.label}</Text>
              {sc.badge ? (
                <View style={[styles.badgePill, { backgroundColor: c.error }]}>
                  <Text style={{ color: '#fff', fontSize: 10, fontWeight: '800' }}>{sc.badge}</Text>
                </View>
              ) : null}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginBottom: 12,
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
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 110,
    position: 'relative',
  },
  shortcutText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 8,
  },
  badgePill: {
    position: 'absolute',
    top: 10,
    right: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
  },
});
