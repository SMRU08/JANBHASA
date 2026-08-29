import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { LinearGradient } from 'expo-linear-gradient';
import { Header } from '../../components/Header';
import { AnimatedCard } from '../../components/AnimatedCard';
import { NipunBharatEmblem, TribalMotifBar } from '../../components/VisualIllustrations';
import { useTheme } from '../../theme';
import { useAuthStore } from '../../store/authStore';

const CLASSES = [
  { id: '1', label: 'Class 1', tag: 'Foundational 1' },
  { id: '2', label: 'Class 2', tag: 'Foundational 2' },
  { id: '3', label: 'Class 3', tag: 'Preparatory 1' },
  { id: '4', label: 'Class 4', tag: 'Preparatory 2' },
  { id: '5', label: 'Class 5', tag: 'Middle Primary' },
];

const SUBJECTS = [
  {
    key: 'math',
    label: 'गणित (Math)',
    sub: 'संख्याएं, जोड़, घटाव और आकृतियां',
    emoji: '🔢',
    gradient: ['#1565C0', '#1E88E5'] as [string, string],
    border: '#1E88E5',
    lessonsCount: 12,
    progress: 75,
  },
  {
    key: 'hindi',
    label: 'भाषा व साहित्य (Language)',
    sub: 'कहानियां, कविताएं और व्याकरण',
    emoji: '📖',
    gradient: ['#059669', '#10B981'] as [string, string],
    border: '#10B981',
    lessonsCount: 14,
    progress: 60,
  },
  {
    key: 'science',
    label: 'विज्ञान (Science)',
    sub: 'पेड़-पौधे, सौरमंडल और ऊर्जा',
    emoji: '🔬',
    gradient: ['#7C3AED', '#8B5CF6'] as [string, string],
    border: '#8B5CF6',
    lessonsCount: 10,
    progress: 40,
  },
  {
    key: 'evs',
    label: 'पर्यावरण (EVS)',
    sub: 'हमारा परिवेश, जल और वन',
    emoji: '🌿',
    gradient: ['#0D9488', '#14B8A6'] as [string, string],
    border: '#14B8A6',
    lessonsCount: 8,
    progress: 85,
  },
  {
    key: 'english',
    label: 'English Vocabulary',
    sub: 'Alphabet, Phonics & Words',
    emoji: '🔤',
    gradient: ['#EA580C', '#F97316'] as [string, string],
    border: '#F97316',
    lessonsCount: 10,
    progress: 50,
  },
];

const ADVENTURE_NODES = [
  { step: 1, title: 'अक्षर ज्ञान (Alphabet)', stars: '⭐⭐⭐', status: 'completed', icon: '🔤' },
  { step: 2, title: 'संख्या 1-20 (Numbers)', stars: '⭐⭐⭐', status: 'completed', icon: '🔢' },
  { step: 3, title: 'रंग और आकृतियां (Colors)', stars: '⭐⭐', status: 'active', icon: '🎨' },
  { step: 4, title: 'परिवार और घर (Family)', stars: '🔒', status: 'locked', icon: '👨‍👩‍👧' },
  { step: 5, title: 'खजाना रिवार्ड (Treasure Chest)', stars: '🎁', status: 'treasure', icon: '🏆' },
];

export function LearningPathScreen() {
  const theme = useTheme();
  const c = theme.colors;
  const { t } = useTranslation();
  const nav = useNavigation<any>();
  const { user } = useAuthStore();
  const [selectedClass, setSelectedClass] = useState('3');
  const [activeTab, setActiveTab] = useState<'trail' | 'subjects'>('trail');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header
        title={t('student.learning_path') || 'Learning Adventure'}
        subtitle="NIPUN Bharat FLN Path"
        showBack={false}
        variant="gradient"
        gradientColors={['#059669', '#10B981']}
      />

      {/* Class Level Selector */}
      <View style={{ backgroundColor: theme.isDark ? theme.colors.card : '#FFFFFF', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.colors.border }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}>
          {CLASSES.map((cls) => {
            const isSelected = cls.id === selectedClass;
            return (
              <TouchableOpacity
                key={cls.id}
                onPress={() => setSelectedClass(cls.id)}
                style={[
                  styles.classTab,
                  {
                    backgroundColor: isSelected ? '#059669' : c.surface,
                    borderColor: isSelected ? '#059669' : c.border,
                  },
                ]}
                activeOpacity={0.8}
              >
                <Text style={{ color: isSelected ? '#FFFFFF' : c.text, fontWeight: '900', fontSize: 13 }}>
                  {cls.label}
                </Text>
                <Text style={{ color: isSelected ? '#D1FAE5' : c.textMuted, fontSize: 9, fontWeight: '700' }}>
                  {cls.tag}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Mode Switcher */}
      <View style={[styles.modeRow, { backgroundColor: c.surface }]}>
        <TouchableOpacity
          onPress={() => setActiveTab('trail')}
          style={[styles.modeBtn, activeTab === 'trail' && { borderBottomColor: c.primary, borderBottomWidth: 3 }]}
        >
          <Text style={{ color: activeTab === 'trail' ? c.primary : c.textMuted, fontWeight: '900', fontSize: 13 }}>
            🗺️ Adventure Trail
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('subjects')}
          style={[styles.modeBtn, activeTab === 'subjects' && { borderBottomColor: c.primary, borderBottomWidth: 3 }]}
        >
          <Text style={{ color: activeTab === 'subjects' ? c.primary : c.textMuted, fontWeight: '900', fontSize: 13 }}>
            📚 All Subjects
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: 40 }}>
        {activeTab === 'trail' ? (
          <View>
            {/* NIPUN Banner */}
            <View style={[styles.questHeader, { backgroundColor: theme.isDark ? '#064E3B' : '#ECFDF5', borderColor: '#10B981' }]}>
              <NipunBharatEmblem size={44} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ color: '#065F46', fontWeight: '900', fontSize: 14 }}>
                  Class {selectedClass} Mastery Quest
                </Text>
                <Text style={{ color: '#047857', fontSize: 11, fontWeight: '600', marginTop: 2 }}>
                  Complete stepping stones to earn XP & unlock the weekly tribal treasure box!
                </Text>
              </View>
            </View>

            <TribalMotifBar color={theme.isDark ? '#10B981' : '#059669'} height={12} />

            {/* Stepping Stones Adventure Map */}
            <View style={styles.trailContainer}>
              {ADVENTURE_NODES.map((node, i) => {
                const isLeft = i % 2 === 0;
                const isCompleted = node.status === 'completed';
                const isActive = node.status === 'active';
                const isTreasure = node.status === 'treasure';

                return (
                  <View key={node.step} style={[styles.trailRow, { justifyContent: isLeft ? 'flex-start' : 'flex-end' }]}>
                    <AnimatedCard
                      onPress={() => nav.navigate('LessonsList', { classLevel: selectedClass, subject: 'hindi', subjectLabel: node.title })}
                      style={[
                        styles.trailNodeCard,
                        {
                          backgroundColor: isCompleted ? (theme.isDark ? '#064E3B' : '#D1FAE5') : isActive ? '#FEF3C7' : c.card,
                          borderColor: isCompleted ? '#10B981' : isActive ? '#F59E0B' : c.border,
                        },
                      ]}
                    >
                      <View style={[styles.nodeIconCircle, { backgroundColor: isCompleted ? '#10B981' : isActive ? '#F59E0B' : '#64748B' }]}>
                        <Text style={{ fontSize: 24 }}>{node.icon}</Text>
                      </View>
                      <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={[styles.nodeStep, { color: isCompleted ? '#065F46' : isActive ? '#D97706' : c.textMuted }]}>
                          STAGE {node.step}
                        </Text>
                        <Text style={[styles.nodeTitle, { color: c.text }]}>{node.title}</Text>
                        <Text style={{ fontSize: 12, marginTop: 2 }}>{node.stars}</Text>
                      </View>
                      <Text style={{ fontSize: 18 }}>{isCompleted ? '✅' : isActive ? '▶️' : '🔒'}</Text>
                    </AnimatedCard>
                  </View>
                );
              })}
            </View>
          </View>
        ) : (
          <View>
            <Text style={[styles.sectionTitle, { color: c.text }]}>Subjects for Class {selectedClass}</Text>
            {SUBJECTS.map((sub) => (
              <AnimatedCard
                key={sub.key}
                onPress={() => nav.navigate('LessonsList', { classLevel: selectedClass, subject: sub.key, subjectLabel: sub.label })}
                style={[
                  styles.subjectCard,
                  { backgroundColor: c.card, borderColor: sub.border },
                ]}
              >
                <LinearGradient
                  colors={sub.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.subjectIconBox}
                >
                  <Text style={{ fontSize: 28 }}>{sub.emoji}</Text>
                </LinearGradient>

                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text style={[styles.subjectName, { color: c.text }]}>{sub.label}</Text>
                  <Text style={{ color: c.textSecondary, fontSize: 11, marginTop: 2 }} numberOfLines={1}>
                    {sub.sub}
                  </Text>
                  {/* Progress Bar */}
                  <View style={styles.progressRow}>
                    <View style={[styles.progressBarTrack, { backgroundColor: c.borderLight }]}>
                      <View style={[styles.progressBarFill, { width: `${sub.progress}%`, backgroundColor: sub.border }]} />
                    </View>
                    <Text style={{ color: sub.border, fontWeight: '900', fontSize: 11, marginLeft: 8 }}>
                      {sub.progress}%
                    </Text>
                  </View>
                </View>

                <Text style={{ fontSize: 16, color: c.textMuted }}>➔</Text>
              </AnimatedCard>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  classTab: {
    borderRadius: 14,
    borderWidth: 1.5,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignItems: 'center',
  },
  modeRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  modeBtn: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  questHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1.5,
    padding: 14,
    marginBottom: 8,
  },
  trailContainer: {
    marginTop: 12,
    gap: 14,
  },
  trailRow: {
    flexDirection: 'row',
    width: '100%',
  },
  trailNodeCard: {
    width: '92%',
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 2,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  nodeIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nodeStep: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  nodeTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 14,
  },
  subjectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  subjectIconBox: {
    width: 54,
    height: 54,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  subjectName: {
    fontSize: 16,
    fontWeight: '900',
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  progressBarTrack: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 6,
    borderRadius: 3,
  },
});
