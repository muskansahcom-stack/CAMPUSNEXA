import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { Modal } from '../ui/Modal';
import { DailyGoalInfo } from '../../types/motivation';
import { Target, Clock, CheckCircle2, ArrowRight, Settings2, Sparkles } from 'lucide-react';

interface DailyGoalCardProps {
  dailyGoal: DailyGoalInfo;
  onQuickPractice?: () => void;
  onResumeLesson?: () => void;
  onUpdateGoal?: (minutes: number) => Promise<void>;
}

export const DailyGoalCard: React.FC<DailyGoalCardProps> = ({
  dailyGoal,
  onQuickPractice,
  onResumeLesson,
  onUpdateGoal,
}) => {
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(dailyGoal.goalMinutes);
  const [isSaving, setIsSaving] = useState(false);

  const remaining = Math.max(0, dailyGoal.goalMinutes - dailyGoal.completedMinutes);

  const handleSaveGoal = async () => {
    if (onUpdateGoal) {
      setIsSaving(true);
      await onUpdateGoal(selectedGoal);
      setIsSaving(false);
    }
    setIsGoalModalOpen(false);
  };

  return (
    <>
      <Card variant="elevated" className="h-full flex flex-col justify-between border-emerald-200/80">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <Badge variant="forest" size="sm" dot>
              Daily Target
            </Badge>
            <button
              onClick={() => setIsGoalModalOpen(true)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 transition-colors"
              title="Customize Daily Goal"
            >
              <Settings2 className="w-3.5 h-3.5" />
              <span>Adjust Goal</span>
            </button>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <CardTitle className="text-2xl sm:text-3xl font-black text-slate-900">
              {dailyGoal.completedMinutes} / {dailyGoal.goalMinutes} minutes
            </CardTitle>
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              {dailyGoal.percentage}%
            </span>
          </div>

          <CardDescription className="text-xs">
            Consistent 15–20 minutes daily builds stronger memory than weekend cramming.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <ProgressBar
            value={dailyGoal.completedMinutes}
            max={dailyGoal.goalMinutes}
            label="Daily Practice Progress"
            variant="forest"
            size="lg"
          />

          {/* Supportive Growth Message */}
          <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/60 text-xs text-emerald-950 space-y-1">
            <div className="flex items-center gap-2 font-bold">
              {dailyGoal.isAchieved ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Daily goal reached! Outstanding persistence.</span>
                </>
              ) : (
                <>
                  <Clock className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Keep going. You're making progress.</span>
                </>
              )}
            </div>

            <p className="text-[11px] text-emerald-900/80 leading-relaxed">
              {dailyGoal.isAchieved
                ? "You've solidified today's learning foundation. Feel free to explore more or rest!"
                : `Just ${remaining} more minutes today. One more step toward mastery.`}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <Button
              size="sm"
              variant="outline"
              onClick={onQuickPractice}
              leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-600" />}
              className="text-xs"
            >
              5-Min Practice (+15 XP)
            </Button>

            <Button
              size="sm"
              variant="primary"
              onClick={onResumeLesson}
              rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
              className="text-xs"
            >
              Continue Lesson (+30 XP)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customize Daily Goal Modal */}
      <Modal
        isOpen={isGoalModalOpen}
        onClose={() => setIsGoalModalOpen(false)}
        title="Personalize Daily Learning Target"
        maxWidth="sm"
      >
        <div className="space-y-4 pt-1">
          <p className="text-xs text-slate-600">
            Choose a daily practice goal that feels comfortable and achievable for your schedule.
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {[10, 15, 20, 30].map((mins) => (
              <button
                key={mins}
                onClick={() => setSelectedGoal(mins)}
                className={`p-3 rounded-2xl border text-center transition-all ${
                  selectedGoal === mins
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-900 font-bold ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="text-base font-extrabold">{mins} mins</div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {mins <= 10 ? 'Gentle Starter' : mins <= 20 ? 'Recommended' : 'In-Depth'}
                </div>
              </button>
            ))}
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsGoalModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSaveGoal}
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Set Goal'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};
