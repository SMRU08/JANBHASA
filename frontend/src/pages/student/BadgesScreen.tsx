import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../../components/Header';
import { BadgeCard } from '../../components/BadgeCard';
import { NipunBharatEmblem, TribalMotifBar } from '../../components/VisualIllustrations';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { useGamificationStore } from '../../store/gamificationStore';
import { apiRequest } from '../../services/apiClient';

const DEFAULT_BADGES = [
  { id: 1, icon: '🌟', name_hi: 'पहला पाठ', name_en: 'First Step', description_en: 'Completed your first FLN lesson', xp_reward: 50, earned_at: '2026-08-20' },
  { id: 2, icon: '🔥', name_hi: '3 दिन स्ट्रीक', name_en: '3-Day Streak', description_en: 'Studied for 3 consecutive days', xp_reward: 100, earned_at: '2026-08-22' },
  { id: 3, icon: '🏆', name_hi: 'क्विज मास्टर', name_en: 'Quiz Master', description_en: 'Scored 100% on any FLN Quiz', xp_reward: 150, earned_at: '2026-08-25' },
  { id: 4, icon: '📖', name_hi: 'कहानी प्रेमी', name_en: 'Story Reader', description_en: 'Read 3 tribal folk tales', xp_reward: 100 },
  { id: 5, icon: '🔢', name_hi: 'गणित स्कॉलर', name_en: 'Math Wizard', description_en: 'Mastered Numbers 1-100 in Ho/Santali', xp_reward: 200 },
  { id: 6, icon: '🎙️', name_hi: 'आवाज गुरु', name_en: 'Voice Champion', description_en: 'Joined 5 live classroom broadcasts', xp_reward: 150 },
];

export function BadgesScreen() {
  const theme = useTheme();
  const c = theme.colors;
  const { user } = useAuthStore();
  const { totalXp, level } = useGamificationStore();
  const [earnedBadges, setEarnedBadges] = useState<any[]>(DEFAULT_BADGES.filter(b => b.earned_at));
  const [lockedBadges, setLockedBadges] = useState<any[]>(DEFAULT_BADGES.filter(b => !b.earned_at));

  useEffect(() => {
    const studentId = user?.student_id || 1;
    apiRequest<any>(`/api/students/${studentId}/badges`).then((res) => {
      if (res.success && res.data) {
        if (res.data.earned && res.data.earned.length > 0) setEarnedBadges(res.data.earned);
        if (res.data.locked && res.data.locked.length > 0) setLockedBadges(res.data.locked);
      }
    });
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header
        title="Achievements & Medals 🏆"
        subtitle="उपलब्धियां और सम्मान"
        variant="gradient"
        gradientColors={['#D97706', '#F59E0B']}
      />

      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
        {/* Showcase Trophy Hero */}
        <LinearGradient
          colors={theme.isDark ? ['#78350F', '#451A03'] : ['#FEF3C7', '#FDE68A']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.heroCard, { borderColor: '#F59E0B' }]}
        >
          <NipunBharatEmblem size={64} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={{ color: '#B45309', fontSize: 11, fontWeight: '900', letterSpacing: 0.5 }}>
              MEDAL SHOWCASE • LEVEL {level}
            </Text>
            <Text style={[styles.heroTitle, { color: '#78350F' }]}>
              {earnedBadges.length} of {earnedBadges.length + lockedBadges.length} Badges Unlocked
            </Text>
            <Text style={{ color: '#92400E', fontSize: 12, fontWeight: '700', marginTop: 2 }}>
              Total XP Earned: {totalXp} ⚡
            </Text>
          </View>
        </LinearGradient>

        <TribalMotifBar color={theme.isDark ? '#F59E0B' : '#D97706'} height={12} />

        {/* Unlocked Section */}
        <Text style={[styles.sectionTitle, { color: c.text }]}>
          ✨ Unlocked Trophies ({earnedBadges.length})
        </Text>
        <View style={styles.badgeGrid}>
          {earnedBadges.map((b, i) => (
            <BadgeCard key={b.id || i} badge={b} />
          ))}
        </View>

        {/* Locked Section */}
        <Text style={[styles.sectionTitle, { color: c.text, marginTop: 18 }]}>
          🔒 Next Challenges ({lockedBadges.length})
        </Text>
        <View style={styles.badgeGrid}>
          {lockedBadges.map((b, i) => (
            <BadgeCard key={b.id || i} badge={b} />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 24,
    borderWidth: 2,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  heroTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 12,
    marginTop: 8,
    letterSpacing: 0.2,
  },
  badgeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
});
