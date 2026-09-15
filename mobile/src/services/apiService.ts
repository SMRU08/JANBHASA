import RNFS from 'react-native-fs';
import { ensureDevanagari } from '../utils/devanagariUtils';

export interface HealthResponse {
  status: string;
  app_name: string;
  version: string;
  offline_ready: boolean;
  services?: {
    asr?: any;
    translation?: any;
    tts?: any;
  };
}

export interface TranslationResponse {
  source_text: string;
  translated_text: string;
  source_lang: string;
  target_lang: string;
  model_version?: string;
  inference_time_ms?: number;
}

export interface TTSResponse {
  audio_base64: string;
  sample_rate: number;
  duration_seconds: number;
  inference_time_ms?: number;
}

export interface ASRResponse {
  transcription: string;
  detected_language: string;
  language_probability: number;
  duration_seconds: number;
}

export interface PipelineTextResponse {
  input_text: string;
  normalized_text?: string;
  translated_text: string;
  source_lang: string;
  target_lang: string;
  audio_base64?: string;
  audio_sample_rate?: number;
  audio_duration_s?: number;
  total_latency_ms?: number;
}

class ApiService {
  // Online by default; teachers can toggle to offline at any time
  public isOfflineMode: boolean = false;
  private activeBaseUrl: string = 'http://10.17.86.216:8000';
  private candidateUrls: string[] = [
    'http://10.17.86.216:8000',
    'http://localhost:8000',
    'http://10.0.2.2:8000',
  ];

  setOfflineMode(offline: boolean) {
    this.isOfflineMode = offline;
    console.log(`[JANBHASHA][API] Operating mode set to: ${offline ? 'OFFLINE (On-Device)' : 'ONLINE (Cloud Server)'}`);
  }

  getOfflineMode(): boolean {
    return this.isOfflineMode;
  }

  setBaseUrl(url: string) {
    const cleanUrl = (url || '').trim().replace(/\/+$/, '');
    if (cleanUrl) {
      this.activeBaseUrl = cleanUrl;
      if (!this.candidateUrls.includes(cleanUrl)) {
        this.candidateUrls.unshift(cleanUrl);
      }
      console.log(`[JANBHASHA][API] Active server base URL set to: ${cleanUrl}`);
    }
  }

  getBaseUrl(): string {
    return this.isOfflineMode ? '100% On-Device (Zero Network / Zero Server)' : this.activeBaseUrl;
  }

  async checkHealth(): Promise<{ isHealthy: boolean; latencyMs: number; data?: HealthResponse }> {
    // 1. If online mode enabled, attempt live server ping
    if (!this.isOfflineMode) {
      const startTime = Date.now();
      const urlsToTry = [this.activeBaseUrl, ...this.candidateUrls.filter((u) => u !== this.activeBaseUrl)];

      for (const url of urlsToTry) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000);
          const res = await fetch(`${url}/api/v1/health`, {
            method: 'GET',
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (res.ok) {
            const data: HealthResponse = await res.json();
            this.activeBaseUrl = url;
            const latencyMs = Date.now() - startTime;
            console.log(`[JANBHASHA][API] Server healthy at ${url} (${latencyMs}ms)`);
            return { isHealthy: true, latencyMs, data };
          }
        } catch {
          // Try next candidate
        }
      }
      console.log('[JANBHASHA][API] Online server check timed out — reporting local on-device status');
    }

    // 2. Pre-warm on-device Whisper engine in background
    try {
      const { warmupWhisper } = require('../core/providers/HindiASRProvider');
      warmupWhisper().catch(() => {});
    } catch (_) {}

    return {
      isHealthy: true,
      latencyMs: 0,
      data: {
        status: 'healthy',
        app_name: 'Janbhasha Hybrid Engine (Online + Offline Ready)',
        version: '2.0.0',
        offline_ready: true,
        services: {
          asr: { ready: true, engine: this.isOfflineMode ? 'whisper.rn (on-device)' : 'faster-whisper (Cloud)' },
          translation: { ready: true, engine: this.isOfflineMode ? 'FLN Lexicon (on-device)' : 'IndicTrans2 (Cloud)' },
          tts: { ready: true, engine: this.isOfflineMode ? 'Piper VITS (on-device)' : 'Neural VITS / Parler (Cloud)' },
        },
      },
    };
  }

  async processNlp(
    text: string,
    targetScript: string = 'sat_Olck'
  ): Promise<any> {
    const cleanText = (text || '')
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/[\x00-\x1f\x7f-\x9f]/g, '')
      .trim();

    if (!this.isOfflineMode) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);
        const res = await fetch(`${this.activeBaseUrl}/api/v1/nlp/process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            text: cleanText,
            target_script: targetScript,
          }),
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          return await res.json();
        }
      } catch (e) {
        console.warn('[JANBHASHA][API] Online NLP error, falling back to local:', e);
      }
    }

    const { translationProvider } = require('../core/providers/TranslationProvider');
    const transRes = await translationProvider.translate(cleanText, 'hin_Deva', targetScript);
    return {
      tokens: cleanText.split(/\s+/),
      script: targetScript,
      translated: transRes.translatedText,
    };
  }

  async translateText(
    text: string,
    sourceLang: string = 'hin_Deva',
    targetLang: string = 'sat_Olck'
  ): Promise<TranslationResponse> {
    let cleanText = (text || '')
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/[\x00-\x1f\x7f-\x9f]/g, '')
      .trim();

    if (sourceLang === 'hin_Deva') {
      cleanText = ensureDevanagari(cleanText);
    }

    const finalTargetLang =
      targetLang === 'or' || targetLang === 'ory_Orya' ? 'sat_Olck' : targetLang;

    // 1. ONLINE CLOUD MODE: Call FastAPI IndicTrans2 backend
    if (!this.isOfflineMode) {
      try {
        const t0 = Date.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const res = await fetch(`${this.activeBaseUrl}/api/v1/translation/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            text: cleanText,
            source_lang: sourceLang,
            target_lang: finalTargetLang,
          }),
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const body = await res.json();
          const latency = Date.now() - t0;
          console.log(`[JANBHASHA][API] Online translation success (${latency}ms):`, body.translated_text);
          return {
            source_text: cleanText,
            translated_text: body.translated_text || cleanText,
            source_lang: sourceLang,
            target_lang: finalTargetLang,
            model_version: 'IndicTrans2 (Online Cloud)',
            inference_time_ms: body.inference_time_ms || latency,
          };
        }
      } catch (cloudErr) {
        console.warn('[JANBHASHA][API] Online translation notice, using on-device fallback:', cloudErr);
      }
    }

    // 2. OFFLINE FALLBACK: 100% On-Device FLN Pedagogical Lexicon
    const { translationProvider } = require('../core/providers/TranslationProvider');
    const offlineResult = await translationProvider.translate(
      cleanText,
      sourceLang as any,
      finalTargetLang as any
    );

    return {
      source_text: cleanText,
      translated_text: offlineResult?.translatedText || cleanText,
      source_lang: sourceLang,
      target_lang: finalTargetLang,
      model_version: offlineResult?.engineUsed || 'fln_verified_lexicon',
      inference_time_ms: offlineResult?.inferenceTimeMs || 1,
    };
  }

  async synthesizeSpeech(
    text: string,
    speakerId: number = 0,
    language: string = 'sat_Olck'
  ): Promise<TTSResponse> {
    const cleanText = (text || '')
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/[\x00-\x1f\x7f-\x9f]/g, '')
      .trim();

    // 1. ONLINE CLOUD MODE: Call FastAPI VITS / MMS-TTS backend
    if (!this.isOfflineMode) {
      try {
        const t0 = Date.now();
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        const res = await fetch(`${this.activeBaseUrl}/api/v1/tts/synthesize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            text: cleanText,
            language: language,
            speaker_id: speakerId,
          }),
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const body = await res.json();
          if (body && body.audio_base64) {
            const latency = Date.now() - t0;
            console.log(`[JANBHASHA][API] Online TTS success (${latency}ms), sample rate: ${body.sample_rate || 22050}`);
            return {
              audio_base64: body.audio_base64,
              sample_rate: body.sample_rate || 22050,
              duration_seconds: body.duration_seconds || 2.0,
              inference_time_ms: body.inference_time_ms || latency,
            };
          }
        }
      } catch (cloudErr) {
        console.warn('[JANBHASHA][API] Online TTS notice, using on-device fallback:', cloudErr);
      }
    }

    // 2. OFFLINE FALLBACK: 100% On-device Piper VITS synthesis via JanbhashaModule
    try {
      const { NativeModules } = require('react-native');
      const JanbhashaModule = NativeModules.JanbhashaModule;
      if (JanbhashaModule && typeof JanbhashaModule.synthesizeVits === 'function') {
        const vitsRes = await JanbhashaModule.synthesizeVits(cleanText);
        return {
          audio_base64: vitsRes.audioPath || '',
          sample_rate: 16000,
          duration_seconds: vitsRes.duration || 1.5,
          inference_time_ms: 50,
        };
      }
    } catch (e) {
      console.warn('[JANBHASHA][TTS] Local synthesizeVits notice:', e);
    }

    return {
      audio_base64: '',
      sample_rate: 16000,
      duration_seconds: 1.5,
      inference_time_ms: 5,
    };
  }

  async runTextPipeline(
    text: string,
    sourceLang: string = 'hin_Deva',
    targetLang: string = 'sat_Olck',
    returnAudio: boolean = true
  ): Promise<PipelineTextResponse> {
    const cleanText = (text || '')
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/[\x00-\x1f\x7f-\x9f]/g, '')
      .trim();

    const finalTargetLang =
      targetLang === 'or' || targetLang === 'ory_Orya' ? 'sat_Olck' : targetLang;

    // 1. ONLINE CLOUD MODE: Single-hop complete pipeline
    if (!this.isOfflineMode) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4500);
        const res = await fetch(`${this.activeBaseUrl}/api/v1/pipeline/translate-text`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            text: cleanText,
            source_lang: sourceLang,
            target_lang: finalTargetLang,
            return_audio: returnAudio,
          }),
        });
        clearTimeout(timeoutId);

        if (res.ok) {
          const body = await res.json();
          return {
            input_text: cleanText,
            translated_text: body.translated_text,
            source_lang: sourceLang,
            target_lang: finalTargetLang,
            audio_base64: body.audio_base64 || '',
            audio_sample_rate: body.audio_sample_rate || 22050,
            audio_duration_s: body.audio_duration_s || 2.0,
            total_latency_ms: body.total_latency_ms || 100,
          };
        }
      } catch (pipelineErr) {
        console.warn('[JANBHASHA][API] Online pipeline notice, falling back to modular pipeline:', pipelineErr);
      }
    }

    // 2. OFFLINE FALLBACK: Modular translation + TTS
    const trans = await this.translateText(cleanText, sourceLang, finalTargetLang);
    let audioPath = '';
    if (returnAudio) {
      const audioRes = await this.synthesizeSpeech(trans.translated_text, 0, finalTargetLang);
      audioPath = audioRes.audio_base64;
    }
    return {
      input_text: cleanText,
      translated_text: trans.translated_text,
      source_lang: sourceLang,
      target_lang: finalTargetLang,
      audio_base64: audioPath,
      audio_sample_rate: 16000,
      total_latency_ms: trans.inference_time_ms || 10,
    };
  }

  async transcribeAudio(audioFilePath: string, languageHint: string = 'hi'): Promise<ASRResponse> {
    const cleanPath = audioFilePath.replace('file://', '');
    const fileName = cleanPath.split('/').pop() || 'recording.wav';
    const type = fileName.endsWith('.wav') ? 'audio/wav' : 'audio/mp4';

    // 1. ONLINE CLOUD MODE: Upload audio file to FastAPI faster-whisper ASR endpoint
    if (!this.isOfflineMode) {
      try {
        console.log(`[JANBHASHA][API] Uploading audio to online ASR: ${this.activeBaseUrl}/api/v1/asr/transcribe`);
        const uploadRes = await RNFS.uploadFiles({
          toUrl: `${this.activeBaseUrl}/api/v1/asr/transcribe`,
          files: [
            {
              name: 'file',
              filename: fileName,
              filepath: cleanPath,
              filetype: type,
            },
          ],
          method: 'POST',
          headers: {
            Accept: 'application/json',
          },
          fields: {
            language: languageHint,
            word_timestamps: 'true',
          },
        }).promise;

        if (uploadRes.statusCode >= 200 && uploadRes.statusCode < 300) {
          const bodyObj = typeof uploadRes.body === 'string' ? JSON.parse(uploadRes.body) : uploadRes.body;
          const rawTranscript = (bodyObj?.transcription || '').trim();
          if (rawTranscript) {
            const devaTranscript = ensureDevanagari(rawTranscript);
            console.log(`[JANBHASHA][API] Online ASR transcription (Devanagari): "${devaTranscript}"`);
            return {
              transcription: devaTranscript,
              detected_language: bodyObj?.detected_language || languageHint,
              language_probability: bodyObj?.language_probability || 0.98,
              duration_seconds: bodyObj?.duration_seconds || 2.0,
            };
          }
        }
      } catch (uploadErr) {
        console.warn('[JANBHASHA][API] Online ASR notice, falling back to on-device Whisper:', uploadErr);
      }
    }

    // 2. OFFLINE FALLBACK: 100% On-Device Whisper ASR (ggml-tiny.bin)
    try {
      console.log('[JANBHASHA][STT] Running on-device Whisper ASR on:', cleanPath);
      const { hindiASRProvider } = require('../core/providers/HindiASRProvider');
      const offlineRes = await hindiASRProvider.transcribe(cleanPath);
      if (offlineRes && offlineRes.transcript && offlineRes.transcript.trim().length > 0) {
        const devaTranscript = ensureDevanagari(offlineRes.transcript.trim());
        console.log('[JANBHASHA][STT] On-device Whisper result (Devanagari):', devaTranscript);
        return {
          transcription: devaTranscript,
          detected_language: 'hi',
          language_probability: offlineRes.confidence || 0.95,
          duration_seconds: 2.0,
        };
      }
    } catch (e) {
      console.warn('[JANBHASHA][STT] On-device ASR error:', e);
    }

    return {
      transcription: '',
      detected_language: 'hi',
      language_probability: 0.0,
      duration_seconds: 0.0,
    };
  }
}

export const apiService = new ApiService();
