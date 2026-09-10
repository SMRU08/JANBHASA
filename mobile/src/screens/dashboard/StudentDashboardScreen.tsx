import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import { JanbhashaTheme } from '../../theme/janbhashaTheme';
import { JanbhashaHeader } from '../../components/common/JanbhashaHeader';
import { BottomNavBar } from '../../components/common/BottomNavBar';
import { useAppStore, AppScreen } from '../../store/useAppStore';

export const StudentDashboardScreen: React.FC = () => {
  const { navigate } = useAppStore();

  const studentCards: Array<{
    title: string;
    sub: string;
    icon: string;
    target: AppScreen;
    accentColor: string;
  }> = [
    {
      title: 'Translate',
      sub: 'Speak & see words in Ol Chiki',
      icon: '🎙️',
      target: 'LiveTranslation',
      accentColor: JanbhashaTheme.colors.deepGreen,
    },
    {
      title: 'Join Classroom',
      sub: 'Listen to live teacher translation',
      icon: '🎒',
      target: 'StudentClassroom',
      accentColor: JanbhashaTheme.colors.warmOrange,
    },
    {
      title: 'My Lessons',
      sub: 'Stories & science in our language',
      icon: '📖',
      target: 'Curriculum',
      accentColor: '#2563EB',
    },
    {
      title: 'Worksheets',
      sub: 'Match pictures & learn words',
      icon: '📝',
      target: 'Worksheets',
      accentColor: '#059669',
    },
    {
      title: 'Flashcards',
      sub: 'Picture cards with audio pronunciation',
      icon: '🃏',
      target: 'Flashcards',
      accentColor: '#D97706',
    },
    {
      title: 'Progress',
      sub: 'Your learning stamps & badges',
      icon: '⭐',
      target: 'Profile',
      accentColor: '#7C3AED',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={JanbhashaTheme.colors.creamBg} barStyle="dark-content" />
      <JanbhashaHeader
        rightAction={
          <View style={styles.studentBadge}>
            <Text style={styles.badgeText}>Grade 1-5 FLN</Text>
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeCard}>
          <Text style={styles.greetingTitle}>Student Dashboard</Text>
          <Text style={styles.greetingSub}>Welcome, Learner! • ᱡᱚᱦᱟᱨ ᱪᱮᱛᱮᱫᱤᱭᱟᱹ !</Text>
          <Text style={styles.greetingDesc}>
            Learn school concepts in your mother tongue Santali (Ol Chiki) with pictures and joyful audio!
          </Text>
        </View>

        <View style={styles.grid}>
          {studentCards.map((c, i) => (
            <TouchableOpacity
              key={i}
              style={styles.card}
              onPress={() => navigate(c.target)}
              activeOpacity={0.82}
            >
              <View style={[styles.iconBox, { backgroundColor: c.accentColor + '15' }]}>
                <Text style={styles.cardIcon}>{c.icon}</Text>
              </View>
              <Text style={styles.cardTitle}>{c.title}</Text>
              <Text style={styles.cardSub} numberOfLines={2}>
                {c.sub}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          style={styles.liveBanner}
          onPress={() => navigate('StudentClassroom')}
          activeOpacity={0.85}
        >
          <View style={styles.liveBannerLeft}>
            <View style={styles.liveDot} />
            <View>
              <Text style={styles.liveBannerTitle}>Live Classroom Broadcast</Text>
              <Text style={styles.liveBannerSub}>Tap to join today's teacher session</Text>
            </View>
          </View>
          <Text style={styles.joinArrow}>Join →</Text>
        </TouchableOpacity>
      </ScrollView>

      <BottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: JanbhashaTheme.colors.creamBg,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 24,
  },
  studentBadge: {
    backgroundColor: JanbhashaTheme.colors.mintTag,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.cardBorder,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: JanbhashaTheme.colors.deepGreen,
  },
  welcomeCard: {
    marginBottom: 20,
  },
  greetingTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: JanbhashaTheme.colors.charcoalText,
    marginBottom: 4,
  },
  greetingSub: {
    fontSize: 15,
    fontWeight: '700',
    color: JanbhashaTheme.colors.deepGreen,
    marginBottom: 6,
  },
  greetingDesc: {
    fontSize: 13,
    color: JanbhashaTheme.colors.mutedText,
    lineHeight: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
  },
  card: {
    width: '48%',
    backgroundColor: JanbhashaTheme.colors.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.cardBorder,
    padding: 16,
    elevation: 2,
    shadowColor: JanbhashaTheme.colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    minHeight: 135,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  cardIcon: {
    fontSize: 22,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: JanbhashaTheme.colors.charcoalText,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 11,
    color: JanbhashaTheme.colors.mutedText,
    lineHeight: 15,
  },
  liveBanner: {
    marginTop: 20,
    backgroundColor: JanbhashaTheme.colors.white,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.deepGreen,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
  },
  liveBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    marginRight: 12,
  },
  liveBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: JanbhashaTheme.colors.charcoalText,
  },
  liveBannerSub: {
    fontSize: 11,
    color: JanbhashaTheme.colors.mutedText,
  },
  joinArrow: {
    fontSize: 13,
    fontWeight: '800',
    color: JanbhashaTheme.colors.deepGreen,
  },
});
