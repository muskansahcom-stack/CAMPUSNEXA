import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { LearningMilestone } from '../../types/motivation';
import { Award, CheckCircle2, Lock, ArrowRight, Sparkles, BookOpen, Clock } from 'lucide-react';

interface MilestonesTimelineProps {
  milestones: LearningMilestone[];
  onSelectMilestone?: (milestone: LearningMilestone) => void;
}

export const MilestonesTimeline: React.FC<MilestonesTimelineProps> = ({
  milestones,
  onSelectMilestone,
}) => {
  const completedCount = milestones.filter((m) => m.isCompleted).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="brand" size="sm" dot>
              Curricular Milestones
            </Badge>
            <span className="text-xs font-semibold text-slate-500">
              {completedCount} of {milestones.length} Mastered
            </span>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 mt-1">
            Major Concept Milestones
          </h3>
          <p className="text-xs text-slate-500">
            Milestones celebrate deep, lasting understanding of entire curriculum concepts.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {milestones.map((m, index) => {
          const isCompleted = m.isCompleted;

          return (
            <div
              key={m.id}
              onClick={() => onSelectMilestone && onSelectMilestone(m)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                isCompleted
                  ? 'bg-white border-emerald-200/90 hover:border-emerald-300 shadow-xs'
                  : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 mt-0.5 ${
                    isCompleted
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                  ) : (
                    <Clock className="w-5 h-5 text-slate-400" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      {m.subject} • {m.topic}
                    </span>
                    {isCompleted ? (
                      <Badge variant="forest" size="sm">
                        Mastered ({m.masteryScore}%)
                      </Badge>
                    ) : (
                      <Badge variant="neutral" size="sm">
                        In Progress ({m.masteryScore}%)
                      </Badge>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-slate-900 leading-snug">
                    {m.title}
                  </h4>

                  <p className="text-xs text-slate-600 leading-relaxed max-w-xl">
                    "{m.reflectionPrompt}"
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md inline-block">
                    +{m.xpEarned} XP Earned
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {m.completedAt || 'One more step toward mastery'}
                  </p>
                </div>

                <Button
                  size="sm"
                  variant={isCompleted ? 'secondary' : 'outline'}
                  className="text-xs"
                >
                  {isCompleted ? 'Review Concept' : 'Continue Milestone'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
