import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { JanbhashaTheme } from '../../theme/janbhashaTheme';
import { JanbhashaHeader } from '../../components/common/JanbhashaHeader';
import { BluetoothStatusBar } from '../../components/common/BluetoothStatusBar';
import { BottomNavBar } from '../../components/common/BottomNavBar';
import { useAppStore } from '../../store/useAppStore';
import { CurriculumSubjects, Subject } from '../../data/curriculumData';
import {
  illustration_math_14,
  illustration_language_15,
  illustration_science_16,
} from '../../assets/images';

export const CurriculumScreen: React.FC = () => {
  const { navigate, setSelectedSubject } = useAppStore();
  const [activeTab, setActiveTab] = useState<'All' | 'Stories' | 'Science' | 'Math'>('All');
  const [selectedGrade, setSelectedGrade] = useState('3');

  const tabs: Array<'All' | 'Stories' | 'Science' | 'Math'> = ['All', 'Stories', 'Science', 'Math'];
  const grades = ['1', '2', '3', '4', '5'];

  const filteredSubjects = CurriculumSubjects.filter((s) => {
    if (activeTab === 'All') return true;
    return s.category === activeTab;
  });

  const getSubjectImage = (cat: string) => {
    if (cat === 'Math') return illustration_math_14;
    if (cat === 'Science') return illustration_science_16;
    return illustration_language_15;
  };

  const handleOpenSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    navigate('LessonDetails');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={JanbhashaTheme.colors.surface} barStyle="dark-content" />
      <JanbhashaHeader showBack title="Curriculum Library" subtitle="NEP 2020 Mother-Tongue Pedagogy" />
      <BluetoothStatusBar />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Grade Selector Row */}
        <View style={styles.gradeSection}>
          <Text style={styles.gradeLabel}>SELECT CLASS:</Text>
          <View style={styles.gradeChips}>
            {grades.map((gr) => (
              <TouchableOpacity
                key={gr}
                style={[styles.gradeChip, selectedGrade === gr && styles.gradeChipActive]}
                onPress={() => setSelectedGrade(gr)}
                activeOpacity={0.8}
              >
                <Text style={[styles.gradeText, selectedGrade === gr && styles.gradeTextActive]}>
                  Class {gr}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Category Tabs */}
        <View style={styles.tabsRow}>
          {tabs.map((t) => {
            const isActive = activeTab === t;
            return (
              <TouchableOpacity
                key={t}
                style={[styles.tabPill, isActive && styles.tabPillActive]}
                onPress={() => setActiveTab(t)}
                activeOpacity={0.75}
              >
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{t}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Subject Cards with Local Artwork */}
        <View style={styles.list}>
          {filteredSubjects.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => handleOpenSubject(item)}
              activeOpacity={0.8}
            >
              <Image
                source={getSubjectImage(item.category)}
                style={styles.cardThumb}
                resizeMode="cover"
              />
              <View style={styles.textBox}>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{item.category.toUpperCase()}</Text>
                </View>
                <Text style={styles.subjectTitle}>{item.title}</Text>
                <Text style={styles.santaliSub}>{item.titleSantali}</Text>
                <Text style={styles.lessonMeta}>
                  📖 {item.lessonCount} Bilingual Lessons • Grade {selectedGrade}
                </Text>
              </View>
              <Text style={styles.arrowIcon}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <BottomNavBar />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: JanbhashaTheme.colors.surface,
  },
  scrollContent: {
    padding: JanbhashaTheme.spacing.marginMobile,
    paddingBottom: 24,
  },
  gradeSection: {
    marginBottom: 16,
  },
  gradeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: JanbhashaTheme.colors.outline,
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  gradeChips: {
    flexDirection: 'row',
    gap: 8,
  },
  gradeChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: JanbhashaTheme.borderRadius.md,
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.outlineVariant,
    alignItems: 'center',
  },
  gradeChipActive: {
    backgroundColor: JanbhashaTheme.colors.primary,
    borderColor: JanbhashaTheme.colors.primary,
  },
  gradeText: {
    fontSize: 11,
    fontWeight: '700',
    color: JanbhashaTheme.colors.onSurfaceVariant,
  },
  gradeTextActive: {
    color: JanbhashaTheme.colors.onPrimary,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: JanbhashaTheme.borderRadius.full,
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.outlineVariant,
  },
  tabPillActive: {
    backgroundColor: JanbhashaTheme.colors.surfaceContainerHighest,
    borderColor: JanbhashaTheme.colors.primary,
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: JanbhashaTheme.colors.onSurfaceVariant,
  },
  tabTextActive: {
    color: JanbhashaTheme.colors.primary,
    fontWeight: '800',
  },
  list: {
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLowest,
    borderRadius: JanbhashaTheme.borderRadius.xl,
    padding: 14,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.outlineVariant,
    elevation: 2,
    shadowColor: JanbhashaTheme.colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  cardThumb: {
    width: 70,
    height: 70,
    borderRadius: JanbhashaTheme.borderRadius.lg,
    marginRight: 14,
  },
  textBox: {
    flex: 1,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    backgroundColor: JanbhashaTheme.colors.surfaceContainerHigh,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: JanbhashaTheme.borderRadius.sm,
    marginBottom: 3,
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: JanbhashaTheme.colors.outline,
  },
  subjectTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: JanbhashaTheme.colors.onSurface,
  },
  santaliSub: {
    fontSize: 12,
    fontFamily: JanbhashaTheme.fonts.olChikiBold,
    color: JanbhashaTheme.colors.primary,
    marginTop: 2,
  },
  lessonMeta: {
    fontSize: 10,
    color: JanbhashaTheme.colors.onSurfaceVariant,
    marginTop: 4,
  },
  arrowIcon: {
    fontSize: 22,
    color: JanbhashaTheme.colors.outline,
    fontWeight: '700',
    marginLeft: 8,
  },
});
