import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme';

// Teacher Screens
import { TeacherDashboard } from '../pages/teacher/TeacherDashboard';
import { ClassroomManagementScreen } from '../pages/teacher/ClassroomManagementScreen';
import { ClassroomModeScreen } from '../pages/teacher/ClassroomModeScreen';
import { LiveClassroomScreen } from '../pages/teacher/LiveClassroomScreen';
import { AssignmentsScreen } from '../pages/teacher/AssignmentsScreen';
import { HomeworkCreateScreen } from '../pages/teacher/HomeworkCreateScreen';
import { TeacherAnalyticsScreen } from '../pages/teacher/TeacherAnalyticsScreen';
import { VoiceTranslationScreen } from '../pages/teacher/VoiceTranslationScreen';
import { OCRScannerScreen } from '../pages/teacher/OCRScannerScreen';
import { OMRScannerScreen } from '../pages/teacher/OMRScannerScreen';
import { TeacherProfileScreen } from '../pages/teacher/TeacherProfileScreen';
import { WorksheetGeneratorScreen } from '../pages/teacher/WorksheetGeneratorScreen';
import { SettingsScreen } from '../pages/common/SettingsScreen';
import { AccessibilityScreen } from '../pages/common/AccessibilityScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TeacherDashboard" component={TeacherDashboard} />
      <Stack.Screen name="TeacherProfile" component={TeacherProfileScreen} />
      <Stack.Screen name="TeacherAnalytics" component={TeacherAnalyticsScreen} />
    </Stack.Navigator>
  );
}

function ClassroomStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ClassroomManagement" component={ClassroomManagementScreen} />
      <Stack.Screen name="ClassroomMode" component={ClassroomModeScreen} />
      <Stack.Screen name="LiveClassroom" component={LiveClassroomScreen} />
    </Stack.Navigator>
  );
}

function AssignmentsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Assignments" component={AssignmentsScreen} />
      <Stack.Screen name="HomeworkCreate" component={HomeworkCreateScreen} />
    </Stack.Navigator>
  );
}

function AIStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VoiceTranslation" component={VoiceTranslationScreen} />
      <Stack.Screen name="OCRScanner" component={OCRScannerScreen} />
      <Stack.Screen name="OMRScanner" component={OMRScannerScreen} />
      <Stack.Screen name="WorksheetGenerator" component={WorksheetGeneratorScreen} />
    </Stack.Navigator>
  );
}

export function TeacherNavigator() {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border, height: 60, paddingBottom: 8 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, string> = {
            Home: focused ? 'home' : 'home-outline',
            Classroom: focused ? 'school' : 'school-outline',
            Assignments: focused ? 'document-text' : 'document-text-outline',
            AI: focused ? 'mic' : 'mic-outline',
            Settings: focused ? 'settings' : 'settings-outline',
          };
          return <Ionicons name={icons[route.name] as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} options={{ tabBarLabel: t('nav.home') }} />
      <Tab.Screen name="Classroom" component={ClassroomStack} options={{ tabBarLabel: t('nav.classroom') }} />
      <Tab.Screen name="Assignments" component={AssignmentsStack} options={{ tabBarLabel: t('nav.assignments') }} />
      <Tab.Screen name="AI" component={AIStack} options={{ tabBarLabel: t('nav.ai') }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: t('nav.settings') }} />
    </Tab.Navigator>
  );
}
