import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { JanbhashaTheme } from '../../theme/janbhashaTheme';
import { useAppStore } from '../../store/useAppStore';

interface BluetoothStatusBarProps {
  compact?: boolean;
}

export const BluetoothStatusBar: React.FC<BluetoothStatusBarProps> = ({ compact = false }) => {
  const { audioOutput, selectedBluetoothDevice, navigate } = useAppStore();

  const isBluetooth = audioOutput === 'bluetooth';
  const isConnected = isBluetooth && !!selectedBluetoothDevice;

  const getAudioLabel = () => {
    if (!isBluetooth) {
      return 'Mobile Speaker';
    }
    if (isConnected) {
      return selectedBluetoothDevice?.name || 'BT Speaker';
    }
    return 'BT Disconnected';
  };

  const getStatusColor = () => {
    if (!isBluetooth) return JanbhashaTheme.colors.primary;
    if (isConnected) return JanbhashaTheme.colors.primary;
    return JanbhashaTheme.colors.secondary;
  };

  return (
    <View style={[styles.container, compact && styles.containerCompact]}>
      {/* Offline Status Badge */}
      <View style={styles.offlineBadge}>
        <View style={styles.dotOffline} />
        <Text style={styles.offlineText}>100% OFFLINE</Text>
      </View>

      {/* Audio Routing Badge */}
      <TouchableOpacity
        style={[styles.audioBadge, { borderColor: getStatusColor() }]}
        activeOpacity={0.7}
        onPress={() => navigate('AudioOutput')}
      >
        <Text style={styles.audioIcon}>{isBluetooth ? '🔊' : '📱'}</Text>
        <Text style={[styles.audioText, { color: getStatusColor() }]} numberOfLines={1}>
          {getAudioLabel()}
        </Text>
        <Text style={styles.chevron}>›</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLow,
    borderBottomWidth: 1,
    borderBottomColor: JanbhashaTheme.colors.outlineVariant,
  },
  containerCompact: {
    paddingVertical: 3,
    paddingHorizontal: 12,
  },
  offlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: JanbhashaTheme.colors.surfaceContainerHighest,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: JanbhashaTheme.borderRadius.full,
  },
  dotOffline: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: JanbhashaTheme.colors.primary,
    marginRight: 6,
  },
  offlineText: {
    fontSize: 10,
    fontWeight: '700',
    color: JanbhashaTheme.colors.onSurfaceVariant,
    letterSpacing: 0.5,
  },
  audioBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLowest,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: JanbhashaTheme.borderRadius.full,
    borderWidth: 1,
    maxWidth: 200,
  },
  audioIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  audioText: {
    fontSize: 11,
    fontWeight: '700',
    marginRight: 4,
  },
  chevron: {
    fontSize: 14,
    color: JanbhashaTheme.colors.outline,
    fontWeight: '700',
    marginTop: -2,
  },
});
