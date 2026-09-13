import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { JanbhashaTheme } from '../../theme/janbhashaTheme';
import { useAppStore } from '../../store/useAppStore';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  showBack?: boolean;
  rightAction?: React.ReactNode;
  showBluetoothQuickToggle?: boolean;
}

export const JanbhashaHeader: React.FC<HeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  rightAction,
  showBluetoothQuickToggle = true,
}) => {
  const { goBack, audioOutput, selectedBluetoothDevice, navigate } = useAppStore();

  const isBluetooth = audioOutput === 'bluetooth';
  const isConnected = isBluetooth && !!selectedBluetoothDevice;

  return (
    <View style={styles.container}>
      <View style={styles.left}>
        {showBack ? (
          <TouchableOpacity onPress={goBack} style={styles.backBtn} activeOpacity={0.7}>
            <Text style={styles.backArrow}>‹</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity 
            style={styles.sproutIcon} 
            activeOpacity={0.8}
            onPress={() => navigate('LanguageSelection')}
          >
            <Text style={{ fontSize: 18 }}>🌱</Text>
          </TouchableOpacity>
        )}

        <View style={styles.titleCol}>
          {title ? (
            <Text style={styles.titleText}>{title}</Text>
          ) : (
            <Text style={styles.brandTitle}>
              <Text style={{ color: JanbhashaTheme.colors.primary }}>JAN</Text>
              <Text style={{ color: JanbhashaTheme.colors.secondary }}>BHASHA</Text>
            </Text>
          )}
          {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
        </View>
      </View>

      <View style={styles.right}>
        {rightAction ? (
          rightAction
        ) : showBluetoothQuickToggle ? (
          <TouchableOpacity
            style={[
              styles.quickAudioBadge,
              isConnected && styles.quickAudioBadgeConnected,
            ]}
            activeOpacity={0.7}
            onPress={() => navigate('AudioOutput')}
          >
            <Text style={styles.quickAudioIcon}>{isBluetooth ? '🔊' : '📱'}</Text>
            <Text style={styles.quickAudioText}>
              {isBluetooth ? (isConnected ? 'BT' : 'NO BT') : 'SPKR'}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: JanbhashaTheme.spacing.marginMobile,
    paddingVertical: 12,
    backgroundColor: JanbhashaTheme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: JanbhashaTheme.colors.surfaceContainerHigh,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.outlineVariant,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  backArrow: {
    fontSize: 28,
    color: JanbhashaTheme.colors.onSurface,
    fontWeight: '700',
    marginTop: -4,
  },
  sproutIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: JanbhashaTheme.colors.mintTag,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  titleCol: {
    justifyContent: 'center',
    flex: 1,
  },
  brandTitle: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  titleText: {
    fontSize: 18,
    fontWeight: '700',
    color: JanbhashaTheme.colors.onSurface,
  },
  subtitleText: {
    fontSize: 11,
    color: JanbhashaTheme.colors.onSurfaceVariant,
    fontWeight: '500',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickAudioBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: JanbhashaTheme.borderRadius.full,
    backgroundColor: JanbhashaTheme.colors.surfaceContainerHighest,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.outlineVariant,
  },
  quickAudioBadgeConnected: {
    backgroundColor: JanbhashaTheme.colors.mintTag,
    borderColor: JanbhashaTheme.colors.primary,
  },
  quickAudioIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  quickAudioText: {
    fontSize: 10,
    fontWeight: '800',
    color: JanbhashaTheme.colors.onSurface,
    letterSpacing: 0.5,
  },
});
