import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { JanbhashaTheme } from '../../theme/janbhashaTheme';
import { useAppStore, AppScreen } from '../../store/useAppStore';

interface NavItem {
  key: string;
  label: string;
  icon: string;
  targetScreen: AppScreen;
  isCenter?: boolean;
}

export const BottomNavBar: React.FC = () => {
  const { role, currentScreen, navigate } = useAppStore();

  const teacherItems: NavItem[] = [
    { key: 'home', label: 'Home', icon: '🏠', targetScreen: 'TeacherDashboard' },
    { key: 'classroom', label: 'Class', icon: '📡', targetScreen: 'Classroom' },
    { key: 'translate', label: 'Voice AI', icon: '🎙️', targetScreen: 'LiveTranslation', isCenter: true },
    { key: 'library', label: 'Curriculum', icon: '📚', targetScreen: 'Curriculum' },
    { key: 'settings', label: 'Settings', icon: '⚙️', targetScreen: 'Settings' },
  ];

  const studentItems: NavItem[] = [
    { key: 'home', label: 'Home', icon: '🏠', targetScreen: 'StudentDashboard' },
    { key: 'learn', label: 'Curriculum', icon: '📖', targetScreen: 'Curriculum' },
    { key: 'translate', label: 'Translate', icon: '🎙️', targetScreen: 'LiveTranslation', isCenter: true },
    { key: 'practice', label: 'Cards', icon: '🗂️', targetScreen: 'Flashcards' },
    { key: 'profile', label: 'Profile', icon: '👤', targetScreen: 'Profile' },
  ];

  const items = role === 'student' ? studentItems : teacherItems;

  return (
    <View style={styles.container}>
      {items.map((item) => {
        const isActive = currentScreen === item.targetScreen;
        if (item.isCenter) {
          return (
            <TouchableOpacity
              key={item.key}
              style={styles.centerTabItem}
              onPress={() => navigate(item.targetScreen)}
              activeOpacity={0.8}
            >
              <View style={[styles.centerBubble, isActive && styles.centerBubbleActive]}>
                <Text style={styles.centerIcon}>{item.icon}</Text>
              </View>
              <Text style={[styles.centerLabel, isActive && styles.activeLabel]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          );
        }

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
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLowest,
    borderTopWidth: 1,
    borderTopColor: JanbhashaTheme.colors.surfaceContainerHigh,
    paddingVertical: 8,
    paddingBottom: 14,
    justifyContent: 'space-around',
    elevation: 8,
    shadowColor: JanbhashaTheme.colors.shadowColor,
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
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
    color: JanbhashaTheme.colors.onSurfaceVariant,
  },
  activeLabel: {
    color: JanbhashaTheme.colors.primary,
    fontWeight: '800',
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: JanbhashaTheme.colors.primary,
    marginTop: 2,
  },
  centerTabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: -16,
  },
  centerBubble: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: JanbhashaTheme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: JanbhashaTheme.colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  centerBubbleActive: {
    backgroundColor: JanbhashaTheme.colors.secondary,
  },
  centerIcon: {
    fontSize: 22,
  },
  centerLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: JanbhashaTheme.colors.onSurfaceVariant,
    marginTop: 2,
  },
});
