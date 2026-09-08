/**
 * AudioInferenceJSI.ts
 *
 * Typed TypeScript wrapper around the C++ JSI global `global.__janbhasha`.
 *
 * This module is the ONLY place in the TypeScript codebase that
 * references `global.__janbhasha`. All other services go through this.
 *
 * THREAD SAFETY CONTRACT (from C++ layer):
 *   - All methods return Promises resolved on the JS thread via CallInvoker.
 *   - The JS thread is never blocked.
 *   - Audio data NEVER enters the JS heap — only file:// URIs cross the boundary.
 */

import { NativeModules } from 'react-native';
import type {
  ASRResult,
  TranslationInput,
  TranslationResult,
  TTSInput,
  SpeechPipelineInput,
  SpeechPipelineResult,
} from '../types/inference';
import type { MemoryStats } from '../types/memory';
import type { AudioResult } from '../types/audio';

// ---- Engine config -------------------------------------------------

export interface NativeEngineConfig {
  /** Absolute path to models/ directory on device internal storage. */
  modelsBasePath: string;
  /** Absolute path to model_manifest.json. */
  manifestPath: string;
  /** Absolute path to cache directory for temp WAV files. */
  cacheDir: string;
}

// ---- Status --------------------------------------------------------

export interface NativeEngineStatus {
  isInitialized: boolean;
  freeRamMb: number;
  availableRamMb: number;
  processRssMb: number;
}

// ---- JSI global interface ------------------------------------------

interface JanbhashaGlobal {
  initialize(config: NativeEngineConfig): Promise<void>;
  getMemoryStats(): Promise<MemoryStats>;
  getStatus(): NativeEngineStatus; // synchronous
  startRecording(): Promise<void>;
  stopRecording(): Promise<string>; // returns file:// URI
  transcribe(fileUri: string, langHint: string): Promise<ASRResult>;
  translate(
    text: string,
    srcLang: string,
    srcScript: string,
    tgtLang: string,
    tgtScript: string
  ): Promise<TranslationResult>;
  synthesize(
    text: string,
    lang: string,
    script: string,
    outputPath: string
  ): Promise<{ outputFileUri: string; durationMs: number }>;
  runPipeline(input: {
    audioFileUri: string;
    sourceLanguage: string;
    sourceScript: string;
    targetLanguage: string;
    targetScript: string;
    synthesizeSpeech: boolean;
  }): Promise<SpeechPipelineResult>;
  cancelPipeline(): void;
  release(): Promise<void>;
}

// ---- State ---------------------------------------------------------

let _installed = false;

// ---- Install -------------------------------------------------------

/**
 * Install the JSI module into the Hermes runtime.
 * Must be called once on app startup before any inference.
 * Internally calls `NativeModules.JanbhashaModule.installJSI()`.
 */
export async function installJSI(): Promise<void> {
  if (_installed) return;

  const janbhashaModule = NativeModules.JanbhashaModule;
  if (!janbhashaModule?.installJSI) {
    throw new Error(
      'JanbhashaModule not registered. ' +
        'Add JanbhashaPackage to MainApplication.kt.'
    );
  }

  await janbhashaModule.installJSI();
  _installed = true;
}

// ---- Global accessor -----------------------------------------------

function getJSIGlobal(): JanbhashaGlobal {
  const g = global as unknown as { __janbhasha?: JanbhashaGlobal };
  if (!g.__janbhasha) {
    throw new Error(
      'global.__janbhasha is not installed. ' +
        'Call AudioInferenceJSI.installJSI() first.'
    );
  }
  return g.__janbhasha;
}

// ---- Public API ----------------------------------------------------

/** Initialize the native engine with paths to model assets. */
export async function initializeEngine(config: NativeEngineConfig): Promise<void> {
  return getJSIGlobal().initialize(config);
}

/** Get synchronous engine status (memory, init state). */
export function getEngineStatus(): NativeEngineStatus {
  return getJSIGlobal().getStatus();
}

/** Get async memory statistics from /proc/meminfo. */
export async function getMemoryStats(): Promise<MemoryStats> {
  return getJSIGlobal().getMemoryStats();
}

/** Start microphone recording via AAudio. */
export async function startRecording(): Promise<void> {
  return getJSIGlobal().startRecording();
}

/**
 * Stop recording and return the output file URI.
 * Audio bytes NEVER cross into JS heap — only the URI string does.
 */
export async function stopRecording(): Promise<string> {
  return getJSIGlobal().stopRecording();
}

/** Transcribe a WAV file at the given file:// URI. */
export async function transcribe(
  fileUri: string,
  langHint: string = 'hi'
): Promise<ASRResult> {
  return getJSIGlobal().transcribe(fileUri, langHint);
}

/** Translate text between languages. */
export async function translate(input: TranslationInput): Promise<TranslationResult> {
  return getJSIGlobal().translate(
    input.text,
    input.sourceLanguage,
    input.sourceScript,
    input.targetLanguage,
    input.targetScript
  );
}

/** Synthesize speech from text. Returns output file URI. */
export async function synthesize(
  input: TTSInput,
  outputPath: string
): Promise<AudioResult> {
  const result = await getJSIGlobal().synthesize(
    input.text,
    input.language,
    input.script,
    outputPath
  );
  return {
    fileUri: result.outputFileUri,
    durationMs: result.durationMs,
    format: 'wav',
    byteSize: 0, // not tracked at this layer
  };
}

/**
 * Run the full speech-to-speech pipeline.
 * Input: file:// URI to WAV recorded audio.
 * Output: SpeechPipelineResult with translated text + output audio URI.
 */
export async function runPipeline(
  input: SpeechPipelineInput
): Promise<SpeechPipelineResult> {
  return getJSIGlobal().runPipeline({
    audioFileUri: input.audioFileUri,
    sourceLanguage: input.sourceLanguage,
    sourceScript: input.sourceScript,
    targetLanguage: input.targetLanguage,
    targetScript: input.targetScript,
    synthesizeSpeech: input.synthesizeSpeech,
  });
}

/** Cancel the currently running pipeline (applies at next stage boundary). */
export function cancelPipeline(): void {
  const g = global as unknown as { __janbhasha?: JanbhashaGlobal };
  g.__janbhasha?.cancelPipeline();
}

/** Release all native resources. */
export async function releaseEngine(): Promise<void> {
  return getJSIGlobal().release();
}

/** Whether the JSI module has been installed. */
export function isInstalled(): boolean {
  return _installed;
}
