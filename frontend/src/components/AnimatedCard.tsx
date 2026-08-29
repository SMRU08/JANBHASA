import React, { useRef } from 'react';
import { Animated, TouchableOpacity, ViewStyle, StyleProp } from 'react-native';

interface Props {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
  disabled?: boolean;
  activeOpacity?: number;
}

export function AnimatedCard({
  children,
  onPress,
  style,
  scaleTo = 0.96,
  disabled = false,
  activeOpacity = 0.9,
}: Props) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: scaleTo,
      useNativeDriver: true,
      speed: 24,
      bounciness: 6,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 20,
      bounciness: 8,
    }).start();
  };

  return (
    <TouchableOpacity
      activeOpacity={activeOpacity}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || !onPress}
    >
      <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
}
