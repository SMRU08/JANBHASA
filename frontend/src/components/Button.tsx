import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface Props {
  title: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  style?: ViewStyle;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
}: Props) {
  const theme = useTheme();
  const c = theme.colors;

  const bg: Record<Variant, string> = {
    primary: c.primary,
    secondary: c.secondary,
    outline: 'transparent',
    ghost: 'transparent',
    danger: c.error,
  };

  const borderColor: Record<Variant, string> = {
    primary: c.primaryDark,
    secondary: c.secondaryDark,
    outline: c.primary,
    ghost: 'transparent',
    danger: c.error,
  };

  const textColor: Record<Variant, string> = {
    primary: '#FFFFFF',
    secondary: '#FFFFFF',
    outline: c.primary,
    ghost: c.primary,
    danger: '#FFFFFF',
  };

  const heights: Record<Size, number> = { sm: 40, md: 52, lg: 60 };
  const fontSizes: Record<Size, number> = { sm: 14, md: 16, lg: 18 };
  const px: Record<Size, number> = { sm: 16, md: 24, lg: 32 };
  const radiuses: Record<Size, number> = { sm: 12, md: 16, lg: 18 };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={[
        styles.base,
        {
          backgroundColor: bg[variant],
          borderColor: borderColor[variant],
          height: heights[size],
          paddingHorizontal: px[size],
          borderRadius: radiuses[size],
          opacity: isDisabled ? 0.6 : 1,
        },
        variant === 'primary' && styles.primaryShadow,
        variant === 'secondary' && styles.secondaryShadow,
        variant === 'outline' && { borderWidth: 2 },
        fullWidth && { width: '100%' },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor[variant]} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon as any}
              size={fontSizes[size] + 3}
              color={textColor[variant]}
              style={{ marginRight: 8 }}
            />
          )}
          <Text style={[styles.text, { color: textColor[variant], fontSize: fontSizes[size] }]}>
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon as any}
              size={fontSizes[size] + 3}
              color={textColor[variant]}
              style={{ marginLeft: 8 }}
            />
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryShadow: {
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  secondaryShadow: {
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  text: {
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
