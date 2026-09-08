import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { BootValidationScreen } from './src/screens/boot/BootValidationScreen';
import { TeacherDashboardScreen } from './src/screens/dashboard/TeacherDashboardScreen';
import { LiveClassroomScreen } from './src/screens/classroom/LiveClassroomScreen';
import { BilingualPdfGeneratorScreen } from './src/screens/pdf/BilingualPdfGeneratorScreen';
import { NipunFlashcardsScreen } from './src/screens/flashcards/NipunFlashcardsScreen';
import { NeumorphicButton } from './src/components/common/NeumorphicButton';
import { Colors } from './src/theme/colors';

export default function App() {
  const [isBooted, setIsBooted] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<string>('Dashboard');

  if (!isBooted) {
    return <BootValidationScreen onValidated={() => setIsBooted(true)} />;
  }

  const renderScreen = () => {
    switch (currentScreen) {
      case 'LiveClassroom':
        return <LiveClassroomScreen />;
      case 'BilingualPdf':
        return <BilingualPdfGeneratorScreen />;
      case 'NipunFlashcards':
        return <NipunFlashcardsScreen />;
      default:
        return <TeacherDashboardScreen onNavigate={(screen) => setCurrentScreen(screen)} />;
    }
  };

  return (
    <View style={styles.container}>
      {currentScreen !== 'Dashboard' && (
        <View style={styles.topBackNav}>
          <NeumorphicButton
            onPress={() => setCurrentScreen('Dashboard')}
            zone="primary"
            title="◀ DASHBOARD"
            style={styles.backBtn}
          />
        </View>
      )}
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.slate,
  },
  topBackNav: {
    backgroundColor: Colors.background.slate,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 4,
    zIndex: 10,
  },
  backBtn: {
    minHeight: 48,
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
  },
});
