import { ASRResult } from './ISpeechProvider';
import RNFS from 'react-native-fs';
import { NativeModules } from 'react-native';
import { ensureDevanagari } from '../../utils/devanagariUtils';

const { JanbhashaModule } = NativeModules;

let whisperContext: any = null;
let initPromise: Promise<any> | null = null;
let jsiInstallAttempted = false;

function logSTT(message: string): void {
  console.log(`[JANBHASHA][STT] ${message}`);
  try {
    JanbhashaModule?.log('STT', message);
  } catch (_) {}
}

/**
 * Explicitly install whisper.rn JSI bindings.
 * Must be called BEFORE initWhisper.
 */
async function ensureJsiInstalled(): Promise<boolean> {
  if (jsiInstallAttempted) return true;
  jsiInstallAttempted = true;
  try {
    const { installJsi } = require('whisper.rn');
    await installJsi();
    logSTT('whisper.rn JSI bindings installed successfully');
    return true;
  } catch (e: any) {
    logSTT(`whisper.rn JSI install warning: ${e?.message || e}`);
    // Try explicit install via NativeModules.RNWhisper as fallback
    try {
      const { NativeModules: NM } = require('react-native');
      const rnWhisper = NM.RNWhisper;
      if (rnWhisper && typeof rnWhisper.install === 'function') {
        await rnWhisper.install();
        logSTT('RNWhisper.install() called via NativeModules fallback');
        // Re-try installJsi now that native binding is present
        try {
          const { installJsi } = require('whisper.rn');
          await installJsi();
          logSTT('whisper.rn JSI bindings installed via fallback');
          return true;
        } catch (e2: any) {
          logSTT(`whisper.rn JSI fallback install warning: ${e2?.message || e2}`);
        }
      }
    } catch (fe: any) {
      logSTT(`RNWhisper fallback install error: ${fe?.message || fe}`);
    }
    return false;
  }
}

/**
 * Resolve the on-device Whisper model path.
 */
async function resolveModelPath(): Promise<string> {
  let nativeModelsDir = '';
  try {
    if (JanbhashaModule && typeof JanbhashaModule.getModelsPath === 'function') {
      nativeModelsDir = await JanbhashaModule.getModelsPath();
      logSTT(`Native models dir: ${nativeModelsDir}`);
    }
  } catch (ne: any) {
    logSTT(`getModelsPath error: ${ne?.message || ne}`);
  }

  const candidatePaths = [
    nativeModelsDir ? `${nativeModelsDir}/ggml-tiny.bin` : '',
    nativeModelsDir ? `${nativeModelsDir}/asr/ggml-tiny.bin` : '',
    `${RNFS.ExternalDirectoryPath}/models/ggml-tiny.bin`,
    '/sdcard/Android/data/com.janbhasha/files/models/ggml-tiny.bin',
    '/storage/emulated/0/Android/data/com.janbhasha/files/models/ggml-tiny.bin',
    `${RNFS.DocumentDirectoryPath}/models/ggml-tiny.bin`,
    '/sdcard/Janbhasha/models/ggml-tiny.bin',
    '/storage/emulated/0/Janbhasha/models/ggml-tiny.bin',
  ].filter(Boolean);

  for (const p of candidatePaths) {
    try {
      const exists = await RNFS.exists(p);
      if (exists) {
        const stat = await RNFS.stat(p);
        if (stat.size > 10 * 1024 * 1024) {
          logSTT(`Valid model found (${Math.round(stat.size / (1024 * 1024))} MB) at: ${p}`);
          return p;
        } else {
          logSTT(`Skipping incomplete model at ${p} (${stat.size} bytes)`);
        }
      }
    } catch (_) {}
  }

  logSTT('No valid ggml-tiny.bin found on device');
  return '';
}

/**
 * Initialize Whisper context (singleton, deduped).
 */
async function getOrInitWhisperContext(): Promise<any> {
  if (whisperContext) return whisperContext;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // Step 1: ensure JSI is installed
      await ensureJsiInstalled();

      // Step 2: find the model file
      const modelPath = await resolveModelPath();
      if (!modelPath) {
        logSTT('Cannot initialize Whisper: no model file found');
        return null;
      }

      // Step 3: init whisper context
      logSTT(`Initializing Whisper context from: ${modelPath}`);
      const { initWhisper } = require('whisper.rn');
      const ctx = await initWhisper({ filePath: modelPath });
      logSTT('Whisper context initialized successfully');
      whisperContext = ctx;
      return ctx;
    } catch (err: any) {
      logSTT(`Whisper init error: ${err?.message || err}`);
      return null;
    } finally {
      initPromise = null; // Reset so next call retries if it failed
    }
  })();

  return initPromise;
}

/**
 * Pre-warm the Whisper engine in background (call on app/screen mount).
 */
export async function warmupWhisper(): Promise<void> {
  try {
    logSTT('Pre-warming Whisper engine...');
    await getOrInitWhisperContext();
  } catch (_) {}
}

export class HindiASRProvider {
  async transcribe(audioPath: string): Promise<ASRResult> {
    const cleanPath = audioPath.replace('file://', '');
    logSTT(`transcribe() called with: ${cleanPath}`);

    // Validate audio file exists
    try {
      const exists = await RNFS.exists(cleanPath);
      if (exists) {
        const stat = await RNFS.stat(cleanPath);
        logSTT(`Audio file: ${stat.size} bytes`);
        if (stat.size <= 44) {
          logSTT('Audio file is empty (WAV header only) — recording captured no audio data');
          return {
            transcript: '',
            confidence: 0.0,
            isFinal: true,
            language: 'hin_Deva',
            status: 'unavailable',
          };
        }
      } else {
        logSTT(`Audio file NOT FOUND at: ${cleanPath}`);
        return {
          transcript: '',
          confidence: 0.0,
          isFinal: true,
          language: 'hin_Deva',
          status: 'error',
        };
      }
    } catch (fsErr: any) {
      logSTT(`Audio file check error: ${fsErr?.message || fsErr}`);
    }

    // PATH 1: whisper.rn on-device Whisper
    try {
      const ctx = await getOrInitWhisperContext();
      if (ctx) {
        logSTT('Running whisper.rn transcription...');
        const { promise } = ctx.transcribe(cleanPath, {
          language: 'hi',
          maxThreads: 4,
          beamSize: 1,
          temperature: 0.0,
          translate: false,
          prompt: 'नमस्ते। आप कैसे हैं? तुम कहाँ जा रहे हो? क्या कर रहे हो? मुझे पानी पीना है। खाना खा लो। बच्चे मैदान में खेल रहे हैं। किताब खोलो और पढ़ो। ध्यान से सुनो।',
        });

        // 60-second timeout for transcription
        const transcribeResult = await Promise.race([
          promise,
          new Promise<null>((_, reject) =>
            setTimeout(() => reject(new Error('Whisper transcription timeout after 60s')), 60000)
          ),
        ]);

        const rawResult = (transcribeResult as any)?.result || '';
        logSTT(`Whisper raw result: "${rawResult}"`);

        const cleanResult = rawResult
          .replace(/\[.*?\]/g, '')
          .replace(/\(.*?\)/g, '')
          .replace(/^\s*\.\s*$/, '')
          .trim();

        if (cleanResult.length > 0) {
          const finalTranscript = ensureDevanagari(cleanResult);
          logSTT(`Whisper transcribed (Devanagari): "${finalTranscript}" (raw: "${cleanResult}")`);
          return {
            transcript: finalTranscript,
            confidence: 0.95,
            isFinal: true,
            language: 'hin_Deva',
            status: 'success',
          };
        } else {
          // Empty result is normal (silence / too short) — do NOT reset context
          // Resetting would cause 30-60s re-init penalty on every empty result
          logSTT('Whisper returned empty or silence-only result — keeping context alive for next call');
        }
      } else {
        logSTT('Whisper context is null — JSI install may have failed');
      }
    } catch (wErr: any) {
      logSTT(`whisper.rn transcribe error: ${wErr?.message || wErr}`);
      // Only reset context on actual hard errors (not timeouts — those recover)
      if (wErr?.message && !wErr.message.includes('timeout')) {
        whisperContext = null;
        logSTT('Whisper context reset due to hard error');
      }
    }

    // PATH 2: JSI global.__janbhasha.transcribe (native C++ bridge)
    try {
      const g = global as unknown as { __janbhasha?: any };
      if (g.__janbhasha && typeof g.__janbhasha.transcribe === 'function') {
        logSTT('Trying native JSI __janbhasha.transcribe...');
        const nativeRes = await g.__janbhasha.transcribe(cleanPath, 'hi');
        if (nativeRes?.transcript && !nativeRes.transcript.includes('PLACEHOLDER')) {
          const finalTranscript = ensureDevanagari(nativeRes.transcript.trim());
          logSTT(`JSI transcribed (Devanagari): "${finalTranscript}"`);
          return {
            transcript: finalTranscript,
            confidence: nativeRes.confidence || 0.9,
            isFinal: true,
            language: 'hin_Deva',
            status: 'success',
          };
        }
      }
    } catch (jsiErr: any) {
      logSTT(`JSI transcribe error: ${jsiErr?.message || jsiErr}`);
    }

    logSTT('All ASR engines exhausted — no transcript produced');
    return {
      transcript: '',
      confidence: 0.0,
      isFinal: true,
      language: 'hin_Deva',
      status: 'unavailable',
    };
  }
}

export const hindiASRProvider = new HindiASRProvider();
