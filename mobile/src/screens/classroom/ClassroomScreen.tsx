import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, ScrollView } from 'react-native';
import { JanbhashaTheme } from '../../theme/janbhashaTheme';
import { JanbhashaHeader } from '../../components/common/JanbhashaHeader';
import { useAppStore } from '../../store/useAppStore';
import { audioService } from '../../services/audioService';
import { apiService } from '../../services/apiService';

export const ClassroomScreen: React.FC = () => {
  const { role, goBack } = useAppStore();

  const [sessionStatus, setSessionStatus] = useState<'CONNECTING' | 'CONNECTED' | 'DISCONNECTED'>('CONNECTED');
  const [currentSentence, setCurrentSentence] = useState<{
    hindi: string;
    santali: string;
    audioB64?: string;
  }>({
    hindi: 'आज हम जंगल और पेड़ों के बारे में सीखेंगे।',
    santali: 'ᱛᱮᱦᱮᱧ ᱵᱚ ᱵᱤᱨ ᱟᱨ ᱫᱟᱨᱮ ᱠᱚ ᱵᱟᱵᱚᱛ ᱵᱚ ᱪᱮᱫ-ᱟ ᱾',
  });
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [connectedCount, setConnectedCount] = useState<number>(18);

  const handlePlayAudio = async () => {
    if (isPlaying) return;
    setIsPlaying(true);
    try {
      if (currentSentence.audioB64) {
        await audioService.playAudio(currentSentence.audioB64);
      } else {
        // Synthesize and play on the fly (works online & offline)
        try {
          const tts = await apiService.synthesizeSpeech(currentSentence.santali, 0);
          if (tts.audio_base64) {
            await audioService.playAudio(tts.audio_base64);
          } else {
            await audioService.speakText(currentSentence.santali, 'sat_Olck');
          }
        } catch {
          await audioService.speakText(currentSentence.santali, 'sat_Olck');
        }
      }
    } catch {
      // playback complete
    } finally {
      setIsPlaying(false);
    }
  };

  const handleLeave = () => {
    audioService.stopAudio();
    goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={JanbhashaTheme.colors.creamBg} barStyle="dark-content" />
      <JanbhashaHeader
        showBack
        title="Classroom"
        subtitle={role === 'teacher' ? 'Broadcast Mode' : 'Live Learner Mode'}
      />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Live Session Badge */}
        <View style={styles.sessionStatusBadge}>
          <View style={styles.greenPulseDot} />
          <Text style={styles.sessionStatusText}>
            {sessionStatus === 'CONNECTED' ? 'Live Session Active' : 'Connecting to Classroom...'}
          </Text>
        </View>

        <Text style={styles.teacherSpeakingText}>
          {role === 'teacher' ? '🎙️ You are broadcasting live' : '👩🏽‍🏫 Teacher is speaking in Hindi...'}
        </Text>

        {/* Classroom Graphic */}
        <View style={styles.artCard}>
          <Text style={styles.artClassroomEmoji}>🏫 👩🏽‍🏫 🎒 👧🏽 👦🏽</Text>
          <Text style={styles.artTitle}>Primary Classroom • Grade 1-5</Text>
        </View>

        {/* Live Santali Translation Box */}
        <View style={styles.translationBox}>
          <View style={styles.boxHeader}>
            <Text style={styles.boxTag}>LIVE SANTALI TRANSLATION</Text>
            <TouchableOpacity
              style={styles.speakerBtn}
              onPress={handlePlayAudio}
              disabled={isPlaying}
              activeOpacity={0.7}
            >
              <Text style={styles.speakerBtnText}>{isPlaying ? '🔊 Playing...' : '🔊 Listen'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.santaliSpeechText}>{currentSentence.santali}</Text>
          <Text style={styles.hindiOriginalText}>Original: "{currentSentence.hindi}"</Text>
        </View>

        {/* Connected Students Counter */}
        <View style={styles.counterRow}>
          <Text style={styles.counterEmoji}>👥</Text>
          <Text style={styles.counterText}>
            Connected Students: <Text style={{ fontWeight: '800', color: JanbhashaTheme.colors.deepGreen }}>{connectedCount} online</Text>
          </Text>
        </View>

        {/* Action Button */}
        <TouchableOpacity style={styles.leaveBtn} onPress={handleLeave} activeOpacity={0.85}>
          <Text style={styles.leaveBtnText}>
            {role === 'teacher' ? 'End Classroom Broadcast' : 'Leave Session'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: JanbhashaTheme.colors.creamBg,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
    paddingBottom: 32,
  },
  sessionStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: JanbhashaTheme.colors.mintTag,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 10,
  },
  greenPulseDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  sessionStatusText: {
    fontSize: 13,
    fontWeight: '800',
    color: JanbhashaTheme.colors.deepGreen,
  },
  teacherSpeakingText: {
    fontSize: 14,
    color: JanbhashaTheme.colors.mutedText,
    fontWeight: '600',
    marginBottom: 18,
  },
  artCard: {
    backgroundColor: JanbhashaTheme.colors.white,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.cardBorder,
    width: '100%',
    paddingVertical: 28,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: JanbhashaTheme.colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  artClassroomEmoji: {
    fontSize: 44,
    marginBottom: 8,
  },
  artTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: JanbhashaTheme.colors.mutedText,
  },
  translationBox: {
    backgroundColor: '#F7FBF9',
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.deepGreen,
    width: '100%',
    padding: 20,
    marginBottom: 20,
  },
  boxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  boxTag: {
    fontSize: 11,
    fontWeight: '800',
    color: JanbhashaTheme.colors.deepGreen,
    letterSpacing: 0.5,
  },
  speakerBtn: {
    backgroundColor: JanbhashaTheme.colors.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.cardBorder,
  },
  speakerBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: JanbhashaTheme.colors.deepGreen,
  },
  santaliSpeechText: {
    fontSize: 22,
    fontFamily: JanbhashaTheme.fonts.olChikiBold,
    color: JanbhashaTheme.colors.deepGreen,
    lineHeight: 34,
    marginBottom: 10,
  },
  hindiOriginalText: {
    fontSize: 13,
    color: JanbhashaTheme.colors.mutedText,
    fontStyle: 'italic',
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  counterEmoji: {
    fontSize: 18,
    marginRight: 8,
  },
  counterText: {
    fontSize: 13,
    color: JanbhashaTheme.colors.mutedText,
    fontWeight: '600',
  },
  leaveBtn: {
    backgroundColor: '#DC2626',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    elevation: 3,
  },
  leaveBtnText: {
    color: JanbhashaTheme.colors.white,
    fontSize: 15,
    fontWeight: '800',
  },
});
