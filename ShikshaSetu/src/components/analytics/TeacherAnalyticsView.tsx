import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { DateFilterBar } from './DateFilterBar';
import { TrendAreaChart } from './charts/TrendAreaChart';
import { ComparisonBarChart } from './charts/ComparisonBarChart';
import { DistributionDonut } from './charts/DistributionDonut';
import { analyticsService } from '../../services/analyticsService';
import { DateRangeFilter, TeacherAnalyticsData } from '../../types/analytics';
import {
  Users,
  AlertTriangle,
  CheckCircle2,
  Activity,
  BarChart3,
  Calendar,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  BrainCircuit,
  Clock,
  Sparkles,
  HelpCircle,
} from 'lucide-react';

interface TeacherAnalyticsViewProps {
  teacherId?: string;
  classId?: string;
  onViewStudentDetail?: (studentId: string) => void;
  onAssignRemedialPractice?: (topicId: string, topicName: string) => void;
}

export const TeacherAnalyticsView: React.FC<TeacherAnalyticsViewProps> = ({
  teacherId = 'tch-01',
  classId,
  onViewStudentDetail,
  onAssignRemedialPractice,
}) => {
  const [filter, setFilter] = useState<DateRangeFilter>({ period: '7d' });
  const [data, setData] = useState<TeacherAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadAnalytics = async (selectedFilter: DateRangeFilter) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const result = await analyticsService.fetchTeacherAnalytics(
        teacherId,
        selectedFilter,
        classId
      );
      setData(result);
    } catch (err: any) {
      console.error('Failed to load teacher analytics:', err);
      setErrorMessage(err.message || 'Unable to retrieve classroom cohort analytics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalytics(filter);
  }, [filter, teacherId, classId]);

  // ===========================================================================
  // 1. ERROR STATE
  // ===========================================================================
  if (errorMessage) {
    return (
      <Card variant="elevated" className="border-red-200 p-8 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-slate-900">Classroom Analytics Unavailable</h3>
          <p className="text-xs text-slate-600 max-w-md mx-auto">{errorMessage}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadAnalytics(filter)}
          leftIcon={<RefreshCw className="w-4 h-4" />}
        >
          Retry Classroom Telemetry
        </Button>
      </Card>
    );
  }

  // ===========================================================================
  // 2. LOADING STATE
  // ===========================================================================
  if (isLoading || !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-14 bg-slate-200 rounded-2xl w-full" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-100 rounded-2xl" />
          <div className="h-64 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  // ===========================================================================
  // 3. EMPTY STATE
  // ===========================================================================
  const hasNoActivity =
    data.classProgress.subjectBreakdown.length === 0 &&
    data.assignmentCompletion.totalAssignments === 0 &&
    data.learningEngagement.totalInteractions === 0;

  if (hasNoActivity) {
    return (
      <div className="space-y-6">
        <DateFilterBar currentFilter={filter} onFilterChange={setFilter} />
        <Card variant="elevated" className="p-10 text-center space-y-4 border-dashed border-slate-300">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <Calendar className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-slate-900">No Classroom Activity Found</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No quiz attempts or assignments recorded for this specific range. Switch filters to view longer trajectories.
            </p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <Button variant="saffron" size="sm" onClick={() => setFilter({ period: '7d' })}>
              Switch to Last 7 Days
            </Button>
            <Button variant="outline" size="sm" onClick={() => setFilter({ period: '30d' })}>
              View Last 30 Days
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ===========================================================================
  // 4. MAIN TEACHER ANALYTICS VIEW
  // ===========================================================================
  const {
    classProgress,
    topicDifficultyPatterns,
    studentsNeedingSupport,
    assignmentCompletion,
    learningEngagement,
  } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* HEADER & DATE FILTER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="brand" size="sm">
              Instructional Decision Support
            </Badge>
            <span className="text-xs text-slate-400 font-mono">• Confidential Educator View</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            Classroom Learning Telemetry & Support Patterns
          </h2>
          <p className="text-xs text-slate-500">
            Analytics designed to help teachers make targeted interventions, NOT label students.
          </p>
        </div>

        <DateFilterBar currentFilter={filter} onFilterChange={setFilter} />
      </div>

      {/* 4 HIGH-LEVEL COHORT CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Class Progress */}
        <Card variant="default" className="p-4 border-slate-200">
          <div className="flex items-center justify-between text-brand-600">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Class Progress
            </span>
            <BarChart3 className="w-4 h-4" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {classProgress.averageProgressPct}%
          </div>
          <span className="text-[11px] text-brand-700 font-semibold">Cohort Average</span>
        </Card>

        {/* Learning Engagement */}
        <Card variant="default" className="p-4 border-slate-200">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Active Learners
            </span>
            <Activity className="w-4 h-4" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {learningEngagement.activeRatePct}%
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold">
            {learningEngagement.activeStudentsCount}/{learningEngagement.totalStudentsCount} active today
          </span>
        </Card>

        {/* Assignment Completion */}
        <Card variant="default" className="p-4 border-slate-200">
          <div className="flex items-center justify-between text-purple-600">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Assignment Turn-in
            </span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="mt-2 text-2xl font-black text-slate-900">
            {assignmentCompletion.overallCompletionRatePct}%
          </div>
          <span className="text-[11px] text-slate-500">
            {assignmentCompletion.onTimeRatePct}% on-time rate
          </span>
        </Card>

        {/* Students Needing Support */}
        <Card variant="default" className="p-4 border-slate-200">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Support Needed
            </span>
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="mt-2 text-2xl font-black text-amber-600">
            {studentsNeedingSupport.totalCount} Learners
          </div>
          <span className="text-[11px] text-amber-800 font-semibold">Friction Detected</span>
        </Card>
      </div>

      {/* ROW 1: CLASS PROGRESS & LEARNING ENGAGEMENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Class Progress Comparison */}
        <Card variant="elevated" className="lg:col-span-7 border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Class Progress Across Subjects & Sections
                </CardTitle>
                <CardDescription>
                  Aggregate mastery comparison for active classroom sections.
                </CardDescription>
              </div>
              <Badge variant="brand" size="sm">
                Avg {classProgress.averageProgressPct}%
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 block">
                Subject Performance
              </span>
              <ComparisonBarChart
                items={classProgress.subjectBreakdown.map((s) => ({
                  label: s.subject,
                  value: s.progressPct,
                  sublabel: `${s.studentsCount} Enrolled Learners`,
                  color: s.progressPct >= 75 ? '#10b981' : '#3b82f6',
                  benchmark: 70,
                }))}
                orientation="horizontal"
                unit="%"
              />
            </div>

            <div className="pt-4 border-t border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2 block">
                Section Comparison
              </span>
              <div className="grid grid-cols-2 gap-3">
                {classProgress.sectionComparison.map((sec, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <h5 className="font-bold text-slate-900">{sec.className}</h5>
                      <span className="text-[11px] text-slate-500">{sec.studentsCount} Students</span>
                    </div>
                    <span className="text-sm font-black text-slate-900">
                      {sec.averageProgressPct}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learning Engagement Trend */}
        <Card variant="elevated" className="lg:col-span-5 flex flex-col justify-between border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">
                  Learning Engagement
                </CardTitle>
                <CardDescription>
                  Daily active learning turnout and average study minutes.
                </CardDescription>
              </div>
              <Badge variant="forest" size="sm">
                {learningEngagement.activeRatePct}% Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-4">
            <TrendAreaChart
              data={learningEngagement.dailyActivityTrend.map((d) => ({
                label: d.label,
                value: d.activeCount,
                secondaryValue: d.avgMinutes,
              }))}
              color="#059669"
              secondaryColor="#f59e0b"
              unit=" learners"
              height={175}
              ariaLabel="Daily active students trend"
            />
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" />
                Active Learners ({learningEngagement.activeStudentsCount})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block" />
                Avg Study Time ({learningEngagement.averageStudyTimePerStudentMinutes}m)
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ROW 2: TOPIC DIFFICULTY PATTERNS (Critical for Teacher Decisions) */}
      <Card variant="elevated" className="border-slate-200">
        <CardHeader className="pb-3 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-brand-600" />
                Topic Difficulty Patterns & Error Clusters
              </CardTitle>
              <CardDescription>
                Identifies concepts where students experience cognitive friction to guide next lesson plan.
              </CardDescription>
            </div>
            <Badge variant="saffron" size="sm">
              Pedagogical Guidance
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topicDifficultyPatterns.map((topic) => (
              <div
                key={topic.topicId}
                className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2.5 hover:border-slate-300 transition-all shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">{topic.name}</span>
                    <Badge variant="neutral" size="sm">
                      Level {topic.difficultyLevel}
                    </Badge>
                  </div>
                  <span className="text-xs font-extrabold text-red-600">
                    {topic.errorRatePct}% Error Rate
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-red-50/70 border border-red-100 text-xs text-red-950 space-y-0.5">
                  <span className="font-bold">Error Pattern Diagnosis:</span>
                  <p className="text-[11px] text-red-800 leading-snug">{topic.errorPatternReason}</p>
                </div>

                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-bold">Recommended Adjustment:</span>
                    <p className="text-[11px] text-amber-800">{topic.recommendedAction}</p>
                  </div>
                  {onAssignRemedialPractice && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onAssignRemedialPractice(topic.topicId, topic.name)}
                      className="shrink-0 text-amber-900 border-amber-300 hover:bg-amber-100 text-[11px]"
                    >
                      Assign
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ROW 3: STUDENTS NEEDING SUPPORT & ASSIGNMENT COMPLETION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Students Needing Support (Confidential, Non-Deficit) */}
        <Card variant="elevated" className="lg:col-span-6 border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Students Needing Support
                </CardTitle>
                <CardDescription>
                  Actionable intervention alerts (Private • Never shared with other students).
                </CardDescription>
              </div>
              <Badge variant="saffron" size="sm">
                {studentsNeedingSupport.totalCount} Active Alerts
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {studentsNeedingSupport.alerts.map((alert) => (
              <div
                key={alert.studentId}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h5 className="font-bold text-slate-900">{alert.studentName}</h5>
                    <span className="text-[11px] text-slate-500 font-semibold">{alert.className}</span>
                  </div>
                  <Badge variant="saffron" size="sm">
                    {alert.mastery}% Mastery
                  </Badge>
                </div>

                <div className="text-[11px] text-slate-600 space-y-1">
                  <div>
                    <strong className="text-slate-800">Topic:</strong> {alert.topic} ({alert.recentAttempts} attempts)
                  </div>
                  <div>
                    <strong className="text-slate-800">Pattern:</strong> {alert.reason}
                  </div>
                  <div className="text-emerald-800 font-medium italic">
                    AI Note: "{alert.aiSupportNote}"
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-200/80">
                  <span className="text-[11px] font-semibold text-brand-700">
                    Action: {alert.recommendedAction}
                  </span>
                  {onViewStudentDetail && (
                    <button
                      type="button"
                      onClick={() => onViewStudentDetail(alert.studentId)}
                      className="text-xs font-bold text-brand-700 hover:text-brand-900 flex items-center gap-1 cursor-pointer"
                    >
                      <span>View Dossier</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Assignment Completion Breakdown */}
        <Card variant="elevated" className="lg:col-span-6 border-slate-200">
          <CardHeader className="pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-purple-600" />
                  Assignment Completion
                </CardTitle>
                <CardDescription>
                  Tracking submission rates and turnaround across cohorts.
                </CardDescription>
              </div>
              <Badge variant="forest" size="sm">
                {assignmentCompletion.overallCompletionRatePct}% Submitted
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4 space-y-3.5">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] text-slate-500 uppercase font-bold">Turned In</span>
                <div className="text-lg font-black text-slate-900 mt-0.5">
                  {assignmentCompletion.submittedCount}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                <span className="text-[10px] text-amber-800 uppercase font-bold">Pending</span>
                <div className="text-lg font-black text-amber-900 mt-0.5">
                  {assignmentCompletion.pendingCount}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-200">
                <span className="text-[10px] text-purple-800 uppercase font-bold">On-Time Rate</span>
                <div className="text-lg font-black text-purple-900 mt-0.5">
                  {assignmentCompletion.onTimeRatePct}%
                </div>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              {assignmentCompletion.assignmentDetails.map((asg) => (
                <div
                  key={asg.id}
                  className="p-3 rounded-xl bg-white border border-slate-200 flex items-center justify-between text-xs hover:bg-slate-50"
                >
                  <div className="space-y-0.5">
                    <h5 className="font-bold text-slate-900">{asg.title}</h5>
                    <p className="text-[11px] text-slate-500">
                      {asg.className} • Due {asg.dueDate}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-slate-900">
                      {asg.completedCount}/{asg.totalAssigned}
                    </span>
                    <p className="text-[10px] text-emerald-700 font-bold">
                      {asg.completionRatePct}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PRIVACY & ETHICS GUARANTEE BANNER */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between text-xs border border-slate-800">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
          <div>
            <h5 className="font-bold">Student Data Minimization & Privacy Protection</h5>
            <p className="text-[11px] text-slate-300">
              Personal contact details, home addresses, and family demographics are strictly omitted from educator telemetry.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
