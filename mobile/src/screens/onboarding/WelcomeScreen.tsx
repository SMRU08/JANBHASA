import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { JanbhashaTheme } from '../../theme/janbhashaTheme';
import { useAppStore } from '../../store/useAppStore';
import { welcome_backdrop } from '../../assets/images';

export const WelcomeScreen: React.FC = () => {
  const { navigate } = useAppStore();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={JanbhashaTheme.colors.surface} barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Top Hero Backdrop */}
        <View style={styles.backdropContainer}>
          <Image
            source={welcome_backdrop}
            style={styles.backdropImage}
            resizeMode="cover"
          />
          <View style={styles.backdropOverlay} />
        </View>

        {/* Brand Card */}
        <View style={styles.brandCard}>
          <View style={styles.sproutBadge}>
            <Text style={{ fontSize: 28 }}>🌱</Text>
          </View>
          <Text style={styles.brandTitle}>
            <Text style={{ color: JanbhashaTheme.colors.primary }}>JAN</Text>
            <Text style={{ color: JanbhashaTheme.colors.secondary }}>BHASHA</Text>
          </Text>
          <Text style={styles.subTagline}>
            भाषा से विकास • ᱯᱟᱹᱨᱥᱤ ᱛᱮ ᱞᱟᱦᱟᱱᱛᱤ
          </Text>
          <Text style={styles.description}>
            AI-Powered Vernacular Pedagogy Bridge for Mother-Tongue Learning in Tribal & Rural Classrooms.
          </Text>
        </View>

        {/* Core Pillars / Feature Bento */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureCard}>
            <View style={[styles.featureIconBox, { backgroundColor: JanbhashaTheme.colors.mintTag }]}>
              <Text style={{ fontSize: 24 }}>🧠</Text>
            </View>
            <View style={styles.featureTextCol}>
              <Text style={styles.featureTitle}>100% Offline AI Pipeline</Text>
              <Text style={styles.featureDesc}>
                Whisper STT + IndicTrans2 NMT + Piper VITS TTS run fully on-device. Zero cloud or internet needed.
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={[styles.featureIconBox, { backgroundColor: JanbhashaTheme.colors.secondaryFixed }]}>
              <Text style={{ fontSize: 24 }}>📡</Text>
            </View>
            <View style={styles.featureTextCol}>
              <Text style={styles.featureTitle}>Local Classroom Broadcast</Text>
              <Text style={styles.featureDesc}>
                Stream audio lessons to Bluetooth soundbars or sync peer-to-peer over local hotspot without mobile data.
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={[styles.featureIconBox, { backgroundColor: JanbhashaTheme.colors.tertiaryFixed }]}>
              <Text style={{ fontSize: 24 }}>📚</Text>
            </View>
            <View style={styles.featureTextCol}>
              <Text style={styles.featureTitle}>Culturally Rooted FLN Pedagogy</Text>
              <Text style={styles.featureDesc}>
                Bilingual Grade 1-5 curriculum in Hindi and Santali Ol Chiki, designed under NEP 2020 guidelines.
              </Text>
            </View>
          </View>
        </View>

        {/* Footer CTA */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => navigate('LanguageSelection')}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>Continue / आगे बढ़ें →</Text>
          </TouchableOpacity>
          <Text style={styles.guaranteeText}>
            Tested for low-cost Android phones with 2 GB RAM
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: JanbhashaTheme.colors.surface,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  backdropContainer: {
    width: '100%',
    height: 190,
    position: 'relative',
  },
  backdropImage: {
    width: '100%',
    height: '100%',
  },
  backdropOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(251, 249, 249, 0.45)',
  },
  brandCard: {
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLowest,
    marginHorizontal: JanbhashaTheme.spacing.marginMobile,
    marginTop: -40,
    borderRadius: JanbhashaTheme.borderRadius.xl,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.outlineVariant,
    elevation: 3,
    shadowColor: JanbhashaTheme.colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  sproutBadge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: JanbhashaTheme.colors.mintTag,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  subTagline: {
    fontSize: 14,
    fontWeight: '700',
    color: JanbhashaTheme.colors.primary,
    marginTop: 4,
    marginBottom: 8,
  },
  description: {
    fontSize: 12,
    color: JanbhashaTheme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 18,
  },
  featuresContainer: {
    paddingHorizontal: JanbhashaTheme.spacing.marginMobile,
    marginTop: 20,
    gap: 12,
  },
  featureCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLowest,
    borderRadius: JanbhashaTheme.borderRadius.lg,
    padding: 16,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.outlineVariant,
    elevation: 1,
  },
  featureIconBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  featureTextCol: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: JanbhashaTheme.colors.onSurface,
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 11,
    color: JanbhashaTheme.colors.onSurfaceVariant,
    lineHeight: 16,
  },
  footer: {
    paddingHorizontal: JanbhashaTheme.spacing.marginMobile,
    marginTop: 24,
    alignItems: 'center',
  },
  ctaButton: {
    backgroundColor: JanbhashaTheme.colors.primary,
    paddingVertical: 16,
    borderRadius: JanbhashaTheme.borderRadius.full,
    width: '100%',
    alignItems: 'center',
    elevation: 3,
  },
  ctaText: {
    color: JanbhashaTheme.colors.onPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  guaranteeText: {
    fontSize: 11,
    color: JanbhashaTheme.colors.outline,
    marginTop: 10,
    fontWeight: '600',
  },
});
