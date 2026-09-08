/**
 * Inference Service Orchestrator
 * High-level service mediating between UI and individual speech/NMT/TTS operations.
 */

import { speechService } from './speechService';
import { translationService } from './translationService';
import { ttsService } from './ttsService';
import { nativeInferenceInterface } from './nativeInferenceInterface';
import { SpeechPipelineInput, SpeechPipelineResult } from '../types/inference';

export class InferenceService {
  async executeFullSpeechPipeline(input: SpeechPipelineInput): Promise<SpeechPipelineResult> {
    return await nativeInferenceInterface.speechToSpeech(input);
  }
}

export const inferenceService = new InferenceService();
