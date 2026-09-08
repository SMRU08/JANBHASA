/**
 * Audio UX & State Machine Types
 * Ensures zero-audio-blob footprint on JavaScript thread.
 */

export type AudioState = 
  | 'idle'
  | 'listening'
  | 'stopping'
  | 'processing'
  | 'playing'
  | 'paused'
  | 'error';

export interface AudioMetadata {
  durationMs: number;
  sampleRate: number;
  channelCount: number;
  bitDepth: number;
  fileUri: string;
}

export interface AudioResult {
  fileUri: string;
  durationMs: number;
  format: 'wav' | 'pcm' | 'opus';
  byteSize: number;
}

export interface AudioInput {
  fileUri: string;
  sampleRate?: number;
  /** BCP-47 language hint for ASR (e.g. 'hi', 'sat'). Defaults to 'hi'. */
  languageHint?: string;
}

export interface AudioWaveformFrame {
  levels: number[]; // 8 to 16 normalized energy bars (0.0 to 1.0)
  peakRms: number;
  timestampMs: number;
}
