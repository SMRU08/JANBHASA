import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import { JanbhashaTheme } from '../../theme/janbhashaTheme';
import { JanbhashaHeader } from '../../components/common/JanbhashaHeader';
import { BottomNavBar } from '../../components/common/BottomNavBar';
import { useAppStore, AppScreen } from '../../store/useAppStore';

export const TeacherDashboardScreen: React.FC = () => {
  const { navigate, refreshHealth, health, audioOutput, selectedBluetoothDevice } = useAppStore();

  useEffect(() => {
    refreshHealth();
  }, [refreshHealth]);

  const cards: Array<{
    title: string;
    sub: string;
    icon: string;
    badge?: string;
    target: AppScreen;
    accentColor: string;
  }> = [
    {
      title: 'Live Translation',
      sub: 'Speak Hindi → Hear Santali Ol Chiki',
      icon: '🎙️',
      badge: 'PRIMARY',
      target: 'LiveTranslation',
      accentColor: JanbhashaTheme.colors.deepGreen,
    },
    {
      title: 'Classroom Broadcast',
      sub: 'Broadcast live audio to student tablets',
      icon: '📡',
      target: 'Classroom',
      accentColor: JanbhashaTheme.colors.warmOrange,
    },
    {
      title: 'Curriculum Library',
      sub: 'Grade 1-5 bilingual syllabus & stories',
      icon: '📚',
      target: 'Curriculum',
      accentColor: '#2563EB',
    },
    {
      title: 'Worksheets',
      sub: 'Match pictures, generate printable PDF',
      icon: '📝',
      target: 'Worksheets',
      accentColor: '#059669',
    },
    {
      title: 'Flashcards',
      sub: 'Interactive Ol Chiki vocabulary & audio',
      icon: '🃏',
      target: 'Flashcards',
      accentColor: '#D97706',
    },
    {
      title: 'Settings',
      sub: 'Audio output, Bluetooth, model telemetry',
      icon: '⚙️',
      target: 'Settings',
      accentColor: '#475569',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={JanbhashaTheme.colors.creamBg} barStyle="dark-content" />
      <JanbhashaHeader
        rightAction={
          <TouchableOpacity
            style={styles.modelStatusPill}
            onPress={() => navigate('ModelStatus')}
            activeOpacity={0.7}
          >
            <View style={[styles.statusDot, { backgroundColor: health ? '#10B981' : '#F59E0B' }]} />
            <Text style={styles.statusPillText}>
              {health ? 'AI Models Ready' : 'Connecting AI...'}
            </Text>
          </TouchableOpacity>
        }
      />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.welcomeBanner}>
          <Text style={styles.welcomeTitle}>Teacher Dashboard</Text>
          <Text style={styles.welcomeSub}>Welcome, Teacher! • ᱡᱚᱦᱟᱨ ᱢᱟᱪᱮᱛ !</Text>
          <Text style={styles.welcomeInfo}>
            Ready to bridge classroom instruction into Santali (Ol Chiki) mother-tongue.
          </Text>
        </View>

        <View style={styles.grid}>
          {cards.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.card}
              onPress={() => navigate(item.target)}
              activeOpacity={0.82}
            >
              {item.badge && (
                <View style={styles.cardBadge}>
                  <Text style={styles.cardBadgeText}>{item.badge}</Text>
                </View>
              )}
              <View style={[styles.cardIconBox, { backgroundColor: item.accentColor + '15' }]}>
                <Text style={styles.cardIcon}>{item.icon}</Text>
              </View>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardSub} numberOfLines={2}>
                {item.sub}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.quickAccessCard}>
          <View style={styles.quickLeft}>
            <Text style={styles.quickEmoji}>{audioOutput === 'bluetooth' ? '🎧' : '🔊'}</Text>
            <View>
              <Text style={styles.quickTitle}>Audio Output</Text>
              <Text style={styles.quickSub}>
                {audioOutput === 'bluetooth'
                  ? `Mode 2: Bluetooth (${selectedBluetoothDevice?.name || 'Active'})`
                  : 'Mode 1: Device Speaker (Built-in Active)'}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.quickBtn}
            onPress={() => navigate('AudioOutput')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickBtnText}>Change →</Text>
          </TouchableOpacity>
        </View>
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
  modelStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: JanbhashaTheme.colors.white,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.cardBorder,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: JanbhashaTheme.colors.charcoalText,
  },
  welcomeBanner: {
    marginBottom: 20,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: JanbhashaTheme.colors.charcoalText,
    marginBottom: 4,
  },
  welcomeSub: {
    fontSize: 15,
    fontWeight: '700',
    color: JanbhashaTheme.colors.deepGreen,
    marginBottom: 6,
  },
  welcomeInfo: {
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
    position: 'relative',
    minHeight: 145,
  },
  cardBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: JanbhashaTheme.colors.mintTag,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  cardBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: JanbhashaTheme.colors.deepGreen,
  },
  cardIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardIcon: {
    fontSize: 24,
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
  quickAccessCard: {
    marginTop: 20,
    backgroundColor: JanbhashaTheme.colors.white,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.cardBorder,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quickLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickEmoji: {
    fontSize: 24,
    marginRight: 12,
  },
  quickTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: JanbhashaTheme.colors.charcoalText,
  },
  quickSub: {
    fontSize: 11,
    color: JanbhashaTheme.colors.mutedText,
  },
  quickBtn: {
    backgroundColor: JanbhashaTheme.colors.creamBgLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.cardBorder,
  },
  quickBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: JanbhashaTheme.colors.deepGreen,
  },
});
