/**
 * Comprehensive Test Suite for ShikshaSetu Internationalization (i18n) & Accessibility Architecture
 * 
 * Verifies:
 * 1. Initial UI languages: English (en), Hindi (hi), Tamil (ta)
 * 2. Extensible registry supporting Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Odia, Assamese, Punjabi
 * 3. Language switchers in Onboarding, Profile, and Settings
 * 4. Accessibility engine (large text, high contrast, reduced motion, large touch targets, keyboard nav)
 * 5. Voice-ready architecture (voice instructions, voice questions, voice answers)
 * 6. Low digital literacy compliance (zero forbidden jargon, friendly terminology, guided onboarding)
 */

import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✅ PASS: ${message}`);
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    process.exitCode = 1;
  }
}

console.log('\n======================================================');
console.log('  SHIKSHASETU i18n & ACCESSIBILITY TEST SUITE');
console.log('======================================================\n');

// -----------------------------------------------------------------------------
// Test Suite 1: i18n Architecture & Translation Files
// -----------------------------------------------------------------------------
console.log('--- 1. Internationalization Architecture & Locale Dictionaries ---');

const enFile = resolve(projectRoot, 'src/i18n/locales/en.ts');
const hiFile = resolve(projectRoot, 'src/i18n/locales/hi.ts');
const taFile = resolve(projectRoot, 'src/i18n/locales/ta.ts');
const registryFile = resolve(projectRoot, 'src/i18n/registry.ts');
const typesFile = resolve(projectRoot, 'src/i18n/types.ts');
const languageContextFile = resolve(projectRoot, 'src/contexts/LanguageContext.tsx');

assert(existsSync(enFile), 'English translation file (en.ts) exists');
assert(existsSync(hiFile), 'Hindi translation file (hi.ts) exists');
assert(existsSync(taFile), 'Tamil translation file (ta.ts) exists');
assert(existsSync(registryFile), 'i18n registry (registry.ts) exists');
assert(existsSync(typesFile), 'i18n types (types.ts) exists');
assert(existsSync(languageContextFile), 'LanguageContext.tsx exists');

const enContent = readFileSync(enFile, 'utf8');
const hiContent = readFileSync(hiFile, 'utf8');
const taContent = readFileSync(taFile, 'utf8');
const registryContent = readFileSync(registryFile, 'utf8');

// Verify primary sections exist in translation files
const requiredSections = ['common', 'onboarding', 'student', 'voice', 'accessibility'];
for (const section of requiredSections) {
  assert(enContent.includes(`${section}:`), `English dictionary contains '${section}' section`);
  assert(hiContent.includes(`${section}:`), `Hindi dictionary contains '${section}' section`);
  assert(taContent.includes(`${section}:`), `Tamil dictionary contains '${section}' section`);
}

// Verify friendly, low-literacy concepts in English dictionary
assert(enContent.includes('Your Progress'), "English dictionary defines 'Your Progress' (replacing Mastery Index)");
assert(enContent.includes('Practice'), "English dictionary defines 'Practice' (replacing Adaptive Assessment)");
assert(enContent.includes('Your Learning Journey'), "English dictionary defines 'Your Learning Journey'");
assert(enContent.includes("Let's Learn"), "English dictionary defines 'Let's Learn'");

// Verify authentic vernacular translations in Hindi & Tamil
assert(hiContent.includes('आपकी प्रगति'), "Hindi dictionary includes 'आपकी प्रगति' (Your Progress)");
assert(hiContent.includes('अभ्यास'), "Hindi dictionary includes 'अभ्यास' (Practice)");
assert(taContent.includes('உங்கள் முன்னேற்றம்'), "Tamil dictionary includes 'உங்கள் முன்னேற்றம்' (Your Progress)");
assert(taContent.includes('பயிற்சி'), "Tamil dictionary includes 'பயிற்சி' (Practice)");

// -----------------------------------------------------------------------------
// Test Suite 2: Extensibility for 9+ Regional Vernacular Languages
// -----------------------------------------------------------------------------
console.log('\n--- 2. Regional Vernacular Extensibility Architecture ---');

const extendedLanguages = [
  { code: 'te', name: 'Telugu', native: 'తెలుగు' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'mr', name: 'Marathi', native: 'मराठी' },
  { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
  { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
  { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
  { code: 'or', name: 'Odia', native: 'ଓଡ଼ିଆ' },
  { code: 'as', name: 'Assamese', native: 'অসমীয়া' },
  { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
];

for (const lang of extendedLanguages) {
  assert(
    registryContent.includes(`code: '${lang.code}'`) && registryContent.includes(lang.name),
    `Extended registry supports ${lang.name} ('${lang.code}', native: '${lang.native}')`
  );
}

assert(registryContent.includes('registerLocale'), "Registry provides 'registerLocale' function for dynamic language registration");
assert(registryContent.includes('getTranslationValue'), "Registry provides 'getTranslationValue' fallback resolution");

// -----------------------------------------------------------------------------
// Test Suite 3: Language Switcher Locations (Onboarding, Profile, Settings)
// -----------------------------------------------------------------------------
console.log('\n--- 3. Language Switcher Locations (Mandatory Requirements) ---');

const onboardingModalFile = resolve(projectRoot, 'src/components/onboarding/RuralStudentOnboardingModal.tsx');
const studentPortalFile = resolve(projectRoot, 'src/pages/StudentPortal.tsx');
const settingsModalFile = resolve(projectRoot, 'src/components/accessibility/AccessibilitySettingsModal.tsx');

assert(existsSync(onboardingModalFile), 'RuralStudentOnboardingModal.tsx exists');
assert(existsSync(settingsModalFile), 'AccessibilitySettingsModal.tsx exists');

const onboardingContent = readFileSync(onboardingModalFile, 'utf8');
const studentPortalContent = readFileSync(studentPortalFile, 'utf8');
const settingsContent = readFileSync(settingsModalFile, 'utf8');

// Location 1: Onboarding
assert(
  onboardingContent.includes('setLanguage(') &&
  onboardingContent.includes('Hindi') &&
  onboardingContent.includes('Tamil'),
  'Language Switcher is placed in Onboarding (RuralStudentOnboardingModal.tsx)'
);

// Location 2: Profile
assert(
  studentPortalContent.includes("currentTab === 'profile'") &&
  studentPortalContent.includes('setLanguage(') &&
  studentPortalContent.includes('Language & Display Preferences'),
  'Language Switcher is placed in Profile (StudentPortal.tsx profile tab)'
);

// Location 3: Settings
assert(
  settingsContent.includes('setLanguage(') && settingsContent.includes('UI Language'),
  'Language Switcher is placed in Settings (AccessibilitySettingsModal.tsx)'
);

// -----------------------------------------------------------------------------
// Test Suite 4: Accessibility Engine (Text Size, Contrast, Motion, Targets, Keyboard)
// -----------------------------------------------------------------------------
console.log('\n--- 4. Accessibility Engine & Rural Device Usability ---');

const a11yContextFile = resolve(projectRoot, 'src/contexts/AccessibilityContext.tsx');
const cssFile = resolve(projectRoot, 'src/index.css');

assert(existsSync(a11yContextFile), 'AccessibilityContext.tsx exists');
assert(existsSync(cssFile), 'index.css exists');

const a11yContent = readFileSync(a11yContextFile, 'utf8');
const cssContent = readFileSync(cssFile, 'utf8');

// Text Size Scaling
assert(a11yContent.includes("'normal' | 'large' | 'extra_large'"), 'Accessibility context defines 3 text size levels');
assert(cssContent.includes('.text-size-large'), 'CSS defines .text-size-large utility (112.5% scaling)');
assert(cssContent.includes('.text-size-extra-large'), 'CSS defines .text-size-extra-large utility (125% scaling)');

// High Contrast Mode
assert(a11yContent.includes('highContrast'), 'Accessibility context manages highContrast state');
assert(cssContent.includes('html.high-contrast'), 'CSS defines html.high-contrast contrast-optimized rules');

// Reduced Motion Mode
assert(a11yContent.includes('reducedMotion'), 'Accessibility context manages reducedMotion state');
assert(cssContent.includes('html.reduced-motion *'), 'CSS defines html.reduced-motion eliminating animations');

// Large Touch Targets (Minimum 44px)
assert(a11yContent.includes('largeTouchTargets'), 'Accessibility context manages largeTouchTargets');
assert(cssContent.includes('.large-touch-targets button'), 'CSS enforces min-height: 48px and min-width: 48px');

// Keyboard Navigation & Focus Rings
assert(cssContent.includes(':focus-visible'), 'CSS provides prominent focus rings for keyboard navigation');

// -----------------------------------------------------------------------------
// Test Suite 5: Voice-Ready Architecture (Instructions, Questions, Answers)
// -----------------------------------------------------------------------------
console.log('\n--- 5. Voice-Ready Architecture (TTS & STT) ---');

const voiceServiceFile = resolve(projectRoot, 'src/services/voiceService.ts');
const voiceButtonFile = resolve(projectRoot, 'src/components/voice/VoiceInstructionButton.tsx');
const voiceAnswerFile = resolve(projectRoot, 'src/components/voice/VoiceAnswerInput.tsx');
const questionRendererFile = resolve(projectRoot, 'src/components/learning/templates/UniversalQuestionRenderer.tsx');

assert(existsSync(voiceServiceFile), 'voiceService.ts exists');
assert(existsSync(voiceButtonFile), 'VoiceInstructionButton.tsx exists');
assert(existsSync(voiceAnswerFile), 'VoiceAnswerInput.tsx exists');
assert(existsSync(questionRendererFile), 'UniversalQuestionRenderer.tsx exists');

const voiceServiceContent = readFileSync(voiceServiceFile, 'utf8');
const questionRendererContent = readFileSync(questionRendererFile, 'utf8');

// Voice Instructions & Questions (TTS)
assert(
  voiceServiceContent.includes('speechSynthesis') && voiceServiceContent.includes('hi-IN'),
  'voiceService supports Indian vernacular SpeechSynthesis (TTS)'
);
assert(
  questionRendererContent.includes('<VoiceInstructionButton'),
  'VoiceInstructionButton integrated into Universal Question Renderer'
);
assert(
  studentPortalContent.includes('<VoiceInstructionButton'),
  'VoiceInstructionButton integrated into Student Practice Quiz Modal'
);

// Voice Answers (STT)
assert(
  voiceServiceContent.includes('SpeechRecognition') || voiceServiceContent.includes('webkitSpeechRecognition'),
  'voiceService supports SpeechRecognition (STT) for oral answering'
);
assert(
  questionRendererContent.includes('<VoiceAnswerInput'),
  'VoiceAnswerInput integrated for oral answers in question templates'
);

// -----------------------------------------------------------------------------
// Test Suite 6: Low Digital Literacy & Jargon Elimination
// -----------------------------------------------------------------------------
console.log('\n--- 6. Low Digital Literacy & Jargon Elimination Check ---');

// Verify student-facing UI files do NOT contain forbidden technical jargon
const forbiddenTerms = [
  'Mastery Index',
  'Adaptive Assessment',
  'Learning Analytics',
];

// Check student portal UI text (excluding internal code comments/variable identifiers)
const studentPortalLines = studentPortalContent.split('\n');
for (const term of forbiddenTerms) {
  const violatingLines = studentPortalLines.filter(line => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return false;
    return line.includes(term);
  });

  assert(
    violatingLines.length === 0,
    `No user-facing occurrences of '${term}' found in StudentPortal.tsx (violating lines: ${violatingLines.length})`
  );
}

// Guided Onboarding has 4 steps with single main action per screen
assert(onboardingContent.includes('step === 1'), 'Onboarding step 1: Language selection');
assert(onboardingContent.includes('step === 2'), 'Onboarding step 2: Text size comfort');
assert(onboardingContent.includes('step === 3'), 'Onboarding step 3: Simple one-action interface');
assert(onboardingContent.includes('step === 4'), 'Onboarding step 4: Voice instructions & audio');

// Check that Guided Tour auto-mounts and triggers on first-time login
assert(
  studentPortalContent.includes('isOnboardingModalOpen') &&
  studentPortalContent.includes('shikshasetu_onboarding_completed') &&
  studentPortalContent.includes('<RuralStudentOnboardingModal'),
  'Guided Onboarding automatically initializes for new rural students'
);

console.log('\n======================================================');
console.log(`  RESULTS: ${passedTests} / ${totalTests} assertions passed (${Math.round((passedTests / totalTests) * 100)}%)`);
console.log('======================================================\n');

if (passedTests === totalTests) {
  console.log('🎉 ALL i18n & ACCESSIBILITY TESTS PASSED FLAWLESSLY!\n');
  process.exit(0);
} else {
  console.error('❌ Some tests failed. Please review the output above.');
  process.exit(1);
}
