import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme';

import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { TeacherVerificationScreen } from '../pages/admin/TeacherVerificationScreen';
import { StudentManagementScreen } from '../pages/admin/StudentManagementScreen';
import { TeacherManagementScreen } from '../pages/admin/TeacherManagementScreen';
import { SchoolManagementScreen } from '../pages/admin/SchoolManagementScreen';
import { AccountRecoveryScreen } from '../pages/admin/AccountRecoveryScreen';
import { LanguagePackManagementScreen } from '../pages/admin/LanguagePackManagementScreen';
import { ContentManagementScreen } from '../pages/admin/ContentManagementScreen';
import { DatabaseBackupScreen } from '../pages/admin/DatabaseBackupScreen';
import { SystemDiagnosticsScreen } from '../pages/admin/SystemDiagnosticsScreen';
import { AdminSettingsScreen } from '../pages/admin/AdminSettingsScreen';
import { SettingsScreen } from '../pages/common/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
      <Stack.Screen name="TeacherVerification" component={TeacherVerificationScreen} />
      <Stack.Screen name="AccountRecovery" component={AccountRecoveryScreen} />
      <Stack.Screen name="DatabaseBackup" component={DatabaseBackupScreen} />
      <Stack.Screen name="SystemDiagnostics" component={SystemDiagnosticsScreen} />
    </Stack.Navigator>
  );
}

function UsersStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TeacherManagement" component={TeacherManagementScreen} />
      <Stack.Screen name="StudentManagement" component={StudentManagementScreen} />
      <Stack.Screen name="SchoolManagement" component={SchoolManagementScreen} />
    </Stack.Navigator>
  );
}

function ContentStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ContentManagement" component={ContentManagementScreen} />
      <Stack.Screen name="LanguagePackManagement" component={LanguagePackManagementScreen} />
    </Stack.Navigator>
  );
}

export function AdminNavigator() {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.admin,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border, height: 60, paddingBottom: 8 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, string> = {
            Dashboard: focused ? 'grid' : 'grid-outline',
            Users: focused ? 'people' : 'people-outline',
            Content: focused ? 'library' : 'library-outline',
            System: focused ? 'hardware-chip' : 'hardware-chip-outline',
            Settings: focused ? 'settings' : 'settings-outline',
          };
          return <Ionicons name={icons[route.name] as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardStack} options={{ tabBarLabel: t('nav.dashboard') }} />
      <Tab.Screen name="Users" component={UsersStack} options={{ tabBarLabel: t('nav.users') }} />
      <Tab.Screen name="Content" component={ContentStack} options={{ tabBarLabel: t('nav.content') }} />
      <Tab.Screen name="System" component={AdminSettingsScreen} options={{ tabBarLabel: t('nav.system') }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: t('nav.settings') }} />
    </Tab.Navigator>
  );
}
