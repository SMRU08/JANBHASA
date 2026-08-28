import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../theme';

interface Props {
  progress: number;
  size?: number;
  color?: string;
  strokeWidth?: number;
  label?: string;
}

export function ProgressCircle({ progress, size = 80, color, strokeWidth = 8, label }: Props) {
  const theme = useTheme();
  const clr = color || theme.colors.primary;
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const clampedProgress = Math.min(1, Math.max(0, progress));
  const filled = circumference * (1 - clampedProgress);
  const pct = Math.round(clampedProgress * 100);

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={theme.colors.border} strokeWidth={strokeWidth} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={clr}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={filled}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFillObject, { alignItems: 'center', justifyContent: 'center' }]}>
        <Text style={{ fontSize: size * 0.2, fontWeight: '700', color: theme.colors.text }}>{pct}%</Text>
        {label && <Text style={{ fontSize: size * 0.13, color: theme.colors.textMuted }}>{label}</Text>}
      </View>
    </View>
  );
}
