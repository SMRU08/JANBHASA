/**
 * Native Inference Interface Contract for Phase 7
 * 
 * Strict Boundary:
 * This file declares ONLY the TypeScript contract.
 * No C++ JSI or native library implementation is allowed in Phase 7.
 * Phase 8 will bind this interface to the C++ runtime.
 */

import { AudioResult, AudioInput } from './audio';
import { ASRResult, TranslationInput, TranslationResult, TTSInput, SpeechPipelineInput, SpeechPipelineResult } from './inference';
import { ModelId, ModelMetadata, MemoryStats } from './model';
import { LanguagePair } from './language';

export interface NativeEngineStatus {
  isInitialized: boolean;
  modelsLoaded: Record<ModelId, boolean>;
  memoryStats: MemoryStats;
  supportedPairs: LanguagePair[];
}

export interface NativeInferenceEngine {
  initialize(): Promise<void>;
  getStatus(): NativeEngineStatus;
  startRecording(): Promise<void>;
  stopRecording(): Promise<AudioResult>;
  transcribe(audio: AudioInput): Promise<ASRResult>;
  translate(input: TranslationInput): Promise<TranslationResult>;
  synthesize(input: TTSInput): Promise<AudioResult>;
  speechToSpeech(input: SpeechPipelineInput): Promise<SpeechPipelineResult>;
  releaseModels(): Promise<void>;
  getMemoryStats(): MemoryStats;
}
