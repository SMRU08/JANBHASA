import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Audio } from 'expo-av';
import { Card } from '../../components/Card';
import { useTheme } from '../../theme';
import { useClassroomStore } from '../../store/classroomStore';
import { useAuthStore } from '../../store/authStore';
import { synthesize } from '../../services/ttsService';

const LANG_LABELS: Record<string, string> = {
  hi: 'Hindi (हिंदी)',
  or: 'Odia (ଓଡ଼ିଆ)',
  sat: 'Santali (ᱥᱟᱱᱛᱟᱲᱤ)',
  ho: 'Ho (हो)',
  mun: 'Mundari (मुंडारी)',
  en: 'English',
};

export function StudentClassroomScreen() {
  const theme = useTheme();
  const c = theme.colors;
  const nav = useNavigation<any>();
  const { user } = useAuthStore();
  const { sessionId, isConnected, messages, currentTranslation, clearSession } = useClassroomStore();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [autoPlay, setAutoPlay] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const lastSpokenIdRef = useRef<string | null>(null);

  const studentLang = user?.selected_language || 'hi';
  const langLabel = LANG_LABELS[studentLang] || studentLang.toUpperCase();

  const handleSpeak = async (text: string, lang = studentLang) => {
    if (!text) return;
    try {
      setIsPlaying(true);
      const audioUrl = await synthesize(text, lang);
      if (audioUrl) {
        if (sound) {
          await sound.unloadAsync();
        }
        const { sound: s } = await Audio.Sound.createAsync(
          { uri: audioUrl },
          { shouldPlay: true }
        );
        setSound(s);
        s.setOnPlaybackStatusUpdate((status: any) => {
          if (status.didJustFinish) {
            setIsPlaying(false);
          }
        });
      } else {
        setIsPlaying(false);
      }
    } catch (e) {
      console.warn('TTS playback error', e);
      setIsPlaying(false);
    }
  };

  // Auto-play new translations as they arrive from teacher
  useEffect(() => {
    if (autoPlay && currentTranslation && currentTranslation.id !== lastSpokenIdRef.current) {
      lastSpokenIdRef.current = currentTranslation.id;
      const textToPlay = currentTranslation.translated_text || currentTranslation.source_text;
      if (textToPlay) {
        handleSpeak(textToPlay, studentLang);
      }
    }
  }, [currentTranslation, autoPlay, studentLang]);

  const handleLeave = () => {
    Alert.alert('Leave Classroom', 'Are you sure you want to exit the live classroom?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: () => {
          clearSession();
          nav.popToTop();
        }
      }
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      {/* Top Session Bar */}
      <View style={[styles.topBar, { backgroundColor: c.primary }]}>
        <View>
          <Text style={styles.statusLive}>{isConnected ? '🟢 CONNECTED' : '🟡 RECONNECTING...'}</Text>
          <Text style={styles.sessionTitle}>Classroom #{sessionId || 'LIVE'}</Text>
        </View>
        <TouchableOpacity onPress={handleLeave} style={styles.leaveBtn}>
          <Text style={{ color: '#fff', fontWeight: '700', fontSize: 12 }}>LEAVE</Text>
        </TouchableOpacity>
      </View>

      {/* Mother Tongue & Auto-play banner */}
      <View style={[styles.langBanner, { backgroundColor: c.card, borderColor: c.border }]}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: c.textMuted, fontWeight: '600' }}>YOUR MOTHER TONGUE</Text>
          <Text style={{ fontSize: 14, fontWeight: '800', color: c.primary }}>{langLabel}</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 12, fontWeight: '600', color: c.textSecondary }}>Auto-Voice</Text>
          <Switch
            value={autoPlay}
            onValueChange={setAutoPlay}
            trackColor={{ false: '#767577', true: c.primaryLight }}
            thumbColor={autoPlay ? c.primary : '#f4f3f4'}
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Live Translation Card */}
        <Card style={{ marginBottom: 16, borderColor: c.primary, borderWidth: 2 }}>
          <View style={styles.cardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontSize: 12, fontWeight: '800', color: c.primary }}>
                ⚡ LIVE TEACHER TRANSLATION
              </Text>
              {isPlaying && <Text style={{ fontSize: 12 }}>🔊🎶</Text>}
            </View>
            {currentTranslation && (
              <TouchableOpacity
                onPress={() =>
                  handleSpeak(
                    currentTranslation.translated_text || currentTranslation.source_text
                  )
                }
                style={[styles.listenBtn, { backgroundColor: c.primaryLight }]}
              >
                <Text style={{ fontSize: 18 }}>🔊 Listen</Text>
              </TouchableOpacity>
            )}
          </View>

          {currentTranslation ? (
            <View style={{ marginTop: 12 }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: c.text, lineHeight: 30 }}>
                {currentTranslation.translated_text || currentTranslation.source_text}
              </Text>
              {currentTranslation.source_text !== currentTranslation.translated_text && (
                <View style={[styles.originalBox, { backgroundColor: c.surface, borderColor: c.border }]}>
                  <Text style={{ fontSize: 11, color: c.textMuted, fontWeight: '600' }}>
                    Teacher spoke ({currentTranslation.source_lang.toUpperCase()}):
                  </Text>
                  <Text style={{ fontSize: 13, color: c.textSecondary, marginTop: 2 }}>
                    "{currentTranslation.source_text}"
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={{ alignItems: 'center', paddingVertical: 28 }}>
              <Text style={{ fontSize: 32, marginBottom: 8 }}>🎧</Text>
              <Text style={{ color: c.textMuted, fontStyle: 'italic', textAlign: 'center' }}>
                Waiting for teacher to speak...
              </Text>
              <Text style={{ fontSize: 12, color: c.textSecondary, marginTop: 4 }}>
                Teacher speaks in Hindi → Auto-translates to {langLabel}
              </Text>
            </View>
          )}
        </Card>

        {/* Message Feed */}
        <Text style={[styles.feedTitle, { color: c.text }]}>📜 Class Broadcast History</Text>
        {messages.length === 0 ? (
          <Text style={{ color: c.textMuted, textAlign: 'center', marginTop: 16 }}>
            No spoken phrases recorded yet.
          </Text>
        ) : (
          messages.map((m) => (
            <View key={m.id} style={[styles.msgItem, { backgroundColor: c.card, borderColor: c.border }]}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
                <Text style={{ fontSize: 11, color: c.textMuted }}>
                  {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <TouchableOpacity onPress={() => handleSpeak(m.translated_text || m.source_text)}>
                  <Text style={{ fontSize: 14 }}>🔊 Speak</Text>
                </TouchableOpacity>
              </View>
              <Text style={{ fontSize: 16, color: c.text, fontWeight: '700' }}>
                {m.translated_text || m.source_text}
              </Text>
              {m.source_text !== m.translated_text && (
                <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 4 }}>
                  Teacher: "{m.source_text}"
                </Text>
              )}
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  statusLive: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '800' },
  sessionTitle: { color: '#fff', fontSize: 16, fontWeight: '800', marginTop: 2 },
  leaveBtn: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8
  },
  langBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  listenBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  originalBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  feedTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10, marginTop: 10 },
  msgItem: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    marginBottom: 8
  }
});
