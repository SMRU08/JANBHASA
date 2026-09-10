import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { JanbhashaTheme } from '../../theme/janbhashaTheme';
import { useAppStore } from '../../store/useAppStore';

export const SplashScreen: React.FC = () => {
  const { navigate, refreshHealth } = useAppStore();

  useEffect(() => {
    refreshHealth();
    const timer = setTimeout(() => {
      navigate('LanguageSelection');
    }, 2400);
    return () => clearTimeout(timer);
  }, [navigate, refreshHealth]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={JanbhashaTheme.colors.creamBg} barStyle="dark-content" />
      <View style={styles.content}>
        <View style={styles.headerArea}>
          <View style={styles.sproutBadge}>
            <Text style={styles.sproutEmoji}>🌱</Text>
          </View>
          <Text style={styles.brandTitle}>
            <Text style={{ color: JanbhashaTheme.colors.deepGreen }}>JAN</Text>
            <Text style={{ color: JanbhashaTheme.colors.warmOrange }}>BHASHA</Text>
          </Text>
          <Text style={styles.tagline}>Bridging Languages • Empowering Communities</Text>
        </View>

        <View style={styles.illustrationCard}>
          <View style={styles.artLandscape}>
            <Text style={styles.artEmojiRow}>☀️ ☁️ ⛰️</Text>
            <Text style={styles.artEmojiCenter}>🌳 🏫 🌳 🏡</Text>
            <Text style={styles.artEmojiChildren}>🎒 👧🏽 👦🏽 👧🏽 🎒</Text>
          </View>
          <Text style={styles.visionTitle}>Bhasha se Vikas, Sabke Liye Shiksha</Text>
          <Text style={styles.visionSubtitle}>
            AI-Powered Vernacular Pedagogy for Mother-Tongue Primary Education (NEP 2020)
          </Text>
        </View>

        <View style={styles.footerArea}>
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={() => navigate('LanguageSelection')}
            activeOpacity={0.85}
          >
            <Text style={styles.continueText}>Get Started →</Text>
          </TouchableOpacity>
          <Text style={styles.footerTag}>
            Inclusive Education • Stronger Communities • A Brighter Tomorrow
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: JanbhashaTheme.colors.creamBg,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  headerArea: {
    alignItems: 'center',
    marginTop: 20,
  },
  sproutBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: JanbhashaTheme.colors.mintTag,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  sproutEmoji: {
    fontSize: 34,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 14,
    color: JanbhashaTheme.colors.mutedText,
    fontWeight: '600',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  illustrationCard: {
    backgroundColor: JanbhashaTheme.colors.white,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.cardBorder,
    padding: 24,
    alignItems: 'center',
    elevation: 3,
    shadowColor: JanbhashaTheme.colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    marginVertical: 20,
  },
  artLandscape: {
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: JanbhashaTheme.colors.creamBgLight,
    width: '100%',
    borderRadius: 18,
    paddingVertical: 24,
  },
  artEmojiRow: {
    fontSize: 30,
    marginBottom: 8,
  },
  artEmojiCenter: {
    fontSize: 36,
    marginBottom: 8,
  },
  artEmojiChildren: {
    fontSize: 30,
  },
  visionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: JanbhashaTheme.colors.deepGreen,
    marginBottom: 8,
    textAlign: 'center',
  },
  visionSubtitle: {
    fontSize: 13,
    color: JanbhashaTheme.colors.mutedText,
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 12,
  },
  footerArea: {
    alignItems: 'center',
    marginBottom: 10,
  },
  continueBtn: {
    backgroundColor: JanbhashaTheme.colors.deepGreen,
    paddingVertical: 15,
    paddingHorizontal: 36,
    borderRadius: 30,
    width: '100%',
    alignItems: 'center',
    elevation: 3,
    marginBottom: 14,
  },
  continueText: {
    color: JanbhashaTheme.colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  footerTag: {
    fontSize: 12,
    color: JanbhashaTheme.colors.lightText,
    fontWeight: '600',
    textAlign: 'center',
  },
});
