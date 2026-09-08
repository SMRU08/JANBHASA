import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';
import { LanguageCode } from '../../types/language';
import { useLanguageStore } from '../../stores/languageStore';

export const LanguageSelector: React.FC = () => {
  const { sourceLanguage, targetLanguage, supportedLanguages, swapLanguages } = useLanguageStore();

  const src = supportedLanguages[sourceLanguage];
  const tgt = supportedLanguages[targetLanguage];

  return (
    <View style={styles.container}>
      <View style={styles.badge}>
        <Text style={styles.code}>{src?.name.toUpperCase()}</Text>
        <Text style={styles.subtext}>{src?.nativeName}</Text>
      </View>

      <TouchableOpacity
        onPress={swapLanguages}
        style={styles.swapButton}
        accessibilityLabel="Swap Source and Target Languages"
      >
        <Text style={styles.swapIcon}>⇄</Text>
      </TouchableOpacity>

      <View style={[styles.badge, styles.targetBadge]}>
        <Text style={[styles.code, styles.targetCode]}>{tgt?.name.toUpperCase()}</Text>
        <Text style={[styles.subtext, styles.targetSubtext]}>{tgt?.nativeName}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.background.surface,
    padding: Spacing.sm,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 2,
    borderColor: Colors.background.border,
  },
  badge: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  targetBadge: {
    borderLeftWidth: 1,
    borderLeftColor: Colors.background.border,
  },
  code: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.background.darkSlate,
  },
  subtext: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  targetCode: {
    color: Colors.cultural.terracotta,
  },
  targetSubtext: {
    color: Colors.cultural.terracottaDark,
    fontWeight: '700',
  },
  swapButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.cultural.terracotta,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  swapIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
});
