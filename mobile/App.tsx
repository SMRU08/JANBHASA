import React, { useEffect } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import { useAppStore } from './src/store/useAppStore';
import { JanbhashaTheme } from './src/theme/janbhashaTheme';
import { useResponsive } from './src/hooks/useResponsive';
import { SidebarNavigation } from './src/components/common/SidebarNavigation';

// Screens
import { SplashScreen } from './src/screens/onboarding/SplashScreen';
import { WelcomeScreen } from './src/screens/onboarding/WelcomeScreen';
import { LanguageSelectionScreen } from './src/screens/onboarding/LanguageSelectionScreen';
import { RoleSelectionScreen } from './src/screens/onboarding/RoleSelectionScreen';
import { TeacherLoginScreen } from './src/screens/onboarding/TeacherLoginScreen';
import { StudentLoginScreen } from './src/screens/onboarding/StudentLoginScreen';
import { TeacherDashboardScreen } from './src/screens/dashboard/TeacherDashboardScreen';
import { StudentDashboardScreen } from './src/screens/dashboard/StudentDashboardScreen';
import { LiveTranslationScreen } from './src/screens/translator/LiveTranslationScreen';
import { TranslationResultScreen } from './src/screens/translator/TranslationResultScreen';
import { AudioOutputScreen } from './src/screens/settings/AudioOutputScreen';
import { BluetoothDeviceScreen } from './src/screens/settings/BluetoothDeviceScreen';
import { ClassroomScreen } from './src/screens/classroom/ClassroomScreen';
import { StudentClassroomScreen } from './src/screens/classroom/StudentClassroomScreen';
import { CurriculumScreen } from './src/screens/curriculum/CurriculumScreen';
import { LessonDetailsScreen } from './src/screens/curriculum/LessonDetailsScreen';
import { WorksheetScreen } from './src/screens/pdf/WorksheetScreen';
import { BilingualPdfGeneratorScreen } from './src/screens/pdf/BilingualPdfGeneratorScreen';
import { FlashcardsScreen } from './src/screens/flashcards/FlashcardsScreen';
import { ModelStatusScreen } from './src/screens/settings/ModelStatusScreen';
import { SettingsScreen } from './src/screens/settings/SettingsScreen';
import { ProfileScreen } from './src/screens/profile/ProfileScreen';
import { VoiceConversationScreen } from './src/screens/conversation/VoiceConversationScreen';
import { OfflineDictionaryScreen } from './src/screens/dictionary/OfflineDictionaryScreen';
import { OfflineModelManagerScreen } from './src/screens/settings/OfflineModelManagerScreen';

export default function App() {
  const { currentScreen, goBack, refreshHealth } = useAppStore();
  const { isTablet, isDesktop } = useResponsive();

  useEffect(() => {
    refreshHealth();

    const onBackPress = () => {
      if (
        currentScreen !== 'Splash' &&
        currentScreen !== 'Welcome' &&
        currentScreen !== 'TeacherDashboard' &&
        currentScreen !== 'StudentDashboard'
      ) {
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
      case 'Welcome':
        return <WelcomeScreen />;
      case 'LanguageSelection':
        return <LanguageSelectionScreen />;
      case 'RoleSelection':
        return <RoleSelectionScreen />;
      case 'TeacherLogin':
        return <TeacherLoginScreen />;
      case 'StudentLogin':
        return <StudentLoginScreen />;
      case 'TeacherDashboard':
        return <TeacherDashboardScreen />;
      case 'StudentDashboard':
        return <StudentDashboardScreen />;
      case 'LiveTranslation':
        return <LiveTranslationScreen />;
      case 'TranslationResult':
        return <TranslationResultScreen />;
      case 'AudioOutput':
        return <AudioOutputScreen />;
      case 'BluetoothDevice':
        return <BluetoothDeviceScreen />;
      case 'Classroom':
        return <ClassroomScreen />;
      case 'StudentClassroom':
        return <StudentClassroomScreen />;
      case 'Curriculum':
        return <CurriculumScreen />;
      case 'LessonDetails':
        return <LessonDetailsScreen />;
      case 'Worksheets':
        return <WorksheetScreen />;
      case 'BilingualPdfGenerator':
        return <BilingualPdfGeneratorScreen />;
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

  const isOnboarding =
    currentScreen === 'Splash' ||
    currentScreen === 'Welcome' ||
    currentScreen === 'LanguageSelection' ||
    currentScreen === 'RoleSelection' ||
    currentScreen === 'TeacherLogin' ||
    currentScreen === 'StudentLogin';

  const showSidebar = (isTablet || isDesktop) && !isOnboarding;

  return (
    <View style={styles.container}>
      {showSidebar ? (
        <View style={styles.rowLayout}>
          <SidebarNavigation />
          <View style={styles.mainContent}>{renderCurrentScreen()}</View>
        </View>
      ) : (
        renderCurrentScreen()
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: JanbhashaTheme.colors.surface,
  },
  rowLayout: {
    flex: 1,
    flexDirection: 'row',
  },
  mainContent: {
    flex: 1,
  },
});
