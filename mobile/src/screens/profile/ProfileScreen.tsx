import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { JanbhashaTheme } from '../../theme/janbhashaTheme';
import { JanbhashaHeader } from '../../components/common/JanbhashaHeader';
import { BottomNavBar } from '../../components/common/BottomNavBar';
import { useAppStore } from '../../store/useAppStore';
import {
  avatar_teacher_teacher_dashboard_2_22,
  avatar_student_learning_path_17,
} from '../../assets/images';

export const ProfileScreen: React.FC = () => {
  const { role, navigate } = useAppStore();

  const handleSwitchRole = () => {
    navigate('RoleSelection');
  };

  const badges = [
    { title: 'Sohrai Folk Artist', emoji: '🎨', desc: 'Decorated 5 bilingual stories' },
    { title: 'Ol Chiki Master', emoji: '📜', desc: 'Mastered 20 core Santali flashcards' },
    { title: 'Classroom Listener', emoji: '🌟', desc: 'Active in 12 live bilingual lectures' },
    { title: 'Offline Hero', emoji: '🛡️', desc: 'Completed 100% air-gapped study session' },
  ];

  const isTeacher = role === 'teacher';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={JanbhashaTheme.colors.surface} barStyle="dark-content" />
      <JanbhashaHeader showBack title="Profile & Progress" subtitle="Janbhasha Identity Passport" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <View style={styles.userCard}>
          <Image
            source={isTeacher ? avatar_teacher_teacher_dashboard_2_22 : avatar_student_learning_path_17}
            style={styles.avatar}
            resizeMode="cover"
          />
          <Text style={styles.userName}>
            {isTeacher ? 'Shri Anand Soren' : 'Chunaram Marndi'}
          </Text>
          <View style={[styles.userRoleBadge, isTeacher && styles.userRoleBadgeTeacher]}>
            <Text style={[styles.roleBadgeText, isTeacher && styles.roleBadgeTextTeacher]}>
              {isTeacher ? 'CERTIFIED EDUCATOR' : 'GRADE 3 LEARNER'}
            </Text>
          </View>
          <Text style={styles.schoolName}>Govt. Primary School • Mayurbhanj, Odisha</Text>
        </View>

        {/* Learning Badges & Stamps */}
        <Text style={styles.sectionTitle}>Achievements & Stamps • ᱢᱟᱹᱱ ᱥᱟᱠᱟᱢ</Text>
        <View style={styles.badgesList}>
          {badges.map((b, i) => (
            <View key={i} style={styles.badgeCard}>
              <View style={styles.badgeEmojiBox}>
                <Text style={styles.badgeEmoji}>{b.emoji}</Text>
              </View>
              <View style={styles.badgeTextBox}>
                <Text style={styles.badgeTitle}>{b.title}</Text>
                <Text style={styles.badgeDesc}>{b.desc}</Text>
              </View>
              <View style={styles.stampCircle}>
                <Text style={styles.stampIcon}>✓</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Role & Session Switcher */}
        <View style={styles.actionsBox}>
          <TouchableOpacity style={styles.switchRoleBtn} onPress={handleSwitchRole} activeOpacity={0.8}>
            <Text style={styles.switchRoleText}>🔄 Switch Role (Teacher ↔ Student)</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <BottomNavBar />
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
    paddingBottom: 24,
  },
  userCard: {
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLowest,
    borderRadius: JanbhashaTheme.borderRadius.xl,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.outlineVariant,
    padding: 22,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: JanbhashaTheme.colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: JanbhashaTheme.colors.primary,
    marginBottom: 10,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: JanbhashaTheme.colors.onSurface,
  },
  userRoleBadge: {
    backgroundColor: JanbhashaTheme.colors.secondaryFixed,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: JanbhashaTheme.borderRadius.full,
    marginTop: 6,
    marginBottom: 6,
  },
  userRoleBadgeTeacher: {
    backgroundColor: JanbhashaTheme.colors.mintTag,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: JanbhashaTheme.colors.secondary,
    letterSpacing: 0.5,
  },
  roleBadgeTextTeacher: {
    color: JanbhashaTheme.colors.primary,
  },
  schoolName: {
    fontSize: 12,
    color: JanbhashaTheme.colors.onSurfaceVariant,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: JanbhashaTheme.colors.onSurface,
    marginBottom: 12,
  },
  badgesList: {
    gap: 10,
    marginBottom: 20,
  },
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLowest,
    borderRadius: JanbhashaTheme.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.outlineVariant,
  },
  badgeEmojiBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: JanbhashaTheme.colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  badgeEmoji: {
    fontSize: 22,
  },
  badgeTextBox: {
    flex: 1,
  },
  badgeTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: JanbhashaTheme.colors.onSurface,
  },
  badgeDesc: {
    fontSize: 11,
    color: JanbhashaTheme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  stampCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: JanbhashaTheme.colors.mintTag,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stampIcon: {
    fontSize: 12,
    fontWeight: '900',
    color: JanbhashaTheme.colors.primary,
  },
  actionsBox: {
    marginTop: 4,
  },
  switchRoleBtn: {
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLowest,
    borderRadius: JanbhashaTheme.borderRadius.full,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.outlineVariant,
  },
  switchRoleText: {
    fontSize: 13,
    fontWeight: '800',
    color: JanbhashaTheme.colors.onSurface,
  },
});
