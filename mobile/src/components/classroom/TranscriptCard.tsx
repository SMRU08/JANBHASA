import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';

interface TranscriptCardProps {
  title?: string;
  transcript: string;
  placeholder?: string;
}

export const TranscriptCard: React.FC<TranscriptCardProps> = ({
  title = 'HINDI TRANSCRIPT (TEACHER):',
  transcript,
  placeholder = 'Awaiting teacher voice input...',
}) => {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{title}</Text>
      <Text style={transcript ? styles.text : styles.placeholder}>
        {transcript || placeholder}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.background.surface,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 2,
    borderColor: Colors.background.border,
    padding: Spacing.base,
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.cultural.forestGreen,
    letterSpacing: 1,
    marginBottom: 6,
  },
  text: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.background.darkSlate,
    lineHeight: 28,
  },
  placeholder: {
    fontSize: 16,
    color: '#888',
    fontStyle: 'italic',
  },
});
