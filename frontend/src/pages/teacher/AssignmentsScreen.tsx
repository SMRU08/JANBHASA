import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { apiRequest } from '../../services/apiClient';

export function AssignmentsScreen() {
  const theme = useTheme(); const c = theme.colors;
  const nav = useNavigation<any>();
  const { user } = useAuthStore();
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<any[]>(`/api/teachers/${user?.teacher_id || 1}/assignments`).then(r => {
      if (r.success && r.data) setAssignments(r.data);
      setLoading(false);
    });
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="Assignments" subtitle="कार्य प्रबंधन" showBack={false} rightIcon="add-circle" onRightPress={() => nav.navigate('HomeworkCreate')} />
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Button title="+ Create Assignment" onPress={() => nav.navigate('HomeworkCreate')} fullWidth variant="outline" style={{ marginBottom: 16 }} />
        {loading ? <Text style={{ color: c.textMuted, textAlign: 'center', marginTop: 40 }}>Loading...</Text> :
          assignments.length === 0 ? <Text style={{ color: c.textMuted, textAlign: 'center', marginTop: 40 }}>No assignments yet. Create one above.</Text> :
            assignments.map((a, i) => (
              <View key={i} style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, { color: c.text }]}>{a.title}</Text>
                  <Text style={[styles.cardMeta, { backgroundColor: c.primaryLight, color: c.primary }]}>{a.submission_count || 0} submitted</Text>
                </View>
                <Text style={{ color: c.textSecondary, fontSize: 13, marginTop: 4 }}>{a.class_name} {a.section} • Due: {a.due_date || 'Open'}</Text>
                <Text style={{ color: c.xp, fontSize: 12, marginTop: 4 }}>+{a.xp_reward || 50} XP reward</Text>
              </View>
            ))
        }
      </ScrollView>
    </SafeAreaView>
  );
}

export function HomeworkCreateScreen() {
  const theme = useTheme(); const c = theme.colors;
  const nav = useNavigation<any>();
  const { user } = useAuthStore();
  const [form, setForm] = useState({ title: '', description: '', due_date: '', xp_reward: '50', max_score: '100' });
  const [loading, setLoading] = useState(false);
  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    const result = await apiRequest(`/api/teachers/${user?.teacher_id || 1}/assignments`, { method: 'POST', body: { ...form, xp_reward: Number(form.xp_reward), max_score: Number(form.max_score) } });
    if (result.success) nav.goBack();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="Create Assignment" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {[
          { key: 'title', label: 'Assignment Title *', placeholder: 'e.g. Addition Practice' },
          { key: 'description', label: 'Instructions', placeholder: 'What should students do?' },
          { key: 'due_date', label: 'Due Date (YYYY-MM-DD)', placeholder: '2024-12-31' },
          { key: 'xp_reward', label: 'XP Reward', placeholder: '50', keyboard: 'number-pad' },
          { key: 'max_score', label: 'Max Score', placeholder: '100', keyboard: 'number-pad' },
        ].map(f => (
          <View key={f.key} style={{ marginBottom: 14 }}>
            <Text style={{ color: c.textSecondary, fontSize: 13, fontWeight: '600', marginBottom: 6 }}>{f.label}</Text>
            <View style={{ borderRadius: 10, borderWidth: 1.5, borderColor: c.border, backgroundColor: c.card, padding: 14 }}>
              <Text style={{ color: (form as any)[f.key] ? c.text : c.textMuted }}>{(form as any)[f.key] || f.placeholder}</Text>
            </View>
          </View>
        ))}
        <Button title="Create Assignment ✅" onPress={handleCreate} loading={loading} fullWidth size="lg" />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 10 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 15, fontWeight: '700', flex: 1 },
  cardMeta: { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 4, fontSize: 12, fontWeight: '700' },
});
