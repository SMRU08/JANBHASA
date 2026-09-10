import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { JanbhashaTheme } from '../../theme/janbhashaTheme';
import { useAppStore, AppLanguage } from '../../store/useAppStore';

export const LanguageSelectionScreen: React.FC = () => {
  const { appLanguage, setAppLanguage, navigate } = useAppStore();
  const [selected, setSelected] = useState<AppLanguage>(appLanguage || 'hi');

  const languages = [
    {
      code: 'hi' as AppLanguage,
      title: 'हिन्दी',
      sub: 'Hindi',
      flag: '🇮🇳',
    },
    {
      code: 'en' as AppLanguage,
      title: 'English',
      sub: 'English',
      flag: '🇬🇧',
    },
    {
      code: 'sat' as AppLanguage,
      title: 'ᱥᱟᱱᱛᱟᱲᱤ (ᱟᱞ ᱪᱤᱠᱤ)',
      sub: 'Santali (Ol Chiki)',
      flag: '📜',
      isOlChiki: true,
    },
  ];

  const handleContinue = () => {
    setAppLanguage(selected);
    navigate('RoleSelection');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={JanbhashaTheme.colors.creamBg} barStyle="dark-content" />
      <View style={styles.content}>
        <View style={styles.topArea}>
          <Text style={styles.appTitle}>
            <Text style={{ color: JanbhashaTheme.colors.deepGreen }}>JAN</Text>
            <Text style={{ color: JanbhashaTheme.colors.warmOrange }}>BHASHA</Text>
          </Text>
          <Text style={styles.heading}>Choose Your App Language</Text>
          <Text style={styles.subHeading}>
            अपनी भाषा चुनें • Select your preferred language • ᱟᱢᱟᱜ ᱯᱟᱹᱨᱥᱤ ᱵᱟᱪᱷᱟᱣ ᱢᱮ
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

        <TouchableOpacity style={styles.continueBtn} onPress={handleContinue} activeOpacity={0.85}>
          <Text style={styles.continueText}>Continue →</Text>
        </TouchableOpacity>
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
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'space-between',
  },
  topArea: {
    alignItems: 'center',
    marginTop: 10,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: JanbhashaTheme.colors.charcoalText,
    marginBottom: 8,
    textAlign: 'center',
  },
  subHeading: {
    fontSize: 13,
    color: JanbhashaTheme.colors.mutedText,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 18,
  },
  list: {
    width: '100%',
    gap: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: JanbhashaTheme.colors.white,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.cardBorder,
    paddingHorizontal: 20,
    paddingVertical: 18,
    elevation: 2,
    shadowColor: JanbhashaTheme.colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  selectedCard: {
    borderColor: JanbhashaTheme.colors.deepGreen,
    backgroundColor: JanbhashaTheme.colors.creamBgLight,
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flagIcon: {
    fontSize: 28,
    marginRight: 16,
  },
  textCol: {
    justifyContent: 'center',
  },
  langTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: JanbhashaTheme.colors.charcoalText,
    marginBottom: 2,
  },
  olChikiFont: {
    fontFamily: JanbhashaTheme.fonts.olChikiBold,
    fontSize: 19,
  },
  langSub: {
    fontSize: 12,
    color: JanbhashaTheme.colors.mutedText,
    fontWeight: '500',
  },
  selectedText: {
    color: JanbhashaTheme.colors.deepGreen,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: JanbhashaTheme.colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterSelected: {
    borderColor: JanbhashaTheme.colors.deepGreen,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: JanbhashaTheme.colors.deepGreen,
  },
  continueBtn: {
    backgroundColor: JanbhashaTheme.colors.deepGreen,
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    width: '100%',
    elevation: 3,
  },
  continueText: {
    color: JanbhashaTheme.colors.white,
    fontSize: 16,
    fontWeight: '700',
  },
});
