/**
 * Model State & Hardware Memory Contract Types
 */

import { MemoryAlertLevel, MemoryStats } from './memory';
export * from './memory';

export type ModelLifecycleState =
  | 'unavailable'
  | 'loading'
  | 'loaded'
  | 'running'
  | 'unloading'
  | 'error';

export type ModelId = 'whisper_int8' | 'indictrans2_int8' | 'vits_int8';

export interface ModelMetadata {
  id: ModelId;
  name: string;
  version: string;
  quantization: 'int8';
  estimatedRamUsageMb: number;
  fileSizeBytes: number;
  state: ModelLifecycleState;
  error?: string;
}
