import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../ui/Card';
import { ProgressBar } from '../../ui/ProgressBar';
import { Badge } from '../../ui/Badge';
import { NormalizedAssignment } from '../../../types/connectivity';
import { Calendar, CheckCircle2, Clock } from 'lucide-react';

interface UniversalAssignmentCardProps {
  assignment: NormalizedAssignment;
  onOpen?: (id: string) => void;
}

export const UniversalAssignmentCard: React.FC<UniversalAssignmentCardProps> = ({
  assignment,
  onOpen,
}) => {
  return (
    <Card variant="elevated" className="border-slate-200 hover:border-brand-300 transition-all p-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="brand" size="sm">{assignment.subject}</Badge>
            <span className="text-[11px] text-slate-400 font-semibold flex items-center gap-1">
              <Calendar className="w-3 h-3" /> Due {assignment.dueDate}
            </span>
          </div>
          <h4 className="text-sm font-bold text-slate-900">{assignment.title}</h4>
          <span className="text-xs text-brand-700 font-medium">Topic: {assignment.topic}</span>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="w-28 space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-600">
              <span>{assignment.completionPct}%</span>
              <span>{assignment.status}</span>
            </div>
            <ProgressBar value={assignment.completionPct} size="sm" variant="forest" />
          </div>

          {assignment.status === 'completed' ? (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Done
            </span>
          ) : (
            <button
              onClick={() => onOpen && onOpen(assignment.id)}
              className="px-3 py-1.5 rounded-xl bg-brand-700 hover:bg-brand-800 text-white text-xs font-bold transition-all shadow-xs"
            >
              Start
            </button>
          )}
        </div>
      </div>
    </Card>
  );
};
