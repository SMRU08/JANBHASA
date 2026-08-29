import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, { Path, Defs, LinearGradient, Stop, Circle } from 'react-native-svg';

interface Props {
  state?: 'idle' | 'listening' | 'processing' | 'translating' | 'speaking';
  height?: number;
  width?: number;
  barCount?: number;
}

export function LiveWaveform({
  state = 'listening',
  height = 140,
  width = Dimensions.get('window').width - 32,
  barCount = 32,
}: Props) {
  const animatedValues = useRef(
    Array.from({ length: barCount }, () => new Animated.Value(0.2))
  ).current;

  useEffect(() => {
    let isMounted = true;

    const animateBars = () => {
      if (!isMounted) return;

      const animations = animatedValues.map((anim, i) => {
        let toValue = 0.2;
        if (state === 'listening' || state === 'speaking') {
          // Bell curve multiplier centered around the middle
          const centerDist = Math.abs(i - barCount / 2) / (barCount / 2);
          const bellMultiplier = Math.cos(centerDist * (Math.PI / 2));
          toValue = Math.max(0.15, Math.random() * bellMultiplier * 0.95 + 0.1);
        } else if (state === 'processing') {
          toValue = Math.sin((i / barCount) * Math.PI * 2 + Date.now() / 300) * 0.35 + 0.45;
        } else {
          toValue = 0.15 + Math.sin(i * 0.5) * 0.08;
        }

        return Animated.timing(anim, {
          toValue,
          duration: state === 'listening' ? 120 + Math.random() * 80 : 300,
          useNativeDriver: false,
        });
      });

      Animated.parallel(animations).start(() => {
        if (isMounted) animateBars();
      });
    };

    animateBars();

    return () => {
      isMounted = false;
    };
  }, [state, barCount]);

  const barWidth = Math.max(3, (width - barCount * 3) / barCount);

  return (
    <View style={[styles.container, { height, width }]}>
      {/* Background Glow */}
      <View
        style={[
          styles.glow,
          {
            backgroundColor:
              state === 'listening'
                ? 'rgba(6, 182, 212, 0.15)'
                : state === 'speaking'
                ? 'rgba(168, 85, 247, 0.15)'
                : 'rgba(59, 130, 246, 0.1)',
          },
        ]}
      />

      {/* SVG Multi-Layered Symmetrical Spectrum Waveform */}
      <View style={styles.barsContainer}>
        {animatedValues.map((anim, i) => {
          // Color transition: Cyan (left) -> Indigo -> Magenta/Purple (right) matching reference design
          const ratio = i / barCount;
          const barColor =
            ratio < 0.5
              ? `rgb(${Math.round(6 + ratio * 150)}, ${Math.round(182 - ratio * 100)}, ${Math.round(212 + ratio * 40)})`
              : `rgb(${Math.round(81 + (ratio - 0.5) * 174)}, ${Math.round(132 - (ratio - 0.5) * 60)}, ${Math.round(232 + (ratio - 0.5) * 23)})`;

          return (
            <Animated.View
              key={i}
              style={[
                styles.bar,
                {
                  width: barWidth,
                  backgroundColor: barColor,
                  height: anim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [6, height * 0.85],
                  }),
                  borderRadius: barWidth / 2,
                },
              ]}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  glow: {
    position: 'absolute',
    width: '90%',
    height: '70%',
    borderRadius: 60,
    opacity: 0.3,
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    height: '100%',
  },
  bar: {
    minHeight: 4,
    shadowColor: '#06B6D4',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 4,
  },
});
