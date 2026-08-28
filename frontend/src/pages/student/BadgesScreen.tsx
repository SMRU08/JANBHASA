import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';
import { BadgeCard } from '../../components/BadgeCard';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { apiRequest } from '../../services/apiClient';

export function BadgesScreen() {
  const theme = useTheme();
  const c = theme.colors;
  const { user } = useAuthStore();
  const [earnedBadges, setEarnedBadges] = useState<any[]>([]);
  const [lockedBadges, setLockedBadges] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const studentId = user?.student_id || 1;
    apiRequest<any>(`/api/students/${studentId}/badges`).then((res) => {
      if (res.success && res.data) {
        setEarnedBadges(res.data.earned || []);
        setLockedBadges(res.data.locked || []);
      }
      setLoading(false);
    });
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="Achievements & Badges 🏆" subtitle="उपलब्धियां और बैज" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Unlocked Section */}
        <Text style={[styles.sectionTitle, { color: c.text }]}>
          ✨ Unlocked ({earnedBadges.length})
        </Text>
        {earnedBadges.length === 0 ? (
          <Text style={{ color: c.textMuted, marginBottom: 16, fontStyle: 'italic' }}>
            No badges unlocked yet. Complete lessons and quizzes to earn badges!
          </Text>
        ) : (
          <View style={styles.badgeGrid}>
            {earnedBadges.map((b, i) => (
              <BadgeCard key={i} badge={b} />
            ))}
          </View>
        )}

        {/* Locked Section */}
        <Text style={[styles.sectionTitle, { color: c.text, marginTop: 24 }]}>
          🔒 Locked ({lockedBadges.length})
        </Text>
        <View style={styles.badgeGrid}>
          {lockedBadges.map((b, i) => (
            <BadgeCard key={i} badge={b} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 17, fontWeight: '800', marginBottom: 12 },
  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' }
});
