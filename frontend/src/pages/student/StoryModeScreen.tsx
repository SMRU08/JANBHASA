import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Speech from 'expo-speech';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { AnimatedCard } from '../../components/AnimatedCard';
import { ConfettiEffect } from '../../components/ConfettiEffect';
import { TribalMotifBar } from '../../components/VisualIllustrations';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { useGamificationStore } from '../../store/gamificationStore';
import { translateOfflineFull } from '../../services/offlineNlpEngine';

const SAMPLE_STORIES = [
  {
    id: 1,
    title_hi: 'चालाक लोमड़ी और कौवा',
    title_en: 'The Clever Fox and the Crow',
    emoji: '🦊',
    cover_gradient: ['#EA580C', '#F97316'] as [string, string],
    paragraphs_hi: [
      'एक बार एक कौवे को रोटी का एक टुकड़ा मिला। वह पेड़ की डाल पर बैठ गया।',
      'एक भूखी लोमड़ी वहाँ आई। उसने कौवे के मुँह में रोटी देखी।',
      'लोमड़ी ने कहा, "कौवा भैया, आप बहुत मीठा गाते हैं! कृपया एक गाना सुनाइए।"',
      'कौवा अपनी तारीफ सुनकर खुश हो गया। जैसे ही उसने गाने के लिए मुँह खोला, रोटी नीचे गिर गई।',
      'लोमड़ी ने तुरंत रोटी उठाई और हँसते हुए भाग गई।'
    ],
    moral_hi: 'झूठी तारीफ करने वालों से हमेशा सावधान रहें।',
    moral_en: 'Beware of flatterers.',
    xp_reward: 35
  },
  {
    id: 2,
    title_hi: 'कछुआ और खरगोश की दौड़',
    title_en: 'The Tortoise and the Hare',
    emoji: '🐢',
    cover_gradient: ['#059669', '#10B981'] as [string, string],
    paragraphs_hi: [
      'एक खरगोश को अपनी तेज़ चाल पर बहुत घमंड था। उसने एक कछुए को दौड़ लगाने की चुनौती दी।',
      'दौड़ शुरू हुई। खरगोश बहुत तेजी से दौड़ा और बहुत आगे निकल गया।',
      'खरगोश ने सोचा कि कछुआ बहुत पीछे है, इसलिए थोड़ी देर सो लिया जाए। वह पेड़ के नीचे सो गया।',
      'कछुआ बिना रुके धीरे-धीरे लगातार चलता रहा।',
      'जब खरगोश जागा, तो उसने देखा कि कछुआ दौड़ जीत चुका था।'
    ],
    moral_hi: 'लगातार और धैर्यपूर्वक प्रयास करने वाले की हमेशा जीत होती है।',
    moral_en: 'Slow and steady wins the race.',
    xp_reward: 35
  },
  {
    id: 3,
    title_hi: 'सच्चा मित्र और भालू',
    title_en: 'Two Friends and the Bear',
    emoji: '🐻',
    cover_gradient: ['#7C3AED', '#8B5CF6'] as [string, string],
    paragraphs_hi: [
      'दो मित्र एक जंगल से होकर जा रहे थे। अचानक उनके सामने एक भालू आ गया।',
      'पहला मित्र तुरंत पास के एक ऊंचे पेड़ पर चढ़ गया।',
      'दूसरे मित्र को पेड़ पर चढ़ना नहीं आता था, वह जमीन पर सांस रोककर लेट गया।',
      'भालू उसके पास आया, उसे सूंघा और मरा हुआ समझकर चला गया।',
      'पेड़ से उतरकर पहले मित्र ने पूछा, "भालू ने तुम्हारे कान में क्या कहा?" दूसरे ने कहा, "जो मुसीबत में छोड़ दे, वह सच्चा दोस्त नहीं होता।"'
    ],
    moral_hi: 'सच्चा मित्र वही है जो मुसीबत में साथ निभाए।',
    moral_en: 'A friend in need is a friend indeed.',
    xp_reward: 35
  }
];

export function StoryModeScreen() {
  const theme = useTheme();
  const c = theme.colors;
  const { user } = useAuthStore();
  const { addXp } = useGamificationStore();
  const [selectedStory, setSelectedStory] = useState(SAMPLE_STORIES[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [readCompleted, setReadCompleted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const targetLang = (user?.selected_language as any) || 'hi';

  const handleSelectStory = (story: any) => {
    setSelectedStory(story);
    setReadCompleted(false);
    setShowConfetti(false);
    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
    }
  };

  const handleReadAloud = async () => {
    if (isPlaying) {
      Speech.stop();
      setIsPlaying(false);
      return;
    }

    const fullText = selectedStory.paragraphs_hi.join(' ');
    setIsPlaying(true);
    try {
      await Speech.speak(fullText, {
        language: 'hi-IN',
        rate: 0.85,
        onDone: () => setIsPlaying(false),
        onError: () => setIsPlaying(false),
      });
    } catch {
      setIsPlaying(false);
    }
  };

  const handleCompleteStory = () => {
    if (!readCompleted) {
      addXp(selectedStory.xp_reward);
      setReadCompleted(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1600);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <ConfettiEffect active={showConfetti} count={28} />
      <Header
        title="Tribal Story Time 📖"
        subtitle="कहानियों से सीखें • लोककथाएं"
        variant="gradient"
        gradientColors={['#059669', '#10B981']}
      />

      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
        {/* Story Selector Horizontal Scroll */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {SAMPLE_STORIES.map((s) => {
            const isSelected = selectedStory.id === s.id;
            return (
              <AnimatedCard
                key={s.id}
                onPress={() => handleSelectStory(s)}
                style={[
                  styles.storyTabCard,
                  {
                    backgroundColor: isSelected ? (theme.isDark ? '#064E3B' : '#ECFDF5') : c.card,
                    borderColor: isSelected ? '#10B981' : c.border,
                  },
                ]}
              >
                <Text style={{ fontSize: 24, marginRight: 8 }}>{s.emoji}</Text>
                <View>
                  <Text style={{ color: isSelected ? '#059669' : c.text, fontWeight: '800', fontSize: 13 }}>
                    {s.title_hi}
                  </Text>
                  <Text style={{ color: c.textMuted, fontSize: 10 }}>{s.title_en}</Text>
                </View>
              </AnimatedCard>
            );
          })}
        </ScrollView>

        {/* Story Book Frame */}
        <View style={[styles.bookFrame, { backgroundColor: c.card, borderColor: c.border }]}>
          {/* Story Cover Banner */}
          <LinearGradient
            colors={selectedStory.cover_gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.coverBanner}
          >
            <Text style={{ fontSize: 52 }}>{selectedStory.emoji}</Text>
            <Text style={styles.storyCoverTitle}>{selectedStory.title_hi}</Text>
            <Text style={styles.storyCoverSub}>{selectedStory.title_en}</Text>
          </LinearGradient>

          <TribalMotifBar color={theme.isDark ? '#F59E0B' : '#D97706'} height={12} />

          {/* Story Paragraphs */}
          <View style={{ padding: 16 }}>
            {selectedStory.paragraphs_hi.map((para, idx) => {
              const transText = targetLang !== 'hi' ? translateOfflineFull(para, 'hi', targetLang) : '';
              return (
                <View key={idx} style={styles.paragraphBox}>
                  <View style={styles.paraIndex}>
                    <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '900' }}>{idx + 1}</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.paraHindi, { color: c.text }]}>{para}</Text>
                    {transText && transText !== para && (
                      <Text style={[styles.paraTrans, { color: '#059669' }]}>
                        {transText}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}

            {/* Moral of Story Box */}
            <View style={[styles.moralBox, { backgroundColor: theme.isDark ? '#78350F' : '#FFFBEB', borderColor: '#F59E0B' }]}>
              <Text style={{ color: '#D97706', fontSize: 13, fontWeight: '900' }}>💡 कहानी की सीख (Moral):</Text>
              <Text style={[styles.moralHindi, { color: c.text }]}>{selectedStory.moral_hi}</Text>
              <Text style={{ color: c.textMuted, fontSize: 12, fontStyle: 'italic', marginTop: 2 }}>{selectedStory.moral_en}</Text>
            </View>
          </View>
        </View>

        {/* Action Controls */}
        <View style={styles.controlsRow}>
          <Button
            title={isPlaying ? '⏹️ Stop Story' : '🔊 Listen Story'}
            onPress={handleReadAloud}
            variant="outline"
            style={{ flex: 1, marginRight: 8 }}
          />
          <Button
            title={readCompleted ? '✅ Read (+35 XP)' : '⭐ Finished (+35 XP)'}
            onPress={handleCompleteStory}
            disabled={readCompleted}
            variant="primary"
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  storyTabCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
    borderWidth: 1.5,
    marginRight: 10,
  },
  bookFrame: {
    borderRadius: 24,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 16,
  },
  coverBanner: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 16,
  },
  storyCoverTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 8,
    textAlign: 'center',
  },
  storyCoverSub: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  paragraphBox: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 10,
  },
  paraIndex: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#059669',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 3,
  },
  paraHindi: {
    fontSize: 16,
    lineHeight: 26,
    fontWeight: '600',
  },
  paraTrans: {
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
    marginTop: 4,
    fontWeight: '700',
  },
  moralBox: {
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 14,
    marginTop: 8,
  },
  moralHindi: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 4,
  },
  controlsRow: {
    flexDirection: 'row',
  },
});
