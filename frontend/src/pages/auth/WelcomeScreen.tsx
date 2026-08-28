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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Text style={styles.logo}>🏫</Text>
        <Text style={[styles.title, { color: theme.colors.text }]}>{t('welcome.title')}</Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>{t('welcome.subtitle')}</Text>
        <View style={[styles.card, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
          <Text style={[styles.sectionLabel, { color: theme.colors.textSecondary }]}>{t('welcome.select_language')}</Text>
          <LanguageSelector languages={SUPPORTED_LANGUAGES} selected={selected} onSelect={setSelected} columns={2} />
        </View>
        <View style={{ height: 24 }} />
        <Button title={t('welcome.continue')} onPress={handleContinue} loading={loading} disabled={!selected} fullWidth size="lg" icon="arrow-forward" iconPosition="right" />
        <Text style={[styles.tagline, { color: theme.colors.textMuted }]}>Offline · Free · For Rural India 🇮🇳</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { padding: 24, paddingBottom: 40 },
  logo: { fontSize: 56, textAlign: 'center', marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '800', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 15, textAlign: 'center', marginBottom: 28 },
  card: { borderRadius: 20, borderWidth: 1, padding: 18, marginBottom: 8 },
  sectionLabel: { fontSize: 13, fontWeight: '600', marginBottom: 14, textAlign: 'center' },
  tagline: { fontSize: 12, textAlign: 'center', marginTop: 20 },
});
