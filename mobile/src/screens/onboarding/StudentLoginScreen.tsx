import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from 'react-native';
import { JanbhashaTheme } from '../../theme/janbhashaTheme';
import { useAppStore } from '../../store/useAppStore';
import { JanbhashaHeader } from '../../components/common/JanbhashaHeader';
import {
  avatar_student_student_dashboard_12,
  avatar_student_student_dashboard_13,
  avatar_student_discovering_students_6,
  avatar_student_discovering_students_8,
} from '../../assets/images';

export const StudentLoginScreen: React.FC = () => {
  const { setRole, navigate } = useAppStore();
  const [studentName, setStudentName] = useState('Chunaram Marndi');
  const [rollNo, setRollNo] = useState('14');
  const [selectedGrade, setSelectedGrade] = useState('3');
  const [selectedAvatarIdx, setSelectedAvatarIdx] = useState(0);

  const avatars = [
    avatar_student_student_dashboard_12,
    avatar_student_student_dashboard_13,
    avatar_student_discovering_students_6,
    avatar_student_discovering_students_8,
  ];

  const grades = ['1', '2', '3', '4', '5'];

  const handleJoin = () => {
    setRole('student');
    navigate('StudentDashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={JanbhashaTheme.colors.surface} barStyle="dark-content" />
      <JanbhashaHeader title="Student Access" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <Image
            source={avatars[selectedAvatarIdx]}
            style={styles.avatarMain}
            resizeMode="cover"
          />
          <Text style={styles.welcomeText}>Welcome, Learner! 🎒</Text>
          <Text style={styles.subWelcome}>
            ᱪᱮᱪᱮᱫᱤᱭᱟᱹ ᱥᱟᱹᱜᱩᱱ ᱫᱟᱨᱟᱢ • Pick your avatar & enter your classroom
          </Text>
        </View>

        {/* Avatar Picker Row */}
        <View style={styles.avatarPickerRow}>
          {avatars.map((av, idx) => (
            <TouchableOpacity
              key={idx}
              style={[
                styles.avatarThumbWrapper,
                selectedAvatarIdx === idx && styles.avatarThumbSelected,
              ]}
              onPress={() => setSelectedAvatarIdx(idx)}
              activeOpacity={0.8}
            >
              <Image source={av} style={styles.avatarThumb} resizeMode="cover" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Form Card */}
        <View style={styles.formCard}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Your Full Name / नाम</Text>
            <TextInput
              style={styles.input}
              value={studentName}
              onChangeText={setStudentName}
              placeholder="Enter your name"
              placeholderTextColor={JanbhashaTheme.colors.outline}
            />
          </View>

          {/* Grade Selector Chips */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Select Grade / कक्षा</Text>
            <View style={styles.gradeRow}>
              {grades.map((gr) => (
                <TouchableOpacity
                  key={gr}
                  style={[styles.gradeChip, selectedGrade === gr && styles.gradeChipActive]}
                  onPress={() => setSelectedGrade(gr)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.gradeChipText,
                      selectedGrade === gr && styles.gradeChipTextActive,
                    ]}
                  >
                    Class {gr}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Roll Number / रोल नंबर</Text>
            <TextInput
              style={styles.input}
              value={rollNo}
              onChangeText={setRollNo}
              keyboardType="number-pad"
              placeholder="e.g. 14"
              placeholderTextColor={JanbhashaTheme.colors.outline}
            />
          </View>

          <TouchableOpacity style={styles.joinBtn} onPress={handleJoin} activeOpacity={0.85}>
            <Text style={styles.joinBtnText}>Enter Classroom / क्लास में जाएं →</Text>
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>✨ Offline Learning Companion</Text>
          <Text style={styles.infoDesc}>
            Access audio lessons, flashcards, and translated stories in Ol Chiki and Hindi anytime.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: JanbhashaTheme.colors.surface,
  },
  scrollContent: {
    padding: JanbhashaTheme.spacing.marginMobile,
    paddingBottom: 32,
  },
  profileHeader: {
    alignItems: 'center',
    marginVertical: 10,
  },
  avatarMain: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: JanbhashaTheme.colors.secondary,
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: '800',
    color: JanbhashaTheme.colors.onSurface,
  },
  subWelcome: {
    fontSize: 12,
    color: JanbhashaTheme.colors.onSurfaceVariant,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 16,
  },
  avatarPickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginVertical: 12,
  },
  avatarThumbWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    padding: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  avatarThumbSelected: {
    borderColor: JanbhashaTheme.colors.secondary,
  },
  avatarThumb: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
  },
  formCard: {
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLowest,
    borderRadius: JanbhashaTheme.borderRadius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.outlineVariant,
    elevation: 2,
    marginVertical: 10,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: JanbhashaTheme.colors.onSurfaceVariant,
    marginBottom: 6,
  },
  input: {
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLow,
    borderRadius: JanbhashaTheme.borderRadius.lg,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.outlineVariant,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: JanbhashaTheme.colors.onSurface,
    fontWeight: '600',
  },
  gradeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  gradeChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: JanbhashaTheme.borderRadius.md,
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.outlineVariant,
    alignItems: 'center',
  },
  gradeChipActive: {
    backgroundColor: JanbhashaTheme.colors.secondary,
    borderColor: JanbhashaTheme.colors.secondary,
  },
  gradeChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: JanbhashaTheme.colors.onSurfaceVariant,
  },
  gradeChipTextActive: {
    color: JanbhashaTheme.colors.onSecondary,
  },
  joinBtn: {
    backgroundColor: JanbhashaTheme.colors.secondary,
    borderRadius: JanbhashaTheme.borderRadius.full,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 6,
  },
  joinBtnText: {
    color: JanbhashaTheme.colors.onSecondary,
    fontSize: 15,
    fontWeight: '800',
  },
  infoBox: {
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLow,
    borderRadius: JanbhashaTheme.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.outlineVariant,
    alignItems: 'center',
    marginTop: 8,
  },
  infoTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: JanbhashaTheme.colors.secondary,
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: 11,
    color: JanbhashaTheme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 16,
  },
});
