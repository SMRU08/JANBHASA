import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Header } from '../../components/Header';
import { LessonCard } from '../../components/BadgeCard';
import { useTheme } from '../../theme';
import { apiRequest } from '../../services/apiClient';
import defaultLessons from '../../data/lessons/class1_5_lessons.json';

export function LessonsListScreen() {
  const theme = useTheme(); const c = theme.colors;
  const nav = useNavigation<any>();
  const route = useRoute<any>();
  const { classLevel, subject, subjectLabel } = route.params || {};
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const lvl = String(classLevel || '3');
    const filteredOffline = defaultLessons.filter(l => !classLevel || String(l.class_level) === lvl || lvl === 'all');
    
    apiRequest<any[]>(`/api/content/lessons?class_level=${lvl}`).then(r => {
      if (r.success && r.data && r.data.length > 0) {
        setLessons(r.data);
      } else {
        setLessons(filteredOffline.length > 0 ? filteredOffline : defaultLessons);
      }
      setLoading(false);
    }).catch(() => {
      setLessons(filteredOffline.length > 0 ? filteredOffline : defaultLessons);
      setLoading(false);
    });
  }, [classLevel]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title={subjectLabel || 'Lessons'} subtitle={`Class ${classLevel || '1-5'}`} />
      <FlatList data={lessons} keyExtractor={(item, i) => String(item.id || i)}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListEmptyComponent={<Text style={{ color: c.textMuted, textAlign: 'center', marginTop: 40 }}>{loading ? 'Loading lessons...' : 'No lessons yet. Content coming soon!'}</Text>}
        renderItem={({ item }) => (
          <LessonCard lesson={item} onPress={() => nav.navigate('LessonDetail', { lesson: item })} />
        )}
      />
    </SafeAreaView>
  );
}
