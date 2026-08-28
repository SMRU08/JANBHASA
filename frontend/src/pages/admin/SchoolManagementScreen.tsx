import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { useTheme } from '../../theme';

export function SchoolManagementScreen() {
  const theme = useTheme();
  const c = theme.colors;
  const [schools, setSchools] = useState([
    {
      id: 1,
      name: 'Government Primary School, Mayurbhanj',
      district: 'Mayurbhanj',
      state: 'Odisha',
      teachers_count: 6,
      students_count: 142
    },
    {
      id: 2,
      name: 'Tribal Welfare Residential School, Ranchi',
      district: 'Ranchi',
      state: 'Jharkhand',
      teachers_count: 8,
      students_count: 210
    },
    {
      id: 3,
      name: 'Adarsh Vidya Mandir, Bastar',
      district: 'Bastar',
      state: 'Chhattisgarh',
      teachers_count: 4,
      students_count: 95
    }
  ]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="School Management 🏫" subtitle="संबद्ध विद्यालय" showBack={false} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={[styles.title, { color: c.text }]}>Registered Schools ({schools.length})</Text>
        {schools.map((s) => (
          <Card key={s.id} style={{ marginBottom: 14 }}>
            <Text style={{ fontSize: 17, fontWeight: '800', color: c.text }}>{s.name}</Text>
            <Text style={{ color: c.textSecondary, fontSize: 13, marginTop: 4 }}>
              📍 {s.district}, {s.state}
            </Text>

            <View style={styles.statsRow}>
              <View style={[styles.pill, { backgroundColor: c.primaryLight }]}>
                <Text style={{ color: c.primaryDark, fontWeight: '700', fontSize: 12 }}>
                  👩‍🏫 {s.teachers_count} Teachers
                </Text>
              </View>
              <View style={[styles.pill, { backgroundColor: c.warningLight }]}>
                <Text style={{ color: c.warningDark || '#E65100', fontWeight: '700', fontSize: 12 }}>
                  👨‍🎓 {s.students_count} Students
                </Text>
              </View>
            </View>
          </Card>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  pill: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 }
});
