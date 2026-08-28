import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';

interface FlashcardProps {
  front_text: string;
  back_text: string;
  front_lang?: string;
  back_lang?: string;
  image_emoji?: string;
  onCorrect?: () => void;
  onIncorrect?: () => void;
  onListen?: (text: string, lang: string) => void;
}

export function Flashcard({
  front_text,
  back_text,
  front_lang = 'hi',
  back_lang = 'en',
  image_emoji,
  onCorrect,
  onIncorrect,
  onListen
}: FlashcardProps) {
  const theme = useTheme();
  const [flipped, setFlipped] = useState(false);
  const animatedValue = useRef(new Animated.Value(0)).current;

  const flip = () => {
    if (flipped) {
      Animated.spring(animatedValue, { toValue: 0, friction: 8, tension: 10, useNativeDriver: false }).start();
    } else {
      Animated.spring(animatedValue, { toValue: 180, friction: 8, tension: 10, useNativeDriver: false }).start();
    }
    setFlipped(!flipped);
  };

  const frontInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['0deg', '180deg'],
  });

  const backInterpolate = animatedValue.interpolate({
    inputRange: [0, 180],
    outputRange: ['180deg', '360deg'],
  });

  const frontOpacity = animatedValue.interpolate({
    inputRange: [89, 90],
    outputRange: [1, 0],
  });

  const backOpacity = animatedValue.interpolate({
    inputRange: [89, 90],
    outputRange: [0, 1],
  });

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity onPress={flip} activeOpacity={0.9} style={styles.cardContainer}>
        <Animated.View
          style={[
            styles.card,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
              opacity: frontOpacity,
              transform: [{ rotateY: frontInterpolate }]
            }
          ]}
        >
          {image_emoji && <Text style={styles.emoji}>{image_emoji}</Text>}
          <Text style={[styles.text, { color: theme.colors.text }]}>{front_text}</Text>
          <Text style={[styles.hint, { color: theme.colors.textMuted }]}>Tap to flip 👆</Text>
          <TouchableOpacity
            onPress={() => onListen?.(front_text, front_lang)}
            style={[styles.listenBtn, { backgroundColor: theme.colors.primaryLight }]}
          >
            <Ionicons name="volume-high" size={18} color={theme.colors.primary} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[
            styles.card,
            styles.cardBack,
            {
              backgroundColor: theme.colors.primaryLight,
              borderColor: theme.colors.primary,
              opacity: backOpacity,
              transform: [{ rotateY: backInterpolate }]
            }
          ]}
        >
          <Text style={[styles.text, { color: theme.colors.primaryDark, fontSize: 28 }]}>{back_text}</Text>
          <Text style={[styles.langTag, { color: theme.colors.primary }]}>{back_lang.toUpperCase()}</Text>
          <TouchableOpacity
            onPress={() => onListen?.(back_text, back_lang)}
            style={[styles.listenBtn, { backgroundColor: theme.colors.primary }]}
          >
            <Ionicons name="volume-high" size={18} color="#fff" />
          </TouchableOpacity>
        </Animated.View>
      </TouchableOpacity>

      {flipped && (
        <View style={styles.actions}>
          <TouchableOpacity onPress={onIncorrect} style={[styles.actionBtn, { backgroundColor: '#FFEBEE' }]}>
            <Text style={{ fontSize: 22 }}>❌</Text>
            <Text style={{ color: theme.colors.error, fontWeight: '700', marginTop: 2 }}>Again</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={onCorrect} style={[styles.actionBtn, { backgroundColor: '#E8F5E9' }]}>
            <Text style={{ fontSize: 22 }}>✅</Text>
            <Text style={{ color: theme.colors.success, fontWeight: '700', marginTop: 2 }}>Got it!</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', width: '100%' },
  cardContainer: { width: '100%', height: 220, marginBottom: 16, position: 'relative' },
  card: {
    width: '100%',
    height: 220,
    borderRadius: 20,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backfaceVisibility: 'hidden'
  },
  cardBack: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  emoji: { fontSize: 48, marginBottom: 12 },
  text: { fontSize: 32, fontWeight: '800', textAlign: 'center' },
  hint: { fontSize: 12, marginTop: 12 },
  langTag: { fontSize: 12, fontWeight: '700', marginTop: 8 },
  listenBtn: { position: 'absolute', bottom: 12, right: 12, borderRadius: 20, padding: 8 },
  actions: { flexDirection: 'row', gap: 20, marginTop: 4, width: '100%' },
  actionBtn: { flex: 1, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
});
