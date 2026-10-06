// Domain types for ShikshaSetu AI Personalization & Adaptive Assessment

export interface CurriculumTopic {
  id: string;
  subject_id: string;
  name: string;
  description: string | null;
  difficulty: number; // 1 to 5
  prerequisite_topic_id: string | null;
}

export interface AssessmentQuestionOption {
  id: string;
  text: string;
  hint?: string;
}

export interface AssessmentQuestion {
  id: string;
  topic_id: string;
  question: string;
  options: AssessmentQuestionOption[];
  correct_answer: string;
  explanation: string;
  difficulty: number; // 1: Easy/Foundational, 2: Medium/Standard, 3: Hard/Challenge
}

export interface AnswerSubmission {
  question_id: string;
  topic_id: string;
  answer: string;
  is_correct: boolean;
  response_time: number; // in seconds
  difficulty: number;
}

export interface TopicPerformance {
  topicId: string;
  topicName: string;
  totalAttempts: number;
  correctAttempts: number;
  consecutiveIncorrect: number;
  consecutiveCorrect: number;
  accuracyPct: number;
}

export interface AdaptiveAssessmentState {
  assessmentId: string;
  studentId: string;
  subjectId: string;
  questionIndex: number;
  totalQuestionsTarget: number; // typically 10 to 15
  currentDifficulty: number; // 1 to 3
  answers: AnswerSubmission[];
  topicPerformance: Record<string, TopicPerformance>;
  currentTopicId: string;
  activeQuestion: AssessmentQuestion | null;
  isComplete: boolean;
}

export type AdaptiveAction =
  | 'increase_difficulty'
  | 'decrease_difficulty'
  | 'maintain'
  | 'prerequisite_fallback';

export interface NextQuestionEvaluation {
  nextQuestion: AssessmentQuestion | null;
  isComplete: boolean;
  currentDifficulty: number;
  adaptiveAction: AdaptiveAction;
  reasoning: string;
  scaffoldingExplanation?: {
    topicName: string;
    visualHint: string;
    simplifiedExplanation: string;
  };
}

export type MasteryCategory = 'strong' | 'developing' | 'needs_practice';

export interface TopicMastery {
  topicId: string;
  topicName: string;
  masteryScore: number; // 0 to 100
  attempts: number;
  correctAttempts: number;
  status: MasteryCategory;
  diagnosticSummary: string;
}

export interface ExplainableRecommendation {
  topicId: string;
  topicName: string;
  title: string;
  actionText: string;
  reasoning: string; // Transparent explainability string
  prerequisiteId?: string | null;
  prerequisiteName?: string;
  estimatedMinutes: number;
  xpBonus: number;
}

export interface GeneratedPathItem {
  topicId: string;
  topicName: string;
  sequence: number;
  status: 'not_started' | 'in_progress' | 'mastered' | 'needs_practice';
  description: string;
}

export interface DiagnosticReport {
  assessmentId: string;
  overallScore: number;
  totalQuestions: number;
  strongTopics: TopicMastery[];
  developingTopics: TopicMastery[];
  needsPracticeTopics: TopicMastery[];
  recommendedStartingTopic: TopicMastery;
  recommendation: ExplainableRecommendation;
  generatedLearningPath: GeneratedPathItem[];
}

export interface PersonalizationProvider {
  id: string;
  name: string;
  evaluateNextQuestion(
    state: AdaptiveAssessmentState,
    allQuestions: AssessmentQuestion[],
    allTopics: CurriculumTopic[]
  ): Promise<NextQuestionEvaluation>;
  computeMasteryReport(
    studentId: string,
    assessmentId: string,
    answers: AnswerSubmission[],
    allTopics: CurriculumTopic[],
    allQuestions: AssessmentQuestion[]
  ): Promise<DiagnosticReport>;
}
