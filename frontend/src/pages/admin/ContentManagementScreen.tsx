import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme';
import { apiRequest } from '../../services/apiClient';

export function ContentManagementScreen() {
  const theme = useTheme();
  const c = theme.colors;
  const [lessons, setLessons] = useState<any[]>([]);
  const [title, setTitle] = useState('');
  const [classLevel, setClassLevel] = useState('3');
  const [contentHi, setContentHi] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLessons = async () => {
    const res = await apiRequest<any[]>('/api/content/lessons');
    if (res.success && res.data) {
      setLessons(res.data);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, []);

  const handleCreateLesson = async () => {
    if (!title.trim() || !contentHi.trim()) {
      Alert.alert('Required', 'Please enter Title and Hindi Content.');
      return;
    }

    setLoading(true);
    const res = await apiRequest('/api/content/lessons', {
      method: 'POST',
      body: {
        title: title.trim(),
        title_hi: title.trim(),
        class_level: classLevel,
        content_hi: contentHi.trim(),
        xp_reward: 20
      }
    });
    setLoading(false);

    if (res.success) {
      Alert.alert('Success', 'Lesson created and ready for offline distribution.');
      setTitle('');
      setContentHi('');
      fetchLessons();
    } else {
      Alert.alert('Error', res.message || 'Failed to create lesson.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="Content CMS 📚" subtitle="पाठ्य सामग्री निर्माण" showBack={false} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Create New Lesson Form */}
        <Card style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 16, fontWeight: '800', color: c.text, marginBottom: 12 }}>
            ➕ Create Offline Lesson
          </Text>

          <Text style={[styles.label, { color: c.textSecondary }]}>LESSON TITLE (Hindi / English)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: c.background, borderColor: c.border, color: c.text }]}
            placeholder="e.g. जल चक्र और पर्यावरण"
            placeholderTextColor={c.textMuted}
            value={title}
            onChangeText={setTitle}
          />

          <Text style={[styles.label, { color: c.textSecondary, marginTop: 10 }]}>CLASS LEVEL (1 to 5)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: c.background, borderColor: c.border, color: c.text }]}
            placeholder="3"
            placeholderTextColor={c.textMuted}
            value={classLevel}
            onChangeText={setClassLevel}
            keyboardType="number-pad"
          />

          <Text style={[styles.label, { color: c.textSecondary, marginTop: 10 }]}>LESSON CONTENT (Hindi)</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: c.background, borderColor: c.border, color: c.text }]}
            placeholder="हिंदी में पाठ की सामग्री लिखें..."
            placeholderTextColor={c.textMuted}
            value={contentHi}
            onChangeText={setContentHi}
            multiline
            numberOfLines={4}
          />

          <Button
            title="Save Lesson to Database 💾"
            onPress={handleCreateLesson}
            loading={loading}
            fullWidth
            style={{ marginTop: 14 }}
          />
        </Card>

        {/* Existing Lessons List */}
        <Text style={[styles.title, { color: c.text }]}>Existing Lessons ({lessons.length})</Text>
        {lessons.map((l) => (
          <Card key={l.id} style={{ marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 15, fontWeight: '700', color: c.text }}>{l.title}</Text>
                <Text style={{ fontSize: 12, color: c.textSecondary, marginTop: 2 }}>
                  Class {l.class_level} • +{l.xp_reward || 20} XP
                </Text>
              </View>
              <Text style={{ fontSize: 24 }}>{l.icon || '📚'}</Text>
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 6 },
  input: { borderRadius: 10, borderWidth: 1.5, padding: 12, fontSize: 14 },
  textArea: {
    borderRadius: 10,
    borderWidth: 1.5,
    padding: 12,
    fontSize: 14,
    minHeight: 90,
    textAlignVertical: 'top'
  }
});
