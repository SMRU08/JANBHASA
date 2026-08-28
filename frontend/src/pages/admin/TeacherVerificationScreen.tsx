import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme';
import { apiRequest } from '../../services/apiClient';

export function TeacherVerificationScreen() {
  const theme = useTheme();
  const c = theme.colors;
  const [pendingTeachers, setPendingTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPending = async () => {
    setLoading(true);
    const res = await apiRequest<any[]>('/api/admin/teachers/pending');
    if (res.success && res.data) {
      setPendingTeachers(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleApprove = async (teacherId: number, name: string) => {
    Alert.alert('Approve Teacher', `Approve ${name}'s teaching credentials?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Approve',
        onPress: async () => {
          const res = await apiRequest(`/api/admin/teachers/${teacherId}/approve`, { method: 'POST' });
          if (res.success) {
            setPendingTeachers((prev) => prev.filter((t) => t.teacher_id !== teacherId));
            Alert.alert('Approved', `${name} can now login and teach.`);
          }
        }
      }
    ]);
  };

  const handleReject = async (teacherId: number, name: string) => {
    Alert.alert('Reject Teacher', `Reject ${name}'s application?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject',
        style: 'destructive',
        onPress: async () => {
          const res = await apiRequest(`/api/admin/teachers/${teacherId}/reject`, { method: 'POST' });
          if (res.success) {
            setPendingTeachers((prev) => prev.filter((t) => t.teacher_id !== teacherId));
          }
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="Teacher Verification 👩‍🏫" subtitle="लंबित शिक्षक सत्यापन" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={[styles.title, { color: c.text }]}>
          Pending Verification Requests ({pendingTeachers.length})
        </Text>

        {loading ? (
          <Text style={{ color: c.textMuted, textAlign: 'center', marginTop: 30 }}>Loading requests...</Text>
        ) : pendingTeachers.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={{ fontSize: 40 }}>🎉</Text>
            <Text style={{ fontSize: 16, fontWeight: '700', color: c.text, marginTop: 8 }}>
              No Pending Requests
            </Text>
            <Text style={{ fontSize: 13, color: c.textMuted, marginTop: 4 }}>
              All registered teachers have been verified.
            </Text>
          </View>
        ) : (
          pendingTeachers.map((t) => (
            <Card key={t.teacher_id} style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontSize: 17, fontWeight: '800', color: c.text }}>{t.name}</Text>
                <View style={[styles.badge, { backgroundColor: c.warningLight }]}>
                  <Text style={{ color: c.warningDark || '#E65100', fontSize: 11, fontWeight: '800' }}>
                    PENDING
                  </Text>
                </View>
              </View>

              <View style={{ marginTop: 8, gap: 4 }}>
                <Text style={{ color: c.textSecondary, fontSize: 13 }}>🏫 School: {t.school_name || 'N/A'}</Text>
                <Text style={{ color: c.textSecondary, fontSize: 13 }}>📱 Phone: {t.phone || 'N/A'}</Text>
                {t.email && <Text style={{ color: c.textSecondary, fontSize: 13 }}>📧 Email: {t.email}</Text>}
                {t.qualification && (
                  <Text style={{ color: c.textSecondary, fontSize: 13 }}>🎓 Qualification: {t.qualification}</Text>
                )}
                <Text style={{ color: c.textMuted, fontSize: 11, marginTop: 4 }}>
                  Registered: {new Date(t.created_at).toLocaleDateString()}
                </Text>
              </View>

              <View style={styles.actionRow}>
                <Button
                  title="Approve ✅"
                  onPress={() => handleApprove(t.teacher_id, t.name)}
                  style={{ flex: 1, marginRight: 8 }}
                />
                <Button
                  title="Reject ❌"
                  onPress={() => handleReject(t.teacher_id, t.name)}
                  variant="danger"
                  style={{ flex: 1 }}
                />
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 15, fontWeight: '700', marginBottom: 14 },
  emptyBox: { alignItems: 'center', marginTop: 40, padding: 20 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  actionRow: { flexDirection: 'row', marginTop: 14 }
});
