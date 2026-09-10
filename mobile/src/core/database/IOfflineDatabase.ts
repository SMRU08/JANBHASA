export interface TranslationHistoryItem {
  id: string;
  timestamp: number;
  sourceText: string;
  translatedText: string;
  sourceLang: 'hin_Deva' | 'sat_Olck';
  targetLang: 'hin_Deva' | 'sat_Olck';
  romanText?: string;
  isFavorite: boolean;
}

export interface AppSettings {
  audioOutputMode: 'speaker' | 'bluetooth' | 'wired';
  displayScript: 'ol_chiki' | 'roman';
  autoSpeakTranslation: boolean;
  maxHistoryItems: number;
  lowRamMode: boolean;
}

export interface IOfflineDatabase {
  addHistory(item: Omit<TranslationHistoryItem, 'id' | 'timestamp' | 'isFavorite'>): Promise<TranslationHistoryItem>;
  getHistory(limit?: number): Promise<TranslationHistoryItem[]>;
  clearHistory(): Promise<void>;
  toggleFavorite(id: string): Promise<boolean>;
  getFavorites(): Promise<TranslationHistoryItem[]>;
  deleteHistoryItem(id: string): Promise<void>;
  getSettings(): Promise<AppSettings>;
  updateSettings(settings: Partial<AppSettings>): Promise<AppSettings>;
  clearCache(): Promise<void>;
}
