import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { useGamificationStore } from '../../store/gamificationStore';
import { synthesize } from '../../services/ttsService';
import { translate } from '../../services/translationService';
import { apiRequest } from '../../services/apiClient';
import { saveLocalProgress } from '../../services/databaseService';

export function LessonDetailScreen() {
  const theme = useTheme(); const c = theme.colors;
  const route = useRoute<any>();
  const nav = useNavigation<any>();
  const { user } = useAuthStore();
  const { addXp } = useGamificationStore();
  const { lesson } = route.params || {};
  const [translatedContent, setTranslatedContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    const lang = user?.selected_language || 'hi';
    if (lang !== 'hi' && lesson?.content_hi) {
      translate(lesson.content_hi, 'hi', lang).then(setTranslatedContent);
    }
  }, []);

  const handleListen = async () => {
    const text = translatedContent || lesson?.content_hi || lesson?.title;
    const lang = translatedContent ? (user?.selected_language || 'hi') : 'hi';
    const url = await synthesize(text, lang);
    if (url) {
      try {
        if (sound) { await sound.unloadAsync(); }
        const { sound: s } = await Audio.Sound.createAsync({ uri: url });
        setSound(s);
        await s.playAsync();
      } catch { }
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    const studentId = user?.student_id || 1;
    await saveLocalProgress(studentId, lesson?.id, 'completed', 100, undefined);
    await apiRequest(`/api/students/${studentId}/progress`, {
      method: 'POST', body: { lesson_id: lesson?.id, status: 'completed', progress_percent: 100 },
    });
    addXp(lesson?.xp_reward || 20);
    setLoading(false);
    setCompleted(true);
    setTimeout(() => nav.goBack(), 2000);
  };

  if (!lesson) return <SafeAreaView style={{ flex: 1 }}><Text>Lesson not found.</Text></SafeAreaView>;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title={lesson.title} subtitle={`Class ${lesson.class_level}`} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View style={[styles.lessonHero, { backgroundColor: c.primaryLight, borderColor: c.primary }]}>
          <Text style={styles.lessonEmoji}>{lesson.icon || '📚'}</Text>
          <Text style={[styles.lessonTitle, { color: c.primaryDark }]}>{lesson.title}</Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>Class {lesson.class_level}</Text>
            <Text style={styles.meta}>⏱️ {lesson.estimated_minutes || 10} min</Text>
            <Text style={styles.meta}>+{lesson.xp_reward || 20} XP</Text>
          </View>
        </View>

        {/* Content */}
        <Card style={{ marginBottom: 12 }}>
          <Text style={{ fontSize: 13, color: c.textMuted, fontWeight: '600', marginBottom: 8 }}>Hindi Content:</Text>
          <Text style={{ color: c.text, fontSize: 15, lineHeight: 24 }}>{lesson.content_hi || 'Content loading...'}</Text>
        </Card>

        {/* Translated content */}
        {translatedContent ? (
          <Card style={{ marginBottom: 12, borderColor: c.primary }}>
            <Text style={{ fontSize: 13, color: c.primary, fontWeight: '600', marginBottom: 8 }}>{(user?.selected_language || 'hi').toUpperCase()} Translation:</Text>
            <Text style={{ color: c.text, fontSize: 15, lineHeight: 24 }}>{translatedContent}</Text>
          </Card>
        ) : null}

        {/* Listen button */}
        <Button title="🔊 Listen" onPress={handleListen} variant="outline" fullWidth style={{ marginBottom: 12 }} />

        {/* Complete */}
        {completed ? (
          <View style={[styles.completedBox, { backgroundColor: c.successLight, borderColor: c.success }]}>
            <Text style={{ fontSize: 32 }}>🎉</Text>
            <Text style={{ color: c.success, fontWeight: '800', fontSize: 18 }}>Lesson Completed!</Text>
            <Text style={{ color: c.success }}>+{lesson.xp_reward || 20} XP earned!</Text>
          </View>
        ) : (
          <Button title="✅ Mark as Complete" onPress={handleComplete} loading={loading} fullWidth size="lg" />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  lessonHero: { borderRadius: 18, borderWidth: 1.5, padding: 20, alignItems: 'center', marginBottom: 16 },
  lessonEmoji: { fontSize: 52, marginBottom: 8 },
  lessonTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
  metaRow: { flexDirection: 'row', gap: 12, marginTop: 10 },
  meta: { fontSize: 12, color: '#888' },
  completedBox: { borderRadius: 16, borderWidth: 2, padding: 24, alignItems: 'center', gap: 8 },
});
