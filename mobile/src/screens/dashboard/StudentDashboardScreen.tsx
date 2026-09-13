import React from 'react';
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
import {
  avatar_student_student_dashboard_12,
  illustration_math_14,
  illustration_language_15,
  illustration_science_16,
  story_time_illustration,
} from '../../assets/images';

export const StudentDashboardScreen: React.FC = () => {
  const { navigate, setSelectedSubject } = useAppStore();

  const handleOpenSubject = (subjectName: string) => {
    setSelectedSubject({ name: subjectName });
    navigate('Curriculum');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={JanbhashaTheme.colors.surface} barStyle="dark-content" />
      <JanbhashaHeader showBack={false} />
      <BluetoothStatusBar />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Student Profile & Daily Streak Header */}
        <View style={styles.profileCard}>
          <Image
            source={avatar_student_student_dashboard_12}
            style={styles.avatar}
            resizeMode="cover"
          />
          <View style={styles.profileMeta}>
            <View style={styles.gradeBadge}>
              <Text style={styles.gradeBadgeText}>CLASS 3 • SANTALI & HINDI</Text>
            </View>
            <Text style={styles.studentName}>Chunaram Marndi</Text>
            <Text style={styles.nativeGreeting}>ᱡᱚᱦᱟᱨ ᱪᱮᱪᱮᱫᱤᱭᱟᱹ ! (Hello Learner!)</Text>
          </View>
          <View style={styles.starBadge}>
            <Text style={{ fontSize: 20 }}>⭐</Text>
            <Text style={styles.starCount}>12</Text>
          </View>
        </View>

        {/* Live Classroom Quick Join Hero */}
        <TouchableOpacity
          style={styles.classroomHeroCard}
          onPress={() => navigate('StudentClassroom')}
          activeOpacity={0.88}
        >
          <View style={styles.classroomHeroLeft}>
            <View style={styles.liveDot} />
            <Text style={styles.liveTag}>LIVE BROADCAST READY</Text>
            <Text style={styles.classroomTitle}>Join Teacher Soren's Class</Text>
            <Text style={styles.classroomSub}>
              Listen to translated audio lecture in real time on this tablet
            </Text>
          </View>
          <View style={styles.joinButtonCircle}>
            <Text style={styles.joinArrow}>🎒</Text>
          </View>
        </TouchableOpacity>

        {/* Subject Cards Horizontal / Bento */}
        <Text style={styles.sectionTitle}>My Subjects • ᱟᱢᱟᱜ ᱥᱮᱪᱮᱫ ᱦᱟᱹᱴᱤᱧ</Text>
        <View style={styles.subjectsRow}>
          {/* Language & Stories */}
          <TouchableOpacity
            style={styles.subjectCard}
            onPress={() => handleOpenSubject('Language')}
            activeOpacity={0.8}
          >
            <Image source={illustration_language_15} style={styles.subjectImage} resizeMode="cover" />
            <View style={styles.subjectContent}>
              <Text style={styles.subjectName}>Santali & Hindi</Text>
              <Text style={styles.subjectSub}>ᱯᱟᱹᱨᱥᱤ ᱟᱨ ᱠᱟᱹᱦᱱᱤ</Text>
            </View>
          </TouchableOpacity>

          {/* Math & Numbers */}
          <TouchableOpacity
            style={styles.subjectCard}
            onPress={() => handleOpenSubject('Math')}
            activeOpacity={0.8}
          >
            <Image source={illustration_math_14} style={styles.subjectImage} resizeMode="cover" />
            <View style={styles.subjectContent}>
              <Text style={styles.subjectName}>FLN Numeracy</Text>
              <Text style={styles.subjectSub}>ᱞᱮᱠᱷᱟ (Numbers 1-100)</Text>
            </View>
          </TouchableOpacity>

          {/* Science & Nature */}
          <TouchableOpacity
            style={styles.subjectCard}
            onPress={() => handleOpenSubject('Science')}
            activeOpacity={0.8}
          >
            <Image source={illustration_science_16} style={styles.subjectImage} resizeMode="cover" />
            <View style={styles.subjectContent}>
              <Text style={styles.subjectName}>Nature & Science</Text>
              <Text style={styles.subjectSub}>ᱫᱟᱨᱮ ᱱᱟᱹᱲᱤ ᱟᱨ ᱥᱤᱨᱡᱚᱱ</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Featured Story Time Card */}
        <TouchableOpacity
          style={styles.storyCard}
          onPress={() => navigate('Curriculum')}
          activeOpacity={0.85}
        >
          <Image source={story_time_illustration} style={styles.storyImage} resizeMode="cover" />
          <View style={styles.storyOverlay}>
            <View style={styles.storyTag}>
              <Text style={styles.storyTagText}>TODAY'S STORY • ᱛᱮᱦᱮᱧᱟᱜ ᱠᱟᱹᱦᱱᱤ</Text>
            </View>
            <Text style={styles.storyTitle}>Banyan Tree & The Little Birds</Text>
            <Text style={styles.storyOlChiki}>ᱢᱟᱨᱟᱝ ᱵᱟᱨᱮ ᱫᱟᱨᱮ ᱟᱨ ᱦᱩᱰᱤᱧ ᱪᱮᱬᱮ ᱠᱚ</Text>
          </View>
        </TouchableOpacity>

        {/* Quick Tools Grid */}
        <View style={styles.toolsGrid}>
          <TouchableOpacity
            style={styles.toolButton}
            onPress={() => navigate('LiveTranslation')}
            activeOpacity={0.8}
          >
            <Text style={styles.toolIcon}>🎙️</Text>
            <Text style={styles.toolLabel}>Voice Translate</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolButton}
            onPress={() => navigate('Flashcards')}
            activeOpacity={0.8}
          >
            <Text style={styles.toolIcon}>🗂️</Text>
            <Text style={styles.toolLabel}>Ol Chiki Cards</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolButton}
            onPress={() => navigate('Worksheets')}
            activeOpacity={0.8}
          >
            <Text style={styles.toolIcon}>📝</Text>
            <Text style={styles.toolLabel}>Worksheets</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.toolButton}
            onPress={() => navigate('Profile')}
            activeOpacity={0.8}
          >
            <Text style={styles.toolIcon}>👤</Text>
            <Text style={styles.toolLabel}>My Profile</Text>
          </TouchableOpacity>
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
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLowest,
    borderRadius: JanbhashaTheme.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.outlineVariant,
    marginBottom: 16,
    elevation: 2,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    borderColor: JanbhashaTheme.colors.secondary,
    marginRight: 14,
  },
  profileMeta: {
    flex: 1,
  },
  gradeBadge: {
    alignSelf: 'flex-start',
    backgroundColor: JanbhashaTheme.colors.secondaryFixed,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: JanbhashaTheme.borderRadius.full,
    marginBottom: 4,
  },
  gradeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: JanbhashaTheme.colors.secondary,
  },
  studentName: {
    fontSize: 17,
    fontWeight: '800',
    color: JanbhashaTheme.colors.onSurface,
  },
  nativeGreeting: {
    fontSize: 11,
    color: JanbhashaTheme.colors.primary,
    fontFamily: JanbhashaTheme.fonts.olChikiBold,
    marginTop: 2,
  },
  starBadge: {
    alignItems: 'center',
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLow,
    borderRadius: JanbhashaTheme.borderRadius.lg,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.outlineVariant,
  },
  starCount: {
    fontSize: 12,
    fontWeight: '800',
    color: JanbhashaTheme.colors.secondary,
  },
  classroomHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: JanbhashaTheme.colors.secondary,
    borderRadius: JanbhashaTheme.borderRadius.xl,
    padding: 18,
    marginBottom: 20,
    elevation: 3,
  },
  classroomHeroLeft: {
    flex: 1,
    paddingRight: 12,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FFE082',
    marginBottom: 4,
  },
  liveTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFE082',
    letterSpacing: 0.5,
  },
  classroomTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: JanbhashaTheme.colors.onSecondary,
    marginVertical: 4,
  },
  classroomSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 16,
  },
  joinButtonCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  joinArrow: {
    fontSize: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: JanbhashaTheme.colors.onSurface,
    marginBottom: 12,
  },
  subjectsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  subjectCard: {
    flex: 1,
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLowest,
    borderRadius: JanbhashaTheme.borderRadius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.outlineVariant,
    elevation: 2,
  },
  subjectImage: {
    width: '100%',
    height: 75,
  },
  subjectContent: {
    padding: 8,
  },
  subjectName: {
    fontSize: 11,
    fontWeight: '800',
    color: JanbhashaTheme.colors.onSurface,
  },
  subjectSub: {
    fontSize: 9,
    color: JanbhashaTheme.colors.primary,
    marginTop: 2,
  },
  storyCard: {
    borderRadius: JanbhashaTheme.borderRadius.xl,
    overflow: 'hidden',
    height: 160,
    position: 'relative',
    marginBottom: 20,
    elevation: 3,
  },
  storyImage: {
    width: '100%',
    height: '100%',
  },
  storyOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
    padding: 16,
    justifyContent: 'flex-end',
  },
  storyTag: {
    alignSelf: 'flex-start',
    backgroundColor: JanbhashaTheme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: JanbhashaTheme.borderRadius.full,
    marginBottom: 6,
  },
  storyTagText: {
    fontSize: 9,
    fontWeight: '800',
    color: JanbhashaTheme.colors.onPrimary,
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#ffffff',
  },
  storyOlChiki: {
    fontSize: 13,
    fontFamily: JanbhashaTheme.fonts.olChikiBold,
    color: '#cbffc2',
    marginTop: 2,
  },
  toolsGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  toolButton: {
    flex: 1,
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLowest,
    borderRadius: JanbhashaTheme.borderRadius.lg,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.outlineVariant,
  },
  toolIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  toolLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: JanbhashaTheme.colors.onSurfaceVariant,
  },
});
