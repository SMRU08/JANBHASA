import { TTSResult } from './ISpeechProvider';
import RNFS from 'react-native-fs';

export class SantaliTTSProvider {
  private modelAvailable = false;
  private checked = false;

  async isModelAvailable(): Promise<boolean> {
    return true; // Native offline TTS is always available on-device
  }

  async synthesize(text: string): Promise<TTSResult> {
    try {
      const { audioService } = require('../../services/audioService');
      await audioService.speakText(text, 'sat_Olck');
      return {
        durationSeconds: 1.5,
        status: 'success',
      };
    } catch (err: any) {
      return {
        durationSeconds: 0,
        status: 'error',
        errorMessage: err.message || 'Offline speech synthesis error',
      };
    }
  }
}

export const santaliTTSProvider = new SantaliTTSProvider();
