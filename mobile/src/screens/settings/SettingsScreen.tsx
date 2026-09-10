import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { JanbhashaTheme } from '../../theme/janbhashaTheme';
import { JanbhashaHeader } from '../../components/common/JanbhashaHeader';
import { BottomNavBar } from '../../components/common/BottomNavBar';
import { useAppStore } from '../../store/useAppStore';
import { apiService } from '../../services/apiService';

export const SettingsScreen: React.FC = () => {
  const {
    appLanguage,
    audioOutput,
    selectedBluetoothDevice,
    serverUrl,
    setServerUrl,
    isOfflineMode,
    toggleOfflineMode,
    navigate,
  } = useAppStore();

  const [inputUrl, setInputUrl] = useState<string>(serverUrl);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  const handleTestAndSaveUrl = async () => {
    setIsTesting(true);
    try {
      apiService.setBaseUrl(inputUrl);
      const res = await apiService.checkHealth();
      if (res.isHealthy) {
        setServerUrl(inputUrl);
        Alert.alert('Connection Successful', `Connected to backend at ${inputUrl} (Latency: ${res.latencyMs}ms)`);
      } else {
        Alert.alert('Connection Warning', `Could not reach ${inputUrl}. Please check Wi-Fi/ADB reverse.`);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Connection failed');
    } finally {
      setIsTesting(false);
    }
  };

  const getLanguageLabel = () => {
    if (appLanguage === 'hi') return 'हिन्दी (Hindi)';
    if (appLanguage === 'sat') return 'ᱥᱟᱱᱛᱟᱲᱤ (Santali)';
    return 'English';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={JanbhashaTheme.colors.creamBg} barStyle="dark-content" />
      <JanbhashaHeader showBack title="Settings" subtitle="System & Audio Preferences" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Language Section */}
        <Text style={styles.sectionHeader}>Preferences</Text>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => navigate('LanguageSelection')}
          activeOpacity={0.7}
        >
          <View style={styles.itemLeft}>
            <Text style={styles.itemEmoji}>🌐</Text>
            <View>
              <Text style={styles.itemTitle}>App Language</Text>
              <Text style={styles.itemValue}>{getLanguageLabel()}</Text>
            </View>
          </View>
          <Text style={styles.arrowIcon}>›</Text>
        </TouchableOpacity>

        {/* Audio Output Section */}
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => navigate('AudioOutput')}
          activeOpacity={0.7}
        >
          <View style={styles.itemLeft}>
            <Text style={styles.itemEmoji}>{audioOutput === 'bluetooth' ? '🎧' : '🔊'}</Text>
            <View>
              <Text style={styles.itemTitle}>Audio Output Mode</Text>
              <Text style={styles.itemValue}>
                {audioOutput === 'bluetooth'
                  ? `Mode 2: Bluetooth (${selectedBluetoothDevice?.name || 'Connected'})`
                  : 'Mode 1: Device Speaker (Built-in)'}
              </Text>
            </View>
          </View>
          <Text style={styles.arrowIcon}>›</Text>
        </TouchableOpacity>

        {/* Voice Conversation */}
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => navigate('VoiceConversation')}
          activeOpacity={0.7}
        >
          <View style={styles.itemLeft}>
            <Text style={styles.itemEmoji}>🎙️</Text>
            <View>
              <Text style={styles.itemTitle}>Two-Way Voice Conversation</Text>
              <Text style={styles.itemValue}>Hindi ↔ Santali • Push-to-Talk</Text>
            </View>
          </View>
          <Text style={styles.arrowIcon}>›</Text>
        </TouchableOpacity>

        {/* Offline Dictionary */}
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => navigate('OfflineDictionary')}
          activeOpacity={0.7}
        >
          <View style={styles.itemLeft}>
            <Text style={styles.itemEmoji}>📖</Text>
            <View>
              <Text style={styles.itemTitle}>Offline Santali Dictionary</Text>
              <Text style={styles.itemValue}>Education • Health • Agri • Governance</Text>
            </View>
          </View>
          <Text style={styles.arrowIcon}>›</Text>
        </TouchableOpacity>

        {/* 2 GB RAM & Model Manager */}
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => navigate('OfflineModelManager')}
          activeOpacity={0.7}
        >
          <View style={styles.itemLeft}>
            <Text style={styles.itemEmoji}>🧠</Text>
            <View>
              <Text style={styles.itemTitle}>2 GB RAM & Model Manager</Text>
              <Text style={styles.itemValue}>Kernel RAM Tracking • Model Registry</Text>
            </View>
          </View>
          <Text style={styles.arrowIcon}>›</Text>
        </TouchableOpacity>

        {/* Offline Data & Storage Management */}
        <Text style={styles.sectionHeader}>Offline Storage & Cache</Text>
        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => {
            Alert.alert(
              'Clear Translation History',
              'Are you sure you want to delete all saved translation history?',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Clear',
                  style: 'destructive',
                  onPress: async () => {
                    const { offlineDatabase } = require('../../core/database/OfflineDatabase');
                    await offlineDatabase.clearHistory();
                    Alert.alert('Success', 'Translation history cleared.');
                  },
                },
              ]
            );
          }}
          activeOpacity={0.7}
        >
          <View style={styles.itemLeft}>
            <Text style={styles.itemEmoji}>🗑️</Text>
            <View>
              <Text style={styles.itemTitle}>Clear Translation History</Text>
              <Text style={styles.itemValue}>Delete all local phrase records</Text>
            </View>
          </View>
          <Text style={styles.arrowIcon}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.settingItem}
          onPress={() => {
            Alert.alert('Clear Cache', 'Clear temporary offline audio and session cache?', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Clear',
                style: 'destructive',
                onPress: async () => {
                  const { offlineDatabase } = require('../../core/database/OfflineDatabase');
                  await offlineDatabase.clearCache();
                  Alert.alert('Success', 'Temporary cache cleared.');
                },
              },
            ]);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.itemLeft}>
            <Text style={styles.itemEmoji}>🧹</Text>
            <View>
              <Text style={styles.itemTitle}>Clear Cache</Text>
              <Text style={styles.itemValue}>Free temporary storage buffers</Text>
            </View>
          </View>
          <Text style={styles.arrowIcon}>›</Text>
        </TouchableOpacity>

        {/* Server IP Configuration */}
        <Text style={styles.sectionHeader}>AI Backend Server Configuration</Text>
        <View style={styles.serverCard}>
          <Text style={styles.serverCardTitle}>Host Address (USB Reverse / Wi-Fi IP)</Text>
          <TextInput
            style={styles.urlInput}
            value={inputUrl}
            onChangeText={setInputUrl}
            placeholder="http://localhost:8000"
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.testBtn}
            onPress={handleTestAndSaveUrl}
            disabled={isTesting}
            activeOpacity={0.8}
          >
            <Text style={styles.testBtnText}>
              {isTesting ? 'Testing Ping...' : '✓ Test & Save Server URL'}
            </Text>
          </TouchableOpacity>
          <Text style={styles.serverHelp}>
            • Over USB: Use http://localhost:8000 (with adb reverse tcp:8000 tcp:8000)
            {'\n'}• Over Wi-Fi: Use http://10.196.55.216:8000
          </Text>
        </View>

        {/* About App */}
        <Text style={styles.sectionHeader}>About</Text>
        <View style={styles.aboutCard}>
          <Text style={styles.aboutBrand}>
            <Text style={{ color: JanbhashaTheme.colors.deepGreen }}>JAN</Text>
            <Text style={{ color: JanbhashaTheme.colors.warmOrange }}>BHASHA</Text>
          </Text>
          <Text style={styles.aboutVersion}>Version 1.0.0 (Release Build)</Text>
          <Text style={styles.aboutTeam}>
            Smart India Hackathon 2026 • PS: SIH26042 • Team XERSES
          </Text>
          <Text style={styles.aboutTagline}>
            AI-Powered Vernacular Pedagogy and Real-Time Translation Tool for Mother-Tongue Primary Education
          </Text>
        </View>
      </ScrollView>

      <BottomNavBar />
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
    paddingBottom: 32,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '800',
    color: JanbhashaTheme.colors.mutedText,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 14,
    marginBottom: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: JanbhashaTheme.colors.white,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.cardBorder,
    padding: 16,
    marginBottom: 10,
    elevation: 2,
    shadowColor: JanbhashaTheme.colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  itemEmoji: {
    fontSize: 24,
    marginRight: 14,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: JanbhashaTheme.colors.charcoalText,
    marginBottom: 2,
  },
  itemValue: {
    fontSize: 12,
    color: JanbhashaTheme.colors.deepGreen,
    fontWeight: '600',
  },
  arrowIcon: {
    fontSize: 24,
    color: JanbhashaTheme.colors.lightText,
    fontWeight: '300',
  },
  serverCard: {
    backgroundColor: JanbhashaTheme.colors.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.cardBorder,
    padding: 18,
    marginBottom: 16,
    elevation: 2,
  },
  serverCardTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: JanbhashaTheme.colors.charcoalText,
    marginBottom: 8,
  },
  urlInput: {
    backgroundColor: JanbhashaTheme.colors.creamBgLight,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: JanbhashaTheme.colors.charcoalText,
    marginBottom: 12,
  },
  testBtn: {
    backgroundColor: JanbhashaTheme.colors.deepGreen,
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  testBtnText: {
    color: JanbhashaTheme.colors.white,
    fontSize: 13,
    fontWeight: '700',
  },
  serverHelp: {
    fontSize: 11,
    color: JanbhashaTheme.colors.mutedText,
    lineHeight: 16,
  },
  aboutCard: {
    backgroundColor: JanbhashaTheme.colors.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.cardBorder,
    padding: 20,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
  },
  aboutBrand: {
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 4,
  },
  aboutVersion: {
    fontSize: 13,
    fontWeight: '700',
    color: JanbhashaTheme.colors.deepGreen,
    marginBottom: 4,
  },
  aboutTeam: {
    fontSize: 12,
    color: JanbhashaTheme.colors.mutedText,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
  },
  aboutTagline: {
    fontSize: 11,
    color: JanbhashaTheme.colors.lightText,
    textAlign: 'center',
    lineHeight: 16,
  },
});
