/**
 * Base API client for JANBHASHA backend communication.
 * Auto-detects host network IP on Web and Mobile for seamless LAN/Hotspot connectivity.
 */
import { Platform } from 'react-native';
import { useSettingsStore } from '../store/settingsStore';

export function getBackendUrl(): string {
  try {
    const configuredUrl = useSettingsStore.getState().backendUrl;
    if (configuredUrl && configuredUrl !== 'http://localhost:8000') {
      return configuredUrl;
    }
  } catch {}

  // On Web browser, auto-derive backend IP from the current browser hostname
  if (Platform.OS === 'web') {
    const hostname = (globalThis as any).location?.hostname;
    if (hostname && hostname !== 'localhost' && hostname !== '127.0.0.1') {
      return `http://${hostname}:8000`;
    }
  }

  return 'http://localhost:8000';
}

interface ApiOptions {
  method?: string;
  body?: object | FormData;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface ApiResult<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error_code?: string;
}

export async function apiRequest<T = unknown>(
  path: string,
  options: ApiOptions = {}
): Promise<ApiResult<T>> {
  const url = `${getBackendUrl()}${path}`;
  const { method = 'GET', body, headers = {}, timeout = 15000 } = options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const isFormData = body instanceof FormData;
    const fetchHeaders: Record<string, string> = {
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    };

    const response = await fetch(url, {
      method,
      headers: fetchHeaders,
      body: isFormData ? body : body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    clearTimeout(timer);
    const json = await response.json();
    return json as ApiResult<T>;
  } catch (err: any) {
    clearTimeout(timer);
    if (err?.name === 'AbortError') {
      return { success: false, message: 'Request timed out. Check backend connection.', error_code: 'TIMEOUT' };
    }
    return {
      success: false,
      message: 'Could not reach JANBHASHA server. Make sure the backend is running on your local network.',
      error_code: 'NETWORK_ERROR',
    };
  }
}

export function getWsUrl(path: string): string {
  const httpUrl = getBackendUrl();
  const wsUrl = httpUrl.replace(/^http/, 'ws');
  return `${wsUrl}${path}`;
}
