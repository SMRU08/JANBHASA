import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { useTheme } from '../../theme';

interface ChatMsg {
  id: string;
  sender: 'user' | 'ai';
  text?: string;
  isDetailedCard?: boolean;
  word?: string;
  pronunciation?: string;
  meaningOdia?: string;
  exampleOdia?: string;
  audioDuration?: string;
  suggestions?: string[];
  timestamp: string;
}

const INITIAL_CONVERSATION: ChatMsg[] = [
  {
    id: '1',
    sender: 'user',
    text: 'मुझे यह शब्द समझ नहीं आ रहा।',
    timestamp: '10:30 AM',
  },
  {
    id: '2',
    sender: 'ai',
    text: 'ज़रूर! मैं इसे आपकी मातृभाषा में आसान तरीके से समझाता हूँ।',
    isDetailedCard: true,
    word: 'संरक्षण (Sanrakshan)',
    meaningOdia: 'ସୁରକ୍ଷା, ରକ୍ଷା କରିବା, ସଂରକ୍ଷଣ କରି ରଖିବା।',
    exampleOdia: 'ଜଳବାୟୁର ସଂରକ୍ଷଣ କରିବା ଆମର କର୍ତ୍ତବ୍ୟ।',
    audioDuration: '0:18',
    suggestions: ['और उदाहरण दें', 'इसका वाक्य में प्रयोग?', 'इसका चित्र दिखाओ'],
    timestamp: '10:31 AM',
  },
];

export function AIExplainScreen() {
  const theme = useTheme();
  const c = theme.colors;
  const nav = useNavigation<any>();

  const [messages, setMessages] = useState<ChatMsg[]>(INITIAL_CONVERSATION);
  const [inputText, setInputText] = useState('');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  const handleSpeak = (text: string) => {
    Speech.stop();
    if (isPlayingAudio) {
      setIsPlayingAudio(false);
    } else {
      setIsPlayingAudio(true);
      Speech.speak(text, {
        language: 'hi-IN',
        rate: 0.85,
        onDone: () => setIsPlayingAudio(false),
        onError: () => setIsPlayingAudio(false),
      });
    }
  };

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: ChatMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');

    // Generate Contextual Response
    setTimeout(() => {
      let aiText = `बहुत अच्छा सवाल! "${text}" के बारे में सरल व्याख्या:`;
      let wordObj: any = {
        word: 'जल संरक्षण (Water Conservation)',
        meaningOdia: 'ପାଣି ସଞ୍ଚୟ କରିବା ଏବଂ ଏହାର ସଠିକ୍ ବ୍ୟବହାର କରିବା।',
        exampleOdia: 'ବର୍ଷା ଜଳ ସଂରକ୍ଷଣ କରିବା ଦ୍ୱାରା ଜଳକଷ୍ଟ ଦୂର ହୁଏ।',
        audioDuration: '0:15',
        suggestions: ['और उदाहरण दीजिए', 'इसका महत्व क्या है?', 'पानी कैसे बचाएं?'],
      };

      if (text.includes('चित्र') || text.includes('photo')) {
        aiText = 'यह देखिए, जल संरक्षण के तरीके: वर्षा जल संचयन, पेड़ लगाना और नल बंद रखना!';
      }

      const aiMsg: ChatMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: aiText,
        isDetailedCard: true,
        ...wordObj,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
    }, 700);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color={c.text} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.headerTitleRow}>
            <Text style={[styles.headerTitle, { color: c.text }]}>JANBHASHA AI</Text>
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Online</Text>
            </View>
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity onPress={() => handleSpeak('नमस्ते')} style={styles.headerBtn}>
            <Ionicons name="volume-medium-outline" size={22} color={c.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerBtn}>
            <Ionicons name="ellipsis-vertical" size={20} color={c.text} />
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <View
                key={msg.id}
                style={[
                  styles.msgWrapper,
                  isUser ? styles.msgWrapperUser : styles.msgWrapperAi,
                ]}
              >
                {!isUser && (
                  <View style={styles.aiAvatar}>
                    <Ionicons name="bulb" size={16} color="#FFFFFF" />
                  </View>
                )}

                <View
                  style={[
                    styles.bubble,
                    isUser
                      ? [styles.bubbleUser, { backgroundColor: '#3B82F6' }]
                      : [styles.bubbleAi, { backgroundColor: c.card, borderColor: c.border }],
                  ]}
                >
                  {msg.text && (
                    <Text
                      style={[
                        styles.msgText,
                        { color: isUser ? '#FFFFFF' : c.text },
                      ]}
                    >
                      {msg.text}
                    </Text>
                  )}

                  {/* AI Detailed Vocabulary Card */}
                  {msg.isDetailedCard && (
                    <View style={[styles.detailCard, { backgroundColor: theme.isDark ? '#0F172A' : '#F8FAFC', borderColor: c.border }]}>
                      {msg.word && (
                        <Text style={[styles.detailWord, { color: c.text }]}>
                          शब्द: {msg.word}
                        </Text>
                      )}
                      {msg.meaningOdia && (
                        <Text style={[styles.detailMeaning, { color: c.text }]}>
                          अर्थ: {msg.meaningOdia}
                        </Text>
                      )}
                      {msg.exampleOdia && (
                        <View style={styles.exampleRow}>
                          <Text style={[styles.detailExample, { color: c.textMuted }]}>
                            उदाहरण: {msg.exampleOdia}
                          </Text>
                          <TouchableOpacity
                            onPress={() => handleSpeak(msg.exampleOdia!)}
                            style={styles.speakerBtn}
                          >
                            <Ionicons name="volume-medium" size={16} color="#3B82F6" />
                          </TouchableOpacity>
                        </View>
                      )}

                      {/* Audio Player Bar */}
                      {msg.audioDuration && (
                        <View style={styles.audioBar}>
                          <TouchableOpacity
                            onPress={() => handleSpeak(msg.exampleOdia || msg.word!)}
                            style={styles.playCircle}
                          >
                            <Ionicons
                              name={isPlayingAudio ? 'pause' : 'play'}
                              size={12}
                              color="#FFFFFF"
                            />
                          </TouchableOpacity>
                          <View style={styles.waveformTrack}>
                            <View style={styles.waveformProgress} />
                          </View>
                          <Text style={styles.audioTime}>0:00 / {msg.audioDuration}</Text>
                        </View>
                      )}
                    </View>
                  )}

                  <Text
                    style={[
                      styles.timestamp,
                      { color: isUser ? 'rgba(255,255,255,0.7)' : c.textMuted },
                    ]}
                  >
                    {msg.timestamp}
                  </Text>
                </View>
              </View>
            );
          })}

          {/* Quick Suggestion Chips */}
          <View style={styles.suggestionsContainer}>
            {['और उदाहरण दीजिए', 'इसका महत्व क्या है?', 'पानी कैसे बचाएं?'].map(
              (pill, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => handleSend(pill)}
                  style={[styles.suggestionChip, { backgroundColor: c.card, borderColor: c.border }]}
                >
                  <Text style={[styles.suggestionChipText, { color: '#3B82F6' }]}>{pill}</Text>
                </TouchableOpacity>
              )
            )}
          </View>
        </ScrollView>

        {/* Input Bar */}
        <View style={[styles.inputBar, { backgroundColor: c.card, borderTopColor: c.border }]}>
          <TouchableOpacity
            onPress={() => nav.navigate('VoiceAiListening' as any)}
            style={styles.micBtn}
          >
            <Ionicons name="mic" size={20} color="#FFFFFF" />
          </TouchableOpacity>

          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Type your message..."
            placeholderTextColor={c.textMuted}
            style={[styles.input, { color: c.text, backgroundColor: c.background }]}
          />

          <TouchableOpacity
            onPress={() => handleSend()}
            disabled={!inputText.trim()}
            style={[
              styles.sendBtn,
              { backgroundColor: inputText.trim() ? '#3B82F6' : '#94A3B8' },
            ]}
          >
            <Ionicons name="send" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  headerBtn: {
    padding: 6,
  },
  headerCenter: {
    alignItems: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  onlineDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#10B981',
  },
  onlineText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#10B981',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  scroll: {
    padding: 16,
    paddingBottom: 24,
  },
  msgWrapper: {
    flexDirection: 'row',
    marginBottom: 14,
    gap: 8,
  },
  msgWrapperUser: {
    justifyContent: 'flex-end',
  },
  msgWrapperAi: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 20,
    padding: 14,
  },
  bubbleUser: {
    borderBottomRightRadius: 4,
  },
  bubbleAi: {
    borderBottomLeftRadius: 4,
    borderWidth: 1.5,
  },
  msgText: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 22,
  },
  detailCard: {
    marginTop: 10,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  detailWord: {
    fontSize: 13,
    fontWeight: '800',
  },
  detailMeaning: {
    fontSize: 13,
    fontWeight: '600',
  },
  exampleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailExample: {
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
  },
  speakerBtn: {
    padding: 4,
  },
  audioBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(59, 130, 246, 0.08)',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginTop: 4,
  },
  playCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveformTrack: {
    flex: 1,
    height: 4,
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  waveformProgress: {
    width: '45%',
    height: '100%',
    backgroundColor: '#3B82F6',
  },
  audioTime: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 10,
    alignSelf: 'flex-end',
    marginTop: 6,
  },
  suggestionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    marginLeft: 40,
  },
  suggestionChip: {
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  suggestionChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  micBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    fontSize: 13,
    fontWeight: '500',
  },
  sendBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
