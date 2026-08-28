import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';

interface Language {
  code: string;
  name: string;
  nativeName?: string;
  flag?: string;
}

interface Props {
  languages: Language[];
  selected: string;
  onSelect: (code: string) => void;
  columns?: number;
}

export function LanguageSelector({ languages, selected, onSelect, columns = 2 }: Props) {
  const theme = useTheme();

  return (
    <View style={styles.grid}>
      {languages.map((lang) => {
        const isSelected = lang.code === selected;
        return (
          <TouchableOpacity
            key={lang.code}
            onPress={() => onSelect(lang.code)}
            activeOpacity={0.8}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={lang.nativeName || lang.name}
            style={[
              styles.langCard,
              { backgroundColor: isSelected ? theme.colors.primaryLight : theme.colors.card, borderColor: isSelected ? theme.colors.primary : theme.colors.border, width: `${100 / columns - 3}%` },
            ]}
          >
            <Text style={styles.flag}>{lang.flag || '🌐'}</Text>
            <Text style={[styles.nativeName, { color: isSelected ? theme.colors.primaryDark : theme.colors.text }]}>{lang.nativeName || lang.name}</Text>
            <Text style={[styles.engName, { color: theme.colors.textMuted }]}>{lang.name}</Text>
            {isSelected && <Ionicons name="checkmark-circle" size={18} color={theme.colors.primary} style={styles.check} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  langCard: { borderRadius: 14, borderWidth: 2, padding: 14, alignItems: 'center', minHeight: 90, justifyContent: 'center', marginBottom: 4 },
  flag: { fontSize: 24, marginBottom: 4 },
  nativeName: { fontSize: 15, fontWeight: '700', textAlign: 'center' },
  engName: { fontSize: 11, marginTop: 2 },
  check: { position: 'absolute', top: 6, right: 6 },
});
