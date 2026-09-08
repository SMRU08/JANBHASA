import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, AccessibilityRole } from 'react-native';
import { Colors } from '../../theme/colors';
import { Spacing } from '../../theme/spacing';

interface RecordButtonProps {
  isRecording: boolean;
  onPress: () => void;
  disabled?: boolean;
}

/**
 * TEAL Cognitive Action Zone: Recording
 * Includes icon + text + color state for non-color-only accessibility.
 */
export const RecordButton: React.FC<RecordButtonProps> = ({
  isRecording,
  onPress,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={disabled}
      accessible={true}
      accessibilityRole={"button" as AccessibilityRole}
      accessibilityLabel={isRecording ? 'Stop Recording' : 'Start Recording Voice in Hindi'}
      accessibilityState={{ selected: isRecording, disabled }}
      style={[
        styles.button,
        isRecording ? styles.recordingActive : styles.recordingIdle,
        disabled && styles.disabled,
      ]}
    >
      <View style={styles.iconIndicator}>
        <Text style={styles.symbol}>{isRecording ? '■' : '🎤'}</Text>
      </View>
      <Text style={styles.label}>
        {isRecording ? 'STOP RECORDING (ᱨᱟᱹᱯᱩᱫ)' : 'SPEAK IN HINDI (ᱨᱚᱲ ᱢᱮ)'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: Spacing.touchTarget.massive,
    width: '100%',
    borderRadius: Spacing.borderRadius.lg,
    borderWidth: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
    elevation: 6,
  },
  recordingIdle: {
    backgroundColor: Colors.actionZones.recording.primary, // TEAL
    borderColor: Colors.actionZones.recording.border,
  },
  recordingActive: {
    backgroundColor: Colors.actionZones.danger.primary, // RED (Stop)
    borderColor: Colors.actionZones.danger.border,
  },
  iconIndicator: {
    marginRight: Spacing.md,
  },
  symbol: {
    fontSize: 28,
    color: '#FFFFFF',
  },
  label: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  disabled: {
    opacity: 0.5,
    elevation: 0,
  },
});
