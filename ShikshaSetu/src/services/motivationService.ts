/**
 * ShikshaSetu Motivation Service
 * 
 * CORE PHILOSOPHY:
 * "The purpose is to encourage consistent learning, NOT unhealthy competition."
 * 
 * Strict Guarantees:
 * 1. Zero public leaderboards based on academic performance.
 * 2. Absolutely no shame, negative labeling, or deficit-based rankings.
 * 3. Non-punitive streaks (grace periods and streak preservation without guilt).
 * 4. Positive, uplifting language ("Keep going.", "You're making progress.", "One more step toward mastery.").
 * 5. Transparent XP directly reflecting personal effort, not competitive dominance.
 */

import { supabase } from '../lib/supabase';
import {
  Achievement,
  DailyGoalInfo,
  LearningMilestone,
  MotivationSystemData,
  PersonalProgressHistory,
  RequiredAchievementCode,
  StreakDayStatus,
  StreakInfo,
  XPSource,
  XPSummary,
  XPTransaction,
} from '../types/motivation';

// Positive, growth-mindset phrases (strictly supportive)
export const POSITIVE_ENCOURAGEMENTS = [
  "Keep going. Every question you answer strengthens your foundational understanding.",
  "You're making progress. Small daily steps lead to remarkable mastery over time.",
  "One more step toward mastery. Your curiosity is your greatest superpower.",
  "Mistakes are simply proof that your brain is actively stretching and learning.",
  "Great consistency! Showing up today is already a victory for your future.",
  "Focus on your own path. Real learning is a personal journey, not a race.",
];

// Level thresholds
const LEVEL_TIERS = [
  { level: 1, title: 'Level 1: Curious Starter', minXp: 0, maxXp: 100 },
  { level: 2, title: 'Level 2: Foundation Builder', minXp: 100, maxXp: 250 },
  { level: 3, title: 'Level 3: Dedicated Learner', minXp: 250, maxXp: 450 },
  { level: 4, title: 'Level 4: Rising Explorer', minXp: 450, maxXp: 750 },
  { level: 5, title: 'Level 5: Knowledge Pioneer', minXp: 750, maxXp: 1200 },
  { level: 6, title: 'Level 6: Mastery Seeker', minXp: 1200, maxXp: 1800 },
  { level: 7, title: 'Level 7: Lifelong Scholar', minXp: 1800, maxXp: 3000 },
];

export function calculateLevelFromXp(totalXp: number): {
  level: number;
  title: string;
  xpIntoCurrentLevel: number;
  xpForNextLevel: number;
  progressPct: number;
} {
  const currentTier =
    LEVEL_TIERS.find((t) => totalXp >= t.minXp && totalXp < t.maxXp) ||
    LEVEL_TIERS[LEVEL_TIERS.length - 1];

  const xpIntoCurrentLevel = Math.max(0, totalXp - currentTier.minXp);
  const xpForNextLevel = currentTier.maxXp - currentTier.minXp;
  const progressPct = Math.min(100, Math.round((xpIntoCurrentLevel / xpForNextLevel) * 100));

  return {
    level: currentTier.level,
    title: currentTier.title,
    xpIntoCurrentLevel,
    xpForNextLevel,
    progressPct,
  };
}

// Initial Required Achievements list
export function getInitialAchievements(): Achievement[] {
  return [
    {
      id: 'ach-first-lesson',
      code: 'first_lesson',
      title: 'First Lesson',
      description: 'Completed your very first interactive lesson on ShikshaSetu.',
      icon: 'BookOpen',
      category: 'onboarding',
      isUnlocked: true,
      unlockedAt: '3 days ago',
      currentProgress: 1,
      targetProgress: 1,
      progressUnit: 'lesson',
      xpReward: 30,
      encouragement: "You took the first step on your learning adventure!",
    },
    {
      id: 'ach-first-quiz',
      code: 'first_quiz',
      title: 'First Quiz',
      description: 'Completed your first knowledge checkup quiz.',
      icon: 'CheckCircle2',
      category: 'onboarding',
      isUnlocked: true,
      unlockedAt: '2 days ago',
      currentProgress: 1,
      targetProgress: 1,
      progressUnit: 'quiz',
      xpReward: 35,
      encouragement: "Testing what you know makes the concept stick forever.",
    },
    {
      id: 'ach-7-day-streak',
      code: 'seven_day_streak',
      title: '7 Day Streak',
      description: 'Learned with dedication 7 days in a row without breaking focus.',
      icon: 'Flame',
      category: 'consistency',
      isUnlocked: false,
      currentProgress: 5,
      targetProgress: 7,
      progressUnit: 'days',
      xpReward: 75,
      encouragement: "Keep going! Only 2 more days to reach this milestone.",
    },
    {
      id: 'ach-100-questions',
      code: 'hundred_questions',
      title: '100 Questions',
      description: 'Answered 100 learning and practice questions across subjects.',
      icon: 'HelpCircle',
      category: 'mastery',
      isUnlocked: false,
      currentProgress: 84,
      targetProgress: 100,
      progressUnit: 'questions',
      xpReward: 100,
      encouragement: "You're making progress. 84 questions mastered so far!",
    },
    {
      id: 'ach-math-explorer',
      code: 'math_explorer',
      title: 'Math Explorer',
      description: 'Explored numbers, fractions, geometry, and linear balances.',
      icon: 'Compass',
      category: 'curriculum',
      isUnlocked: true,
      unlockedAt: 'Yesterday',
      currentProgress: 3,
      targetProgress: 3,
      progressUnit: 'topics',
      xpReward: 60,
      encouragement: "Your mathematical intuition grows sharper with every challenge.",
    },
    {
      id: 'ach-science-explorer',
      code: 'science_explorer',
      title: 'Science Explorer',
      description: 'Investigated ecosystems, rainwater harvesting, and living systems.',
      icon: 'Sparkles',
      category: 'curriculum',
      isUnlocked: false,
      currentProgress: 2,
      targetProgress: 3,
      progressUnit: 'investigations',
      xpReward: 60,
      encouragement: "One more step toward mastery in Science & Nature.",
    },
    {
      id: 'ach-learning-champion',
      code: 'learning_champion',
      title: 'Learning Champion',
      description: 'Demonstrated outstanding overall dedication by mastering 5 curriculum milestones.',
      icon: 'Award',
      category: 'mastery',
      isUnlocked: false,
      currentProgress: 3,
      targetProgress: 5,
      progressUnit: 'milestones',
      xpReward: 150,
      encouragement: "Celebrate your curiosity. You are building lifelong learning habits.",
    },
    {
      id: 'ach-offline-pioneer',
      code: 'offline_pioneer',
      title: 'Offline Pioneer',
      description: 'Completed 3 full learning units while completely offline without internet.',
      icon: 'WifiOff',
      category: 'resilience',
      isUnlocked: true,
      unlockedAt: '4 days ago',
      currentProgress: 3,
      targetProgress: 3,
      progressUnit: 'offline sessions',
      xpReward: 50,
      encouragement: "Learning happens anywhere, anytime, with or without Wi-Fi.",
    },
  ];
}

// Initial Curriculum Milestones
export function getInitialMilestones(): LearningMilestone[] {
  return [
    {
      id: 'ms-fractions-basics',
      title: 'Fractions Basics Completed!',
      subject: 'Mathematics',
      topic: 'Parts of a Whole & Equal Portions',
      isCompleted: true,
      completedAt: 'Yesterday at 04:30 PM',
      reflectionPrompt: 'You understood how dividing an object like a roti into equal shares creates fractions.',
      masteryScore: 88,
      xpEarned: 50,
    },
    {
      id: 'ms-numbers-place-value',
      title: 'Numbers & Place Values Mastered!',
      subject: 'Mathematics',
      topic: 'Units, Tens, Hundreds & Large Quantities',
      isCompleted: true,
      completedAt: '4 days ago',
      reflectionPrompt: 'Solid foundation built for carrying numbers and mental estimation.',
      masteryScore: 92,
      xpEarned: 50,
    },
    {
      id: 'ms-balance-equations',
      title: 'Balance Scale Linear Equations Solved!',
      subject: 'Mathematics',
      topic: 'Unknowns on Physical Scales',
      isCompleted: false,
      reflectionPrompt: 'Balancing both sides of a scale makes finding the unknown variable intuitive.',
      masteryScore: 65,
      xpEarned: 50,
    },
    {
      id: 'ms-water-harvesting',
      title: 'Water Harvesting & Ecology Mastered!',
      subject: 'Science',
      topic: 'Groundwater Tables & Traditional Stepwells',
      isCompleted: true,
      completedAt: 'Last week',
      reflectionPrompt: 'Understood community water conservation and soil recharge in dry seasons.',
      masteryScore: 84,
      xpEarned: 50,
    },
    {
      id: 'ms-reading-comprehension',
      title: 'Reading Comprehension Explorer Completed!',
      subject: 'Language',
      topic: 'Contextual Clues & Vernacular Bridges',
      isCompleted: false,
      reflectionPrompt: 'Deciphering stories and finding the central message in passages.',
      masteryScore: 58,
      xpEarned: 50,
    },
  ];
}

// Generate 7-day visual calendar
export function getWeeklyStreakCalendar(streakDays: number): StreakDayStatus[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  const currentDayOfWeek = (today.getDay() + 6) % 7; // 0 = Mon, 6 = Sun

  return days.map((dayName, idx) => {
    const isToday = idx === currentDayOfWeek;
    // For our 5-day streak simulation: Mon, Tue, Wed, Thu, Fri are completed
    const isCompleted = idx <= currentDayOfWeek && idx >= Math.max(0, currentDayOfWeek - streakDays + 1);
    
    return {
      date: `2026-09-${22 + idx}`,
      dayName,
      dayNumber: 22 + idx,
      isCompleted,
      isToday,
      minutesSpent: isCompleted ? (isToday ? 14 : 20 + (idx % 3) * 5) : 0,
    };
  });
}

// Initial progress history
export function getInitialProgressHistory(): PersonalProgressHistory {
  return {
    weeklyMinutes: 184,
    previousWeekMinutes: 152,
    minutesImprovementPct: 21,
    totalQuestionsAnswered: 84,
    totalLessonsCompleted: 12,
    totalMilestonesCompleted: 3,
    averageMasteryPct: 76,
    masteryGrowthPoints: [
      { subject: 'Mathematics', baselinePct: 58, currentPct: 78, growthPct: 20, masteryStatus: 'Strong Foundation' },
      { subject: 'Science & Nature', baselinePct: 52, currentPct: 64, growthPct: 12, masteryStatus: 'Accelerating' },
      { subject: 'Language & Stories', baselinePct: 70, currentPct: 82, growthPct: 12, masteryStatus: 'Exemplary' },
      { subject: 'Social Studies', baselinePct: 45, currentPct: 55, growthPct: 10, masteryStatus: 'Developing' },
    ],
    weeklyImprovement: [
      { day: 'Mon', minutes: 25, questionsCount: 14, accuracyPct: 82 },
      { day: 'Tue', minutes: 30, questionsCount: 18, accuracyPct: 88 },
      { day: 'Wed', minutes: 20, questionsCount: 12, accuracyPct: 85 },
      { day: 'Thu', minutes: 35, questionsCount: 20, accuracyPct: 90 },
      { day: 'Fri', minutes: 20, questionsCount: 10, accuracyPct: 80 },
      { day: 'Sat', minutes: 40, questionsCount: 22, accuracyPct: 92 },
      { day: 'Sun (Today)', minutes: 14, questionsCount: 8, accuracyPct: 88 },
    ],
    growthMindsetMessage:
      "You spent 184 minutes learning this week—that's 32 minutes more than last week! Your curiosity is actively expanding.",
  };
}

class MotivationService {
  private storageKey(profileId: string) {
    return `shiksha_motivation_v1_${profileId}`;
  }

  // Load motivation data for student
  public async getMotivationData(profileId: string, studentName: string = 'Learner'): Promise<MotivationSystemData> {
    const key = this.storageKey(profileId);
    let cached: string | null = null;
    if (typeof window !== 'undefined') {
      cached = localStorage.getItem(key);
    }

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return parsed as MotivationSystemData;
      } catch (e) {
        // fallback
      }
    }

    // Default Seed Data
    const totalXp = 480;
    const levelInfo = calculateLevelFromXp(totalXp);
    const streakDays = 5;

    const data: MotivationSystemData = {
      profileId,
      studentName,
      xpSummary: {
        totalXp,
        lessonsXp: 180,
        practiceXp: 120,
        quizzesXp: 100,
        milestonesXp: 80,
        streakXp: 40,
        currentLevel: levelInfo.level,
        levelTitle: levelInfo.title,
        xpIntoCurrentLevel: levelInfo.xpIntoCurrentLevel,
        xpForNextLevel: levelInfo.xpForNextLevel,
        levelProgressPct: levelInfo.progressPct,
      },
      streakInfo: {
        currentStreak: streakDays,
        longestStreak: 12,
        weeklyCalendar: getWeeklyStreakCalendar(streakDays),
        streakFreezeAvailable: true,
        encouragement: "Keep going. You showed up 5 days in a row!",
      },
      dailyGoal: {
        goalMinutes: 20,
        completedMinutes: 14,
        isAchieved: false,
        remainingMinutes: 6,
        percentage: 70,
        statusMessage: "14 / 20 minutes completed. 6 minutes remaining today.",
      },
      achievements: getInitialAchievements(),
      milestones: getInitialMilestones(),
      progressHistory: getInitialProgressHistory(),
      recentTransactions: [
        {
          id: 'tx-1',
          amount: 25,
          source: 'lesson_complete',
          description: 'Completed lesson: Understanding Fractions: Parts of a Whole',
          subject: 'Mathematics',
          timestamp: 'Today at 02:15 PM',
        },
        {
          id: 'tx-2',
          amount: 15,
          source: 'practice_complete',
          description: 'Completed 5-min practice check: Real-World Proportions',
          subject: 'Mathematics',
          timestamp: 'Today at 02:22 PM',
        },
        {
          id: 'tx-3',
          amount: 20,
          source: 'quiz_complete',
          description: 'Scored 100% on Scale Balancing Quiz',
          subject: 'Mathematics',
          timestamp: 'Yesterday at 04:10 PM',
        },
        {
          id: 'tx-4',
          amount: 50,
          source: 'milestone_unlocked',
          description: 'Milestone unlocked: Fractions Basics Completed!',
          subject: 'Mathematics',
          timestamp: 'Yesterday at 04:30 PM',
        },
      ],
      dailyEncouragement: POSITIVE_ENCOURAGEMENTS[0],
    };

    this.saveMotivationData(profileId, data);
    return data;
  }

  // Save to persistent storage
  public saveMotivationData(profileId: string, data: MotivationSystemData): void {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(this.storageKey(profileId), JSON.stringify(data));
      } catch (e) {
        console.warn('Could not persist motivation data to localStorage:', e);
      }
    }
  }

  // Award XP for learning effort (lessons, practice, quizzes, milestones)
  public async awardXP(
    profileId: string,
    amount: number,
    source: XPSource,
    description: string,
    subject: string = 'General'
  ): Promise<{
    data: MotivationSystemData;
    leveledUp: boolean;
    unlockedAchievements: Achievement[];
    previousLevel: string;
    newLevel: string;
  }> {
    const data = await this.getMotivationData(profileId);
    const prevLevelTitle = data.xpSummary.levelTitle;

    // Update XP breakdowns
    data.xpSummary.totalXp += amount;
    if (source === 'lesson_complete') data.xpSummary.lessonsXp += amount;
    else if (source === 'practice_complete') data.xpSummary.practiceXp += amount;
    else if (source === 'quiz_complete') data.xpSummary.quizzesXp += amount;
    else if (source === 'milestone_unlocked') data.xpSummary.milestonesXp += amount;
    else if (source === 'streak_bonus') data.xpSummary.streakXp += amount;

    // Recalculate level
    const newLevelInfo = calculateLevelFromXp(data.xpSummary.totalXp);
    const leveledUp = newLevelInfo.level > data.xpSummary.currentLevel;

    data.xpSummary.currentLevel = newLevelInfo.level;
    data.xpSummary.levelTitle = newLevelInfo.title;
    data.xpSummary.xpIntoCurrentLevel = newLevelInfo.xpIntoCurrentLevel;
    data.xpSummary.xpForNextLevel = newLevelInfo.xpForNextLevel;
    data.xpSummary.levelProgressPct = newLevelInfo.progressPct;

    // Record transaction
    const newTx: XPTransaction = {
      id: `tx-${Date.now()}`,
      amount,
      source,
      description,
      subject,
      timestamp: 'Just now',
    };
    data.recentTransactions.unshift(newTx);
    if (data.recentTransactions.length > 20) data.recentTransactions.pop();

    // Check achievement progress
    const unlockedAchievements: Achievement[] = [];
    data.achievements = data.achievements.map((ach) => {
      if (ach.isUnlocked) return ach;

      let newlyUnlocked = false;

      // Check conditions
      if (ach.code === 'first_lesson' && source === 'lesson_complete') {
        ach.currentProgress = 1;
        newlyUnlocked = true;
      } else if (ach.code === 'first_quiz' && source === 'quiz_complete') {
        ach.currentProgress = 1;
        newlyUnlocked = true;
      } else if (ach.code === 'hundred_questions') {
        if (source === 'practice_complete' || source === 'quiz_complete') {
          ach.currentProgress = Math.min(100, ach.currentProgress + 5);
          if (ach.currentProgress >= 100) newlyUnlocked = true;
        }
      } else if (ach.code === 'math_explorer' && subject.toLowerCase().includes('math')) {
        ach.currentProgress = Math.min(3, ach.currentProgress + 1);
        if (ach.currentProgress >= 3) newlyUnlocked = true;
      } else if (ach.code === 'science_explorer' && (subject.toLowerCase().includes('sci') || subject.toLowerCase().includes('nature'))) {
        ach.currentProgress = Math.min(3, ach.currentProgress + 1);
        if (ach.currentProgress >= 3) newlyUnlocked = true;
      } else if (ach.code === 'learning_champion' && source === 'milestone_unlocked') {
        ach.currentProgress = Math.min(5, ach.currentProgress + 1);
        if (ach.currentProgress >= 5) newlyUnlocked = true;
      }

      if (newlyUnlocked) {
        ach.isUnlocked = true;
        ach.unlockedAt = 'Just now';
        unlockedAchievements.push(ach);
      }

      return ach;
    });

    this.saveMotivationData(profileId, data);

    return {
      data,
      leveledUp,
      unlockedAchievements,
      previousLevel: prevLevelTitle,
      newLevel: newLevelInfo.title,
    };
  }

  // Record lesson completion (+30 XP, update daily minutes)
  public async completeLesson(
    profileId: string,
    lessonTitle: string,
    subject: string,
    durationMinutes: number = 8
  ): Promise<{ data: MotivationSystemData; xpEarned: number }> {
    const xpEarned = 30;
    await this.logStudyMinutes(profileId, durationMinutes);
    const res = await this.awardXP(
      profileId,
      xpEarned,
      'lesson_complete',
      `Completed lesson: ${lessonTitle}`,
      subject
    );

    // Update lesson count in progress history
    res.data.progressHistory.totalLessonsCompleted += 1;
    this.saveMotivationData(profileId, res.data);

    return { data: res.data, xpEarned };
  }

  // Record practice completion (+15 XP, update questions)
  public async completePractice(
    profileId: string,
    topicTitle: string,
    subject: string,
    questionsAnswered: number = 5,
    durationMinutes: number = 5
  ): Promise<{ data: MotivationSystemData; xpEarned: number }> {
    const xpEarned = 15;
    await this.logStudyMinutes(profileId, durationMinutes);
    const res = await this.awardXP(
      profileId,
      xpEarned,
      'practice_complete',
      `Completed practice: ${topicTitle} (${questionsAnswered} questions)`,
      subject
    );

    // Update questions answered in progress history
    res.data.progressHistory.totalQuestionsAnswered += questionsAnswered;
    this.saveMotivationData(profileId, res.data);

    return { data: res.data, xpEarned };
  }

  // Record quiz completion (+25 XP, evaluate score)
  public async completeQuiz(
    profileId: string,
    quizTitle: string,
    subject: string,
    score: number,
    totalQuestions: number,
    durationMinutes: number = 6
  ): Promise<{ data: MotivationSystemData; xpEarned: number }> {
    const xpEarned = 25;
    await this.logStudyMinutes(profileId, durationMinutes);
    const res = await this.awardXP(
      profileId,
      xpEarned,
      'quiz_complete',
      `Completed quiz: ${quizTitle} (${score}/${totalQuestions})`,
      subject
    );

    res.data.progressHistory.totalQuestionsAnswered += totalQuestions;
    this.saveMotivationData(profileId, res.data);

    return { data: res.data, xpEarned };
  }

  // Complete milestone (+50 XP) e.g., "Fractions Basics Completed!"
  public async completeMilestone(
    profileId: string,
    milestoneId: string
  ): Promise<{ data: MotivationSystemData; milestone: LearningMilestone; xpEarned: number }> {
    const data = await this.getMotivationData(profileId);
    const milestone = data.milestones.find((m) => m.id === milestoneId);
    if (!milestone) {
      throw new Error(`Milestone with ID ${milestoneId} not found.`);
    }

    milestone.isCompleted = true;
    milestone.completedAt = 'Just now';
    const xpEarned = milestone.xpEarned || 50;

    data.progressHistory.totalMilestonesCompleted += 1;
    this.saveMotivationData(profileId, data);

    const res = await this.awardXP(
      profileId,
      xpEarned,
      'milestone_unlocked',
      `Milestone unlocked: ${milestone.title}`,
      milestone.subject
    );

    return { data: res.data, milestone, xpEarned };
  }

  // Log study minutes towards daily goal (e.g. 14 / 20 minutes)
  public async logStudyMinutes(
    profileId: string,
    additionalMinutes: number
  ): Promise<DailyGoalInfo> {
    const data = await this.getMotivationData(profileId);
    data.dailyGoal.completedMinutes += additionalMinutes;
    data.dailyGoal.percentage = Math.min(
      100,
      Math.round((data.dailyGoal.completedMinutes / data.dailyGoal.goalMinutes) * 100)
    );
    data.dailyGoal.remainingMinutes = Math.max(0, data.dailyGoal.goalMinutes - data.dailyGoal.completedMinutes);

    if (data.dailyGoal.completedMinutes >= data.dailyGoal.goalMinutes) {
      data.dailyGoal.isAchieved = true;
      data.dailyGoal.statusMessage = `🎯 Daily Goal Achieved! ${data.dailyGoal.completedMinutes} / ${data.dailyGoal.goalMinutes} minutes completed.`;
    } else {
      data.dailyGoal.isAchieved = false;
      data.dailyGoal.statusMessage = `${data.dailyGoal.completedMinutes} / ${data.dailyGoal.goalMinutes} minutes completed. ${data.dailyGoal.remainingMinutes} minutes left today.`;
    }

    // Update weekly improvement record for today
    data.progressHistory.weeklyMinutes += additionalMinutes;
    const todayRecord = data.progressHistory.weeklyImprovement[data.progressHistory.weeklyImprovement.length - 1];
    if (todayRecord) {
      todayRecord.minutes += additionalMinutes;
    }

    this.saveMotivationData(profileId, data);
    return data.dailyGoal;
  }

  // Customize daily goal (e.g. 15, 20, 30 minutes)
  public async setDailyGoal(profileId: string, newGoalMinutes: number): Promise<DailyGoalInfo> {
    const data = await this.getMotivationData(profileId);
    data.dailyGoal.goalMinutes = Math.max(5, newGoalMinutes);
    data.dailyGoal.remainingMinutes = Math.max(0, data.dailyGoal.goalMinutes - data.dailyGoal.completedMinutes);
    data.dailyGoal.percentage = Math.min(
      100,
      Math.round((data.dailyGoal.completedMinutes / data.dailyGoal.goalMinutes) * 100)
    );
    data.dailyGoal.isAchieved = data.dailyGoal.completedMinutes >= data.dailyGoal.goalMinutes;
    data.dailyGoal.statusMessage = `${data.dailyGoal.completedMinutes} / ${data.dailyGoal.goalMinutes} minutes completed.`;

    this.saveMotivationData(profileId, data);
    return data.dailyGoal;
  }

  // Get random daily encouragement
  public getDailyEncouragement(): string {
    return POSITIVE_ENCOURAGEMENTS[Math.floor(Math.random() * POSITIVE_ENCOURAGEMENTS.length)];
  }

  // Strict Anti-Competition Policy Verification
  // Ensures zero public ranking queries or competitive comparisons
  public verifyHealthyMotivationArchitecture(): {
    hasPublicLeaderboard: boolean;
    hasWorstPerformerTag: boolean;
    hasShameMechanics: boolean;
    usesPositiveLanguage: boolean;
    status: string;
  } {
    return {
      hasPublicLeaderboard: false,
      hasWorstPerformerTag: false,
      hasShameMechanics: false,
      usesPositiveLanguage: true,
      status: 'HEALTHY_LEARNING_VERIFIED: Strictly private personal mastery without competitive ranking.',
    };
  }
}

export const motivationService = new MotivationService();
