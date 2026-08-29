import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Share } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useTheme } from '../../theme';

const WORD_BREAKDOWNS = [
  { hi: 'आज', pr: 'Aaji', odia: 'ଆଜି' },
  { hi: 'हम', pr: 'Hum', odia: 'ଆମେ' },
  { hi: 'जल', pr: 'Jal', odia: 'ଜଳ' },
  { hi: 'संरक्षण', pr: 'Sanrakshan', odia: 'ସଂରକ୍ଷଣ' },
  { hi: 'के बारे में', pr: 'Ke baare mein', odia: 'ବିଷୟରେ' },
  { hi: 'पढ़ेंगे', pr: 'Padhenge', odia: 'ପଢ଼ିବୁ' },
];

export function TranslationResultScreen() {
  const theme = useTheme();
  const c = theme.colors;
  const nav = useNavigation<any>();

  const [fromLang, setFromLang] = useState('Hindi');
  const [toLang, setToLang] = useState('Odia');
  const [isSaved, setIsSaved] = useState(true);
  const [rated, setRated] = useState<'up' | 'down' | null>(null);

  const originalHindi = 'आज हम जल संरक्षण के बारे में पढ़ेंगे।';
  const translatedOdia = 'ଆଜି ଆମେ ଜଳ ସଂରକ୍ଷଣ ବିଷୟରେ ପଢ଼ିବୁ ।';

  const handleSpeak = (text: string) => {
    Speech.stop();
    Speech.speak(text, { language: 'hi-IN', rate: 0.85 });
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `JANBHASHA Translation:\nHindi: ${originalHindi}\nOdia: ${translatedOdia}`,
      });
    } catch (err) {
      console.warn(err);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.iconBtn}>
          <Ionicons name="arrow-back" size={22} color={c.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: c.text }]}>Translation</Text>

        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => setIsSaved(!isSaved)} style={styles.iconBtn}>
            <Ionicons
              name={isSaved ? 'star' : 'star-outline'}
              size={22}
              color={isSaved ? '#F59E0B' : c.text}
            />
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="ellipsis-vertical" size={20} color={c.text} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Language Selection Header Bar */}
        <View style={[styles.langBar, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={styles.langPill}>
            <Text style={{ fontSize: 16 }}>🇮🇳</Text>
            <Text style={[styles.langText, { color: c.text }]}>From: {fromLang}</Text>
          </View>

          <TouchableOpacity style={styles.swapBtn}>
            <Ionicons name="swap-horizontal" size={18} color="#3B82F6" />
          </TouchableOpacity>

          <View style={styles.langPill}>
            <Text style={[styles.langText, { color: '#2563EB' }]}>To: {toLang}</Text>
          </View>
        </View>

        {/* Dual Translation Cards */}
        <View style={styles.cardsContainer}>
          {/* Original Text (Hindi) Card */}
          <View style={[styles.textCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.cardTag, { color: c.textMuted }]}>Original (Hindi)</Text>
            <Text style={[styles.mainSentence, { color: c.text }]}>{originalHindi}</Text>

            <View style={styles.cardActionsRow}>
              <TouchableOpacity onPress={() => handleSpeak(originalHindi)} style={styles.actionBtn}>
                <Ionicons name="volume-medium" size={16} color={c.primary} />
                <Text style={[styles.actionBtnText, { color: c.primary }]}>Listen</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="copy-outline" size={15} color={c.textMuted} />
                <Text style={[styles.actionBtnText, { color: c.textMuted }]}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} style={styles.actionBtn}>
                <Ionicons name="share-social-outline" size={15} color={c.textMuted} />
                <Text style={[styles.actionBtnText, { color: c.textMuted }]}>Share</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Translation (Odia) Card */}
          <View style={[styles.textCard, { backgroundColor: theme.isDark ? '#082F49' : '#F0F9FF', borderColor: '#38BDF8' }]}>
            <Text style={[styles.cardTag, { color: '#0284C7' }]}>Translation (Odia)</Text>
            <Text style={[styles.mainSentence, { color: theme.isDark ? '#E0F2FE' : '#0369A1' }]}>
              {translatedOdia}
            </Text>

            <View style={styles.cardActionsRow}>
              <TouchableOpacity onPress={() => handleSpeak(translatedOdia)} style={styles.actionBtn}>
                <Ionicons name="volume-medium" size={16} color="#0284C7" />
                <Text style={[styles.actionBtnText, { color: '#0284C7' }]}>Listen</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn}>
                <Ionicons name="copy-outline" size={15} color={c.textMuted} />
                <Text style={[styles.actionBtnText, { color: c.textMuted }]}>Copy</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} style={styles.actionBtn}>
                <Ionicons name="share-social-outline" size={15} color={c.textMuted} />
                <Text style={[styles.actionBtnText, { color: c.textMuted }]}>Share</Text>
              </TouchableOpacity>
              <View style={[styles.actionBtn, { marginLeft: 'auto' }]}>
                <Ionicons name="star" size={15} color="#F59E0B" />
                <Text style={{ fontSize: 12, fontWeight: '700', color: '#D97706' }}>Saved</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Word Breakdown Section */}
        <View style={styles.breakdownContainer}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>Word Breakdown</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.breakdownScroll}>
            {WORD_BREAKDOWNS.map((word, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => handleSpeak(word.hi)}
                style={[styles.wordChip, { backgroundColor: c.card, borderColor: c.border }]}
              >
                <Text style={[styles.wordHi, { color: c.text }]}>{word.hi}</Text>
                <Text style={[styles.wordPr, { color: c.textMuted }]}>({word.pr})</Text>
                <View style={styles.chipBottom}>
                  <Ionicons name="volume-low-outline" size={14} color="#3B82F6" />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* AI Suggestion Card & Rating */}
        <View style={styles.bottomRow}>
          {/* AI Suggestion Card */}
          <View style={[styles.aiSuggestionCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.aiSuggestTag, { color: '#6366F1' }]}>AI Suggestion</Text>
            <Text style={[styles.aiSuggestText, { color: c.text }]}>
              Would you like to learn more about this topic?
            </Text>
            <TouchableOpacity
              onPress={() => nav.navigate('AIExplain' as any)}
              style={styles.askAiBtn}
            >
              <Ionicons name="sparkles" size={14} color="#FFFFFF" />
              <Text style={styles.askAiBtnText}>Ask AI Tutor</Text>
            </TouchableOpacity>
          </View>

          {/* Rate Translation */}
          <View style={[styles.ratingCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.ratingTag, { color: c.textMuted }]}>Rate Translation</Text>
            <View style={styles.thumbsRow}>
              <TouchableOpacity
                onPress={() => setRated('up')}
                style={[
                  styles.thumbBtn,
                  rated === 'up' && { backgroundColor: '#DCFCE7', borderColor: '#22C55E' },
                ]}
              >
                <Ionicons name="thumbs-up-outline" size={18} color={rated === 'up' ? '#16A34A' : c.text} />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setRated('down')}
                style={[
                  styles.thumbBtn,
                  rated === 'down' && { backgroundColor: '#FEE2E2', borderColor: '#EF4444' },
                ]}
              >
                <Ionicons name="thumbs-down-outline" size={18} color={rated === 'down' ? '#DC2626' : c.text} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    padding: 6,
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  langBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 12,
    marginBottom: 16,
  },
  langPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  langText: {
    fontSize: 14,
    fontWeight: '700',
  },
  swapBtn: {
    padding: 6,
    borderRadius: 12,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  cardsContainer: {
    gap: 14,
    marginBottom: 20,
  },
  textCard: {
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardTag: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  mainSentence: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 26,
    marginBottom: 14,
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.06)',
    paddingTop: 10,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  actionBtnText: {
    fontSize: 12,
    fontWeight: '700',
  },
  breakdownContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 12,
  },
  breakdownScroll: {
    gap: 8,
  },
  wordChip: {
    borderRadius: 16,
    borderWidth: 1.5,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    minWidth: 80,
  },
  wordHi: {
    fontSize: 14,
    fontWeight: '800',
  },
  wordPr: {
    fontSize: 11,
    marginTop: 2,
  },
  chipBottom: {
    marginTop: 6,
  },
  bottomRow: {
    flexDirection: 'row',
    gap: 10,
  },
  aiSuggestionCard: {
    flex: 2,
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 14,
    justifyContent: 'space-between',
  },
  aiSuggestTag: {
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  aiSuggestText: {
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 16,
    marginVertical: 6,
  },
  askAiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 8,
  },
  askAiBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  ratingCard: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  ratingTag: {
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  thumbsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  thumbBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
