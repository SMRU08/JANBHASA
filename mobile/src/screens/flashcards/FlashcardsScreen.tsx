import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, TouchableOpacity, ActivityIndicator } from 'react-native';
import { JanbhashaTheme } from '../../theme/janbhashaTheme';
import { JanbhashaHeader } from '../../components/common/JanbhashaHeader';
import { FlashcardItems, Flashcard } from '../../data/curriculumData';
import { apiService } from '../../services/apiService';
import { audioService } from '../../services/audioService';

export const FlashcardsScreen: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);

  const card = FlashcardItems[currentIndex] || FlashcardItems[0];

  const handleNext = () => {
    if (currentIndex < FlashcardItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handlePlayPronunciation = async () => {
    if (isPlayingAudio) return;
    setIsPlayingAudio(true);
    try {
      const res = await apiService.synthesizeSpeech(card.santaliOlChiki, 0);
      if (res.audio_base64) {
        await audioService.playAudio(res.audio_base64);
      } else {
        await audioService.speakText(card.santaliOlChiki, 'sat_Olck');
      }
    } catch (err) {
      console.warn('Flashcard TTS error, using offline TTS:', err);
      await audioService.speakText(card.santaliOlChiki, 'sat_Olck');
    } finally {
      setIsPlayingAudio(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={JanbhashaTheme.colors.creamBg} barStyle="dark-content" />
      <JanbhashaHeader showBack title="Flashcards" subtitle="Santali Ol Chiki Vocabulary" />

      <View style={styles.content}>
        {/* Category Pill */}
        <View style={styles.categoryPill}>
          <Text style={styles.categoryText}>{card.category} • Grade 1-5 FLN</Text>
        </View>

        {/* Big Flashcard */}
        <View style={styles.cardContainer}>
          <View style={styles.iconCircle}>
            <Text style={styles.cardEmoji}>{card.icon}</Text>
          </View>

          <Text style={styles.englishWord}>{card.english}</Text>
          <Text style={styles.hindiWord}>{card.hindi}</Text>
          <Text style={styles.olChikiWord}>{card.santaliOlChiki}</Text>
          <Text style={styles.phoneticGuide}>Pronunciation: ({card.phonetic})</Text>

          {/* Speaker Button */}
          <TouchableOpacity
            style={[styles.listenBtn, isPlayingAudio && styles.listenBtnActive]}
            onPress={handlePlayPronunciation}
            disabled={isPlayingAudio}
            activeOpacity={0.8}
          >
            {isPlayingAudio ? (
              <ActivityIndicator size="small" color={JanbhashaTheme.colors.deepGreen} />
            ) : (
              <Text style={styles.listenBtnText}>🔊 Tap to Pronounce</Text>
            )}
          </TouchableOpacity>

          <View style={styles.exampleBox}>
            <Text style={styles.exampleSantali}>{card.exampleSentenceSantali}</Text>
            <Text style={styles.exampleHindi}>"{card.exampleSentenceHindi}"</Text>
          </View>
        </View>

        {/* Bottom Pagination Bar */}
        <View style={styles.paginationRow}>
          <TouchableOpacity
            style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
            onPress={handlePrev}
            disabled={currentIndex === 0}
            activeOpacity={0.7}
          >
            <Text style={styles.navBtnText}>‹ Previous</Text>
          </TouchableOpacity>

          <View style={styles.progressCounter}>
            <Text style={styles.progressText}>
              {currentIndex + 1} / {FlashcardItems.length}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.navBtn, currentIndex === FlashcardItems.length - 1 && styles.navBtnDisabled]}
            onPress={handleNext}
            disabled={currentIndex === FlashcardItems.length - 1}
            activeOpacity={0.7}
          >
            <Text style={styles.navBtnText}>Next ›</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: JanbhashaTheme.colors.creamBg,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryPill: {
    backgroundColor: JanbhashaTheme.colors.mintTag,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 4,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '800',
    color: JanbhashaTheme.colors.deepGreen,
  },
  cardContainer: {
    backgroundColor: JanbhashaTheme.colors.white,
    borderRadius: 26,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.cardBorder,
    padding: 26,
    width: '100%',
    alignItems: 'center',
    elevation: 4,
    shadowColor: JanbhashaTheme.colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: JanbhashaTheme.colors.creamBgLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  cardEmoji: {
    fontSize: 48,
  },
  englishWord: {
    fontSize: 14,
    fontWeight: '700',
    color: JanbhashaTheme.colors.mutedText,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 4,
  },
  hindiWord: {
    fontSize: 26,
    fontWeight: '800',
    color: JanbhashaTheme.colors.charcoalText,
    marginBottom: 4,
  },
  olChikiWord: {
    fontSize: 34,
    fontFamily: JanbhashaTheme.fonts.olChikiBold,
    color: JanbhashaTheme.colors.deepGreen,
    marginVertical: 6,
  },
  phoneticGuide: {
    fontSize: 13,
    color: JanbhashaTheme.colors.mutedText,
    fontStyle: 'italic',
    marginBottom: 16,
  },
  listenBtn: {
    backgroundColor: JanbhashaTheme.colors.creamBgLight,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.deepGreen,
    marginBottom: 18,
  },
  listenBtnActive: {
    backgroundColor: JanbhashaTheme.colors.mintTag,
  },
  listenBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: JanbhashaTheme.colors.deepGreen,
  },
  exampleBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 14,
    width: '100%',
    alignItems: 'center',
  },
  exampleSantali: {
    fontSize: 16,
    fontFamily: JanbhashaTheme.fonts.olChikiBold,
    color: JanbhashaTheme.colors.deepGreen,
    textAlign: 'center',
    marginBottom: 4,
  },
  exampleHindi: {
    fontSize: 12,
    color: JanbhashaTheme.colors.mutedText,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  paginationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 12,
  },
  navBtn: {
    backgroundColor: JanbhashaTheme.colors.white,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.cardBorder,
    elevation: 2,
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: JanbhashaTheme.colors.deepGreen,
  },
  progressCounter: {
    backgroundColor: JanbhashaTheme.colors.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.cardBorder,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '800',
    color: JanbhashaTheme.colors.charcoalText,
  },
});
