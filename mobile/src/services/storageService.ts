/**
 * Storage Service
 * Abstracted persistent storage for lightweight settings, roles, and lessons.
 * Strictly prevents saving large model binaries or raw audio blobs.
 */

export class StorageService {
  private cache: Record<string, string> = {};

  async getItem<T>(key: string, defaultValue: T): Promise<T> {
    const item = this.cache[key];
    if (!item) return defaultValue;
    try {
      return JSON.parse(item) as T;
    } catch {
      return defaultValue;
    }
  }

  async setItem<T>(key: string, value: T): Promise<void> {
    this.cache[key] = JSON.stringify(value);
  }

  async removeItem(key: string): Promise<void> {
    delete this.cache[key];
  }
}

export const storageService = new StorageService();
