import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { ProgressBar } from '../../ui/ProgressBar';
import { Badge } from '../../ui/Badge';
import { NormalizedProgressCard } from '../../../types/connectivity';
import { Flame, Zap, Target, Award } from 'lucide-react';

interface UniversalProgressCardProps {
  progress: NormalizedProgressCard;
}

export const UniversalProgressCard: React.FC<UniversalProgressCardProps> = ({ progress }) => {
  return (
    <Card variant="elevated" className="border-brand-200 bg-white">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="brand" size="sm">
            {progress.levelTitle}
          </Badge>
          <div className="flex items-center gap-1 text-xs font-black text-saffron-600">
            <Flame className="w-4 h-4 text-saffron-500 fill-saffron-500" />
            <span>{progress.streakDays} Day Streak</span>
          </div>
        </div>
        <CardTitle className="text-base sm:text-lg text-slate-900 mt-2">
          Daily Learning Goal
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4 pt-0">
        <div>
          <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
            <span>{progress.todayCompletedMinutes} / {progress.dailyGoalMinutes} mins completed</span>
            <span className="text-brand-700">{progress.overallProgressPct}%</span>
          </div>
          <ProgressBar
            value={progress.overallProgressPct}
            variant="brand"
            size="md"
          />
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50">
            <Zap className="w-4 h-4 text-saffron-500 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Total XP</span>
              <span className="font-extrabold text-slate-900">{progress.xpPoints} XP</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50">
            <Target className="w-4 h-4 text-emerald-600 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Active Topic</span>
              <span className="font-extrabold text-slate-900 truncate block">{progress.activeTopic}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
