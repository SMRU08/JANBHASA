import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, StatusBar, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme';

export function SplashScreen() {
  const theme = useTheme();
  const navigation = useNavigation<any>();

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.7)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const creditOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 600, useNativeDriver: false }),
      Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: false }),
    ]).start();

    Animated.sequence([
      Animated.delay(400),
      Animated.timing(taglineOpacity, { toValue: 1, duration: 500, useNativeDriver: false }),
      Animated.timing(creditOpacity, { toValue: 1, duration: 400, useNativeDriver: false }),
    ]).start();

    const timer = setTimeout(() => {
      navigation.replace('Welcome');
    }, 2200);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <StatusBar barStyle="light-content" backgroundColor={theme.colors.primary} />

      {/* Background pattern circles */}
      <View style={[styles.circle1, { backgroundColor: 'rgba(255,255,255,0.08)' }]} />
      <View style={[styles.circle2, { backgroundColor: 'rgba(255,255,255,0.06)' }]} />
      <View style={[styles.circle3, { backgroundColor: 'rgba(255,255,255,0.04)' }]} />

      <Animated.View style={[styles.logoBox, { opacity, transform: [{ scale }] }]}>
        <Text style={styles.logoEmoji}>🏫</Text>
        <Text style={styles.logoText}>JANBHASHA</Text>
        <Text style={styles.logoHindi}>जनभाषा</Text>
      </Animated.View>

      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        "Teach in Hindi. Learn in Your Mother Tongue."
      </Animated.Text>
      <Animated.Text style={[styles.taglineHindi, { opacity: taglineOpacity }]}>
        हिंदी में पढ़ाएं। मातृभाषा में सीखें।
      </Animated.Text>

      <Animated.View style={[styles.credit, { opacity: creditOpacity }]}>
        <Text style={styles.creditText}>Developed by Team Xerses</Text>
        <View style={styles.dots}>
          {[0, 1, 2].map(i => (
            <View key={i} style={[styles.dot, { backgroundColor: 'rgba(255,255,255,0.7)', marginHorizontal: 3 }]} />
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', minHeight: '100%' },
  circle1: { position: 'absolute', width: 300, height: 300, borderRadius: 150, top: -80, right: -80 },
  circle2: { position: 'absolute', width: 200, height: 200, borderRadius: 100, bottom: 100, left: -60 },
  circle3: { position: 'absolute', width: 150, height: 150, borderRadius: 75, top: 200, left: -50 },
  logoBox: { alignItems: 'center', marginBottom: 32 },
  logoEmoji: { fontSize: 72, marginBottom: 8 },
  logoText: { fontSize: 42, fontWeight: '900', color: '#fff', letterSpacing: 2 },
  logoHindi: { fontSize: 22, fontWeight: '700', color: 'rgba(255,255,255,0.85)', marginTop: 4 },
  tagline: { fontSize: 14, color: 'rgba(255,255,255,0.9)', textAlign: 'center', paddingHorizontal: 32, fontStyle: 'italic' },
  taglineHindi: { fontSize: 13, color: 'rgba(255,255,255,0.75)', textAlign: 'center', paddingHorizontal: 32, marginTop: 6 },
  credit: { position: 'absolute', bottom: 40, alignItems: 'center' },
  creditText: { color: 'rgba(255,255,255,0.6)', fontSize: 12 },
  dots: { flexDirection: 'row', marginTop: 8 },
  dot: { width: 6, height: 6, borderRadius: 3 },
});
