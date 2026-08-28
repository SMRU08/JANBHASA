/**
 * JANBHASHA - Root Application Component
 * Initializes i18n, navigation, database, and theme
 */
import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import './src/locales/i18n';
import { RootNavigator } from './src/navigation/RootNavigator';
import { initDatabase } from './src/services/databaseService';
import { useSettingsStore } from './src/store/settingsStore';
import { lightTheme, darkTheme } from './src/theme';
import { OfflineBanner } from './src/components/OfflineBanner';

export default function App() {
  const [ready, setReady] = useState(false);
  const { darkMode } = useSettingsStore();

  useEffect(() => {
    async function init() {
      try {
        await initDatabase();
      } catch (e) {
        console.warn('Database init notice:', e);
      } finally {
        setReady(true);
      }
    }
    init();
  }, []);

  const theme = darkMode === 'dark' ? darkTheme : lightTheme;

  if (!ready) {
    return (
      <View style={[styles.loading, { backgroundColor: '#4CAF50' }]}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider style={styles.root}>
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
    minHeight: '100vh' as any,
    width: '100%',
  },
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    minHeight: '100vh' as any,
  },
});
