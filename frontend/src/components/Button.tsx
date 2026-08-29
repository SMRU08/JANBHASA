import React, { useRef } from 'react';
import {
  Text, StyleSheet, ActivityIndicator, ViewStyle, Animated, TouchableOpacity, View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme';

type Variant = 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost' | 'danger';
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
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const gradientMap: Record<string, [string, string]> = {
    primary: ['#10B981', '#059669'],
    secondary: ['#F59E0B', '#D97706'],
    accent: ['#8B5CF6', '#6D28D9'],
    danger: ['#F43F5E', '#E11D48'],
  };

  const heights: Record<Size, number> = { sm: 42, md: 52, lg: 62 };
  const fontSizes: Record<Size, number> = { sm: 14, md: 16, lg: 18 };
  const px: Record<Size, number> = { sm: 16, md: 24, lg: 32 };
  const radiuses: Record<Size, number> = { sm: 14, md: 16, lg: 20 };

  const isDisabled = disabled || loading;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 24,
      bounciness: 8,
    }).start();
  };

  const isGradient = variant === 'primary' || variant === 'secondary' || variant === 'accent' || variant === 'danger';
  const textColor = isGradient ? '#FFFFFF' : c.primary;

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, fullWidth && { width: '100%' }]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={isDisabled}
        activeOpacity={0.92}
        accessibilityRole="button"
        accessibilityLabel={title}
        style={[
          styles.touchBase,
          fullWidth && { width: '100%' },
          variant === 'outline' && [styles.outlineBase, { borderColor: c.primary, height: heights[size], borderRadius: radiuses[size] }],
          variant === 'ghost' && { height: heights[size], borderRadius: radiuses[size] },
          isDisabled && { opacity: 0.55 },
          style,
        ]}
      >
        {isGradient ? (
          <LinearGradient
            colors={gradientMap[variant]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[
              styles.gradientInner,
              {
                height: heights[size],
                paddingHorizontal: px[size],
                borderRadius: radiuses[size],
              },
              variant === 'primary' && styles.primaryShadow,
              variant === 'secondary' && styles.secondaryShadow,
              variant === 'accent' && styles.accentShadow,
            ]}
          >
            {/* Top Shine Bevel */}
            <View style={styles.topShine} />

            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                {icon && iconPosition === 'left' && (
                  <Ionicons
                    name={icon as any}
                    size={fontSizes[size] + 4}
                    color="#FFFFFF"
                    style={{ marginRight: 8 }}
                  />
                )}
                <Text style={[styles.text, { color: '#FFFFFF', fontSize: fontSizes[size] }]}>
                  {title}
                </Text>
                {icon && iconPosition === 'right' && (
                  <Ionicons
                    name={icon as any}
                    size={fontSizes[size] + 4}
                    color="#FFFFFF"
                    style={{ marginLeft: 8 }}
                  />
                )}
              </>
            )}
          </LinearGradient>
        ) : (
          <View style={[styles.contentRow, { paddingHorizontal: px[size] }]}>
            {loading ? (
              <ActivityIndicator color={textColor} size="small" />
            ) : (
              <>
                {icon && iconPosition === 'left' && (
                  <Ionicons
                    name={icon as any}
                    size={fontSizes[size] + 3}
                    color={textColor}
                    style={{ marginRight: 8 }}
                  />
                )}
                <Text style={[styles.text, { color: textColor, fontSize: fontSizes[size] }]}>
                  {title}
                </Text>
                {icon && iconPosition === 'right' && (
                  <Ionicons
                    name={icon as any}
                    size={fontSizes[size] + 3}
                    color={textColor}
                    style={{ marginLeft: 8 }}
                  />
                )}
              </>
            )}
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  touchBase: {
    borderRadius: 16,
  },
  gradientInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  topShine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1.5,
    backgroundColor: 'rgba(255, 255, 255, 0.45)',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  outlineBase: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryShadow: {
    shadowColor: '#059669',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  secondaryShadow: {
    shadowColor: '#D97706',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  accentShadow: {
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  text: {
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
