import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Header } from '../../components/Header';
import { Card } from '../../components/Card';
import { Button } from '../../components/Button';
import { useTheme } from '../../theme';
import { apiRequest } from '../../services/apiClient';

export function LanguagePackManagementScreen() {
  const theme = useTheme();
  const c = theme.colors;
  const [packs, setPacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPacks = async () => {
    setLoading(true);
    const res = await apiRequest<any[]>('/api/admin/language-packs');
    if (res.success && res.data) {
      setPacks(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPacks();
  }, []);

  const handleToggleInstall = async (packId: string, isInstalled: boolean) => {
    const action = isInstalled ? 'uninstall' : 'install';
    const res = await apiRequest(`/api/admin/language-packs/${packId}/${action}`, { method: 'POST' });
    if (res.success) {
      setPacks((prev) =>
        prev.map((p) => (p.pack_id === packId ? { ...p, is_installed: isInstalled ? 0 : 1 } : p))
      );
      Alert.alert('Updated', `Language pack ${packId} is now ${isInstalled ? 'uninstalled' : 'installed'}.`);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.background }}>
      <Header title="Language Packs 🌐" subtitle="भाषा पैक प्रबंधन" showBack={false} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <Text style={[styles.title, { color: c.text }]}>Installed & Available Mother Tongues</Text>
        {packs.map((p) => {
          const installed = Boolean(p.is_installed);
          return (
            <Card key={p.pack_id} style={{ marginBottom: 12 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View>
                  <Text style={{ fontSize: 17, fontWeight: '800', color: c.text }}>{p.name}</Text>
                  <Text style={{ color: c.textSecondary, fontSize: 13, marginTop: 2 }}>
                    Native: {p.native_name} • Code: {p.pack_id.toUpperCase()}
                  </Text>
                  <Text style={{ color: c.textMuted, fontSize: 12, marginTop: 2 }}>
                    Size: {p.size_mb} MB • Script: {p.script}
                  </Text>
                </View>
                <View
                  style={[
                    styles.statusPill,
                    { backgroundColor: installed ? c.successLight : c.warningLight }
                  ]}
                >
                  <Text
                    style={{
                      color: installed ? c.success : c.warningDark || '#E65100',
                      fontSize: 11,
                      fontWeight: '800'
                    }}
                  >
                    {installed ? 'INSTALLED' : 'AVAILABLE'}
                  </Text>
                </View>
              </View>

              <Button
                title={installed ? 'Uninstall Pack' : 'Install Offline Pack 📥'}
                onPress={() => handleToggleInstall(p.pack_id, installed)}
                variant={installed ? 'outline' : 'primary'}
                size="sm"
                style={{ marginTop: 12 }}
              />
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 15, fontWeight: '700', marginBottom: 12 },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 }
});
