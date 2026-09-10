import RNFS from 'react-native-fs';

export interface ModelInfo {
  model_id: string;
  model_name: string;
  task: 'asr' | 'translation' | 'tts';
  language: string;
  size_mb: number;
  quantization: string;
  license: string;
  isInstalled: boolean;
  sha256?: string;
}

export class ModelManager {
  private models: ModelInfo[] = [
    {
      model_id: 'whisper_santali_olchiki',
      model_name: 'Whisper Small Santali (Ol Chiki)',
      task: 'asr',
      language: 'sat_Olck',
      size_mb: 75.0,
      quantization: 'INT8 ONNX / whisper.cpp',
      license: 'Apache-2.0',
      isInstalled: false,
    },
    {
      model_id: 'indictrans2_santali_tiny',
      model_name: 'IndicTrans2 Hindi-Santali Distilled',
      task: 'translation',
      language: 'hin-sat',
      size_mb: 180.0,
      quantization: 'INT8 ONNX',
      license: 'MIT',
      isInstalled: false,
    },
    {
      model_id: 'indictts_santali_mono',
      model_name: 'IndicTTS Santali Mono Male (Phase 3)',
      task: 'tts',
      language: 'sat_Olck',
      size_mb: 58.4,
      quantization: 'INT8 ONNX Piper/VITS',
      license: 'CC-BY-4.0',
      isInstalled: false,
    },
    {
      model_id: 'adibhasha_offline_lexicon',
      model_name: 'AdiBhasha Offline Domain Transducer',
      task: 'translation',
      language: 'hin-sat',
      size_mb: 1.8,
      quantization: 'In-Memory Indexed Trie',
      license: 'CC-BY-NC-SA 4.0 (Research)',
      isInstalled: true,
    },
  ];

  async getModelList(): Promise<ModelInfo[]> {
    const filesDir = RNFS.DocumentDirectoryPath;
    for (const m of this.models) {
      if (m.model_id === 'adibhasha_offline_lexicon') {
        m.isInstalled = true;
        continue;
      }
      const p = `${filesDir}/models/${m.task}/${m.model_id}`;
      try {
        m.isInstalled = await RNFS.exists(p);
      } catch {
        m.isInstalled = false;
      }
    }
    return [...this.models];
  }

  async importModelFromStorage(sourceFilePath: string, modelId: string): Promise<boolean> {
    const ext = sourceFilePath.split('.').pop()?.toLowerCase();
    const ALLOWED = ['onnx', 'tflite', 'bin', 'safetensors', 'gguf'];
    if (!ext || !ALLOWED.includes(ext)) {
      throw new Error(`Invalid model format .${ext}. Only ${ALLOWED.join(', ')} permitted.`);
    }

    const filesDir = RNFS.DocumentDirectoryPath;
    const destDir = `${filesDir}/models/custom/${modelId}`;
    await RNFS.mkdir(destDir);
    const destFile = `${destDir}/model.${ext}`;
    await RNFS.copyFile(sourceFilePath, destFile);
    return true;
  }
}

export const modelManager = new ModelManager();
