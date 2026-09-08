/**
 * Language Architecture Types for Janbhasha
 * ISO-compliant language codes and script designations.
 * Never hardcodes language pairs directly into UI.
 */

export type LanguageCode = 'hi' | 'sat' | 'hoc' | 'unr';

export type ScriptCode = 'Deva' | 'Olck' | 'Wara' | 'Latn';

export interface Language {
  code: LanguageCode;
  name: string;             // English name e.g., "Santali"
  nativeName: string;       // Native script name e.g., "ᱥᱟᱱᱛᱟᱲᱤ"
  defaultScript: ScriptCode;
  supportedScripts: ScriptCode[];
  isRTL?: boolean;
}

export interface LanguagePair {
  id: string;               // e.g., "hi_Deva-sat_Olck"
  sourceLanguage: LanguageCode;
  sourceScript: ScriptCode;
  targetLanguage: LanguageCode;
  targetScript: ScriptCode;
  isAvailableOffline: boolean;
  modelPackageId?: string;
}

export interface LanguageConfig {
  availableLanguages: Record<LanguageCode, Language>;
  supportedPairs: LanguagePair[];
  defaultSourceLanguage: LanguageCode;
  defaultTargetLanguage: LanguageCode;
}
