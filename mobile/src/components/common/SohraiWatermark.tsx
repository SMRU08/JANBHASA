import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';
import { Colors } from '../../theme/colors';

/**
 * Cultural Watermark: Santhal/Sohrai Art Motif (Sacred Peacock & Geometric Flora).
 * Rendered at 5-8% opacity as a low-cost background vector.
 */
export const SohraiWatermark: React.FC = () => {
  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 400 600" opacity={0.06}>
        <G stroke={Colors.cultural.sohraiCharcoal} strokeWidth="3" fill="none">
          {/* Sohrai Stylized Peacock & Floral Border */}
          <Path d="M 50 100 Q 150 20 200 120 T 350 100" />
          <Path d="M 50 120 Q 150 40 200 140 T 350 120" />
          <Circle cx="200" cy="180" r="30" fill={Colors.cultural.terracotta} />
          
          {/* Geometric Fish Motif (Symbol of Abundance in Sohrai) */}
          <Path d="M 120 300 C 160 260, 240 260, 280 300 C 240 340, 160 340, 120 300 Z" />
          <Path d="M 280 300 L 320 270 L 320 330 Z" />
          <Circle cx="160" cy="295" r="4" fill={Colors.cultural.sohraiCharcoal} />

          {/* Traditional Chevron Wall Border at Bottom */}
          <Path d="M 0 560 L 40 520 L 80 560 L 120 520 L 160 560 L 200 520 L 240 560 L 280 520 L 320 560 L 360 520 L 400 560" />
          <Path d="M 0 580 L 40 540 L 80 580 L 120 540 L 160 580 L 200 540 L 240 580 L 280 540 L 320 580 L 360 540 L 400 580" />
        </G>
      </Svg>
    </View>
  );
};
