/**
 * Speech Service (ASR)
 * Manages voice recording commands and dispatches audio to the native layer.
 */

import { nativeInferenceInterface } from './nativeInferenceInterface';
import { ASRResult, AudioResult } from '../types';

export class SpeechService {
  async startRecording(): Promise<void> {
    await nativeInferenceInterface.startRecording();
  }

  async stopRecording(): Promise<AudioResult> {
    return await nativeInferenceInterface.stopRecording();
  }

  async transcribeAudio(fileUri: string): Promise<ASRResult> {
    return await nativeInferenceInterface.transcribe({ fileUri });
  }
}

export const speechService = new SpeechService();
