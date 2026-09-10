import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { SANTALI_DICTIONARY, DictionaryEntry } from '../../data/santaliDictionary';
import { FLN_LEXICON, FLNLexiconEntry } from '../../data/flnLexiconData';
import { audioService } from '../../services/audioService';

type TabMode = 'fln' | 'core';

const FLN_DOMAINS = [
  { key: 'all', label: 'All FLN Domains' },
  { key: 'numeracy', label: 'Numeracy (ᱞᱮᱠᱷᱟ)' },
  { key: 'literacy', label: 'Literacy (ᱚᱞ-ᱯᱟᱲᱦᱟᱣ)' },
  { key: 'classroom_instruction', label: 'Classroom (ᱠᱞᱟᱥ)' },
  { key: 'assessment', label: 'Assessment' },
];

const CATEGORIES = [
  { key: 'all', label: 'All Domains' },
  { key: 'daily', label: 'Daily Life' },
  { key: 'education', label: 'Education' },
  { key: 'healthcare', label: 'Healthcare' },
  { key: 'agriculture', label: 'Agriculture' },
  { key: 'governance', label: 'Governance' },
];

export const OfflineDictionaryScreen: React.FC = () => {
  const [tab, setTab] = useState<TabMode>('fln');
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  const q = search.trim().toLowerCase();

  const filteredCore = SANTALI_DICTIONARY.filter((item) => {
    if (selectedCat !== 'all' && item.category !== selectedCat) {
      return false;
    }
    if (!q) return true;
    return (
      item.hindi.toLowerCase().includes(q) ||
      item.olChiki.includes(q) ||
      item.roman.toLowerCase().includes(q)
    );
  });

  const filteredFln = FLN_LEXICON.filter((item) => {
    if (selectedCat !== 'all' && item.domain !== selectedCat) {
      return false;
    }
    if (!q) return true;
    return (
      item.sourceHindi.toLowerCase().includes(q) ||
      item.targetOlChiki.includes(q) ||
      item.phoneticDeva.toLowerCase().includes(q)
    );
  });

  const handleSpeak = (text: string) => {
    audioService.speakText(text, 'sat_Olck');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📖 Offline Santali Lexicon</Text>
        <Text style={styles.subtext}>
          {tab === 'fln'
            ? `${filteredFln.length} / ${FLN_LEXICON.length} Verified Classroom Phrases (Hugging Face / NIPUN)`
            : `${filteredCore.length} / ${SANTALI_DICTIONARY.length} Core Terms (AdiBhasha & Bharatavani)`}
        </Text>
      </View>

      {/* Tab Switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'fln' && styles.tabButtonActive]}
          onPress={() => {
            setTab('fln');
            setSelectedCat('all');
          }}
        >
          <Text style={[styles.tabText, tab === 'fln' && styles.tabTextActive]}>
            🎒 FLN Classroom ({FLN_LEXICON.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, tab === 'core' && styles.tabButtonActive]}
          onPress={() => {
            setTab('core');
            setSelectedCat('all');
          }}
        >
          <Text style={[styles.tabText, tab === 'core' && styles.tabTextActive]}>
            📚 Core Dictionary ({SANTALI_DICTIONARY.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="Search Hindi, Santali Ol Chiki, or phonetic..."
          placeholderTextColor="#64748B"
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Text style={styles.clearBtn}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Category Pills */}
      <View style={styles.pillRow}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={tab === 'fln' ? FLN_DOMAINS : CATEGORIES}
          keyExtractor={(c) => c.key}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.pill, selectedCat === item.key && styles.pillActive]}
              onPress={() => setSelectedCat(item.key)}
            >
              <Text style={[styles.pillText, selectedCat === item.key && styles.pillTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Results List */}
      {tab === 'fln' ? (
        <FlatList
          data={filteredFln}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.hindiWord}>{item.sourceHindi}</Text>
                <View style={styles.badgeRow}>
                  <View style={styles.categoryBadge}>
                    <Text style={styles.categoryText}>{item.domain}</Text>
                  </View>
                  <View style={[styles.categoryBadge, { backgroundColor: '#1E3A8A' }]}>
                    <Text style={[styles.categoryText, { color: '#93C5FD' }]}>{item.nipunTargetGrade}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.speechRow}>
                <Text style={styles.olChikiWord}>{item.targetOlChiki}</Text>
                <TouchableOpacity style={styles.playIconBtn} onPress={() => handleSpeak(item.targetOlChiki)}>
                  <Text style={styles.playIconText}>🔊 Speak</Text>
                </TouchableOpacity>
              </View>

              {item.phoneticDeva ? (
                <Text style={styles.romanWord}>Phonetic: {item.phoneticDeva}</Text>
              ) : null}
            </View>
          )}
        />
      ) : (
        <FlatList
          data={filteredCore}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.hindiWord}>{item.hindi}</Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryText}>{item.category}</Text>
                </View>
              </View>

              <View style={styles.speechRow}>
                <Text style={styles.olChikiWord}>{item.olChiki}</Text>
                <TouchableOpacity style={styles.playIconBtn} onPress={() => handleSpeak(item.olChiki)}>
                  <Text style={styles.playIconText}>🔊 Speak</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.romanWord}>Roman: {item.roman}</Text>
              <View style={styles.exampleBox}>
                <Text style={styles.exampleHin}>🇮🇳 {item.exampleHin}</Text>
                <Text style={styles.exampleSat}>ᱚᱞ {item.exampleSat}</Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 6 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  subtext: { fontSize: 12, color: '#10B981', marginTop: 2 },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 6,
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 3,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabButtonActive: {
    backgroundColor: '#2563EB',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#94A3B8',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  input: { flex: 1, color: '#FFFFFF', paddingVertical: 10, fontSize: 15 },
  clearBtn: { color: '#94A3B8', fontSize: 16, padding: 4 },
  pillRow: { paddingLeft: 16, marginVertical: 4, height: 38 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    marginRight: 8,
  },
  pillActive: { backgroundColor: '#2563EB' },
  pillText: { fontSize: 12, color: '#94A3B8', fontWeight: '500' },
  pillTextActive: { color: '#FFFFFF', fontWeight: 'bold' },
  listContent: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badgeRow: { flexDirection: 'row', gap: 6 },
  hindiWord: { fontSize: 16, fontWeight: 'bold', color: '#FFFFFF', flex: 1, marginRight: 8 },
  categoryBadge: {
    backgroundColor: '#334155',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  categoryText: { fontSize: 10, color: '#CBD5E1', textTransform: 'capitalize' },
  speechRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
  },
  olChikiWord: { fontSize: 20, color: '#FCD34D', fontWeight: 'bold', flex: 1 },
  playIconBtn: {
    backgroundColor: '#0F766E',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  playIconText: { fontSize: 12, color: '#FFFFFF', fontWeight: '600' },
  romanWord: { fontSize: 13, color: '#94A3B8', marginTop: 4 },
  exampleBox: {
    backgroundColor: '#0F172A',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    gap: 4,
  },
  exampleHin: { fontSize: 12, color: '#CBD5E1' },
  exampleSat: { fontSize: 13, color: '#E2E8F0', fontWeight: '500' },
});
