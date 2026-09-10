import React, { useEffect } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import { useAppStore } from './src/store/useAppStore';
import { JanbhashaTheme } from './src/theme/janbhashaTheme';

// Screens
import { SplashScreen } from './src/screens/onboarding/SplashScreen';
import { LanguageSelectionScreen } from './src/screens/onboarding/LanguageSelectionScreen';
import { RoleSelectionScreen } from './src/screens/onboarding/RoleSelectionScreen';
import { TeacherDashboardScreen } from './src/screens/dashboard/TeacherDashboardScreen';
import { StudentDashboardScreen } from './src/screens/dashboard/StudentDashboardScreen';
import { LiveTranslationScreen } from './src/screens/translator/LiveTranslationScreen';
import { AudioOutputScreen } from './src/screens/settings/AudioOutputScreen';
import { ClassroomScreen } from './src/screens/classroom/ClassroomScreen';
import { CurriculumScreen } from './src/screens/curriculum/CurriculumScreen';
import { LessonDetailsScreen } from './src/screens/curriculum/LessonDetailsScreen';
import { WorksheetScreen } from './src/screens/pdf/WorksheetScreen';
import { FlashcardsScreen } from './src/screens/flashcards/FlashcardsScreen';
import { ModelStatusScreen } from './src/screens/settings/ModelStatusScreen';
import { SettingsScreen } from './src/screens/settings/SettingsScreen';
import { ProfileScreen } from './src/screens/profile/ProfileScreen';
import { VoiceConversationScreen } from './src/screens/conversation/VoiceConversationScreen';
import { OfflineDictionaryScreen } from './src/screens/dictionary/OfflineDictionaryScreen';
import { OfflineModelManagerScreen } from './src/screens/settings/OfflineModelManagerScreen';

export default function App() {
  const { currentScreen, goBack, refreshHealth } = useAppStore();

  useEffect(() => {
    refreshHealth();

    const onBackPress = () => {
      if (currentScreen !== 'Splash' && currentScreen !== 'TeacherDashboard' && currentScreen !== 'StudentDashboard') {
        goBack();
        return true;
      }
      return false;
    };

    const sub = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => sub.remove();
  }, [currentScreen, goBack, refreshHealth]);

  const renderCurrentScreen = () => {
    switch (currentScreen) {
      case 'Splash':
        return <SplashScreen />;
      case 'LanguageSelection':
        return <LanguageSelectionScreen />;
      case 'RoleSelection':
        return <RoleSelectionScreen />;
      case 'TeacherDashboard':
        return <TeacherDashboardScreen />;
      case 'StudentDashboard':
        return <StudentDashboardScreen />;
      case 'LiveTranslation':
        return <LiveTranslationScreen />;
      case 'AudioOutput':
        return <AudioOutputScreen />;
      case 'Classroom':
      case 'StudentClassroom':
        return <ClassroomScreen />;
      case 'Curriculum':
        return <CurriculumScreen />;
      case 'LessonDetails':
        return <LessonDetailsScreen />;
      case 'Worksheets':
        return <WorksheetScreen />;
      case 'Flashcards':
        return <FlashcardsScreen />;
      case 'ModelStatus':
        return <ModelStatusScreen />;
      case 'Settings':
        return <SettingsScreen />;
      case 'Profile':
        return <ProfileScreen />;
      case 'VoiceConversation':
        return <VoiceConversationScreen />;
      case 'OfflineDictionary':
        return <OfflineDictionaryScreen />;
      case 'OfflineModelManager':
        return <OfflineModelManagerScreen />;
      default:
        return <TeacherDashboardScreen />;
    }
  };

  return <View style={styles.container}>{renderCurrentScreen()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: JanbhashaTheme.colors.creamBg,
  },
});
