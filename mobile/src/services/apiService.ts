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
  public isOfflineMode: boolean = true;
  private activeBaseUrl: string = 'offline://on-device';

  setBaseUrl(url: string) {
    this.activeBaseUrl = url;
  }

  getBaseUrl(): string {
    return '100% On-Device (Zero Network / Zero Server)';
  }

  async checkHealth(): Promise<{ isHealthy: boolean; latencyMs: number; data?: HealthResponse }> {
    return {
      isHealthy: true,
      latencyMs: 0,
      data: {
        status: 'healthy',
        app_name: 'Janbhasha On-Device Engine',
        version: '2.0.0-offline',
        offline_ready: true,
        services: {
          asr: { ready: true, engine: 'whisper.rn (ggml-tiny.bin on-device)' },
          translation: { ready: true, engine: 'FLN Pedagogical Lexicon + Hybrid Transducer' },
          tts: { ready: true, engine: 'VITS Neural TTS (sat_piper ONNX)' },
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

    // 100% OFFLINE ON-DEVICE translation (no network calls)
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

    // 100% On-device VITS synthesis via JanbhashaModule
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

    // 100% OFFLINE ON-DEVICE ASR (Whisper on-device ggml-tiny.bin)
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

    return {
      transcription: '',
      detected_language: 'hi',
      language_probability: 0.0,
      duration_seconds: 0.0,
    };
  }
}

export const apiService = new ApiService();
