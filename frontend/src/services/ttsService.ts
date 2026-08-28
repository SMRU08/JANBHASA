import { apiRequest } from './apiClient';
import { useSettingsStore } from '../store/settingsStore';

export async function synthesize(text: string, language: string): Promise<string | null> {
  const result = await apiRequest<{ audio_url: string; success: boolean }>('/api/tts/synthesize', {
    method: 'POST',
    body: { text, language, use_cache: true },
  });
  if (result.success && result.data?.audio_url) {
    const base = useSettingsStore.getState().backendUrl;
    return `${base}${result.data.audio_url}`;
  }
  return null;
}

export async function getTtsStatus() {
  return apiRequest('/api/tts/status');
}
