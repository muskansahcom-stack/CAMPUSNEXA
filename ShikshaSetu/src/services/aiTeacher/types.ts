// Domain types for ShikshaSetu AI Personal Teacher

export type ExplanationMode = 'simple' | 'normal' | 'detailed';

export type LanguageSupportTier = 'full' | 'bilingual_preview' | 'foundational';

export interface AITeacherLanguage {
  code: string;
  name: string;
  nativeName: string;
  tier: LanguageSupportTier;
  badgeLabel: string;
}

export const SUPPORTED_AI_LANGUAGES: AITeacherLanguage[] = [
  { code: 'en', name: 'English', nativeName: 'English', tier: 'full', badgeLabel: 'Full Live Support' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', tier: 'full', badgeLabel: 'Full Live Support' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', tier: 'bilingual_preview', badgeLabel: 'Bilingual Preview' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', tier: 'bilingual_preview', badgeLabel: 'Bilingual Preview' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', tier: 'bilingual_preview', badgeLabel: 'Bilingual Preview' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', tier: 'bilingual_preview', badgeLabel: 'Bilingual Preview' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', tier: 'foundational', badgeLabel: 'Foundational' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', tier: 'foundational', badgeLabel: 'Foundational' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', tier: 'foundational', badgeLabel: 'Foundational' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', tier: 'foundational', badgeLabel: 'Foundational' },
  { code: 'as', name: 'Assamese', nativeName: 'অসমীয়া', tier: 'foundational', badgeLabel: 'Foundational' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', tier: 'foundational', badgeLabel: 'Foundational' },
];

export interface StudentMistakeContext {
  questionId: string;
  questionText: string;
  selectedOptionText: string;
  correctOptionText: string;
  explanation: string;
  topicName: string;
  timestamp?: string;
}

export interface StudentLearningContext {
  studentId: string;
  studentName: string;
  grade: number;
  subject: string;
  currentTopic: string;
  masteryScore: number; // 0 to 100
  recentMistakes: StudentMistakeContext[];
  preferredLanguage: string;
  explanationMode: ExplanationMode;
}

export interface InteractiveQuestionOption {
  id: string;
  text: string;
}

export interface InteractiveQuestionPayload {
  question: string;
  options: InteractiveQuestionOption[];
  correctAnswer: string;
  explanation: string;
  selectedOptionId?: string;
  isAnswerCorrect?: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'student' | 'ai';
  content: string;
  timestamp: string;
  isAiGenerated: boolean;
  explanationMode?: ExplanationMode;
  interactiveQuestion?: InteractiveQuestionPayload;
  suggestedActions?: string[];
  teacherReferralRecommended?: boolean;
  topicContext?: string;
}

export type AITeacherFunction =
  | 'explain_concept'
  | 'explain_mistake'
  | 'give_examples'
  | 'generate_practice'
  | 'simplify'
  | 'increase_detail'
  | 'translate'
  | 'step_by_step';

export interface AITeacherResponse {
  message: string;
  interactiveQuestion?: InteractiveQuestionPayload;
  suggestedActions: string[];
  explanationMode: ExplanationMode;
  teacherReferralRecommended?: boolean;
  isAiGenerated: true;
}
