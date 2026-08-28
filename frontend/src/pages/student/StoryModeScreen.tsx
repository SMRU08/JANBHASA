import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Audio } from 'expo-av';
import { Header } from '../../components/Header';
import { Button } from '../../components/Button';
import { Card } from '../../components/Card';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';
import { useGamificationStore } from '../../store/gamificationStore';
import { synthesize } from '../../services/ttsService';
import { translate } from '../../services/translationService';

const SAMPLE_STORIES = [
  {
    id: 1,
    title_hi: 'चालाक लोमड़ी और कौवा',
    title_en: 'The Clever Fox and the Crow',
    emoji: '🦊',
    paragraphs_hi: [
      'एक बार एक कौवे को रोटी का एक टुकड़ा मिला। वह पेड़ की डाल पर बैठ गया।',
      'एक भूखी लोमड़ी वहाँ आई। उसने कौवे के मुँह में रोटी देखी।',
      'लोमड़ी ने कहा, "कौवा भैया, आप बहुत मीठा गाते हैं! कृपया एक गाना सुनाइए।"',
      'कौवा अपनी तारीफ सुनकर खुश हो गया। जैसे ही उसने गाने के लिए मुँह खोला, रोटी नीचे गिर गई।',
      'लोमड़ी ने तुरंत रोटी उठाई और हँसते हुए भाग गई।'
    ],
    moral_hi: 'झूठी तारीफ करने वालों से हमेशा सावधान रहें।',
    moral_en: 'Beware of flatterers.',
    xp_reward: 30
  },
  {
    id: 2,
    title_hi: 'कछुआ और खरगोश की दौड़',
    title_en: 'The Tortoise and the Hare',
    emoji: '🐢',
    paragraphs_hi: [
      'एक खरगोश को अपनी तेज़ चाल पर बहुत घमंड था। उसने एक कछुए को दौड़ लगाने की चुनौती दी।',
      'दौड़ शुरू हुई। खरगोश बहुत तेजी से दौड़ा और बहुत आगे निकल गया।',
      'खरगोश ने सोचा कि कछुआ बहुत पीछे है, इसलिए थोड़ी देर सो लिया जाए। वह पेड़ के नीचे सो गया।',
      'कछुआ बिना रुके धीरे-धीरे लगातार चलता रहा।',
      'जब खरगोश जागा, तो उसने देखा कि कछुआ दौड़ जीत चुका था।'
    ],
    moral_hi: 'लगातार और धैर्यपूर्वक प्रयास करने वाले की हमेशा जीत होती है।',
    moral_en: 'Slow and steady wins the race.',
    xp_reward: 30
  }
];

export function StoryModeScreen() {
  const theme = useTheme();
  const c = theme.colors;
  const { user } = useAuthStore();
  const { addXp } = useGamificationStore();
  const [selectedStory, setSelectedStory] = useState<any>(SAMPLE_STORIES[0]);
  const [translatedParagraphs, setTranslatedParagraphs] = useState<string[]>([]);
  const [translatedMoral, setTranslatedMoral] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [readCompleted, setReadCompleted] = useState(false);

  const targetLang = user?.selected_language || 'hi';

  const handleSelectStory = async (story: any) => {
    setSelectedStory(story);
    setReadCompleted(false);
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
      setIsPlaying(false);
    }

    if (targetLang !== 'hi') {
      setIsTranslating(true);
      try {
        const transParas = await Promise.all(
          story.paragraphs_hi.map((p: string) => translate(p, 'hi', targetLang))
        );
        const transM = await translate(story.moral_hi, 'hi', targetLang);
        setTranslatedParagraphs(transParas);
        setTranslatedMoral(transM);
      } catch (err) {
        console.error('Translation error in story:', err);
      } finally {
        setIsTranslating(false);
      }
    } else {
      setTranslatedParagraphs([]);
      setTranslatedMoral('');
    }
  };

  const handleReadAloud = async () => {
    if (isPlaying && sound) {
      await sound.stopAsync();
      setIsPlaying(false);
      return;
    }

    const fullText = (translatedParagraphs.length > 0 ? translatedParagraphs : selectedStory.paragraphs_hi).join(' ');
    const lang = translatedParagraphs.length > 0 ? targetLang : 'hi';
    const audioUrl = await synthesize(fullText, lang);

    if (audioUrl) {
      try {
        if (sound) {
          await sound.unloadAsync();
        }
        const { sound: s } = await Audio.Sound.createAsync({ uri: audioUrl });
        setSound(s);
        setIsPlaying(true);
        s.setOnPlaybackStatusUpdate((status: any) => {
          if (status.didJustFinish) {
            setIsPlaying(false);
          }
        });
        await s.playAsync();
      } catch (e) {
        console.warn('Audio play failed', e);
        setIsPlaying(false);
      }
    }
  };

  const handleCompleteStory = () => {
    if (!readCompleted) {
      addXp(selectedStory.xp_reward);
      setReadCompleted(true);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="Story Time 📖" subtitle="कहानियों से सीखें" />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* Story Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
          {SAMPLE_STORIES.map((s) => (
            <TouchableOpacity
              key={s.id}
              onPress={() => handleSelectStory(s)}
              style={[
                styles.storyTab,
                {
                  backgroundColor: selectedStory.id === s.id ? c.primary : c.card,
                  borderColor: selectedStory.id === s.id ? c.primary : c.border
                }
              ]}
            >
              <Text style={{ fontSize: 20, marginRight: 6 }}>{s.emoji}</Text>
              <Text style={{ color: selectedStory.id === s.id ? '#fff' : c.text, fontWeight: '700' }}>
                {s.title_hi}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Story Card */}
        <Card style={{ marginBottom: 16 }}>
          <View style={styles.storyHeader}>
            <Text style={styles.storyEmoji}>{selectedStory.emoji}</Text>
            <Text style={[styles.storyTitle, { color: c.text }]}>{selectedStory.title_hi}</Text>
            <Text style={[styles.storySub, { color: c.textMuted }]}>{selectedStory.title_en}</Text>
          </View>

          {isTranslating ? (
            <Text style={{ color: c.textSecondary, textAlign: 'center', padding: 20 }}>
              Translating to your language... ⏳
            </Text>
          ) : (
            <View style={{ marginTop: 12 }}>
              {selectedStory.paragraphs_hi.map((para: string, idx: number) => (
                <View key={idx} style={{ marginBottom: 14 }}>
                  <Text style={[styles.paraHi, { color: c.text }]}>{para}</Text>
                  {translatedParagraphs[idx] ? (
                    <Text style={[styles.paraTrans, { color: c.primary }]}>
                      {translatedParagraphs[idx]}
                    </Text>
                  ) : null}
                </View>
              ))}

              <View style={[styles.moralBox, { backgroundColor: c.warningLight, borderColor: c.warning }]}>
                <Text style={[styles.moralTitle, { color: c.warningDark || '#E65100' }]}>💡 सीख (Moral):</Text>
                <Text style={[styles.moralText, { color: c.text }]}>{selectedStory.moral_hi}</Text>
                {translatedMoral ? (
                  <Text style={[styles.moralTrans, { color: c.primaryDark }]}>{translatedMoral}</Text>
                ) : null}
              </View>
            </View>
          )}
        </Card>

        {/* Controls */}
        <View style={styles.buttonRow}>
          <Button
            title={isPlaying ? "⏹️ Stop Audio" : "🔊 Listen Story"}
            onPress={handleReadAloud}
            variant="outline"
            style={{ flex: 1, marginRight: 8 }}
          />
          <Button
            title={readCompleted ? "✅ Completed (+30 XP)" : "⭐ Mark Read (+30 XP)"}
            onPress={handleCompleteStory}
            disabled={readCompleted}
            style={{ flex: 1 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  storyTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 10
  },
  storyHeader: {
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
    paddingBottom: 14
  },
  storyEmoji: { fontSize: 48, marginBottom: 6 },
  storyTitle: { fontSize: 20, fontWeight: '800', textAlign: 'center' },
  storySub: { fontSize: 13, marginTop: 2 },
  paraHi: { fontSize: 16, lineHeight: 26, fontWeight: '500' },
  paraTrans: { fontSize: 15, lineHeight: 24, fontStyle: 'italic', marginTop: 4 },
  moralBox: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginTop: 10
  },
  moralTitle: { fontSize: 14, fontWeight: '800', marginBottom: 4 },
  moralText: { fontSize: 15, fontWeight: '600' },
  moralTrans: { fontSize: 14, marginTop: 4, fontStyle: 'italic' },
  buttonRow: { flexDirection: 'row', marginTop: 8 }
});
