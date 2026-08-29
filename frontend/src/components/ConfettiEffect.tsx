import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

const CONFETTI_COLORS = ['#F59E0B', '#10B981', '#7C3AED', '#EF4444', '#0284C7', '#EC4899'];

interface Props {
  active: boolean;
  count?: number;
}

export function ConfettiEffect({ active, count = 24 }: Props) {
  const animations = useRef(
    Array.from({ length: count }, () => ({
      x: new Animated.Value(0),
      y: new Animated.Value(0),
      rotate: new Animated.Value(0),
      opacity: new Animated.Value(1),
    }))
  ).current;

  useEffect(() => {
    if (active) {
      const anims = animations.map((anim) => {
        const destX = (Math.random() - 0.5) * 320;
        const destY = -(80 + Math.random() * 220);
        const rotateVal = (Math.random() - 0.5) * 720;

        anim.x.setValue(0);
        anim.y.setValue(0);
        anim.rotate.setValue(0);
        anim.opacity.setValue(1);

        return Animated.parallel([
          Animated.timing(anim.x, {
            toValue: destX,
            duration: 1200 + Math.random() * 600,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(anim.y, {
              toValue: destY,
              duration: 700,
              useNativeDriver: true,
            }),
            Animated.timing(anim.y, {
              toValue: destY + 300,
              duration: 1100,
              useNativeDriver: true,
            }),
          ]),
          Animated.timing(anim.rotate, {
            toValue: rotateVal,
            duration: 1600,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.delay(1000),
            Animated.timing(anim.opacity, {
              toValue: 0,
              duration: 600,
              useNativeDriver: true,
            }),
          ]),
        ]);
      });

      Animated.stagger(25, anims).start();
    }
  }, [active]);

  if (!active) return null;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFillObject}>
      <View style={styles.centerContainer}>
        {animations.map((anim, i) => {
          const color = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
          const isCircle = i % 3 === 0;
          const spin = anim.rotate.interpolate({
            inputRange: [-360, 360],
            outputRange: ['-360deg', '360deg'],
          });

          return (
            <Animated.View
              key={i}
              style={[
                styles.particle,
                {
                  backgroundColor: color,
                  borderRadius: isCircle ? 6 : 2,
                  width: isCircle ? 10 : 8,
                  height: isCircle ? 10 : 14,
                  opacity: anim.opacity,
                  transform: [
                    { translateX: anim.x },
                    { translateY: anim.y },
                    { rotate: spin },
                  ],
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
  centerContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  particle: {
    position: 'absolute',
  },
});
