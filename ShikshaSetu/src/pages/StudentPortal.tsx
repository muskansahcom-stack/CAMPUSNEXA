import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Modal } from '../components/ui/Modal';
import { LoadingState } from '../components/ui/LoadingState';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useConnectivity } from '../contexts/ConnectivityContext';
import { useToast } from '../contexts/ToastContext';
import {
  fetchStudentDashboardData,
  recordStudentQuizProgress,
  StudentDashboardData,
} from '../services/studentService';
import { AdaptiveAssessmentModal } from '../components/assessment/AdaptiveAssessmentModal';
import { AITeacherView } from '../components/aiTeacher/AITeacherView';
import { LearningLibraryView } from '../components/library/LearningLibraryView';
import { SyncStatusBadge } from '../components/offline/SyncStatusBadge';
import { MotivationHub } from '../components/motivation/MotivationHub';
import { motivationService } from '../services/motivationService';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { RuralStudentOnboardingModal } from '../components/onboarding/RuralStudentOnboardingModal';
import { AccessibilitySettingsModal } from '../components/accessibility/AccessibilitySettingsModal';
import { VoiceInstructionButton } from '../components/voice/VoiceInstructionButton';
import { StudentAnalyticsView } from '../components/analytics/StudentAnalyticsView';
import { MOCK_QUIZ_QUESTIONS } from '../lib/mockData';
import {
  Sparkles,
  Flame,
  Zap,
  Target,
  Award,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  Lock,
  Compass,
  Cpu,
  Volume2,
  Clock,
  Radio,
  Check,
  ChevronRight,
  Wifi,
  WifiOff,
  RefreshCw,
  User,
  Heart,
  HelpCircle,
  XCircle,
  Smile,
  ShieldCheck,
  Bot,
  Home,
  Download,
  Smartphone,
  Eye,
  Globe,
  TrendingUp,
  BarChart2,
} from 'lucide-react';

export const StudentPortal: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = searchParams.get('tab') || 'home';
  const { user, profile } = useAuth();
  const { language, setLanguage, languages, t } = useLanguage();
  const {
    textSize,
    setTextSize,
    highContrast,
    setHighContrast,
    voiceAssistance,
    setVoiceAssistance,
    openSettingsModal,
  } = useAccessibility();
  const {
    isOnline,
    isLowBandwidthMode,
    isSyncing,
    dataSavedMb,
    triggerManualSync,
  } = useConnectivity();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<StudentDashboardData | null>(null);

  // Rural Guided Onboarding State (shows automatically for first-time students)
  const [isOnboardingModalOpen, setIsOnboardingModalOpen] = useState(false);

  // Practice Quiz State
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isPlayingAudioHint, setIsPlayingAudioHint] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Learning Diagnostic Checkup State
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);

  // Auto-trigger guided onboarding for first-time rural learners
  useEffect(() => {
    try {
      const completed = localStorage.getItem('shikshasetu_onboarding_completed');
      if (!completed) {
        setIsOnboardingModalOpen(true);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const studentName =
    profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Learner';

  const refreshDashboardData = async () => {
    const id = profile?.id || user?.id || 'demo-student';
    const data = await fetchStudentDashboardData(id, studentName);
    setDashboardData(data);
  };

  // Load real student dashboard data
  useEffect(() => {
    const loadData = async () => {
      if (profile?.id || user?.id) {
        const id = profile?.id || user?.id || 'demo-student';
        const data = await fetchStudentDashboardData(id, studentName);
        setDashboardData(data);
        setLoading(false);
      } else {
        const data = await fetchStudentDashboardData('demo-student', studentName);
        setDashboardData(data);
        setLoading(false);
      }
    };
    loadData();
  }, [profile, user, studentName]);

  const currentQuestion = MOCK_QUIZ_QUESTIONS[currentQuestionIndex];

  const handleStartPractice = (fromRecommendation: boolean = false) => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setIsPlayingAudioHint(false);
    setQuizScore(0);
    setIsQuizModalOpen(true);

    if (fromRecommendation) {
      showToast({
        type: 'info',
        title: 'Targeted Booster Started',
        message: '10-minute focus on Fractions to strengthen this skill.',
      });
    }
  };

  const handleOptionSelect = (optionId: string) => {
    if (!isAnswerSubmitted) {
      setSelectedOption(optionId);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!selectedOption) return;
    setIsAnswerSubmitted(true);
    const chosen = currentQuestion.options.find((o) => o.id === selectedOption);

    if (chosen?.isCorrect) {
      setQuizScore((s) => s + 1);
      showToast({
        type: 'success',
        title: 'Shabash! Correct Answer (+15 XP)',
        message: 'Great intuition! You are getting closer to mastering this topic.',
      });

      if (dashboardData && (profile?.id || user?.id)) {
        const id = profile?.id || user?.id || 'demo-student';
        await recordStudentQuizProgress(id, 15, 3, currentQuestion.prompt['en'].slice(0, 30));
        await motivationService.awardXP(
          id,
          15,
          'practice_complete',
          `Practice Question: ${currentQuestion.prompt['en'].slice(0, 35)}`,
          'Mathematics'
        );
        await motivationService.logStudyMinutes(id, 3);
        setDashboardData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            stats: {
              ...prev.stats,
              xp_points: prev.stats.xp_points + 15,
              today_completed_minutes: Math.min(
                prev.stats.daily_goal_minutes,
                prev.stats.today_completed_minutes + 3
              ),
            },
          };
        });
      }
    } else {
      showToast({
        type: 'info',
        title: "Let's Strengthen This Skill",
        message: 'A thoughtful try! Review the visual hint below to lock down the concept.',
      });
    }
  };

  const handleNextQuestion = async () => {
    if (currentQuestionIndex + 1 < MOCK_QUIZ_QUESTIONS.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setIsPlayingAudioHint(false);
    } else {
      setIsQuizModalOpen(false);
      const id = profile?.id || user?.id || 'demo-student';
      await motivationService.completeQuiz(
        id,
        'Foundational Fractions Checkup',
        'Mathematics',
        quizScore + 1,
        MOCK_QUIZ_QUESTIONS.length,
        5
      );
      showToast({
        type: 'success',
        title: 'Daily Practice Milestone Reached! 🎉',
        message: 'Earned 30 XP! Your learning streak continues strong.',
      });
    }
  };

  const playVoiceAudio = () => {
    setIsPlayingAudioHint(true);
    setTimeout(() => {
      setIsPlayingAudioHint(false);
    }, 4500);
  };

  if (loading || !dashboardData) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <LoadingState type="spinner" message="Preparing your personal learning companion..." />
      </div>
    );
  }

  const {
    stats,
    activeLesson,
    journeyNodes,
    subjects,
    achievements,
    recentActivities,
    aiRecommendation,
    dailyMotivation,
  } = dashboardData;

  const remainingGoalMins = Math.max(
    0,
    stats.daily_goal_minutes - stats.today_completed_minutes
  );

  const tabsConfig = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'growth', label: 'My Growth & Streaks', icon: Award },
    { id: 'analytics', label: 'My Progress & Analytics', icon: TrendingUp },
    { id: 'learn', label: 'Learn', icon: BookOpen },
    { id: 'practice', label: 'Practice', icon: Sparkles },
    { id: 'ai-teacher', label: 'AI Teacher', icon: Bot },
    { id: 'profile', label: 'Profile', icon: User },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* ========================================================== */}
      {/* TOP SECTION: GREETING & PERSONAL TELEMETRY */}
      {/* ========================================================== */}
      <section className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 text-white shadow-elevated border border-brand-700/50">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="saffron" size="sm" dot>
                {stats.current_level_title}
              </Badge>
              <span className="text-xs text-brand-200">
                Grade {user?.user_metadata?.grade || 8} • Personal Learning Companion
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {getGreeting()}, {studentName} 👋
            </h1>

            <p className="text-xs sm:text-sm text-brand-100 max-w-xl leading-relaxed">
              Every challenge makes your brain stronger. Ready to continue your journey today?
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-2.5">
              <Button
                variant="saffron"
                size="sm"
                onClick={() => setIsAssessmentModalOpen(true)}
                leftIcon={<Sparkles className="w-4 h-4" />}
              >
                Personalize My Path (Learning Checkup)
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsOnboardingModalOpen(true)}
                leftIcon={<Compass className="w-4 h-4" />}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                Guided Tour
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={openSettingsModal}
                leftIcon={<Eye className="w-4 h-4" />}
                className="bg-white/10 text-white border-white/20 hover:bg-white/20"
              >
                Display & Language
              </Button>
            </div>
          </div>

          {/* 4 Telemetry Metric Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
            {/* Learning Streak */}
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between text-saffron-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">Streak</span>
                <Flame className="w-4 h-4 fill-saffron-400" />
              </div>
              <div className="mt-2 text-xl font-black text-white">{stats.streak_days} Days</div>
              <span className="text-[10px] text-brand-200">Consistent learner</span>
            </div>

            {/* Total XP */}
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between text-amber-300">
                <span className="text-[10px] uppercase font-bold tracking-wider">Total XP</span>
                <Zap className="w-4 h-4 fill-amber-300" />
              </div>
              <div className="mt-2 text-xl font-black text-white">{stats.xp_points} XP</div>
              <span className="text-[10px] text-brand-200">+45 earned today</span>
            </div>

            {/* Today's Goal Progress */}
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">Today's Goal</span>
                <Target className="w-4 h-4" />
              </div>
              <div className="mt-2 text-xl font-black text-white">
                {stats.today_completed_minutes} / {stats.daily_goal_minutes}m
              </div>
              <span className="text-[10px] text-emerald-300">
                {remainingGoalMins === 0 ? 'Goal completed! 🎯' : `${remainingGoalMins}m left`}
              </span>
            </div>

            {/* Overall Progress */}
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between text-blue-300">
                <span className="text-[10px] uppercase font-bold tracking-wider">Mastery</span>
                <Award className="w-4 h-4" />
              </div>
              <div className="mt-2 text-xl font-black text-white">{stats.overall_progress_pct}%</div>
              <span className="text-[10px] text-brand-200">Across STEM</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================== */}
      {/* COMPANION NAVIGATION TABS (Desktop / Tablet switcher) */}
      {/* ========================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-1 border-b border-slate-200/80">
        <div className="flex items-center gap-2 overflow-x-auto">
          {tabsConfig.map((t) => {
            const Icon = t.icon;
            const isActive = currentTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setSearchParams(t.id === 'home' ? {} : { tab: t.id })}
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-brand-700 text-white shadow-sm'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
        <div className="shrink-0">
          <SyncStatusBadge />
        </div>
      </div>

      {/* ========================================================== */}
      {/* TAB CONTENT: HOME (All 9 Modules) */}
      {/* ========================================================== */}
      {currentTab === 'home' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          {/* 9. DAILY MOTIVATION (Growth Mindset Positive Affirmation) */}
          <section className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-100/50 to-amber-50 border border-amber-200/80 flex items-center gap-3.5 text-slate-800">
            <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold shrink-0 shadow-xs">
              <Smile className="w-5 h-5" />
            </div>
            <div className="flex-1 text-xs sm:text-sm">
              <span className="font-bold text-amber-900 mr-1.5">Daily Encouragement:</span>
              <span className="font-medium text-slate-700 italic">"{dailyMotivation}"</span>
            </div>
          </section>

          {/* GRID: CONTINUE LEARNING & TODAY'S LEARNING GOAL */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* 1. CONTINUE LEARNING CARD */}
            <div className="lg:col-span-7">
              <Card variant="elevated" className="h-full flex flex-col justify-between border-brand-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="brand" size="sm" dot>
                      1. Continue Learning
                    </Badge>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {activeLesson.subject}
                    </span>
                  </div>
                  <CardTitle className="text-lg sm:text-xl mt-1 text-slate-900">
                    {activeLesson.title}
                  </CardTitle>
                  <CardDescription>{activeLesson.topic}</CardDescription>
                </CardHeader>

                <CardContent className="space-y-5">
                  <ProgressBar
                    value={activeLesson.progress_pct}
                    label="Module Progress"
                    variant="brand"
                    size="md"
                  />

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-brand-700 text-white shrink-0">
                        <BookOpen className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Next Step: Scale Balancing</h4>
                        <p className="text-[11px] text-slate-500">
                          Estimated {activeLesson.estimated_remaining_mins} mins • Works completely offline
                        </p>
                      </div>
                    </div>

                    <Button
                      size="md"
                      variant="saffron"
                      onClick={() => handleStartPractice(false)}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      {activeLesson.next_action_label}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 2. TODAY'S LEARNING GOAL */}
            <div className="lg:col-span-5">
              <Card variant="elevated" className="h-full flex flex-col justify-between">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="saffron" size="sm">
                      2. Today's Learning Goal
                    </Badge>
                    <Clock className="w-4 h-4 text-slate-400" />
                  </div>
                  <CardTitle className="text-lg mt-1 text-slate-900">
                    {stats.today_completed_minutes} / {stats.daily_goal_minutes} minutes completed
                  </CardTitle>
                  <CardDescription>
                    Small daily practice leads to extraordinary understanding over time.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ProgressBar
                    value={stats.today_completed_minutes}
                    max={stats.daily_goal_minutes}
                    label="Daily Target Progress"
                    variant="saffron"
                    size="lg"
                  />

                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 text-xs text-amber-900 space-y-1">
                    <p className="font-bold">
                      {remainingGoalMins === 0
                        ? '🎯 Fantastic work! Daily goal achieved.'
                        : `✨ Only ${remainingGoalMins} more minutes to complete your daily streak!`}
                    </p>
                    <p className="text-[11px] text-slate-600">
                      Complete 1 quick practice quiz or audio capsule to hit 100%.
                    </p>
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => handleStartPractice(false)}
                  >
                    Quick 5-Minute Practice (+15 XP)
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 3. PERSONAL LEARNING MAP & 4. AI RECOMMENDATION */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* 3. PERSONAL LEARNING MAP (Visual Journey) */}
            <div className="lg:col-span-7">
              <Card variant="elevated">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="brand" size="sm">
                      3. Personal Learning Map
                    </Badge>
                    <button
                      onClick={() => setIsAssessmentModalOpen(true)}
                      className="text-xs font-bold text-brand-700 hover:text-brand-900 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Diagnostic Checkup</span>
                    </button>
                  </div>
                  <CardTitle className="text-lg text-slate-900">Your Foundational Math Journey</CardTitle>
                  <CardDescription>
                    Adapted dynamically to your current mastery level without jumping ahead.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pt-2">
                  <div className="space-y-2 relative">
                    {journeyNodes.map((node, index) => {
                      const isCompleted = node.status === 'completed';
                      const isCurrent = node.status === 'in_progress';
                      const isLocked = node.status === 'locked';

                      return (
                        <div key={node.id} className="relative">
                          <div
                            onClick={() => {
                              if (isCurrent) handleStartPractice(false);
                              else if (isCompleted) {
                                showToast({
                                  type: 'info',
                                  title: `${node.title} (Mastered)`,
                                  message: 'You have already solidified this foundation! Feel free to review.',
                                });
                              } else {
                                showToast({
                                  type: 'warning',
                                  title: `${node.title} (Locked)`,
                                  message: 'Complete the Fractions milestone to unlock this module.',
                                });
                              }
                            }}
                            className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer ${
                              isCurrent
                                ? 'bg-brand-50/80 border-brand-500 shadow-elevated ring-2 ring-brand-500/20'
                                : isCompleted
                                ? 'bg-white border-slate-200 hover:border-slate-300'
                                : 'bg-slate-50/60 border-slate-200 opacity-60'
                            }`}
                          >
                            <div className="flex items-center gap-3.5">
                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                                  isCompleted
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : isCurrent
                                    ? 'bg-brand-700 text-white shadow-xs'
                                    : 'bg-slate-200 text-slate-500'
                                }`}
                              >
                                {isCompleted ? (
                                  <Check className="w-4 h-4 stroke-[3]" />
                                ) : isCurrent ? (
                                  <span className="w-2.5 h-2.5 rounded-full bg-saffron-400 animate-ping" />
                                ) : (
                                  <Lock className="w-4 h-4" />
                                )}
                              </div>

                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                                    {node.title}
                                  </h4>
                                  {isCurrent && (
                                    <Badge variant="saffron" size="sm">
                                      YOU ARE HERE
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-[11px] text-slate-500">
                                  Estimated {node.estimated_mins} mins • {node.subject}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span
                                className={`text-[11px] font-bold ${
                                  isCompleted
                                    ? 'text-emerald-600'
                                    : isCurrent
                                    ? 'text-brand-700'
                                    : 'text-slate-400'
                                }`}
                              >
                                {isCompleted ? 'Completed ✓' : isCurrent ? 'Active ●' : 'Locked 🔒'}
                              </span>
                              <ChevronRight className="w-4 h-4 text-slate-400" />
                            </div>
                          </div>

                          {index < journeyNodes.length - 1 && (
                            <div className="w-0.5 h-3 bg-slate-200 mx-auto my-0.5" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 4. AI RECOMMENDATION (With Pedagogical Rationale) & 8. OFFLINE STATUS */}
            <div className="lg:col-span-5 space-y-6">
              {/* 4. AI RECOMMENDATION CARD */}
              <Card variant="saffron-subtle" className="border-amber-300">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="saffron" size="sm">
                      4. AI Pedagogical Recommendation
                    </Badge>
                    <Cpu className="w-4 h-4 text-amber-600" />
                  </div>
                  <CardTitle className="text-base sm:text-lg text-slate-900 mt-1">
                    {aiRecommendation.title}
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4 pt-1">
                  <div className="p-3.5 rounded-2xl bg-white/90 border border-amber-200 text-xs space-y-1.5 shadow-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <Sparkles className="w-3.5 h-3.5 text-saffron-600" />
                      <span>Why is this recommended?</span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      "{aiRecommendation.reasoning}"
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span>⏱️ {aiRecommendation.estimatedMinutes} mins booster</span>
                    <span className="font-bold text-amber-700">+{aiRecommendation.xpBonus} XP Bonus</span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <Button
                      variant="saffron"
                      size="md"
                      className="w-full sm:flex-1"
                      onClick={() => handleStartPractice(true)}
                      rightIcon={<ArrowRight className="w-4 h-4" />}
                    >
                      {aiRecommendation.actionText}
                    </Button>
                    <Button
                      variant="outline"
                      size="md"
                      className="w-full sm:w-auto"
                      onClick={() => setSearchParams({ tab: 'ai-teacher' })}
                      leftIcon={<Bot className="w-4 h-4 text-brand-600" />}
                    >
                      Ask AI Teacher
                    </Button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsAssessmentModalOpen(true)}
                    className="w-full text-center text-[11px] font-semibold text-amber-900/80 hover:text-amber-950 underline transition-colors pt-1"
                  >
                    Take 10-min adaptive checkup to update recommendations
                  </button>
                </CardContent>
              </Card>

              {/* 8. OFFLINE STATUS CARD */}
              <Card variant="default">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="forest" size="sm">
                      8. Offline & Connectivity Status
                    </Badge>
                    {isOnline ? (
                      <Wifi className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <WifiOff className="w-4 h-4 text-amber-600" />
                    )}
                  </div>
                  <CardTitle className="text-base text-slate-900">
                    {isOnline ? 'Online (Local Cache Ready)' : 'Offline Mode (100% Functional)'}
                  </CardTitle>
                  <CardDescription>
                    Designed so village network drops never delete your answers.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pt-0 text-xs">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-600">Network State:</span>
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          isOnline ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />
                      {isSyncing ? 'Syncing...' : isOnline ? 'Connected' : 'Offline'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                    <span className="text-slate-600">Data Saved (2G Mode):</span>
                    <span className="font-bold text-emerald-600">~{dataSavedMb} MB</span>
                  </div>

                  {isOnline && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={triggerManualSync}
                      disabled={isSyncing}
                      className="w-full"
                      leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />}
                    >
                      {isSyncing ? 'Synchronizing Telemetry...' : 'Sync Local Progress to Cloud'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* 5. SUBJECTS CARDS */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="brand" size="sm">
                    5. Subjects
                  </Badge>
                  <h3 className="text-lg font-bold text-slate-900">Curriculum Areas</h3>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track mastery and pick your next action across each subject
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-400">4 Enrolled Subjects</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {subjects.map((sub) => (
                <Card
                  key={sub.id}
                  variant="elevated"
                  className="p-5 flex flex-col justify-between transition-all hover:border-slate-300"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        {sub.category}
                      </span>
                      <Badge
                        variant={
                          sub.colorScheme === 'brand'
                            ? 'brand'
                            : sub.colorScheme === 'forest'
                            ? 'forest'
                            : sub.colorScheme === 'saffron'
                            ? 'saffron'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {sub.progressPct}% Mastery
                      </Badge>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 leading-snug">{sub.name}</h4>

                    <div className="space-y-1">
                      <div className="text-[11px] text-slate-500 font-medium">Current Topic:</div>
                      <p className="text-xs font-bold text-slate-700 leading-relaxed line-clamp-2">
                        {sub.currentTopic}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="w-full text-xs"
                      onClick={() => handleStartPractice(false)}
                      rightIcon={<ChevronRight className="w-3.5 h-3.5" />}
                    >
                      {sub.nextAction}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* 6. ACHIEVEMENTS & 7. RECENT ACTIVITY STREAM */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* 6. ACHIEVEMENTS */}
            <div className="lg:col-span-6">
              <Card variant="elevated">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="saffron" size="sm">
                      6. Achievements
                    </Badge>
                    <Award className="w-4 h-4 text-saffron-500" />
                  </div>
                  <CardTitle className="text-base text-slate-900">Earned Badges & Milestones</CardTitle>
                  <CardDescription>
                    Celebrate your persistence and growth across subjects.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  {achievements.map((ach) => (
                    <div
                      key={ach.id}
                      className="p-3.5 rounded-2xl border border-slate-100 bg-slate-50/80 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-saffron-800 flex items-center justify-center font-bold shrink-0">
                          {ach.icon === 'Flame' ? (
                            <Flame className="w-5 h-5 fill-saffron-500 text-saffron-600" />
                          ) : ach.icon === 'WifiOff' ? (
                            <WifiOff className="w-5 h-5 text-emerald-600" />
                          ) : (
                            <Award className="w-5 h-5 text-brand-600" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{ach.title}</h4>
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            {ach.description}
                          </p>
                        </div>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                        {ach.unlocked_at}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* 7. RECENT ACTIVITY STREAM */}
            <div className="lg:col-span-6">
              <Card variant="elevated">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="brand" size="sm">
                      7. Recent Activity
                    </Badge>
                    <Clock className="w-4 h-4 text-slate-400" />
                  </div>
                  <CardTitle className="text-base text-slate-900">Your Learning Trail</CardTitle>
                  <CardDescription>Continuous record of challenges and study sessions.</CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  {recentActivities.map((act) => (
                    <div
                      key={act.id}
                      className="p-3 rounded-xl border border-slate-100 bg-white flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="p-2 rounded-lg bg-brand-50 text-brand-700 shrink-0">
                          {act.activity_type === 'quiz' ? (
                            <CheckCircle2 className="w-4 h-4" />
                          ) : act.activity_type === 'audio' ? (
                            <Volume2 className="w-4 h-4" />
                          ) : (
                            <BookOpen className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 truncate">{act.title}</p>
                          <p className="text-[11px] text-slate-400">
                            {act.subject} • {act.created_at}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md shrink-0">
                        +{act.xp_earned} XP
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB CONTENT: GROWTH & MOTIVATION (XP, Streaks, Milestones) */}
      {/* ========================================================== */}
      {currentTab === 'growth' && (
        <div className="animate-in fade-in duration-150">
          <MotivationHub
            studentId={profile?.id || user?.id || 'demo-student'}
            studentName={studentName}
            onNavigateLearn={() => setSearchParams({ tab: 'learn' })}
            onNavigatePractice={() => setSearchParams({ tab: 'practice' })}
          />
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB CONTENT: ANALYTICS (Real Database Telemetry & Growth) */}
      {/* ========================================================== */}
      {currentTab === 'analytics' && (
        <div className="animate-in fade-in duration-150">
          <StudentAnalyticsView
            studentId={profile?.id || user?.id || 'demo-student'}
            studentName={studentName}
          />
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB CONTENT: LEARN (National & State Learning Library) */}
      {/* ========================================================== */}
      {currentTab === 'learn' && (
        <LearningLibraryView studentId={profile?.id || user?.id || 'demo-student'} />
      )}

      {/* ========================================================== */}
      {/* TAB CONTENT: PRACTICE (Quizzes & Skill Boosters) */}
      {/* ========================================================== */}
      {currentTab === 'practice' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="saffron" size="md">
                  Practice Center
                </Badge>
                <Sparkles className="w-5 h-5 text-saffron-500" />
              </div>
              <CardTitle className="text-xl">Targeted Practice & Skill Boosters</CardTitle>
              <CardDescription>
                Strengthen core concepts with instant hints, voice read-aloud, and friendly explanations.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-slate-900">
                    Recommended Booster: Fractions in Everyday Life
                  </h4>
                  <p className="text-xs text-slate-600">
                    Earn up to +30 XP and finish today's streak goal in 6 minutes.
                  </p>
                </div>
                <Button
                  variant="saffron"
                  size="md"
                  onClick={() => handleStartPractice(true)}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Start Practice Quiz Now
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {subjects.map((sub) => (
                  <div
                    key={sub.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="text-sm font-bold text-slate-900">{sub.name}</h5>
                      <span className="text-xs font-semibold text-brand-600">
                        {sub.progressPct}% Progress
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Current challenge: {sub.currentTopic}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => handleStartPractice(false)}
                    >
                      Practice 5 Questions
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB CONTENT: AI TEACHER (Conversational Learning Interface) */}
      {/* ========================================================== */}
      {currentTab === 'ai-teacher' && (
        <AITeacherView
          studentId={profile?.id || user?.id || 'demo-student'}
          studentName={studentName}
          initialTopic={activeLesson.topic}
        />
      )}

      {/* ========================================================== */}
      {/* TAB CONTENT: PROFILE (Student Companion Settings) */}
      {/* ========================================================== */}
      {currentTab === 'profile' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <Card variant="elevated">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="brand" size="md">
                  Student Profile & Device
                </Badge>
                <User className="w-5 h-5 text-brand-600" />
              </div>
              <CardTitle className="text-xl">Your Learning Identity</CardTitle>
              <CardDescription>
                Configured for offline reliability and shared-handset safety.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500">Student Name:</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{studentName}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500">Registered Email:</span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{user?.email}</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500">Account Role:</span>
                  <p className="font-bold text-brand-700 text-sm mt-0.5 capitalize">Student</p>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500">Current Pacing Tier:</span>
                  <p className="font-bold text-amber-700 text-sm mt-0.5">{stats.current_level_title}</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h5 className="font-bold text-emerald-900">PostgreSQL Row-Level Security Active</h5>
                    <p className="text-[11px] text-emerald-700">
                      Only you can view and update your learning telemetry.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* LANGUAGE SWITCHER & ACCESSIBILITY PREFERENCES (Placed in Profile) */}
          <Card variant="elevated" className="border-brand-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge variant="saffron" size="md">
                  <Globe className="w-3.5 h-3.5 mr-1" />
                  Language & Display Preferences
                </Badge>
                <Eye className="w-5 h-5 text-brand-600" />
              </div>
              <CardTitle className="text-xl">
                {t('accessibility.preferredLanguage')} & Reading Comfort
              </CardTitle>
              <CardDescription>
                Choose your mother tongue and customize the font size, contrast, and voice assistance for effortless reading.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language Switcher in Profile */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Select Language / भाषा चुनें / மொழியைத் தேர்ந்தெடுக்கவும்
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {languages.map((lang) => {
                    const isSelected = language === lang.code;
                    return (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          setLanguage(lang.code);
                          showToast({
                            type: 'info',
                            title: `Language changed to ${lang.nativeLabel}`,
                            message: 'UI text updated immediately.',
                          });
                        }}
                        className={`min-h-[48px] p-3 rounded-2xl text-left border transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-brand-50 border-brand-500 shadow-sm ring-2 ring-brand-500/20'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`text-sm font-bold ${isSelected ? 'text-brand-900' : 'text-slate-800'}`}>
                            {lang.nativeLabel}
                          </span>
                          {isSelected && <Check className="w-4 h-4 text-brand-600 shrink-0" />}
                        </div>
                        <span className="text-[11px] text-slate-500">{lang.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Quick Text Size Switcher */}
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  {t('accessibility.textSize')}
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'normal', label: t('accessibility.normalText'), sample: 'Aa', desc: 'Default (16px)' },
                    { id: 'large', label: t('accessibility.largeText'), sample: 'Aa+', desc: 'Large (18px)' },
                    { id: 'extra_large', label: t('accessibility.extraLargeText'), sample: 'Aa++', desc: 'Extra Large (20px)' },
                  ].map((sizeOpt) => {
                    const isSelected = textSize === sizeOpt.id;
                    return (
                      <button
                        key={sizeOpt.id}
                        type="button"
                        onClick={() => setTextSize(sizeOpt.id as any)}
                        className={`min-h-[48px] p-3 rounded-2xl text-center border transition-all ${
                          isSelected
                            ? 'bg-amber-50 border-amber-500 font-bold text-amber-950 ring-2 ring-amber-500/20 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="text-base font-extrabold">{sizeOpt.sample}</div>
                        <div className="text-xs mt-0.5">{sizeOpt.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* High Contrast & Voice Toggles */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{t('accessibility.highContrast')}</h5>
                    <p className="text-[11px] text-slate-500">Pure high-contrast black borders</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setHighContrast(!highContrast)}
                    className={`min-h-[44px] min-w-[56px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      highContrast
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {highContrast ? 'ON' : 'OFF'}
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{t('accessibility.voiceAssistance')}</h5>
                    <p className="text-[11px] text-slate-500">Enable voice read-aloud buttons</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVoiceAssistance(!voiceAssistance)}
                    className={`min-h-[44px] min-w-[56px] px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      voiceAssistance
                        ? 'bg-amber-500 text-slate-950 font-black'
                        : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                    }`}
                  >
                    {voiceAssistance ? 'ON' : 'OFF'}
                  </button>
                </div>
              </div>

              {/* Action Buttons for Accessibility Modal & Guided Tour */}
              <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => setIsOnboardingModalOpen(true)}
                  leftIcon={<Compass className="w-4 h-4" />}
                >
                  {t('onboarding.startTour') || 'Start Guided Walkthrough'}
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={openSettingsModal}
                  leftIcon={<Eye className="w-4 h-4" />}
                >
                  {t('accessibility.title')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ========================================================== */}
      {/* INTERACTIVE PRACTICE CHALLENGE MODAL */}
      {/* ========================================================== */}
      <Modal
        isOpen={isQuizModalOpen}
        onClose={() => setIsQuizModalOpen(false)}
        title={`Practice Challenge: Question ${currentQuestionIndex + 1} of ${MOCK_QUIZ_QUESTIONS.length}`}
        description="Take your time. No negative marks. Learning is a continuous loop."
        maxWidth="lg"
      >
        <div className="space-y-6">
          {/* Question Prompt */}
          <div className="p-4 rounded-2xl bg-brand-50/70 border border-brand-100 space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="brand" size="sm">
                Topic: Fractions & Balances
              </Badge>
              {/* Voice Read Aloud component */}
              <VoiceInstructionButton
                textToSpeak={(currentQuestion.prompt as Record<string, string>)[language] || currentQuestion.prompt['en']}
                size="sm"
              />
            </div>

            <p className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed">
              {(currentQuestion.prompt as Record<string, string>)[language] || currentQuestion.prompt['en']}
            </p>

            {isPlayingAudioHint && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-center gap-2 animate-in fade-in">
                <Radio className="w-4 h-4 text-saffron-600 animate-spin" />
                <span>Audio Explainer Hint: "{currentQuestion.audioPromptHint}"</span>
              </div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-2.5">
            {currentQuestion.options.map((option) => {
              const optionText = (option.text as Record<string, string>)[language] || option.text['en'];
              const isSelected = selectedOption === option.id;

              let style =
                'border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-800';
              if (isSelected) {
                style =
                  'border-brand-600 bg-brand-50 text-brand-900 font-bold ring-1 ring-brand-500';
              }
              if (isAnswerSubmitted) {
                if (option.isCorrect) {
                  style = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold';
                } else if (isSelected && !option.isCorrect) {
                  style = 'border-red-400 bg-red-50 text-red-900 font-medium';
                }
              }

              return (
                <button
                  key={option.id}
                  disabled={isAnswerSubmitted}
                  onClick={() => handleOptionSelect(option.id)}
                  className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left text-xs sm:text-sm transition-all ${style}`}
                >
                  <span>{optionText}</span>
                  {isAnswerSubmitted && option.isCorrect && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  {isAnswerSubmitted && isSelected && !option.isCorrect && (
                    <XCircle className="w-5 h-5 text-red-500 shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Explanation Banner */}
          {isAnswerSubmitted && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5 animate-in fade-in">
              <h5 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Concept Explanation
              </h5>
              <p className="text-xs text-slate-700 leading-relaxed">
                {(currentQuestion.explanation as Record<string, string>)[language] || currentQuestion.explanation['en']}
              </p>
            </div>
          )}

          {/* Footer Controls */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Score: {quizScore} / {MOCK_QUIZ_QUESTIONS.length}
            </span>

            {!isAnswerSubmitted ? (
              <Button
                variant="primary"
                size="md"
                disabled={!selectedOption}
                onClick={handleSubmitAnswer}
              >
                Check Answer
              </Button>
            ) : (
              <Button
                variant="saffron"
                size="md"
                onClick={handleNextQuestion}
                rightIcon={<ChevronRight className="w-4 h-4" />}
              >
                {currentQuestionIndex + 1 < MOCK_QUIZ_QUESTIONS.length
                  ? 'Next Question'
                  : 'Complete & Claim XP'}
              </Button>
            )}
          </div>
        </div>
      </Modal>

      {/* AI Personalization & Adaptive Diagnostic Assessment Modal */}
      <AdaptiveAssessmentModal
        isOpen={isAssessmentModalOpen}
        onClose={() => setIsAssessmentModalOpen(false)}
        studentId={profile?.id || user?.id || 'demo-student'}
        studentName={studentName}
        onAssessmentCompleted={async (report) => {
          showToast({
            type: 'success',
            title: 'Personalized Roadmap Activated! 🎉',
            message: `Your learning path is now tailored around ${report.recommendedStartingTopic.topicName}.`,
          });
          await refreshDashboardData();
        }}
      />

      {/* Rural Guided Onboarding Walkthrough */}
      <RuralStudentOnboardingModal
        isOpen={isOnboardingModalOpen}
        onClose={() => setIsOnboardingModalOpen(false)}
      />
    </div>
  );
};
