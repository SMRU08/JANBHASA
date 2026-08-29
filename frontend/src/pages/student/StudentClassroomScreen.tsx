import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { LiveWaveform } from '../../components/LiveWaveform';

export function StudentClassroomScreen() {
  const nav = useNavigation<any>();

  const [activeMode, setActiveMode] = useState<'listening' | 'speaking'>('listening');
  const [isPlayingAudio, setIsPlayingAudio] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [isStudentMicActive, setIsStudentMicActive] = useState(false);

  const teacherHindi = 'हमारा विषय है - जल संरक्षण की आवश्यकता।';
  const translatedOdia = 'ଆମର ବିଷୟ ହେଉଛି - ଜଳ ସଂରକ୍ଷଣର ଆବଶ୍ୟକତା ।';

  const studentOdiaQuery = 'ମେଡମ, ପାଣି ବଞ୍ଚାଇବା ପାଇଁ ଆମେ କଣ କରିପାରିବା ?';
  const studentTranslatedHindi = 'मैडम, पानी बचाने के लिए हम क्या कर सकते हैं?';

  const handleSpeak = (text: string) => {
    Speech.stop();
    Speech.speak(text, { language: 'hi-IN', rate: 0.85 });
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#030712', '#0B132B', '#030712']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Top Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>

        <View style={styles.headerTabs}>
          <TouchableOpacity
            onPress={() => setActiveMode('listening')}
            style={[styles.tab, activeMode === 'listening' && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeMode === 'listening' && styles.tabTextActive]}>
              Hear Teacher (Odia)
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveMode('speaking')}
            style={[styles.tab, activeMode === 'speaking' && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeMode === 'speaking' && styles.tabTextActive]}>
              Ask Teacher
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.liveTag}>
          <View style={styles.liveDot} />
          <Text style={styles.liveTagText}>LIVE</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {activeMode === 'listening' ? (
          /* PANEL 2: STUDENT HEARS IN ODIA */
          <View style={styles.content}>
            {/* Hearing Banner */}
            <View style={styles.hearingBanner}>
              <Ionicons name="headset" size={18} color="#38BDF8" />
              <Text style={styles.hearingBannerText}>You are hearing in Odia</Text>
              <View style={styles.waveMiniPill}>
                <Ionicons name="volume-high" size={14} color="#10B981" />
              </View>
            </View>

            {/* Live Odia Translation Card */}
            <View style={styles.translationCard}>
              <Text style={styles.cardSectionTag}>Live Translation (Odia)</Text>
              <Text style={styles.mainOdiaText}>{translatedOdia}</Text>

              {/* Spectrum Audio Waveform */}
              <LiveWaveform state="speaking" height={70} barCount={26} />

              <View style={styles.audioControlsRow}>
                <TouchableOpacity
                  onPress={() => setIsPlayingAudio(!isPlayingAudio)}
                  style={styles.playbackBtn}
                >
                  <Ionicons name={isPlayingAudio ? 'pause' : 'play'} size={15} color="#FFFFFF" />
                  <Text style={styles.playbackBtnText}>{isPlayingAudio ? 'Pause' : 'Play'}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleSpeak(translatedOdia)}
                  style={styles.playbackBtn}
                >
                  <Ionicons name="refresh" size={15} color="#FFFFFF" />
                  <Text style={styles.playbackBtnText}>Replay</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Original Hindi Reference */}
            <View style={styles.originalCard}>
              <Text style={styles.originalTag}>Original (Hindi)</Text>
              <Text style={styles.originalText}>{teacherHindi}</Text>
            </View>

            {/* Auto Scroll Switch */}
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Auto Scroll</Text>
              <Switch
                value={autoScroll}
                onValueChange={setAutoScroll}
                trackColor={{ false: '#334155', true: '#10B981' }}
                thumbColor="#FFFFFF"
              />
            </View>
          </View>
        ) : (
          /* PANEL 3: STUDENT SPEAKING (ODIA) */
          <View style={styles.content}>
            {/* Student Voice Active Tag */}
            <View style={styles.studentVoiceTag}>
              <Ionicons name="mic" size={16} color="#FFFFFF" />
              <Text style={styles.studentVoiceTagText}>Student Voice Active</Text>
              <LiveWaveform state="listening" height={24} barCount={12} width={80} />
            </View>

            {/* Live Student Odia Transcript */}
            <View style={styles.translationCard}>
              <Text style={styles.cardSectionTag}>Live Transcript (Odia)</Text>
              <Text style={styles.mainOdiaText}>{studentOdiaQuery}</Text>
            </View>

            {/* Translated for Teacher (Hindi) */}
            <View style={styles.teacherReceivedCard}>
              <Text style={styles.cardSectionTag}>Translated To Hindi (Teacher)</Text>
              <Text style={styles.teacherReceivedText}>{studentTranslatedHindi}</Text>

              <TouchableOpacity
                onPress={() => handleSpeak(studentTranslatedHindi)}
                style={styles.teacherAudioPlayRow}
              >
                <Ionicons name="volume-medium" size={18} color="#60A5FA" />
                <LiveWaveform state="speaking" height={24} barCount={18} width={120} />
              </TouchableOpacity>
            </View>

            {/* Language Direction */}
            <View style={styles.directionCard}>
              <Text style={styles.directionTag}>Language Direction</Text>
              <View style={styles.directionRow}>
                <View style={styles.langPill}><Text style={styles.langPillText}>ଓଡ଼ିଆ (Odia)</Text></View>
                <Ionicons name="arrow-forward" size={16} color="#94A3B8" />
                <View style={styles.langPill}><Text style={styles.langPillText}>हिन्दी (Hindi)</Text></View>
              </View>
              <Text style={styles.sendingTag}>✓ Sending to teacher...</Text>
            </View>

            {/* Mic Push to Speak Button */}
            <TouchableOpacity
              onPress={() => setIsStudentMicActive(!isStudentMicActive)}
              style={[
                styles.studentMicButton,
                isStudentMicActive && { backgroundColor: '#EF4444' },
              ]}
            >
              <Ionicons name={isStudentMicActive ? 'mic-off' : 'mic'} size={28} color="#FFFFFF" />
              <Text style={styles.studentMicButtonText}>
                {isStudentMicActive ? 'Release to Send' : 'Hold / Tap to Speak (Odia)'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  iconBtn: {
    padding: 6,
  },
  headerTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 12,
    padding: 2,
  },
  tab: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#2563EB',
  },
  tabText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  liveTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  liveTagText: {
    color: '#EF4444',
    fontSize: 10,
    fontWeight: '900',
  },
  scroll: {
    padding: 16,
    paddingBottom: 36,
  },
  content: {
    gap: 14,
  },
  hearingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  hearingBannerText: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
  },
  waveMiniPill: {
    padding: 4,
  },
  translationCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: 'rgba(56, 189, 248, 0.4)',
    padding: 16,
  },
  cardSectionTag: {
    color: '#38BDF8',
    fontSize: 11,
    fontWeight: '800',
    marginBottom: 6,
  },
  mainOdiaText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: 10,
  },
  audioControlsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  playbackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  playbackBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  originalCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    padding: 14,
  },
  originalTag: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 4,
  },
  originalText: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 6,
  },
  switchLabel: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '700',
  },
  studentVoiceTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#059669',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  studentVoiceTagText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    flex: 1,
  },
  teacherReceivedCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(96, 165, 250, 0.3)',
    padding: 16,
  },
  teacherReceivedText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 8,
  },
  teacherAudioPlayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  directionCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.8)',
    borderRadius: 18,
    padding: 14,
  },
  directionTag: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    marginBottom: 8,
  },
  directionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  langPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  langPillText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  sendingTag: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
    marginTop: 10,
    textAlign: 'center',
  },
  studentMicButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 22,
    marginTop: 10,
    shadowColor: '#2563EB',
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  studentMicButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
