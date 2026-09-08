import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Colors } from '../../theme/colors';

interface WaveformVisualizerProps {
  levels: number[]; // Array of 8-16 normalized amplitude values (0.0 to 1.0)
  isActive: boolean;
  color?: string;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  levels,
  isActive,
  color = Colors.actionZones.recording.primary,
}) => {
  return (
    <View style={styles.container}>
      {levels.map((lvl, index) => {
        const height = isActive ? Math.max(12, Math.min(80, lvl * 90)) : 10;
        return (
          <View
            key={index}
            style={[
              styles.bar,
              {
                height,
                backgroundColor: isActive ? color : Colors.background.border,
              },
            ]}
          />
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 90,
    paddingVertical: 10,
  },
  bar: {
    width: 8,
    borderRadius: 4,
    marginHorizontal: 4,
    
  },
});

