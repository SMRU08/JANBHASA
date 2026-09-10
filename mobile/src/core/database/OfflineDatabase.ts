import { MMKV } from 'react-native-mmkv';
import { IOfflineDatabase, TranslationHistoryItem, AppSettings } from './IOfflineDatabase';
import { SANTALI_DICTIONARY, DictionaryEntry } from '../../data/santaliDictionary';
import { FLN_LEXICON, FLNLexiconEntry } from '../../data/flnLexiconData';

const storage = new MMKV({ id: 'janbhasha_offline_db' });

const KEYS = {
  HISTORY: 'janbhasha_history',
  SETTINGS: 'janbhasha_settings',
  FAVORITES: 'janbhasha_favorites',
};

const DEFAULT_SETTINGS: AppSettings = {
  audioOutputMode: 'speaker',
  displayScript: 'ol_chiki',
  autoSpeakTranslation: true,
  maxHistoryItems: 100,
  lowRamMode: true,
};

export class OfflineDatabase implements IOfflineDatabase {
  async addHistory(item: Omit<TranslationHistoryItem, 'id' | 'timestamp' | 'isFavorite'>): Promise<TranslationHistoryItem> {
    const history = await this.getHistory();
    const newItem: TranslationHistoryItem = {
      ...item,
      id: `hist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: Date.now(),
      isFavorite: false,
    };

    const settings = await this.getSettings();
    const updated = [newItem, ...history].slice(0, settings.maxHistoryItems);
    storage.set(KEYS.HISTORY, JSON.stringify(updated));
    return newItem;
  }

  async getHistory(limit: number = 50): Promise<TranslationHistoryItem[]> {
    const raw = storage.getString(KEYS.HISTORY);
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw) as TranslationHistoryItem[];
      return parsed.slice(0, limit);
    } catch {
      return [];
    }
  }

  async clearHistory(): Promise<void> {
    storage.delete(KEYS.HISTORY);
  }

  async toggleFavorite(id: string): Promise<boolean> {
    const history = await this.getHistory(200);
    let newState = false;
    const updated = history.map((item) => {
      if (item.id === id) {
        newState = !item.isFavorite;
        return { ...item, isFavorite: newState };
      }
      return item;
    });
    storage.set(KEYS.HISTORY, JSON.stringify(updated));
    return newState;
  }

  async getFavorites(): Promise<TranslationHistoryItem[]> {
    const history = await this.getHistory(200);
    return history.filter((i) => i.isFavorite);
  }

  async deleteHistoryItem(id: string): Promise<void> {
    const history = await this.getHistory(200);
    const updated = history.filter((i) => i.id !== id);
    storage.set(KEYS.HISTORY, JSON.stringify(updated));
  }

  async getSettings(): Promise<AppSettings> {
    const raw = storage.getString(KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  async updateSettings(partial: Partial<AppSettings>): Promise<AppSettings> {
    const current = await this.getSettings();
    const updated = { ...current, ...partial };
    storage.set(KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  }

  async clearCache(): Promise<void> {
    // Keep settings and favorites, clear search cache and temp keys
    const settings = await this.getSettings();
    const favorites = await this.getFavorites();
    storage.clearAll();
    storage.set(KEYS.SETTINGS, JSON.stringify(settings));
    storage.set(KEYS.HISTORY, JSON.stringify(favorites));
  }

  // Dictionary Helpers
  searchDictionary(query: string, category?: string): DictionaryEntry[] {
    const q = query.trim().toLowerCase();
    return SANTALI_DICTIONARY.filter((entry) => {
      if (category && category !== 'all' && entry.category !== category) {
        return false;
      }
      if (!q) return true;
      return (
        entry.hindi.toLowerCase().includes(q) ||
        entry.olChiki.includes(q) ||
        entry.roman.toLowerCase().includes(q)
      );
    });
  }

  // FLN Pedagogical Corpus Helpers (368 verified classroom interactions)
  searchFLNCorpus(query: string, domain?: string): FLNLexiconEntry[] {
    const q = query.trim().toLowerCase();
    return FLN_LEXICON.filter((entry) => {
      if (domain && domain !== 'all' && entry.domain !== domain) {
        return false;
      }
      if (!q) return true;
      return (
        entry.sourceHindi.toLowerCase().includes(q) ||
        entry.targetOlChiki.includes(q) ||
        entry.phoneticDeva.toLowerCase().includes(q)
      );
    });
  }
}

export const offlineDatabase = new OfflineDatabase();
