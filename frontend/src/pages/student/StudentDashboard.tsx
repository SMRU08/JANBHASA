import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme';
import { LiveWaveform } from '../../components/LiveWaveform';

const { width } = Dimensions.get('window');

const FEATURE_CARDS = [
  { id: 'ai-translate', title: 'AI Translator', icon: 'language', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)', route: 'TranslationResult' },
  { id: 'voice-ai', title: 'Voice AI', icon: 'mic', color: '#2563EB', bg: 'rgba(37, 99, 235, 0.1)', route: 'VoiceAiListening' },
  { id: 'ai-tutor', title: 'AI Tutor', icon: 'bulb', color: '#06B6D4', bg: 'rgba(6, 182, 212, 0.1)', route: 'AI' },
  { id: 'ocr', title: 'OCR Learning', icon: 'scan', color: '#059669', bg: 'rgba(5, 150, 105, 0.1)', route: 'OCRScanner' },
  { id: 'content', title: 'Smart Content', icon: 'book', color: '#8B5CF6', bg: 'rgba(139, 92, 246, 0.1)', route: 'Learn' },
  { id: 'offline', title: 'Offline Learning', icon: 'cloud-download', color: '#0284C7', bg: 'rgba(2, 132, 199, 0.1)', route: 'OfflineMode' },
];

export function StudentDashboard() {
  const theme = useTheme();
  const c = theme.colors;
  const nav = useNavigation<any>();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      {/* Top App Bar */}
      <View style={[styles.topBar, { borderBottomColor: c.border }]}>
        <TouchableOpacity style={styles.iconBtn}>
          <Ionicons name="menu-outline" size={24} color={c.text} />
        </TouchableOpacity>

        <Text style={[styles.appTitle, { color: c.text }]}>JANBHASHA</Text>

        <View style={styles.topRight}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="notifications-outline" size={22} color={c.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => nav.navigate('StudentProfile' as any)}
            style={styles.avatarBtn}
          >
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>R</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* User Greeting */}
        <View style={styles.greetingBox}>
          <Text style={[styles.greetingTitle, { color: c.text }]}>
            Good Morning, Rahul! 👋
          </Text>
          <Text style={[styles.greetingSub, { color: c.textMuted }]}>
            Let's continue your learning journey today.
          </Text>
        </View>

        {/* Hero Banner Card */}
        <View style={styles.heroCard}>
          <LinearGradient
            colors={['#0F172A', '#1E293B', '#0F2942']}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.heroContent}>
            <Text style={styles.heroTitle}>Learning has no{'\n'}language barrier.</Text>
            <Text style={styles.heroSub}>
              AI connects Hindi with your mother tongue.
            </Text>

            <View style={styles.heroButtonsRow}>
              <TouchableOpacity
                onPress={() => nav.navigate('VoiceAiListening' as any)}
                style={styles.startLearningBtn}
                activeOpacity={0.85}
              >
                <Text style={styles.startLearningBtnText}>Start Learning</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => nav.navigate('TranslationResult' as any)}
                style={styles.translateGhostBtn}
                activeOpacity={0.85}
              >
                <Text style={styles.translateGhostBtnText}>Translate</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Audio Waveform Accent */}
          <View style={styles.heroWaveWrapper}>
            <LiveWaveform state="speaking" height={60} barCount={18} width={130} />
          </View>
        </View>

        {/* Features Header */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Features</Text>
          <TouchableOpacity onPress={() => nav.navigate('LanguageSelection' as any)}>
            <Text style={styles.seeAllText}>See All</Text>
          </TouchableOpacity>
        </View>

        {/* 6 Features Grid */}
        <View style={styles.featuresGrid}>
          {FEATURE_CARDS.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => nav.navigate(item.route as any)}
              style={[styles.featureCard, { backgroundColor: c.card, borderColor: c.border }]}
              activeOpacity={0.85}
            >
              <View style={[styles.featureIconCircle, { backgroundColor: item.bg }]}>
                <Ionicons name={item.icon as any} size={22} color={item.color} />
              </View>
              <Text style={[styles.featureTitle, { color: c.text }]}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Today's Progress Section */}
        <View style={[styles.progressCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={styles.progressHeader}>
            <Text style={[styles.progressTitle, { color: c.text }]}>Today's Progress</Text>
            <Text style={styles.progressPercent}>80%</Text>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBarTrack}>
            <LinearGradient
              colors={['#3B82F6', '#10B981']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: '80%' }]}
            />
          </View>

          {/* 4 Stats Grid */}
          <View style={styles.statsRow}>
            <View style={styles.statCol}>
              <Text style={[styles.statNumber, { color: c.text }]}>12</Text>
              <Text style={[styles.statLabel, { color: c.textMuted }]}>Lessons Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={[styles.statNumber, { color: c.text }]}>148</Text>
              <Text style={[styles.statLabel, { color: c.textMuted }]}>Words Learned</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={[styles.statNumber, { color: c.text }]}>42</Text>
              <Text style={[styles.statLabel, { color: c.textMuted }]}>Practice Min</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <View style={styles.streakValRow}>
                <Ionicons name="flame" size={16} color="#F97316" />
                <Text style={[styles.statNumber, { color: c.text }]}>7</Text>
              </View>
              <Text style={[styles.statLabel, { color: c.textMuted }]}>Streak Days</Text>
            </View>
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
    letterSpacing: 0.5,
  },
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatarBtn: {
    padding: 2,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 14,
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
    minHeight: 160,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  heroContent: {
    flex: 1,
    zIndex: 2,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    lineHeight: 24,
  },
  heroSub: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '500',
    marginVertical: 8,
  },
  heroButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  startLearningBtn: {
    backgroundColor: '#2563EB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  startLearningBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  translateGhostBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  translateGhostBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  heroWaveWrapper: {
    width: 120,
    alignItems: 'center',
    justifyContent: 'center',
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
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  featureCard: {
    width: (width - 52) / 3,
    borderRadius: 18,
    borderWidth: 1.5,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  progressCard: {
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
  progressTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  progressPercent: {
    fontSize: 14,
    fontWeight: '900',
    color: '#10B981',
  },
  progressBarTrack: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.06)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 16,
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 16,
    fontWeight: '900',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  streakValRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
});
