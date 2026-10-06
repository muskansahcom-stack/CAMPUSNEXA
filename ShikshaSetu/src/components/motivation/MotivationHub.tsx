import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { LoadingState } from '../ui/LoadingState';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import { motivationService } from '../../services/motivationService';
import {
  Achievement,
  LearningMilestone,
  MotivationSystemData,
} from '../../types/motivation';
import { XPTrackerCard } from './XPTrackerCard';
import { DailyGoalCard } from './DailyGoalCard';
import { StreakCard } from './StreakCard';
import { AchievementsGrid } from './AchievementsGrid';
import { MilestonesTimeline } from './MilestonesTimeline';
import { ProgressOverTimeCard } from './ProgressOverTimeCard';
import { MilestoneCelebrationModal } from './MilestoneCelebrationModal';
import {
  Sparkles,
  Flame,
  Zap,
  Target,
  Award,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Smile,
  ShieldCheck,
  Compass,
  Heart,
  HelpCircle,
  Clock,
  ArrowRight,
} from 'lucide-react';

interface MotivationHubProps {
  studentId?: string;
  studentName?: string;
  onNavigateLearn?: () => void;
  onNavigatePractice?: () => void;
}

export const MotivationHub: React.FC<MotivationHubProps> = ({
  studentId = 'demo-student',
  studentName = 'Learner',
  onNavigateLearn,
  onNavigatePractice,
}) => {
  const { profile, user } = useAuth();
  const { showToast } = useToast();

  const effectiveId = profile?.id || user?.id || studentId;
  const effectiveName = profile?.full_name || user?.user_metadata?.full_name || studentName;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<MotivationSystemData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'milestones' | 'progress' | 'charter'>('overview');

  // Celebration Modal State
  const [celebrationModalOpen, setCelebrationModalOpen] = useState(false);
  const [celebratedMilestone, setCelebratedMilestone] = useState<LearningMilestone | null>(null);
  const [celebratedAchievement, setCelebratedAchievement] = useState<Achievement | null>(null);

  const loadData = async () => {
    try {
      const result = await motivationService.getMotivationData(effectiveId, effectiveName);
      setData(result);
    } catch (err) {
      console.warn('Could not load motivation data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [effectiveId, effectiveName]);

  const handleUpdateGoal = async (newMinutes: number) => {
    try {
      const updated = await motivationService.setDailyGoal(effectiveId, newMinutes);
      setData((prev) => (prev ? { ...prev, dailyGoal: updated } : prev));
      showToast({
        type: 'success',
        title: 'Daily Goal Updated',
        message: `Your new daily target is ${newMinutes} minutes. Keep going!`,
      });
    } catch (err) {
      showToast({ type: 'error', title: 'Error', message: 'Could not update goal.' });
    }
  };

  const handleSimulatePractice = async () => {
    const res = await motivationService.completePractice(
      effectiveId,
      'Fractions & Scale Balances',
      'Mathematics',
      5,
      5
    );
    setData(res.data);
    showToast({
      type: 'success',
      title: 'Practice Session Finished! (+15 XP)',
      message: "You're making progress. 5 minutes added to today's learning goal.",
    });

    if (res.data.achievements.find((a) => a.code === 'hundred_questions' && a.isUnlocked && a.unlockedAt === 'Just now')) {
      const ach = res.data.achievements.find((a) => a.code === 'hundred_questions')!;
      setCelebratedAchievement(ach);
      setCelebratedMilestone(null);
      setCelebrationModalOpen(true);
    }
  };

  const handleSimulateLesson = async () => {
    const res = await motivationService.completeLesson(
      effectiveId,
      'Decimals & Money Calculations',
      'Mathematics',
      8
    );
    setData(res.data);
    showToast({
      type: 'success',
      title: 'Lesson Completed! (+30 XP)',
      message: "One more step toward mastery. 8 minutes added to today's streak goal.",
    });
  };

  const handleSelectMilestone = (m: LearningMilestone) => {
    setCelebratedMilestone(m);
    setCelebratedAchievement(null);
    setCelebrationModalOpen(true);
  };

  const handleSelectAchievement = (ach: Achievement) => {
    setCelebratedAchievement(ach);
    setCelebratedMilestone(null);
    setCelebrationModalOpen(true);
  };

  if (loading || !data) {
    return (
      <div className="py-12">
        <LoadingState message="Loading your personal growth space..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ========================================================== */}
      {/* 1. TOP SECTION: PERSONAL GROWTH BANNER & TELEMETRY */}
      {/* ========================================================== */}
      <section className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-brand-900 via-brand-800 to-slate-900 text-white shadow-elevated border border-brand-700/50">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="saffron" size="sm" dot>
                {data.xpSummary.levelTitle}
              </Badge>
              <span className="text-xs text-brand-200">
                Personal Motivation & Growth Center
              </span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Keep Going, {effectiveName} 👋
            </h1>

            <p className="text-xs sm:text-sm text-brand-100 leading-relaxed">
              Real learning is a personal journey, not a race against others. Every small step builds lasting understanding.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-xl flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                Zero Public Rankings • Private Personal Progress
              </span>
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
              <div className="mt-2 text-xl font-black text-white">{data.streakInfo.currentStreak} Days</div>
              <span className="text-[10px] text-brand-200">Daily habit</span>
            </div>

            {/* Total XP */}
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between text-amber-300">
                <span className="text-[10px] uppercase font-bold tracking-wider">Total XP</span>
                <Zap className="w-4 h-4 fill-amber-300" />
              </div>
              <div className="mt-2 text-xl font-black text-white">{data.xpSummary.totalXp} XP</div>
              <span className="text-[10px] text-brand-200">Effort points</span>
            </div>

            {/* Today's Goal Progress */}
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between text-emerald-400">
                <span className="text-[10px] uppercase font-bold tracking-wider">Today's Goal</span>
                <Target className="w-4 h-4" />
              </div>
              <div className="mt-2 text-xl font-black text-white">
                {data.dailyGoal.completedMinutes} / {data.dailyGoal.goalMinutes}m
              </div>
              <span className="text-[10px] text-emerald-300">
                {data.dailyGoal.remainingMinutes === 0
                  ? 'Goal completed! 🎯'
                  : `${data.dailyGoal.remainingMinutes}m left`}
              </span>
            </div>

            {/* Improvement Indicator */}
            <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/10 flex flex-col justify-between">
              <div className="flex items-center justify-between text-blue-300">
                <span className="text-[10px] uppercase font-bold tracking-wider">Growth</span>
                <TrendingUp className="w-4 h-4" />
              </div>
              <div className="mt-2 text-xl font-black text-white">+{data.progressHistory.minutesImprovementPct}%</div>
              <span className="text-[10px] text-brand-200">vs last week</span>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================== */}
      {/* 2. DAILY GROWTH AFFIRMATION (Positive Language) */}
      {/* ========================================================== */}
      <section className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-100/50 to-amber-50 border border-amber-200/80 flex items-center gap-3.5 text-slate-800">
        <div className="p-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold shrink-0 shadow-xs">
          <Smile className="w-5 h-5" />
        </div>
        <div className="flex-1 text-xs sm:text-sm">
          <span className="font-bold text-amber-900 mr-1.5">Daily Encouragement:</span>
          <span className="font-medium text-slate-700 italic">"{data.dailyEncouragement}"</span>
        </div>
      </section>

      {/* ========================================================== */}
      {/* 3. NAVIGATION PILL TABS */}
      {/* ========================================================== */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200/80">
        {[
          { id: 'overview', label: 'Growth Overview', icon: Sparkles },
          { id: 'achievements', label: `Achievements (${data.achievements.length})`, icon: Award },
          { id: 'milestones', label: 'Curricular Milestones', icon: BookOpen },
          { id: 'progress', label: 'Improvement Over Time', icon: TrendingUp },
          { id: 'charter', label: 'Healthy Learning Charter', icon: ShieldCheck },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-brand-700 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================== */}
      {/* 4. TAB CONTENTS */}
      {/* ========================================================== */}

      {/* TAB A: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* Daily Goal Card */}
            <div className="lg:col-span-6">
              <DailyGoalCard
                dailyGoal={data.dailyGoal}
                onQuickPractice={handleSimulatePractice}
                onResumeLesson={handleSimulateLesson}
                onUpdateGoal={handleUpdateGoal}
              />
            </div>

            {/* Streak Card */}
            <div className="lg:col-span-6">
              <StreakCard streakInfo={data.streakInfo} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            {/* XP Tracker Card */}
            <div className="lg:col-span-6">
              <XPTrackerCard
                xpSummary={data.xpSummary}
                recentTransactions={data.recentTransactions}
              />
            </div>

            {/* Featured Milestone Card */}
            <div className="lg:col-span-6">
              <Card variant="elevated" className="h-full flex flex-col justify-between border-brand-200/80">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="brand" size="sm" dot>
                      Featured Milestone
                    </Badge>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Mastered (88%)
                    </span>
                  </div>
                  <CardTitle className="text-xl mt-1 text-slate-900">
                    Fractions Basics Completed!
                  </CardTitle>
                  <CardDescription>
                    Understanding parts of a whole through real-world examples.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-brand-50/70 border border-brand-200/70 text-xs text-brand-950 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-brand-600" />
                      What you mastered:
                    </p>
                    <p className="text-[11px] text-slate-700 leading-relaxed italic">
                      "You understood how dividing an object like a roti into equal shares creates fractions."
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-slate-500 font-medium">Reward Claimed:</span>
                    <span className="font-extrabold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      +50 XP Earned
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => handleSelectMilestone(data.milestones[0])}
                    >
                      View Reflection Capsule
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => setActiveTab('milestones')}
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      All Milestones
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* TAB B: ACHIEVEMENTS */}
      {activeTab === 'achievements' && (
        <AchievementsGrid
          achievements={data.achievements}
          onSelectAchievement={handleSelectAchievement}
        />
      )}

      {/* TAB C: MILESTONES */}
      {activeTab === 'milestones' && (
        <MilestonesTimeline
          milestones={data.milestones}
          onSelectMilestone={handleSelectMilestone}
        />
      )}

      {/* TAB D: PROGRESS OVER TIME */}
      {activeTab === 'progress' && (
        <ProgressOverTimeCard progressHistory={data.progressHistory} />
      )}

      {/* TAB E: HEALTHY LEARNING CHARTER */}
      {activeTab === 'charter' && (
        <Card variant="elevated" className="border-emerald-200/80">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Badge variant="forest" size="sm" dot>
                Institutional Policy
              </Badge>
              <h3 className="text-lg font-bold text-slate-900">
                ShikshaSetu Healthy Learning Charter
              </h3>
            </div>
            <CardTitle className="text-xl sm:text-2xl mt-1">
              Why We Say NO to Public Competition & Ranking
            </CardTitle>
            <CardDescription>
              Our principles on child psychology, intrinsic motivation, and ethical education technology.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Pillar 1 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Heart className="w-4 h-4 text-emerald-600" />
                  <span>No Public Leaderboards</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Ranking children against each other produces anxiety and discourages learners who need more time. In ShikshaSetu, you only compete with your past self.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Zero Shaming Mechanics</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  We never label any student as "worst performer" or "lagging behind". We use constructive growth framing: <em>Mastered</em>, <em>Developing</em>, and <em>Needs Practice</em>.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Flame className="w-4 h-4 text-saffron-600" />
                  <span>Gentle, Forgiving Streaks</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Life in rural and low-resource environments involves farm duties, family care, and electricity outages. If you miss a day, your knowledge does not disappear. No aggressive guilt notifications.
                </p>
              </div>

              {/* Pillar 4 */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center gap-2 font-bold text-slate-900">
                  <Smile className="w-4 h-4 text-amber-600" />
                  <span>Positive, Supportive Language</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Every interaction is rooted in empathy: <em>"Keep going."</em>, <em>"You're making progress."</em>, and <em>"One more step toward mastery."</em>
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center justify-between gap-4">
              <span className="font-bold">
                ✓ Architecture Verified: Zero competitive ranking queries or public leaderboards exist in the ShikshaSetu platform.
              </span>
              <Badge variant="forest" size="sm">
                Certified Ethical
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ========================================================== */}
      {/* 5. CELEBRATION MODAL */}
      {/* ========================================================== */}
      <MilestoneCelebrationModal
        isOpen={celebrationModalOpen}
        onClose={() => setCelebrationModalOpen(false)}
        milestone={celebratedMilestone}
        achievement={celebratedAchievement}
      />
    </div>
  );
};
