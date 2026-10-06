import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { LearningSupportAlert, ClassroomFilterState } from '../../types/teacher';
import {
  Sparkles,
  AlertCircle,
  Eye,
  BookOpen,
  CheckCircle2,
  X,
  Filter,
  ShieldCheck,
  TrendingDown,
  Repeat,
  WifiOff,
  UserCheck,
} from 'lucide-react';

interface LearningSupportSectionProps {
  alerts: LearningSupportAlert[];
  filters: ClassroomFilterState;
  onFilterChange: (filters: Partial<ClassroomFilterState>) => void;
  onViewStudent: (studentId: string) => void;
  onAssignPractice: (alert: LearningSupportAlert) => void;
  onDismissAlert: (alertId: string) => void;
}

export const LearningSupportSection: React.FC<LearningSupportSectionProps> = ({
  alerts,
  filters,
  onFilterChange,
  onViewStudent,
  onAssignPractice,
  onDismissAlert,
}) => {
  const getPatternIcon = (pattern: string) => {
    switch (pattern) {
      case 'repeated_mistakes':
        return <Repeat className="w-4 h-4 text-amber-600" />;
      case 'declining_mastery':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      case 'low_engagement':
        return <WifiOff className="w-4 h-4 text-slate-500" />;
      case 'repeated_attempts_no_improvement':
        return <AlertCircle className="w-4 h-4 text-saffron-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-amber-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'needs_support':
        return (
          <Badge variant="saffron" size="sm" dot>
            Needs support
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge variant="brand" size="sm">
            In Action
          </Badge>
        );
      case 'resolved':
        return (
          <Badge variant="neutral" size="sm">
            Resolved
          </Badge>
        );
      default:
        return (
          <Badge variant="saffron" size="sm">
            Needs support
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* SECTION HEADER & PRIVACY NOTICE */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-amber-500/10 border border-amber-300/60 text-slate-900 shadow-soft">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-saffron-500 text-slate-950 font-bold">
              <Sparkles className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900">
              Learning Support
            </h2>
            <Badge variant="saffron" size="sm">
              {alerts.length} Actionable Alert{alerts.length === 1 ? '' : 's'}
            </Badge>
          </div>
          <p className="text-xs text-slate-700 max-w-2xl leading-relaxed">
            Automatic AI pattern detection surfaces learning bottlenecks so you never have to manually inspect 40+ student logs.
          </p>
        </div>

        {/* Strict Anti-Shaming & Privacy Badge */}
        <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-amber-200/80 text-amber-950 text-xs font-semibold shrink-0 shadow-xs">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Private Teacher View • Zero Public Ranking</span>
        </div>
      </div>

      {/* FILTER BAR */}
      <Card variant="default" className="p-4 bg-white border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-slate-500 font-bold uppercase text-[10px] tracking-wider shrink-0">
            <Filter className="w-3.5 h-3.5 text-brand-600" />
            Filters:
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 flex-1">
            {/* Class Filter */}
            <select
              value={filters.selectedClass}
              onChange={(e) => onFilterChange({ selectedClass: e.target.value })}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50/50 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Classes</option>
              <option value="8A">Class 8A</option>
              <option value="8B">Class 8B</option>
              <option value="7A">Class 7A</option>
            </select>

            {/* Subject Filter */}
            <select
              value={filters.selectedSubject}
              onChange={(e) => onFilterChange({ selectedSubject: e.target.value })}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50/50 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Subjects</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
            </select>

            {/* Grade Filter */}
            <select
              value={filters.selectedGrade}
              onChange={(e) => onFilterChange({ selectedGrade: e.target.value })}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50/50 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Grades</option>
              <option value="8">Grade 8</option>
              <option value="7">Grade 7</option>
            </select>

            {/* Mastery Filter */}
            <select
              value={filters.selectedMastery}
              onChange={(e) => onFilterChange({ selectedMastery: e.target.value })}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50/50 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Mastery</option>
              <option value="mastered">Mastered (&gt;80%)</option>
              <option value="developing">Developing (50-80%)</option>
              <option value="needs_practice">Needs Practice (&lt;50%)</option>
            </select>

            {/* Support Status Filter */}
            <select
              value={filters.selectedSupportStatus}
              onChange={(e) => onFilterChange({ selectedSupportStatus: e.target.value })}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-medium bg-slate-50/50 text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">All Support Status</option>
              <option value="needs_support">Needs Support</option>
              <option value="on_track">On Track</option>
              <option value="excellent">Excellent</option>
            </select>
          </div>
        </div>
      </Card>

      {/* SUPPORT ALERTS GRID */}
      {alerts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-brand-300 shadow-soft hover:shadow-card transition-all flex flex-col justify-between space-y-4"
            >
              {/* Top Row: Student, Topic, Status */}
              <div>
                <div className="flex items-start justify-between gap-3 mb-2.5">
                  <div className="flex items-center gap-3">
                    <img
                      src={alert.studentAvatar || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80'}
                      alt={alert.studentName}
                      className="w-10 h-10 rounded-2xl object-cover border border-slate-200 shrink-0"
                    />
                    <div>
                      <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                        {alert.studentName}
                        <span className="text-[11px] font-medium text-slate-500">
                          ({alert.className})
                        </span>
                      </h3>
                      <span className="text-xs font-bold text-brand-700">
                        Topic: {alert.topic}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {getStatusBadge(alert.status)}
                  </div>
                </div>

                {/* Telemetry Row: Mastery & Recent Attempts */}
                <div className="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs mb-3">
                  <div>
                    <span className="text-slate-500 block text-[10px] font-semibold uppercase">
                      Mastery
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {alert.mastery}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px] font-semibold uppercase">
                      Recent Attempts
                    </span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {alert.recentAttempts}
                    </span>
                  </div>
                </div>

                {/* Reason */}
                <div className="space-y-1 mb-3">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Reason:
                  </span>
                  <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                    "{alert.reason}"
                  </p>
                </div>

                {/* Non-Diagnostic AI Support Observation */}
                <div className="p-3 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-950 flex items-start gap-2.5">
                  <div className="p-1 rounded-lg bg-amber-200/70 shrink-0 mt-0.5">
                    {getPatternIcon(alert.patternType)}
                  </div>
                  <div>
                    <span className="font-extrabold text-amber-900 mr-1.5">
                      May need additional support.
                    </span>
                    <span className="text-slate-700 text-[11px] leading-relaxed">
                      {alert.aiSupportNote}
                    </span>
                  </div>
                </div>

                {/* Recommended Action */}
                <div className="mt-3 p-3 rounded-2xl bg-brand-50/80 border border-brand-200/70 text-xs text-brand-950">
                  <span className="font-bold text-brand-900 block text-[10px] uppercase tracking-wider mb-0.5">
                    Recommended action:
                  </span>
                  <p className="font-extrabold text-xs text-brand-900">
                    "{alert.recommendedAction}"
                  </p>
                </div>
              </div>

              {/* Action Buttons: View Student, Assign Practice, Dismiss */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onViewStudent(alert.studentId)}
                  leftIcon={<Eye className="w-3.5 h-3.5" />}
                >
                  View Student
                </Button>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="saffron"
                    onClick={() => onAssignPractice(alert)}
                    leftIcon={<BookOpen className="w-3.5 h-3.5" />}
                  >
                    Assign Practice
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDismissAlert(alert.id)}
                    title="Dismiss alert"
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-8 text-center rounded-3xl bg-white border border-slate-200 space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">
            No Critical Support Alerts in Selected Filter
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All students in this cohort are currently progressing well without repeated bottlenecks.
          </p>
        </div>
      )}
    </div>
  );
};
