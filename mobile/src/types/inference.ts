/**
 * Inference State & Data Contract Types
 */

import { LanguageCode, ScriptCode } from './language';
import { AudioResult } from './audio';

export type InferenceState =
  | 'idle'
  | 'processing_asr'
  | 'processing_translation'
  | 'processing_tts'
  | 'completed'
  | 'error';

export interface ASRResult {
  transcript: string;
  detectedLanguage?: LanguageCode;
  confidence: number;
  durationMs: number;
  wordTimestamps?: Array<{
    word: string;
    startMs: number;
    endMs: number;
  }>;
}

export interface TranslationInput {
  text: string;
  sourceLanguage: LanguageCode;
  sourceScript: ScriptCode;
  targetLanguage: LanguageCode;
  targetScript: ScriptCode;
}

export interface TranslationResult {
  sourceText: string;
  translatedText: string;
  sourceLanguage: LanguageCode;
  targetLanguage: LanguageCode;
  targetScript: ScriptCode;
  latencyMs: number;
}

export interface TTSInput {
  text: string;
  language: LanguageCode;
  script: ScriptCode;
  speakingRate?: number;
  speakerId?: number;
}

export interface SpeechPipelineInput {
  audioFileUri: string;
  sourceLanguage: LanguageCode;
  sourceScript: ScriptCode;
  targetLanguage: LanguageCode;
  targetScript: ScriptCode;
  synthesizeSpeech: boolean;
}

export interface SpeechPipelineResult {
  originalTranscript: string;
  translatedText: string;
  audioResult?: AudioResult;
  totalLatencyMs: number;
  breakdown: {
    asrLatencyMs: number;
    translationLatencyMs: number;
    ttsLatencyMs: number;
  };
}
