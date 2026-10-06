import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { NormalizedLearningPath } from '../../../types/connectivity';
import { CheckCircle2, Lock, Sparkles, ArrowDown } from 'lucide-react';

interface UniversalLearningPathViewProps {
  learningPath: NormalizedLearningPath;
  onSelectNode?: (nodeId: string) => void;
}

export const UniversalLearningPathView: React.FC<UniversalLearningPathViewProps> = ({
  learningPath,
  onSelectNode,
}) => {
  return (
    <Card variant="elevated" className="border-slate-200">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base sm:text-lg">
            Personal Learning Journey Map
          </CardTitle>
          <Badge variant="brand" size="sm">
            {learningPath.subject}
          </Badge>
        </div>
        <p className="text-xs text-slate-500">
          Normalized progression pathway rendered identically across all network states.
        </p>
      </CardHeader>

      <CardContent className="pt-2">
        <div className="space-y-3">
          {learningPath.nodes.map((node, idx) => {
            const isCompleted = node.status === 'completed';
            const isInProgress = node.status === 'in_progress';
            const isNeedsPractice = node.status === 'needs_practice';
            const isLocked = node.status === 'locked';

            return (
              <React.Fragment key={node.id}>
                <div
                  onClick={() => !isLocked && onSelectNode && onSelectNode(node.id)}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isLocked
                      ? 'bg-slate-50/80 border-slate-200 opacity-60 cursor-not-allowed'
                      : isInProgress
                      ? 'bg-brand-50 border-brand-400 text-brand-950 font-bold shadow-soft cursor-pointer hover:border-brand-500'
                      : isNeedsPractice
                      ? 'bg-amber-50 border-2 border-amber-300 text-amber-950 font-bold cursor-pointer hover:border-amber-400'
                      : 'bg-white border-slate-200 hover:border-slate-300 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-700'
                          : isInProgress
                          ? 'bg-brand-600 text-white'
                          : isNeedsPractice
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isLocked ? (
                        <Lock className="w-3.5 h-3.5" />
                      ) : (
                        node.orderIndex
                      )}
                    </div>

                    <div>
                      <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                        {node.title}
                      </span>
                      {isInProgress && (
                        <span className="text-[10px] text-brand-700 font-extrabold uppercase tracking-wider">
                          ● You are here
                        </span>
                      )}
                      {isNeedsPractice && (
                        <span className="text-[10px] text-amber-800 font-bold">
                          Strengthen this concept
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    {node.masteryScore > 0 ? (
                      <span className="text-xs font-bold text-slate-700">
                        {node.masteryScore}% Mastery
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">
                        {node.status}
                      </span>
                    )}
                  </div>
                </div>

                {idx < learningPath.nodes.length - 1 && (
                  <div className="flex justify-center -my-1 text-slate-300">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
