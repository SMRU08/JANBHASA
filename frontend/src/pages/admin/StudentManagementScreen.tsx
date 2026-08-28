import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { Modal } from '../../components/OfflineBanner';
import { useTheme } from '../../theme';
import { apiRequest } from '../../services/apiClient';

export function StudentManagementScreen() {
  const theme = useTheme();
  const c = theme.colors;
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    setLoading(true);
    const res = await apiRequest<any[]>('/api/admin/users?role=student');
    if (res.success && res.data) {
      setStudents(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAddStudent = async () => {
    if (!nameInput.trim() || !codeInput.trim()) {
      Alert.alert('Error', 'Name and Student Code are required.');
      return;
    }
    const res = await apiRequest('/api/teacher/1/students', {
      method: 'POST',
      body: { name: nameInput.trim(), student_code: codeInput.trim(), class_id: 1 }
    });
    if (res.success) {
      Alert.alert('Success', 'Student added successfully.');
      setModalVisible(false);
      setNameInput('');
      setCodeInput('');
      fetchStudents();
    } else {
      Alert.alert('Failed', res.message || 'Could not add student.');
    }
  };

  const filtered = students.filter((s) =>
    (s.name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="Student Directory 👨‍🎓" subtitle="छात्र प्रबंधन" showBack={false} />
      <View style={{ padding: 16, flex: 1 }}>
        <View style={styles.topRow}>
          <TextInput
            style={[styles.search, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
            placeholder="Search student by name..."
            placeholderTextColor={c.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          <Button title="+ Add" onPress={() => setModalVisible(true)} size="md" />
        </View>

        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {filtered.length === 0 ? (
            <Text style={{ color: c.textMuted, textAlign: 'center', marginTop: 30 }}>
              {loading ? 'Loading...' : 'No students found.'}
            </Text>
          ) : (
            filtered.map((st) => (
              <Card key={st.id} style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: c.text }}>{st.name}</Text>
                    <Text style={{ color: c.textSecondary, fontSize: 12, marginTop: 2 }}>
                      Language: {(st.selected_language || 'hi').toUpperCase()} • Status: {st.status}
                    </Text>
                  </View>
                  <View style={[styles.codePill, { backgroundColor: c.primaryLight }]}>
                    <Text style={{ color: c.primaryDark, fontWeight: '700', fontSize: 12 }}>
                      ID: {st.id}
                    </Text>
                  </View>
                </View>
              </Card>
            ))
          )}
        </ScrollView>
      </View>

      <Modal visible={modalVisible} title="Add New Student" onClose={() => setModalVisible(false)}>
        <View style={{ gap: 12 }}>
          <TextInput
            style={[styles.input, { backgroundColor: c.background, borderColor: c.border, color: c.text }]}
            placeholder="Full Name (e.g. Ramesh Kumar)"
            placeholderTextColor={c.textMuted}
            value={nameInput}
            onChangeText={setNameInput}
          />
          <TextInput
            style={[styles.input, { backgroundColor: c.background, borderColor: c.border, color: c.text }]}
            placeholder="Student Code (e.g. STU101)"
            placeholderTextColor={c.textMuted}
            value={codeInput}
            onChangeText={setCodeInput}
            autoCapitalize="characters"
          />
          <Button title="Save Student" onPress={handleAddStudent} fullWidth size="lg" style={{ marginTop: 8 }} />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: 'row', gap: 10, marginBottom: 14 },
  search: { flex: 1, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, fontSize: 14 },
  codePill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  input: { borderRadius: 10, borderWidth: 1.5, padding: 12, fontSize: 14 }
});
