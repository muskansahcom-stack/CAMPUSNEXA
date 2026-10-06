import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  ALL_SUPPORTED_LANGUAGES,
  INITIAL_LANGUAGES,
  getTranslationValue,
  registerLocale,
} from '../i18n';
import { LanguageMeta, TranslationSchema, AppLanguageCode } from '../i18n/types';

export interface LanguageOption {
  code: string;
  label: string;
  nativeLabel: string;
}

interface LanguageContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (key: string, fallback?: string) => string;
  languages: LanguageMeta[];
  initialLanguages: LanguageMeta[];
  registerCustomLanguage: (meta: LanguageMeta, translations: TranslationSchema) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('shikshasetu_lang');
      if (saved) return saved;
      // Default to Hindi or English based on browser or rural-first default
      return 'hi';
    }
    return 'hi';
  });

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('shikshasetu_lang', lang);
      document.documentElement.lang = lang;
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  /**
   * Flexible translation helper supporting:
   * 1. Nested paths: t('student.greetingMorning')
   * 2. Common shortcuts: t('letsLearn') -> t('common.letsLearn')
   * 3. Legacy keys: t('login') -> t('common.login')
   */
  const t = (key: string, fallback?: string): string => {
    // 1. If key contains dot, resolve directly
    if (key.includes('.')) {
      const val = getTranslationValue(language, key);
      if (val !== key) return val;
      if (fallback) return fallback;
    }

    // 2. Try looking in common.<key>
    const commonVal = getTranslationValue(language, `common.${key}`);
    if (commonVal !== `common.${key}`) return commonVal;

    // 3. Try looking in navigation.<key>
    const navVal = getTranslationValue(language, `navigation.${key}`);
    if (navVal !== `navigation.${key}`) return navVal;

    // 4. Try looking in student.<key>
    const studentVal = getTranslationValue(language, `student.${key}`);
    if (studentVal !== `student.${key}`) return studentVal;

    // 5. Try looking in accessibility.<key>
    const a11yVal = getTranslationValue(language, `accessibility.${key}`);
    if (a11yVal !== `accessibility.${key}`) return a11yVal;

    return fallback || key;
  };

  const registerCustomLanguage = (meta: LanguageMeta, translations: TranslationSchema) => {
    registerLocale(meta, translations);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        languages: ALL_SUPPORTED_LANGUAGES,
        initialLanguages: INITIAL_LANGUAGES,
        registerCustomLanguage,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
