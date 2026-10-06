import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { ProgressBar } from '../ui/ProgressBar';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { StudentDetailData } from '../../types/teacher';
import {
  Sparkles,
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
  Zap,
  Smartphone,
  Wifi,
  WifiOff,
  AlertCircle,
  TrendingDown,
  Repeat,
  Compass,
  BarChart3,
  Calendar,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface StudentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: StudentDetailData | null;
  onAssignPractice: (studentId: string, topicName: string) => void;
}

export const StudentDetailModal: React.FC<StudentDetailModalProps> = ({
  isOpen,
  onClose,
  data,
  onAssignPractice,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'mastery' | 'attempts' | 'lessons' | 'analytics'>('mastery');

  if (!isOpen || !data) return null;

  const { student, learningPath, topicMastery, recentAttempts, completedLessons, quizPerformance, learningTime, recommendedSupport } = data;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'mastered':
        return <Badge variant="brand" size="sm">Mastered</Badge>;
      case 'developing':
      case 'in_progress':
        return <Badge variant="neutral" size="sm">In Progress</Badge>;
      case 'needs_practice':
        return <Badge variant="saffron" size="sm" dot>Needs Practice</Badge>;
      case 'completed':
        return <Badge variant="brand" size="sm">Completed</Badge>;
      default:
        return <Badge variant="neutral" size="sm">Upcoming</Badge>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${student.name} • Learning Profile`}
      description={`${student.className} • ${student.schoolName}`}
      maxWidth="4xl"
    >
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
        {/* STUDENT TELEMETRY BANNER */}
        <div className="p-5 rounded-3xl bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-elevated">
          <div className="flex items-center gap-4">
            <img
              src={student.avatarUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80'}
              alt={student.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-700 shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{student.name}</h3>
                <Badge variant="saffron" size="sm">
                  Grade {student.grade}
                </Badge>
              </div>
              <p className="text-xs text-slate-300">
                {student.email} • Preferred Language: <span className="uppercase font-semibold">{student.preferredLanguage}</span>
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-saffron-400" /> {student.deviceAccess}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Wifi className="w-3 h-3 text-emerald-400" /> {student.connectivityLevel}
                </span>
                <span>•</span>
                <span>Last active: {student.lastActive}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-2 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
            <div className="text-left md:text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400">Overall Progress</span>
              <div className="text-2xl font-black text-emerald-400">{student.overallProgressPct}%</div>
            </div>
            <Button
              size="sm"
              variant="saffron"
              onClick={() => onAssignPractice(student.id, topicMastery[0]?.topicName || 'Fractions')}
              leftIcon={<BookOpen className="w-3.5 h-3.5" />}
            >
              Assign Practice
            </Button>
          </div>
        </div>

        {/* RECOMMENDED SUPPORT (AI Pattern Detection) */}
        {recommendedSupport.hasAlert ? (
          <div className="p-4 rounded-3xl bg-amber-500/10 border-2 border-amber-300/80 text-slate-900 space-y-2.5 shadow-soft">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-extrabold text-amber-950 text-sm">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>AI Recommended Support Note</span>
              </div>
              <Badge variant="saffron" size="sm">
                Confidential Teacher Insight
              </Badge>
            </div>

            <div className="p-3 rounded-2xl bg-white/90 border border-amber-200 space-y-1.5 text-xs">
              <p className="font-extrabold text-amber-900 text-sm">
                May need additional support.
              </p>
              <p className="text-slate-700 leading-relaxed font-medium">
                <strong>Observation:</strong> {recommendedSupport.detailedObservation}
              </p>
              <div className="pt-2 border-t border-amber-100 flex items-center justify-between text-[11px]">
                <span className="text-slate-600 font-medium">
                  <strong>Recommended Intervention:</strong> {recommendedSupport.suggestedAction}
                </span>
                <button
                  onClick={() => onAssignPractice(student.id, recommendedSupport.reason.includes('Fraction') ? 'Fractions' : 'Linear Equations')}
                  className="font-bold text-brand-700 hover:text-brand-900 underline ml-2"
                >
                  Create Targeted Assignment &rarr;
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-950 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span><strong>No Active Bottlenecks:</strong> Student is learning at a steady pace and meeting curriculum benchmarks.</span>
          </div>
        )}

        {/* SUB-TABS NAVIGATION */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
          <button
            onClick={() => setActiveSubTab('mastery')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'mastery'
                ? 'bg-brand-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Learning Path & Topic Mastery</span>
          </button>
          <button
            onClick={() => setActiveSubTab('attempts')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'attempts'
                ? 'bg-brand-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Recent Attempts ({recentAttempts.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('lessons')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'lessons'
                ? 'bg-brand-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Completed Lessons ({completedLessons.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('analytics')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              activeSubTab === 'analytics'
                ? 'bg-brand-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Quiz Performance & Time</span>
          </button>
        </div>

        {/* SUB-TAB 1: LEARNING PATH & TOPIC MASTERY */}
        {activeSubTab === 'mastery' && (
          <div className="space-y-6">
            {/* Visual Learning Path Journey */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Personal Learning Journey Map
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                {learningPath.map((node) => (
                  <div
                    key={node.id}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      node.status === 'completed'
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                        : node.status === 'needs_practice'
                        ? 'bg-amber-50 border-2 border-amber-300 text-amber-950 font-bold'
                        : node.status === 'in_progress'
                        ? 'bg-blue-50/70 border-blue-200 text-blue-950'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="text-[10px] font-bold uppercase mb-1 opacity-70">
                      Step {node.sequence}
                    </div>
                    <div className="text-xs font-bold leading-tight mb-2 truncate">
                      {node.topicName}
                    </div>
                    <div className="flex justify-center">
                      {getStatusBadge(node.status)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Topic Mastery Progress Cards */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Topic Mastery Breakdown
              </h4>
              <div className="space-y-2.5">
                {topicMastery.map((item) => (
                  <div
                    key={item.topicId}
                    className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-soft"
                  >
                    <div className="space-y-1 sm:w-1/3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{item.topicName}</span>
                        {getStatusBadge(item.status)}
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {item.attempts} attempts ({item.correctAttempts} successful) • {item.lastAttempted}
                      </span>
                    </div>

                    <div className="flex-1 max-w-xs space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                        <span>Mastery Score</span>
                        <span>{item.masteryScore}%</span>
                      </div>
                      <ProgressBar
                        value={item.masteryScore}
                        variant={item.masteryScore >= 80 ? 'forest' : item.masteryScore >= 50 ? 'brand' : 'saffron'}
                        size="sm"
                      />
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onAssignPractice(student.id, item.topicName)}
                    >
                      Assign Review
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SUB-TAB 2: RECENT ATTEMPTS */}
        {activeSubTab === 'attempts' && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Quiz & Assessment Telemetry Log
            </h4>
            <div className="space-y-2.5">
              {recentAttempts.map((att) => (
                <div
                  key={att.id}
                  className="p-4 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-soft"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-900">{att.topicName}</span>
                    <p className="text-[11px] text-slate-500">
                      {att.date} • Duration: {att.timeSpentSeconds} seconds
                    </p>
                    {att.notes && (
                      <p className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded-lg border border-amber-200 font-medium">
                        💡 Insight: {att.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-900">{att.score} / {att.totalQuestions}</span>
                      <span className={`block text-[11px] font-bold ${att.percentage >= 70 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {att.percentage}% Accuracy
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB-TAB 3: COMPLETED LESSONS */}
        {activeSubTab === 'lessons' && (
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Curriculum Lessons Completed
            </h4>
            <div className="space-y-2.5">
              {completedLessons.map((les) => (
                <div
                  key={les.lessonId}
                  className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-soft"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <Badge variant="brand" size="sm">{les.subject}</Badge>
                      <span className="text-xs font-bold text-slate-900">{les.title}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      Completed {les.completedAt} • {les.timeSpentMinutes} mins engaged
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Score: {les.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SUB-TAB 4: ANALYTICS & TIME */}
        {activeSubTab === 'analytics' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card variant="default" className="p-3.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Quizzes Completed</span>
                <div className="text-xl font-black text-slate-900 mt-1">{quizPerformance.totalQuizzesTaken}</div>
                <span className="text-[10px] text-emerald-600 font-medium">{quizPerformance.correctAnswers} / {quizPerformance.totalQuestionsAttempted} correct</span>
              </Card>

              <Card variant="default" className="p-3.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Average Accuracy</span>
                <div className="text-xl font-black text-brand-700 mt-1">{quizPerformance.averageAccuracy}%</div>
                <span className="text-[10px] text-slate-500 font-medium">Across all formats</span>
              </Card>

              <Card variant="default" className="p-3.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Monthly Study Time</span>
                <div className="text-xl font-black text-slate-900 mt-1">{learningTime.totalMinutesThisMonth} mins</div>
                <span className="text-[10px] text-slate-500 font-medium">~{Math.round(learningTime.totalMinutesThisMonth / 60)} hrs total</span>
              </Card>

              <Card variant="default" className="p-3.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Current Streak</span>
                <div className="text-xl font-black text-saffron-600 mt-1">{learningTime.streakDays} Days 🔥</div>
                <span className="text-[10px] text-slate-500 font-medium">Weekly avg: {learningTime.weeklyAverageMinutes}m/wk</span>
              </Card>
            </div>

            {/* Daily Study Time Bars */}
            <Card variant="elevated" className="p-5">
              <CardHeader className="pb-3 px-0 pt-0">
                <CardTitle className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                  Last 7 Days Study Engagement (Minutes)
                </CardTitle>
              </CardHeader>
              <CardContent className="px-0 pb-0">
                <div className="flex items-end gap-3 h-28 pt-2">
                  {learningTime.dailyActivity.map((d) => (
                    <div key={d.day} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <div
                        className="w-full max-w-[32px] rounded-t-lg bg-brand-600 hover:bg-brand-700 transition-all text-[9px] text-white flex items-center justify-center font-bold"
                        style={{ height: `${Math.max(15, (d.minutes / 30) * 100)}%` }}
                        title={`${d.minutes} minutes`}
                      >
                        {d.minutes}m
                      </div>
                      <span className="text-[10px] text-slate-500 font-bold">{d.day}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Modal>
  );
};
