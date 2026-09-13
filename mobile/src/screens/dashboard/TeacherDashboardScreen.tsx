import React, { useEffect } from 'react';
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
import { avatar_teacher_teacher_dashboard_1_19 } from '../../assets/images';

export const TeacherDashboardScreen: React.FC = () => {
  const { navigate, refreshHealth, health, audioOutput, selectedBluetoothDevice } = useAppStore();

  useEffect(() => {
    refreshHealth();
  }, [refreshHealth]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={JanbhashaTheme.colors.surface} barStyle="dark-content" />
      <JanbhashaHeader showBack={false} />
      <BluetoothStatusBar />

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card Header */}
        <View style={styles.profileHeaderCard}>
          <Image
            source={avatar_teacher_teacher_dashboard_1_19}
            style={styles.teacherAvatar}
            resizeMode="cover"
          />
          <View style={styles.teacherMetaCol}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>EDUCATOR PORTAL</Text>
            </View>
            <Text style={styles.teacherName}>Shri Anand Soren</Text>
            <Text style={styles.teacherSchool}>Govt. Primary School • Mayurbhanj</Text>
          </View>
        </View>

        {/* Primary Hero Action: Live Translation */}
        <TouchableOpacity
          style={styles.heroActionCard}
          onPress={() => navigate('LiveTranslation')}
          activeOpacity={0.88}
        >
          <View style={styles.heroCardContent}>
            <View style={styles.heroIconBox}>
              <Text style={{ fontSize: 32 }}>🎙️</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.heroTagRow}>
                <Text style={styles.heroTag}>CORE AI PIPELINE</Text>
                <Text style={styles.offlineTag}>100% OFFLINE</Text>
              </View>
              <Text style={styles.heroTitle}>Live Classroom Translation</Text>
              <Text style={styles.heroSub}>
                Speak Hindi → Whisper STT → IndicTrans2 → Santali Ol Chiki → Piper Audio
              </Text>
            </View>
          </View>
          <View style={styles.heroFooter}>
            <Text style={styles.heroFooterText}>Tap to start voice lecture →</Text>
          </View>
        </TouchableOpacity>

        {/* 4-Card Bento Grid */}
        <View style={styles.bentoGrid}>
          {/* Bento 1: Classroom Broadcast */}
          <TouchableOpacity
            style={styles.bentoCard}
            onPress={() => navigate('Classroom')}
            activeOpacity={0.8}
          >
            <View style={[styles.bentoIconBox, { backgroundColor: JanbhashaTheme.colors.mintTag }]}>
              <Text style={{ fontSize: 24 }}>📡</Text>
            </View>
            <Text style={styles.bentoTitle}>Broadcast Lesson</Text>
            <Text style={styles.bentoSub}>Stream to student tablets & speakers</Text>
          </TouchableOpacity>

          {/* Bento 2: Bilingual Curriculum */}
          <TouchableOpacity
            style={styles.bentoCard}
            onPress={() => navigate('Curriculum')}
            activeOpacity={0.8}
          >
            <View style={[styles.bentoIconBox, { backgroundColor: JanbhashaTheme.colors.secondaryFixed }]}>
              <Text style={{ fontSize: 24 }}>📚</Text>
            </View>
            <Text style={styles.bentoTitle}>Curriculum Library</Text>
            <Text style={styles.bentoSub}>Grade 1-5 Hindi & Santali lessons</Text>
          </TouchableOpacity>

          {/* Bento 3: Worksheet & PDF Generator */}
          <TouchableOpacity
            style={styles.bentoCard}
            onPress={() => navigate('Worksheets')}
            activeOpacity={0.8}
          >
            <View style={[styles.bentoIconBox, { backgroundColor: JanbhashaTheme.colors.tertiaryFixed }]}>
              <Text style={{ fontSize: 24 }}>📝</Text>
            </View>
            <Text style={styles.bentoTitle}>PDF Worksheets</Text>
            <Text style={styles.bentoSub}>Bilingual printable practice sheets</Text>
          </TouchableOpacity>

          {/* Bento 4: Audio & Bluetooth */}
          <TouchableOpacity
            style={styles.bentoCard}
            onPress={() => navigate('AudioOutput')}
            activeOpacity={0.8}
          >
            <View style={[styles.bentoIconBox, { backgroundColor: '#EDE9FE' }]}>
              <Text style={{ fontSize: 24 }}>🔊</Text>
            </View>
            <Text style={styles.bentoTitle}>Audio Routing</Text>
            <Text style={styles.bentoSub}>
              {audioOutput === 'bluetooth' && selectedBluetoothDevice
                ? selectedBluetoothDevice.name
                : 'Device Speaker'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* AI Health Bar */}
        <TouchableOpacity
          style={styles.aiHealthBar}
          onPress={() => navigate('ModelStatus')}
          activeOpacity={0.8}
        >
          <View style={styles.aiHealthDot} />
          <View style={{ flex: 1 }}>
            <Text style={styles.aiHealthTitle}>On-Device AI Engine: Operational</Text>
            <Text style={styles.aiHealthSub}>
              Whisper Small + IndicTrans2 INT8 + Piper VITS (60 MB ONNX)
            </Text>
          </View>
          <Text style={styles.aiHealthArrow}>Diagnostics ›</Text>
        </TouchableOpacity>
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
  profileHeaderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLowest,
    borderRadius: JanbhashaTheme.borderRadius.xl,
    padding: 16,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.outlineVariant,
    marginBottom: 16,
    elevation: 2,
    shadowColor: JanbhashaTheme.colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
  },
  teacherAvatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    marginRight: 14,
    borderWidth: 2,
    borderColor: JanbhashaTheme.colors.primary,
  },
  teacherMetaCol: {
    flex: 1,
  },
  roleBadge: {
    alignSelf: 'flex-start',
    backgroundColor: JanbhashaTheme.colors.mintTag,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: JanbhashaTheme.borderRadius.full,
    marginBottom: 4,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: JanbhashaTheme.colors.primary,
    letterSpacing: 0.5,
  },
  teacherName: {
    fontSize: 18,
    fontWeight: '800',
    color: JanbhashaTheme.colors.onSurface,
  },
  teacherSchool: {
    fontSize: 11,
    color: JanbhashaTheme.colors.onSurfaceVariant,
    fontWeight: '500',
    marginTop: 2,
  },
  heroActionCard: {
    backgroundColor: JanbhashaTheme.colors.primary,
    borderRadius: JanbhashaTheme.borderRadius.xl,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 4,
    shadowColor: JanbhashaTheme.colors.shadowColor,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  heroCardContent: {
    flexDirection: 'row',
    padding: 18,
    alignItems: 'center',
  },
  heroIconBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  heroTagRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  heroTag: {
    fontSize: 9,
    fontWeight: '800',
    color: JanbhashaTheme.colors.mintTag,
    letterSpacing: 0.5,
  },
  offlineTag: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFE082',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: JanbhashaTheme.colors.onPrimary,
    marginBottom: 4,
  },
  heroSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 16,
  },
  heroFooter: {
    backgroundColor: 'rgba(0,0,0,0.12)',
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignItems: 'flex-end',
  },
  heroFooterText: {
    fontSize: 12,
    fontWeight: '700',
    color: JanbhashaTheme.colors.onPrimary,
  },
  bentoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  bentoCard: {
    width: '48%',
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLowest,
    borderRadius: JanbhashaTheme.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.outlineVariant,
    elevation: 2,
    shadowColor: JanbhashaTheme.colors.shadowColor,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
  },
  bentoIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  bentoTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: JanbhashaTheme.colors.onSurface,
    marginBottom: 4,
  },
  bentoSub: {
    fontSize: 10,
    color: JanbhashaTheme.colors.onSurfaceVariant,
    lineHeight: 14,
  },
  aiHealthBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: JanbhashaTheme.colors.surfaceContainerLow,
    borderRadius: JanbhashaTheme.borderRadius.lg,
    padding: 14,
    borderWidth: 1,
    borderColor: JanbhashaTheme.colors.outlineVariant,
  },
  aiHealthDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    marginRight: 12,
  },
  aiHealthTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: JanbhashaTheme.colors.onSurface,
  },
  aiHealthSub: {
    fontSize: 10,
    color: JanbhashaTheme.colors.onSurfaceVariant,
    marginTop: 2,
  },
  aiHealthArrow: {
    fontSize: 12,
    fontWeight: '700',
    color: JanbhashaTheme.colors.primary,
    marginLeft: 8,
  },
});
