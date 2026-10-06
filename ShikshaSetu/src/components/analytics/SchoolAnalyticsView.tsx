import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { DateFilterBar } from './DateFilterBar';
import { TrendAreaChart } from './charts/TrendAreaChart';
import { ComparisonBarChart } from './charts/ComparisonBarChart';
import { DistributionDonut } from './charts/DistributionDonut';
import { analyticsService } from '../../services/analyticsService';
import { DateRangeFilter, SchoolAnalyticsData } from '../../types/analytics';
import {
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  BookOpen,
  WifiOff,
  Smartphone,
  Layers,
  AlertCircle,
  RefreshCw,
  Building,
  Calendar,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface SchoolAnalyticsViewProps {
  schoolId: string;
}

export const SchoolAnalyticsView: React.FC<SchoolAnalyticsViewProps> = ({ schoolId }) => {
  const [filter, setFilter] = useState<DateRangeFilter>({ period: '7d' });
  const [data, setData] = useState<SchoolAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadAnalytics = async (selectedFilter: DateRangeFilter) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await analyticsService.fetchSchoolAnalytics(schoolId, selectedFilter);
      setData(result);
    } catch (err: any) {
      console.error('Failed to load school analytics:', err);
      setErrorMessage(err.message || 'Unable to retrieve institutional telemetry.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics(filter);
  }, [filter, schoolId]);

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
          <h3 className="text-base font-bold text-slate-900">Institutional Telemetry Error</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">{errorMessage}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadAnalytics(filter)}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Retry Institutional Telemetry
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
  // 3. EMPTY STATE
  // ===========================================================================
  const hasNoActivity =
    data.overallProgress.gradeProgress.length === 0 &&
    data.subjectTrends.length === 0 &&
    data.contentUsage.topModules.length === 0;

  if (hasNoActivity) {
    return (
      <div className="space-y-6">
        <DateFilterBar currentFilter={filter} onFilterChange={setFilter} />
        <Card variant="elevated" className="p-10 text-center space-y-4 border-dashed border-slate-300">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Calendar className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">No Institutional Records in Range</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No school-wide activity recorded for this specific range. Switch filters to view larger periods.
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
  // 4. MAIN SCHOOL ANALYTICS VIEW
  // ===========================================================================
  const {
    overallProgress,
    participation,
    completion,
    learningTime,
    subjectTrends,
    contentUsage,
    offlineUsage,
  } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* HEADER WITH DATE FILTER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="brand" size="sm">
              Institutional Governance
            </Badge>
            <span className="text-xs text-slate-400 font-mono">• {data.schoolName}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            School-Wide Academic Progress & Telemetry
          </h2>
          <p className="text-xs text-slate-500">
            High-level curriculum completion, participation rates, and rural offline learning indicators.
          </p>
        </div>

        <DateFilterBar currentFilter={filter} onFilterChange={setFilter} />
      </div>

      {/* 4 HIGH-LEVEL INSTITUTIONAL METRICS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Overall Progress */}
        <Card variant="default" className="p-4 border-slate-200">
          <div className="flex items-center justify-between text-brand-600">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Overall Progress
            </span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {overallProgress.schoolAverageProgressPct}%
          </div>
          <span className="text-[11px] text-brand-700 font-semibold">Curriculum Benchmark</span>
        </Card>

        {/* Daily Participation */}
        <Card variant="default" className="p-4 border-slate-200">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Participation
            </span>
            <Activity className="w-4 h-4" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {participation.dailyParticipationRatePct}%
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold">
            {participation.activeLearnersCount}/{participation.totalEnrolledStudents} Active Students
          </span>
        </Card>

        {/* Completion Rate */}
        <Card variant="default" className="p-4 border-slate-200">
          <div className="flex items-center justify-between text-purple-600">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Completion Rate
            </span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {completion.curriculumCompletionRatePct}%
          </div>
          <span className="text-[11px] text-slate-500">
            {completion.totalLessonsCompleted} Lessons Completed
          </span>
        </Card>

        {/* Learning Time */}
        <Card variant="default" className="p-4 border-slate-200">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Learning Time
            </span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {learningTime.totalLearningHours} hrs
          </div>
          <span className="text-[11px] text-slate-500">
            ~{learningTime.averageMinutesPerStudent}m/day per learner
          </span>
        </Card>
      </div>

      {/* ROW 1: CURRICULUM PROGRESS TRAJECTORY & PARTICIPATION TIMELINE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Progress Trajectory vs State Targets */}
        <Card variant="elevated" className="lg:col-span-7 flex flex-col justify-between border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-brand-600" />
                  Curriculum Progress vs Regional Target
                </CardTitle>
                <CardDescription>
                  Tracking school performance against state education board targets.
                </CardDescription>
              </div>
              <Badge variant="brand" size="sm">
                4-Week Trajectory
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <TrendAreaChart
              data={overallProgress.progressTrajectory.map((p) => ({
                label: p.periodLabel,
                value: p.progressPct,
                secondaryValue: p.targetPct,
              }))}
              color="#2563eb"
              secondaryColor="#10b981"
              unit="%"
              height={190}
              ariaLabel="Curriculum Progress Trajectory"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" />
                Actual Progress ({overallProgress.schoolAverageProgressPct}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                State Board Target
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Daily Participation & Offline Sync Rate */}
        <Card variant="elevated" className="lg:col-span-5 flex flex-col justify-between border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Participation & Offline Sync
                </CardTitle>
                <CardDescription>
                  Daily learner engagement split by active connection vs offline sync.
                </CardDescription>
              </div>
              <Badge variant="forest" size="sm">
                {participation.dailyParticipationRatePct}% Engaged
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <TrendAreaChart
              data={participation.participationTimeline.map((p) => ({
                label: p.label,
                value: p.activeRatePct,
                secondaryValue: p.offlineSyncPct,
              }))}
              color="#059669"
              secondaryColor="#f59e0b"
              unit="%"
              height={190}
              ariaLabel="Daily Participation & Sync"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                Active Attendance ({participation.dailyParticipationRatePct}%)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                Offline Synced Learners
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROW 2: SUBJECT TRENDS & CONTENT USAGE FORMATS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Subject Trends */}
        <Card variant="elevated" className="lg:col-span-7 border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  Subject Performance Trends
                </CardTitle>
                <CardDescription>
                  Comparative mastery and month-over-month growth across curriculum domains.
                </CardDescription>
              </div>
              <span className="text-xs text-slate-500 font-semibold">
                {subjectTrends.length} Core Domains
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <ComparisonBarChart
              items={subjectTrends.map((s) => ({
                label: s.subject,
                value: s.averageMasteryPct,
                sublabel: `${s.activeLearners} Learners • ${s.completionRatePct}% Completed • ${
                  s.growthDeltaPct >= 0 ? `+${s.growthDeltaPct}%` : `${s.growthDeltaPct}%`
                } growth`,
                badge: s.growthDeltaPct >= 0 ? `+${s.growthDeltaPct}%` : `${s.growthDeltaPct}%`,
                color: s.averageMasteryPct >= 75 ? '#10b981' : '#3b82f6',
                benchmark: 70,
              }))}
              orientation="horizontal"
              unit="%"
            />
          </CardContent>
        </Card>

        {/* Content Usage by Format */}
        <Card variant="elevated" className="lg:col-span-5 flex flex-col justify-between border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Content Format Usage
                </CardTitle>
                <CardDescription>
                  Breakdown of educational interactions by modality.
                </CardDescription>
              </div>
              <Badge variant="brand" size="sm">
                {contentUsage.totalContentInteractions} Total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 flex flex-col justify-between h-full space-y-4">
            <DistributionDonut
              segments={contentUsage.formatBreakdown.map((f, idx) => ({
                label: f.label,
                value: f.percentage,
                color: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'][idx % 5],
              }))}
              centerLabel="Interactions"
              centerValue={`${contentUsage.totalContentInteractions}`}
            />

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <span className="font-bold text-slate-900 block mb-1">Key Insight:</span>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                61.5% of content interactions are lightweight text & worksheets, saving significant data for rural families.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROW 3: OFFLINE USAGE TELEMETRY & LEARNING TIME BY DEVICE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Offline Usage Telemetry */}
        <Card variant="elevated" className="border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <WifiOff className="w-4 h-4 text-amber-600" />
                  Rural Offline Usage Telemetry
                </CardTitle>
                <CardDescription>
                  Tracking low-bandwidth resilience and background synchronization.
                </CardDescription>
              </div>
              <Badge variant="saffron" size="sm">
                {offlineUsage.offlineLearnersPct}% Offline Dependent
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Offline Learners</span>
                <div className="text-xl font-black text-slate-900 mt-0.5">
                  {offlineUsage.offlineLearnersCount}
                </div>
                <span className="text-[10px] text-slate-400">Regular syncers</span>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
                <span className="text-[10px] font-bold text-emerald-800 uppercase">Synced Packets</span>
                <div className="text-xl font-black text-emerald-900 mt-0.5">
                  {offlineUsage.syncPacketsProcessed}
                </div>
                <span className="text-[10px] text-emerald-700">100% Resolved</span>
              </div>

              <div className="p-3 rounded-xl bg-brand-50 border border-brand-200">
                <span className="text-[10px] font-bold text-brand-800 uppercase">Data Saved</span>
                <div className="text-xl font-black text-brand-900 mt-0.5">
                  {(offlineUsage.dataSavedMb / 1024).toFixed(1)} GB
                </div>
                <span className="text-[10px] text-brand-700">Via Local Cache</span>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <span className="text-xs font-bold text-slate-700 block">
                Connectivity Tier Breakdown
              </span>
              {offlineUsage.connectivityPacingBreakdown.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                >
                  <span className="font-semibold text-slate-800">{item.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[11px]">{item.learnersCount} students</span>
                    <Badge variant={idx === 0 ? 'forest' : idx === 1 ? 'saffron' : 'neutral'} size="sm">
                      {item.percentage}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Learning Time Distribution by Device */}
        <Card variant="elevated" className="border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-brand-600" />
                  Learning Time by Device Type
                </CardTitle>
                <CardDescription>
                  Hardware distribution across rural family handsets and tablets.
                </CardDescription>
              </div>
              <Badge variant="brand" size="sm">
                {learningTime.totalLearningHours} hrs Total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <ComparisonBarChart
              items={learningTime.deviceDistribution.map((d) => ({
                label: d.label,
                value: d.hours,
                sublabel: `${d.percentage}% of aggregate learning hours`,
                badge: `${d.percentage}%`,
                color: d.deviceType === 'shared_phone' ? '#f59e0b' : '#3b82f6',
              }))}
              orientation="horizontal"
              unit=" hrs"
              maxValue={500}
            />

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                48.9% of study time occurs on shared parent phones in evenings. Night-mode readability active.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PRIVACY & ETHICAL USE GUARANTEE */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between text-xs border border-slate-800">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <h5 className="font-bold">Institutional Data Integrity & Privacy Guarantee</h5>
            <p className="text-[11px] text-slate-300">
              Institutional records are strictly scoped to {data.schoolName}. All student metrics are presented in aggregate to safeguard privacy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
