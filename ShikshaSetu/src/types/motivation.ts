/**
 * ShikshaSetu Motivation & Personal Growth System Types
 * 
 * CORE PRINCIPLE:
 * "The purpose is to encourage consistent learning, NOT unhealthy competition."
 * Strictly private, non-punitive, anti-shaming, and growth-mindset oriented.
 */

export type XPSource = 
  | 'lesson_complete'
  | 'practice_complete'
  | 'quiz_complete'
  | 'milestone_unlocked'
  | 'daily_goal_met'
  | 'streak_bonus';

export interface XPTransaction {
  id: string;
  amount: number;
  source: XPSource;
  description: string;
  subject?: string;
  timestamp: string;
}

export interface XPSummary {
  totalXp: number;
  lessonsXp: number;
  practiceXp: number;
  quizzesXp: number;
  milestonesXp: number;
  streakXp: number;
  currentLevel: number;
  levelTitle: string;
  xpIntoCurrentLevel: number;
  xpForNextLevel: number;
  levelProgressPct: number;
}

export interface StreakDayStatus {
  date: string; // YYYY-MM-DD
  dayName: string; // 'Mon', 'Tue', 'Wed', etc.
  dayNumber: number; // 1-31
  isCompleted: boolean;
  isToday: boolean;
  minutesSpent: number;
}

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  weeklyCalendar: StreakDayStatus[];
  streakFreezeAvailable: boolean;
  encouragement: string;
}

export interface DailyGoalInfo {
  goalMinutes: number;
  completedMinutes: number;
  isAchieved: boolean;
  remainingMinutes: number;
  percentage: number;
  statusMessage: string;
}

export type RequiredAchievementCode = 
  | 'first_lesson'
  | 'first_quiz'
  | 'seven_day_streak'
  | 'hundred_questions'
  | 'math_explorer'
  | 'science_explorer'
  | 'learning_champion'
  | 'offline_pioneer';

export interface Achievement {
  id: string;
  code: RequiredAchievementCode;
  title: string;
  description: string;
  icon: string;
  category: 'onboarding' | 'consistency' | 'mastery' | 'curriculum' | 'resilience';
  isUnlocked: boolean;
  unlockedAt?: string;
  currentProgress: number;
  targetProgress: number;
  progressUnit: string;
  xpReward: number;
  encouragement: string;
}

export interface LearningMilestone {
  id: string;
  title: string; // e.g., "Fractions Basics Completed!"
  subject: string;
  topic: string;
  isCompleted: boolean;
  completedAt?: string;
  reflectionPrompt: string;
  masteryScore: number;
  xpEarned: number;
}

export interface WeeklyImprovementPoint {
  day: string; // 'Mon', 'Tue', etc.
  minutes: number;
  questionsCount: number;
  accuracyPct: number;
}

export interface SubjectGrowthPoint {
  subject: string;
  baselinePct: number;
  currentPct: number;
  growthPct: number;
  masteryStatus: string;
}

export interface PersonalProgressHistory {
  weeklyMinutes: number;
  previousWeekMinutes: number;
  minutesImprovementPct: number;
  totalQuestionsAnswered: number;
  totalLessonsCompleted: number;
  totalMilestonesCompleted: number;
  averageMasteryPct: number;
  masteryGrowthPoints: SubjectGrowthPoint[];
  weeklyImprovement: WeeklyImprovementPoint[];
  growthMindsetMessage: string;
}

export interface MotivationSystemData {
  profileId: string;
  studentName: string;
  xpSummary: XPSummary;
  streakInfo: StreakInfo;
  dailyGoal: DailyGoalInfo;
  achievements: Achievement[];
  milestones: LearningMilestone[];
  progressHistory: PersonalProgressHistory;
  recentTransactions: XPTransaction[];
  dailyEncouragement: string;
}
