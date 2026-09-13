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
import { avatar_teacher_live_classroom_25 } from '../../assets/images';

export const StudentClassroomScreen: React.FC = () => {
  const { navigate } = useAppStore();
  const [isPlaying, setIsPlaying] = useState(false);

  const currentBroadcast = {
    hindiSentence: 'सूरज हमें रोशनी और ऊर्जा देता है।',
    santaliSentence: 'ᱵᱮᱲᱟ ᱫᱚ ᱟᱵᱚ ᱢᱟᱨᱥᱟᱞ ᱟᱨ ᱫᱟᱲᱮ ᱮᱢᱟᱵᱚᱱᱟ ᱾',
    lessonTopic: 'Science: The Solar System • ᱥᱤᱧ ᱪᱟᱸᱫᱚ ᱢᱟᱱᱰᱮᱨ',
  };

  const handleListen = async () => {
    setIsPlaying(true);
    try {
      await audioService.speakText(currentBroadcast.santaliSentence, 'sat_Olck');
    } catch {
      // audio played
    } finally {
      setIsPlaying(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={JanbhashaTheme.colors.surface} barStyle="dark-content" />
      <JanbhashaHeader showBack title="Classroom Receiver" subtitle="Student Audio Stream" />
      <BluetoothStatusBar />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Live Broadcast Card */}
        <View style={styles.liveCard}>
          <View style={styles.liveCardHeader}>
            <Image
              source={avatar_teacher_live_classroom_25}
              style={styles.teacherAvatar}
              resizeMode="cover"
            />
            <View style={{ flex: 1 }}>
              <View style={styles.liveBadgeRow}>
                <View style={styles.liveIndicator} />
                <Text style={styles.liveBadgeText}>TEACHER BROADCASTING</Text>
              </View>
              <Text style={styles.teacherName}>Shri Soren's Classroom</Text>
              <Text style={styles.topicText}>{currentBroadcast.lessonTopic}</Text>
            </View>
          </View>
        </View>

        {/* Translation Speech Bubble */}
        <View style={styles.speechCard}>
          <View style={styles.bubbleHeader}>
            <Text style={styles.bubbleTag}>SANTALI TRANSLATION (OL CHIKI)</Text>
            <View style={styles.audioTag}>
              <Text style={styles.audioTagText}>OFFLINE VITS</Text>
            </View>
          </View>

          <Text style={styles.santaliText}>{currentBroadcast.santaliSentence}</Text>
          <Text style={styles.hindiSubText}>Teacher said: "{currentBroadcast.hindiSentence}"</Text>

          {/* Large Tap to Listen Audio Button */}
          <TouchableOpacity
            style={[styles.listenBtn, isPlaying && styles.listenBtnPlaying]}
            onPress={handleListen}
            disabled={isPlaying}
            activeOpacity={0.85}
          >
            <Text style={styles.listenIcon}>{isPlaying ? '🔊' : '▶️'}</Text>
            <Text style={styles.listenText}>
              {isPlaying ? 'Playing Audio...' : 'Listen in Santali / ᱟᱧᱡᱚᱢ ᱢᱮ'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Ask Question / AI Helper Button */}
        <TouchableOpacity
          style={styles.askAiCard}
          onPress={() => navigate('LiveTranslation')}
          activeOpacity={0.8}
        >
          <View style={styles.askIconBox}>
            <Text style={{ fontSize: 24 }}>🙋🏽</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.askTitle}>Ask Question in Santali</Text>
            <Text style={styles.askSub}>
              Tap to speak in Santali or Hindi • AI will translate for your teacher
            </Text>
          </View>
          <Text style={styles.askArrow}>›</Text>
        </TouchableOpacity>

        {/* Classroom Peer Status */}
        <View style={styles.peerCard}>
          <Text style={styles.peerTitle}>👥 Classmates Connected</Text>
          <Text style={styles.peerDesc}>
            24 students in Govt Primary School Mayurbhanj are listening together offline.
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
  liveCard: {
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLowest,
    borderRadius: JanbhashaTheme.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.outlineVariant,
    marginBottom: 16,
    elevation: 2,
  },
  liveCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teacherAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    borderColor: JanbhashaTheme.colors.primary,
    marginRight: 12,
  },
  liveBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  liveIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  liveBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: JanbhashaTheme.colors.primary,
    letterSpacing: 0.5,
  },
  teacherName: {
    fontSize: 16,
    fontWeight: '800',
    color: JanbhashaTheme.colors.onSurface,
  },
  topicText: {
    fontSize: 11,
    color: JanbhashaTheme.colors.secondary,
    fontWeight: '700',
    marginTop: 2,
  },
  speechCard: {
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLowest,
    borderRadius: JanbhashaTheme.borderRadius.xl,
    padding: 20,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.primary,
    marginBottom: 16,
    elevation: 3,
  },
  bubbleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  bubbleTag: {
    fontSize: 10,
    fontWeight: '800',
    color: JanbhashaTheme.colors.primary,
  },
  audioTag: {
    backgroundColor: JanbhashaTheme.colors.mintTag,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: JanbhashaTheme.borderRadius.full,
  },
  audioTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: JanbhashaTheme.colors.primary,
  },
  santaliText: {
    fontSize: 22,
    fontFamily: JanbhashaTheme.fonts.olChikiBold,
    color: JanbhashaTheme.colors.primary,
    lineHeight: 34,
    marginBottom: 10,
  },
  hindiSubText: {
    fontSize: 13,
    color: JanbhashaTheme.colors.onSurfaceVariant,
    fontStyle: 'italic',
    marginBottom: 18,
  },
  listenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: JanbhashaTheme.colors.primary,
    borderRadius: JanbhashaTheme.borderRadius.full,
    paddingVertical: 14,
    elevation: 2,
  },
  listenBtnPlaying: {
    backgroundColor: JanbhashaTheme.colors.secondary,
  },
  listenIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  listenText: {
    color: JanbhashaTheme.colors.onPrimary,
    fontSize: 14,
    fontWeight: '800',
  },
  askAiCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLowest,
    borderRadius: JanbhashaTheme.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.outlineVariant,
    marginBottom: 16,
  },
  askIconBox: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: JanbhashaTheme.colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  askTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: JanbhashaTheme.colors.onSurface,
  },
  askSub: {
    fontSize: 10,
    color: JanbhashaTheme.colors.onSurfaceVariant,
    lineHeight: 14,
    marginTop: 2,
  },
  askArrow: {
    fontSize: 20,
    color: JanbhashaTheme.colors.outline,
    fontWeight: '700',
  },
  peerCard: {
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLow,
    borderRadius: JanbhashaTheme.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.outlineVariant,
  },
  peerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: JanbhashaTheme.colors.onSurface,
    marginBottom: 2,
  },
  peerDesc: {
    fontSize: 11,
    color: JanbhashaTheme.colors.onSurfaceVariant,
  },
});
