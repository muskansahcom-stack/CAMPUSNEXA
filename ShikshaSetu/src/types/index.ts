export type UserRole = 'student' | 'teacher' | 'school_admin';
export * from './database';
export * from './teacher';
export * from './connectivity';
export * from './admin';
export * from './motivation';
export * from './analytics';

export type SupportedLanguage = 'en' | 'hi' | 'bn' | 'mr' | 'te' | 'ta';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  avatarUrl?: string;
  schoolId: string;
  schoolName: string;
  state: string;
  district: string;
  grade?: number;
  preferredLanguage: SupportedLanguage;
  deviceType: 'shared_phone' | 'dedicated_phone' | 'tablet' | 'desktop';
  bandwidthMode: 'auto' | 'low' | 'high';
}

export type MasteryLevel = 'not_started' | 'in_progress' | 'needs_practice' | 'mastered';

export interface ConceptNode {
  id: string;
  subject: 'Mathematics' | 'Science' | 'Language' | 'SocialStudies';
  code: string;
  grade: number;
  title: Record<SupportedLanguage, string>;
  description: Record<SupportedLanguage, string>;
  difficulty: number; // 0.1 to 1.0
  prerequisites: string[];
  estimatedMinutes: number;
  offlineReady: boolean;
  packageSizeBytes: number;
  hasAudioExplainer: boolean;
}

export interface StudentMasteryRecord {
  conceptId: string;
  masteryLevel: MasteryLevel;
  confidenceScore: number; // 0 to 100
  lastPracticed: string;
  consecutiveCorrect: number;
}

export interface QuizQuestion {
  id: string;
  conceptId: string;
  prompt: Record<SupportedLanguage, string>;
  audioPromptHint?: string;
  options: {
    id: string;
    text: Record<SupportedLanguage, string>;
    isCorrect: boolean;
  }[];
  explanation: Record<SupportedLanguage, string>;
  difficulty: 'foundational' | 'intermediate' | 'advanced';
}

export interface TeacherIntervention {
  id: string;
  studentId: string;
  studentName: string;
  grade: number;
  conceptId: string;
  conceptTitle: string;
  type: 'peer_buddy' | 'audio_remedial' | 'worksheet' | 'small_group';
  reason: string;
  suggestedAction: string;
  urgency: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_action' | 'resolved';
  createdAt: string;
}

export interface SchoolDeviceMetric {
  id: string;
  name: string;
  type: 'Tablet' | 'Community Phone' | 'Edge Server';
  batteryPercentage: number;
  lastSynced: string;
  status: 'healthy' | 'charging' | 'needs_sync' | 'offline';
  assignedCohort: string;
}

export interface OfflineSyncItem {
  id: string;
  lessonId: string;
  lessonTitle: string;
  subject: string;
  fileSizeBytes: number;
  downloadedAt?: string;
  isCached: boolean;
}
