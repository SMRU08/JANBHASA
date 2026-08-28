import { apiRequest } from './apiClient';

export async function transcribeAudio(audioUri: string, language: string = 'hi'): Promise<{ text: string; success: boolean; error?: string }> {
  const formData = new FormData();
  formData.append('audio', { uri: audioUri, type: 'audio/wav', name: 'recording.wav' } as any);
  formData.append('language', language);
  const result = await apiRequest<{ text: string }>('/api/stt/transcribe', { method: 'POST', body: formData });
  if (result.success && result.data) return { text: result.data.text, success: true };
  return { text: '', success: false, error: result.message };
}

export async function getSttStatus(): Promise<{ available: boolean; model_size?: string; error?: string }> {
  const result = await apiRequest<{ available: boolean; model_size: string }>('/api/stt/status');
  return result.data ?? { available: false, error: result.message };
}
