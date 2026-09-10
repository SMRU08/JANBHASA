import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import { JanbhashaTheme } from '../../theme/janbhashaTheme';
import { JanbhashaHeader } from '../../components/common/JanbhashaHeader';
import { useAppStore } from '../../store/useAppStore';
import { apiService } from '../../services/apiService';
import { audioService } from '../../services/audioService';

export const LessonDetailsScreen: React.FC = () => {
  const { selectedSubject } = useAppStore();
  const [playingLessonId, setPlayingLessonId] = useState<string | null>(null);

  const subject = selectedSubject || {
    title: 'Our Environment',
    titleSantali: 'ᱟᱵᱚᱣᱟᱜ ᱯᱚᱨᱤᱵᱮᱥ',
    description: 'Explore nature, trees, and weather.',
    lessons: [],
  };

  const handlePlayLessonAudio = async (lessonId: string, text: string) => {
    if (playingLessonId === lessonId) {
      await audioService.stopAudio();
      setPlayingLessonId(null);
      return;
    }

    setPlayingLessonId(lessonId);
    try {
      const res = await apiService.synthesizeSpeech(text, 0);
      if (res.audio_base64) {
        await audioService.playAudio(res.audio_base64);
      } else {
        await audioService.speakText(text, 'sat_Olck');
      }
    } catch (err) {
      console.warn('Lesson audio failed, using offline TTS:', err);
      await audioService.speakText(text, 'sat_Olck');
    } finally {
      setPlayingLessonId(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={JanbhashaTheme.colors.creamBg} barStyle="dark-content" />
      <JanbhashaHeader showBack title={subject.title} subtitle={subject.titleSantali} />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.bannerCard}>
          <Text style={styles.bannerEmoji}>{subject.icon || '📖'}</Text>
          <Text style={styles.bannerTitle}>{subject.title}</Text>
          <Text style={styles.bannerSantali}>{subject.titleSantali}</Text>
          <Text style={styles.bannerDesc}>{subject.description}</Text>
        </View>

        <Text style={styles.lessonsHeader}>Classroom Curriculum Lessons</Text>

        <View style={styles.lessonList}>
          {subject.lessons?.map((lesson: any, idx: number) => {
            const isPlaying = playingLessonId === lesson.id;
            return (
              <View key={lesson.id || idx} style={styles.lessonCard}>
                <View style={styles.lessonHeaderRow}>
                  <View style={styles.lessonNumBadge}>
                    <Text style={styles.lessonNumText}>0{idx + 1}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.audioBtn, isPlaying && styles.audioBtnActive]}
                    onPress={() => handlePlayLessonAudio(lesson.id, lesson.audioText || lesson.conceptSantali)}
                    activeOpacity={0.75}
                  >
                    <Text style={styles.audioBtnText}>
                      {isPlaying ? '⏹️ Stop' : '🔊 Listen Santali'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.lessonTitleHindi}>{lesson.titleHindi}</Text>
                <Text style={styles.lessonTitleSantali}>{lesson.titleSantali}</Text>

                {/* Concept in Hindi */}
                <View style={styles.conceptBox}>
                  <Text style={styles.conceptLabel}>Hindi Curriculum Concept:</Text>
                  <Text style={styles.conceptTextHindi}>{lesson.conceptHindi}</Text>
                </View>

                {/* Concept in Santali Ol Chiki */}
                <View style={[styles.conceptBox, styles.conceptBoxSantali]}>
                  <Text style={[styles.conceptLabel, { color: JanbhashaTheme.colors.deepGreen }]}>
                    Santali (Ol Chiki) Pedagogy:
                  </Text>
                  <Text style={styles.conceptTextSantali}>{lesson.conceptSantali}</Text>
                </View>

                {/* Indigenous Cultural Metaphor */}
                <View style={styles.metaphorCard}>
                  <Text style={styles.metaphorLabel}>🌱 Indigenous Cultural Metaphor:</Text>
                  <Text style={styles.metaphorText}>{lesson.culturalMetaphor}</Text>
                </View>
              </View>
            );
          })}
        </View>
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
    paddingBottom: 32,
  },
  bannerCard: {
    backgroundColor: JanbhashaTheme.colors.white,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.cardBorder,
    padding: 20,
    alignItems: 'center',
    marginBottom: 24,
    elevation: 2,
  },
  bannerEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: JanbhashaTheme.colors.charcoalText,
  },
  bannerSantali: {
    fontSize: 16,
    fontFamily: JanbhashaTheme.fonts.olChikiBold,
    color: JanbhashaTheme.colors.deepGreen,
    marginVertical: 4,
  },
  bannerDesc: {
    fontSize: 12,
    color: JanbhashaTheme.colors.mutedText,
    textAlign: 'center',
    lineHeight: 17,
  },
  lessonsHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: JanbhashaTheme.colors.charcoalText,
    marginBottom: 14,
  },
  lessonList: {
    gap: 16,
  },
  lessonCard: {
    backgroundColor: JanbhashaTheme.colors.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.cardBorder,
    padding: 18,
    elevation: 2,
  },
  lessonHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  lessonNumBadge: {
    backgroundColor: JanbhashaTheme.colors.mintTag,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  lessonNumText: {
    fontSize: 13,
    fontWeight: '800',
    color: JanbhashaTheme.colors.deepGreen,
  },
  audioBtn: {
    backgroundColor: JanbhashaTheme.colors.creamBgLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.cardBorder,
  },
  audioBtnActive: {
    backgroundColor: JanbhashaTheme.colors.mintTag,
    borderColor: JanbhashaTheme.colors.deepGreen,
  },
  audioBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: JanbhashaTheme.colors.deepGreen,
  },
  lessonTitleHindi: {
    fontSize: 16,
    fontWeight: '800',
    color: JanbhashaTheme.colors.charcoalText,
    marginBottom: 2,
  },
  lessonTitleSantali: {
    fontSize: 14,
    fontFamily: JanbhashaTheme.fonts.olChikiBold,
    color: JanbhashaTheme.colors.deepGreen,
    marginBottom: 12,
  },
  conceptBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  conceptBoxSantali: {
    backgroundColor: '#F7FBF9',
    borderLeftWidth: 3,
    borderLeftColor: JanbhashaTheme.colors.deepGreen,
  },
  conceptLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: JanbhashaTheme.colors.mutedText,
    marginBottom: 4,
  },
  conceptTextHindi: {
    fontSize: 14,
    color: JanbhashaTheme.colors.charcoalText,
    lineHeight: 20,
  },
  conceptTextSantali: {
    fontSize: 17,
    fontFamily: JanbhashaTheme.fonts.olChikiBold,
    color: JanbhashaTheme.colors.deepGreen,
    lineHeight: 26,
  },
  metaphorCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 12,
    marginTop: 4,
  },
  metaphorLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
    marginBottom: 2,
  },
  metaphorText: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 17,
    fontStyle: 'italic',
  },
});
