import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { JanbhashaTheme } from '../../theme/janbhashaTheme';
import { useAppStore } from '../../store/useAppStore';
import {
  avatar_teacher_teacher_dashboard_1_19,
  avatar_student_student_dashboard_12,
} from '../../assets/images';

export const RoleSelectionScreen: React.FC = () => {
  const { setRole, navigate } = useAppStore();

  const handleSelectRole = (role: 'teacher' | 'student') => {
    setRole(role);
    if (role === 'teacher') {
      navigate('TeacherDashboard');
    } else {
      navigate('StudentDashboard');
    }
  };

  const handleTeacherLogin = () => {
    setRole('teacher');
    navigate('TeacherLogin');
  };

  const handleStudentLogin = () => {
    setRole('student');
    navigate('StudentLogin');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={JanbhashaTheme.colors.surface} barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.sproutBadge}>
            <Text style={{ fontSize: 20 }}>🌱</Text>
          </View>
          <Text style={styles.appTitle}>
            <Text style={{ color: JanbhashaTheme.colors.primary }}>JAN</Text>
            <Text style={{ color: JanbhashaTheme.colors.secondary }}>BHASHA</Text>
          </Text>
          <Text style={styles.heading}>Who Are You?</Text>
          <Text style={styles.subHeading}>
            Choose your learning mode to personalize your classroom experience
          </Text>
        </View>

        <View style={styles.cardsContainer}>
          {/* Teacher Card */}
          <View style={styles.roleCard}>
            <View style={styles.cardTopRow}>
              <Image
                source={avatar_teacher_teacher_dashboard_1_19}
                style={styles.avatarImage}
                resizeMode="cover"
              />
              <View style={styles.roleMetaCol}>
                <View style={styles.roleBadgeGreen}>
                  <Text style={styles.roleBadgeText}>EDUCATOR</Text>
                </View>
                <Text style={styles.roleTitle}>I am a Teacher</Text>
                <Text style={styles.roleSub}>शिक्षक • ᱢᱟᱪᱮᱛ</Text>
              </View>
            </View>
            <Text style={styles.roleDescription}>
              Lead live bilingual lectures, broadcast audio to student tablets & Bluetooth speakers, manage curriculum, and auto-generate worksheets.
            </Text>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={styles.primaryActionButton}
                onPress={() => handleSelectRole('teacher')}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryActionText}>Quick Start →</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryActionButton}
                onPress={handleTeacherLogin}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryActionText}>Teacher Login</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Student Card */}
          <View style={styles.roleCard}>
            <View style={styles.cardTopRow}>
              <Image
                source={avatar_student_student_dashboard_12}
                style={styles.avatarImage}
                resizeMode="cover"
              />
              <View style={styles.roleMetaCol}>
                <View style={[styles.roleBadgeGreen, { backgroundColor: JanbhashaTheme.colors.secondaryFixed }]}>
                  <Text style={[styles.roleBadgeText, { color: JanbhashaTheme.colors.secondary }]}>LEARNER</Text>
                </View>
                <Text style={styles.roleTitle}>I am a Student</Text>
                <Text style={styles.roleSub}>विद्यार्थी • ᱪᱮᱪᱮᱫᱤᱭᱟᱹ</Text>
              </View>
            </View>
            <Text style={styles.roleDescription}>
              Listen to translated lessons in Santali Ol Chiki, practice reading flashcards, complete interactive quizzes, and explore vernacular FLN stories.
            </Text>
            <View style={styles.actionsRow}>
              <TouchableOpacity
                style={[styles.primaryActionButton, { backgroundColor: JanbhashaTheme.colors.secondary }]}
                onPress={() => handleSelectRole('student')}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryActionText}>Enter as Student →</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryActionButton}
                onPress={handleStudentLogin}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryActionText}>Student Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerNote}>
            Aligned with National Education Policy (NEP 2020) • Mother-Tongue Learning
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
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: JanbhashaTheme.spacing.marginMobile,
    paddingVertical: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 4,
  },
  sproutBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: JanbhashaTheme.colors.mintTag,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  heading: {
    fontSize: 24,
    fontWeight: '800',
    color: JanbhashaTheme.colors.onSurface,
    marginBottom: 4,
  },
  subHeading: {
    fontSize: 12,
    color: JanbhashaTheme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  cardsContainer: {
    gap: 16,
    marginVertical: 14,
  },
  roleCard: {
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLowest,
    borderRadius: JanbhashaTheme.borderRadius.xl,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.outlineVariant,
    padding: 18,
    elevation: 3,
    shadowColor: JanbhashaTheme.colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 14,
    borderWidth: 2,
    borderColor: JanbhashaTheme.colors.outlineVariant,
  },
  roleMetaCol: {
    flex: 1,
  },
  roleBadgeGreen: {
    alignSelf: 'flex-start',
    backgroundColor: JanbhashaTheme.colors.mintTag,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: JanbhashaTheme.borderRadius.full,
    marginBottom: 4,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: JanbhashaTheme.colors.primary,
    letterSpacing: 0.5,
  },
  roleTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: JanbhashaTheme.colors.onSurface,
  },
  roleSub: {
    fontSize: 12,
    color: JanbhashaTheme.colors.onSurfaceVariant,
    fontWeight: '600',
  },
  roleDescription: {
    fontSize: 12,
    color: JanbhashaTheme.colors.onSurfaceVariant,
    lineHeight: 18,
    marginBottom: 14,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryActionButton: {
    flex: 1,
    backgroundColor: JanbhashaTheme.colors.primary,
    paddingVertical: 12,
    borderRadius: JanbhashaTheme.borderRadius.full,
    alignItems: 'center',
  },
  primaryActionText: {
    color: JanbhashaTheme.colors.onPrimary,
    fontSize: 13,
    fontWeight: '800',
  },
  secondaryActionButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: JanbhashaTheme.borderRadius.full,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.outlineVariant,
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLow,
    alignItems: 'center',
  },
  secondaryActionText: {
    color: JanbhashaTheme.colors.onSurface,
    fontSize: 12,
    fontWeight: '700',
  },
  footer: {
    alignItems: 'center',
  },
  footerNote: {
    fontSize: 11,
    color: JanbhashaTheme.colors.outline,
    fontWeight: '600',
    textAlign: 'center',
  },
});
