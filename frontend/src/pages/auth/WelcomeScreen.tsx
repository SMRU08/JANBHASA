import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { StudentHeroIllustration, TribalMotifBar } from '../../components/VisualIllustrations';
import { useTheme } from '../../theme';

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
  const theme = useTheme();
  const c = theme.colors;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Brand Logo & Header */}
        <View style={styles.brandHeader}>
          <View style={[styles.logoBubble, { backgroundColor: '#10B981', shadowColor: '#10B981' }]}>
            <Text style={styles.logoAi}>🏫</Text>
          </View>
          <Text style={[styles.brandTitle, { color: c.text }]}>JANBHASHA</Text>
          <Text style={[styles.taglineBold, { color: c.text }]}>
            Teach in Hindi. Learn in Your Mother Tongue.
          </Text>
          <Text style={[styles.taglineSub, { color: c.textSecondary }]}>
            AI-Powered Multilingual Education for Tribal & Rural Learners
          </Text>
        </View>

        {/* Hero Visual Area with Floating Tribal Dialect Bubbles */}
        <View style={styles.heroVisualWrapper}>
          {/* Floating Language Pills */}
          {FLOATING_SPEECH_BUBBLES.map((bubble, i) => (
            <View
              key={i}
              style={[
                styles.floatingBubble,
                {
                  top: bubble.y,
                  left: bubble.x,
                  backgroundColor: c.card,
                  borderColor: theme.isDark ? '#334155' : '#E2E8F0',
                },
              ]}
            >
              <Text style={[styles.bubbleText, { color: c.text }]}>{bubble.text}</Text>
            </View>
          ))}

          {/* Teacher & Students Illustration Graphic */}
          <View style={[styles.illustrationCard, { backgroundColor: theme.isDark ? '#1E293B' : '#F8FAFC' }]}>
            <StudentHeroIllustration />
          </View>
        </View>

        <TribalMotifBar color={theme.isDark ? '#10B981' : '#059669'} height={10} />

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            onPress={() => nav.navigate('RoleSelection' as any)}
            style={styles.primaryBtn}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={['#059669', '#10B981']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.btnGradient}
            >
              <Text style={styles.primaryBtnText}>Get Started / शुरू करें ➔</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => nav.navigate('LanguageSelection' as any)}
            style={[
              styles.secondaryBtn,
              {
                backgroundColor: c.card,
                borderColor: theme.isDark ? '#334155' : '#CBD5E1',
              },
            ]}
            activeOpacity={0.85}
          >
            <Text style={[styles.secondaryBtnText, { color: c.text }]}>
              🌐 Select Language / भाषा चुनें
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  logoAi: {
    fontSize: 26,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: 1,
  },
  taglineBold: {
    fontSize: 15,
    fontWeight: '800',
    marginTop: 6,
    textAlign: 'center',
  },
  taglineSub: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  heroVisualWrapper: {
    position: 'relative',
    height: 300,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  floatingBubble: {
    position: 'absolute',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
  },
  bubbleText: {
    fontSize: 12,
    fontWeight: '800',
  },
  illustrationCard: {
    width: width - 48,
    height: 250,
    borderRadius: 24,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionsContainer: {
    gap: 12,
    marginTop: 8,
    marginBottom: 16,
  },
  primaryBtn: {
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#059669',
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
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 15,
    fontWeight: '800',
  },
});
