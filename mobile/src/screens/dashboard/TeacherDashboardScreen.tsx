import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView } from 'react-native';
import { Colors } from '../../theme/colors';
import { SohraiWatermark } from '../../components/common/SohraiWatermark';
import { NeumorphicButton } from '../../components/common/NeumorphicButton';

interface TeacherDashboardProps {
  onNavigate: (screen: string) => void;
}

export const TeacherDashboardScreen: React.FC<TeacherDashboardProps> = ({ onNavigate }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={Colors.background.slate} barStyle="dark-content" />
      <SohraiWatermark />

      <View style={styles.header}>
        <Text style={styles.title}>Teacher Utility Hub</Text>
        <Text style={styles.subtitle}>Santhali Bilingual Education • Class 1-5</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.actionGrid}>
          {/* Action 1: Live Classroom */}
          <NeumorphicButton
            onPress={() => onNavigate('LiveClassroom')}
            zone="recording"
            size="massive"
            title="🎤 LIVE CLASSROOM DICTATION"
            subtitle="Real-time Hindi-to-Santhali voice translation"
            style={styles.cardBtn}
          />

          {/* Action 2: PDF Worksheets */}
          <NeumorphicButton
            onPress={() => onNavigate('BilingualPdf')}
            zone="primary"
            size="massive"
            title="📄 BILINGUAL FLN WORKSHEETS"
            subtitle="On-device printable PDF worksheets with tracing"
            style={styles.cardBtn}
          />

          {/* Action 3: NIPUN Flashcards */}
          <NeumorphicButton
            onPress={() => onNavigate('NipunFlashcards')}
            zone="playback"
            size="massive"
            title="🎴 NIPUN BHARAT VOCABULARY"
            subtitle="Audio flashcards with tribal flora/fauna stamp rewards"
            style={styles.cardBtn}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: Colors.background.slate },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  title: { fontSize: 26, fontWeight: '900', color: Colors.cultural.terracotta },
  subtitle: { fontSize: 14, fontWeight: '700', color: Colors.cultural.forestGreen, marginTop: 2 },
  content: { padding: 20 },
  actionGrid: { gap: 18 },
  cardBtn: { marginBottom: 4 },
});
