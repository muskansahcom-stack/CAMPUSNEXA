import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { LearningMilestone, Achievement } from '../../types/motivation';
import { Sparkles, Award, CheckCircle2, Zap, ArrowRight, Heart } from 'lucide-react';

interface MilestoneCelebrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestone?: LearningMilestone | null;
  achievement?: Achievement | null;
}

export const MilestoneCelebrationModal: React.FC<MilestoneCelebrationModalProps> = ({
  isOpen,
  onClose,
  milestone,
  achievement,
}) => {
  if (!milestone && !achievement) return null;

  const isMilestone = !!milestone;
  const title = isMilestone ? milestone?.title : achievement?.title;
  const subtitle = isMilestone ? `${milestone?.subject} • ${milestone?.topic}` : achievement?.category;
  const description = isMilestone ? milestone?.reflectionPrompt : achievement?.description;
  const xpReward = isMilestone ? milestone?.xpEarned : achievement?.xpReward;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title=""
      maxWidth="md"
    >
      <div className="text-center py-4 space-y-5">
        {/* Subtle, Tasteful Celebration Icon (Calm Float + Gentle Pulse) */}
        <div className="relative mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-amber-400 via-saffron-500 to-amber-600 text-slate-950 flex items-center justify-center shadow-elevated animate-calm-float tasteful-glow-amber">
          <div className="absolute inset-0 rounded-3xl animate-soft-shimmer pointer-events-none" />
          <Award className="w-10 h-10 text-slate-950 fill-amber-200 stroke-[2]" />
        </div>

        {/* Header Text */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="saffron" size="sm" dot>
              {isMilestone ? 'Curricular Milestone Mastered' : 'Achievement Unlocked'}
            </Badge>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {title}
          </h3>

          <p className="text-xs uppercase font-bold tracking-wider text-slate-400">
            {subtitle}
          </p>
        </div>

        {/* Reflection / Description Capsule */}
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-left space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-950">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Why this matters for your learning:</span>
          </div>

          <p className="text-xs text-slate-700 leading-relaxed italic">
            "{description}"
          </p>
        </div>

        {/* XP Reward & Positive Affirmation */}
        <div className="flex items-center justify-center gap-4 py-1">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 text-amber-950 font-extrabold text-sm border border-amber-300">
            <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
            <span>+{xpReward} Learning XP Earned</span>
          </div>
        </div>

        {/* Supportive Positive Message */}
        <p className="text-xs font-semibold text-slate-600">
          "One more step toward mastery. You're making progress. Keep going."
        </p>

        {/* Action Button */}
        <div className="pt-2">
          <Button
            variant="saffron"
            size="md"
            onClick={onClose}
            className="w-full sm:w-auto px-8"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Continue Learning Journey
          </Button>
        </div>
      </div>
    </Modal>
  );
};
