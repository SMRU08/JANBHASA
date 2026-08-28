import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Header } from '../../components/Header';
import { ProgressCircle } from '../../components/ProgressCircle';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { apiRequest } from '../../services/apiClient';

const CLASSES = ['1', '2', '3', '4', '5'];
const SUBJECTS = [
  { key: 'math', label: 'गणित', emoji: '🔢', color: '#1565C0' },
  { key: 'hindi', label: 'हिंदी', emoji: '📝', color: '#2E7D32' },
  { key: 'science', label: 'विज्ञान', emoji: '🔬', color: '#6A1B9A' },
  { key: 'evs', label: 'पर्यावरण', emoji: '🌿', color: '#00695C' },
  { key: 'english', label: 'English', emoji: '🔤', color: '#B71C1C' },
];

export function LearningPathScreen() {
  const theme = useTheme(); const c = theme.colors;
  const { t } = useTranslation();
  const nav = useNavigation<any>();
  const { user } = useAuthStore();
  const [selectedClass, setSelectedClass] = useState('3');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title={t('student.learning_path')} showBack={false} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* Class selector */}
        <Text style={[styles.sectionLabel, { color: c.textSecondary }]}>Select Class</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {CLASSES.map(cls => (
            <TouchableOpacity key={cls} onPress={() => setSelectedClass(cls)} style={[styles.classChip, { backgroundColor: cls === selectedClass ? c.primary : c.card, borderColor: cls === selectedClass ? c.primary : c.border }]}>
              <Text style={{ color: cls === selectedClass ? '#fff' : c.text, fontWeight: '700', fontSize: 15 }}>Class {cls}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Subject cards */}
        {SUBJECTS.map(sub => (
          <TouchableOpacity key={sub.key} onPress={() => nav.navigate('LessonsList', { classLevel: selectedClass, subject: sub.key, subjectLabel: sub.label })}
            style={[styles.subjectCard, { backgroundColor: c.card, borderColor: c.border }]} activeOpacity={0.8}>
            <Text style={styles.subjectEmoji}>{sub.emoji}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.subjectName, { color: c.text }]}>{sub.label}</Text>
              <Text style={{ color: c.textMuted, fontSize: 12, marginTop: 2 }}>Class {selectedClass} • Tap to explore</Text>
            </View>
            <ProgressCircle progress={0.3} size={52} color={sub.color} strokeWidth={5} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionLabel: { fontSize: 13, fontWeight: '600', marginBottom: 10 },
  classChip: { borderRadius: 22, borderWidth: 2, paddingHorizontal: 20, paddingVertical: 10, marginRight: 10 },
  subjectCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 12 },
  subjectEmoji: { fontSize: 36, marginRight: 16 },
  subjectName: { fontSize: 18, fontWeight: '700' },
});
