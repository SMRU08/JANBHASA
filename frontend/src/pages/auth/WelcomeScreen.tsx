import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from '../../components/LanguageSelector';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme';
import { useLanguageStore } from '../../store/languageStore';
import { SUPPORTED_LANGUAGES } from '../../locales/i18n';

export function WelcomeScreen() {
  const theme = useTheme();
  const c = theme.colors;
  const { t } = useTranslation();
  const nav = useNavigation<any>();
  const { selectedLanguage, setSelectedLanguage } = useLanguageStore();
  const [selected, setSelected] = useState(selectedLanguage || 'hi');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setLoading(true);
    await setSelectedLanguage(selected);
    setLoading(false);
    nav.navigate('RoleSelection');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Cultural Hero Header */}
        <View style={styles.heroSection}>
          <View style={[styles.logoBadge, { backgroundColor: c.primaryLight }]}>
            <Text style={styles.logoEmoji}>🏫</Text>
          </View>
          <Text style={[styles.appTitle, { color: c.text }]}>JANBHASHA</Text>
          <View style={[styles.hindiPill, { backgroundColor: c.secondaryLight }]}>
            <Text style={[styles.hindiTitle, { color: c.secondaryDark }]}>जनभाषा • ᱡᱳᱦᱟᱨ • ଓଡ଼ିଆ</Text>
          </View>
          <Text style={[styles.tagline, { color: c.textSecondary }]}>
            "Teach in Hindi. Learn in Your Mother Tongue."
          </Text>
        </View>

        {/* Language Selection Card */}
        <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.sectionIcon, { color: c.primary }]}>🌐</Text>
            <View>
              <Text style={[styles.sectionTitle, { color: c.text }]}>
                {t('welcome.select_language')}
              </Text>
              <Text style={[styles.sectionSub, { color: c.textSecondary }]}>
                Choose your native language for lessons and audio
              </Text>
            </View>
          </View>

          <LanguageSelector
            languages={SUPPORTED_LANGUAGES}
            selected={selected}
            onSelect={setSelected}
            columns={2}
          />
        </View>

        <View style={{ height: 20 }} />

        {/* Action Button */}
        <Button
          title={t('welcome.continue')}
          onPress={handleContinue}
          loading={loading}
          disabled={!selected}
          fullWidth
          size="lg"
          icon="arrow-forward"
          iconPosition="right"
        />

        {/* Trust Badges */}
        <View style={styles.badgeRow}>
          <View style={[styles.microBadge, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Text style={{ fontSize: 13 }}>🔒</Text>
            <Text style={[styles.microText, { color: c.textSecondary }]}>100% Offline</Text>
          </View>
          <View style={[styles.microBadge, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Text style={{ fontSize: 13 }}>🇮🇳</Text>
            <Text style={[styles.microText, { color: c.textSecondary }]}>NEP 2020 Aligned</Text>
          </View>
          <View style={[styles.microBadge, { backgroundColor: c.surface, borderColor: c.border }]}>
            <Text style={{ fontSize: 13 }}>❤️</Text>
            <Text style={[styles.microText, { color: c.textSecondary }]}>Free Education</Text>
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
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  heroSection: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  logoBadge: {
    width: 80,
    height: 80,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 3,
  },
  logoEmoji: {
    fontSize: 44,
  },
  appTitle: {
    fontSize: 30,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  hindiPill: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
    marginBottom: 8,
  },
  hindiTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  tagline: {
    fontSize: 14,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 20,
    marginTop: 2,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1.5,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
    gap: 10,
  },
  sectionIcon: {
    fontSize: 26,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  sectionSub: {
    fontSize: 12,
    marginTop: 2,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginTop: 24,
  },
  microBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
  },
  microText: {
    fontSize: 11,
    fontWeight: '700',
  },
});
