import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme';

const DOWNLOADED_LANGUAGES = [
  { id: 'hi', name: 'Hindi', size: '512 MB', flag: '🇮🇳' },
  { id: 'or', name: 'Odia', size: '620 MB', flag: '🟠' },
  { id: 'ho', name: 'Ho', size: '410 MB', flag: '🔵' },
  { id: 'sat', name: 'Santali', size: '540 MB', flag: '🟢' },
];

export function OfflineModeScreen() {
  const theme = useTheme();
  const c = theme.colors;
  const nav = useNavigation<any>();

  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => setDownloading(false), 1500);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: c.background }]}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => nav.goBack()} style={styles.headerBtn}>
          <Ionicons name="arrow-back" size={22} color={c.text} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: c.text }]}>Offline Mode</Text>

        <TouchableOpacity style={styles.headerBtn}>
          <Ionicons name="settings-outline" size={20} color={c.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Offline AI Ready Landscape Banner */}
        <View style={styles.heroBanner}>
          <LinearGradient
            colors={['#065F46', '#047857', '#0F766E']}
            style={StyleSheet.absoluteFillObject}
          />
          <View style={styles.bannerLeft}>
            <View style={styles.readyBadge}>
              <Ionicons name="checkmark-circle" size={14} color="#34D399" />
              <Text style={styles.readyBadgeText}>OFFLINE AI READY</Text>
            </View>
            <Text style={styles.bannerSub}>
              You can learn and use all downloaded features without internet.
            </Text>
          </View>

          <View style={styles.wifiSlashCircle}>
            <Ionicons name="cloud-offline" size={28} color="#FFFFFF" />
          </View>
        </View>

        {/* Dual Layout: Downloaded Languages List & Storage Donut */}
        <View style={styles.dualRow}>
          {/* Downloaded Languages List */}
          <View style={[styles.downloadedCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: c.text }]}>Downloaded Languages</Text>
              <TouchableOpacity>
                <Text style={styles.manageText}>Manage</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.langList}>
              {DOWNLOADED_LANGUAGES.map((item) => (
                <View key={item.id} style={styles.langItem}>
                  <View style={styles.langItemLeft}>
                    <Ionicons name="checkmark-sharp" size={14} color="#10B981" />
                    <Text style={[styles.langItemName, { color: c.text }]}>{item.name}</Text>
                  </View>
                  <Text style={[styles.langItemSize, { color: c.textMuted }]}>{item.size}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Storage Usage Card */}
          <View style={[styles.storageCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.cardTitle, { color: c.text }]}>Storage Usage</Text>

            <View style={styles.donutWrapper}>
              <View style={styles.donutCircle}>
                <Text style={[styles.donutVal, { color: c.text }]}>2.4 GB</Text>
                <Text style={[styles.donutSub, { color: c.textMuted }]}>of 4 GB</Text>
              </View>
            </View>

            <View style={styles.legendRow}>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#10B981' }]} />
                <Text style={[styles.legendText, { color: c.textMuted }]}>Used: 2.4 GB</Text>
              </View>
              <View style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: '#38BDF8' }]} />
                <Text style={[styles.legendText, { color: c.textMuted }]}>Free: 1.6 GB</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Download Language Pack Bottom Action Card */}
        <View style={[styles.downloadActionCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <View style={styles.actionLeft}>
            <View style={styles.plusIconWrap}>
              <Ionicons name="add" size={20} color="#2563EB" />
            </View>
            <View>
              <Text style={[styles.actionTitle, { color: c.text }]}>Download Language Pack</Text>
              <Text style={[styles.actionSub, { color: c.textMuted }]}>
                Download new languages for offline learning
              </Text>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleDownload}
            disabled={downloading}
            style={styles.downloadBtn}
          >
            <Text style={styles.downloadBtnText}>
              {downloading ? 'Downloading...' : 'Download'}
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
  heroBanner: {
    borderRadius: 24,
    overflow: 'hidden',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  bannerLeft: {
    flex: 1,
    paddingRight: 10,
  },
  readyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  readyBadgeText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  bannerSub: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
  },
  wifiSlashCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(0, 0, 0, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  dualRow: {
    gap: 14,
    marginBottom: 16,
  },
  downloadedCard: {
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  manageText: {
    color: '#2563EB',
    fontSize: 12,
    fontWeight: '700',
  },
  langList: {
    gap: 10,
  },
  langItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  langItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langItemName: {
    fontSize: 13,
    fontWeight: '700',
  },
  langItemSize: {
    fontSize: 11,
    fontWeight: '600',
  },
  storageCard: {
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 16,
    alignItems: 'center',
  },
  donutWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 8,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 14,
  },
  donutCircle: {
    alignItems: 'center',
  },
  donutVal: {
    fontSize: 15,
    fontWeight: '900',
  },
  donutSub: {
    fontSize: 10,
    fontWeight: '600',
  },
  legendRow: {
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    fontWeight: '700',
  },
  downloadActionCard: {
    borderRadius: 22,
    borderWidth: 1.5,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  plusIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  actionSub: {
    fontSize: 10,
    marginTop: 2,
  },
  downloadBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  downloadBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
});
