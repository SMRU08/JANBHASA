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
  executeVoiceToVoice(
    audioPath: string,
    srcLang: string = 'hin_Deva',
    tgtLang: string = 'sat_Olck'
  ): Promise<NativePipelineResult> {
    return new Promise((resolve) => {
      if (typeof global.janbhasha_runVoiceToVoicePipelineAsync === 'function') {
        global.janbhasha_runVoiceToVoicePipelineAsync(audioPath, srcLang, tgtLang, (res) => {
          resolve(res);
        });
      } else {
        // High-fidelity fallback simulation when testing JS layer
        setTimeout(() => {
          resolve({
            transcript: 'नमस्ते, आप सब कैसे हैं?',
            translatedText: 'ᱡᱚᱦᱟᱨ, ᱟᱯᱮ ᱡᱚᱛᱚ ᱪᱮᱫ ᱞᱮᱠᱟ ᱢᱮᱱᱟᱜ ᱯᱮᱭᱟ?',
            audioWavPath: 'file:///data/user/0/com.janbhasha/cache/vits_output.wav',
            latencyMs: 1480,
            success: true
          });
        }, 1500);
      }
    });
  }
};
