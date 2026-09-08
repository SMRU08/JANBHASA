import { create } from 'zustand';

export interface ClassroomHistoryItem {
  id: string;
  timestamp: number;
  hindiText: string;
  santhaliOlChiki: string;
  audioWavUri?: string;
  latencyMs: number;
}

interface ClassroomState {
  isRecording: boolean;
  isProcessing: boolean;
  isPlayingAudio: boolean;
  currentInputText: string;
  currentOutputText: string;
  activeAudioUri: string | null;
  history: ClassroomHistoryItem[];
  audioWaveformLevels: number[];

  // Actions
  setIsRecording: (recording: boolean) => void;
  setIsProcessing: (processing: boolean) => void;
  setIsPlayingAudio: (playing: boolean) => void;
  setLiveTranslation: (hindi: string, santhali: string, audioUri?: string, latencyMs?: number) => void;
  updateWaveform: (level: number) => void;
  clearHistory: () => void;
}

export const useClassroomStore = create<ClassroomState>((set, get) => ({
  isRecording: false,
  isProcessing: false,
  isPlayingAudio: false,
  currentInputText: '',
  currentOutputText: '',
  activeAudioUri: null,
  history: [],
  audioWaveformLevels: [0.1, 0.2, 0.15, 0.3, 0.2, 0.4, 0.25, 0.1],

  setIsRecording: (isRecording) => set({ isRecording }),
  setIsProcessing: (isProcessing) => set({ isProcessing }),
  setIsPlayingAudio: (isPlayingAudio) => set({ isPlayingAudio }),

  setLiveTranslation: (hindi, santhali, audioUri, latencyMs = 0) => {
    const newItem: ClassroomHistoryItem = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      hindiText: hindi,
      santhaliOlChiki: santhali,
      audioWavUri: audioUri,
      latencyMs,
    };
    set((state) => ({
      currentInputText: hindi,
      currentOutputText: santhali,
      activeAudioUri: audioUri || null,
      history: [newItem, ...state.history.slice(0, 19)], // Limit to 20 items to conserve 2GB RAM
    }));
  },

  updateWaveform: (level) => {
    set((state) => {
      const next = [...state.audioWaveformLevels.slice(1), level];
      return { audioWaveformLevels: next };
    });
  },

  clearHistory: () => set({ history: [], currentInputText: '', currentOutputText: '' }),
}));
