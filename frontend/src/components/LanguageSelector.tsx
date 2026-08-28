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
  const c = theme.colors;

  return (
    <View style={styles.grid}>
      {languages.map((lang) => {
        const isSelected = lang.code === selected;
        return (
          <TouchableOpacity
            key={lang.code}
            onPress={() => onSelect(lang.code)}
            activeOpacity={0.85}
            accessibilityRole="radio"
            accessibilityState={{ selected: isSelected }}
            accessibilityLabel={lang.nativeName || lang.name}
            style={[
              styles.langCard,
              {
                backgroundColor: isSelected ? c.primaryLight : c.surface,
                borderColor: isSelected ? c.primary : c.border,
                width: `${100 / columns - 2.5}%`,
              },
              isSelected && styles.selectedShadow,
            ]}
          >
            <View style={styles.topRow}>
              <Text style={styles.flag}>{lang.flag || '🌐'}</Text>
              {isSelected ? (
                <View style={[styles.checkCircle, { backgroundColor: c.primary }]}>
                  <Ionicons name="checkmark" size={14} color="#FFFFFF" />
                </View>
              ) : (
                <View style={[styles.emptyCircle, { borderColor: c.border }]} />
              )}
            </View>
            <Text
              style={[
                styles.nativeName,
                { color: isSelected ? c.primaryDark : c.text },
              ]}
              numberOfLines={1}
            >
              {lang.nativeName || lang.name}
            </Text>
            <Text style={[styles.engName, { color: c.textSecondary }]} numberOfLines={1}>
              {lang.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  langCard: {
    borderRadius: 18,
    borderWidth: 2,
    padding: 16,
    minHeight: 104,
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  selectedShadow: {
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  flag: {
    fontSize: 26,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  nativeName: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 8,
  },
  engName: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
});
