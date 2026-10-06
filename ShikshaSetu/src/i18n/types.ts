/**
 * ShikshaSetu Internationalization (i18n) Types
 * 
 * Initial primary UI language support:
 * - English ('en')
 * - Hindi ('hi')
 * - Tamil ('ta')
 * 
 * Extensible for adding:
 * - Telugu ('te')
 * - Bengali ('bn')
 * - Marathi ('mr')
 * - Gujarati ('gu')
 * - Kannada ('kn')
 * - Malayalam ('ml')
 * - Odia ('or')
 * - Assamese ('as')
 * - Punjabi ('pa')
 * and other regional vernacular languages.
 */

export type InitialSupportedLanguage = 'en' | 'hi' | 'ta';

export type ExtendedSupportedLanguage = 
  | InitialSupportedLanguage
  | 'te' // Telugu
  | 'bn' // Bengali
  | 'mr' // Marathi
  | 'gu' // Gujarati
  | 'kn' // Kannada
  | 'ml' // Malayalam
  | 'or' // Odia
  | 'as' // Assamese
  | 'pa'; // Punjabi

export type AppLanguageCode = ExtendedSupportedLanguage | string;

export interface LanguageMeta {
  code: AppLanguageCode;
  label: string;
  nativeLabel: string;
  script: string;
  isInitialSupport: boolean;
  isVoiceReady: boolean;
  direction?: 'ltr' | 'rtl';
}

export interface TranslationSchema {
  common: {
    appName: string;
    tagline: string;
    home: string;
    letsLearn: string;
    practice: string;
    yourProgress: string;
    yourLearningJourney: string;
    settings: string;
    profile: string;
    login: string;
    logout: string;
    save: string;
    cancel: string;
    back: string;
    next: string;
    continue: string;
    start: string;
    submit: string;
    close: string;
    offlineMode: string;
    lowDataMode: string;
    keepGoing: string;
    makingProgress: string;
    oneMoreStep: string;
    listenAudio: string;
    speakAnswer: string;
  };
  navigation: {
    home: string;
    growth: string;
    learn: string;
    practice: string;
    aiTeacher: string;
    profile: string;
  };
  student: {
    greetingMorning: string;
    greetingAfternoon: string;
    greetingEvening: string;
    companionTitle: string;
    streakTitle: string;
    streakDays: string;
    dailyGoalTitle: string;
    dailyGoalCompleted: string;
    minutesLeft: string;
    totalXp: string;
    continueLearning: string;
    nextStep: string;
    aiTip: string;
    subjectsTitle: string;
    recentActivities: string;
    achievementsTitle: string;
    milestonesTitle: string;
  };
  accessibility: {
    title: string;
    textSize: string;
    textSizeNormal: string;
    textSizeLarge: string;
    textSizeExtraLarge: string;
    highContrast: string;
    reducedMotion: string;
    voiceAssistance: string;
    largeButtons: string;
    screenReaderNotice: string;
    applySettings: string;
  };
  onboarding: {
    welcomeTitle: string;
    welcomeSubtitle: string;
    stepLanguageTitle: string;
    stepLanguageDesc: string;
    stepDisplayTitle: string;
    stepDisplayDesc: string;
    stepPracticeTitle: string;
    stepPracticeDesc: string;
    stepVoiceTitle: string;
    stepVoiceDesc: string;
    startLearningNow: string;
  };
  voice: {
    listenToQuestion: string;
    listening: string;
    tapToSpeak: string;
    speechNotSupported: string;
    voiceInstructions: string;
  };
}
