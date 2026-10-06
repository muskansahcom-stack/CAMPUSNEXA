import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { Achievement } from '../../types/motivation';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Flame,
  HelpCircle,
  Compass,
  Sparkles,
  WifiOff,
  Lock,
  Check,
  Zap,
} from 'lucide-react';

interface AchievementsGridProps {
  achievements: Achievement[];
  onSelectAchievement?: (achievement: Achievement) => void;
}

export const AchievementsGrid: React.FC<AchievementsGridProps> = ({
  achievements,
  onSelectAchievement,
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'in_progress'>('all');

  const filteredAchievements = achievements.filter((ach) => {
    if (filter === 'unlocked') return ach.isUnlocked;
    if (filter === 'in_progress') return !ach.isUnlocked;
    return true;
  });

  const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

  const renderIcon = (iconName: string, isUnlocked: boolean) => {
    const iconClass = `w-6 h-6 ${isUnlocked ? 'text-saffron-800' : 'text-slate-400'}`;
    switch (iconName) {
      case 'BookOpen':
        return <BookOpen className={iconClass} />;
      case 'CheckCircle2':
        return <CheckCircle2 className={iconClass} />;
      case 'Flame':
        return <Flame className={`${iconClass} ${isUnlocked ? 'fill-saffron-500' : ''}`} />;
      case 'HelpCircle':
        return <HelpCircle className={iconClass} />;
      case 'Compass':
        return <Compass className={iconClass} />;
      case 'Sparkles':
        return <Sparkles className={iconClass} />;
      case 'WifiOff':
        return <WifiOff className={iconClass} />;
      default:
        return <Award className={iconClass} />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Header and Filter Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="saffron" size="sm" dot>
              Personal Achievements
            </Badge>
            <span className="text-xs font-semibold text-slate-500">
              {unlockedCount} of {achievements.length} Unlocked
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
            Learning Badges & Dedication
          </h3>
          <p className="text-xs text-slate-500">
            Earn badges through personal practice and curiosity. These celebrate your hard work.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 border border-slate-200/80 self-start sm:self-auto">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({achievements.length})
          </button>
          <button
            onClick={() => setFilter('unlocked')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'unlocked'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Unlocked ({unlockedCount})
          </button>
          <button
            onClick={() => setFilter('in_progress')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === 'in_progress'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            In Progress ({achievements.length - unlockedCount})
          </button>
        </div>
      </div>

      {/* Grid of Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((ach) => {
          const isUnlocked = ach.isUnlocked;
          const progressPct = Math.min(
            100,
            Math.round((ach.currentProgress / ach.targetProgress) * 100)
          );

          return (
            <Card
              key={ach.id}
              variant="elevated"
              className={`p-5 flex flex-col justify-between transition-all cursor-pointer ${
                isUnlocked
                  ? 'border-amber-200 bg-gradient-to-b from-amber-50/50 to-white hover:border-amber-300'
                  : 'border-slate-200 bg-white hover:border-slate-300 opacity-90'
              }`}
              onClick={() => onSelectAchievement && onSelectAchievement(ach)}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                      isUnlocked
                        ? 'bg-gradient-to-br from-amber-200 to-saffron-300 text-saffron-900 shadow-xs'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {renderIcon(ach.icon, isUnlocked)}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Zap className="w-3 h-3 fill-amber-500" />
                      +{ach.xpReward} XP
                    </span>

                    {isUnlocked ? (
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                        <Lock className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="text-base font-bold text-slate-900 leading-snug">
                    {ach.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {ach.description}
                  </p>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-medium">
                    {isUnlocked ? 'Unlocked' : 'Goal Progress'}
                  </span>
                  <span className="font-bold text-slate-800">
                    {ach.currentProgress} / {ach.targetProgress} {ach.progressUnit}
                  </span>
                </div>

                <ProgressBar
                  value={progressPct}
                  variant={isUnlocked ? 'forest' : 'saffron'}
                  size="sm"
                />

                <p className="text-[11px] text-amber-900/80 font-medium pt-0.5 italic">
                  "{ach.encouragement}"
                </p>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
