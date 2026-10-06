import React from 'react';
import { Card } from '../ui/Card';
import { SchoolOverviewMetrics } from '../../types/admin';
import {
  Users,
  GraduationCap,
  Activity,
  Layers,
  TrendingUp,
  Clock,
  CheckCircle2,
  WifiOff,
  BookOpen,
} from 'lucide-react';

interface AdminOverviewMetricsProps {
  metrics: SchoolOverviewMetrics;
}

export const AdminOverviewMetrics: React.FC<AdminOverviewMetricsProps> = ({ metrics }) => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900 tracking-tight">
            Institutional Telemetry & Learning Volume
          </h2>
          <p className="text-xs text-slate-500">
            Real-time aggregate data for {metrics.schoolName} ({metrics.district}, {metrics.state})
          </p>
        </div>
        <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
          UDISE: {metrics.udiseCode}
        </span>
      </div>

      {/* Primary KPI Grid (All 9 prompt-mandated metrics) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* 1. Total Students */}
        <Card variant="default" className="p-4 bg-white border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Students</span>
            <Users className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{metrics.totalStudents}</div>
          <span className="text-[11px] text-slate-500 font-medium">Enrolled in roster</span>
        </Card>

        {/* 2. Total Teachers */}
        <Card variant="default" className="p-4 bg-white border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Total Teachers</span>
            <GraduationCap className="w-4 h-4 text-brand-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{metrics.totalTeachers}</div>
          <span className="text-[11px] text-slate-500 font-medium">Faculty educators</span>
        </Card>

        {/* 3. Active Learners */}
        <Card variant="default" className="p-4 bg-white border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Active Learners</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">{metrics.activeLearners}</div>
          <span className="text-[11px] text-emerald-600 font-semibold">{metrics.activeLearnersPct}% weekly engagement</span>
        </Card>

        {/* 4. Classes */}
        <Card variant="default" className="p-4 bg-white border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Classes</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{metrics.totalClasses}</div>
          <span className="text-[11px] text-slate-500 font-medium">Active grade sections</span>
        </Card>

        {/* 5. Overall Progress */}
        <Card variant="default" className="p-4 bg-white border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Overall Progress</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-700 mt-2">{metrics.overallProgressPct}%</div>
          <span className="text-[11px] text-slate-500 font-medium">Curriculum mastery</span>
        </Card>

        {/* 6. Learning Time */}
        <Card variant="default" className="p-4 bg-white border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Learning Time</span>
            <Clock className="w-4 h-4 text-saffron-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{metrics.totalLearningHours} hrs</div>
          <span className="text-[11px] text-slate-500 font-medium">Cumulative study time</span>
        </Card>

        {/* 7. Lesson Completion */}
        <Card variant="default" className="p-4 bg-white border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Lesson Completion</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">{metrics.lessonCompletions}</div>
          <span className="text-[11px] text-emerald-600 font-semibold">{metrics.completionRatePct}% completion rate</span>
        </Card>

        {/* 8. Offline Learners */}
        <Card variant="default" className="p-4 bg-white border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Offline Learners</span>
            <WifiOff className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 mt-2">{metrics.offlineLearnersCount}</div>
          <span className="text-[11px] text-amber-800 font-semibold">{metrics.offlineLearnersPct}% sync-dependent</span>
        </Card>

        {/* 9. Content Usage */}
        <Card variant="default" className="p-4 bg-white border-slate-200/90 shadow-2xs hover:border-slate-300 transition-all col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-[11px] font-bold uppercase tracking-wider">Content Usage</span>
            <BookOpen className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-black text-purple-700 mt-2">{metrics.contentUsageCount}</div>
          <span className="text-[11px] text-slate-500 font-medium">Resource accesses</span>
        </Card>
      </div>
    </div>
  );
};
