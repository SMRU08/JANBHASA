import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { useClassroomStore } from '../../store/classroomStore';
import { connectToClassroom } from '../../services/classroomService';

export function JoinClassroomScreen() {
  const theme = useTheme();
  const c = theme.colors;
  const nav = useNavigation<any>();
  const { user } = useAuthStore();
  const [sessionCode, setSessionCode] = useState('');
  const [hostIp, setHostIp] = useState('192.168.43.1'); // typical hotspot IP default
  const [port, setPort] = useState('8000');
  const [loading, setLoading] = useState(false);

  const handleJoinManual = () => {
    if (!sessionCode.trim()) {
      Alert.alert('Required', 'Please enter the Session Code displayed on your teacher\'s screen.');
      return;
    }

    setLoading(true);
    useClassroomStore.getState().setSession({
      sessionId: sessionCode.toUpperCase(),
      teacherName: 'Teacher',
      isTeacher: false
    });

    try {
      connectToClassroom(sessionCode.toUpperCase(), hostIp.trim(), parseInt(port) || 8000, {
        role: 'student',
        student_id: user?.student_id || 1,
        name: user?.name || 'Student',
        language: user?.selected_language || 'hi'
      });
      setLoading(false);
      nav.navigate('StudentClassroom', { sessionId: sessionCode.toUpperCase() });
    } catch (e) {
      setLoading(false);
      Alert.alert('Connection Failed', 'Could not connect to teacher. Make sure you are on the same Wi-Fi/Hotspot.');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="Join Live Classroom 📡" subtitle="शिक्षक की कक्षा से जुड़ें" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Instructions */}
        <Card style={{ marginBottom: 20, borderColor: c.primary }}>
          <Text style={{ fontSize: 16, fontWeight: '700', color: c.text, marginBottom: 8 }}>
            How to Connect:
          </Text>
          <Text style={{ color: c.textSecondary, fontSize: 13, lineHeight: 20 }}>
            1. Connect your phone to the Teacher's Wi-Fi / Hotspot.{'\n'}
            2. Enter the Session ID shown on the teacher's screen.{'\n'}
            3. Tap Join! You will receive live translations instantly without Internet.
          </Text>
        </Card>

        {/* Form */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: c.textSecondary }]}>SESSION CODE (from teacher)</Text>
          <TextInput
            style={[styles.bigInput, { backgroundColor: c.card, borderColor: c.primary, color: c.text }]}
            value={sessionCode}
            onChangeText={setSessionCode}
            placeholder="e.g. A1B2C3D4"
            placeholderTextColor={c.textMuted}
            autoCapitalize="characters"
            maxLength={10}
          />
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: c.textSecondary }]}>Teacher Hotspot IP (if different)</Text>
          <TextInput
            style={[styles.input, { backgroundColor: c.card, borderColor: c.border, color: c.text }]}
            value={hostIp}
            onChangeText={setHostIp}
            placeholder="192.168.43.1"
            placeholderTextColor={c.textMuted}
          />
        </View>

        <Button
          title="Join Classroom Now 🚀"
          onPress={handleJoinManual}
          loading={loading}
          fullWidth
          size="lg"
          style={{ marginTop: 12 }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: '700', marginBottom: 6 },
  bigInput: {
    borderRadius: 14,
    borderWidth: 2,
    padding: 16,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 2
  },
  input: {
    borderRadius: 10,
    borderWidth: 1.5,
    padding: 12,
    fontSize: 15
  }
});
