import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { ProgressBar } from '../ui/ProgressBar';
import { Badge } from '../ui/Badge';
import { AdminAnalyticsData } from '../../types/admin';
import {
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  BookOpen,
  Smartphone,
  Tablet,
  Monitor,
  ArrowUpRight,
} from 'lucide-react';

interface AdminAnalyticsSectionProps {
  analytics: AdminAnalyticsData;
}

export const AdminAnalyticsSection: React.FC<AdminAnalyticsSectionProps> = ({ analytics }) => {
  return (
    <div className="space-y-6">
      {/* 1. PROGRESS TRENDS & PARTICIPATION RATES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progress Trends */}
        <Card variant="elevated" className="border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Curriculum Progress Trajectory
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Monthly progression against regional state board benchmark target
                </p>
              </div>
              <Badge variant="brand" size="sm">4-Week Trajectory</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            {analytics.progressTrends.map((pt, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">{pt.week}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">Target: {pt.targetPct}%</span>
                    <span className="font-extrabold text-slate-900">{pt.averageProgressPct}%</span>
                  </div>
                </div>
                <ProgressBar
                  value={pt.averageProgressPct}
                  size="sm"
                  variant={pt.averageProgressPct >= pt.targetPct ? 'forest' : 'brand'}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Participation Rate */}
        <Card variant="elevated" className="border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Daily Student Participation & Offline Sync
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Daily active learning engagement vs offline sync-dependent learners
                </p>
              </div>
              <Badge variant="neutral" size="sm">Daily Telemetry</Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3.5">
            {analytics.participationRate.map((day, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <span className="w-12 font-bold text-slate-800">{day.day}</span>

                <div className="flex-1 mx-3 space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-emerald-700 font-semibold">Active: {day.activeRatePct}%</span>
                    <span className="text-amber-800 font-medium">Offline Sync: {day.offlineSyncPct}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${day.activeRatePct}%` }}
                      className="bg-emerald-500 h-full rounded-l-full"
                    />
                    <div
                      style={{ width: `${day.offlineSyncPct}%` }}
                      className="bg-amber-400 h-full rounded-r-full"
                    />
                  </div>
                </div>

                <span className="font-bold text-slate-900">{day.activeRatePct}%</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 2. COMPLETION RATE & LEARNING TIME DISTRIBUTION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Completion Rate by Content Category */}
        <Card variant="elevated" className="border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Format-Level Completion Rates
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluation across quizzes, reading notes, worksheets, and audio explainers
              </p>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3.5">
            {analytics.completionRate.map((cat, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-700">{cat.category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-[11px]">Benchmark: {cat.benchmarkPct}%</span>
                    <span className="font-bold text-emerald-700">{cat.completionPct}%</span>
                  </div>
                </div>
                <ProgressBar
                  value={cat.completionPct}
                  size="sm"
                  variant={cat.completionPct >= cat.benchmarkPct ? 'forest' : 'brand'}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Learning Time Distribution by Device Access */}
        <Card variant="elevated" className="border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Learning Time by Hardware Access Mode
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Device access equity breakdown across community tablets, shared phones, and kiosks
              </p>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {analytics.learningTimeDistribution.map((item, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <span className="font-bold text-slate-900 block">{item.deviceType}</span>
                  <span className="text-slate-500 text-[11px]">{item.hours} hours logged</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-extrabold text-brand-700">{item.percentage}%</span>
                  <span className="block text-[10px] text-slate-400 uppercase font-semibold">of Total Time</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 3. SUBJECT-LEVEL GROWTH TRENDS */}
      <Card variant="elevated" className="border-slate-200">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900">
                Subject Mastery Trends & Longitudinal Growth
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparison between initial diagnostic baseline and current mastery scores
              </p>
            </div>
            <span className="text-xs text-emerald-700 font-bold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Positive Net Growth Across All Disciplines
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {analytics.subjectTrends.map((st, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-2">
                <span className="text-xs font-bold text-slate-800 block truncate">{st.subject}</span>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-black text-slate-900">{st.currentMastery}%</div>
                  <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <ArrowUpRight className="w-3 h-3" /> +{st.growthPct}%
                  </span>
                </div>
                <div className="text-[11px] text-slate-400">
                  Baseline: <span className="font-semibold text-slate-600">{st.previousMastery}%</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
