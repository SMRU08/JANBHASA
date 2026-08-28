import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';
import { AnalyticsCard } from '../../components/OfflineBanner';
import { ProgressCircle } from '../../components/ProgressCircle';
import { Card } from '../../components/Card';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { apiRequest } from '../../services/apiClient';

export function TeacherAnalyticsScreen() {
  const theme = useTheme(); const c = theme.colors;
  const { user } = useAuthStore();
  const [data, setData] = useState<any>(null);
  useEffect(() => {
    apiRequest<any>(`/api/teachers/${user?.teacher_id || 1}/analytics`).then(r => { if (r.success) setData(r.data); });
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="Class Analytics" subtitle="कक्षा विश्लेषण" />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={styles.row}>
          <AnalyticsCard title="Avg XP" value={data ? Math.round(data.avg_xp) : '--'} icon="⭐" color={c.xp} />
          <AnalyticsCard title="Avg Streak" value={data ? `${Math.round(data.avg_streak)}d` : '--'} icon="🔥" color={c.streak} />
        </View>

        <Card style={{ marginTop: 16 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: c.text, marginBottom: 14 }}>Top Lessons by Completion</Text>
          {(data?.top_lessons || []).slice(0, 5).map((lesson: any, i: number) => (
            <View key={i} style={styles.lessonRow}>
              <Text style={{ color: c.text, fontSize: 14, flex: 1 }}>📚 {lesson.title}</Text>
              <Text style={{ color: c.primary, fontWeight: '700', fontSize: 13 }}>{lesson.completions} done</Text>
            </View>
          ))}
          {(!data?.top_lessons || data.top_lessons.length === 0) && <Text style={{ color: c.textMuted }}>No data yet</Text>}
        </Card>

        <Card style={{ marginTop: 12 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: c.text, marginBottom: 12 }}>💡 Insights</Text>
          <Text style={{ color: c.textSecondary, fontSize: 13, lineHeight: 22 }}>
            • Students with streaks &gt; 7 days show 40% better retention.{'\n'}
            • Flashcard sessions improve vocabulary by 60%.{'\n'}
            • Morning quizzes (7-9AM) have highest completion rates.
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

export function TeacherProfileScreen() {
  const theme = useTheme(); const c = theme.colors;
  const { user, logout } = useAuthStore();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="My Profile" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <View style={[styles.avatar, { backgroundColor: c.primaryLight }]}>
            <Text style={{ fontSize: 40 }}>👩‍🏫</Text>
          </View>
          <Text style={{ fontSize: 22, fontWeight: '800', color: c.text, marginTop: 12 }}>{user?.name}</Text>
          <Text style={{ color: c.primary, fontWeight: '700', marginTop: 4 }}>✅ Verified Teacher</Text>
        </View>
        <Card>
          {[['📧 Email', user?.email || '--'], ['📱 Phone', user?.phone || '--'], ['🌐 Language', user?.selected_language?.toUpperCase() || 'HI']].map(([k, v]) => (
            <View key={k} style={styles.profileRow}>
              <Text style={{ color: c.textSecondary }}>{k}</Text>
              <Text style={{ color: c.text, fontWeight: '600' }}>{v}</Text>
            </View>
          ))}
        </Card>
        <View style={{ marginTop: 24 }}>
          <Text onPress={logout} style={{ color: c.error, fontWeight: '700', fontSize: 15, textAlign: 'center', padding: 16 }}>🚪 Logout</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row' },
  lessonRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
  avatar: { width: 88, height: 88, borderRadius: 44, alignItems: 'center', justifyContent: 'center' },
  profileRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: '#eee' },
});
