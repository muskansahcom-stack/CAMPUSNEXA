import { supabase } from '../lib/supabase';
import {
  StudentLearningStatsRow,
  StudentJourneyNodeRow,
  StudentAchievementRow,
  StudentRecentActivityRow,
  StudentActiveLessonRow,
} from '../types/database';

export interface SubjectProgressCard {
  id: string;
  name: string;
  category: string;
  progressPct: number;
  currentTopic: string;
  nextAction: string;
  estimatedMinutes: number;
  colorScheme: 'brand' | 'saffron' | 'forest' | 'purple';
}

export interface StudentDashboardData {
  stats: StudentLearningStatsRow;
  activeLesson: StudentActiveLessonRow;
  journeyNodes: StudentJourneyNodeRow[];
  subjects: SubjectProgressCard[];
  achievements: StudentAchievementRow[];
  recentActivities: StudentRecentActivityRow[];
  aiRecommendation: {
    title: string;
    actionText: string;
    reasoning: string;
    xpBonus: number;
    estimatedMinutes: number;
  };
  dailyMotivation: string;
}

// Positive growth-mindset affirmations (strictly avoided negative labeling)
const GROWTH_MOTIVATIONS = [
  "Let's strengthen this skill today. Consistent practice is the bridge to mastery.",
  "You're getting closer to mastering this topic every single day.",
  "Mistakes are simply proof that your brain is actively growing and adapting.",
  "Take it step by step. Great mathematical intuition builds one challenge at a time.",
  "Your dedication today creates new possibilities for tomorrow.",
];

export async function fetchStudentDashboardData(
  profileId: string,
  studentName: string = 'Learner'
): Promise<StudentDashboardData> {
  // 1. Fetch Learning Stats from Supabase
  let stats: StudentLearningStatsRow = {
    profile_id: profileId,
    streak_days: 5,
    xp_points: 480,
    daily_goal_minutes: 20,
    today_completed_minutes: 14,
    overall_progress_pct: 68,
    current_level_title: 'Level 4: Rising Explorer',
  };

  try {
    const { data: statsData, error: statsErr } = await supabase
      .from('student_learning_stats')
      .select('*')
      .eq('profile_id', profileId)
      .maybeSingle();

    if (!statsErr && statsData) {
      stats = statsData as unknown as StudentLearningStatsRow;
    }
  } catch (err) {
    console.warn('Using default student stats fallback:', err);
  }

  // 2. Fetch Active Lesson
  let activeLesson: StudentActiveLessonRow = {
    profile_id: profileId,
    title: 'Fractions: Unit Fractions in Everyday Life',
    subject: 'Mathematics',
    topic: 'Dividing grain sacks and village market measures',
    progress_pct: 65,
    estimated_remaining_mins: 6,
    next_action_label: 'Resume Practice',
  };

  try {
    const { data: lessonData } = await supabase
      .from('student_active_lesson')
      .select('*')
      .eq('profile_id', profileId)
      .maybeSingle();

    if (lessonData) {
      activeLesson = lessonData as unknown as StudentActiveLessonRow;
    }
  } catch (err) {
    // fallback
  }

  // 3. Fetch Personal Learning Journey Map
  let journeyNodes: StudentJourneyNodeRow[] = [
    {
      id: 'node-1',
      subject: 'Mathematics',
      title: 'Numbers & Place Values',
      order_index: 1,
      status: 'completed',
      estimated_mins: 10,
      badge_label: 'Mastered',
    },
    {
      id: 'node-2',
      subject: 'Mathematics',
      title: 'Addition & Balance Models',
      order_index: 2,
      status: 'completed',
      estimated_mins: 12,
      badge_label: 'Mastered',
    },
    {
      id: 'node-3',
      subject: 'Mathematics',
      title: 'Fractions & Proportions',
      order_index: 3,
      status: 'in_progress',
      estimated_mins: 10,
      badge_label: 'You Are Here',
    },
    {
      id: 'node-4',
      subject: 'Mathematics',
      title: 'Decimals & Money Calculations',
      order_index: 4,
      status: 'locked',
      estimated_mins: 15,
      badge_label: 'Next Milestone',
    },
    {
      id: 'node-5',
      subject: 'Mathematics',
      title: 'Algebraic Thinking & Unknowns',
      order_index: 5,
      status: 'locked',
      estimated_mins: 18,
      badge_label: 'Locked',
    },
  ];

  // Check for personalized learning path from AI Engine (cached or database)
  const cachedReport = typeof window !== 'undefined'
    ? localStorage.getItem(`shiksha_latest_report_${profileId}`)
    : null;

  if (cachedReport) {
    try {
      const parsedReport = JSON.parse(cachedReport);
      if (parsedReport.generatedLearningPath && parsedReport.generatedLearningPath.length > 0) {
        journeyNodes = parsedReport.generatedLearningPath.map((item: any, idx: number) => ({
          id: item.topicId || `node-${idx + 1}`,
          subject: 'Mathematics',
          title: item.topicName,
          order_index: item.sequence || idx + 1,
          status:
            item.status === 'mastered'
              ? 'completed'
              : item.status === 'in_progress'
              ? 'in_progress'
              : 'locked',
          estimated_mins: 10,
          badge_label:
            item.status === 'mastered'
              ? 'Mastered'
              : item.status === 'in_progress'
              ? 'You Are Here'
              : item.status === 'needs_practice'
              ? 'Strengthen'
              : 'Locked',
        }));
      }
    } catch (e) {
      // fallback
    }
  } else {
    try {
      const { data: nodesData } = await supabase
        .from('student_journey_nodes')
        .select('*')
        .order('order_index');

      if (nodesData && nodesData.length > 0) {
        journeyNodes = nodesData as unknown as StudentJourneyNodeRow[];
      }
    } catch (err) {
      // fallback
    }
  }

  // 4. Subjects Progress Cards
  const subjects: SubjectProgressCard[] = [
    {
      id: 'sub-math',
      name: 'Mathematics',
      category: 'STEM',
      progressPct: 78,
      currentTopic: 'Linear Equations with Balances',
      nextAction: 'Start 8-min Practice Quiz',
      estimatedMinutes: 8,
      colorScheme: 'brand',
    },
    {
      id: 'sub-sci',
      name: 'Science & Ecology',
      category: 'STEM',
      progressPct: 64,
      currentTopic: 'Groundwater Table & Traditional Harvesting',
      nextAction: 'Listen to 4-min Audio Story',
      estimatedMinutes: 5,
      colorScheme: 'forest',
    },
    {
      id: 'sub-eng',
      name: 'English & Language',
      category: 'Humanities',
      progressPct: 82,
      currentTopic: 'Reading Comprehension & Vernacular Bridge',
      nextAction: 'Read Chapter Capsule',
      estimatedMinutes: 10,
      colorScheme: 'saffron',
    },
    {
      id: 'sub-sst',
      name: 'Social Studies & Civics',
      category: 'Humanities',
      progressPct: 55,
      currentTopic: 'Village Panchayats & Community Rights',
      nextAction: 'Review Visual Concept Cards',
      estimatedMinutes: 7,
      colorScheme: 'purple',
    },
  ];

  // 5. Earned Achievements
  let achievements: StudentAchievementRow[] = [
    {
      id: 'ach-1',
      profile_id: profileId,
      badge_code: 'streak_5',
      title: '5-Day Streak Warrior',
      description: 'Logged in and completed daily learning goals 5 days in a row.',
      icon: 'Flame',
      unlocked_at: 'Yesterday',
    },
    {
      id: 'ach-2',
      profile_id: profileId,
      badge_code: 'fractions_explorer',
      title: 'Fraction Apprentice',
      description: 'Successfully balanced 10 real-world proportions.',
      icon: 'Award',
      unlocked_at: '3 days ago',
    },
    {
      id: 'ach-3',
      profile_id: profileId,
      badge_code: 'offline_pioneer',
      title: 'Offline Explorer',
      description: 'Completed 3 units completely offline without internet.',
      icon: 'WifiOff',
      unlocked_at: 'Last week',
    },
  ];

  try {
    const { data: achData } = await supabase
      .from('student_achievements')
      .select('*')
      .eq('profile_id', profileId);

    if (achData && achData.length > 0) {
      achievements = achData as unknown as StudentAchievementRow[];
    }
  } catch (err) {
    // fallback
  }

  // 6. Recent Activity Stream
  let recentActivities: StudentRecentActivityRow[] = [
    {
      id: 'act-1',
      profile_id: profileId,
      title: 'Scale Balancing Challenge',
      subject: 'Mathematics',
      activity_type: 'quiz',
      xp_earned: 30,
      created_at: '2 hours ago',
    },
    {
      id: 'act-2',
      profile_id: profileId,
      title: 'Groundwater Stepwells Audio Story',
      subject: 'Science',
      activity_type: 'audio',
      xp_earned: 20,
      created_at: 'Yesterday at 05:40 PM',
    },
    {
      id: 'act-3',
      profile_id: profileId,
      title: 'Weekly Math Pack Cached to Phone',
      subject: 'System',
      activity_type: 'download',
      xp_earned: 10,
      created_at: '2 days ago',
    },
  ];

  try {
    const { data: actData } = await supabase
      .from('student_recent_activities')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (actData && actData.length > 0) {
      recentActivities = actData as unknown as StudentRecentActivityRow[];
    }
  } catch (err) {
    // fallback
  }

  // 7. AI Recommendation with Pedagogical Reasoning
  let aiRecommendation = {
    title: 'Practice Fractions for 10 minutes.',
    actionText: 'Start 10-Min Booster',
    reasoning:
      'Recommended because your recent Fractions attempts were below your current mastery level.',
    xpBonus: 25,
    estimatedMinutes: 10,
  };

  if (cachedReport) {
    try {
      const parsedReport = JSON.parse(cachedReport);
      if (parsedReport.recommendation) {
        aiRecommendation = {
          title: parsedReport.recommendation.title,
          actionText: parsedReport.recommendation.actionText,
          reasoning: parsedReport.recommendation.reasoning,
          xpBonus: parsedReport.recommendation.xpBonus || 50,
          estimatedMinutes: parsedReport.recommendation.estimatedMinutes || 10,
        };
      }
    } catch (e) {
      // fallback
    }
  }

  // 8. Positive growth-mindset daily motivation
  const dailyMotivation =
    GROWTH_MOTIVATIONS[Math.floor(Math.random() * GROWTH_MOTIVATIONS.length)];

  return {
    stats,
    activeLesson,
    journeyNodes,
    subjects,
    achievements,
    recentActivities,
    aiRecommendation,
    dailyMotivation,
  };
}

export async function recordStudentQuizProgress(
  profileId: string,
  xpEarned: number,
  minutesSpent: number,
  topicTitle: string
): Promise<Partial<StudentLearningStatsRow>> {
  try {
    // Insert into recent activity
    await (supabase.from('student_recent_activities') as any).insert({
      profile_id: profileId,
      title: topicTitle,
      subject: 'Mathematics',
      activity_type: 'quiz',
      xp_earned: xpEarned,
    });
  } catch (err) {
    console.warn('Could not record activity in Supabase:', err);
  }

  return {
    xp_points: 480 + xpEarned,
    today_completed_minutes: 14 + minutesSpent,
  };
}
