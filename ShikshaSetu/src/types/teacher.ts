export type SupportPatternType =
  | 'repeated_mistakes'
  | 'declining_mastery'
  | 'low_engagement'
  | 'repeated_attempts_no_improvement';

export type SupportAlertStatus = 'needs_support' | 'in_progress' | 'resolved' | 'dismissed';

export interface LearningSupportAlert {
  id: string;
  studentId: string;
  studentName: string;
  studentAvatar?: string;
  grade: number;
  className: string;
  subject: string;
  topic: string;
  topicId: string;
  mastery: number; // e.g. 43 for 43%
  recentAttempts: number; // e.g. 3
  status: SupportAlertStatus;
  statusLabel: string; // e.g. "Needs support"
  patternType: SupportPatternType;
  reason: string; // e.g. "Repeated difficulty with equivalent fractions."
  aiSupportNote: string; // e.g. "May need additional support with foundational fraction decomposition."
  recommendedAction: string; // e.g. "Assign Fractions Revision Lesson"
  recommendedActionType: 'revision_lesson' | 'micro_worksheet' | 'peer_pairing' | 'voice_checkin';
  createdAt: string;
  isDismissed?: boolean;
}

export interface LearningPathNode {
  id: string;
  topicName: string;
  subject: string;
  sequence: number;
  status: 'completed' | 'in_progress' | 'needs_practice' | 'upcoming';
  masteryScore: number;
  prerequisiteOf?: string;
}

export interface TopicMasteryItem {
  topicId: string;
  topicName: string;
  subject: string;
  masteryScore: number;
  attempts: number;
  correctAttempts: number;
  lastAttempted: string;
  status: 'mastered' | 'developing' | 'needs_practice';
}

export interface StudentQuizAttempt {
  id: string;
  topicName: string;
  date: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeSpentSeconds: number;
  notes?: string;
}

export interface CompletedLessonItem {
  lessonId: string;
  title: string;
  subject: string;
  completedAt: string;
  timeSpentMinutes: number;
  score: number;
}

export interface StudentDetailData {
  student: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    grade: number;
    className: string;
    preferredLanguage: string;
    deviceAccess: string;
    connectivityLevel: string;
    batteryLevel?: number;
    schoolName: string;
    lastActive: string;
    overallProgressPct: number;
  };
  learningPath: LearningPathNode[];
  topicMastery: TopicMasteryItem[];
  recentAttempts: StudentQuizAttempt[];
  completedLessons: CompletedLessonItem[];
  quizPerformance: {
    totalQuizzesTaken: number;
    averageAccuracy: number;
    correctAnswers: number;
    totalQuestionsAttempted: number;
    averageResponseTimeSeconds: number;
  };
  learningTime: {
    totalMinutesThisMonth: number;
    weeklyAverageMinutes: number;
    todayMinutes: number;
    streakDays: number;
    dailyActivity: Array<{ day: string; minutes: number }>;
  };
  recommendedSupport: {
    hasAlert: boolean;
    patternType?: SupportPatternType;
    supportPhrase: string; // "May need additional support."
    reason: string;
    detailedObservation: string;
    suggestedAction: string;
  };
}

export interface AssignmentStudentStatus {
  studentId: string;
  studentName: string;
  status: 'completed' | 'in_progress' | 'not_started';
  submittedAt?: string;
  score?: number;
}

export interface TeacherAssignment {
  id: string;
  title: string;
  topicId: string;
  topicName: string;
  subject: string;
  grade: number;
  className: string;
  assignedStudentIds: string[]; // empty = entire class
  assignedStudentCount: number;
  completedCount: number;
  pendingCount: number;
  completionRate: number; // 0 to 100
  assignedDate: string;
  dueDate: string;
  instructions?: string;
  status: 'active' | 'completed' | 'past_due';
  studentStatuses: AssignmentStudentStatus[];
}

export interface ClassroomFilterState {
  selectedClass: string;
  selectedSubject: string;
  selectedGrade: string;
  selectedMastery: string;
  selectedSupportStatus: string;
  searchQuery: string;
}

export interface TeacherDashboardMetrics {
  totalStudents: number;
  activeLearners: number;
  averageProgress: number;
  activeAssignments: number;
  studentsNeedingSupport: number;
  classPerformance: Array<{
    subject: string;
    averageMastery: number;
    masteredCount: number;
    developingCount: number;
    needsSupportCount: number;
    totalEvaluated: number;
  }>;
  recentActivity: Array<{
    id: string;
    studentName: string;
    studentId: string;
    action: string;
    topic: string;
    timestamp: string;
    score?: number;
    type: 'quiz' | 'lesson' | 'assignment' | 'sync';
  }>;
}
