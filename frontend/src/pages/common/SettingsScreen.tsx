import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { LanguageSelector } from '../../components/LanguageSelector';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme';
import { useSettingsStore, DarkMode, PerformanceMode } from '../../store/settingsStore';
import { useLanguageStore } from '../../store/languageStore';
import { useAuthStore } from '../../store/authStore';
import { SUPPORTED_LANGUAGES } from '../../locales/i18n';
import { updateLanguage } from '../../services/authService';

export function SettingsScreen() {
  const theme = useTheme();
  const c = theme.colors;
  const {
    darkMode,
    voiceEnabled,
    soundEffects,
    animationsEnabled,
    performanceMode,
    backendUrl,
    setDarkMode,
    setVoiceEnabled,
    setSoundEffects,
    setAnimationsEnabled,
    setPerformanceMode,
    setBackendUrl
  } = useSettingsStore();

  const { selectedLanguage, setSelectedLanguage } = useLanguageStore();
  const { user, logout } = useAuthStore();
  const [urlInput, setUrlInput] = useState(backendUrl);

  const handleLanguageChange = async (code: string) => {
    await setSelectedLanguage(code);
    if (user?.id) {
      await updateLanguage(user.id, code);
    }
  };

  const handleSaveUrl = () => {
    setBackendUrl(urlInput.trim());
    Alert.alert('Saved', 'Backend server URL updated.');
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="Settings ⚙️" subtitle="ऐप सेटिंग्स" showBack={false} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 50 }}>
        {/* Language Selection */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>🌐 App Language / मातृभाषा</Text>
          <LanguageSelector
            languages={SUPPORTED_LANGUAGES}
            selected={selectedLanguage}
            onSelect={handleLanguageChange}
            columns={2}
          />
        </Card>

        {/* Appearance */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>🎨 Appearance</Text>
          <View style={styles.settingRow}>
            <Text style={{ color: c.text, fontSize: 15, fontWeight: '600' }}>Dark Mode</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {(['light', 'dark', 'system'] as DarkMode[]).map((m) => (
                <TouchableOpacity
                  key={m}
                  onPress={() => setDarkMode(m)}
                  style={[
                    styles.modeChip,
                    {
                      backgroundColor: darkMode === m ? c.primary : c.background,
                      borderColor: darkMode === m ? c.primary : c.border
                    }
                  ]}
                >
                  <Text
                    style={{
                      color: darkMode === m ? '#fff' : c.textSecondary,
                      fontWeight: '700',
                      fontSize: 12,
                      textTransform: 'capitalize'
                    }}
                  >
                    {m}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Card>

        {/* Audio & Performance */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>⚡ Preferences</Text>

          <View style={styles.switchRow}>
            <Text style={{ color: c.text, fontSize: 15 }}>🔊 Voice / Speech Synthesis</Text>
            <Switch value={voiceEnabled} onValueChange={setVoiceEnabled} />
          </View>

          <View style={styles.switchRow}>
            <Text style={{ color: c.text, fontSize: 15 }}>🎵 Sound Effects</Text>
            <Switch value={soundEffects} onValueChange={setSoundEffects} />
          </View>

          <View style={styles.switchRow}>
            <Text style={{ color: c.text, fontSize: 15 }}>✨ Animations</Text>
            <Switch value={animationsEnabled} onValueChange={setAnimationsEnabled} />
          </View>

          <View style={[styles.settingRow, { marginTop: 8 }]}>
            <Text style={{ color: c.text, fontSize: 15, fontWeight: '600' }}>Performance Mode</Text>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {(['standard', 'battery_saver', 'low_ram'] as PerformanceMode[]).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setPerformanceMode(mode)}
                  style={[
                    styles.modeChip,
                    {
                      backgroundColor: performanceMode === mode ? c.secondary : c.background,
                      borderColor: performanceMode === mode ? c.secondary : c.border
                    }
                  ]}
                >
                  <Text
                    style={{
                      color: performanceMode === mode ? '#fff' : c.textSecondary,
                      fontWeight: '700',
                      fontSize: 11
                    }}
                  >
                    {mode === 'standard' ? 'Standard' : mode === 'battery_saver' ? 'Battery' : 'Low RAM'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Card>

        {/* Backend Configuration */}
        <Card style={{ marginBottom: 16 }}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>🔌 Server & Local Network</Text>
          <Text style={{ color: c.textMuted, fontSize: 12, marginBottom: 8 }}>
            Set backend URL to connect to local server or hotspot hub.
          </Text>
          <TextInput
            style={[styles.input, { backgroundColor: c.background, borderColor: c.border, color: c.text }]}
            value={urlInput}
            onChangeText={setUrlInput}
            placeholder="http://192.168.43.1:8000"
            placeholderTextColor={c.textMuted}
            autoCapitalize="none"
          />
          <Button title="Save Server URL" onPress={handleSaveUrl} size="sm" style={{ marginTop: 10 }} />
        </Card>

        {/* About Card */}
        <Card style={{ marginBottom: 20 }}>
          <Text style={[styles.sectionTitle, { color: c.text }]}>ℹ️ About JANBHASHA</Text>
          <Text style={{ color: c.text, fontWeight: '700', fontSize: 14 }}>JANBHASHA v1.0.0 (Offline-First Edition)</Text>
          <Text style={{ color: c.textSecondary, fontSize: 13, marginTop: 4 }}>
            "Teach in Hindi. Learn in Your Mother Tongue."
          </Text>
          <Text style={{ color: c.textMuted, fontSize: 12, marginTop: 8 }}>
            Developed by Team Xerses • For Rural & Tribal India 🇮🇳
          </Text>
        </Card>

        {/* Logout Button */}
        <Button
          title="🚪 Sign Out"
          onPress={logout}
          variant="danger"
          fullWidth
          size="lg"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 12 },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee'
  },
  modeChip: {
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  input: {
    borderRadius: 10,
    borderWidth: 1.5,
    padding: 12,
    fontSize: 14
  }
});
