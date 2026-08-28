import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Header } from '../../components/Header';
import { LessonCard } from '../../components/BadgeCard';
import { useTheme } from '../../theme';
import { apiRequest } from '../../services/apiClient';

export function LessonsListScreen() {
  const theme = useTheme(); const c = theme.colors;
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { classLevel, subject, subjectLabel } = route.params || {};
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<any[]>(`/api/content/lessons?class_level=${classLevel || '3'}`).then(r => {
      if (r.success && r.data) setLessons(r.data);
      setLoading(false);
    });
  }, [classLevel]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title={subjectLabel || 'Lessons'} subtitle={`Class ${classLevel}`} />
      <FlatList data={lessons} keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListEmptyComponent={<Text style={{ color: c.textMuted, textAlign: 'center', marginTop: 40 }}>{loading ? 'Loading lessons...' : 'No lessons yet. Content coming soon!'}</Text>}
        renderItem={({ item }) => (
          <LessonCard lesson={item} onPress={() => nav.navigate('LessonDetail', { lesson: item })} />
        )}
      />
    </SafeAreaView>
  );
}
