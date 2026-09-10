export interface ASRResult {
  transcript: string;
  confidence: number;
  isFinal: boolean;
  language: string;
  status: 'success' | 'unavailable' | 'error';
  errorMessage?: string;
}

export interface TTSResult {
  audioPath?: string;
  audioBase64?: string;
  durationSeconds: number;
  status: 'success' | 'unavailable' | 'error';
  errorMessage?: string;
}
