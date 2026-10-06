import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { MOCK_TEACHER } from '../lib/mockData';
import { teacherService } from '../services/teacherService';
import { LearningSupportSection } from '../components/teacher/LearningSupportSection';
import { StudentDetailModal } from '../components/teacher/StudentDetailModal';
import { CreateAssignmentModal } from '../components/teacher/CreateAssignmentModal';
import { AssignmentsTrackerView } from '../components/teacher/AssignmentsTrackerView';
import { StudentsRosterTable } from '../components/teacher/StudentsRosterTable';
import { TeacherLessonEditorModal } from '../components/library/TeacherLessonEditorModal';
import { SyncStatusBadge } from '../components/offline/SyncStatusBadge';
import { TeacherAnalyticsView } from '../components/analytics/TeacherAnalyticsView';
import {
  LearningSupportAlert,
  StudentDetailData,
  TeacherAssignment,
  TeacherDashboardMetrics,
  ClassroomFilterState,
} from '../types/teacher';
import {
  Users,
  Sparkles,
  BarChart3,
  Mic,
  Send,
  AlertTriangle,
  CheckCircle2,
  Check,
  Smartphone,
  Wifi,
  WifiOff,
  UserCheck,
  ChevronRight,
  Radio,
  BookOpen,
  BookPlus,
  Layers,
  Eye,
  Plus,
  ShieldCheck,
  Clock,
  Award,
  ListTodo,
  TrendingUp,
} from 'lucide-react';

export const TeacherPortal: React.FC = () => {
  const { profile, role } = useAuth();
  const { showToast } = useToast();

  const teacherName = profile?.full_name || MOCK_TEACHER.name;
  const schoolName = profile?.school_id ? 'Zilla Parishad High School, Wardha' : MOCK_TEACHER.schoolName;

  // Active Tab: 'overview' | 'students' | 'assignments' | 'curriculum' | 'analytics'
  const [activeTab, setActiveTab] = useState<'overview' | 'students' | 'assignments' | 'curriculum' | 'analytics'>('overview');

  // Modals
  const [selectedStudentDetail, setSelectedStudentDetail] = useState<StudentDetailData | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isAssignmentModalOpen, setIsAssignmentModalOpen] = useState(false);
  const [assignmentPreSelect, setAssignmentPreSelect] = useState<{ studentId?: string; topic?: string }>({});
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  // Data States
  const [metrics, setMetrics] = useState<TeacherDashboardMetrics | null>(null);
  const [alerts, setAlerts] = useState<LearningSupportAlert[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [filters, setFilters] = useState<ClassroomFilterState>({
    selectedClass: 'all',
    selectedSubject: 'all',
    selectedGrade: 'all',
    selectedMastery: 'all',
    selectedSupportStatus: 'all',
    searchQuery: '',
  });

  // Curriculum Lessons (from library milestone)
  const [curriculumLessons, setCurriculumLessons] = useState<any[]>([
    {
      id: 'd0000000-0000-0000-0000-000000000001',
      title: 'Understanding Fractions: Parts of a Whole',
      board: 'RBSE (Rajasthan)',
      grade: 8,
      subject: 'Mathematics',
      chapter: 'Ch 1: Fractions in Everyday Life',
      formats: ['video', 'notes', 'audio', 'interactive', 'worksheet', 'quiz'],
      is_published: true,
      assignedClass: 'Class 8A',
      completionRate: 88,
    },
    {
      id: 'd0000000-0000-0000-0000-000000000002',
      title: 'Traditional Stepwells (Baori) & Water Conservation',
      board: 'RBSE (Rajasthan)',
      grade: 8,
      subject: 'Science',
      chapter: 'Ch 1: Water Conservation',
      formats: ['notes', 'audio', 'quiz'],
      is_published: true,
      assignedClass: 'Class 8B',
      completionRate: 76,
    },
    {
      id: 'd0000000-0000-0000-0000-000000000003',
      title: 'Village Land Boundaries & Perimeter Calculations',
      board: 'CBSE',
      grade: 8,
      subject: 'Mathematics',
      chapter: 'Ch 2: Practical Geometry',
      formats: ['notes', 'worksheet'],
      is_published: false,
      assignedClass: 'Unassigned',
      completionRate: 0,
    },
  ]);

  const teacherSchoolId = profile?.school_id || '22222222-2222-2222-2222-222222222222';

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [m, a, s, asg] = await Promise.all([
        teacherService.getDashboardMetrics(),
        teacherService.getLearningSupportAlerts(),
        teacherService.getStudentsRoster(filters, teacherSchoolId),
        teacherService.getAssignments(),
      ]);
      setMetrics(m);
      setAlerts(a);
      setStudents(s);
      setAssignments(asg);
    } catch (err) {
      console.warn('Dashboard fetch note:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [filters]);

  const handleFilterChange = (newFilters: Partial<ClassroomFilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleOpenStudentDetail = async (studentId: string) => {
    try {
      const detail = await teacherService.getStudentDetail(studentId, teacherSchoolId);
      setSelectedStudentDetail(detail);
      setIsDetailModalOpen(true);
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Access Denied',
        message: err.message || 'Cross-school access prohibited.',
      });
    }
  };

  const handleOpenAssignPractice = (param: LearningSupportAlert | { studentId?: string; topic?: string }) => {
    if ('topic' in param && 'studentId' in param) {
      setAssignmentPreSelect({
        studentId: param.studentId,
        topic: param.topic,
      });
    } else {
      const alert = param as LearningSupportAlert;
      setAssignmentPreSelect({
        studentId: alert.studentId,
        topic: alert.topic,
      });
    }
    setIsAssignmentModalOpen(true);
  };

  const handleDismissAlert = async (alertId: string) => {
    await teacherService.dismissAlert(alertId);
    setAlerts((prev) => prev.filter((a) => a.id !== alertId));
    showToast({
      type: 'info',
      title: 'Alert Dismissed',
      message: 'Support alert marked as handled in confidential educator log.',
    });
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setRecordingSeconds(0);
    const interval = setInterval(() => {
      setRecordingSeconds((s) => {
        if (s >= 30) {
          clearInterval(interval);
          setIsRecording(false);
          return 30;
        }
        return s + 1;
      });
    }, 1000);
  };

  const handleSendVoiceNote = () => {
    setIsVoiceModalOpen(false);
    setIsRecording(false);
    showToast({
      type: 'success',
      title: 'Voice Note Dispatched to Parents',
      message: '30-sec audio summary sent in Marathi via local WhatsApp / SMS mesh.',
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* TEACHER HEADER BANNER */}
      <div className="p-6 sm:p-8 rounded-3xl bg-brand-900 text-white shadow-elevated flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Badge variant="brand" size="sm">
              Lead Educator Cockpit
            </Badge>
            <span className="text-xs text-brand-200">{schoolName}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Teacher {teacherName}
          </h1>
          <p className="text-xs sm:text-sm text-brand-100 max-w-xl">
            Grade 8 Multi-Subject Classroom • 42 Total Students • {alerts.length} Active Learning Support Alerts
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <SyncStatusBadge />
          <Button
            variant="outline"
            size="md"
            onClick={() => handleOpenAssignPractice({})}
            className="text-white border-white/20 hover:bg-white/10"
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Assignment
          </Button>
          <Button
            variant="saffron"
            size="md"
            onClick={() => setIsVoiceModalOpen(true)}
            leftIcon={<Mic className="w-4 h-4" />}
          >
            Send Parent Voice Note
          </Button>
        </div>
      </div>

      {/* COCKPIT NAVIGATION TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'overview'
              ? 'bg-brand-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" /> Main Dashboard & Support ({alerts.length})
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'students'
              ? 'bg-brand-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" /> Students Roster ({students.length})
        </button>

        <button
          onClick={() => setActiveTab('assignments')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'assignments'
              ? 'bg-brand-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <ListTodo className="w-4 h-4" /> Assignments Tracker ({assignments.length})
        </button>

        <button
          onClick={() => setActiveTab('curriculum')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'curriculum'
              ? 'bg-brand-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Curriculum & Library ({curriculumLessons.length})
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'analytics'
              ? 'bg-brand-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Class Analytics
        </button>
      </div>

      {/* ========================================================== */}
      {/* TAB 1: MAIN DASHBOARD & LEARNING SUPPORT */}
      {/* ========================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-150">
          {/* MAIN DASHBOARD METRICS:
              Total students | Active learners | Average progress | Assignments | Students needing support */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card variant="default" className="p-5">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Total Students</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{metrics?.totalStudents || 42}</div>
              <span className="text-[11px] text-slate-400 font-medium">Enrolled Cohort</span>
            </Card>

            <Card variant="default" className="p-5">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Active Learners</span>
              <div className="text-2xl font-black text-emerald-600 mt-1">{metrics?.activeLearners || 38}</div>
              <span className="text-[11px] text-emerald-700 font-medium">90% Active Today</span>
            </Card>

            <Card variant="default" className="p-5">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Average Progress</span>
              <div className="text-2xl font-black text-brand-700 mt-1">{metrics?.averageProgress || 74}%</div>
              <span className="text-[11px] text-slate-500 font-medium">Curriculum Pace</span>
            </Card>

            <Card variant="default" className="p-5">
              <span className="text-[11px] font-bold text-slate-500 uppercase">Assignments</span>
              <div className="text-2xl font-black text-slate-900 mt-1">{metrics?.activeAssignments || 3}</div>
              <span className="text-[11px] text-brand-600 font-medium">Active Submissions</span>
            </Card>

            <Card variant="default" className="p-5 bg-amber-500/10 border-amber-300">
              <span className="text-[11px] font-bold text-amber-900 uppercase">Students Needing Support</span>
              <div className="text-2xl font-black text-amber-600 mt-1">{alerts.length}</div>
              <span className="text-[11px] text-amber-800 font-bold">Action Recommended</span>
            </Card>
          </div>

          {/* LEARNING SUPPORT SECTION */}
          <LearningSupportSection
            alerts={alerts}
            filters={filters}
            onFilterChange={handleFilterChange}
            onViewStudent={handleOpenStudentDetail}
            onAssignPractice={handleOpenAssignPractice}
            onDismissAlert={handleDismissAlert}
          />

          {/* CLASS PERFORMANCE & RECENT ACTIVITY */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* CLASS PERFORMANCE (NON-RANKING PRIVACY MATRIX) */}
            <div className="lg:col-span-7 space-y-6">
              <Card variant="elevated">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-base sm:text-lg">Class Performance Breakdown</CardTitle>
                    <CardDescription>
                      Confidential subject mastery aggregated across all learners.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>No Public Ranking</span>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  {metrics?.classPerformance.map((subj) => (
                    <div
                      key={subj.subject}
                      className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 shadow-soft"
                    >
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-slate-900">{subj.subject}</h4>
                          <span className="text-[11px] text-slate-400">
                            {subj.totalEvaluated} students evaluated
                          </span>
                        </div>
                        <span className="text-sm font-extrabold text-brand-700">
                          {subj.averageMastery}% Avg
                        </span>
                      </div>

                      <ProgressBar
                        value={subj.averageMastery}
                        variant={subj.averageMastery >= 75 ? 'forest' : 'saffron'}
                        size="sm"
                      />

                      {/* Cohort Mastery Distribution */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                        <span className="text-emerald-700 font-semibold">
                          ● {subj.masteredCount} Mastered (&gt;80%)
                        </span>
                        <span className="text-blue-700 font-semibold">
                          ● {subj.developingCount} Developing (50-80%)
                        </span>
                        <span className="text-amber-800 font-semibold">
                          ● {subj.needsSupportCount} Support (&lt;50%)
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* RECENT ACTIVITY STREAM */}
            <div className="lg:col-span-5 space-y-6">
              <Card variant="elevated">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Recent Activity Stream</CardTitle>
                    <Clock className="w-4 h-4 text-brand-600" />
                  </div>
                  <CardDescription>
                    Live telemetry feed from student learning and offline syncs.
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3 pt-0">
                  {metrics?.recentActivity.map((act) => (
                    <div
                      key={act.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between gap-3"
                    >
                      <div className="space-y-0.5 overflow-hidden">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900 truncate">
                            {act.studentName}
                          </span>
                          <Badge variant="neutral" size="sm">
                            {act.type}
                          </Badge>
                        </div>
                        <span className="text-slate-600 block truncate">
                          {act.action}: <strong>{act.topic}</strong>
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        {act.score !== undefined && (
                          <span className="text-xs font-bold text-emerald-600 block">
                            {act.score}%
                          </span>
                        )}
                        <span className="text-[10px] text-slate-400 block">{act.timestamp}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 2: STUDENTS ROSTER */}
      {/* ========================================================== */}
      {activeTab === 'students' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <StudentsRosterTable
            students={students}
            onViewStudent={handleOpenStudentDetail}
            onAssignPractice={(studentId, topic) => handleOpenAssignPractice({ studentId, topic })}
          />
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 3: ASSIGNMENTS TRACKER */}
      {/* ========================================================== */}
      {activeTab === 'assignments' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <AssignmentsTrackerView
            assignments={assignments}
            onCreateAssignment={() => handleOpenAssignPractice({})}
            onViewStudent={handleOpenStudentDetail}
          />
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 4: CURRICULUM & LIBRARY MANAGEMENT */}
      {/* ========================================================== */}
      {activeTab === 'curriculum' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 bg-white rounded-3xl border border-slate-200">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Curriculum Lessons & Learning Library
              </h2>
              <p className="text-xs text-slate-500">
                Author, edit, and publish multi-modal lesson capsules to your rural classroom.
              </p>
            </div>

            <Button
              variant="saffron"
              size="md"
              onClick={() => setIsAuthorModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Author New Lesson
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {curriculumLessons.map((les) => (
              <Card key={les.id} variant="elevated" className="border-slate-200 flex flex-col justify-between">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <Badge variant="brand" size="sm">{les.board}</Badge>
                    <Badge variant={les.is_published ? 'neutral' : 'saffron'} size="sm">
                      {les.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <CardTitle className="text-sm font-bold text-slate-900">{les.title}</CardTitle>
                  <CardDescription className="text-xs">{les.chapter}</CardDescription>
                </CardHeader>

                <CardContent className="pt-0 space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {les.formats.map((fmt: string) => (
                      <span key={fmt} className="px-2 py-0.5 rounded-lg bg-slate-100 text-[10px] text-slate-600 font-semibold uppercase">
                        {fmt}
                      </span>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Assigned: {les.assignedClass}</span>
                    <span className="font-bold text-emerald-600">{les.completionRate}% Done</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* TAB 5: CLASS ANALYTICS & SUPPORT PATTERNS */}
      {/* ========================================================== */}
      {activeTab === 'analytics' && (
        <div className="animate-in fade-in duration-150">
          <TeacherAnalyticsView
            teacherId={profile?.id || 'tch-01'}
            classId={filters.selectedClass !== 'all' ? filters.selectedClass : undefined}
            onViewStudentDetail={handleOpenStudentDetail}
            onAssignRemedialPractice={(topicId, topicName) => {
              handleOpenAssignPractice({ topic: topicName });
            }}
          />
        </div>
      )}

      {/* ========================================================== */}
      {/* MODALS */}
      {/* ========================================================== */}

      {/* 1. Student Detail Modal */}
      <StudentDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        data={selectedStudentDetail}
        onAssignPractice={(studentId, topic) => {
          setIsDetailModalOpen(false);
          handleOpenAssignPractice({ studentId, topic });
        }}
      />

      {/* 2. Create Assignment Modal */}
      <CreateAssignmentModal
        isOpen={isAssignmentModalOpen}
        onClose={() => setIsAssignmentModalOpen(false)}
        preSelectedStudentId={assignmentPreSelect.studentId}
        preSelectedTopic={assignmentPreSelect.topic}
        onAssignmentCreated={() => loadDashboardData()}
      />

      {/* 3. Teacher Lesson Editor Modal */}
      <TeacherLessonEditorModal
        isOpen={isAuthorModalOpen}
        onClose={() => setIsAuthorModalOpen(false)}
        onLessonCreated={() => loadDashboardData()}
      />

      {/* 4. Parent Voice Note Dispatch Modal */}
      {isVoiceModalOpen && (
        <Modal
          isOpen={isVoiceModalOpen}
          onClose={() => setIsVoiceModalOpen(false)}
          title="Record Parent Audio Update"
          description="Send a 30-sec vernacular voice memo to parent WhatsApp / SMS groups in Marathi & Hindi."
          maxWidth="lg"
        >
          <div className="space-y-6 text-center py-4">
            <div className="w-20 h-20 rounded-full bg-saffron-500/10 border-2 border-saffron-500 text-saffron-600 flex items-center justify-center mx-auto shadow-inner">
              <Mic className={`w-8 h-8 ${isRecording ? 'animate-pulse text-red-600' : ''}`} />
            </div>

            <div>
              <div className="text-2xl font-black text-slate-900 font-mono">
                00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds} / 00:30
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {isRecording ? 'Recording voice note in Marathi...' : 'Press Start to record summary.'}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3">
              {!isRecording ? (
                <Button variant="saffron" size="md" onClick={handleStartRecording}>
                  Start Recording
                </Button>
              ) : (
                <Button variant="danger" size="md" onClick={() => setIsRecording(false)}>
                  Stop Recording
                </Button>
              )}

              <Button
                variant="primary"
                size="md"
                disabled={recordingSeconds === 0}
                onClick={handleSendVoiceNote}
                leftIcon={<Send className="w-4 h-4" />}
              >
                Dispatch to Parents
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
