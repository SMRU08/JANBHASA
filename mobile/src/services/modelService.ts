/**
 * Model Service
 * Manages model lifecycle states (unloaded -> loading -> loaded) and telemetry.
 */

import { nativeInferenceInterface } from './nativeInferenceInterface';
import { ModelId, MemoryStats } from '../types/model';

export class ModelService {
  async initializeNativeEngine(): Promise<void> {
    await nativeInferenceInterface.initialize();
  }

  getMemoryStats(): MemoryStats {
    return nativeInferenceInterface.getMemoryStats();
  }

  async releaseModels(): Promise<void> {
    await nativeInferenceInterface.releaseModels();
  }
}

export const modelService = new ModelService();
