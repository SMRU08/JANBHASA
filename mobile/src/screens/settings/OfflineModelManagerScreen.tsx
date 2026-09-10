import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { modelManager, ModelInfo } from '../../core/managers/ModelManager';
import { memoryManager, MemoryStats } from '../../core/managers/MemoryManager';

export const OfflineModelManagerScreen: React.FC = () => {
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [memory, setMemory] = useState<MemoryStats>(memoryManager.getMemoryStats());

  useEffect(() => {
    loadInfo();
  }, []);

  const loadInfo = async () => {
    const list = await modelManager.getModelList();
    setModels(list);
    setMemory(memoryManager.getMemoryStats());
  };

  const handleImport = () => {
    Alert.alert(
      'Import Model from Storage',
      'You can place INT8 .onnx or .bin model files into your Download folder and import them into Janbhasha.\n\nSupported formats: .onnx, .tflite, .bin, .safetensors, .gguf',
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>⚙️ Model & Memory Manager</Text>
        <Text style={styles.subtext}>Low-Cost Android 2 GB RAM Optimization</Text>
      </View>

      {/* RAM Status Meter */}
      <View style={styles.ramCard}>
        <Text style={styles.cardTitle}>Kernel RAM Tracking</Text>
        <View style={styles.ramRow}>
          <Text style={styles.ramLabel}>Free RAM:</Text>
          <Text style={styles.ramValue}>{memory.freeRamMb} MB</Text>
        </View>
        <View style={styles.ramRow}>
          <Text style={styles.ramLabel}>Model Resident Budget:</Text>
          <Text style={styles.ramValue}>{memory.residentBudgetMb} MB</Text>
        </View>
        <View style={styles.ramRow}>
          <Text style={styles.ramLabel}>LMK Alert Level:</Text>
          <Text style={[styles.ramValue, { color: '#10B981', fontWeight: 'bold' }]}>
            {memory.alertLevel.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Model Manifest List */}
      <Text style={styles.sectionHeader}>On-Device Model Registry</Text>
      {models.map((m) => (
        <View key={m.model_id} style={styles.modelCard}>
          <View style={styles.modelRow}>
            <Text style={styles.modelName}>{m.model_name}</Text>
            <View style={[styles.statusBadge, m.isInstalled ? styles.installed : styles.missing]}>
              <Text style={styles.statusText}>{m.isInstalled ? 'Installed' : 'External'}</Text>
            </View>
          </View>
          <Text style={styles.modelDetail}>Task: {m.task.toUpperCase()} • Quantization: {m.quantization}</Text>
          <Text style={styles.modelDetail}>Size: {m.size_mb} MB • License: {m.license}</Text>
        </View>
      ))}

      {/* Import Model Action */}
      <TouchableOpacity style={styles.importBtn} onPress={handleImport}>
        <Text style={styles.importBtnText}>📥 Import Model File from Device Storage</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0B0F19' },
  content: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },
  subtext: { fontSize: 12, color: '#10B981', marginTop: 2 },
  ramCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#10B981',
  },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#FFFFFF', marginBottom: 10 },
  ramRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 4 },
  ramLabel: { fontSize: 13, color: '#94A3B8' },
  ramValue: { fontSize: 13, color: '#FFFFFF', fontWeight: '600' },
  sectionHeader: { fontSize: 15, fontWeight: 'bold', color: '#CBD5E1', marginBottom: 10 },
  modelCard: {
    backgroundColor: '#1E293B',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  modelRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modelName: { fontSize: 14, fontWeight: 'bold', color: '#FFFFFF', flex: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  installed: { backgroundColor: '#064E3B' },
  missing: { backgroundColor: '#475569' },
  statusText: { fontSize: 11, color: '#F3F4F6', fontWeight: '600' },
  modelDetail: { fontSize: 12, color: '#94A3B8', marginTop: 4 },
  importBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  importBtnText: { fontSize: 14, color: '#FFFFFF', fontWeight: 'bold' },
});
