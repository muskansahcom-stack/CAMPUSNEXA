/**
 * ShikshaSetu Regional Languages Registry & i18n Loader
 * 
 * Supports initial languages:
 * - English (en)
 * - Hindi (hi)
 * - Tamil (ta)
 * 
 * Extensible for adding:
 * - Telugu (te)
 * - Bengali (bn)
 * - Marathi (mr)
 * - Gujarati (gu)
 * - Kannada (kn)
 * - Malayalam (ml)
 * - Odia (or)
 * - Assamese (as)
 * - Punjabi (pa)
 * and others later without refactoring.
 */

import { LanguageMeta, TranslationSchema, AppLanguageCode } from './types';
import { en } from './locales/en';
import { hi } from './locales/hi';
import { ta } from './locales/ta';

export const INITIAL_LANGUAGES: LanguageMeta[] = [
  {
    code: 'en',
    label: 'English',
    nativeLabel: 'English',
    script: 'Latin',
    isInitialSupport: true,
    isVoiceReady: true,
  },
  {
    code: 'hi',
    label: 'Hindi',
    nativeLabel: 'हिन्दी',
    script: 'Devanagari',
    isInitialSupport: true,
    isVoiceReady: true,
  },
  {
    code: 'ta',
    label: 'Tamil',
    nativeLabel: 'தமிழ்',
    script: 'Tamil',
    isInitialSupport: true,
    isVoiceReady: true,
  },
];

export const EXTENDED_REGIONAL_LANGUAGES: LanguageMeta[] = [
  {
    code: 'te',
    label: 'Telugu',
    nativeLabel: 'తెలుగు',
    script: 'Telugu',
    isInitialSupport: false,
    isVoiceReady: true,
  },
  {
    code: 'bn',
    label: 'Bengali',
    nativeLabel: 'বাংলা',
    script: 'Bengali',
    isInitialSupport: false,
    isVoiceReady: true,
  },
  {
    code: 'mr',
    label: 'Marathi',
    nativeLabel: 'मराठी',
    script: 'Devanagari',
    isInitialSupport: false,
    isVoiceReady: true,
  },
  {
    code: 'gu',
    label: 'Gujarati',
    nativeLabel: 'ગુજરાતી',
    script: 'Gujarati',
    isInitialSupport: false,
    isVoiceReady: true,
  },
  {
    code: 'kn',
    label: 'Kannada',
    nativeLabel: 'ಕನ್ನಡ',
    script: 'Kannada',
    isInitialSupport: false,
    isVoiceReady: true,
  },
  {
    code: 'ml',
    label: 'Malayalam',
    nativeLabel: 'മലയാളം',
    script: 'Malayalam',
    isInitialSupport: false,
    isVoiceReady: true,
  },
  {
    code: 'or',
    label: 'Odia',
    nativeLabel: 'ଓଡ଼ିଆ',
    script: 'Odia',
    isInitialSupport: false,
    isVoiceReady: true,
  },
  {
    code: 'as',
    label: 'Assamese',
    nativeLabel: 'অসমীয়া',
    script: 'Bengali-Assamese',
    isInitialSupport: false,
    isVoiceReady: true,
  },
  {
    code: 'pa',
    label: 'Punjabi',
    nativeLabel: 'ਪੰਜਾਬੀ',
    script: 'Gurmukhi',
    isInitialSupport: false,
    isVoiceReady: true,
  },
];

export const ALL_SUPPORTED_LANGUAGES: LanguageMeta[] = [
  ...INITIAL_LANGUAGES,
  ...EXTENDED_REGIONAL_LANGUAGES,
];

// Active translations store
export const LOCALES_STORE: Record<string, TranslationSchema> = {
  en,
  hi,
  ta,
};

/**
 * Register a new regional language or community dialect at runtime
 */
export function registerLocale(
  meta: LanguageMeta,
  translations: TranslationSchema
): void {
  const existingIdx = ALL_SUPPORTED_LANGUAGES.findIndex((l) => l.code === meta.code);
  if (existingIdx >= 0) {
    ALL_SUPPORTED_LANGUAGES[existingIdx] = meta;
  } else {
    ALL_SUPPORTED_LANGUAGES.push(meta);
  }
  LOCALES_STORE[meta.code] = translations;
}

/**
 * Helper to fetch a nested key e.g. "student.greetingMorning" or "common.letsLearn"
 */
export function getTranslationValue(
  lang: string,
  keyPath: string,
  fallbackLang: string = 'en'
): string {
  const activeSchema = LOCALES_STORE[lang] || LOCALES_STORE[fallbackLang] || en;
  const fallbackSchema = LOCALES_STORE[fallbackLang] || en;

  const resolve = (schema: any, path: string): string | undefined => {
    const parts = path.split('.');
    let curr = schema;
    for (const part of parts) {
      if (curr && typeof curr === 'object' && part in curr) {
        curr = curr[part];
      } else {
        return undefined;
      }
    }
    return typeof curr === 'string' ? curr : undefined;
  };

  const val = resolve(activeSchema, keyPath);
  if (val !== undefined) return val;

  const fallbackVal = resolve(fallbackSchema, keyPath);
  if (fallbackVal !== undefined) return fallbackVal;

  return keyPath;
}
