import { create } from 'zustand';
import { ModelId, ModelLifecycleState, ModelMetadata } from '../types/model';

interface ModelStoreState {
  models: Record<ModelId, ModelMetadata>;
  overallState: ModelLifecycleState;

  setModelLifecycle: (id: ModelId, state: ModelLifecycleState, error?: string) => void;
  setOverallState: (state: ModelLifecycleState) => void;
}

export const useModelStore = create<ModelStoreState>((set) => ({
  models: {
    whisper_int8: {
      id: 'whisper_int8',
      name: 'Faster-Whisper (ASR)',
      version: '1.0-int8',
      quantization: 'int8',
      estimatedRamUsageMb: 145,
      fileSizeBytes: 140000000,
      state: 'unavailable',
    },
    indictrans2_int8: {
      id: 'indictrans2_int8',
      name: 'IndicTrans2 (NMT)',
      version: '320M-dist-int8',
      quantization: 'int8',
      estimatedRamUsageMb: 185,
      fileSizeBytes: 180000000,
      state: 'unavailable',
    },
    vits_int8: {
      id: 'vits_int8',
      name: 'VITS MMS-TTS (Speech)',
      version: 'mms-int8',
      quantization: 'int8',
      estimatedRamUsageMb: 78,
      fileSizeBytes: 75000000,
      state: 'unavailable',
    },
  },
  overallState: 'unavailable',

  setModelLifecycle: (id, state, error) =>
    set((s) => ({
      models: {
        ...s.models,
        [id]: { ...s.models[id], state, error },
      },
    })),
  setOverallState: (overallState) => set({ overallState }),
}));
