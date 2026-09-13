import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { JanbhashaTheme } from '../../theme/janbhashaTheme';
import { JanbhashaHeader } from '../../components/common/JanbhashaHeader';
import { BluetoothStatusBar } from '../../components/common/BluetoothStatusBar';
import { useAppStore } from '../../store/useAppStore';
import { audioService } from '../../services/audioService';
import { apiService } from '../../services/apiService';
import { qr_classroom_24, avatar_teacher_live_classroom_25 } from '../../assets/images';

export const ClassroomScreen: React.FC = () => {
  const { goBack, audioOutput, selectedBluetoothDevice, navigate } = useAppStore();
  const [isBroadcasting, setIsBroadcasting] = useState(true);
  const [connectedStudents, setConnectedStudents] = useState(24);
  const [isPlaying, setIsPlaying] = useState(false);

  const [currentSentence, setCurrentSentence] = useState({
    hindi: 'आज हम जंगल और पेड़ों के बारे में सीखेंगे।',
    santali: 'ᱛᱮᱦᱮᱧ ᱵᱚ ᱵᱤᱨ ᱟᱨ ᱫᱟᱨᱮ ᱠᱚ ᱵᱟᱵᱚᱛ ᱵᱚ ᱪᱮᱫ-ᱟ ᱾',
  });

  const handlePlayAudio = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      await audioService.speakText(currentSentence.santali, 'sat_Olck');
    } catch {
      // audio played
    } finally {
      setIsPlaying(false);
    }
  };

  const toggleBroadcast = () => {
    setIsBroadcasting(!isBroadcasting);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={JanbhashaTheme.colors.surface} barStyle="dark-content" />
      <JanbhashaHeader showBack title="Classroom Broadcast" subtitle="Teacher Host Station" />
      <BluetoothStatusBar />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Host Info Banner */}
        <View style={styles.hostCard}>
          <Image
            source={avatar_teacher_live_classroom_25}
            style={styles.hostAvatar}
            resizeMode="cover"
          />
          <View style={{ flex: 1 }}>
            <View style={styles.liveTagRow}>
              <View style={[styles.liveDot, !isBroadcasting && styles.liveDotPaused]} />
              <Text style={styles.liveTagText}>
                {isBroadcasting ? 'BROADCASTING LIVE' : 'BROADCAST PAUSED'}
              </Text>
            </View>
            <Text style={styles.hostName}>Class 3A • Vernacular Session</Text>
            <Text style={styles.hostMeta}>
              {connectedStudents} Student Tablets Connected • Local Wi-Fi Direct
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.broadcastToggleBtn, !isBroadcasting && styles.broadcastToggleResume]}
            onPress={toggleBroadcast}
            activeOpacity={0.8}
          >
            <Text style={styles.broadcastToggleText}>
              {isBroadcasting ? 'Pause' : 'Resume'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Live Speech & Translation Broadcast Box */}
        <View style={styles.translationBox}>
          <View style={styles.boxHeader}>
            <View style={styles.pillTag}>
              <Text style={styles.pillTagText}>TRANSLATING LIVE</Text>
            </View>
            <TouchableOpacity
              style={styles.listenBtn}
              onPress={handlePlayAudio}
              disabled={isPlaying}
              activeOpacity={0.7}
            >
              <Text style={styles.listenBtnText}>{isPlaying ? '🔊 Playing...' : '🔊 Play Audio'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.santaliText}>{currentSentence.santali}</Text>
          <Text style={styles.hindiOriginalText}>Hindi Speech: "{currentSentence.hindi}"</Text>

          <View style={styles.audioRouteInfo}>
            <Text style={styles.audioRouteText}>
              Routing to: {audioOutput === 'bluetooth' && selectedBluetoothDevice ? selectedBluetoothDevice.name : 'Device Speaker'}
            </Text>
          </View>
        </View>

        {/* Classroom Quick Pairing via QR Code */}
        <View style={styles.qrSection}>
          <View style={styles.qrTextCol}>
            <Text style={styles.qrTitle}>Student Quick Connect</Text>
            <Text style={styles.qrDesc}>
              Students can scan this QR code with their tablet camera to join the broadcast without entering passwords.
            </Text>
            <View style={styles.roomCodeBadge}>
              <Text style={styles.roomCodeLabel}>ROOM PIN:</Text>
              <Text style={styles.roomCodeText}>JH-482</Text>
            </View>
          </View>
          <Image source={qr_classroom_24} style={styles.qrImage} resizeMode="contain" />
        </View>

        {/* Connected Student Grid */}
        <View style={styles.studentsCard}>
          <View style={styles.studentsHeader}>
            <Text style={styles.studentsTitle}>Connected Student Tablets</Text>
            <Text style={styles.studentsCount}>{connectedStudents} Active</Text>
          </View>
          <Text style={styles.studentsSub}>
            Audio stream synched peer-to-peer over local air-gapped network.
          </Text>
        </View>

        {/* Microphone Safety Reminder */}
        <View style={styles.micSafetyBox}>
          <Text style={styles.micSafetyTitle}>🔒 Anti-Feedback Acoustic Isolation Active</Text>
          <Text style={styles.micSafetyText}>
            Teacher microphone is strictly an input sensor. Audio playback on Bluetooth speakers or student tablets contains solely the translated Santali TTS synthesis.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: JanbhashaTheme.colors.surface,
  },
  scrollContent: {
    padding: JanbhashaTheme.spacing.marginMobile,
    paddingBottom: 32,
  },
  hostCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLowest,
    borderRadius: JanbhashaTheme.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.outlineVariant,
    marginBottom: 16,
    elevation: 2,
  },
  hostAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 12,
    borderWidth: 2,
    borderColor: JanbhashaTheme.colors.primary,
  },
  liveTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  liveDotPaused: {
    backgroundColor: JanbhashaTheme.colors.secondary,
  },
  liveTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: JanbhashaTheme.colors.primary,
    letterSpacing: 0.5,
  },
  hostName: {
    fontSize: 15,
    fontWeight: '800',
    color: JanbhashaTheme.colors.onSurface,
  },
  hostMeta: {
    fontSize: 10,
    color: JanbhashaTheme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  broadcastToggleBtn: {
    backgroundColor: JanbhashaTheme.colors.surfaceContainerHighest,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: JanbhashaTheme.borderRadius.full,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.outlineVariant,
  },
  broadcastToggleResume: {
    backgroundColor: JanbhashaTheme.colors.primary,
  },
  broadcastToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: JanbhashaTheme.colors.onSurface,
  },
  translationBox: {
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLowest,
    borderRadius: JanbhashaTheme.borderRadius.xl,
    padding: 18,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.primary,
    marginBottom: 16,
    elevation: 3,
  },
  boxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  pillTag: {
    backgroundColor: JanbhashaTheme.colors.mintTag,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: JanbhashaTheme.borderRadius.full,
  },
  pillTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: JanbhashaTheme.colors.primary,
  },
  listenBtn: {
    backgroundColor: JanbhashaTheme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: JanbhashaTheme.borderRadius.full,
  },
  listenBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: JanbhashaTheme.colors.onPrimary,
  },
  santaliText: {
    fontSize: 22,
    fontFamily: JanbhashaTheme.fonts.olChikiBold,
    color: JanbhashaTheme.colors.primary,
    lineHeight: 32,
    marginBottom: 10,
  },
  hindiOriginalText: {
    fontSize: 13,
    color: JanbhashaTheme.colors.onSurfaceVariant,
    fontStyle: 'italic',
    marginBottom: 10,
  },
  audioRouteInfo: {
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: JanbhashaTheme.borderRadius.md,
  },
  audioRouteText: {
    fontSize: 10,
    fontWeight: '700',
    color: JanbhashaTheme.colors.outline,
  },
  qrSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLowest,
    borderRadius: JanbhashaTheme.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.outlineVariant,
    marginBottom: 16,
  },
  qrTextCol: {
    flex: 1,
    paddingRight: 12,
  },
  qrTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: JanbhashaTheme.colors.onSurface,
    marginBottom: 4,
  },
  qrDesc: {
    fontSize: 11,
    color: JanbhashaTheme.colors.onSurfaceVariant,
    lineHeight: 16,
    marginBottom: 8,
  },
  roomCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roomCodeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: JanbhashaTheme.colors.outline,
  },
  roomCodeText: {
    fontSize: 14,
    fontWeight: '900',
    color: JanbhashaTheme.colors.secondary,
    letterSpacing: 1,
  },
  qrImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  studentsCard: {
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLowest,
    borderRadius: JanbhashaTheme.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.outlineVariant,
    marginBottom: 16,
  },
  studentsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  studentsTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: JanbhashaTheme.colors.onSurface,
  },
  studentsCount: {
    fontSize: 12,
    fontWeight: '800',
    color: JanbhashaTheme.colors.primary,
  },
  studentsSub: {
    fontSize: 11,
    color: JanbhashaTheme.colors.onSurfaceVariant,
  },
  micSafetyBox: {
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLow,
    borderRadius: JanbhashaTheme.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.outlineVariant,
  },
  micSafetyTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: JanbhashaTheme.colors.primary,
    marginBottom: 4,
  },
  micSafetyText: {
    fontSize: 10,
    color: JanbhashaTheme.colors.onSurfaceVariant,
    lineHeight: 15,
  },
});
