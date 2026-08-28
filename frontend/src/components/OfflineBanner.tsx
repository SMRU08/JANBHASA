import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Modal as RNModal } from 'react-native';
import { useTheme } from '../theme';
import NetInfo from '@react-native-community/netinfo';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

// OfflineBanner
export function OfflineBanner() {
  const [isOffline, setIsOffline] = useState(false);
  const { t } = useTranslation();
  const theme = useTheme();
  useEffect(() => {
    const unsub = NetInfo.addEventListener(state => setIsOffline(!state.isConnected));
    return unsub;
  }, []);
  if (!isOffline) return null;
  return (
    <View style={[styles.banner, { backgroundColor: theme.colors.successLight, borderColor: theme.colors.success }]}>
      <Text style={[styles.bannerText, { color: theme.colors.success }]}>✅ {t('settings.all_offline')}</Text>
    </View>
  );
}

// LoadingScreen
export function LoadingScreen({ message }: { message?: string }) {
  const theme = useTheme();
  return (
    <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {message && <Text style={[styles.loadMsg, { color: theme.colors.textSecondary }]}>{message}</Text>}
    </View>
  );
}

// ErrorMessage
export function ErrorMessage({ message, onRetry, type = 'generic' }: { message: string; onRetry?: () => void; type?: string }) {
  const theme = useTheme();
  const icons: Record<string, string> = { network: '📡', ai: '🤖', storage: '💾', camera: '📷', generic: '⚠️' };
  return (
    <View style={[styles.errBox, { backgroundColor: theme.colors.errorLight, borderColor: theme.colors.error }]}>
      <Text style={styles.errIcon}>{icons[type] || '⚠️'}</Text>
      <Text style={[styles.errMsg, { color: theme.colors.error }]}>{message}</Text>
      {onRetry && <TouchableOpacity onPress={onRetry} style={[styles.retryBtn, { backgroundColor: theme.colors.error }]}>
        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 13 }}>Retry</Text>
      </TouchableOpacity>}
    </View>
  );
}

// Modal
interface ModalProps { visible: boolean; title: string; children: React.ReactNode; onClose: () => void; actions?: React.ReactNode; }
export function Modal({ visible, title, children, onClose, actions }: ModalProps) {
  const theme = useTheme();
  return (
    <RNModal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.modal, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.modalHeader}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{title}</Text>
            <TouchableOpacity onPress={onClose}><Text style={{ fontSize: 22 }}>✕</Text></TouchableOpacity>
          </View>
          <View style={{ paddingHorizontal: 20, paddingBottom: 8 }}>{children}</View>
          {actions && <View style={styles.modalActions}>{actions}</View>}
        </View>
      </View>
    </RNModal>
  );
}

// QRGenerator
import QRCode from 'react-native-qrcode-svg';
interface QRProps { data: string; size?: number; title?: string; }
export function QRGenerator({ data, size = 200, title }: QRProps) {
  const theme = useTheme();
  return (
    <View style={[styles.qrBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      {title && <Text style={[styles.qrTitle, { color: theme.colors.text }]}>{title}</Text>}
      <QRCode value={data} size={size} color={theme.colors.text} backgroundColor={theme.colors.card} />
    </View>
  );
}

// StudentCard
interface StudentCardProps { student: { name: string; student_code?: string; total_xp?: number; is_active?: boolean }; onPress?: () => void; }
export function StudentCard({ student, onPress }: StudentCardProps) {
  const theme = useTheme();
  const initials = student.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8} style={[styles.studentCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
      <View style={[styles.avatar, { backgroundColor: theme.colors.primaryLight }]}>
        <Text style={[styles.avatarText, { color: theme.colors.primary }]}>{initials}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.studentName, { color: theme.colors.text }]}>{student.name}</Text>
        {student.student_code && <Text style={[styles.studentCode, { color: theme.colors.textMuted }]}>#{student.student_code}</Text>}
      </View>
      <View style={[styles.onlineDot, { backgroundColor: student.is_active ? theme.colors.online : theme.colors.offline }]} />
    </TouchableOpacity>
  );
}

// AnalyticsCard
interface AnalyticsCardProps { title: string; value: string | number; subtitle?: string; color?: string; icon?: string; }
export function AnalyticsCard({ title, value, subtitle, color, icon }: AnalyticsCardProps) {
  const theme = useTheme();
  return (
    <View style={[styles.analyticsCard, { backgroundColor: theme.colors.card, borderColor: color || theme.colors.border }]}>
      {icon && <Text style={styles.analyticsIcon}>{icon}</Text>}
      <Text style={[styles.analyticsValue, { color: color || theme.colors.text }]}>{value}</Text>
      <Text style={[styles.analyticsTitle, { color: theme.colors.textSecondary }]}>{title}</Text>
      {subtitle && <Text style={[styles.analyticsSub, { color: theme.colors.textMuted }]}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  banner: { margin: 8, borderRadius: 10, borderWidth: 1, padding: 10, alignItems: 'center' },
  bannerText: { fontSize: 13, fontWeight: '600' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadMsg: { marginTop: 16, fontSize: 14 },
  errBox: { borderRadius: 12, borderWidth: 1, padding: 16, alignItems: 'center', margin: 8 },
  errIcon: { fontSize: 32, marginBottom: 8 },
  errMsg: { fontSize: 14, textAlign: 'center', fontWeight: '600' },
  retryBtn: { marginTop: 12, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 10 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modal: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 20, paddingBottom: 32 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: '700' },
  modalActions: { flexDirection: 'row', paddingHorizontal: 20, gap: 12, marginTop: 16 },
  qrBox: { alignItems: 'center', padding: 20, borderRadius: 16, borderWidth: 1 },
  qrTitle: { fontSize: 14, fontWeight: '600', marginBottom: 12 },
  studentCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1, padding: 12, marginBottom: 8 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  avatarText: { fontSize: 16, fontWeight: '700' },
  studentName: { fontSize: 15, fontWeight: '600' },
  studentCode: { fontSize: 12, marginTop: 2 },
  onlineDot: { width: 10, height: 10, borderRadius: 5 },
  analyticsCard: { borderRadius: 14, borderWidth: 2, padding: 16, alignItems: 'center', flex: 1, margin: 4 },
  analyticsIcon: { fontSize: 24, marginBottom: 6 },
  analyticsValue: { fontSize: 28, fontWeight: '800' },
  analyticsTitle: { fontSize: 12, fontWeight: '600', marginTop: 2, textAlign: 'center' },
  analyticsSub: { fontSize: 11, marginTop: 2 },
});
