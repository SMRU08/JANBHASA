import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { createClassroomSession } from '../../services/classroomService';
import { useClassroomStore } from '../../store/classroomStore';

export function ClassroomManagementScreen() {
  const theme = useTheme(); const c = theme.colors;
  const { t } = useTranslation();
  const nav = useNavigation<any>();
  const { user } = useAuthStore();
  const [creating, setCreating] = useState(false);
  const [subject, setSubject] = useState('General');

  const subjects = ['General', 'Mathematics', 'Hindi', 'Science', 'EVS', 'English', 'Social Studies'];

  const handleStartClassroom = async () => {
    setCreating(true);
    const result = await createClassroomSession(user?.teacher_id || 1, undefined, subject);
    setCreating(false);
    if (result.success && result.data) {
      const d = result.data as any;
      useClassroomStore.getState().setSession({
        sessionId: d.session_id, hostUrl: `${d.host_ip}:${d.host_port}`,
        teacherName: d.teacher_name, subject: d.subject, isTeacher: true,
      });
      nav.navigate('LiveClassroom', { sessionData: d });
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title={t('teacher.classroom')} showBack={false} />
      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Start new session */}
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.primary }]}>
          <Text style={[styles.cardTitle, { color: c.text }]}>📡 Start Live Classroom</Text>
          <Text style={[styles.cardSub, { color: c.textSecondary }]}>Students connect by scanning QR code on your screen. Works over local Wi-Fi/hotspot — no internet needed.</Text>
          <Text style={[styles.fieldLabel, { color: c.textSecondary }]}>Select Subject</Text>
          <View style={styles.subjectGrid}>
            {subjects.map(s => (
              <TouchableOpacity key={s} onPress={() => setSubject(s)} style={[styles.subjectChip, { backgroundColor: s === subject ? c.primaryLight : c.background, borderColor: s === subject ? c.primary : c.border }]}>
                <Text style={{ color: s === subject ? c.primary : c.textSecondary, fontWeight: s === subject ? '700' : '500', fontSize: 13 }}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Button title={`Start "${subject}" Classroom`} onPress={handleStartClassroom} loading={creating} fullWidth size="lg" icon="radio" style={{ marginTop: 16 }} />
        </View>

        {/* How it works */}
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[styles.cardTitle, { color: c.text }]}>How Classroom Mode Works</Text>
          {[
            '1️⃣ Tap "Start Classroom" above',
            '2️⃣ Share QR code with students',
            '3️⃣ Students scan to join instantly',
            '4️⃣ Speak — voice gets translated to each student\'s language automatically',
            '5️⃣ Send quizzes, text & flashcards to all',
          ].map((step, i) => (
            <Text key={i} style={{ color: c.textSecondary, fontSize: 13, marginBottom: 8 }}>{step}</Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 18, borderWidth: 1.5, padding: 20, marginBottom: 16 },
  cardTitle: { fontSize: 17, fontWeight: '700', marginBottom: 8 },
  cardSub: { fontSize: 13, marginBottom: 16, lineHeight: 20 },
  fieldLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  subjectGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  subjectChip: { borderRadius: 20, borderWidth: 1.5, paddingHorizontal: 14, paddingVertical: 7 },
});
