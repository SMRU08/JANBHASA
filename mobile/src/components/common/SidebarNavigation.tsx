import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { JanbhashaTheme } from '../../theme/janbhashaTheme';
import { useAppStore, AppScreen } from '../../store/useAppStore';

interface NavItem {
  key: string;
  label: string;
  icon: string;
  targetScreen: AppScreen;
}

export const SidebarNavigation: React.FC = () => {
  const { role, currentScreen, navigate, audioOutput, selectedBluetoothDevice } = useAppStore();

  const teacherItems: NavItem[] = [
    { key: 'home', label: 'Dashboard', icon: '🏠', targetScreen: 'TeacherDashboard' },
    { key: 'translate', label: 'Voice AI Pipeline', icon: '🎙️', targetScreen: 'LiveTranslation' },
    { key: 'classroom', label: 'Classroom Broadcast', icon: '📡', targetScreen: 'Classroom' },
    { key: 'curriculum', label: 'Curriculum & Lessons', icon: '📚', targetScreen: 'Curriculum' },
    { key: 'worksheets', label: 'Worksheet Generator', icon: '📝', targetScreen: 'Worksheets' },
    { key: 'audio', label: 'Audio & Bluetooth', icon: '🔊', targetScreen: 'AudioOutput' },
    { key: 'status', label: 'AI Model Health', icon: '🧠', targetScreen: 'ModelStatus' },
    { key: 'settings', label: 'Settings', icon: '⚙️', targetScreen: 'Settings' },
  ];

  const studentItems: NavItem[] = [
    { key: 'home', label: 'Student Home', icon: '🏠', targetScreen: 'StudentDashboard' },
    { key: 'translate', label: 'Voice Translation', icon: '🎙️', targetScreen: 'LiveTranslation' },
    { key: 'curriculum', label: 'My Subjects', icon: '📖', targetScreen: 'Curriculum' },
    { key: 'classroom', label: 'Classroom Receiver', icon: '🎒', targetScreen: 'StudentClassroom' },
    { key: 'flashcards', label: 'Ol Chiki Flashcards', icon: '🗂️', targetScreen: 'Flashcards' },
    { key: 'profile', label: 'My Profile', icon: '👤', targetScreen: 'Profile' },
  ];

  const items = role === 'student' ? studentItems : teacherItems;

  return (
    <View style={styles.sidebar}>
      {/* Brand Header */}
      <View style={styles.brandHeader}>
        <View style={styles.sproutBadge}>
          <Text style={{ fontSize: 20 }}>🌱</Text>
        </View>
        <View>
          <Text style={styles.brandTitle}>
            <Text style={{ color: JanbhashaTheme.colors.primary }}>JAN</Text>
            <Text style={{ color: JanbhashaTheme.colors.secondary }}>BHASHA</Text>
          </Text>
          <Text style={styles.offlineSubtitle}>100% Offline AI Bridge</Text>
        </View>
      </View>

      {/* Nav List */}
      <View style={styles.navList}>
        {items.map((item) => {
          const isActive = currentScreen === item.targetScreen;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.navButton, isActive && styles.navButtonActive]}
              onPress={() => navigate(item.targetScreen)}
              activeOpacity={0.7}
            >
              <Text style={styles.navIcon}>{item.icon}</Text>
              <Text style={[styles.navLabel, isActive && styles.navLabelActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Bottom Status Card */}
      <View style={styles.bottomStatusCard}>
        <View style={styles.statusRow}>
          <View style={styles.activeDot} />
          <Text style={styles.statusText}>On-Device AI Active</Text>
        </View>
        <Text style={styles.statusSub}>
          {audioOutput === 'bluetooth' && selectedBluetoothDevice
            ? `BT: ${selectedBluetoothDevice.name}`
            : 'Speaker: Built-in'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 260,
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLowest,
    borderRightWidth: 1,
    borderRightColor: JanbhashaTheme.colors.surfaceContainerHigh,
    paddingVertical: 24,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  brandHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 28,
    paddingHorizontal: 8,
  },
  sproutBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: JanbhashaTheme.colors.mintTag,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 1,
  },
  offlineSubtitle: {
    fontSize: 10,
    color: JanbhashaTheme.colors.onSurfaceVariant,
    fontWeight: '600',
  },
  navList: {
    flex: 1,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: JanbhashaTheme.borderRadius.lg,
    marginBottom: 6,
  },
  navButtonActive: {
    backgroundColor: JanbhashaTheme.colors.surfaceContainer,
  },
  navIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  navLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: JanbhashaTheme.colors.onSurfaceVariant,
  },
  navLabelActive: {
    color: JanbhashaTheme.colors.primary,
    fontWeight: '800',
  },
  bottomStatusCard: {
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLow,
    borderRadius: JanbhashaTheme.borderRadius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.outlineVariant,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: JanbhashaTheme.colors.primary,
    marginRight: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: JanbhashaTheme.colors.onSurface,
  },
  statusSub: {
    fontSize: 10,
    color: JanbhashaTheme.colors.onSurfaceVariant,
  },
});
