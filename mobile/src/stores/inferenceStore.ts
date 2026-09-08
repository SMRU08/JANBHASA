import { create } from 'zustand';
import { InferenceState, SpeechPipelineResult } from '../types/inference';

interface InferenceStoreState {
  inferenceState: InferenceState;
  lastResult: SpeechPipelineResult | null;
  liveTranscript: string;
  liveTranslation: string;
  error: string | null;

  setInferenceState: (state: InferenceState) => void;
  setLiveTranscript: (text: string) => void;
  setLiveTranslation: (text: string) => void;
  setLastResult: (result: SpeechPipelineResult) => void;
  setError: (err: string | null) => void;
  clearResults: () => void;
}

export const useInferenceStore = create<InferenceStoreState>((set) => ({
  inferenceState: 'idle',
  lastResult: null,
  liveTranscript: '',
  liveTranslation: '',
  error: null,

  setInferenceState: (inferenceState) => set({ inferenceState }),
  setLiveTranscript: (liveTranscript) => set({ liveTranscript }),
  setLiveTranslation: (liveTranslation) => set({ liveTranslation }),
  setLastResult: (lastResult) => set({
    lastResult,
    liveTranscript: lastResult.originalTranscript,
    liveTranslation: lastResult.translatedText,
    inferenceState: 'completed',
  }),
  setError: (error) => set({ error, inferenceState: error ? 'error' : 'idle' }),
  clearResults: () => set({ liveTranscript: '', liveTranslation: '', lastResult: null, error: null }),
}));
