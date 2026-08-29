import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../theme';

import { StudentDashboard } from '../pages/student/StudentDashboard';
import { LearnDashboardScreen } from '../pages/student/LearnDashboardScreen';
import { VoiceAiListeningScreen } from '../pages/student/VoiceAiListeningScreen';
import { VoiceAiProcessingScreen } from '../pages/student/VoiceAiProcessingScreen';
import { TranslationResultScreen } from '../pages/student/TranslationResultScreen';
import { LanguageSelectionScreen } from '../pages/student/LanguageSelectionScreen';
import { AIExplainScreen } from '../pages/student/AIExplainScreen';
import { ProgressScreen } from '../pages/student/ProgressScreen';
import { BadgesScreen } from '../pages/student/BadgesScreen';
import { StudentProfileScreen } from '../pages/student/StudentProfileScreen';
import { JoinClassroomScreen } from '../pages/student/JoinClassroomScreen';
import { StudentClassroomScreen } from '../pages/student/StudentClassroomScreen';
import { SettingsScreen } from '../pages/common/SettingsScreen';
import { OfflineModeScreen } from '../pages/common/OfflineModeScreen';
import { OCRScannerScreen } from '../pages/teacher/OCRScannerScreen';
import { LiveClassroomScreen } from '../pages/teacher/LiveClassroomScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="StudentDashboard" component={StudentDashboard} />
      <Stack.Screen name="VoiceAiListening" component={VoiceAiListeningScreen} />
      <Stack.Screen name="VoiceAiProcessing" component={VoiceAiProcessingScreen} />
      <Stack.Screen name="TranslationResult" component={TranslationResultScreen} />
      <Stack.Screen name="LanguageSelection" component={LanguageSelectionScreen} />
      <Stack.Screen name="OCRScanner" component={OCRScannerScreen} />
      <Stack.Screen name="OfflineMode" component={OfflineModeScreen} />
      <Stack.Screen name="LiveClassroom" component={LiveClassroomScreen} />
      <Stack.Screen name="StudentClassroom" component={StudentClassroomScreen} />
      <Stack.Screen name="StudentProfile" component={StudentProfileScreen} />
      <Stack.Screen name="JoinClassroom" component={JoinClassroomScreen} />
    </Stack.Navigator>
  );
}

function LearnStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="LearnDashboard" component={LearnDashboardScreen} />
      <Stack.Screen name="AIExplain" component={AIExplainScreen} />
      <Stack.Screen name="VoiceAiListening" component={VoiceAiListeningScreen} />
      <Stack.Screen name="VoiceAiProcessing" component={VoiceAiProcessingScreen} />
      <Stack.Screen name="TranslationResult" component={TranslationResultScreen} />
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
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.border,
          height: 64,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Learn"
        component={LearnStack}
        options={{
          tabBarLabel: 'Learn',
          tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Voice"
        component={VoiceAiListeningScreen}
        options={{
          tabBarLabel: '',
          tabBarIcon: () => (
            <View style={styles.centerFloatingMic}>
              <Ionicons name="mic" size={26} color="#FFFFFF" />
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Translate"
        component={TranslationResultScreen}
        options={{
          tabBarLabel: 'Translate',
          tabBarIcon: ({ color, size }) => <Ionicons name="language-outline" size={size} color={color} />,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={StudentProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  centerFloatingMic: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
