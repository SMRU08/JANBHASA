import React from 'react';
import { View, Text, StyleSheet, ScrollView, Switch, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';
import { useTheme } from '../../theme';
import { useSettingsStore, FontSize, DarkMode, FONT_SCALE } from '../../store/settingsStore';

const FONT_SIZES: { key: FontSize; label: string; emoji: string }[] = [
  { key: 'small',  label: 'Small',      emoji: 'A' },
  { key: 'medium', label: 'Medium',     emoji: 'A' },
  { key: 'large',  label: 'Large',      emoji: 'A' },
  { key: 'xl',     label: 'Extra Large',emoji: 'A' },
];

const DARK_MODES: { key: DarkMode; label: string; emoji: string }[] = [
  { key: 'light',  label: 'Light Mode',  emoji: '☀️' },
  { key: 'dark',   label: 'Dark Mode',   emoji: '🌙' },
  { key: 'system', label: 'Auto (System)', emoji: '⚙️' },
];

export function AccessibilityScreen() {
  const theme = useTheme(); const c = theme.colors;
  const {
    fontSize, setFontSize,
    highContrast, setHighContrast,
    autoPlayAudio, setAutoPlayAudio,
    voiceEnabled, setVoiceEnabled,
    darkMode, setDarkMode,
  } = useSettingsStore();

  const scale = FONT_SCALE[fontSize];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="Accessibility" subtitle="आसानी के लिए सेटिंग्स" />
      <ScrollView contentContainerStyle={{ padding: 20 }}>

        {/* Font Size */}
        <Text style={[styles.sectionTitle, { color: c.text, fontSize: 16 * scale }]}>📝 Font Size</Text>
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={styles.optionRow}>
            {FONT_SIZES.map(f => (
              <TouchableOpacity
                key={f.key}
                onPress={() => setFontSize(f.key)}
                style={[
                  styles.fontChip,
                  { backgroundColor: fontSize === f.key ? c.primary : c.surface, borderColor: fontSize === f.key ? c.primary : c.border }
                ]}
              >
                <Text style={{ color: fontSize === f.key ? '#fff' : c.text, fontSize: FONT_SCALE[f.key] * 14, fontWeight: '700' }}>
                  {f.emoji}
                </Text>
                <Text style={{ color: fontSize === f.key ? '#fff' : c.textMuted, fontSize: 10, marginTop: 2 }}>
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={{ color: c.textMuted, fontSize: 12, marginTop: 8 }}>
            Preview: <Text style={{ color: c.text, fontSize: 14 * scale, fontWeight: '600' }}>अ आ इ ई उ ऊ</Text>
          </Text>
        </View>

        {/* Theme */}
        <Text style={[styles.sectionTitle, { color: c.text, fontSize: 16 * scale, marginTop: 20 }]}>🎨 Theme</Text>
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          {DARK_MODES.map(m => (
            <TouchableOpacity
              key={m.key}
              onPress={() => setDarkMode(m.key)}
              style={[styles.themeRow, { backgroundColor: darkMode === m.key ? (c.primaryLight || '#D1FAE5') : 'transparent' }]}
            >
              <Text style={{ fontSize: 22 }}>{m.emoji}</Text>
              <Text style={{ color: c.text, fontSize: 15 * scale, fontWeight: '600', marginLeft: 12 }}>{m.label}</Text>
              <View style={{ flex: 1 }} />
              {darkMode === m.key && <Text style={{ color: c.primary, fontSize: 18 }}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>

        {/* Toggles */}
        <Text style={[styles.sectionTitle, { color: c.text, fontSize: 16 * scale, marginTop: 20 }]}>⚙️ Audio & Display</Text>
        <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]}>
          {[
            { label: '🔊 Auto-Play Audio Translation', sub: 'Play translated audio automatically', value: autoPlayAudio, set: setAutoPlayAudio },
            { label: '🎤 Voice Features', sub: 'Enable microphone recording', value: voiceEnabled, set: setVoiceEnabled },
            { label: '🔆 High Contrast Mode', sub: 'Increase color contrast for better visibility', value: highContrast, set: setHighContrast },
          ].map((item, i) => (
            <View key={i} style={[styles.toggleRow, i > 0 && { borderTopWidth: 1, borderTopColor: c.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.text, fontSize: 14 * scale, fontWeight: '600' }}>{item.label}</Text>
                <Text style={{ color: c.textMuted, fontSize: 11, marginTop: 2 }}>{item.sub}</Text>
              </View>
              <Switch
                value={item.value}
                onValueChange={item.set}
                trackColor={{ false: c.border, true: c.primary }}
                thumbColor="#fff"
              />
            </View>
          ))}
        </View>

        {/* Info */}
        <View style={[styles.infoBox, { backgroundColor: (c.primaryLight || '#D1FAE5'), borderColor: c.primary }]}>
          <Text style={{ color: c.primary, fontSize: 13 * scale, fontWeight: '600' }}>
            💡 These settings are saved automatically and work fully offline.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  sectionTitle: { fontWeight: '700', marginBottom: 10 },
  card: { borderRadius: 16, borderWidth: 1, padding: 16 },
  optionRow: { flexDirection: 'row', gap: 8 },
  fontChip: { flex: 1, borderRadius: 12, borderWidth: 1.5, alignItems: 'center', paddingVertical: 10 },
  themeRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8, borderRadius: 10 },
  toggleRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14 },
  infoBox: { borderRadius: 12, borderWidth: 1, padding: 14, marginTop: 20, marginBottom: 8 },
});
