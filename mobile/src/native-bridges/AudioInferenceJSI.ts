/**
 * TypeScript definitions & wrapper for Janbhasha C++ JSI Native Bridge.
 * Bypasses legacy React Native bridge serialization for zero-copy audio and INT8 execution.
 */

declare global {
  var janbhasha_getMemoryStatus: () => {
    freeRAM_MB: number;
    isLowMemory: boolean;
    residentBudget_MB: number;
  };
  var janbhasha_processAudioBuffer: (buffer: ArrayBuffer, sampleRate: number) => number;
  var janbhasha_runVoiceToVoicePipelineAsync: (
    audioPath: string,
    srcLang: string,
    tgtLang: string,
    callback: (result: NativePipelineResult) => void
  ) => void;
}

export interface NativePipelineResult {
  transcript: string;
  translatedText: string;
  audioWavPath: string;
  latencyMs: number;
  success: boolean;
  error?: string;
}

export const AudioInferenceJSI = {
  /**
   * Reads free RAM and low-memory state directly from kernel sysinfo.
   */
  getMemoryStatus(): { freeRAM_MB: number; isLowMemory: boolean; residentBudget_MB: number } {
    if (typeof global.janbhasha_getMemoryStatus === 'function') {
      return global.janbhasha_getMemoryStatus();
    }
    // Fallback simulation for Metro web / emulator preview
    return { freeRAM_MB: 1250, isLowMemory: false, residentBudget_MB: 600 };
  },

  /**
   * Computes zero-copy RMS energy for live waveform visualizer (<5ms latency).
   */
  processAudioBuffer(buffer: ArrayBuffer, sampleRate: number = 16000): number {
    if (typeof global.janbhasha_processAudioBuffer === 'function') {
      return global.janbhasha_processAudioBuffer(buffer, sampleRate);
    }
    return Math.random() * 0.8;
  },

  /**
   * Invokes native INT8 pipeline (Whisper -> IndicTrans2 -> VITS) on background thread.
   */
  async executeVoiceToVoice(
    audioPath: string,
    srcLang: string = 'hin_Deva',
    tgtLang: string = 'sat_Olck'
  ): Promise<NativePipelineResult> {
    // 1. Try legacy global callback if available
    if (typeof global.janbhasha_runVoiceToVoicePipelineAsync === 'function') {
      return new Promise((resolve) => {
        global.janbhasha_runVoiceToVoicePipelineAsync(audioPath, srcLang, tgtLang, (res) => {
          resolve(res);
        });
      });
    }

    // 2. Try official JSI HostObject (__janbhasha)
    const jsiEngine = (global as any).__janbhasha;
    if (jsiEngine && typeof jsiEngine.runPipeline === 'function') {
      try {
        const [sLang, sScript] = srcLang.split('_');
        const [tLang, tScript] = tgtLang.split('_');
        const result = await jsiEngine.runPipeline({
          audioFileUri: audioPath,
          sourceLanguage: sLang || 'hi',
          sourceScript: sScript || 'Deva',
          targetLanguage: tLang || 'sat',
          targetScript: tScript || 'Olck',
          synthesizeSpeech: true,
        });
        return {
          transcript: result.transcript,
          translatedText: result.translatedText,
          audioWavPath: result.outputAudioUri,
          latencyMs: result.totalLatencyMs,
          success: true,
        };
      } catch (err: any) {
        return {
          transcript: '',
          translatedText: '',
          audioWavPath: '',
          latencyMs: 0,
          success: false,
          error: err.message || 'Inference failed in native engine',
        };
      }
    }

    // 3. No mock AI — report honest offline status
    return {
      transcript: '',
      translatedText: '',
      audioWavPath: '',
      latencyMs: 0,
      success: false,
      error: 'Native JSI inference engine not initialized. Please deploy to target Android hardware with provisioned model checkpoints.',
    };
  }
};
