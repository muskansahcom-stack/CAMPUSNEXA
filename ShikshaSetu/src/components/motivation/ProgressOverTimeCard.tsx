import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { PersonalProgressHistory } from '../../types/motivation';
import { TrendingUp, Clock, Award, CheckCircle2, Sparkles, ArrowUpRight, Smile } from 'lucide-react';

interface ProgressOverTimeCardProps {
  progressHistory: PersonalProgressHistory;
}

export const ProgressOverTimeCard: React.FC<ProgressOverTimeCardProps> = ({
  progressHistory,
}) => {
  const maxMins = Math.max(...progressHistory.weeklyImprovement.map((d) => d.minutes), 45);

  return (
    <div className="space-y-6">
      {/* 1. Growth Mindset Affirmation Card */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-100/40 to-emerald-50 border border-emerald-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-600 text-white font-bold shrink-0 shadow-xs">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Personal Improvement Over Time
            </h4>
            <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
              "{progressHistory.growthMindsetMessage}"
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 border border-emerald-200 px-3 py-1.5 rounded-xl flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4 text-emerald-700 stroke-[2.5]" />
            +{progressHistory.minutesImprovementPct}% vs Last Week
          </span>
        </div>
      </div>

      {/* 2. Improvement Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Weekly Learning
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {progressHistory.weeklyMinutes} mins
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1 mt-1">
            <TrendingUp className="w-3 h-3" />
            +32 mins improvement
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Questions Mastered
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {progressHistory.totalQuestionsAnswered}
          </div>
          <span className="text-[11px] font-semibold text-brand-600 mt-1 block">
            Across 4 Subjects
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Lessons Finished
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {progressHistory.totalLessonsCompleted}
          </div>
          <span className="text-[11px] font-semibold text-amber-700 mt-1 block">
            Full Modules
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
            Average Mastery
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
            {progressHistory.averageMasteryPct}%
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 mt-1 block">
            Solid Understanding
          </span>
        </div>
      </div>

      {/* 3. Weekly Activity & Daily Minutes Graph */}
      <Card variant="elevated">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge variant="brand" size="sm" dot>
              Weekly Rhythm
            </Badge>
            <span className="text-xs text-slate-500 font-medium">Daily Practice Consistency</span>
          </div>
          <CardTitle className="text-base text-slate-900">
            7-Day Learning Time & Accuracy Trajectory
          </CardTitle>
          <CardDescription>
            You're making progress. Daily engagement shows healthy memory consolidation.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 pt-6 px-2">
            {progressHistory.weeklyImprovement.map((pt) => {
              const heightPct = Math.round((pt.minutes / maxMins) * 100);
              const isToday = pt.day.includes('Today');

              return (
                <div key={pt.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <span className="text-[10px] font-extrabold text-slate-700">
                    {pt.minutes}m
                  </span>

                  <div className="w-full max-w-[36px] bg-slate-100 rounded-t-xl overflow-hidden h-full flex items-end">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className={`w-full rounded-t-xl transition-all duration-500 ${
                        isToday
                          ? 'bg-gradient-to-t from-saffron-500 to-amber-400 shadow-xs'
                          : 'bg-gradient-to-t from-brand-700 to-brand-500'
                      }`}
                    />
                  </div>

                  <div className="text-center">
                    <span className="text-[10px] font-bold text-slate-600 block truncate max-w-[48px]">
                      {pt.day.split(' ')[0]}
                    </span>
                    <span className="text-[9px] text-emerald-700 font-semibold block">
                      {pt.accuracyPct}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 pt-2 text-[11px] text-slate-500 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-md bg-brand-600" />
              <span>Study Minutes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-emerald-700 font-bold">88%</span>
              <span>Daily Practice Accuracy</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4. Subject Mastery Growth Trajectory */}
      <Card variant="elevated">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge variant="forest" size="sm" dot>
              Mastery Growth
            </Badge>
            <span className="text-xs text-slate-500 font-medium">Over Past 4 Weeks</span>
          </div>
          <CardTitle className="text-base text-slate-900">
            Subject-by-Subject Understanding Acceleration
          </CardTitle>
          <CardDescription>
            Comparing where you started versus where you are now. One more step toward mastery.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {progressHistory.masteryGrowthPoints.map((subj) => (
            <div key={subj.subject} className="space-y-1.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200/60">
              <div className="flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900">{subj.subject}</span>
                  <span className="text-[11px] text-slate-500 ml-2">
                    {subj.masteryStatus}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 line-through text-[11px]">
                    {subj.baselinePct}%
                  </span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {subj.currentPct}%
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded-md">
                    +{subj.growthPct}%
                  </span>
                </div>
              </div>

              <div className="relative pt-1">
                <ProgressBar
                  value={subj.currentPct}
                  variant={subj.currentPct >= 75 ? 'forest' : 'brand'}
                  size="sm"
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
