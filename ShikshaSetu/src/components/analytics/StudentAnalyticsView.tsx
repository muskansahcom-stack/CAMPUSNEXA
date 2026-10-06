import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { DateFilterBar } from './DateFilterBar';
import { TrendAreaChart } from './charts/TrendAreaChart';
import { ComparisonBarChart } from './charts/ComparisonBarChart';
import { ConsistencyHeatmap } from './charts/ConsistencyHeatmap';
import { DistributionDonut } from './charts/DistributionDonut';
import { analyticsService } from '../../services/analyticsService';
import { DateRangeFilter, StudentAnalyticsData } from '../../types/analytics';
import {
  Award,
  Clock,
  CheckCircle2,
  BookOpen,
  TrendingUp,
  Flame,
  Activity,
  AlertCircle,
  RefreshCw,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  Calendar,
} from 'lucide-react';

interface StudentAnalyticsViewProps {
  studentId: string;
  studentName?: string;
}

export const StudentAnalyticsView: React.FC<StudentAnalyticsViewProps> = ({
  studentId,
  studentName = 'Learner',
}) => {
  const [filter, setFilter] = useState<DateRangeFilter>({ period: '7d' });
  const [data, setData] = useState<StudentAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadAnalytics = async (selectedFilter: DateRangeFilter) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await analyticsService.fetchStudentAnalytics(
        studentId,
        selectedFilter,
        studentName
      );
      setData(result);
    } catch (err: any) {
      console.error('Failed to load student analytics:', err);
      setErrorMessage(err.message || 'Unable to retrieve your learning telemetry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics(filter);
  }, [filter, studentId]);

  // ===========================================================================
  // 1. ERROR STATE
  // ===========================================================================
  if (errorMessage) {
    return (
      <Card variant="elevated" className="border-red-200 p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900">Learning Analytics Unavailable</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">{errorMessage}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadAnalytics(filter)}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Try Again
        </Button>
      </Card>
    );
  }

  // ===========================================================================
  // 2. LOADING STATE
  // ===========================================================================
  if (isLoading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-14 bg-slate-200 rounded-2xl w-full" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-100 rounded-2xl" />
          <div className="h-64 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  // ===========================================================================
  // 3. EMPTY STATE (e.g. When a custom range has 0 activity)
  // ===========================================================================
  const hasNoActivity =
    data.topicMastery.topics.length === 0 &&
    data.learningTime.totalMinutes === 0 &&
    data.quizPerformance.totalQuizzes === 0;

  if (hasNoActivity) {
    return (
      <div className="space-y-6">
        <DateFilterBar currentFilter={filter} onFilterChange={setFilter} />
        <Card variant="elevated" className="p-10 text-center space-y-4 border-dashed border-slate-300">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-xs">
            <Calendar className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">No Learning Activity in this Date Range</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              You haven't logged any practice or lesson time during this period. Try expanding your date filter or starting a quick 5-minute practice session.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Button variant="saffron" size="sm" onClick={() => setFilter({ period: '7d' })}>
              Switch to Last 7 Days
            </Button>
            <Button variant="outline" size="sm" onClick={() => setFilter({ period: '30d' })}>
              View Last 30 Days
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ===========================================================================
  // 4. MAIN ANALYTICS DASHBOARD
  // ===========================================================================
  const {
    topicMastery,
    learningTime,
    quizPerformance,
    lessonsCompleted,
    improvementOverTime,
    streak,
    learningConsistency,
  } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* HEADER WITH DATE FILTER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="brand" size="sm">
              Personal Learning Telemetry
            </Badge>
            <span className="text-xs text-slate-400">• Real Database Analytics</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Your Progress & Learning Growth
          </h2>
          <p className="text-xs text-slate-500">
            Private telemetry designed to encourage consistent growth, not competition.
          </p>
        </div>

        <DateFilterBar currentFilter={filter} onFilterChange={setFilter} />
      </div>

      {/* 4 HIGH-LEVEL TELEMETRY CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Streak */}
        <Card variant="default" className="p-4 border-slate-200">
          <div className="flex items-center justify-between text-saffron-500">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Streak
            </span>
            <Flame className="w-4 h-4 fill-saffron-500" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {streak.currentStreakDays} Days
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold">{streak.streakStatus}</span>
        </Card>

        {/* Learning Time */}
        <Card variant="default" className="p-4 border-slate-200">
          <div className="flex items-center justify-between text-brand-600">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Learning Time
            </span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {learningTime.totalMinutes} min
          </div>
          <span className="text-[11px] text-slate-500">
            ~{learningTime.dailyAverageMinutes} min/day avg
          </span>
        </Card>

        {/* Quiz Performance */}
        <Card variant="default" className="p-4 border-slate-200">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Quiz Accuracy
            </span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {quizPerformance.accuracyPct}%
          </div>
          <span className="text-[11px] text-slate-500">
            {quizPerformance.totalQuizzes} quizzes completed
          </span>
        </Card>

        {/* Lessons Completed */}
        <Card variant="default" className="p-4 border-slate-200">
          <div className="flex items-center justify-between text-purple-600">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Lessons Completed
            </span>
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {lessonsCompleted.totalCompleted}
          </div>
          <span className="text-[11px] text-purple-700 font-semibold">
            {lessonsCompleted.completionRatePct}% syllabus rate
          </span>
        </Card>
      </div>

      {/* ROW 1: IMPROVEMENT OVER TIME & TOPIC MASTERY DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Improvement Over Time (Trajectory Chart) */}
        <Card variant="elevated" className="lg:col-span-7 flex flex-col justify-between border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-brand-600" />
                  Improvement Over Time
                </CardTitle>
                <CardDescription>
                  Your mastery growth curve and accuracy across practice sessions.
                </CardDescription>
              </div>
              <Badge variant="forest" size="sm">
                +{improvementOverTime.growthRatePct}% Growth
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <TrendAreaChart
              data={improvementOverTime.trajectory.map((t) => ({
                label: t.label,
                value: t.masteryScore,
                secondaryValue: t.quizAccuracy,
              }))}
              color="#2563eb"
              secondaryColor="#10b981"
              unit="%"
              height={190}
              ariaLabel="Mastery improvement trajectory"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                Mastery Score ({improvementOverTime.currentMasteryPct}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                Quiz Accuracy
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Topic Mastery Distribution */}
        <Card variant="elevated" className="lg:col-span-5 flex flex-col justify-between border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-900">
                Topic Mastery Distribution
              </CardTitle>
              <Badge variant="saffron" size="sm">
                {topicMastery.overallMasteryPct}% Overall
              </Badge>
            </div>
            <CardDescription>
              Curriculum balance across Mastered, Developing, and Practice states.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col justify-between h-full space-y-4">
            <DistributionDonut
              segments={[
                { label: 'Mastered (80%+)', value: topicMastery.distribution.mastered, color: '#10b981' },
                { label: 'Developing (50-79%)', value: topicMastery.distribution.developing, color: '#3b82f6' },
                { label: 'Needs Practice (<50%)', value: topicMastery.distribution.needsPractice, color: '#f59e0b' },
              ]}
              centerLabel="Mastery"
              centerValue={`${topicMastery.overallMasteryPct}%`}
            />

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <div className="font-bold text-slate-900">Growth Mindset Note:</div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Concepts in "Needs Practice" are not shortcomings; they are your fastest opportunities to gain XP and reinforce intuition.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROW 2: TOPIC MASTERY BREAKDOWN & LEARNING CONSISTENCY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Granular Topic Mastery List */}
        <Card variant="elevated" className="lg:col-span-7 border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-500" />
                Curriculum Topic Mastery
              </CardTitle>
              <span className="text-xs text-slate-500 font-medium">
                {topicMastery.topics.length} Tracked Topics
              </span>
            </div>
            <CardDescription>
              Granular mastery scores calculated from diagnostic attempts and quizzes.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <ComparisonBarChart
              items={topicMastery.topics.map((t) => ({
                label: t.name,
                value: t.score,
                sublabel: `${t.subject} • ${t.correctAttempts}/${t.attempts} correct attempts • ${t.lastAttempted}`,
                badge: t.status === 'mastered' ? 'Mastered' : t.status === 'developing' ? 'Developing' : 'Practice',
                color: t.score >= 80 ? '#10b981' : t.score >= 50 ? '#3b82f6' : '#f59e0b',
                benchmark: 80,
              }))}
              orientation="horizontal"
              unit="%"
            />
          </CardContent>
        </Card>

        {/* Learning Consistency & Routine */}
        <Card variant="elevated" className="lg:col-span-5 flex flex-col justify-between border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-600" />
                Learning Consistency
              </CardTitle>
              <Badge variant="forest" size="sm">
                {learningConsistency.rating}
              </Badge>
            </div>
            <CardDescription>
              Regular 15-minute daily sessions are proven to anchor long-term retention.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <ConsistencyHeatmap
              days={learningConsistency.dayOfWeekActivity}
              consistencyScore={learningConsistency.consistencyScorePct}
              ratingLabel={learningConsistency.rating}
            />

            {/* Daily Goal Pacing */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between text-xs">
              <div className="space-y-0.5">
                <span className="font-bold text-amber-950">Daily Goal Target:</span>
                <p className="text-[11px] text-amber-800">
                  {learningTime.todayMinutes} / {learningTime.dailyGoalMinutes} min completed today
                </p>
              </div>
              <Badge variant="saffron" size="sm">
                {Math.round((learningTime.todayMinutes / learningTime.dailyGoalMinutes) * 100)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROW 3: RECENT COMPLETED LESSONS & QUIZ LOG */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completed Lessons */}
        <Card variant="elevated" className="border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-purple-600" />
                Recent Completed Lessons
              </CardTitle>
              <span className="text-xs font-semibold text-slate-500">
                {lessonsCompleted.totalCompleted} Total
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-2.5">
            {lessonsCompleted.recentLessons.map((l) => (
              <div
                key={l.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <h5 className="font-bold text-slate-900">{l.title}</h5>
                  <p className="text-[11px] text-slate-500">
                    {l.subject} • Completed {l.completedAt}
                  </p>
                </div>
                <span className="font-extrabold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  {l.timeSpentMinutes}m
                </span>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Quizzes */}
        <Card variant="elevated" className="border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Recent Quiz Performance
              </CardTitle>
              <span className="text-xs font-semibold text-slate-500">
                Avg Speed: {quizPerformance.averageResponseTimeSeconds}s / item
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-2.5">
            {quizPerformance.recentQuizzes.map((q) => (
              <div
                key={q.id}
                className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <div className="space-y-0.5">
                  <h5 className="font-bold text-slate-900">{q.title}</h5>
                  <p className="text-[11px] text-slate-500">
                    {q.correctCount}/{q.totalQuestions} questions correct • {q.completedAt}
                  </p>
                </div>
                <Badge
                  variant={q.scorePct >= 80 ? 'forest' : q.scorePct >= 60 ? 'brand' : 'saffron'}
                  size="md"
                >
                  {q.scorePct}%
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* PRIVACY GUARANTEE BANNER */}
      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
          <div>
            <h5 className="font-bold">Encouragement-First Educational Architecture</h5>
            <p className="text-[11px] text-emerald-700">
              Your analytics are completely private. Zero public rankings or comparative shaming.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
