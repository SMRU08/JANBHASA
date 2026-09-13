import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, ScrollView } from 'react-native';
import { JanbhashaTheme } from '../../theme/janbhashaTheme';
import { useAppStore, AppLanguage } from '../../store/useAppStore';

export const LanguageSelectionScreen: React.FC = () => {
  const { appLanguage, setAppLanguage, navigate } = useAppStore();
  const [selected, setSelected] = useState<AppLanguage>(appLanguage || 'hi');

  const languages = [
    {
      code: 'hi' as AppLanguage,
      title: 'हिन्दी',
      sub: 'Hindi (Devanagari)',
      nativeDesc: 'मातृभाषा और मानक शिक्षा माध्यम',
      flag: '🇮🇳',
    },
    {
      code: 'sat' as AppLanguage,
      title: 'ᱥᱟᱱᱛᱟᱲᱤ',
      sub: 'Santali (Ol Chiki)',
      nativeDesc: 'ᱟᱭᱳ ᱟᱲᱟᱝ ᱟᱨ ᱟᱹᱫᱤᱵᱟᱹᱥᱤ ᱥᱮᱪᱮᱫ',
      flag: '📜',
      isOlChiki: true,
    },
    {
      code: 'en' as AppLanguage,
      title: 'English',
      sub: 'English (Latin)',
      nativeDesc: 'National standard & curriculum reference',
      flag: '🇬🇧',
    },
  ];

  const handleContinue = () => {
    setAppLanguage(selected);
    navigate('RoleSelection');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={JanbhashaTheme.colors.surface} barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topArea}>
          <View style={styles.sproutBadge}>
            <Text style={{ fontSize: 22 }}>🌱</Text>
          </View>
          <Text style={styles.appTitle}>
            <Text style={{ color: JanbhashaTheme.colors.primary }}>JAN</Text>
            <Text style={{ color: JanbhashaTheme.colors.secondary }}>BHASHA</Text>
          </Text>
          <Text style={styles.heading}>Choose Your Interface Language</Text>
          <Text style={styles.subHeading}>
            अपनी भाषा चुनें • Select preferred language • ᱟᱢᱟᱜ ᱯᱟᱹᱨᱥᱤ ᱵᱟᱪᱷᱟᱣ ᱢᱮ
          </Text>

          <View style={styles.list}>
            {languages.map((item) => {
              const isSelected = selected === item.code;
              return (
                <TouchableOpacity
                  key={item.code}
                  style={[styles.card, isSelected && styles.selectedCard]}
                  onPress={() => setSelected(item.code)}
                  activeOpacity={0.8}
                >
                  <View style={styles.leftRow}>
                    <Text style={styles.flagIcon}>{item.flag}</Text>
                    <View style={styles.textCol}>
                      <Text
                        style={[
                          styles.langTitle,
                          item.isOlChiki && styles.olChikiFont,
                          isSelected && styles.selectedText,
                        ]}
                      >
                        {item.title}
                      </Text>
                      <Text style={styles.langSub}>{item.sub}</Text>
                      <Text style={styles.nativeDesc}>{item.nativeDesc}</Text>
                    </View>
                  </View>
                  <View style={[styles.radioOuter, isSelected && styles.radioOuterSelected]}>
                    {isSelected && <View style={styles.radioInner} />}
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.85}>
            <Text style={styles.continueText}>Confirm & Continue / आगे बढ़ें →</Text>
          </TouchableOpacity>
          <Text style={styles.note}>
            Speech and translation models support Hindi & Santali Ol Chiki offline.
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
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: JanbhashaTheme.spacing.marginMobile,
    paddingVertical: 24,
  },
  topArea: {
    alignItems: 'center',
  },
  sproutBadge: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: JanbhashaTheme.colors.mintTag,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  heading: {
    fontSize: 22,
    fontWeight: '800',
    color: JanbhashaTheme.colors.onSurface,
    marginBottom: 6,
    textAlign: 'center',
  },
  subHeading: {
    fontSize: 12,
    color: JanbhashaTheme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 18,
  },
  list: {
    width: '100%',
    gap: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLowest,
    borderRadius: JanbhashaTheme.borderRadius.lg,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.outlineVariant,
    paddingHorizontal: 18,
    paddingVertical: 16,
    elevation: 2,
    shadowColor: JanbhashaTheme.colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  selectedCard: {
    borderColor: JanbhashaTheme.colors.primary,
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLow,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  flagIcon: {
    fontSize: 28,
    marginRight: 14,
  },
  textCol: {
    flex: 1,
    justifyContent: 'center',
  },
  langTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: JanbhashaTheme.colors.onSurface,
    marginBottom: 2,
  },
  olChikiFont: {
    fontFamily: JanbhashaTheme.fonts.olChikiBold,
    fontSize: 19,
  },
  langSub: {
    fontSize: 12,
    color: JanbhashaTheme.colors.onSurfaceVariant,
    fontWeight: '600',
  },
  nativeDesc: {
    fontSize: 11,
    color: JanbhashaTheme.colors.outline,
    marginTop: 2,
  },
  selectedText: {
    color: JanbhashaTheme.colors.primary,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: JanbhashaTheme.colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  radioOuterSelected: {
    borderColor: JanbhashaTheme.colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: JanbhashaTheme.colors.primary,
  },
  footer: {
    marginTop: 24,
    alignItems: 'center',
  },
  continueBtn: {
    backgroundColor: JanbhashaTheme.colors.primary,
    paddingVertical: 16,
    borderRadius: JanbhashaTheme.borderRadius.full,
    alignItems: 'center',
    width: '100%',
    elevation: 3,
  },
  continueText: {
    color: JanbhashaTheme.colors.onPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  note: {
    fontSize: 11,
    color: JanbhashaTheme.colors.outline,
    textAlign: 'center',
    marginTop: 10,
  },
});
