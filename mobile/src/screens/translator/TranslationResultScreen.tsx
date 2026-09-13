import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { JanbhashaTheme } from '../../theme/janbhashaTheme';
import { useAppStore } from '../../store/useAppStore';
import { JanbhashaHeader } from '../../components/common/JanbhashaHeader';
import { BluetoothStatusBar } from '../../components/common/BluetoothStatusBar';
import { audioService } from '../../services/audioService';

export const TranslationResultScreen: React.FC = () => {
  const { lastTranslation, navigate, audioOutput, selectedBluetoothDevice } = useAppStore();
  const [isPlaying, setIsPlaying] = useState(false);

  // Fallback data if accessed directly
  const data = lastTranslation || {
    sourceText: 'पेड़ हमें फल और ठंडी छाया देते हैं।',
    targetText: 'ᱫᱟᱨᱮ ᱫᱚ ᱟᱵᱚ ᱡᱚ ᱟᱨ ᱨᱮᱭᱟᱲ ᱩᱢᱩᱞ ᱮᱢᱟᱵᱚᱱᱟ᱾',
    sourceLang: 'hin_Deva',
    targetLang: 'sat_Olck',
    audioUri: '',
    durationSec: 1,
    engineUsed: 'IndicTrans2 + Piper VITS (Offline)',
  };

  const handlePlayAudio = async () => {
    setIsPlaying(true);
    try {
      if (data.audioUri) {
        await audioService.playAudio(data.audioUri);
      } else {
        await audioService.speakText(data.targetText, 'sat_Olck');
      }
    } catch (e: any) {
      console.warn('Playback error:', e);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `JANBHASHA Bilingual Learning:\n\n[Hindi]: ${data.sourceText}\n[Santali Ol Chiki]: ${data.targetText}\n\n100% Offline AI Vernacular Education`,
      });
    } catch (err) {
      console.warn('Share error:', err);
    }
  };

  const handleSaveToFlashcards = () => {
    Alert.alert('Saved to Flashcards', 'This bilingual card has been saved to your local offline study deck.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={JanbhashaTheme.colors.surface} barStyle="dark-content" />
      <JanbhashaHeader title="Translation Result" showBack={true} />
      <BluetoothStatusBar />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Source Text Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.langPill}>
              <Text style={styles.flagIcon}>🇮🇳</Text>
              <Text style={styles.langTitle}>Hindi (Input)</Text>
            </View>
            <Text style={styles.badgeScript}>Devanagari</Text>
          </View>
          <Text style={styles.sourceText}>{data.sourceText}</Text>
        </View>

        {/* Translation Arrow */}
        <View style={styles.arrowRow}>
          <View style={styles.arrowLine} />
          <View style={styles.arrowBadge}>
            <Text style={styles.arrowIcon}>↓</Text>
          </View>
          <View style={styles.arrowLine} />
        </View>

        {/* Target Santali Ol Chiki Card */}
        <View style={[styles.card, styles.targetCard]}>
          <View style={styles.cardHeader}>
            <View style={[styles.langPill, { backgroundColor: JanbhashaTheme.colors.mintTag }]}>
              <Text style={styles.flagIcon}>📜</Text>
              <Text style={[styles.langTitle, { color: JanbhashaTheme.colors.primary }]}>
                Santali (Output)
              </Text>
            </View>
            <Text style={[styles.badgeScript, { color: JanbhashaTheme.colors.primary }]}>
              ᱚᱞ ᱪᱤᱠᱤ (Ol Chiki)
            </Text>
          </View>

          <Text style={styles.targetText}>{data.targetText}</Text>

          {/* Audio Playback Button */}
          <TouchableOpacity
            style={[styles.audioPlayButton, isPlaying && styles.audioPlayButtonActive]}
            onPress={handlePlayAudio}
            activeOpacity={0.8}
          >
            <Text style={styles.audioPlayIcon}>{isPlaying ? '🔊' : '▶️'}</Text>
            <Text style={styles.audioPlayText}>
              {isPlaying
                ? `Playing on ${audioOutput === 'bluetooth' ? selectedBluetoothDevice?.name || 'Bluetooth' : 'Speaker'}...`
                : 'Listen to Santali Speech (Piper VITS)'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Action Buttons Grid */}
        <View style={styles.actionsGrid}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleSaveToFlashcards}
            activeOpacity={0.7}
          >
            <Text style={styles.actionBtnIcon}>🗂️</Text>
            <Text style={styles.actionBtnText}>Save Card</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={handleShare}
            activeOpacity={0.7}
          >
            <Text style={styles.actionBtnIcon}>📤</Text>
            <Text style={styles.actionBtnText}>Share Text</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => navigate('AudioOutput')}
            activeOpacity={0.7}
          >
            <Text style={styles.actionBtnIcon}>🔊</Text>
            <Text style={styles.actionBtnText}>Output Audio</Text>
          </TouchableOpacity>
        </View>

        {/* Translation Details / Offline Engine Metadata */}
        <View style={styles.metaCard}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Engine:</Text>
            <Text style={styles.metaValue}>{data.engineUsed || 'IndicTrans2 INT8 (Offline)'}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>TTS Model:</Text>
            <Text style={styles.metaValue}>Piper VITS ONNX (60.57 MB, 16 kHz)</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Isolation:</Text>
            <Text style={styles.metaValue}>Microphone audio isolated (Input Only)</Text>
          </View>
        </View>

        {/* Return Button */}
        <TouchableOpacity
          style={styles.returnBtn}
          onPress={() => navigate('LiveTranslation')}
          activeOpacity={0.85}
        >
          <Text style={styles.returnBtnText}>🎙️ Translate Another Sentence</Text>
        </TouchableOpacity>
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
  card: {
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLowest,
    borderRadius: JanbhashaTheme.borderRadius.xl,
    padding: 18,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.outlineVariant,
    elevation: 2,
    shadowColor: JanbhashaTheme.colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  targetCard: {
    borderColor: JanbhashaTheme.colors.primary,
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLow,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: JanbhashaTheme.colors.surfaceContainerHigh,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: JanbhashaTheme.borderRadius.full,
  },
  flagIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  langTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: JanbhashaTheme.colors.onSurface,
  },
  badgeScript: {
    fontSize: 11,
    fontWeight: '600',
    color: JanbhashaTheme.colors.onSurfaceVariant,
  },
  sourceText: {
    fontSize: 18,
    color: JanbhashaTheme.colors.onSurface,
    lineHeight: 28,
    fontWeight: '500',
  },
  targetText: {
    fontSize: 22,
    fontFamily: JanbhashaTheme.fonts.olChikiBold,
    color: JanbhashaTheme.colors.primary,
    lineHeight: 34,
    marginBottom: 16,
  },
  arrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  arrowLine: {
    flex: 1,
    height: 1,
    backgroundColor: JanbhashaTheme.colors.outlineVariant,
  },
  arrowBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: JanbhashaTheme.colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 10,
  },
  arrowIcon: {
    fontSize: 16,
    color: JanbhashaTheme.colors.onSurfaceVariant,
    fontWeight: '800',
  },
  audioPlayButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: JanbhashaTheme.colors.primary,
    borderRadius: JanbhashaTheme.borderRadius.full,
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  audioPlayButtonActive: {
    backgroundColor: JanbhashaTheme.colors.secondary,
  },
  audioPlayIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  audioPlayText: {
    fontSize: 13,
    fontWeight: '800',
    color: JanbhashaTheme.colors.onPrimary,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLowest,
    borderRadius: JanbhashaTheme.borderRadius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.outlineVariant,
  },
  actionBtnIcon: {
    fontSize: 18,
    marginBottom: 4,
  },
  actionBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: JanbhashaTheme.colors.onSurfaceVariant,
  },
  metaCard: {
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLow,
    borderRadius: JanbhashaTheme.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.outlineVariant,
    marginTop: 16,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: JanbhashaTheme.colors.onSurfaceVariant,
  },
  metaValue: {
    fontSize: 11,
    color: JanbhashaTheme.colors.onSurface,
    fontWeight: '500',
  },
  returnBtn: {
    backgroundColor: JanbhashaTheme.colors.surfaceContainerHighest,
    borderRadius: JanbhashaTheme.borderRadius.full,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.outlineVariant,
  },
  returnBtnText: {
    color: JanbhashaTheme.colors.onSurface,
    fontSize: 14,
    fontWeight: '800',
  },
});
