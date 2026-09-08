import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ViewStyle, TextStyle } from 'react-native';
import { Colors } from '../../theme/colors';

interface NeumorphicButtonProps {
  onPress: () => void;
  title?: string;
  icon?: React.ReactNode;
  zone?: 'recording' | 'playback' | 'primary' | 'danger';
  size?: 'normal' | 'massive';
  disabled?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  subtitle?: string;
}

export const NeumorphicButton: React.FC<NeumorphicButtonProps> = ({
  onPress,
  title,
  icon,
  zone = 'primary',
  size = 'normal',
  disabled = false,
  style,
  textStyle,
  subtitle,
}) => {
  const getZoneColors = () => {
    switch (zone) {
      case 'recording':
        return Colors.actionZones.recording;
      case 'playback':
        return Colors.actionZones.playback;
      case 'danger':
        return Colors.actionZones.danger;
      default:
        return Colors.actionZones.primaryAction;
    }
  };

  const currentZone = getZoneColors();
  const isMassive = size === 'massive';

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.baseButton,
        isMassive ? styles.massiveButton : styles.normalButton,
        {
          backgroundColor: currentZone.primary,
          borderColor: currentZone.border,
          shadowColor: currentZone.border,
        },
        disabled && styles.disabled,
        style,
      ]}
    >
      <View style={styles.contentRow}>
        {icon && <View style={styles.iconWrapper}>{icon}</View>}
        {title && (
          <View style={styles.textColumn}>
            <Text style={[styles.buttonText, isMassive && styles.massiveText, textStyle]}>
              {title}
            </Text>
            {subtitle && (
              <Text style={styles.subtitleText}>{subtitle}</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  baseButton: {
    borderRadius: 20,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
  },
  normalButton: {
    minHeight: 64, // Touch target guideline: >= 64dp
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  massiveButton: {
    minHeight: 96,
    width: '100%',
    paddingHorizontal: 28,
    paddingVertical: 20,
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    marginRight: 12,
  },
  textColumn: {
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  massiveText: {
    fontSize: 24,
    fontWeight: '900',
  },
  subtitleText: {
    color: '#F4EFE6',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 4,
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.5,
    elevation: 0,
  },
});
