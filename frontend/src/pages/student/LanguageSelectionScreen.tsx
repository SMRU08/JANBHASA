import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme';

const { width } = Dimensions.get('window');
const cardWidth = (width - 48) / 2;

const LANGUAGES = [
  {
    id: 'hi',
    name: 'Hindi',
    native: 'हिंदी',
    region: 'Native',
    speakers: '528M+',
    gradient: ['#F97316', '#EA580C'],
    landmarkEmoji: '🏛️',
  },
  {
    id: 'or',
    name: 'Odia',
    native: 'ଓଡ଼ିଆ',
    region: 'Native',
    speakers: '42M+',
    gradient: ['#0284C7', '#0369A1'],
    landmarkEmoji: '🛕',
  },
  {
    id: 'ho',
    name: 'Ho',
    native: 'हो / ᱦᱳ',
    region: 'Jharkhand',
    speakers: '1.5M+',
    gradient: ['#059669', '#047857'],
    landmarkEmoji: '🌲',
  },
  {
    id: 'sat',
    name: 'Santali',
    native: 'संताली / ᱥᱟᱱᱛᱟᱲᱤ',
    region: 'Jharkhand, Odisha',
    speakers: '7M+',
    gradient: ['#D97706', '#B45309'],
    landmarkEmoji: '🏡',
  },
  {
    id: 'mun',
    name: 'Mundari',
    native: 'मुंडारी',
    region: 'Jharkhand',
    speakers: '2M+',
    gradient: ['#7C3AED', '#6D28D9'],
    landmarkEmoji: '🌿',
  },
  {
    id: 'kui',
    name: 'Kui',
    native: 'कुई / କୁଇ',
    region: 'Odisha',
    speakers: '1.2M+',
    gradient: ['#E11D48', '#BE123C'],
    landmarkEmoji: '🏔️',
  },
  {
    id: 'gon',
    name: 'Gondi',
    native: 'गोंडी',
    region: 'Madhya Pradesh',
    speakers: '1.8M+',
    gradient: ['#4F46E5', '#4338CA'],
    landmarkEmoji: '🏹',
  },
];

export function LanguageSelectionScreen() {
  const theme = useTheme();
  const c = theme.colors;
  const nav = useNavigation<any>();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLang, setSelectedLang] = useState('or');

  const filtered = LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.native.includes(searchQuery)
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color={c.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: c.text }]}>Choose Your Language</Text>

        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="search" size={20} color={c.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={[styles.subtitle, { color: c.textMuted }]}>
          Select the language you want to learn or translate.
        </Text>

        {/* Language Cards Grid */}
        <View style={styles.grid}>
          {filtered.map((lang) => {
            const isSelected = selectedLang === lang.id;
            return (
              <TouchableOpacity
                key={lang.id}
                onPress={() => {
                  setSelectedLang(lang.id);
                  nav.goBack();
                }}
                activeOpacity={0.85}
                style={[
                  styles.card,
                  {
                    backgroundColor: c.card,
                    borderColor: isSelected ? '#2563EB' : c.border,
                  },
                ]}
              >
                {/* Visual Landmark Banner Header */}
                <LinearGradient
                  colors={lang.gradient as any}
                  style={styles.cardHeader}
                >
                  <Text style={styles.landmarkEmoji}>{lang.landmarkEmoji}</Text>
                  <View style={styles.regionBadge}>
                    <Text style={styles.regionText}>{lang.region}</Text>
                  </View>
                </LinearGradient>

                {/* Content */}
                <View style={styles.cardBody}>
                  <Text style={[styles.nativeName, { color: c.text }]}>{lang.native}</Text>
                  <Text style={[styles.englishName, { color: c.textMuted }]}>{lang.name}</Text>

                  {/* Speaker count & features */}
                  <View style={styles.metaRow}>
                    <Text style={[styles.speakerText, { color: c.textMuted }]}>
                      {lang.speakers}
                    </Text>

                    <View style={styles.featureIconsRow}>
                      <Ionicons name="mic-outline" size={13} color="#2563EB" />
                      <Ionicons name="cloud-download-outline" size={13} color="#10B981" />
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          {/* + More Languages Card */}
          <TouchableOpacity
            style={[styles.moreCard, { backgroundColor: c.card, borderColor: c.border }]}
            activeOpacity={0.85}
          >
            <View style={styles.plusIconCircle}>
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </View>
            <Text style={[styles.moreTitle, { color: c.text }]}>More Languages</Text>
            <Text style={[styles.moreSub, { color: c.textMuted }]}>12+ Indian languages available</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  card: {
    width: cardWidth,
    borderRadius: 20,
    borderWidth: 1.5,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  cardHeader: {
    height: 70,
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  landmarkEmoji: {
    fontSize: 28,
  },
  regionBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  regionText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardBody: {
    padding: 10,
  },
  nativeName: {
    fontSize: 15,
    fontWeight: '800',
  },
  englishName: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0,0,0,0.06)',
    paddingTop: 6,
  },
  speakerText: {
    fontSize: 10,
    fontWeight: '600',
  },
  featureIconsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  moreCard: {
    width: cardWidth,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  plusIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6366F1',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  moreTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  moreSub: {
    fontSize: 10,
    textAlign: 'center',
    marginTop: 2,
  },
});
