import React, { useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme';

export function SplashScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();

  const handleContinue = () => {
    try {
      navigation.navigate('Welcome');
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleContinue();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      onPress={handleContinue}
      style={[styles.container, { backgroundColor: theme.colors.primary || '#059669' }]}
    >
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary || '#059669'} />

      {/* Subtle Background Pattern Circles */}
      <View style={[styles.circle1, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />
      <View style={[styles.circle2, { backgroundColor: 'rgba(255,255,255,0.06)' }]} />
      <View style={[styles.circle3, { backgroundColor: 'rgba(255,255,255,0.04)' }]} />

      {/* Main Logo Card */}
      <View style={styles.logoBox}>
        <Text style={styles.logoEmoji}>🏫</Text>
        <Text style={styles.logoText}>JANBHASHA</Text>
        <Text style={styles.logoHindi}>जनभाषा • ᱥᱟᱱᱛᱟᱲᱤ • ᱦᱳ</Text>
      </View>

      <Text style={styles.tagline}>
        "Teach in Hindi. Learn in Your Mother Tongue."
      </Text>
      <Text style={styles.taglineHindi}>
        हिंदी में पढ़ाएं। मातृभाषा में सीखें।
      </Text>

      {/* Tap anywhere to continue button */}
      <View style={styles.continuePill}>
        <Text style={styles.continueText}>Tap anywhere to continue ➔</Text>
      </View>

      <View style={styles.credit}>
        <Text style={styles.creditText}>Developed by Team Xerses</Text>
        <View style={styles.dots}>
          {[0, 1, 2].map((i) => (
            <View
              key={i}
              style={[
                styles.dot,
                { backgroundColor: 'rgba(255,255,255,0.8)', marginHorizontal: 3 },
              ]}
            />
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100%',
    width: '100%',
  },
  circle1: { position: 'absolute', width: 300, height: 300, borderRadius: 150, top: -80, right: -80 },
  circle2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, bottom: 100, left: -60 },
  circle3: { position: 'absolute', width: 150, height: 150, borderRadius: 75, top: 200, left: -50 },
  logoBox: { alignItems: 'center', marginBottom: 24 },
  logoEmoji: { fontSize: 64, marginBottom: 8 },
  logoText: { fontSize: 38, fontWeight: '900', color: '#FFFFFF', letterSpacing: 2 },
  logoHindi: { fontSize: 18, fontWeight: '700', color: 'rgba(255,255,255,0.9)', marginTop: 4 },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.95)', textAlign: 'center', paddingHorizontal: 28, fontStyle: 'italic', fontWeight: '600' },
  taglineHindi: { fontSize: 13, color: 'rgba(255,255,255,0.8)', textAlign: 'center', paddingHorizontal: 28, marginTop: 4 },
  continuePill: {
    marginTop: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  continueText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  credit: { position: 'absolute', bottom: 30, alignItems: 'center' },
  creditText: { color: 'rgba(255,255,255,0.7)', fontSize: 12, fontWeight: '600' },
  dots: { flexDirection: 'row', marginTop: 6 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
