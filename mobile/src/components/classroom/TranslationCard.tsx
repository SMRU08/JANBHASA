import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';

interface TranslationCardProps {
  title?: string;
  translatedText: string;
  placeholder?: string;
}

export const TranslationCard: React.FC<TranslationCardProps> = ({
  title = 'SANTHALI (OL CHIKI):',
  translatedText,
  placeholder = 'ᱚᱞ ᱪᱤᱠᱤ ᱛᱮ ᱛᱚᱨᱡᱚᱢᱟ ᱱᱚᱸᱰᱮ ᱧᱮᱞᱚᱜ-ᱟ...',
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{title}</Text>
      <Text style={translatedText ? styles.olChikiText : styles.placeholder}>
        {translatedText || placeholder}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.surface,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 3,
    borderColor: Colors.cultural.terracotta,
    padding: Spacing.base,
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.cultural.terracotta,
    letterSpacing: 1,
    marginBottom: 6,
  },
  olChikiText: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.cultural.forestGreenDark,
    lineHeight: 40,
  },
  placeholder: {
    fontSize: 18,
    color: '#888',
  },
});
