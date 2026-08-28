import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme';
import { apiRequest } from '../../services/apiClient';

export function TeacherManagementScreen() {
  const theme = useTheme();
  const c = theme.colors;
  const [teachers, setTeachers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchTeachers = async () => {
    setLoading(true);
    const res = await apiRequest<any[]>('/api/admin/users?role=teacher');
    if (res.success && res.data) {
      setTeachers(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleToggleLock = async (userId: number, currentStatus: string) => {
    const isLocked = currentStatus === 'locked';
    const action = isLocked ? 'unlock' : 'lock';

    const res = await apiRequest(`/api/admin/users/${userId}/${action}`, { method: 'POST' });
    if (res.success) {
      setTeachers((prev) =>
        prev.map((t) => (t.id === userId ? { ...t, status: isLocked ? 'active' : 'locked' } : t))
      );
      Alert.alert('Status Updated', `Teacher account is now ${isLocked ? 'active' : 'locked'}.`);
    }
  };

  const filtered = teachers.filter(
    (t) =>
      (t.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (t.phone || '').includes(search)
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="Teacher Directory 👩‍🏫" subtitle="शिक्षक प्रबंधन" showBack={false} />
      <View style={{ padding: 16, flex: 1 }}>
        <TextInput
          style={[styles.search, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
          placeholder="Search by teacher name or phone..."
          placeholderTextColor={c.textMuted}
          value={search}
          onChangeText={setSearch}
        />

        <ScrollView contentContainerStyle={{ paddingBottom: 40, marginTop: 12 }}>
          {filtered.length === 0 ? (
            <Text style={{ color: c.textMuted, textAlign: 'center', marginTop: 30 }}>
              {loading ? 'Loading...' : 'No teachers registered.'}
            </Text>
          ) : (
            filtered.map((teacher) => (
              <Card key={teacher.id} style={{ marginBottom: 12 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: '800', color: c.text }}>{teacher.name}</Text>
                    <Text style={{ color: c.textSecondary, fontSize: 13, marginTop: 2 }}>
                      📱 {teacher.phone || 'No phone'}
                    </Text>
                    {teacher.email && (
                      <Text style={{ color: c.textMuted, fontSize: 12 }}>📧 {teacher.email}</Text>
                    )}
                  </View>
                  <View
                    style={[
                      styles.statusPill,
                      {
                        backgroundColor:
                          teacher.status === 'active'
                            ? c.successLight
                            : teacher.status === 'locked'
                            ? c.errorLight
                            : c.warningLight
                      }
                    ]}
                  >
                    <Text
                      style={{
                        color:
                          teacher.status === 'active'
                            ? c.success
                            : teacher.status === 'locked'
                            ? c.error
                            : c.warningDark || '#E65100',
                        fontSize: 11,
                        fontWeight: '800',
                        textTransform: 'uppercase'
                      }}
                    >
                      {teacher.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <Button
                    title={teacher.status === 'locked' ? '🔓 Unlock' : '🔒 Lock Account'}
                    onPress={() => handleToggleLock(teacher.id, teacher.status)}
                    variant={teacher.status === 'locked' ? 'primary' : 'danger'}
                    size="sm"
                    style={{ flex: 1 }}
                  />
                </View>
              </Card>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  search: { borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, paddingVertical: 10, fontSize: 14 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  actionRow: { flexDirection: 'row', marginTop: 12 }
});
