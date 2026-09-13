import { ASRResult } from './ISpeechProvider';
import RNFS from 'react-native-fs';
import { NativeModules } from 'react-native';

let whisperContext: any = null;
let initPromise: Promise<any> | null = null;

function logSTT(message: string): void {
  console.log(`[JANBHASHA][STT] ${message}`);
  try {
    NativeModules.JanbhashaModule?.log('STT', message);
  } catch (_) {}
}

async function getOrInitWhisperContext(): Promise<any> {
  if (whisperContext) return whisperContext;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const { initWhisper } = require('whisper.rn');

      // 1. Check native module reported models directory first
      let nativeModelsDir = '';
      try {
        if (NativeModules.JanbhashaModule && typeof NativeModules.JanbhashaModule.getModelsPath === 'function') {
          nativeModelsDir = await NativeModules.JanbhashaModule.getModelsPath();
          logSTT(`Native models dir reported as: ${nativeModelsDir}`);
        }
      } catch (ne: any) {
        logSTT(`JanbhashaModule.getModelsPath error: ${ne?.message || ne}`);
      }

      const candidatePaths = [
        nativeModelsDir ? `${nativeModelsDir}/ggml-tiny.bin` : '',
        nativeModelsDir ? `${nativeModelsDir}/asr/whisper-small-ct2/ggml-tiny.bin` : '',
        nativeModelsDir ? `${nativeModelsDir}/asr/ggml-tiny.bin` : '',
        `${RNFS.ExternalDirectoryPath}/models/ggml-tiny.bin`,
        `${RNFS.ExternalDirectoryPath}/models/asr/ggml-tiny.bin`,
        '/sdcard/Android/data/com.janbhasha/files/models/ggml-tiny.bin',
        '/storage/emulated/0/Android/data/com.janbhasha/files/models/ggml-tiny.bin',
        `${RNFS.DocumentDirectoryPath}/models/ggml-tiny.bin`,
        `${RNFS.DocumentDirectoryPath}/models/asr/ggml-tiny.bin`,
        '/sdcard/Janbhasha/models/ggml-tiny.bin',
        '/storage/emulated/0/Janbhasha/models/ggml-tiny.bin',
      ].filter(Boolean);

      let modelPath = '';
      for (const p of candidatePaths) {
        try {
          const exists = await RNFS.exists(p);
          if (exists) {
            const stat = await RNFS.stat(p);
            if (stat.size > 10 * 1024 * 1024) {
              modelPath = p;
              logSTT(`Valid Whisper model found (${Math.round(stat.size / (1024 * 1024))} MB) at: ${p}`);
              break;
            } else {
              logSTT(`Skipping incomplete model at ${p} (size: ${stat.size} bytes)`);
            }
          }
        } catch (checkErr: any) {
          logSTT(`Error checking path ${p}: ${checkErr?.message || checkErr}`);
        }
      }

      if (modelPath) {
        logSTT(`Initializing on-device Whisper from: ${modelPath}`);
        whisperContext = await initWhisper({ filePath: modelPath });
        logSTT('Whisper engine initialized successfully');
        return whisperContext;
      } else {
        logSTT('No valid ggml-tiny.bin found on device storage');
      }
    } catch (err: any) {
      logSTT(`Whisper on-device init error: ${err?.message || err}`);
    } finally {
      initPromise = null;
    }
    return null;
  })();

  return initPromise;
}

export class HindiASRProvider {
  async transcribe(audioPath: string): Promise<ASRResult> {
    const cleanPath = audioPath.replace('file://', '');
    logSTT(`Transcribing audio file at: ${cleanPath}`);

    try {
      const exists = await RNFS.exists(cleanPath);
      if (exists) {
        const stat = await RNFS.stat(cleanPath);
        logSTT(`Audio file confirmed (${stat.size} bytes)`);
      } else {
        logSTT(`Audio file not found at ${cleanPath}`);
      }
    } catch (fsErr: any) {
      logSTT(`Audio file check warning: ${fsErr?.message || fsErr}`);
    }

    // 1. Try on-device Whisper (whisper.rn / whisper.cpp) if local model file exists
    try {
      const ctx = await getOrInitWhisperContext();
      if (ctx) {
        logSTT('Calling ctx.transcribe()...');
        const { promise } = ctx.transcribe(cleanPath, {
          language: 'hi',
          maxThreads: 4,
          beamSize: 1,
          temperature: 0.0,
          translate: false,
        });
        const transcribeResult = await promise;
        const rawResult = transcribeResult?.result || '';
        logSTT(`Whisper raw transcript: "${rawResult}"`);

        const cleanResult = rawResult
          .replace(/\[.*?\]/g, '')
          .replace(/\(.*?\)/g, '')
          .trim();

        if (cleanResult.length > 0) {
          logSTT(`Recognized speech: "${cleanResult}"`);
          return {
            transcript: cleanResult,
            confidence: 0.95,
            isFinal: true,
            language: 'hin_Deva',
            status: 'success',
          };
        } else {
          logSTT('Whisper returned empty transcript or only silence/special tokens');
        }
      } else {
        logSTT('Whisper context is null; cannot run on-device Whisper');
      }
    } catch (wErr: any) {
      logSTT(`whisper.rn transcribe notice: ${wErr?.message || wErr}`);
    }

    // 2. Try JSI native Whisper if available
    try {
      const g = global as unknown as { __janbhasha?: any };
      if (g.__janbhasha && typeof g.__janbhasha.transcribe === 'function') {
        const nativeRes = await g.__janbhasha.transcribe(audioPath, 'hi');
        if (nativeRes && nativeRes.transcript && !nativeRes.transcript.includes('PLACEHOLDER')) {
          logSTT(`Native JSI recognized text: ${nativeRes.transcript.trim()}`);
          return {
            transcript: nativeRes.transcript.trim(),
            confidence: nativeRes.confidence || 0.95,
            isFinal: true,
            language: 'hin_Deva',
            status: 'success',
          };
        }
      }
    } catch (e: any) {
      logSTT(`Native ASR transcribe error: ${e?.message || e}`);
    }

    logSTT('No transcript produced by offline ASR engines');
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

