import { create } from 'zustand';
import { AudioState } from '../types/audio';

interface AudioStoreState {
  audioState: AudioState;
  activeAudioUri: string | null;
  waveformLevels: number[];
  error: string | null;

  setAudioState: (state: AudioState) => void;
  setActiveAudioUri: (uri: string | null) => void;
  updateWaveform: (levels: number[]) => void;
  setError: (err: string | null) => void;
  resetAudioState: () => void;
}

export const useAudioStore = create<AudioStoreState>((set) => ({
  audioState: 'idle',
  activeAudioUri: null,
  waveformLevels: [0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1],
  error: null,

  setAudioState: (audioState) => set({ audioState }),
  setActiveAudioUri: (activeAudioUri) => set({ activeAudioUri }),
  updateWaveform: (waveformLevels) => set({ waveformLevels }),
  setError: (error) => set({ error, audioState: error ? 'error' : 'idle' }),
  resetAudioState: () => set({ audioState: 'idle', activeAudioUri: null, error: null }),
}));
