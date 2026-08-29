import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme';

import { StudentDashboard } from '../pages/student/StudentDashboard';
import { LearningPathScreen } from '../pages/student/LearningPathScreen';
import { LessonsListScreen } from '../pages/student/LessonsListScreen';
import { LessonDetailScreen } from '../pages/student/LessonDetailScreen';
import { StoryModeScreen } from '../pages/student/StoryModeScreen';
import { FlashcardsScreen } from '../pages/student/FlashcardsScreen';
import { QuizScreen } from '../pages/student/QuizScreen';
import { AIExplainScreen } from '../pages/student/AIExplainScreen';
import { ProgressScreen } from '../pages/student/ProgressScreen';
import { BadgesScreen } from '../pages/student/BadgesScreen';
import { StudentProfileScreen } from '../pages/student/StudentProfileScreen';
import { JoinClassroomScreen } from '../pages/student/JoinClassroomScreen';
import { StudentClassroomScreen } from '../pages/student/StudentClassroomScreen';
import { SettingsScreen } from '../pages/common/SettingsScreen';
import { AccessibilityScreen } from '../pages/common/AccessibilityScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudentDashboard" component={StudentDashboard} />
      <Stack.Screen name="StudentProfile" component={StudentProfileScreen} />
      <Stack.Screen name="JoinClassroom" component={JoinClassroomScreen} />
      <Stack.Screen name="StudentClassroom" component={StudentClassroomScreen} />
      <Stack.Screen name="Accessibility" component={AccessibilityScreen} />
    </Stack.Navigator>
  );
}

function LearnStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LearningPath" component={LearningPathScreen} />
      <Stack.Screen name="LessonsList" component={LessonsListScreen} />
      <Stack.Screen name="LessonDetail" component={LessonDetailScreen} />
      <Stack.Screen name="StoryMode" component={StoryModeScreen} />
      <Stack.Screen name="Flashcards" component={FlashcardsScreen} />
      <Stack.Screen name="Quiz" component={QuizScreen} />
    </Stack.Navigator>
  );
}

function ProgressStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Progress" component={ProgressScreen} />
      <Stack.Screen name="Badges" component={BadgesScreen} />
    </Stack.Navigator>
  );
}

export function StudentNavigator() {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.secondary,
        tabBarInactiveTintColor: theme.colors.textMuted,
        tabBarStyle: { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border, height: 60, paddingBottom: 8 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, string> = {
            Home: focused ? 'home' : 'home-outline',
            Learn: focused ? 'book' : 'book-outline',
            AI: focused ? 'bulb' : 'bulb-outline',
            Progress: focused ? 'trophy' : 'trophy-outline',
            Settings: focused ? 'settings' : 'settings-outline',
          };
          return <Ionicons name={icons[route.name] as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} options={{ tabBarLabel: t('nav.home') }} />
      <Tab.Screen name="Learn" component={LearnStack} options={{ tabBarLabel: t('nav.learn') }} />
      <Tab.Screen name="AI" component={AIExplainScreen} options={{ tabBarLabel: t('nav.ai') }} />
      <Tab.Screen name="Progress" component={ProgressStack} options={{ tabBarLabel: t('nav.progress') }} />
      <Tab.Screen name="Settings" component={SettingsScreen} options={{ tabBarLabel: t('nav.settings') }} />
    </Tab.Navigator>
  );
}
