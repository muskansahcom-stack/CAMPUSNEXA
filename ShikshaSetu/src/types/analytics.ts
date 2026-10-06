/**
 * ShikshaSetu Analytics Layer Types
 * Comprehensive contracts for Student, Teacher, and School Analytics
 * Driven by real database schema with date range filtering and privacy safeguards.
 */

export type DateFilterPeriod = 'today' | '7d' | '30d' | 'custom';

export interface DateRangeFilter {
  period: DateFilterPeriod;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

// -----------------------------------------------------------------------------
// 1. STUDENT ANALYTICS CONTRACTS
// -----------------------------------------------------------------------------

export interface StudentTopicMasteryItem {
  topicId: string;
  name: string;
  subject: string;
  score: number;
  attempts: number;
  correctAttempts: number;
  status: 'mastered' | 'developing' | 'needs_practice';
  lastAttempted: string;
}

export interface StudentLearningTimePoint {
  date: string;
  label: string;
  minutes: number;
}

export interface StudentQuizHistoryItem {
  id: string;
  title: string;
  scorePct: number;
  totalQuestions: number;
  correctCount: number;
  durationSeconds: number;
  completedAt: string;
}

export interface StudentLessonCompletedItem {
  id: string;
  title: string;
  subject: string;
  completedAt: string;
  timeSpentMinutes: number;
}

export interface StudentImprovementPoint {
  date: string;
  label: string;
  masteryScore: number;
  quizAccuracy: number;
}

export interface StudentDayActivityItem {
  day: string;
  date: string;
  active: boolean;
  minutes: number;
  score: number;
}

export interface StudentAnalyticsData {
  studentId: string;
  studentName: string;
  filter: DateRangeFilter;
  
  // Topic mastery
  topicMastery: {
    overallMasteryPct: number;
    distribution: {
      mastered: number;
      developing: number;
      needsPractice: number;
    };
    topics: StudentTopicMasteryItem[];
  };

  // Learning time
  learningTime: {
    totalMinutes: number;
    dailyAverageMinutes: number;
    todayMinutes: number;
    dailyGoalMinutes: number;
    timeline: StudentLearningTimePoint[];
  };

  // Quiz performance
  quizPerformance: {
    accuracyPct: number;
    totalQuizzes: number;
    averageScore: number;
    averageResponseTimeSeconds: number;
    totalQuestionsAttempted: number;
    correctQuestionsCount: number;
    recentQuizzes: StudentQuizHistoryItem[];
  };

  // Lessons completed
  lessonsCompleted: {
    totalCompleted: number;
    completionRatePct: number;
    inProgressCount: number;
    recentLessons: StudentLessonCompletedItem[];
  };

  // Improvement over time
  improvementOverTime: {
    trajectory: StudentImprovementPoint[];
    growthRatePct: number;
    baselineMasteryPct: number;
    currentMasteryPct: number;
  };

  // Streak
  streak: {
    currentStreakDays: number;
    bestStreakDays: number;
    streakStatus: string;
  };

  // Learning consistency
  learningConsistency: {
    consistencyScorePct: number;
    activeDaysCount: number;
    totalDaysCount: number;
    rating: string;
    dayOfWeekActivity: StudentDayActivityItem[];
  };
}

// -----------------------------------------------------------------------------
// 2. TEACHER ANALYTICS CONTRACTS
// -----------------------------------------------------------------------------

export interface TeacherSubjectProgressItem {
  subject: string;
  progressPct: number;
  studentsCount: number;
}

export interface TeacherSectionComparisonItem {
  className: string;
  averageProgressPct: number;
  studentsCount: number;
}

export interface TeacherTopicDifficultyItem {
  topicId: string;
  name: string;
  subject: string;
  difficultyLevel: number; // 1 to 5
  errorRatePct: number;
  averageAttempts: number;
  errorPatternReason: string;
  recommendedAction: string;
}

export interface TeacherStudentSupportItem {
  studentId: string;
  studentName: string;
  className: string;
  topic: string;
  mastery: number;
  recentAttempts: number;
  reason: string;
  aiSupportNote: string;
  recommendedAction: string;
  isDismissed: boolean;
}

export interface TeacherAssignmentDetailItem {
  id: string;
  title: string;
  subject: string;
  className: string;
  dueDate: string;
  totalAssigned: number;
  completedCount: number;
  completionRatePct: number;
  status: 'on_track' | 'needs_attention' | 'completed';
}

export interface TeacherEngagementPoint {
  date: string;
  label: string;
  activeCount: number;
  avgMinutes: number;
}

export interface TeacherAnalyticsData {
  teacherId: string;
  schoolId: string;
  schoolName: string;
  filter: DateRangeFilter;

  // Class progress
  classProgress: {
    averageProgressPct: number;
    subjectBreakdown: TeacherSubjectProgressItem[];
    sectionComparison: TeacherSectionComparisonItem[];
    distribution: {
      onTrack: number;
      developing: number;
      needsSupport: number;
    };
  };

  // Topic difficulty patterns
  topicDifficultyPatterns: TeacherTopicDifficultyItem[];

  // Students needing support
  studentsNeedingSupport: {
    totalCount: number;
    alerts: TeacherStudentSupportItem[];
  };

  // Assignment completion
  assignmentCompletion: {
    overallCompletionRatePct: number;
    totalAssignments: number;
    submittedCount: number;
    pendingCount: number;
    overdueCount: number;
    onTimeRatePct: number;
    assignmentDetails: TeacherAssignmentDetailItem[];
  };

  // Learning engagement
  learningEngagement: {
    activeRatePct: number;
    averageStudyTimePerStudentMinutes: number;
    totalInteractions: number;
    activeStudentsCount: number;
    totalStudentsCount: number;
    dailyActivityTrend: TeacherEngagementPoint[];
  };
}

// -----------------------------------------------------------------------------
// 3. SCHOOL ANALYTICS CONTRACTS
// -----------------------------------------------------------------------------

export interface SchoolGradeProgressItem {
  grade: number;
  label: string;
  progressPct: number;
  studentsCount: number;
}

export interface SchoolProgressTrajectoryItem {
  periodLabel: string;
  progressPct: number;
  targetPct: number;
}

export interface SchoolParticipationPoint {
  date: string;
  label: string;
  activeRatePct: number;
  offlineSyncPct: number;
}

export interface SchoolDeviceUsageItem {
  deviceType: string;
  label: string;
  hours: number;
  percentage: number;
}

export interface SchoolSubjectTrendItem {
  subject: string;
  averageMasteryPct: number;
  growthDeltaPct: number;
  activeLearners: number;
  completionRatePct: number;
  trend: 'up' | 'stable' | 'down';
}

export interface SchoolContentFormatItem {
  format: string;
  label: string;
  interactionCount: number;
  percentage: number;
}

export interface SchoolTopModuleItem {
  id: string;
  title: string;
  subject: string;
  accessesCount: number;
  completionRatePct: number;
}

export interface SchoolConnectivityPacingItem {
  mode: string;
  label: string;
  learnersCount: number;
  percentage: number;
}

export interface SchoolAnalyticsData {
  schoolId: string;
  schoolName: string;
  filter: DateRangeFilter;

  // Overall progress
  overallProgress: {
    schoolAverageProgressPct: number;
    gradeProgress: SchoolGradeProgressItem[];
    progressTrajectory: SchoolProgressTrajectoryItem[];
  };

  // Participation
  participation: {
    dailyParticipationRatePct: number;
    activeLearnersCount: number;
    totalEnrolledStudents: number;
    teacherParticipationRatePct: number;
    participationTimeline: SchoolParticipationPoint[];
  };

  // Completion
  completion: {
    curriculumCompletionRatePct: number;
    totalLessonsCompleted: number;
    totalQuizzesCompleted: number;
    milestonesReached: number;
  };

  // Learning time
  learningTime: {
    totalLearningHours: number;
    averageMinutesPerStudent: number;
    deviceDistribution: SchoolDeviceUsageItem[];
  };

  // Subject trends
  subjectTrends: SchoolSubjectTrendItem[];

  // Content usage
  contentUsage: {
    totalContentInteractions: number;
    formatBreakdown: SchoolContentFormatItem[];
    topModules: SchoolTopModuleItem[];
  };

  // Offline usage
  offlineUsage: {
    offlineLearnersCount: number;
    offlineLearnersPct: number;
    syncPacketsProcessed: number;
    dataSavedMb: number;
    connectivityPacingBreakdown: SchoolConnectivityPacingItem[];
  };
}
