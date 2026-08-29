import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme';

const { width } = Dimensions.get('window');

const RECOMMENDED_ITEMS = [
  { id: '1', type: 'Lesson', title: 'पेड़ हमारे मित्र', duration: '10 min', icon: '🌲', bg: '#ECFDF5', tagColor: '#059669' },
  { id: '2', type: 'Vocabulary', title: 'पर्यावरण शब्दावली', duration: '15 min', icon: '🌿', bg: '#EFF6FF', tagColor: '#2563EB' },
  { id: '3', type: 'Practice', title: 'बोलकर सीखें', duration: '12 min', icon: '🎙️', bg: '#FAF5FF', tagColor: '#7C3AED' },
];

export function LearnDashboardScreen() {
  const theme = useTheme();
  const c = theme.colors;
  const nav = useNavigation<any>();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      {/* Top Header */}
      <View style={[styles.topBar, { borderBottomColor: c.border }]}>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="menu-outline" size={24} color={c.text} />
        </TouchableOpacity>

        <Text style={[styles.appTitle, { color: c.text }]}>JANBHASHA</Text>

        <View style={styles.topRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="search" size={20} color={c.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={20} color={c.text} />
          </TouchableOpacity>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>A</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* User Greeting */}
        <View style={styles.greetingBox}>
          <Text style={[styles.greetingTitle, { color: c.text }]}>
            Good Morning, Anjali! 👋
          </Text>
          <Text style={[styles.greetingSub, { color: c.textMuted }]}>
            Let's continue your learning journey.
          </Text>
        </View>

        {/* Hero Card with 80% Progress Ring & Study Stats */}
        <View style={styles.heroCard}>
          <LinearGradient
            colors={['#0F172A', '#1E293B', '#0B132B']}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.heroLeft}>
            <View style={styles.progressRingWrapper}>
              <View style={styles.ringCircle}>
                <Text style={styles.ringPercent}>80%</Text>
              </View>
            </View>
            <Text style={styles.ringLabel}>Keep it up!</Text>
          </View>

          <View style={styles.heroRight}>
            <View style={styles.statChip}>
              <Ionicons name="flame" size={18} color="#F97316" />
              <View>
                <Text style={styles.statChipVal}>7 Days</Text>
                <Text style={styles.statChipSub}>Streak</Text>
              </View>
            </View>

            <View style={styles.statChip}>
              <Ionicons name="time" size={18} color="#38BDF8" />
              <View>
                <Text style={styles.statChipVal}>42 Min</Text>
                <Text style={styles.statChipSub}>Study Time</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 4 Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.statBoxVal, { color: c.text }]}>12</Text>
            <Text style={[styles.statBoxLabel, { color: c.textMuted }]}>Lessons Completed</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.statBoxVal, { color: c.text }]}>148</Text>
            <Text style={[styles.statBoxLabel, { color: c.textMuted }]}>Words Learned</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.statBoxVal, { color: c.text }]}>18</Text>
            <Text style={[styles.statBoxLabel, { color: c.textMuted }]}>Practice Sessions</Text>
          </View>
          <View style={[styles.statBox, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.statBoxVal, { color: c.text }]}>9</Text>
            <Text style={[styles.statBoxLabel, { color: c.textMuted }]}>Quizzes Attempted</Text>
          </View>
        </View>

        {/* Continue Learning Section */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Continue Learning</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.continueCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={styles.continueThumb}>
            <Text style={{ fontSize: 26 }}>🌊</Text>
          </View>

          <View style={styles.continueInfo}>
            <Text style={styles.subjectTag}>Science</Text>
            <Text style={[styles.lessonTitle, { color: c.text }]}>जल संरक्षण का महत्व</Text>
            <View style={styles.miniTrack}>
              <View style={[styles.miniProgress, { width: '75%' }]} />
            </View>
          </View>

          <TouchableOpacity
            onPress={() => nav.navigate('VoiceAiListening' as any)}
            style={styles.continueBtn}
          >
            <Text style={styles.continueBtnText}>Continue</Text>
          </TouchableOpacity>
        </View>

        {/* Recommended For You */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Recommended for You</Text>
          <TouchableOpacity>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.recommendedScroll}>
          {RECOMMENDED_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.recCard, { backgroundColor: c.card, borderColor: c.border }]}
              activeOpacity={0.85}
            >
              <View style={[styles.recIconWrap, { backgroundColor: item.bg }]}>
                <Text style={{ fontSize: 28 }}>{item.icon}</Text>
              </View>
              <View style={[styles.recTagBadge, { backgroundColor: item.bg }]}>
                <Text style={[styles.recTagText, { color: item.tagColor }]}>{item.type}</Text>
              </View>
              <Text style={[styles.recTitle, { color: c.text }]}>{item.title}</Text>
              <Text style={[styles.recDuration, { color: c.textMuted }]}>⏱️ {item.duration}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  iconBtn: {
    padding: 6,
  },
  appTitle: {
    fontSize: 18,
    fontWeight: '900',
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  greetingBox: {
    marginBottom: 16,
  },
  greetingTitle: {
    fontSize: 20,
    fontWeight: '900',
  },
  greetingSub: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: 2,
  },
  heroCard: {
    borderRadius: 24,
    overflow: 'hidden',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  heroLeft: {
    alignItems: 'center',
  },
  progressRingWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 6,
    borderColor: '#38BDF8',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCircle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringPercent: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
  },
  ringLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 6,
  },
  heroRight: {
    gap: 10,
  },
  statChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  statChipVal: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  statChipSub: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
  },
  statsGrid: {
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
  statBoxVal: {
    fontSize: 16,
    fontWeight: '900',
  },
  statBoxLabel: {
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
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
  continueCard: {
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  continueThumb: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  continueInfo: {
    flex: 1,
  },
  subjectTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0284C7',
    textTransform: 'uppercase',
  },
  lessonTitle: {
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
  },
  miniTrack: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 2,
    marginTop: 6,
    overflow: 'hidden',
  },
  miniProgress: {
    height: '100%',
    backgroundColor: '#10B981',
  },
  continueBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  recommendedScroll: {
    gap: 12,
  },
  recCard: {
    width: 140,
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 12,
  },
  recIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  recTagBadge: {
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginBottom: 6,
  },
  recTagText: {
    fontSize: 9,
    fontWeight: '800',
  },
  recTitle: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 4,
  },
  recDuration: {
    fontSize: 10,
    fontWeight: '600',
  },
});
