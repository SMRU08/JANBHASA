import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { JanbhashaTheme } from '../../theme/janbhashaTheme';
import { useAppStore, AppScreen } from '../../store/useAppStore';

interface NavItem {
  key: string;
  label: string;
  icon: string;
  targetScreen: AppScreen;
}

export const BottomNavBar: React.FC = () => {
  const { role, currentScreen, navigate } = useAppStore();

  const teacherItems: NavItem[] = [
    { key: 'home', label: 'Home', icon: '🏠', targetScreen: 'TeacherDashboard' },
    { key: 'classroom', label: 'Classroom', icon: '📡', targetScreen: 'Classroom' },
    { key: 'library', label: 'Library', icon: '📚', targetScreen: 'Curriculum' },
    { key: 'settings', label: 'Settings', icon: '⚙️', targetScreen: 'Settings' },
  ];

  const studentItems: NavItem[] = [
    { key: 'home', label: 'Home', icon: '🏠', targetScreen: 'StudentDashboard' },
    { key: 'learn', label: 'Learn', icon: '📖', targetScreen: 'Curriculum' },
    { key: 'classroom', label: 'Classroom', icon: '🎒', targetScreen: 'StudentClassroom' },
    { key: 'profile', label: 'Profile', icon: '👤', targetScreen: 'Profile' },
  ];

  const items = role === 'student' ? studentItems : teacherItems;

  return (
    <View style={styles.container}>
      {items.map((item) => {
        const isActive = currentScreen === item.targetScreen;
        return (
          <TouchableOpacity
            key={item.key}
            style={styles.tabItem}
            onPress={() => navigate(item.targetScreen)}
            activeOpacity={0.7}
          >
            <Text style={[styles.icon, isActive && styles.activeIcon]}>{item.icon}</Text>
            <Text style={[styles.label, isActive && styles.activeLabel]}>{item.label}</Text>
            {isActive && <View style={styles.activeDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: JanbhashaTheme.colors.white,
    borderTopWidth: 1,
    borderTopColor: JanbhashaTheme.colors.subtleDivider,
    paddingVertical: 8,
    paddingBottom: 12,
    justifyContent: 'space-around',
    elevation: 8,
    shadowColor: JanbhashaTheme.colors.shadowColor,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 20,
    marginBottom: 2,
    opacity: 0.65,
  },
  activeIcon: {
    opacity: 1,
    transform: [{ scale: 1.1 }],
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    color: JanbhashaTheme.colors.mutedText,
  },
  activeLabel: {
    color: JanbhashaTheme.colors.deepGreen,
    fontWeight: '800',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: JanbhashaTheme.colors.deepGreen,
    marginTop: 2,
  },
});
