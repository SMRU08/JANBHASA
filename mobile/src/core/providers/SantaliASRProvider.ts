import { ASRResult } from './ISpeechProvider';
import RNFS from 'react-native-fs';

export class SantaliASRProvider {
  private modelAvailable = false;
  private checked = false;

  async isModelAvailable(): Promise<boolean> {
    if (this.checked) return this.modelAvailable;
    try {
      const filesDir = RNFS.DocumentDirectoryPath;
      const santaliModelPath = `${filesDir}/models/asr/whisper-santali-olchiki`;
      const exists = await RNFS.exists(santaliModelPath);
      this.modelAvailable = exists;
    } catch {
      this.modelAvailable = false;
    }
    this.checked = true;
    return this.modelAvailable;
  }

  async transcribe(audioPath: string): Promise<ASRResult> {
    const available = await this.isModelAvailable();
    if (!available) {
      return {
        transcript: '',
        confidence: 0,
        isFinal: true,
        language: 'sat_Olck',
        status: 'unavailable',
        errorMessage: 'Santali ASR model unavailable on device storage. Genuine model required.',
      };
    }

    // In production, invoke sherpa-onnx / whisper.cpp native engine
    return {
      transcript: '',
      confidence: 0,
      isFinal: true,
      language: 'sat_Olck',
      status: 'success',
    };
  }
}

export const santaliASRProvider = new SantaliASRProvider();
