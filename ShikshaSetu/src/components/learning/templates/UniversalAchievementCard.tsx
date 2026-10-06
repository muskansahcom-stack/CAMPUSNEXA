import React from 'react';
import { Card } from '../../ui/Card';
import { NormalizedAchievement } from '../../../types/connectivity';
import { Award, Sparkles, Flame, CheckCircle2 } from 'lucide-react';

interface UniversalAchievementCardProps {
  achievement: NormalizedAchievement;
}

export const UniversalAchievementCard: React.FC<UniversalAchievementCardProps> = ({
  achievement,
}) => {
  return (
    <div className="p-3.5 rounded-2xl bg-white border border-slate-200 flex items-center gap-3 shadow-soft">
      <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-300 text-amber-600 flex items-center justify-center shrink-0">
        <Award className="w-5 h-5" />
      </div>

      <div className="space-y-0.5 overflow-hidden">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-bold text-slate-900 truncate">
            {achievement.title}
          </span>
          <span className="text-[10px] text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded-md font-bold">
            Unlocked
          </span>
        </div>
        <p className="text-[11px] text-slate-500 truncate">
          {achievement.description}
        </p>
      </div>
    </div>
  );
};
