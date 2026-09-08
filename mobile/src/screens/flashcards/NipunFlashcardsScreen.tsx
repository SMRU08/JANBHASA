import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors } from '../../theme/colors';
import { SohraiWatermark } from '../../components/common/SohraiWatermark';
import { NeumorphicButton } from '../../components/common/NeumorphicButton';

interface Flashcard {
  id: string;
  hindiWord: string;
  santhaliOlChiki: string;
  phoneticLatin: string;
  category: string;
  stampReward: string; // Flora/Fauna symbol
}

const NIPUN_CARDS: Flashcard[] = [
  {
    id: '1',
    hindiWord: 'पेड़ (वृक्ष)',
    santhaliOlChiki: 'ᱫᱟᱨᱮ',
    phoneticLatin: 'Dare',
    category: 'Nature',
    stampReward: '🌳 Sal Sacred Tree Stamp',
  },
  {
    id: '2',
    hindiWord: 'मोर (मयूर)',
    santhaliOlChiki: 'ᱢᱟᱨᱟᱜ',
    phoneticLatin: 'Marag',
    category: 'Fauna',
    stampReward: '🦚 Sohrai Peacock Stamp',
  },
  {
    id: '3',
    hindiWord: 'मछली (मत्स्य)',
    santhaliOlChiki: 'ᱦᱟᱹᱠᱩ',
    phoneticLatin: 'Haku',
    category: 'Fauna',
    stampReward: '🐟 Tribal River Fish Stamp',
  },
  {
    id: '4',
    hindiWord: 'सूरज (सूर्य)',
    santhaliOlChiki: 'ᱥᱤᱧ ᱪᱟᱸᱫᱚ',
    phoneticLatin: 'Sing Chando',
    category: 'Cosmos',
    stampReward: '☀️ Golden Sun Stamp',
  },
];

export const NipunFlashcardsScreen: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highlightedWord, setHighlightedWord] = useState<string | null>(null);
  const [earnedStamps, setEarnedStamps] = useState<string[]>([]);

  const currentCard = NIPUN_CARDS[currentIndex];

  const handlePlayKaraoke = () => {
    setIsPlaying(true);
    // Karaoke highlight simulation synced with offline VITS TTS phoneme timestamps
    setHighlightedWord(currentCard.santhaliOlChiki);

    setTimeout(() => {
      setIsPlaying(false);
      setHighlightedWord(null);

      // Award stamp if not already earned
      if (!earnedStamps.includes(currentCard.stampReward)) {
        setEarnedStamps([...earnedStamps, currentCard.stampReward]);
        Alert.alert(
          'STAMP UNLOCKED! 🎖️',
          `You earned the "${currentCard.stampReward}" for mastering this word!`,
          [{ text: 'Awesome! (ᱥᱟᱨᱦᱟᱣ)' }]
        );
      }
    }, 1600);
  };

  const handleNext = () => {
    if (currentIndex < NIPUN_CARDS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={Colors.background.slate} barStyle="dark-content" />
      <SohraiWatermark />

      <View style={styles.header}>
        <Text style={styles.title}>NIPUN Bharat Flashcards</Text>
        <Text style={styles.stampsBadge}>
          🏆 Collected Stamps: {earnedStamps.length} / {NIPUN_CARDS.length}
        </Text>
      </View>

      <View style={styles.centerDeck}>
        {/* Main Swipeable Card */}
        <View style={styles.flashcard}>
          <Text style={styles.categoryTag}>{currentCard.category.toUpperCase()}</Text>

          {/* Hindi Prompt */}
          <Text style={styles.hindiWord}>{currentCard.hindiWord}</Text>

          <View style={styles.divider} />

          {/* Santhali Ol Chiki with Karaoke Highlight */}
          <View style={[styles.karaokeBox, isPlaying && styles.karaokeBoxActive]}>
            <Text
              style={[
                styles.santhaliOlChiki,
                highlightedWord === currentCard.santhaliOlChiki && styles.highlightedText,
              ]}
            >
              {currentCard.santhaliOlChiki}
            </Text>
          </View>
          <Text style={styles.phonetic}>({currentCard.phoneticLatin})</Text>

          {/* Audio Pronunciation Button */}
          <View style={{ marginTop: 24, width: '100%' }}>
            <NeumorphicButton
              onPress={handlePlayKaraoke}
              zone="playback"
              title={isPlaying ? 'SPEAKING (VITS)...' : '🔊 PRONOUNCE IN SANTHALI'}
              subtitle="Synced karaoke word highlighting"
              disabled={isPlaying}
            />
          </View>
        </View>
      </View>

      {/* Navigation Controls */}
      <View style={styles.navRow}>
        <NeumorphicButton
          onPress={handlePrev}
          zone="primary"
          title="◀ PREVIOUS"
          disabled={currentIndex === 0}
          style={styles.navBtn}
        />
        <Text style={styles.pageCounter}>
          {currentIndex + 1} / {NIPUN_CARDS.length}
        </Text>
        <NeumorphicButton
          onPress={handleNext}
          zone="primary"
          title="NEXT ▶"
          style={styles.navBtn}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background.slate,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    color: Colors.cultural.terracotta,
  },
  stampsBadge: {
    fontSize: 13,
    fontWeight: '800',
    color: Colors.cultural.forestGreen,
  },
  centerDeck: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  flashcard: {
    backgroundColor: Colors.background.surface,
    borderRadius: 28,
    borderWidth: 4,
    borderColor: Colors.background.border,
    padding: 28,
    alignItems: 'center',
    elevation: 6,
  },
  categoryTag: {
    fontSize: 12,
    fontWeight: '900',
    color: Colors.cultural.forestGreen,
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  hindiWord: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.background.darkSlate,
  },
  divider: {
    height: 3,
    backgroundColor: Colors.background.border,
    width: '80%',
    marginVertical: 18,
  },
  karaokeBox: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 16,
  },
  karaokeBoxActive: {
    backgroundColor: Colors.actionZones.playback.background,
    borderWidth: 2,
    borderColor: Colors.actionZones.playback.border,
  },
  santhaliOlChiki: {
    fontSize: 48,
    fontWeight: '900',
    color: Colors.cultural.terracotta,
  },
  highlightedText: {
    color: Colors.actionZones.playback.primary,
  },
  phonetic: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    marginTop: 6,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  navBtn: {
    flex: 0.42,
  },
  pageCounter: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.background.darkSlate,
  },
});
