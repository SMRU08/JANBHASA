/**
 * JANBHASHA - Root Application Component
 * Initializes i18n, navigation, database, and theme with full Web & Native compatibility
 */
import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Platform, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import './src/locales/i18n';
import { RootNavigator } from './src/navigation/RootNavigator';
import { initDatabase } from './src/services/databaseService';
import { useSettingsStore } from './src/store/settingsStore';
import { lightTheme, darkTheme } from './src/theme';
import { OfflineBanner } from './src/components/OfflineBanner';

// Inject essential full-height CSS for Web environments
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const existingStyle = document.getElementById('janbhasha-root-style');
  if (!existingStyle) {
    const style = document.createElement('style');
    style.id = 'janbhasha-root-style';
    style.textContent = `
      html, body, #root {
        height: 100%;
        min-height: 100%;
        width: 100%;
        margin: 0;
        padding: 0;
        display: flex;
        flex-direction: column;
        background-color: #059669;
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      #root {
        flex: 1;
      }
      #root > div {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 100%;
      }
    `;
    document.head.appendChild(style);
  }
}

export default function App() {
  const [ready, setReady] = useState(true);
  const { darkMode } = useSettingsStore();

  useEffect(() => {
    initDatabase().catch((e) => {
      console.warn('Database init notice:', e);
    });
  }, []);

  const theme = darkMode === 'dark' ? darkTheme : lightTheme;

  if (!ready) {
    return (
      <View style={[styles.loading, { backgroundColor: '#059669' }]}>
        <Text style={styles.loadingEmoji}>🏫</Text>
        <Text style={styles.loadingTitle}>JANBHASHA</Text>
        <ActivityIndicator size="large" color="#FFFFFF" style={{ marginTop: 16 }} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider initialMetrics={initialWindowMetrics} style={styles.root}>
        <NavigationContainer theme={theme as any}>
          <StatusBar style={darkMode === 'dark' ? 'light' : 'dark'} />
          <OfflineBanner />
          <RootNavigator />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    height: '100%',
    width: '100%',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  },
  loadingEmoji: {
    fontSize: 56,
    marginBottom: 8,
  },
  loadingTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
});
