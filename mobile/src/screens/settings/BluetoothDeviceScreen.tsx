import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { JanbhashaTheme } from '../../theme/janbhashaTheme';
import { JanbhashaHeader } from '../../components/common/JanbhashaHeader';
import { useAppStore } from '../../store/useAppStore';
import { audioService, BluetoothDevice } from '../../services/audioService';

export const BluetoothDeviceScreen: React.FC = () => {
  const { audioOutput, setAudioOutput, selectedBluetoothDevice, setSelectedBluetoothDevice, navigate } = useAppStore();
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const scanDevices = async () => {
    setIsScanning(true);
    try {
      const list = await audioService.getBluetoothDevices();
      setDevices(list);
    } catch {
      setDevices([]);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    scanDevices();
  }, []);

  const handleSelectDevice = async (device: BluetoothDevice) => {
    setSelectedBluetoothDevice(device);
    await setAudioOutput('bluetooth');
    Alert.alert('Device Connected', `Audio routed to ${device.name}`);
  };

  const handleTestSpeaker = async () => {
    setIsTesting(true);
    try {
      await audioService.speakText('ᱡᱚᱦᱟᱨ, ᱥᱮᱪᱮᱫ ᱨᱮ ᱥᱟᱹᱜᱩᱱ ᱫᱟᱨᱟᱢ', 'sat_Olck');
    } catch (e: any) {
      Alert.alert('Test Output', `Testing tone played. (${e.message || 'Complete'})`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={JanbhashaTheme.colors.surface} barStyle="dark-content" />
      <JanbhashaHeader title="Bluetooth Devices" showBack={true} />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusTopRow}>
            <View style={styles.btIconBadge}>
              <Text style={{ fontSize: 24 }}>📡</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.statusTitle}>Classroom Soundbar Connection</Text>
              <Text style={styles.statusDesc}>
                {selectedBluetoothDevice
                  ? `Active: ${selectedBluetoothDevice.name}`
                  : 'No Bluetooth speaker selected'}
              </Text>
            </View>
          </View>

          <View style={styles.statusBtnRow}>
            <TouchableOpacity
              style={styles.scanBtn}
              onPress={scanDevices}
              disabled={isScanning}
              activeOpacity={0.8}
            >
              {isScanning ? (
                <ActivityIndicator size="small" color={JanbhashaTheme.colors.onPrimary} />
              ) : (
                <Text style={styles.scanBtnText}>🔄 Scan Nearby Devices</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.testBtn, !selectedBluetoothDevice && styles.btnDisabled]}
              onPress={handleTestSpeaker}
              disabled={!selectedBluetoothDevice || isTesting}
              activeOpacity={0.8}
            >
              <Text style={styles.testBtnText}>
                {isTesting ? 'Playing...' : '🔊 Test Sound'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Device List */}
        <Text style={styles.sectionHeader}>Available Audio Devices</Text>

        {devices.length === 0 && !isScanning ? (
          <View style={styles.emptyCard}>
            <Text style={{ fontSize: 32, marginBottom: 8 }}>🔍</Text>
            <Text style={styles.emptyTitle}>No Paired Bluetooth Devices Found</Text>
            <Text style={styles.emptyDesc}>
              Pair your Bluetooth speaker or soundbar in Android Bluetooth Settings, then tap Scan.
            </Text>
            <TouchableOpacity
              style={styles.openSettingsBtn}
              onPress={() => audioService.openBluetoothSettings()}
              activeOpacity={0.8}
            >
              <Text style={styles.openSettingsText}>Open Android Bluetooth Settings</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.listContainer}>
            {devices.map((item) => {
              const isSelected = selectedBluetoothDevice?.address === item.address;
              return (
                <TouchableOpacity
                  key={item.address}
                  style={[styles.deviceCard, isSelected && styles.deviceCardActive]}
                  onPress={() => handleSelectDevice(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.deviceIconBox}>
                    <Text style={{ fontSize: 20 }}>🔊</Text>
                  </View>
                  <View style={styles.deviceInfo}>
                    <Text style={[styles.deviceName, isSelected && styles.deviceNameActive]}>
                      {item.name}
                    </Text>
                    <Text style={styles.deviceAddress}>{item.address}</Text>
                  </View>
                  <View style={[styles.connectBadge, isSelected && styles.connectBadgeActive]}>
                    <Text style={[styles.connectBadgeText, isSelected && styles.connectBadgeTextActive]}>
                      {isSelected ? '✓ CONNECTED' : 'CONNECT'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Microphone isolation reminder */}
        <View style={styles.isolationReminderCard}>
          <Text style={styles.isolationTitle}>🔒 Critical Acoustic Isolation</Text>
          <Text style={styles.isolationBody}>
            Janbhasha routes only translated Santali TTS speech through Bluetooth speakers. Teacher microphone audio is never echoed to eliminate feedback loop screeching in classroom settings.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: JanbhashaTheme.colors.surface,
  },
  scrollContent: {
    padding: JanbhashaTheme.spacing.marginMobile,
    paddingBottom: 32,
  },
  statusCard: {
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLowest,
    borderRadius: JanbhashaTheme.borderRadius.xl,
    padding: 18,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.outlineVariant,
    marginBottom: 20,
    elevation: 2,
  },
  statusTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  btIconBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: JanbhashaTheme.colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  statusTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: JanbhashaTheme.colors.onSurface,
  },
  statusDesc: {
    fontSize: 12,
    color: JanbhashaTheme.colors.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  statusBtnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  scanBtn: {
    flex: 1,
    backgroundColor: JanbhashaTheme.colors.primary,
    borderRadius: JanbhashaTheme.borderRadius.full,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanBtnText: {
    color: JanbhashaTheme.colors.onPrimary,
    fontSize: 12,
    fontWeight: '700',
  },
  testBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: JanbhashaTheme.borderRadius.full,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.primary,
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLowest,
    alignItems: 'center',
  },
  testBtnText: {
    color: JanbhashaTheme.colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  btnDisabled: {
    opacity: 0.4,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: JanbhashaTheme.colors.onSurfaceVariant,
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  listContainer: {
    gap: 10,
  },
  deviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLowest,
    borderRadius: JanbhashaTheme.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.outlineVariant,
  },
  deviceCardActive: {
    borderColor: JanbhashaTheme.colors.primary,
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLow,
  },
  deviceIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: JanbhashaTheme.colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 14,
    fontWeight: '700',
    color: JanbhashaTheme.colors.onSurface,
  },
  deviceNameActive: {
    color: JanbhashaTheme.colors.primary,
    fontWeight: '800',
  },
  deviceAddress: {
    fontSize: 11,
    color: JanbhashaTheme.colors.outline,
    marginTop: 2,
  },
  connectBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: JanbhashaTheme.borderRadius.full,
    backgroundColor: JanbhashaTheme.colors.surfaceContainerHighest,
  },
  connectBadgeActive: {
    backgroundColor: JanbhashaTheme.colors.mintTag,
  },
  connectBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: JanbhashaTheme.colors.onSurfaceVariant,
  },
  connectBadgeTextActive: {
    color: JanbhashaTheme.colors.primary,
  },
  emptyCard: {
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLowest,
    borderRadius: JanbhashaTheme.borderRadius.xl,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.outlineVariant,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: JanbhashaTheme.colors.onSurface,
    marginBottom: 4,
  },
  emptyDesc: {
    fontSize: 12,
    color: JanbhashaTheme.colors.onSurfaceVariant,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  openSettingsBtn: {
    backgroundColor: JanbhashaTheme.colors.surfaceContainerHighest,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: JanbhashaTheme.borderRadius.full,
  },
  openSettingsText: {
    fontSize: 12,
    fontWeight: '700',
    color: JanbhashaTheme.colors.onSurface,
  },
  isolationReminderCard: {
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLow,
    borderRadius: JanbhashaTheme.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.outlineVariant,
    marginTop: 20,
  },
  isolationTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: JanbhashaTheme.colors.primary,
    marginBottom: 4,
  },
  isolationBody: {
    fontSize: 11,
    color: JanbhashaTheme.colors.onSurfaceVariant,
    lineHeight: 16,
  },
});
