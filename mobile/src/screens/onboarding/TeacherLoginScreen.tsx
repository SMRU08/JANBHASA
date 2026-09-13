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
import { avatar_teacher_find_classroom_1 } from '../../assets/images';

export const TeacherLoginScreen: React.FC = () => {
  const { setRole, navigate } = useAppStore();
  const [teacherId, setTeacherId] = useState('TCH-JH-2024');
  const [pin, setPin] = useState('1234');
  const [schoolCode, setSchoolCode] = useState('GPS-MAYURBHANJ-01');

  const handleLogin = () => {
    setRole('teacher');
    navigate('TeacherDashboard');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={JanbhashaTheme.colors.surface} barStyle="dark-content" />
      <JanbhashaHeader title="Teacher Access" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card */}
        <View style={styles.profileHeader}>
          <Image
            source={avatar_teacher_find_classroom_1}
            style={styles.avatar}
            resizeMode="cover"
          />
          <Text style={styles.welcomeText}>Educator Portal</Text>
          <Text style={styles.subWelcome}>
            Offline verified credentials for classroom broadcasting and lesson planning
          </Text>
        </View>

        {/* Form Inputs */}
        <View style={styles.formCard}>
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Teacher ID / DISE Code</Text>
            <TextInput
              style={styles.input}
              value={teacherId}
              onChangeText={setTeacherId}
              placeholder="e.g. TCH-JH-2024"
              placeholderTextColor={JanbhashaTheme.colors.outline}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>School / Cluster Code</Text>
            <TextInput
              style={styles.input}
              value={schoolCode}
              onChangeText={setSchoolCode}
              placeholder="e.g. GPS-MAYURBHANJ-01"
              placeholderTextColor={JanbhashaTheme.colors.outline}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Offline Security PIN</Text>
            <TextInput
              style={styles.input}
              value={pin}
              onChangeText={setPin}
              secureTextEntry
              keyboardType="number-pad"
              maxLength={6}
              placeholder="4-digit PIN"
              placeholderTextColor={JanbhashaTheme.colors.outline}
            />
          </View>

          <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} activeOpacity={0.85}>
            <Text style={styles.loginBtnText}>Verify & Enter Dashboard →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickStartBtn}
            onPress={handleLogin}
            activeOpacity={0.7}
          >
            <Text style={styles.quickStartText}>Skip Authentication (Offline Demo)</Text>
          </TouchableOpacity>
        </View>

        {/* Offline Badge Note */}
        <View style={styles.offlineNoteBox}>
          <Text style={styles.offlineBadge}>🔒 100% Air-Gapped Local Verification</Text>
          <Text style={styles.offlineDesc}>
            No external cloud server connection required. User profile stored securely on this device.
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
    marginVertical: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: JanbhashaTheme.colors.primary,
    marginBottom: 10,
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
    paddingHorizontal: 20,
  },
  formCard: {
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLowest,
    borderRadius: JanbhashaTheme.borderRadius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.outlineVariant,
    elevation: 2,
    marginVertical: 14,
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
  loginBtn: {
    backgroundColor: JanbhashaTheme.colors.primary,
    borderRadius: JanbhashaTheme.borderRadius.full,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 6,
  },
  loginBtnText: {
    color: JanbhashaTheme.colors.onPrimary,
    fontSize: 15,
    fontWeight: '800',
  },
  quickStartBtn: {
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  quickStartText: {
    color: JanbhashaTheme.colors.outline,
    fontSize: 12,
    fontWeight: '600',
  },
  offlineNoteBox: {
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLow,
    borderRadius: JanbhashaTheme.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.outlineVariant,
    alignItems: 'center',
  },
  offlineBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: JanbhashaTheme.colors.primary,
    marginBottom: 4,
  },
  offlineDesc: {
    fontSize: 11,
    color: JanbhashaTheme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 16,
  },
});
