import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { XPSummary, XPTransaction } from '../../types/motivation';
import { Zap, BookOpen, CheckCircle2, Award, Sparkles, Flame, Info } from 'lucide-react';

interface XPTrackerCardProps {
  xpSummary: XPSummary;
  recentTransactions?: XPTransaction[];
}

export const XPTrackerCard: React.FC<XPTrackerCardProps> = ({
  xpSummary,
  recentTransactions = [],
}) => {
  return (
    <Card variant="elevated" className="h-full flex flex-col justify-between border-amber-200/80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="saffron" size="sm" dot>
            Learning Effort XP
          </Badge>
          <span className="text-xs font-semibold text-slate-500">
            {xpSummary.levelTitle}
          </span>
        </div>
        <div className="flex items-baseline gap-2 mt-1">
          <CardTitle className="text-2xl sm:text-3xl font-black text-slate-900">
            {xpSummary.totalXp} XP
          </CardTitle>
          <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
            Effort-Based
          </span>
        </div>
        <CardDescription className="text-xs">
          Points represent your personal practice time and milestones, never peer competition.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Level Progression */}
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/60 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-amber-950 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Level {xpSummary.currentLevel} Progress
            </span>
            <span className="font-semibold text-amber-800">
              {xpSummary.xpIntoCurrentLevel} / {xpSummary.xpForNextLevel} XP
            </span>
          </div>

          <ProgressBar
            value={xpSummary.levelProgressPct}
            variant="saffron"
            size="md"
          />

          <p className="text-[11px] text-amber-900/80 pt-0.5">
            {xpSummary.levelProgressPct >= 100
              ? 'Ready for the next learning tier!'
              : `${xpSummary.xpForNextLevel - xpSummary.xpIntoCurrentLevel} XP to reach the next tier.`}
          </p>
        </div>

        {/* 4 Categorized XP Pillars */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Where Your XP Comes From
          </span>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {/* Lessons XP */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <span className="text-slate-600 font-medium text-[11px]">Lessons</span>
              </div>
              <span className="font-bold text-slate-900">+{xpSummary.lessonsXp}</span>
            </div>

            {/* Practice XP */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span className="text-slate-600 font-medium text-[11px]">Practice</span>
              </div>
              <span className="font-bold text-slate-900">+{xpSummary.practiceXp}</span>
            </div>

            {/* Quizzes XP */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                  <Zap className="w-3.5 h-3.5" />
                </div>
                <span className="text-slate-600 font-medium text-[11px]">Quizzes</span>
              </div>
              <span className="font-bold text-slate-900">+{xpSummary.quizzesXp}</span>
            </div>

            {/* Milestones XP */}
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Award className="w-3.5 h-3.5" />
                </div>
                <span className="text-slate-600 font-medium text-[11px]">Milestones</span>
              </div>
              <span className="font-bold text-slate-900">+{xpSummary.milestonesXp}</span>
            </div>
          </div>
        </div>

        {/* Ethical Non-Competitive Guarantee */}
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-start gap-2 text-[11px] text-slate-600">
          <Info className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
          <p>
            <span className="font-semibold text-slate-800">Healthy Learning Guarantee:</span> XP is private to you and your teacher. It is never used to rank you against classmates.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
