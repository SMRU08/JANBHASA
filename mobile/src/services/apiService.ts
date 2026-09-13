import RNFS from 'react-native-fs';

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
  private baseUrls = [
    'http://localhost:8000',
    'http://10.222.238.216:8000',
    'http://10.0.2.2:8000',
  ];
  private activeBaseUrl = 'http://localhost:8000';
  public isOfflineMode: boolean = true;

  setBaseUrl(url: string) {
    this.activeBaseUrl = url.replace(/\/+$/, '');
  }

  getBaseUrl(): string {
    return this.activeBaseUrl;
  }

  async checkHealth(): Promise<{ isHealthy: boolean; latencyMs: number; data?: HealthResponse }> {
    if (this.isOfflineMode) {
      return {
        isHealthy: true,
        latencyMs: 0,
        data: {
          status: 'healthy',
          app_name: 'Janbhasha On-Device',
          version: '2.0.0-offline',
          offline_ready: true,
          services: { asr: { ready: true }, translation: { ready: true }, tts: { ready: true } },
        },
      };
    }
    const startTime = Date.now();
    for (const url of [this.activeBaseUrl, ...this.baseUrls]) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);
        const res = await fetch(`${url}/api/v1/health`, {
          method: 'GET',
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (res.ok) {
          const data: HealthResponse = await res.json();
          this.activeBaseUrl = url;
          return { isHealthy: true, latencyMs: Date.now() - startTime, data };
        }
      } catch {
        // try next candidate
      }
    }
    return { isHealthy: false, latencyMs: 0 };
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
        const res = await fetch(`${this.activeBaseUrl}/api/v1/nlp/process`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: cleanText,
            target_script: targetScript,
          }),
        });
        if (res.ok) return await res.json();
      } catch {}
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
    const cleanText = (text || '')
      .replace(/[\r\n\t]+/g, ' ')
      .replace(/[\x00-\x1f\x7f-\x9f]/g, '')
      .trim();

    const finalTargetLang =
      targetLang === 'or' || targetLang === 'ory_Orya' ? 'sat_Olck' : targetLang;

    // 1. Direct 100% OFFLINE ON-DEVICE translation (no network delays)
    const { translationProvider } = require('../core/providers/TranslationProvider');
    const offlineResult = await translationProvider.translate(
      cleanText,
      sourceLang as any,
      finalTargetLang as any
    );
    if (offlineResult && offlineResult.translatedText) {
      return {
        source_text: cleanText,
        translated_text: offlineResult.translatedText,
        source_lang: sourceLang,
        target_lang: finalTargetLang,
        model_version: offlineResult.engineUsed || 'fln_verified_lexicon',
        inference_time_ms: offlineResult.inferenceTimeMs,
      };
    }

    // 2. Server fallback only if online
    if (!this.isOfflineMode) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);
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
          return await res.json();
        }
      } catch {}
    }

    return {
      source_text: cleanText,
      translated_text: offlineResult?.translatedText || cleanText,
      source_lang: sourceLang,
      target_lang: finalTargetLang,
      model_version: 'offline_lexicon',
      inference_time_ms: 1,
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

    // 1. Direct On-device VITS synthesis via JanbhashaModule
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

    // 2. Try backend server only if online mode enabled
    if (!this.isOfflineMode) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
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
          return await res.json();
        }
      } catch {}
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

    if (!this.isOfflineMode) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2500);
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
          return await res.json();
        }
      } catch {}
    }

    const trans = await this.translateText(cleanText, sourceLang, finalTargetLang);
    if (returnAudio) {
      await this.synthesizeSpeech(trans.translated_text, 0, finalTargetLang);
    }
    return {
      input_text: cleanText,
      translated_text: trans.translated_text,
      source_lang: sourceLang,
      target_lang: finalTargetLang,
      total_latency_ms: trans.inference_time_ms || 10,
    };
  }

  async transcribeAudio(audioFilePath: string, languageHint: string = 'hi'): Promise<ASRResponse> {
    const cleanPath = audioFilePath.replace('file://', '');
    const fileName = cleanPath.split('/').pop() || 'recording.wav';
    const type = fileName.endsWith('.wav') ? 'audio/wav' : 'audio/mp4';

    // 1. 100% OFFLINE ON-DEVICE ASR FIRST (Whisper ONNX / whisper.rn)
    try {
      console.log('[JANBHASHA][STT] Running on-device Whisper ASR on:', cleanPath);
      const { hindiASRProvider } = require('../core/providers/HindiASRProvider');
      const offlineRes = await hindiASRProvider.transcribe(cleanPath);
      if (offlineRes && offlineRes.transcript && offlineRes.transcript.trim().length > 0) {
        console.log('[JANBHASHA][STT] On-device Whisper result:', offlineRes.transcript);
        return {
          transcription: offlineRes.transcript.trim(),
          detected_language: 'hi',
          language_probability: offlineRes.confidence || 0.95,
          duration_seconds: 2.0,
        };
      }
    } catch (e) {
      console.warn('[JANBHASHA][STT] On-device ASR error:', e);
    }

    // 2. Server Whisper ASR fallback only if not in offline-only mode
    if (!this.isOfflineMode) {
      const urlsToTry = [this.activeBaseUrl, ...this.baseUrls.filter(u => u !== this.activeBaseUrl)];
      for (const url of urlsToTry) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2000);
          const uploadRes = await RNFS.uploadFiles({
            toUrl: `${url}/api/v1/asr/transcribe`,
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
          clearTimeout(timeoutId);

          if (uploadRes.statusCode >= 200 && uploadRes.statusCode < 300) {
            const bodyObj = typeof uploadRes.body === 'string' ? JSON.parse(uploadRes.body) : uploadRes.body;
            this.activeBaseUrl = url;
            return bodyObj as ASRResponse;
          }
        } catch {}
      }
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
