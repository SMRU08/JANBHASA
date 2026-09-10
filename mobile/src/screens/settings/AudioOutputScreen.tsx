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
import { apiService } from '../../services/apiService';

export const AudioOutputScreen: React.FC = () => {
  const { audioOutput, setAudioOutput, selectedBluetoothDevice, setSelectedBluetoothDevice } = useAppStore();
  const [devices, setDevices] = useState<BluetoothDevice[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [isTestingAudio, setIsTestingAudio] = useState<boolean>(false);

  const refreshBluetoothList = async () => {
    setIsScanning(true);
    try {
      const devs = await audioService.getBluetoothDevices();
      setDevices(devs);
    } catch {
      setDevices([]);
    } finally {
      setIsScanning(false);
    }
  };

  useEffect(() => {
    refreshBluetoothList();
  }, []);

  const handleSelectSpeaker = async () => {
    await setAudioOutput('speaker');
    setSelectedBluetoothDevice(null);
  };

  const handleSelectBluetoothMode = async () => {
    await setAudioOutput('bluetooth');
    if (devices.length > 0 && !selectedBluetoothDevice) {
      setSelectedBluetoothDevice(devices[0]);
    }
  };

  const handleSelectBluetoothDevice = async (dev: BluetoothDevice) => {
    setSelectedBluetoothDevice(dev);
    await setAudioOutput('bluetooth');
  };

  const handleOpenBluetoothSettings = async () => {
    const opened = await audioService.openBluetoothSettings();
    if (!opened) {
      Alert.alert(
        'Bluetooth Settings',
        'Please open Android Settings > Bluetooth manually to pair your external speaker.'
      );
    }
  };

  const handleTestAudioPlayback = async () => {
    setIsTestingAudio(true);
    try {
      const res = await apiService.synthesizeSpeech('ᱡᱚᱦᱟᱨ', 0);
      if (res.audio_base64) {
        await audioService.playAudio(res.audio_base64);
      } else {
        await audioService.speakText('ᱡᱚᱦᱟᱨ', 'sat_Olck');
      }
    } catch (err: any) {
      try {
        await audioService.speakText('ᱡᱚᱦᱟᱨ', 'sat_Olck');
      } catch (innerErr: any) {
        Alert.alert('Playback Test', `Could not play audio: ${innerErr.message || 'Error'}`);
      }
    } finally {
      setIsTestingAudio(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={JanbhashaTheme.colors.creamBg} barStyle="dark-content" />
      <JanbhashaHeader showBack title="Audio Output" subtitle="2 Audio Modes: Speaker & Bluetooth" />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Mode Overview Banner */}
        <View style={styles.bannerCard}>
          <Text style={styles.bannerEmoji}>🎧 🔊</Text>
          <View style={styles.bannerTextCol}>
            <Text style={styles.bannerTitle}>Select Active Audio Output</Text>
            <Text style={styles.bannerSub}>
              Switch between your phone's built-in loudspeaker and external Bluetooth speakers in real-time.
            </Text>
          </View>
        </View>

        {/* MODE 1: DEVICE SPEAKER */}
        <View style={styles.modeSectionHeader}>
          <View style={styles.modeBadge}>
            <Text style={styles.modeBadgeText}>MODE 1</Text>
          </View>
          <Text style={styles.sectionTitle}>DEVICE SPEAKER (BUILT-IN)</Text>
        </View>

        <TouchableOpacity
          style={[styles.card, audioOutput === 'speaker' && styles.cardSelected]}
          onPress={handleSelectSpeaker}
          activeOpacity={0.8}
        >
          <View style={styles.leftRow}>
            <View style={[styles.iconCircle, audioOutput === 'speaker' && styles.iconCircleActive]}>
              <Text style={styles.emoji}>🔊</Text>
            </View>
            <View style={styles.cardDetailsCol}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle}>Mobile Device Speaker</Text>
                {audioOutput === 'speaker' && (
                  <View style={styles.activePill}>
                    <Text style={styles.activePillText}>ACTIVE</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardSub}>
                Built-in phone loudspeaker. Direct sound for individual or small-group listening.
              </Text>
            </View>
          </View>
          <View style={[styles.radioOuter, audioOutput === 'speaker' && styles.radioSelected]}>
            {audioOutput === 'speaker' && <View style={styles.radioInner} />}
          </View>
        </TouchableOpacity>

        {/* MODE 2: CONNECT WITH BLUETOOTH */}
        <View style={[styles.modeSectionHeader, { marginTop: 24 }]}>
          <View style={[styles.modeBadge, { backgroundColor: '#DBEAFE' }]}>
            <Text style={[styles.modeBadgeText, { color: '#1E40AF' }]}>MODE 2</Text>
          </View>
          <Text style={styles.sectionTitle}>CONNECT WITH BLUETOOTH</Text>
        </View>

        <TouchableOpacity
          style={[styles.card, audioOutput === 'bluetooth' && styles.cardSelectedBt]}
          onPress={handleSelectBluetoothMode}
          activeOpacity={0.8}
        >
          <View style={styles.leftRow}>
            <View style={[styles.iconCircle, { backgroundColor: '#E0E7FF' }, audioOutput === 'bluetooth' && styles.iconCircleActiveBt]}>
              <Text style={styles.emoji}>🎧</Text>
            </View>
            <View style={styles.cardDetailsCol}>
              <View style={styles.cardTitleRow}>
                <Text style={styles.cardTitle}>Bluetooth Audio Mode</Text>
                {audioOutput === 'bluetooth' && (
                  <View style={[styles.activePill, { backgroundColor: '#DBEAFE' }]}>
                    <Text style={[styles.activePillText, { color: '#1D4ED8' }]}>ACTIVE</Text>
                  </View>
                )}
              </View>
              <Text style={styles.cardSub}>
                Route to classroom Bluetooth speakers, soundbars, or wireless teacher lapel headsets.
              </Text>
            </View>
          </View>
          <View style={[styles.radioOuter, audioOutput === 'bluetooth' && styles.radioSelectedBt]}>
            {audioOutput === 'bluetooth' && <View style={[styles.radioInner, { backgroundColor: '#2563EB' }]} />}
          </View>
        </TouchableOpacity>

        {/* Bluetooth Actions & Device List */}
        <View style={styles.btControlsRow}>
          <TouchableOpacity
            style={styles.openSettingsBtn}
            onPress={handleOpenBluetoothSettings}
            activeOpacity={0.7}
          >
            <Text style={styles.openSettingsBtnText}>⚙️ Open Bluetooth Settings</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={refreshBluetoothList}
            disabled={isScanning}
            activeOpacity={0.7}
          >
            {isScanning ? (
              <ActivityIndicator size="small" color={JanbhashaTheme.colors.deepGreen} />
            ) : (
              <Text style={styles.refreshBtnText}>🔄 Refresh</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Paired Device List */}
        {devices.length > 0 ? (
          <View style={styles.pairedContainer}>
            <Text style={styles.pairedLabel}>Select Paired Bluetooth Device:</Text>
            {devices.map((dev, dIdx) => {
              const isThisSelected =
                audioOutput === 'bluetooth' && selectedBluetoothDevice?.address === dev.address;
              return (
                <TouchableOpacity
                  key={dIdx}
                  style={[styles.deviceItemCard, isThisSelected && styles.deviceItemCardActive]}
                  onPress={() => handleSelectBluetoothDevice(dev)}
                  activeOpacity={0.8}
                >
                  <View style={styles.deviceItemLeft}>
                    <Text style={styles.deviceEmoji}>{isThisSelected ? '🔊' : '📡'}</Text>
                    <View>
                      <Text style={styles.deviceName}>{dev.name || 'Bluetooth Speaker'}</Text>
                      <Text style={styles.deviceAddress}>{dev.address} • Paired</Text>
                    </View>
                  </View>
                  <View style={[styles.deviceConnectPill, isThisSelected && styles.deviceConnectPillActive]}>
                    <Text style={[styles.deviceConnectText, isThisSelected && styles.deviceConnectTextActive]}>
                      {isThisSelected ? 'Connected' : 'Select'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.noDeviceCard}>
            <Text style={styles.noDeviceEmoji}>📡</Text>
            <Text style={styles.noDeviceTitle}>No Paired Bluetooth Devices Detected</Text>
            <Text style={styles.noDeviceSub}>
              Tap "Open Bluetooth Settings" above to pair your classroom speaker (e.g. JBL, boAt, Zebronics, Portronics), then tap Refresh.
            </Text>
          </View>
        )}

        {/* Test Audio Button */}
        <View style={styles.testSection}>
          <TouchableOpacity
            style={styles.testButton}
            onPress={handleTestAudioPlayback}
            disabled={isTestingAudio}
            activeOpacity={0.8}
          >
            {isTestingAudio ? (
              <ActivityIndicator size="small" color={JanbhashaTheme.colors.white} />
            ) : (
              <Text style={styles.testButtonText}>
                🔔 Test Audio Output ({audioOutput === 'bluetooth' ? 'Bluetooth' : 'Speaker'})
              </Text>
            )}
          </TouchableOpacity>
          <Text style={styles.testHint}>
            Plays a short Santali greeting "ᱡᱚᱦᱟᱨ" to verify output routing.
          </Text>
        </View>

        {/* Strict Pedagogical Audio Routing Rule */}
        <View style={styles.ruleCard}>
          <View style={styles.ruleHeader}>
            <Text style={styles.ruleEmoji}>🛡️</Text>
            <Text style={styles.ruleTitle}>Microphone Isolation Guarantee</Text>
          </View>
          <Text style={styles.ruleText}>
            Only translated Santali synthesized audio is played through your selected output. The original Hindi microphone input is strictly discarded and never looped to avoid feedback in the classroom.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: JanbhashaTheme.colors.creamBg,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  bannerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: JanbhashaTheme.colors.white,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.cardBorder,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: JanbhashaTheme.colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  bannerEmoji: {
    fontSize: 28,
    marginRight: 14,
  },
  bannerTextCol: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: JanbhashaTheme.colors.charcoalText,
    marginBottom: 2,
  },
  bannerSub: {
    fontSize: 12,
    color: JanbhashaTheme.colors.mutedText,
    lineHeight: 17,
  },
  modeSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  modeBadge: {
    backgroundColor: JanbhashaTheme.colors.mintTag,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 8,
  },
  modeBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: JanbhashaTheme.colors.deepGreen,
    letterSpacing: 0.5,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: JanbhashaTheme.colors.charcoalText,
    letterSpacing: 0.5,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: JanbhashaTheme.colors.white,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.cardBorder,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: JanbhashaTheme.colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  cardSelected: {
    borderColor: JanbhashaTheme.colors.deepGreen,
    backgroundColor: '#F3FAF6',
  },
  cardSelectedBt: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  leftRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: JanbhashaTheme.colors.mintTag,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  iconCircleActive: {
    backgroundColor: '#D1FAE5',
  },
  iconCircleActiveBt: {
    backgroundColor: '#DBEAFE',
  },
  emoji: {
    fontSize: 22,
  },
  cardDetailsCol: {
    flex: 1,
    paddingRight: 10,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: JanbhashaTheme.colors.charcoalText,
    marginRight: 8,
  },
  cardSub: {
    fontSize: 12,
    color: JanbhashaTheme.colors.mutedText,
    lineHeight: 16,
  },
  activePill: {
    backgroundColor: JanbhashaTheme.colors.mintTag,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activePillText: {
    fontSize: 9,
    fontWeight: '800',
    color: JanbhashaTheme.colors.deepGreen,
    letterSpacing: 0.5,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: JanbhashaTheme.colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: JanbhashaTheme.colors.deepGreen,
  },
  radioSelectedBt: {
    borderColor: '#2563EB',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: JanbhashaTheme.colors.deepGreen,
  },
  btControlsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
    marginBottom: 14,
  },
  openSettingsBtn: {
    flex: 1,
    backgroundColor: JanbhashaTheme.colors.white,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: JanbhashaTheme.colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  openSettingsBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: JanbhashaTheme.colors.charcoalText,
  },
  refreshBtn: {
    backgroundColor: JanbhashaTheme.colors.white,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1.2,
    borderColor: JanbhashaTheme.colors.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  refreshBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: JanbhashaTheme.colors.deepGreen,
  },
  pairedContainer: {
    backgroundColor: JanbhashaTheme.colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.cardBorder,
    padding: 14,
    marginBottom: 16,
  },
  pairedLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: JanbhashaTheme.colors.mutedText,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  deviceItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: JanbhashaTheme.colors.creamBgLight,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.cardBorder,
    marginBottom: 8,
  },
  deviceItemCardActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  deviceItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  deviceEmoji: {
    fontSize: 18,
    marginRight: 10,
  },
  deviceName: {
    fontSize: 13,
    fontWeight: '700',
    color: JanbhashaTheme.colors.charcoalText,
  },
  deviceAddress: {
    fontSize: 11,
    color: JanbhashaTheme.colors.mutedText,
    marginTop: 1,
  },
  deviceConnectPill: {
    backgroundColor: JanbhashaTheme.colors.white,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.cardBorder,
  },
  deviceConnectPillActive: {
    backgroundColor: '#2563EB',
    borderColor: '#2563EB',
  },
  deviceConnectText: {
    fontSize: 11,
    fontWeight: '700',
    color: JanbhashaTheme.colors.charcoalText,
  },
  deviceConnectTextActive: {
    color: JanbhashaTheme.colors.white,
  },
  noDeviceCard: {
    backgroundColor: JanbhashaTheme.colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.cardBorder,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  noDeviceEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  noDeviceTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: JanbhashaTheme.colors.charcoalText,
    marginBottom: 4,
  },
  noDeviceSub: {
    fontSize: 12,
    color: JanbhashaTheme.colors.mutedText,
    textAlign: 'center',
    lineHeight: 16,
  },
  testSection: {
    marginVertical: 14,
    alignItems: 'center',
  },
  testButton: {
    width: '100%',
    backgroundColor: JanbhashaTheme.colors.deepGreen,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: JanbhashaTheme.colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  testButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: JanbhashaTheme.colors.white,
  },
  testHint: {
    fontSize: 11,
    color: JanbhashaTheme.colors.mutedText,
    marginTop: 6,
  },
  ruleCard: {
    marginTop: 10,
    backgroundColor: '#FFFBEB',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 16,
  },
  ruleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ruleEmoji: {
    fontSize: 16,
    marginRight: 6,
  },
  ruleTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  ruleText: {
    fontSize: 12,
    color: '#78350F',
    lineHeight: 17,
  },
});
