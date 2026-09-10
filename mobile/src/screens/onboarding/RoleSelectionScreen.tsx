import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity } from 'react-native';
import { JanbhashaTheme } from '../../theme/janbhashaTheme';
import { useAppStore } from '../../store/useAppStore';

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={JanbhashaTheme.colors.creamBg} barStyle="dark-content" />
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.appTitle}>
            <Text style={{ color: JanbhashaTheme.colors.deepGreen }}>JAN</Text>
            <Text style={{ color: JanbhashaTheme.colors.warmOrange }}>BHASHA</Text>
          </Text>
          <Text style={styles.heading}>Who Are You?</Text>
          <Text style={styles.subHeading}>
            Choose your learning role to personalize your educational journey
          </Text>
        </View>

        <View style={styles.cardsRow}>
          {/* Teacher Card */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleSelectRole('teacher')}
            activeOpacity={0.88}
          >
            <View style={[styles.avatarBox, { backgroundColor: '#E0F2E9' }]}>
              <Text style={styles.avatarEmoji}>👩🏽‍🏫</Text>
            </View>
            <Text style={styles.roleTitle}>I am a Teacher</Text>
            <Text style={styles.roleSub}>Teach • Translate • Connect</Text>
            <View style={styles.badgePill}>
              <Text style={styles.badgeText}>Classroom & Live Tools →</Text>
            </View>
          </TouchableOpacity>

          {/* Student Card */}
          <TouchableOpacity
            style={styles.card}
            onPress={() => handleSelectRole('student')}
            activeOpacity={0.88}
          >
            <View style={[styles.avatarBox, { backgroundColor: '#FFF3ED' }]}>
              <Text style={styles.avatarEmoji}>👦🏽</Text>
            </View>
            <Text style={styles.roleTitle}>I am a Student</Text>
            <Text style={styles.roleSub}>Learn • Listen • Grow</Text>
            <View style={[styles.badgePill, { backgroundColor: JanbhashaTheme.colors.warmOrangeLight }]}>
              <Text style={[styles.badgeText, { color: JanbhashaTheme.colors.warmOrange }]}>
                Interactive Lessons →
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerNote}>
            Aligned with National Education Policy (NEP 2020) • Mother-Tongue Learning
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: JanbhashaTheme.colors.creamBg,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 32,
    justifyContent: 'space-between',
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
  },
  appTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 12,
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: JanbhashaTheme.colors.charcoalText,
    marginBottom: 8,
  },
  subHeading: {
    fontSize: 13,
    color: JanbhashaTheme.colors.mutedText,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  cardsRow: {
    gap: 20,
    marginVertical: 10,
  },
  card: {
    backgroundColor: JanbhashaTheme.colors.white,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.cardBorder,
    padding: 24,
    alignItems: 'center',
    elevation: 3,
    shadowColor: JanbhashaTheme.colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
  },
  avatarBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  avatarEmoji: {
    fontSize: 42,
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: JanbhashaTheme.colors.charcoalText,
    marginBottom: 4,
  },
  roleSub: {
    fontSize: 13,
    color: JanbhashaTheme.colors.mutedText,
    fontWeight: '500',
    marginBottom: 14,
  },
  badgePill: {
    backgroundColor: JanbhashaTheme.colors.mintTag,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: JanbhashaTheme.colors.deepGreen,
  },
  footer: {
    alignItems: 'center',
  },
  footerNote: {
    fontSize: 11,
    color: JanbhashaTheme.colors.lightText,
    fontWeight: '600',
    textAlign: 'center',
  },
});
