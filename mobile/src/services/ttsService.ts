/**
 * Text-to-Speech Service (TTS)
 * Dispatches synthesis requests to the native layer without loading audio into JS memory.
 */

import { nativeInferenceInterface } from './nativeInferenceInterface';
import { TTSInput } from '../types/inference';
import { AudioResult } from '../types/audio';

export class TTSService {
  async synthesizeToAudio(input: TTSInput): Promise<AudioResult> {
    return await nativeInferenceInterface.synthesize(input);
  }
}

export const ttsService = new TTSService();
