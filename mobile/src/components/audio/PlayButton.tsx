import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, AccessibilityRole } from 'react-native';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';

interface PlayButtonProps {
  isPlaying: boolean;
  onPress: () => void;
  label?: string;
  disabled?: boolean;
}

/**
 * AMBER Cognitive Action Zone: Audio Playback
 * Always includes audio icon + descriptive text + visual state.
 */
export const PlayButton: React.FC<PlayButtonProps> = ({
  isPlaying,
  onPress,
  label = 'PLAY SANTHALI AUDIO',
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
      accessible={true}
      accessibilityRole={"button" as AccessibilityRole}
      accessibilityLabel={`${label}. Status: ${isPlaying ? 'Playing' : 'Ready'}`}
      style={[
        styles.button,
        styles.amberZone,
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.iconWrapper}>
        <Text style={styles.icon}>{isPlaying ? '❚❚' : '🔊'}</Text>
      </View>
      <Text style={styles.text}>{isPlaying ? 'PLAYING AUDIO...' : label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: Spacing.touchTarget.comfort,
    borderRadius: Spacing.borderRadius.md,
    borderWidth: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    elevation: 4,
  },
  amberZone: {
    backgroundColor: Colors.actionZones.playback.primary, // AMBER
    borderColor: Colors.actionZones.playback.border,
  },
  iconWrapper: {
    marginRight: Spacing.sm,
  },
  icon: {
    fontSize: 22,
    color: '#FFFFFF',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  disabled: {
    opacity: 0.5,
    elevation: 0,
  },
});
