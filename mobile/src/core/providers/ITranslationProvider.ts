export interface TranslationOptions {
  returnRoman?: boolean;
  useLexiconFirst?: boolean;
}

export interface TranslationResult {
  sourceText: string;
  translatedText: string;
  romanText?: string;
  sourceLang: 'hin_Deva' | 'sat_Olck';
  targetLang: 'hin_Deva' | 'sat_Olck';
  inferenceTimeMs: number;
  engineUsed: 'fln_verified_lexicon' | 'indictrans2_int8' | 'adibhasha_lexicon' | 'onnx_tiny' | 'phonetic_transducer';
}

export interface ITranslationProvider {
  translate(
    text: string,
    sourceLang: 'hin_Deva' | 'sat_Olck',
    targetLang: 'hin_Deva' | 'sat_Olck',
    options?: TranslationOptions
  ): Promise<TranslationResult>;
}
