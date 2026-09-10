import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity } from 'react-native';
import { JanbhashaTheme } from '../../theme/janbhashaTheme';
import { JanbhashaHeader } from '../../components/common/JanbhashaHeader';
import { BottomNavBar } from '../../components/common/BottomNavBar';
import { useAppStore } from '../../store/useAppStore';
import { CurriculumSubjects, Subject } from '../../data/curriculumData';

export const CurriculumScreen: React.FC = () => {
  const { navigate, setSelectedSubject } = useAppStore();
  const [activeTab, setActiveTab] = useState<'All' | 'Stories' | 'Science' | 'Math'>('All');

  const tabs: Array<'All' | 'Stories' | 'Science' | 'Math'> = ['All', 'Stories', 'Science', 'Math'];

  const filteredSubjects = CurriculumSubjects.filter((s) => {
    if (activeTab === 'All') return true;
    return s.category === activeTab;
  });

  const handleOpenSubject = (subject: Subject) => {
    setSelectedSubject(subject);
    navigate('LessonDetails');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={JanbhashaTheme.colors.creamBg} barStyle="dark-content" />
      <JanbhashaHeader showBack title="Curriculum Library" subtitle="NEP 2020 Grades 1–5" />

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Filter Tabs */}
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

        {/* Subject Cards */}
        <View style={styles.list}>
          {filteredSubjects.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => handleOpenSubject(item)}
              activeOpacity={0.8}
            >
              <View style={styles.cardLeft}>
                <View style={styles.iconBox}>
                  <Text style={styles.iconEmoji}>{item.icon}</Text>
                </View>
                <View style={styles.textBox}>
                  <Text style={styles.subjectTitle}>{item.title}</Text>
                  <Text style={styles.santaliSub}>{item.titleSantali}</Text>
                  <Text style={styles.lessonBadge}>
                    📖 {item.lessonCount} Lessons • {item.category}
                  </Text>
                </View>
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
    backgroundColor: JanbhashaTheme.colors.creamBg,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 24,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  tabPill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: JanbhashaTheme.colors.white,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.cardBorder,
  },
  tabPillActive: {
    backgroundColor: JanbhashaTheme.colors.deepGreen,
    borderColor: JanbhashaTheme.colors.deepGreen,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: JanbhashaTheme.colors.mutedText,
  },
  tabTextActive: {
    color: JanbhashaTheme.colors.white,
  },
  list: {
    gap: 14,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: JanbhashaTheme.colors.white,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: JanbhashaTheme.colors.cardBorder,
    padding: 18,
    elevation: 2,
    shadowColor: JanbhashaTheme.colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: JanbhashaTheme.colors.mintTag,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconEmoji: {
    fontSize: 28,
  },
  textBox: {
    flex: 1,
  },
  subjectTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: JanbhashaTheme.colors.charcoalText,
    marginBottom: 2,
  },
  santaliSub: {
    fontSize: 14,
    fontFamily: JanbhashaTheme.fonts.olChikiBold,
    color: JanbhashaTheme.colors.deepGreen,
    marginBottom: 4,
  },
  lessonBadge: {
    fontSize: 11,
    fontWeight: '600',
    color: JanbhashaTheme.colors.mutedText,
  },
  arrowIcon: {
    fontSize: 28,
    color: JanbhashaTheme.colors.lightText,
    fontWeight: '300',
    marginLeft: 8,
  },
});
