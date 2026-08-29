import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Speech from 'expo-speech';
import { LiveWaveform } from '../../components/LiveWaveform';

const { width } = Dimensions.get('window');

export function LiveClassroomScreen() {
  const nav = useNavigation<any>();

  const [isLive, setIsLive] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [selectedStudentLang, setSelectedStudentLang] = useState('Odia');
  const [activeTab, setActiveTab] = useState<'teacher' | 'two-way'>('teacher');
  const [studentCount] = useState(28);

  const teacherHindiText = 'हमारा विषय है - जल संरक्षण की आवश्यकता।';
  const studentOdiaText = 'ଆମର ବିଷୟ ହେଉଛି - ଜଳ ସଂରକ୍ଷଣର ଆବଶ୍ୟକତା ।';

  const handleSpeak = (text: string) => {
    Speech.stop();
    Speech.speak(text, { language: 'hi-IN', rate: 0.85 });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Dark Classroom Background */}
      <LinearGradient
        colors={['#0B132B', '#030712', '#0B132B']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Top Status Bar */}
      <View style={styles.topBar}>
        <View style={styles.liveIndicator}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>● LIVE</Text>
          <View style={styles.participantsBadge}>
            <Ionicons name="people" size={12} color="#FFFFFF" />
            <Text style={styles.participantsText}>{studentCount}</Text>
          </View>
        </View>

        <View style={styles.modeTabs}>
          <TouchableOpacity
            onPress={() => setActiveTab('teacher')}
            style={[styles.modeTab, activeTab === 'teacher' && styles.modeTabActive]}
          >
            <Text style={[styles.modeTabText, activeTab === 'teacher' && styles.modeTabTextActive]}>
              Teacher Hub
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('two-way')}
            style={[styles.modeTab, activeTab === 'two-way' && styles.modeTabActive]}
          >
            <Text style={[styles.modeTabText, activeTab === 'two-way' && styles.modeTabTextActive]}>
              Two-Way Live
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.networkBadge}>
          <Text style={styles.networkText}>Good Network</Text>
          <Ionicons name="cellular" size={12} color="#10B981" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {activeTab === 'teacher' ? (
          /* PANEL 1: TEACHER SPEAKING (HINDI) */
          <View style={styles.panelContent}>
            {/* Teacher Blackboard Card */}
            <View style={styles.blackboardCard}>
              <View style={styles.blackboardHeader}>
                <Text style={styles.blackboardTitle}>जल संरक्षण क्यों जरूरी हैं ?</Text>
              </View>
              <Text style={styles.blackboardBody}>
                • पानी जीवन के लिए आवश्यक है{'\n'}
                • जल बचाओ, जीवन बचाओ{'\n'}
                • इस सब की जिम्मेदारी है
              </Text>
            </View>

            {/* Teacher Audio Waveform & Live Transcript */}
            <View style={styles.teacherAudioCard}>
              <View style={styles.audioHeaderRow}>
                <Text style={styles.audioRoleTag}>Teacher (Hindi)</Text>
                <TouchableOpacity onPress={() => handleSpeak(teacherHindiText)}>
                  <Ionicons name="volume-medium" size={18} color="#60A5FA" />
                </TouchableOpacity>
              </View>
              <LiveWaveform state="listening" height={60} barCount={24} />

              <Text style={styles.transcriptTag}>Live Transcript (Hindi)</Text>
              <Text style={styles.transcriptText}>{teacherHindiText}</Text>
            </View>

            {/* Voice Output To Students Card */}
            <View style={styles.outputCard}>
              <View style={styles.outputHeader}>
                <Text style={styles.outputTag}>Voice Output To Students</Text>
                <View style={styles.langSelectPill}>
                  <Text style={styles.langSelectText}>Odia</Text>
                  <Ionicons name="chevron-down" size={12} color="#FFFFFF" />
                </View>
              </View>

              <LiveWaveform state="speaking" height={55} barCount={24} />

              <View style={styles.speakingIndicatorRow}>
                <View style={[styles.liveDot, { backgroundColor: '#10B981' }]} />
                <Text style={styles.speakingIndicatorText}>Speaking in Odia...</Text>
              </View>
            </View>
          </View>
        ) : (
          /* PANEL 4: TWO-WAY LIVE CLASSROOM COMMUNICATION */
          <View style={styles.panelContent}>
            <View style={styles.twoWayHeader}>
              <View style={styles.roleColumn}>
                <Text style={styles.roleColTitle}>Teacher (Hindi)</Text>
                <LiveWaveform state="listening" height={50} barCount={16} />
                <Text style={styles.roleColStatus}>Speaking...</Text>
              </View>

              {/* Center Bidirectional Icon */}
              <View style={styles.bidirectionalCircle}>
                <Ionicons name="swap-horizontal" size={24} color="#FFFFFF" />
              </View>

              <View style={styles.roleColumn}>
                <Text style={styles.roleColTitle}>Students (Odia)</Text>
                <LiveWaveform state="speaking" height={50} barCount={16} />
                <Text style={[styles.roleColStatus, { color: '#C084FC' }]}>Speaking...</Text>
              </View>
            </View>

            {/* Metrics Row */}
            <View style={styles.metricsGrid}>
              <View style={styles.metricBox}>
                <Text style={styles.metricBoxLabel}>Students</Text>
                <Text style={styles.metricBoxVal}>👥 {studentCount} Online</Text>
              </View>

              <View style={styles.metricBox}>
                <Text style={styles.metricBoxLabel}>Language</Text>
                <Text style={styles.metricBoxVal}>Hindi ⇄ Odia</Text>
              </View>

              <View style={styles.metricBox}>
                <Text style={styles.metricBoxLabel}>Accuracy</Text>
                <Text style={[styles.metricBoxVal, { color: '#10B981' }]}>✓ 96% High</Text>
              </View>

              <View style={styles.metricBox}>
                <Text style={styles.metricBoxLabel}>Network</Text>
                <Text style={[styles.metricBoxVal, { color: '#10B981' }]}>📶 Good</Text>
              </View>
            </View>

            {/* AI Real-time conversion banner */}
            <View style={styles.aiLiveBanner}>
              <Ionicons name="sparkles" size={14} color="#38BDF8" />
              <Text style={styles.aiLiveBannerText}>
                AI is translating and converting voice in real-time
              </Text>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Classroom Control Action Bar */}
      <View style={styles.controlsBar}>
        <TouchableOpacity
          onPress={() => nav.goBack()}
          style={styles.endClassBtn}
        >
          <Ionicons name="call" size={18} color="#FFFFFF" style={{ transform: [{ rotate: '135deg' }] }} />
          <Text style={styles.endClassText}>End Class</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsMuted(!isMuted)}
          style={[styles.controlBtn, isMuted && { backgroundColor: '#EF4444' }]}
        >
          <Ionicons name={isMuted ? 'mic-off' : 'mic'} size={18} color="#FFFFFF" />
          <Text style={styles.controlBtnText}>{isMuted ? 'Unmute' : 'Mute'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlBtn}>
          <Ionicons name="people-outline" size={18} color="#FFFFFF" />
          <Text style={styles.controlBtnText}>Students</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlBtn}>
          <Ionicons name="chatbubble-ellipses-outline" size={18} color="#FFFFFF" />
          <Text style={styles.controlBtnText}>Chat</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.controlBtn}>
          <Ionicons name="settings-outline" size={18} color="#FFFFFF" />
          <Text style={styles.controlBtnText}>Settings</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  liveText: {
    color: '#EF4444',
    fontSize: 11,
    fontWeight: '900',
  },
  participantsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  participantsText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
  },
  modeTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 12,
    padding: 2,
  },
  modeTab: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  modeTabActive: {
    backgroundColor: '#3B82F6',
  },
  modeTabText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  modeTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  networkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  networkText: {
    color: '#10B981',
    fontSize: 10,
    fontWeight: '700',
  },
  scroll: {
    padding: 16,
    paddingBottom: 30,
  },
  panelContent: {
    gap: 14,
  },
  blackboardCard: {
    backgroundColor: '#064E3B',
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#78350F',
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  blackboardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
    paddingBottom: 8,
    marginBottom: 8,
  },
  blackboardTitle: {
    color: '#FEF08A',
    fontSize: 16,
    fontWeight: '900',
  },
  blackboardBody: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 20,
  },
  teacherAudioCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    padding: 14,
  },
  audioHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  audioRoleTag: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  transcriptTag: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 10,
  },
  transcriptText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
  },
  outputCard: {
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(168, 85, 247, 0.3)',
    padding: 14,
  },
  outputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  outputTag: {
    color: '#C084FC',
    fontSize: 11,
    fontWeight: '800',
  },
  langSelectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(168, 85, 247, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  langSelectText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  speakingIndicatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  speakingIndicatorText: {
    color: '#10B981',
    fontSize: 11,
    fontWeight: '700',
  },
  twoWayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(30, 41, 59, 0.8)',
    borderRadius: 22,
    padding: 16,
  },
  roleColumn: {
    flex: 1,
    alignItems: 'center',
  },
  roleColTitle: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
  },
  roleColStatus: {
    color: '#60A5FA',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  bidirectionalCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 8,
    shadowColor: '#8B5CF6',
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metricBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  metricBoxLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
  },
  metricBoxVal: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 3,
  },
  aiLiveBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    borderRadius: 16,
    padding: 12,
  },
  aiLiveBannerText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
  },
  controlsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  endClassBtn: {
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    gap: 2,
  },
  endClassText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  controlBtn: {
    alignItems: 'center',
    gap: 2,
    padding: 6,
  },
  controlBtnText: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: '600',
  },
});
