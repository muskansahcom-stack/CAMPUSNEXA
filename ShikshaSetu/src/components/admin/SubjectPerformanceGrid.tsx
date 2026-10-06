import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { SubjectPerformanceMetric } from '../../types/admin';
import { BookOpen, Users, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

interface SubjectPerformanceGridProps {
  subjects: SubjectPerformanceMetric[];
}

export const SubjectPerformanceGrid: React.FC<SubjectPerformanceGridProps> = ({ subjects }) => {
  const getStatusBadge = (status: SubjectPerformanceMetric['status']) => {
    switch (status) {
      case 'excelling':
        return <Badge variant="brand" size="sm">Excelling (&gt;75%)</Badge>;
      case 'on_track':
        return <Badge variant="neutral" size="sm">On Track</Badge>;
      case 'needs_attention':
        return <Badge variant="saffron" size="sm">Needs Attention</Badge>;
    }
  };

  return (
    <Card variant="elevated" className="border-slate-200">
      <CardHeader className="pb-3 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-base font-bold text-slate-900">
              Subject-Level Academic Performance
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparative mastery, learning volume, and curriculum completion by discipline
            </p>
          </div>
          <span className="text-xs text-slate-400 font-medium">
            {subjects.length} Active Disciplines
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {subjects.map((sub) => (
            <div
              key={sub.id}
              className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 hover:bg-white hover:border-slate-300 transition-all space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-700 shadow-2xs">
                    <BookOpen className="w-4 h-4 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">{sub.subject}</h3>
                    <span className="text-[11px] text-slate-500">Grade {sub.grade} Curriculum</span>
                  </div>
                </div>
                {getStatusBadge(sub.status)}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600">Average Topic Mastery</span>
                  <span className="text-slate-900 font-bold">{sub.averageMasteryPct}%</span>
                </div>
                <ProgressBar
                  value={sub.averageMasteryPct}
                  variant={
                    sub.averageMasteryPct >= 75
                      ? 'forest'
                      : sub.averageMasteryPct >= 65
                      ? 'brand'
                      : 'saffron'
                  }
                  size="sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200/60 text-center">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    Learners
                  </span>
                  <span className="text-xs font-bold text-slate-800">{sub.activeLearners}</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    Study Time
                  </span>
                  <span className="text-xs font-bold text-slate-800">{sub.totalLearningHours} hrs</span>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                    Completed
                  </span>
                  <span className="text-xs font-bold text-emerald-700">{sub.completionRatePct}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
