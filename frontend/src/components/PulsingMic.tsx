import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

interface Props {
  isRecording: boolean;
  onPressIn?: () => void;
  onPressOut?: () => void;
  onPress?: () => void;
  size?: number;
  icon?: string;
  subLabel?: string;
  colors?: [string, string];
  pulseColor?: string;
  disabled?: boolean;
}

export function PulsingMic({
  isRecording,
  onPressIn,
  onPressOut,
  onPress,
  size = 120,
  icon = '🎤',
  subLabel,
  colors = ['#10B981', '#059669'],
  pulseColor = 'rgba(16, 185, 129, 0.4)',
  disabled = false,
}: Props) {
  const pulseAnim1 = useRef(new Animated.Value(1)).current;
  const pulseAnim2 = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;
    if (isRecording) {
      animation = Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(pulseAnim1, {
              toValue: 1.35,
              duration: 900,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim1, {
              toValue: 1,
              duration: 900,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(pulseAnim2, {
              toValue: 1.55,
              duration: 1200,
              useNativeDriver: true,
            }),
            Animated.timing(pulseAnim2, {
              toValue: 1,
              duration: 1200,
              useNativeDriver: true,
            }),
          ]),
          Animated.sequence([
            Animated.timing(opacityAnim, {
              toValue: 0.15,
              duration: 900,
              useNativeDriver: true,
            }),
            Animated.timing(opacityAnim, {
              toValue: 0.7,
              duration: 900,
              useNativeDriver: true,
            }),
          ]),
        ])
      );
      animation.start();
    } else {
      pulseAnim1.setValue(1);
      pulseAnim2.setValue(1);
      opacityAnim.setValue(0.7);
    }
    return () => {
      if (animation) animation.stop();
    };
  }, [isRecording]);

  const recordColors = isRecording
    ? (['#EF4444', '#B91C1C'] as [string, string])
    : colors;

  return (
    <View style={[styles.wrapper, { width: size + 60, height: size + 60 }]}>
      {/* Outer Pulse Ring 2 */}
      {isRecording && (
        <Animated.View
          style={[
            styles.pulseRing,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: isRecording ? 'rgba(239, 68, 68, 0.25)' : pulseColor,
              transform: [{ scale: pulseAnim2 }],
              opacity: opacityAnim,
            },
          ]}
        />
      )}

      {/* Outer Pulse Ring 1 */}
      {isRecording && (
        <Animated.View
          style={[
            styles.pulseRing,
            {
              width: size,
              height: size,
              borderRadius: size / 2,
              backgroundColor: isRecording ? 'rgba(239, 68, 68, 0.45)' : pulseColor,
              transform: [{ scale: pulseAnim1 }],
            },
          ]}
        />
      )}

      {/* Core Button */}
      <TouchableOpacity
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.88}
        style={[styles.btnTouch, { width: size, height: size, borderRadius: size / 2 }]}
      >
        <LinearGradient
          colors={recordColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.btnGradient, { width: size, height: size, borderRadius: size / 2 }]}
        >
          {/* Bevel glow overlay */}
          <View style={[styles.innerGlow, { borderRadius: size / 2 }]} />
          <Text style={{ fontSize: size * 0.4 }}>{isRecording ? '⏹️' : icon}</Text>
          {subLabel && (
            <Text style={[styles.subLabel, { fontSize: Math.max(9, size * 0.095) }]}>
              {subLabel}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  pulseRing: {
    position: 'absolute',
  },
  btnTouch: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 12,
    elevation: 8,
  },
  btnGradient: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  innerGlow: {
    ...StyleSheet.absoluteFillObject,
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.4)',
  },
  subLabel: {
    color: '#FFFFFF',
    fontWeight: '800',
    marginTop: 3,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
