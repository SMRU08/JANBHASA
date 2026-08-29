import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StudentHeroIllustration } from '../../components/VisualIllustrations';

const { width } = Dimensions.get('window');

const FLOATING_SPEECH_BUBBLES = [
  { text: 'हिंदी', x: 20, y: 15 },
  { text: 'ଓଡ଼ିଆ', x: width - 90, y: 30 },
  { text: 'हो', x: width - 70, y: 110 },
  { text: 'संताली', x: 15, y: 120 },
  { text: 'मुंडारी', x: width - 95, y: 180 },
  { text: 'Gondi', x: 25, y: 190 },
];

export function WelcomeScreen() {
  const nav = useNavigation<any>();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Brand Logo & Header */}
        <View style={styles.brandHeader}>
          <View style={styles.logoBubble}>
            <Text style={styles.logoAi}>Ai</Text>
          </View>
          <Text style={styles.brandTitle}>JANBHASHA</Text>
          <Text style={styles.taglineBold}>Teach in Hindi. Learn in Your Mother Tongue.</Text>
          <Text style={styles.taglineSub}>AI-Powered Multilingual Education for Everyone</Text>
        </View>

        {/* Hero Visual Area with Floating Tribal Dialect Bubbles */}
        <View style={styles.heroVisualWrapper}>
          {/* Floating Language Pills */}
          {FLOATING_SPEECH_BUBBLES.map((bubble, i) => (
            <View
              key={i}
              style={[
                styles.floatingBubble,
                { top: bubble.y, left: bubble.x },
              ]}
            >
              <Text style={styles.bubbleText}>{bubble.text}</Text>
            </View>
          ))}

          {/* Teacher & Students Illustration Graphic */}
          <View style={styles.illustrationCard}>
            <StudentHeroIllustration />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            onPress={() => nav.navigate('RoleSelection' as any)}
            style={styles.primaryBtn}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#2563EB', '#1D4ED8']}
              style={styles.btnGradient}
            >
              <Text style={styles.primaryBtnText}>Get Started</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => nav.navigate('LanguageSelection' as any)}
            style={styles.secondaryBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryBtnText}>Select Language</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    justifyContent: 'space-between',
  },
  brandHeader: {
    alignItems: 'center',
    marginTop: 8,
  },
  logoBubble: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#3B82F6',
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoAi: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  taglineBold: {
    fontSize: 15,
    fontWeight: '800',
    color: '#1E293B',
    marginTop: 8,
    textAlign: 'center',
  },
  taglineSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  heroVisualWrapper: {
    position: 'relative',
    height: 320,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  floatingBubble: {
    position: 'absolute',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  bubbleText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E293B',
  },
  illustrationCard: {
    width: width - 48,
    height: 260,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  primaryBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnGradient: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  secondaryBtn: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  secondaryBtnText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },
});
