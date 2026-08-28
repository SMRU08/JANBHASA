import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { XPBadge, StreakBadge } from '../../components/XPBadge';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { useGamificationStore } from '../../store/gamificationStore';
import { apiRequest } from '../../services/apiClient';

export function StudentProfileScreen() {
  const theme = useTheme();
  const c = theme.colors;
  const { user, logout } = useAuthStore();
  const { totalXp, level, currentStreak } = useGamificationStore();
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const studentId = user?.student_id || 1;
    apiRequest<any>(`/api/students/${studentId}/profile`).then((res) => {
      if (res.success) {
        setProfile(res.data);
      }
    });
  }, []);

  const initials = (user?.name || 'S')
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="Student Profile 🎓" />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Avatar & Basic Info */}
        <View style={styles.avatarSection}>
          <View style={[styles.avatarCircle, { backgroundColor: c.secondary }]}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <Text style={[styles.studentName, { color: c.text }]}>{user?.name || 'Student'}</Text>
          <Text style={{ color: c.textSecondary, fontSize: 13 }}>
            Student Code: #{profile?.student_code || user?.student_code || 'STU001'}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
            <XPBadge xp={totalXp} level={level} compact />
            <StreakBadge streak={currentStreak} />
          </View>
        </View>

        {/* School & Class Details */}
        <Card style={{ marginTop: 20 }}>
          <View style={styles.row}>
            <Text style={{ color: c.textSecondary }}>🏫 School</Text>
            <Text style={{ fontWeight: '700', color: c.text }}>
              {profile?.school_name || 'Govt Primary School'}
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={{ color: c.textSecondary }}>📚 Class</Text>
            <Text style={{ fontWeight: '700', color: c.text }}>
              Class {profile?.class_name || '3'} ({profile?.section || 'A'})
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={{ color: c.textSecondary }}>🌐 Selected Language</Text>
            <Text style={{ fontWeight: '700', color: c.primary }}>
              {(user?.selected_language || 'hi').toUpperCase()}
            </Text>
          </View>
        </Card>

        {/* Learning Stats */}
        <Card style={{ marginTop: 14 }}>
          <Text style={{ fontSize: 15, fontWeight: '700', color: c.text, marginBottom: 10 }}>
            Learning Record
          </Text>
          <View style={styles.row}>
            <Text style={{ color: c.textSecondary }}>Lessons Completed</Text>
            <Text style={{ fontWeight: '700', color: c.text }}>{profile?.lessons_completed || 0}</Text>
          </View>
          <View style={styles.row}>
            <Text style={{ color: c.textSecondary }}>Quizzes Passed</Text>
            <Text style={{ fontWeight: '700', color: c.text }}>{profile?.quizzes_passed || 0}</Text>
          </View>
          <View style={styles.row}>
            <Text style={{ color: c.textSecondary }}>Longest Streak</Text>
            <Text style={{ fontWeight: '700', color: c.streak }}>{profile?.longest_streak || 0} days</Text>
          </View>
        </Card>

        {/* Logout */}
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={{ color: c.error, fontWeight: '700', fontSize: 15 }}>🚪 Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  avatarSection: { alignItems: 'center', marginTop: 10 },
  avatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8
  },
  avatarText: { fontSize: 32, fontWeight: '900', color: '#fff' },
  studentName: { fontSize: 22, fontWeight: '800' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee'
  },
  logoutBtn: {
    alignItems: 'center',
    padding: 16,
    marginTop: 24
  }
});
