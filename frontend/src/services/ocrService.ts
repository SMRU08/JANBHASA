import { apiRequest } from './apiClient';

export async function extractText(imageUri: string, sourceLang: string = 'hi', translateTo?: string, userId?: number): Promise<{ extracted_text: string; translated_text?: string; success: boolean; error?: string }> {
  const form = new FormData();
  form.append('image', { uri: imageUri, type: 'image/jpeg', name: 'scan.jpg' } as any);
  form.append('source_lang', sourceLang);
  if (translateTo) form.append('translate_to', translateTo);
  if (userId) form.append('user_id', String(userId));
  const result = await apiRequest<{ extracted_text: string; translated_text?: string }>('/api/ocr/extract', { method: 'POST', body: form });
  if (result.success && result.data) return { extracted_text: result.data.extracted_text, translated_text: result.data.translated_text, success: true };
  return { extracted_text: '', success: false, error: result.message };
}
