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

export function Button({ title, onPress, variant = 'primary', size = 'md', loading = false, disabled = false, icon, iconPosition = 'left', fullWidth = false, style }: Props) {
  const theme = useTheme();
  const c = theme.colors;

  const bg: Record<Variant, string> = { primary: c.primary, secondary: c.secondary, outline: 'transparent', ghost: 'transparent', danger: c.error };
  const borderColor: Record<Variant, string> = { primary: c.primary, secondary: c.secondary, outline: c.primary, ghost: 'transparent', danger: c.error };
  const textColor: Record<Variant, string> = { primary: '#fff', secondary: '#fff', outline: c.primary, ghost: c.primary, danger: '#fff' };
  const heights: Record<Size, number> = { sm: 36, md: 48, lg: 56 };
  const fontSizes: Record<Size, number> = { sm: 13, md: 15, lg: 17 };
  const px: Record<Size, number> = { sm: 12, md: 20, lg: 28 };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={[
        styles.base,
        { backgroundColor: bg[variant], borderColor: borderColor[variant], height: heights[size], paddingHorizontal: px[size], borderRadius: theme.radius.md, opacity: isDisabled ? 0.55 : 1 },
        fullWidth && { width: '100%' },
        (variant === 'outline') && { borderWidth: 2 },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor[variant]} size="small" />
      ) : (
        <>
          {icon && iconPosition === 'left' && <Ionicons name={icon as any} size={fontSizes[size] + 2} color={textColor[variant]} style={{ marginRight: 6 }} />}
          <Text style={[styles.text, { color: textColor[variant], fontSize: fontSizes[size] }]}>{title}</Text>
          {icon && iconPosition === 'right' && <Ionicons name={icon as any} size={fontSizes[size] + 2} color={textColor[variant]} style={{ marginLeft: 6 }} />}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 0 },
  text: { fontWeight: '700', letterSpacing: 0.2 },
});
