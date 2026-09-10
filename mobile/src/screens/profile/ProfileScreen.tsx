import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import { JanbhashaTheme } from '../../theme/janbhashaTheme';
import { JanbhashaHeader } from '../../components/common/JanbhashaHeader';
import { BottomNavBar } from '../../components/common/BottomNavBar';
import { useAppStore } from '../../store/useAppStore';

export const ProfileScreen: React.FC = () => {
  const { role, setRole, navigate } = useAppStore();

  const handleSwitchRole = () => {
    navigate('RoleSelection');
  };

  const badges = [
    { title: 'Sohrai Artist', emoji: '🎨', desc: 'Decorated 5 bilingual stories' },
    { title: 'Ol Chiki Explorer', emoji: '📜', desc: 'Mastered 10 core flashcards' },
    { title: 'Classroom Hero', emoji: '🌟', desc: 'Active in 12 live lessons' },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={JanbhashaTheme.colors.creamBg} barStyle="dark-content" />
      <JanbhashaHeader showBack title="Profile & Progress" subtitle="Learner Passport" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>{role === 'teacher' ? '👩🏽‍🏫' : '👦🏽'}</Text>
          </View>
          <Text style={styles.userName}>{role === 'teacher' ? 'Teacher Sona Murmu' : 'Learner Birsa Hembram'}</Text>
          <Text style={styles.userRoleBadge}>
            {role === 'teacher' ? 'Classroom Educator' : 'Grade 2 Primary Student'}
          </Text>
          <Text style={styles.schoolName}>Govt. Tribal Primary School • Mayurbhanj</Text>
        </View>

        {/* Learning Badges & Stamps */}
        <Text style={styles.sectionTitle}>Achievements & Learning Stamps</Text>
        <View style={styles.badgesList}>
          {badges.map((b, i) => (
            <View key={i} style={styles.badgeCard}>
              <Text style={styles.badgeEmoji}>{b.emoji}</Text>
              <View style={styles.badgeTextBox}>
                <Text style={styles.badgeTitle}>{b.title}</Text>
                <Text style={styles.badgeDesc}>{b.desc}</Text>
              </View>
              <Text style={styles.stampIcon}>✓</Text>
            </View>
          ))}
        </View>

        {/* Role & Session Switcher */}
        <View style={styles.actionsBox}>
          <TouchableOpacity style={styles.switchRoleBtn} onPress={handleSwitchRole} activeOpacity={0.8}>
            <Text style={styles.switchRoleText}>🔄 Switch Role (Teacher / Student)</Text>
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
    backgroundColor: JanbhashaTheme.colors.creamBg,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 32,
  },
  userCard: {
    backgroundColor: JanbhashaTheme.colors.white,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.cardBorder,
    padding: 22,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: JanbhashaTheme.colors.mintTag,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarEmoji: {
    fontSize: 42,
  },
  userName: {
    fontSize: 20,
    fontWeight: '800',
    color: JanbhashaTheme.colors.charcoalText,
    marginBottom: 4,
  },
  userRoleBadge: {
    fontSize: 12,
    fontWeight: '700',
    color: JanbhashaTheme.colors.deepGreen,
    backgroundColor: JanbhashaTheme.colors.mintTag,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  schoolName: {
    fontSize: 12,
    color: JanbhashaTheme.colors.mutedText,
    textAlign: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: JanbhashaTheme.colors.mutedText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  badgesList: {
    gap: 10,
    marginBottom: 24,
  },
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: JanbhashaTheme.colors.white,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.cardBorder,
    padding: 14,
    elevation: 2,
  },
  badgeEmoji: {
    fontSize: 28,
    marginRight: 14,
  },
  badgeTextBox: {
    flex: 1,
  },
  badgeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: JanbhashaTheme.colors.charcoalText,
    marginBottom: 2,
  },
  badgeDesc: {
    fontSize: 11,
    color: JanbhashaTheme.colors.mutedText,
  },
  stampIcon: {
    fontSize: 16,
    fontWeight: '800',
    color: JanbhashaTheme.colors.deepGreen,
    backgroundColor: JanbhashaTheme.colors.mintTag,
    width: 28,
    height: 28,
    borderRadius: 14,
    textAlign: 'center',
    lineHeight: 28,
  },
  actionsBox: {
    marginTop: 10,
  },
  switchRoleBtn: {
    backgroundColor: JanbhashaTheme.colors.white,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.deepGreen,
    paddingVertical: 14,
    alignItems: 'center',
  },
  switchRoleText: {
    fontSize: 14,
    fontWeight: '800',
    color: JanbhashaTheme.colors.deepGreen,
  },
});
