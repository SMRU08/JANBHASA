import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../theme';

const ACHIEVEMENTS = [
  { id: '1', title: 'First Steps', desc: 'Complete 5 lessons', icon: '🏆', color: '#F59E0B', bg: '#FEF3C7' },
  { id: '2', title: 'Word Master', desc: 'Learn 100 words', icon: '🌟', color: '#EA580C', bg: '#FFEDD5' },
  { id: '3', title: 'Practice Pro', desc: 'Practice for 1 hour', icon: '🧘', color: '#3B82F6', bg: '#DBEAFE' },
  { id: '4', title: 'Streak 17', desc: '7 day streak', icon: '🔥', color: '#EF4444', bg: '#FEE2E2' },
];

const PROGRESS_METRICS = [
  { label: 'Listening', val: '80%', color: '#8B5CF6' },
  { label: 'Speaking', val: '70%', color: '#F97316' },
  { label: 'Reading', val: '65%', color: '#3B82F6' },
  { label: 'Vocabulary', val: '75%', color: '#10B981' },
];

export function StudentProfileScreen() {
  const theme = useTheme();
  const c = theme.colors;
  const nav = useNavigation<any>();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color={c.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: c.text }]}>Profile & Achievements</Text>

        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="pencil-sharp" size={20} color={c.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={[styles.profileCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={styles.avatarWrap}>
            <Text style={{ fontSize: 32 }}>👧</Text>
          </View>

          <View style={styles.profileInfo}>
            <Text style={[styles.userName, { color: c.text }]}>Anjali Kumari</Text>
            <Text style={[styles.userEmail, { color: c.textMuted }]}>anjali123@gmail.com</Text>
            <View style={styles.activeLearnerPill}>
              <Ionicons name="shield-checkmark" size={12} color="#2563EB" />
              <Text style={styles.activeLearnerText}>Active Learner</Text>
            </View>
          </View>
        </View>

        {/* 4 Stats Metrics Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statBox, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.statNum, { color: c.text }]}>24</Text>
            <Text style={[styles.statLabel, { color: c.textMuted }]}>Lessons Completed</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.statNum, { color: c.text }]}>256</Text>
            <Text style={[styles.statLabel, { color: c.textMuted }]}>Words Learned</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.statNum, { color: c.text }]}>186</Text>
            <Text style={[styles.statLabel, { color: c.textMuted }]}>Practice Minutes</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={styles.streakRow}>
              <Ionicons name="flame" size={15} color="#F97316" />
              <Text style={[styles.statNum, { color: c.text }]}>7</Text>
            </View>
            <Text style={[styles.statLabel, { color: c.textMuted }]}>Streak Days</Text>
          </View>
        </View>

        {/* Achievements Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Achievements</Text>
          <TouchableOpacity onPress={() => nav.navigate('Badges' as any)}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.achievementsGrid}>
          {ACHIEVEMENTS.map((item) => (
            <View
              key={item.id}
              style={[styles.achievementCard, { backgroundColor: c.card, borderColor: c.border }]}
            >
              <View style={[styles.achieveIconBox, { backgroundColor: item.bg }]}>
                <Text style={{ fontSize: 24 }}>{item.icon}</Text>
              </View>
              <Text style={[styles.achieveTitle, { color: c.text }]}>{item.title}</Text>
              <Text style={[styles.achieveDesc, { color: c.textMuted }]}>{item.desc}</Text>
            </View>
          ))}
        </View>

        {/* Learning Progress Bars */}
        <View style={[styles.progressSectionCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressSectionTitle, { color: c.text }]}>Learning Progress</Text>
            <Text style={styles.overallPercent}>Overall Progress 72%</Text>
          </View>

          <View style={styles.mainProgressTrack}>
            <View style={[styles.mainProgressFill, { width: '72%' }]} />
          </View>

          <View style={styles.progressBarsGrid}>
            {PROGRESS_METRICS.map((m, idx) => (
              <View key={idx} style={styles.metricItem}>
                <View style={styles.metricHeader}>
                  <Text style={[styles.metricName, { color: c.textMuted }]}>{m.label}</Text>
                  <Text style={[styles.metricVal, { color: c.text }]}>{m.val}</Text>
                </View>
                <View style={styles.subTrack}>
                  <View style={[styles.subFill, { width: m.val as any, backgroundColor: m.color }]} />
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatarWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 17,
    fontWeight: '900',
  },
  userEmail: {
    fontSize: 12,
    marginTop: 2,
  },
  activeLearnerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 6,
  },
  activeLearnerText: {
    color: '#2563EB',
    fontSize: 10,
    fontWeight: '700',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  statBox: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 10,
    alignItems: 'center',
  },
  statNum: {
    fontSize: 15,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 8.5,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
  },
  seeAllText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  achievementCard: {
    width: (Dimensions.get('window').width - 44) / 2,
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 14,
    alignItems: 'center',
  },
  achieveIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  achieveTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 2,
  },
  achieveDesc: {
    fontSize: 10,
    textAlign: 'center',
  },
  progressSectionCard: {
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 16,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  progressSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  overallPercent: {
    fontSize: 12,
    fontWeight: '800',
    color: '#2563EB',
  },
  mainProgressTrack: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  mainProgressFill: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
  progressBarsGrid: {
    gap: 10,
  },
  metricItem: {
    gap: 4,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricName: {
    fontSize: 11,
    fontWeight: '600',
  },
  metricVal: {
    fontSize: 11,
    fontWeight: '800',
  },
  subTrack: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  subFill: {
    height: '100%',
    borderRadius: 3,
  },
});
