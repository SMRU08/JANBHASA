/**
 * Translation Service (NMT)
 * Orchestrates text translation requests and validates language pair offline availability.
 */

import { nativeInferenceInterface } from './nativeInferenceInterface';
import { TranslationInput, TranslationResult } from '../types/inference';

export class TranslationService {
  async translateText(input: TranslationInput): Promise<TranslationResult> {
    return await nativeInferenceInterface.translate(input);
  }
}

export const translationService = new TranslationService();
