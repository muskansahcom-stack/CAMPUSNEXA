import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { StreakInfo } from '../../types/motivation';
import { Flame, ShieldCheck, Calendar, Heart, Check, Clock } from 'lucide-react';

interface StreakCardProps {
  streakInfo: StreakInfo;
}

export const StreakCard: React.FC<StreakCardProps> = ({ streakInfo }) => {
  return (
    <Card variant="elevated" className="h-full flex flex-col justify-between border-saffron-200/80">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Badge variant="saffron" size="sm" dot>
            Daily Streak
          </Badge>
          <div className="flex items-center gap-1 text-xs text-saffron-700 bg-saffron-50 px-2 py-0.5 rounded-md border border-saffron-200">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span className="font-semibold">Gentle Grace Period</span>
          </div>
        </div>

        <div className="flex items-baseline gap-2 mt-1">
          <CardTitle className="text-2xl sm:text-3xl font-black text-slate-900 flex items-center gap-2">
            <span>{streakInfo.currentStreak} Days</span>
            <Flame className="w-6 h-6 text-saffron-500 fill-saffron-500 animate-gentle-pulse" />
          </CardTitle>
          <span className="text-xs font-semibold text-slate-400">
            (Personal best: {streakInfo.longestStreak} days)
          </span>
        </div>

        <CardDescription className="text-xs">
          Celebrate your daily habit of showing up. Consistency is the true bridge to learning.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 7-Day Visual Calendar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              This Week's Activity
            </span>
            <span className="text-saffron-700 font-bold lowercase">
              {streakInfo.weeklyCalendar.filter((d) => d.isCompleted).length} of 7 active
            </span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {streakInfo.weeklyCalendar.map((day) => (
              <div
                key={day.dayName}
                className={`p-2 rounded-2xl flex flex-col items-center justify-between transition-all ${
                  day.isCompleted
                    ? 'bg-saffron-500 text-slate-950 font-bold shadow-xs border border-saffron-600/20'
                    : day.isToday
                    ? 'bg-amber-50 text-amber-900 border-2 border-dashed border-amber-400 font-semibold'
                    : 'bg-slate-100 text-slate-400 border border-slate-200/60'
                }`}
              >
                <span className="text-[10px] font-bold">{day.dayName}</span>

                <div className="my-1.5 flex items-center justify-center">
                  {day.isCompleted ? (
                    <div className="w-5 h-5 rounded-full bg-slate-950 text-saffron-400 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : day.isToday ? (
                    <div className="w-5 h-5 rounded-full bg-amber-200/80 text-amber-800 flex items-center justify-center animate-pulse">
                      <Clock className="w-3 h-3" />
                    </div>
                  ) : (
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  )}
                </div>

                <span className="text-[9px]">
                  {day.isCompleted ? `${day.minutesSpent}m` : day.isToday ? 'Today' : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Gentle Streak Resilience (No Shaming or Guilt Mechanics) */}
        <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-xs text-amber-950 flex items-start gap-3">
          <div className="w-7 h-7 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 mt-0.5">
            <Heart className="w-4 h-4 fill-slate-950" />
          </div>
          <div className="space-y-1">
            <h5 className="font-bold text-slate-900">
              {streakInfo.encouragement}
            </h5>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              <span className="font-semibold text-amber-900">Zero Pressure Guarantee:</span> Life happens. If you ever miss a day due to family chores, harvest, or power cuts, your hard-earned knowledge never resets.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
