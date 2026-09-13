import React, { useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, Image } from 'react-native';
import { JanbhashaTheme } from '../../theme/janbhashaTheme';
import { useAppStore } from '../../store/useAppStore';
import { village_school_banyan } from '../../assets/images';

export const SplashScreen: React.FC = () => {
  const { navigate, refreshHealth } = useAppStore();

  useEffect(() => {
    refreshHealth();
    const timer = setTimeout(() => {
      navigate('Welcome');
    }, 2800);
    return () => clearTimeout(timer);
  }, [navigate, refreshHealth]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={JanbhashaTheme.colors.surface} barStyle="dark-content" />
      <View style={styles.content}>
        {/* Header Branding */}
        <View style={styles.headerArea}>
          <View style={styles.sproutBadge}>
            <Text style={styles.sproutEmoji}>🌱</Text>
          </View>
          <Text style={styles.brandTitle}>
            <Text style={{ color: JanbhashaTheme.colors.primary }}>JAN</Text>
            <Text style={{ color: JanbhashaTheme.colors.secondary }}>BHASHA</Text>
          </Text>
          <Text style={styles.tagline}>Bridging Languages • Empowering Communities</Text>
          <Text style={styles.olChikiTagline}>ᱯᱟᱹᱨᱥᱤ ᱛᱮ ᱞᱟᱦᱟᱱᱛᱤ • ᱥᱮᱪᱮᱫ ᱨᱮᱱᱟᱜ ᱥᱟᱹᱜᱟᱹᱭ</Text>
        </View>

        {/* High-fidelity Tactile Hero Card */}
        <View style={styles.illustrationCard}>
          <Image
            source={village_school_banyan}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <View style={styles.overlayTextContainer}>
            <Text style={styles.visionTitle}>Bhasha se Vikas, Sabke Liye Shiksha</Text>
            <Text style={styles.visionSubtitle}>
              100% Offline AI Vernacular Pedagogy for Hindi ↔ Santali Primary Education (NEP 2020)
            </Text>
          </View>
        </View>

        {/* Bottom Actions */}
        <View style={styles.footerArea}>
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={() => navigate('Welcome')}
            activeOpacity={0.85}
          >
            <Text style={styles.continueText}>Get Started / सुरु करा →</Text>
          </TouchableOpacity>
          <Text style={styles.footerTag}>
            100% Air-Gapped Offline AI • Whisper + IndicTrans2 + Piper VITS
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: JanbhashaTheme.colors.surface,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  headerArea: {
    alignItems: 'center',
    marginTop: 10,
  },
  sproutBadge: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: JanbhashaTheme.colors.mintTag,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    elevation: 2,
  },
  sproutEmoji: {
    fontSize: 32,
  },
  brandTitle: {
    fontSize: 34,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 13,
    color: JanbhashaTheme.colors.onSurfaceVariant,
    fontWeight: '600',
    letterSpacing: 0.3,
    textAlign: 'center',
  },
  olChikiTagline: {
    fontFamily: JanbhashaTheme.fonts.olChikiBold,
    fontSize: 14,
    color: JanbhashaTheme.colors.primary,
    marginTop: 4,
    textAlign: 'center',
  },
  illustrationCard: {
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLowest,
    borderRadius: JanbhashaTheme.borderRadius.xl,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.outlineVariant,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: JanbhashaTheme.colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    marginVertical: 16,
  },
  heroImage: {
    width: '100%',
    height: 200,
  },
  overlayTextContainer: {
    padding: 18,
    alignItems: 'center',
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLow,
  },
  visionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: JanbhashaTheme.colors.primary,
    marginBottom: 6,
    textAlign: 'center',
  },
  visionSubtitle: {
    fontSize: 12,
    color: JanbhashaTheme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerArea: {
    alignItems: 'center',
    marginBottom: 8,
  },
  continueBtn: {
    backgroundColor: JanbhashaTheme.colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 36,
    borderRadius: JanbhashaTheme.borderRadius.full,
    width: '100%',
    alignItems: 'center',
    elevation: 3,
    marginBottom: 12,
  },
  continueText: {
    color: JanbhashaTheme.colors.onPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  footerTag: {
    fontSize: 11,
    color: JanbhashaTheme.colors.outline,
    fontWeight: '600',
    textAlign: 'center',
  },
});
