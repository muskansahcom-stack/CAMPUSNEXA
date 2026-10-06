import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  LearningSupportAlert,
  StudentDetailData,
  TeacherAssignment,
  TeacherDashboardMetrics,
  ClassroomFilterState,
  SupportPatternType,
} from '../types/teacher';

// ==========================================================
// SEED DATA: REALISTIC CLASSROOM COHORT (RURAL MULTI-CLASS)
// ==========================================================

const INITIAL_SUPPORT_ALERTS: LearningSupportAlert[] = [
  {
    id: 'alert-ravi-01',
    studentId: 'std-ravi-01',
    studentName: 'Ravi Kumar',
    studentAvatar: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
    grade: 8,
    className: 'Class 8A',
    subject: 'Mathematics',
    topic: 'Fractions',
    topicId: 'top-frac-01',
    mastery: 43,
    recentAttempts: 3,
    status: 'needs_support',
    statusLabel: 'Needs support',
    patternType: 'repeated_mistakes',
    reason: 'Repeated difficulty with equivalent fractions.',
    aiSupportNote: 'May need additional support with foundational fraction decomposition before advancing.',
    recommendedAction: 'Assign Fractions Revision Lesson',
    recommendedActionType: 'revision_lesson',
    createdAt: 'Today, 08:30 AM',
    isDismissed: false,
  },
  {
    id: 'alert-sunita-02',
    studentId: 'std-sunita-02',
    studentName: 'Sunita Soren',
    studentAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    grade: 8,
    className: 'Class 8A',
    subject: 'Mathematics',
    topic: 'Linear Equations with Balances',
    topicId: 'top-alg-02',
    mastery: 38,
    recentAttempts: 4,
    status: 'needs_support',
    statusLabel: 'Needs support',
    patternType: 'declining_mastery',
    reason: 'Declining mastery over last 2 attempts (55% -> 42% -> 38%).',
    aiSupportNote: 'May need additional support balancing single-variable expressions with tactile examples.',
    recommendedAction: 'Assign Micro-Worksheet on Scale Balancing',
    recommendedActionType: 'micro_worksheet',
    createdAt: 'Yesterday, 04:15 PM',
    isDismissed: false,
  },
  {
    id: 'alert-bikram-03',
    studentId: 'std-bikram-03',
    studentName: 'Bikram Rabha',
    studentAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    grade: 8,
    className: 'Class 8B',
    subject: 'Science',
    topic: 'Groundwater Table & Traditional Harvesting',
    topicId: 'top-sci-01',
    mastery: 46,
    recentAttempts: 3,
    status: 'needs_support',
    statusLabel: 'Needs support',
    patternType: 'repeated_attempts_no_improvement',
    reason: 'Repeated attempts without improvement on geological vocabulary.',
    aiSupportNote: 'May need additional support understanding aquifer permeability; recommend vernacular audio explanation.',
    recommendedAction: 'Dispatch Assamese/Bilingual Audio Capsule',
    recommendedActionType: 'voice_checkin',
    createdAt: '2 days ago',
    isDismissed: false,
  },
  {
    id: 'alert-deepak-04',
    studentId: 'std-deepak-04',
    studentName: 'Deepak Patel',
    studentAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    grade: 7,
    className: 'Class 7A',
    subject: 'Mathematics',
    topic: 'Decimals in Village Measurement',
    topicId: 'top-dec-01',
    mastery: 49,
    recentAttempts: 2,
    status: 'needs_support',
    statusLabel: 'Needs support',
    patternType: 'low_engagement',
    reason: 'Low engagement detected (device offline for 3 days; battery depleted).',
    aiSupportNote: 'May need additional support accessing shared community tablet or offline printed pack.',
    recommendedAction: 'Print 1-Page Kiosk Take-Home Practice',
    recommendedActionType: 'micro_worksheet',
    createdAt: '3 days ago',
    isDismissed: false,
  },
];

const INITIAL_ASSIGNMENTS: TeacherAssignment[] = [
  {
    id: 'asg-01',
    title: 'Fractions & Roti Sharing: Parts of a Whole',
    topicId: 'top-frac-01',
    topicName: 'Fractions: Parts of a Whole',
    subject: 'Mathematics',
    grade: 8,
    className: 'Class 8A',
    assignedStudentIds: [],
    assignedStudentCount: 22,
    completedCount: 18,
    pendingCount: 4,
    completionRate: 82,
    assignedDate: '2026-09-24',
    dueDate: '2026-09-29',
    instructions: 'Review everyday fraction division using the roti analogy and complete the 5-question micro-quiz.',
    status: 'active',
    studentStatuses: [
      { studentId: 'std-kavita-01', studentName: 'Kavita Deshmukh', status: 'completed', submittedAt: '2026-09-25 10:14', score: 100 },
      { studentId: 'std-aarav-01', studentName: 'Aarav Sharma', status: 'completed', submittedAt: '2026-09-26 14:30', score: 80 },
      { studentId: 'std-rohit-01', studentName: 'Rohit Verma', status: 'completed', submittedAt: '2026-09-27 09:12', score: 85 },
      { studentId: 'std-ravi-01', studentName: 'Ravi Kumar', status: 'in_progress', score: 43 },
      { studentId: 'std-sunita-02', studentName: 'Sunita Soren', status: 'not_started' },
    ],
  },
  {
    id: 'asg-02',
    title: 'Traditional Stepwells (Baori) Water Conservation',
    topicId: 'top-sci-01',
    topicName: 'Groundwater & Rainwater Harvesting',
    subject: 'Science',
    grade: 8,
    className: 'Class 8B',
    assignedStudentIds: [],
    assignedStudentCount: 20,
    completedCount: 15,
    pendingCount: 5,
    completionRate: 75,
    assignedDate: '2026-09-23',
    dueDate: '2026-09-30',
    instructions: 'Listen to the 4-minute audio story on desert stepwells and submit the vocabulary reflection.',
    status: 'active',
    studentStatuses: [
      { studentId: 'std-priya-01', studentName: 'Priya Rathod', status: 'completed', submittedAt: '2026-09-24 16:45', score: 95 },
      { studentId: 'std-bikram-03', studentName: 'Bikram Rabha', status: 'in_progress', score: 46 },
    ],
  },
  {
    id: 'asg-03',
    title: 'Fractions Remedial: Equivalent Fractions Foundation',
    topicId: 'top-frac-01',
    topicName: 'Equivalent Fractions',
    subject: 'Mathematics',
    grade: 8,
    className: 'Class 8A',
    assignedStudentIds: ['std-ravi-01', 'std-sunita-02'],
    assignedStudentCount: 2,
    completedCount: 0,
    pendingCount: 2,
    completionRate: 0,
    assignedDate: '2026-09-28',
    dueDate: '2026-10-02',
    instructions: 'Targeted support exercise for equivalent fraction simplification.',
    status: 'active',
    studentStatuses: [
      { studentId: 'std-ravi-01', studentName: 'Ravi Kumar', status: 'not_started' },
      { studentId: 'std-sunita-02', studentName: 'Sunita Soren', status: 'not_started' },
    ],
  },
];

const STUDENTS_ROSTER = [
  {
    id: 'std-ravi-01',
    name: 'Ravi Kumar',
    email: 'ravi.kumar@shiksha.local',
    avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
    grade: 8,
    className: 'Class 8A',
    subject: 'Mathematics',
    preferredLanguage: 'hi',
    deviceAccess: 'Shared Phone (Mother)',
    connectivityLevel: 'Intermittent 2G',
    batteryLevel: 68,
    schoolId: '22222222-2222-2222-2222-222222222222',
    schoolName: 'Zilla Parishad High School, Wardha',
    lastActive: '15 mins ago',
    overallProgressPct: 54,
    fractionsMastery: 43,
    algebraMastery: 52,
    scienceMastery: 68,
    supportStatus: 'needs_support' as const,
    supportReason: 'Repeated difficulty with equivalent fractions.',
  },
  {
    id: 'std-sunita-02',
    name: 'Sunita Soren',
    email: 'sunita.soren@shiksha.local',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    grade: 8,
    className: 'Class 8A',
    subject: 'Mathematics',
    preferredLanguage: 'hi',
    deviceAccess: 'Community Kiosk Tablet',
    connectivityLevel: 'Offline 2 Days',
    batteryLevel: 14,
    schoolId: '22222222-2222-2222-2222-222222222222',
    schoolName: 'Zilla Parishad High School, Wardha',
    lastActive: '2 days ago',
    overallProgressPct: 41,
    fractionsMastery: 58,
    algebraMastery: 38,
    scienceMastery: 60,
    supportStatus: 'needs_support' as const,
    supportReason: 'Declining mastery on scale balancing.',
  },
  {
    id: 'std-kalahandi-01',
    name: 'Pabitra Majhi',
    email: 'pabitra.majhi@shiksha.local',
    avatarUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80',
    grade: 8,
    className: 'Class 8A',
    subject: 'Mathematics',
    preferredLanguage: 'or',
    deviceAccess: 'Community Tablet',
    connectivityLevel: 'Intermittent 2G',
    batteryLevel: 55,
    schoolId: '33333333-3333-3333-3333-333333333333',
    schoolName: 'Kalahandi Model Residential School (Odisha)',
    lastActive: '1 hour ago',
    overallProgressPct: 62,
    fractionsMastery: 58,
    algebraMastery: 50,
    scienceMastery: 72,
    supportStatus: 'on_track' as const,
    supportReason: 'Good progress.',
  },
  {
    id: 'std-bikram-03',
    name: 'Bikram Rabha',
    email: 'bikram.rabha@shiksha.local',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    grade: 8,
    className: 'Class 8B',
    subject: 'Science',
    preferredLanguage: 'en',
    deviceAccess: 'Shared Phone',
    connectivityLevel: '3G',
    batteryLevel: 42,
    schoolId: '22222222-2222-2222-2222-222222222222',
    schoolName: 'Zilla Parishad High School, Wardha',
    lastActive: '4 hours ago',
    overallProgressPct: 58,
    fractionsMastery: 65,
    algebraMastery: 60,
    scienceMastery: 46,
    supportStatus: 'needs_support' as const,
    supportReason: 'Repeated attempts without improvement on groundwater vocabulary.',
  },
  {
    id: 'std-aarav-01',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@shiksha.local',
    avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    grade: 8,
    className: 'Class 8A',
    subject: 'Mathematics',
    preferredLanguage: 'hi',
    deviceAccess: 'Dedicated Phone',
    connectivityLevel: '4G',
    batteryLevel: 85,
    schoolId: '22222222-2222-2222-2222-222222222222',
    schoolName: 'Zilla Parishad High School, Wardha',
    lastActive: 'Just now',
    overallProgressPct: 78,
    fractionsMastery: 72,
    algebraMastery: 64,
    scienceMastery: 84,
    supportStatus: 'on_track' as const,
    supportReason: 'Consistent progress across topics.',
  },
  {
    id: 'std-kavita-01',
    name: 'Kavita Deshmukh',
    email: 'kavita.deshmukh@shiksha.local',
    avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    grade: 8,
    className: 'Class 8A',
    subject: 'Mathematics',
    preferredLanguage: 'mr',
    deviceAccess: 'Tablet',
    connectivityLevel: '4G',
    batteryLevel: 94,
    schoolId: '22222222-2222-2222-2222-222222222222',
    schoolName: 'Zilla Parishad High School, Wardha',
    lastActive: '30 mins ago',
    overallProgressPct: 92,
    fractionsMastery: 92,
    algebraMastery: 88,
    scienceMastery: 95,
    supportStatus: 'excellent' as const,
    supportReason: 'Mastered foundational and challenge concepts.',
  },
  {
    id: 'std-priya-01',
    name: 'Priya Rathod',
    email: 'priya.rathod@shiksha.local',
    avatarUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    grade: 8,
    className: 'Class 8B',
    subject: 'Mathematics',
    preferredLanguage: 'mr',
    deviceAccess: 'Dedicated Phone',
    connectivityLevel: '4G',
    batteryLevel: 76,
    schoolId: '22222222-2222-2222-2222-222222222222',
    schoolName: 'Zilla Parishad High School, Wardha',
    lastActive: '1 hour ago',
    overallProgressPct: 89,
    fractionsMastery: 95,
    algebraMastery: 90,
    scienceMastery: 92,
    supportStatus: 'excellent' as const,
    supportReason: 'Consistent high accuracy on assessments.',
  },
  {
    id: 'std-rohit-01',
    name: 'Rohit Verma',
    email: 'rohit.verma@shiksha.local',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    grade: 8,
    className: 'Class 8B',
    subject: 'Mathematics',
    preferredLanguage: 'hi',
    deviceAccess: 'Shared Phone',
    connectivityLevel: '3G',
    batteryLevel: 72,
    schoolId: '22222222-2222-2222-2222-222222222222',
    schoolName: 'Zilla Parishad High School, Wardha',
    lastActive: '2 hours ago',
    overallProgressPct: 75,
    fractionsMastery: 78,
    algebraMastery: 72,
    scienceMastery: 80,
    supportStatus: 'on_track' as const,
    supportReason: 'Steady lesson completion pace.',
  },
  {
    id: 'std-deepak-04',
    name: 'Deepak Patel',
    email: 'deepak.patel@shiksha.local',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    grade: 7,
    className: 'Class 7A',
    subject: 'Mathematics',
    preferredLanguage: 'hi',
    deviceAccess: 'Shared Phone (Evening Only)',
    connectivityLevel: 'Intermittent 2G',
    batteryLevel: 18,
    schoolId: '22222222-2222-2222-2222-222222222222',
    schoolName: 'Zilla Parishad High School, Wardha',
    lastActive: '3 days ago',
    overallProgressPct: 48,
    fractionsMastery: 52,
    algebraMastery: 44,
    scienceMastery: 55,
    supportStatus: 'needs_support' as const,
    supportReason: 'Device offline for 3 days; low engagement alert.',
  },
];

// In-memory runtime stores for teacher actions
let supportAlertsStore = [...INITIAL_SUPPORT_ALERTS];
let assignmentsStore = [...INITIAL_ASSIGNMENTS];

// ==========================================================
// TEACHER SERVICE CORE
// ==========================================================

export class TeacherService {
  /**
   * Fetch Main Dashboard Metrics
   */
  public async getDashboardMetrics(teacherProfileId?: string): Promise<TeacherDashboardMetrics> {
    const totalStudents = 42;
    const activeLearners = 38;
    const averageProgress = 74;
    const activeAssignments = assignmentsStore.filter((a) => a.status === 'active').length;
    const studentsNeedingSupport = supportAlertsStore.filter((a) => !a.isDismissed && a.status === 'needs_support').length;

    const classPerformance = [
      {
        subject: 'Mathematics',
        averageMastery: 71,
        masteredCount: 16,
        developingCount: 18,
        needsSupportCount: 8,
        totalEvaluated: 42,
      },
      {
        subject: 'Science',
        averageMastery: 76,
        masteredCount: 20,
        developingCount: 16,
        needsSupportCount: 6,
        totalEvaluated: 42,
      },
      {
        subject: 'Language (Hindi & Marathi)',
        averageMastery: 82,
        masteredCount: 26,
        developingCount: 12,
        needsSupportCount: 4,
        totalEvaluated: 42,
      },
      {
        subject: 'Social Studies',
        averageMastery: 69,
        masteredCount: 14,
        developingCount: 20,
        needsSupportCount: 8,
        totalEvaluated: 42,
      },
    ];

    const recentActivity = [
      {
        id: 'act-1',
        studentName: 'Ravi Kumar',
        studentId: 'std-ravi-01',
        action: 'Completed Quiz Practice',
        topic: 'Fractions: Parts of a Whole',
        timestamp: '15 mins ago',
        score: 60,
        type: 'quiz' as const,
      },
      {
        id: 'act-2',
        studentName: 'Kavita Deshmukh',
        studentId: 'std-kavita-01',
        action: 'Submitted Assignment',
        topic: 'Fractions & Roti Sharing',
        timestamp: '35 mins ago',
        score: 100,
        type: 'assignment' as const,
      },
      {
        id: 'act-3',
        studentName: 'Aarav Sharma',
        studentId: 'std-aarav-01',
        action: 'Completed Offline Lesson',
        topic: 'Unit Fractions in Market Measurements',
        timestamp: '1 hour ago',
        score: 85,
        type: 'lesson' as const,
      },
      {
        id: 'act-4',
        studentName: 'Sunita Soren',
        studentId: 'std-sunita-02',
        action: 'Offline Sync Batch Uploaded',
        topic: '2 Quizzes & Progress Synced',
        timestamp: '2 hours ago',
        type: 'sync' as const,
      },
    ];

    return {
      totalStudents,
      activeLearners,
      averageProgress,
      activeAssignments,
      studentsNeedingSupport,
      classPerformance,
      recentActivity,
    };
  }

  /**
   * Fetch Learning Support Alerts
   */
  public async getLearningSupportAlerts(): Promise<LearningSupportAlert[]> {
    return supportAlertsStore.filter((a) => !a.isDismissed);
  }

  /**
   * Dismiss an alert
   */
  public async dismissAlert(alertId: string): Promise<boolean> {
    const idx = supportAlertsStore.findIndex((a) => a.id === alertId);
    if (idx !== -1) {
      supportAlertsStore[idx].isDismissed = true;
      supportAlertsStore[idx].status = 'dismissed';
      return true;
    }
    return false;
  }

  /**
   * AI Pattern Detection: Generates support note with strictly required phrasing
   * "May need additional support." without medical/psychological diagnosis
   */
  public detectSupportPattern(params: {
    mistakesCount: number;
    masteryTrend: number[];
    daysOffline: number;
    attempts: number;
    averageScore: number;
  }): {
    needsSupport: boolean;
    patternType?: SupportPatternType;
    phrase: string;
    reason: string;
    recommendedAction: string;
  } {
    const phrase = 'May need additional support.';

    // Pattern 1: Repeated mistakes
    if (params.mistakesCount >= 3) {
      return {
        needsSupport: true,
        patternType: 'repeated_mistakes',
        phrase,
        reason: 'Repeated difficulty with equivalent fractions.',
        recommendedAction: 'Assign Fractions Revision Lesson',
      };
    }

    // Pattern 2: Declining mastery
    if (
      params.masteryTrend.length >= 2 &&
      params.masteryTrend[params.masteryTrend.length - 1] < params.masteryTrend[params.masteryTrend.length - 2] &&
      params.masteryTrend[params.masteryTrend.length - 1] < 50
    ) {
      return {
        needsSupport: true,
        patternType: 'declining_mastery',
        phrase,
        reason: 'Declining mastery across consecutive assessment attempts.',
        recommendedAction: 'Assign Micro-Worksheet on Foundational Balance',
      };
    }

    // Pattern 3: Low engagement
    if (params.daysOffline >= 3) {
      return {
        needsSupport: true,
        patternType: 'low_engagement',
        phrase,
        reason: 'Low engagement detected (device offline or unpowered for 3+ days).',
        recommendedAction: 'Print 1-Page Kiosk Take-Home Practice Pack',
      };
    }

    // Pattern 4: Repeated attempts without improvement
    if (params.attempts >= 3 && params.averageScore < 50) {
      return {
        needsSupport: true,
        patternType: 'repeated_attempts_no_improvement',
        phrase,
        reason: 'Repeated attempts without improvement on prerequisite topic.',
        recommendedAction: 'Provide Vernacular Audio Explainer & Peer Buddy Pairing',
      };
    }

    return {
      needsSupport: false,
      phrase: 'Progress is on track.',
      reason: 'Consistently demonstrating understanding across recent evaluations.',
      recommendedAction: 'Continue with next sequential lesson.',
    };
  }

  /**
   * Get Student Roster with Filters and Multi-Tenant School Isolation
   */
  public async getStudentsRoster(
    filters?: Partial<ClassroomFilterState>,
    schoolId?: string
  ): Promise<typeof STUDENTS_ROSTER> {
    let result = [...STUDENTS_ROSTER];

    // Multi-tenant school isolation: filter by teacher's school if provided
    if (schoolId) {
      result = result.filter((s) => s.schoolId === schoolId);
    }

    if (!filters) return result;

    if (filters.selectedClass && filters.selectedClass !== 'all') {
      result = result.filter((s) => s.className.toLowerCase().includes(filters.selectedClass!.toLowerCase()));
    }

    if (filters.selectedSubject && filters.selectedSubject !== 'all') {
      result = result.filter((s) => s.subject.toLowerCase() === filters.selectedSubject!.toLowerCase());
    }

    if (filters.selectedGrade && filters.selectedGrade !== 'all') {
      result = result.filter((s) => String(s.grade) === String(filters.selectedGrade));
    }

    if (filters.selectedSupportStatus && filters.selectedSupportStatus !== 'all') {
      result = result.filter((s) => s.supportStatus === filters.selectedSupportStatus);
    }

    if (filters.selectedMastery && filters.selectedMastery !== 'all') {
      if (filters.selectedMastery === 'mastered') {
        result = result.filter((s) => s.fractionsMastery >= 80);
      } else if (filters.selectedMastery === 'developing') {
        result = result.filter((s) => s.fractionsMastery >= 50 && s.fractionsMastery < 80);
      } else if (filters.selectedMastery === 'needs_practice') {
        result = result.filter((s) => s.fractionsMastery < 50);
      }
    }

    if (filters.searchQuery && filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter((s) => s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q));
    }

    return result;
  }

  /**
   * Get Comprehensive Student Detail with School Isolation Enforcement
   */
  public async getStudentDetail(studentId: string, schoolId?: string): Promise<StudentDetailData> {
    const rosterStudent = STUDENTS_ROSTER.find((s) => s.id === studentId);
    if (!rosterStudent) {
      throw new Error(`Student with ID ${studentId} not found`);
    }

    // Strict Cross-School Isolation: Teacher cannot inspect students from another school
    if (schoolId && rosterStudent.schoolId && rosterStudent.schoolId !== schoolId) {
      throw new Error(
        `Unauthorized cross-school access: Teacher from school ${schoolId} cannot access student records from school ${rosterStudent.schoolId}`
      );
    }

    const isRavi = rosterStudent.name.includes('Ravi');
    const isSunita = rosterStudent.name.includes('Sunita');

    const supportAlert = supportAlertsStore.find((a) => a.studentId === studentId && !a.isDismissed);

    return {
      student: {
        id: rosterStudent.id,
        name: rosterStudent.name,
        email: rosterStudent.email,
        avatarUrl: rosterStudent.avatarUrl,
        grade: rosterStudent.grade,
        className: rosterStudent.className,
        preferredLanguage: rosterStudent.preferredLanguage,
        deviceAccess: rosterStudent.deviceAccess,
        connectivityLevel: rosterStudent.connectivityLevel,
        batteryLevel: rosterStudent.batteryLevel,
        schoolName: rosterStudent.schoolName,
        lastActive: rosterStudent.lastActive,
        overallProgressPct: rosterStudent.overallProgressPct,
      },
      learningPath: [
        {
          id: 'path-01',
          topicName: 'Whole Numbers & Place Value',
          subject: 'Mathematics',
          sequence: 1,
          status: 'completed',
          masteryScore: 92,
        },
        {
          id: 'path-02',
          topicName: 'Multiplication & Divisibility',
          subject: 'Mathematics',
          sequence: 2,
          status: 'completed',
          masteryScore: 84,
        },
        {
          id: 'path-03',
          topicName: 'Fractions: Parts of a Whole',
          subject: 'Mathematics',
          sequence: 3,
          status: isRavi ? 'needs_practice' : 'completed',
          masteryScore: rosterStudent.fractionsMastery,
          prerequisiteOf: 'Decimals in Measurement',
        },
        {
          id: 'path-04',
          topicName: 'Linear Equations with Balances',
          subject: 'Mathematics',
          sequence: 4,
          status: isSunita ? 'needs_practice' : 'in_progress',
          masteryScore: rosterStudent.algebraMastery,
        },
        {
          id: 'path-05',
          topicName: 'Practical Geometry & Field Area',
          subject: 'Mathematics',
          sequence: 5,
          status: 'upcoming',
          masteryScore: 0,
        },
      ],
      topicMastery: [
        {
          topicId: 'top-frac-01',
          topicName: 'Fractions: Parts of a Whole',
          subject: 'Mathematics',
          masteryScore: rosterStudent.fractionsMastery,
          attempts: isRavi ? 3 : 2,
          correctAttempts: isRavi ? 1 : 2,
          lastAttempted: 'Today, 08:30 AM',
          status: rosterStudent.fractionsMastery >= 80 ? 'mastered' : rosterStudent.fractionsMastery >= 50 ? 'developing' : 'needs_practice',
        },
        {
          topicId: 'top-alg-02',
          topicName: 'Linear Equations with Balances',
          subject: 'Mathematics',
          masteryScore: rosterStudent.algebraMastery,
          attempts: isSunita ? 4 : 2,
          correctAttempts: isSunita ? 1 : 2,
          lastAttempted: 'Yesterday, 04:15 PM',
          status: rosterStudent.algebraMastery >= 80 ? 'mastered' : rosterStudent.algebraMastery >= 50 ? 'developing' : 'needs_practice',
        },
        {
          topicId: 'top-sci-01',
          topicName: 'Water Conservation & Stepwells',
          subject: 'Science',
          masteryScore: rosterStudent.scienceMastery,
          attempts: 2,
          correctAttempts: 2,
          lastAttempted: '2 days ago',
          status: rosterStudent.scienceMastery >= 80 ? 'mastered' : rosterStudent.scienceMastery >= 50 ? 'developing' : 'needs_practice',
        },
      ],
      recentAttempts: [
        {
          id: 'att-01',
          topicName: isRavi ? 'Equivalent Fractions Quiz' : 'Scale Balances Practice',
          date: 'Today, 08:25 AM',
          score: isRavi ? 2 : 4,
          totalQuestions: 5,
          percentage: isRavi ? 40 : 80,
          timeSpentSeconds: 145,
          notes: isRavi ? 'Selected 3/4 instead of 4/6 on equivalent scaling.' : 'Good step-by-step balance isolation.',
        },
        {
          id: 'att-02',
          topicName: 'Unit Fractions & Roti Sharing Check',
          date: 'Yesterday, 03:10 PM',
          score: 3,
          totalQuestions: 5,
          percentage: 60,
          timeSpentSeconds: 180,
        },
        {
          id: 'att-03',
          topicName: 'Multiplication Tables Speed Check',
          date: '3 days ago',
          score: 5,
          totalQuestions: 5,
          percentage: 100,
          timeSpentSeconds: 95,
        },
      ],
      completedLessons: [
        {
          lessonId: 'l-01',
          title: 'Understanding Fractions: Parts of a Whole',
          subject: 'Mathematics',
          completedAt: 'Yesterday',
          timeSpentMinutes: 14,
          score: 75,
        },
        {
          lessonId: 'l-02',
          title: 'Traditional Stepwells (Baori) & Conservation',
          subject: 'Science',
          completedAt: '3 days ago',
          timeSpentMinutes: 12,
          score: 90,
        },
        {
          lessonId: 'l-00',
          title: 'Number Systems & Village Counting Systems',
          subject: 'Mathematics',
          completedAt: '5 days ago',
          timeSpentMinutes: 18,
          score: 95,
        },
      ],
      quizPerformance: {
        totalQuizzesTaken: isRavi ? 12 : 16,
        averageAccuracy: isRavi ? 62 : 84,
        correctAnswers: isRavi ? 37 : 68,
        totalQuestionsAttempted: isRavi ? 60 : 80,
        averageResponseTimeSeconds: 28,
      },
      learningTime: {
        totalMinutesThisMonth: isRavi ? 210 : 340,
        weeklyAverageMinutes: isRavi ? 55 : 85,
        todayMinutes: 14,
        streakDays: isRavi ? 4 : 8,
        dailyActivity: [
          { day: 'Mon', minutes: 20 },
          { day: 'Tue', minutes: 15 },
          { day: 'Wed', minutes: 25 },
          { day: 'Thu', minutes: 18 },
          { day: 'Fri', minutes: 14 },
          { day: 'Sat', minutes: 10 },
          { day: 'Sun', minutes: 15 },
        ],
      },
      recommendedSupport: {
        hasAlert: Boolean(supportAlert),
        patternType: supportAlert?.patternType || (isRavi ? 'repeated_mistakes' : undefined),
        supportPhrase: 'May need additional support.',
        reason: supportAlert?.reason || (isRavi ? 'Repeated difficulty with equivalent fractions.' : 'No active alerts.'),
        detailedObservation:
          supportAlert?.aiSupportNote ||
          (isRavi
            ? 'Student demonstrated hesitation distinguishing between adding constants versus multiplying to find equivalent fractions. May need additional support with physical or visual roti divisions.'
            : 'Student is demonstrating consistent mastery across current grade level topics.'),
        suggestedAction: supportAlert?.recommendedAction || 'Assign Fractions Revision Lesson',
      },
    };
  }

  /**
   * Fetch Teacher Assignments
   */
  public async getAssignments(): Promise<TeacherAssignment[]> {
    return [...assignmentsStore];
  }

  /**
   * Create a New Teacher Assignment
   */
  public async createAssignment(newAssignment: {
    title: string;
    topicId: string;
    topicName: string;
    subject: string;
    grade: number;
    className: string;
    assignedStudentIds: string[];
    dueDate: string;
    instructions?: string;
  }): Promise<TeacherAssignment> {
    const targetStudents =
      newAssignment.assignedStudentIds.length > 0
        ? STUDENTS_ROSTER.filter((s) => newAssignment.assignedStudentIds.includes(s.id))
        : STUDENTS_ROSTER.filter((s) => s.className === newAssignment.className);

    const created: TeacherAssignment = {
      id: `asg-${Date.now()}`,
      title: newAssignment.title,
      topicId: newAssignment.topicId,
      topicName: newAssignment.topicName,
      subject: newAssignment.subject,
      grade: newAssignment.grade,
      className: newAssignment.className,
      assignedStudentIds: newAssignment.assignedStudentIds,
      assignedStudentCount: targetStudents.length || 1,
      completedCount: 0,
      pendingCount: targetStudents.length || 1,
      completionRate: 0,
      assignedDate: new Date().toISOString().split('T')[0],
      dueDate: newAssignment.dueDate,
      instructions: newAssignment.instructions,
      status: 'active',
      studentStatuses: targetStudents.map((s) => ({
        studentId: s.id,
        studentName: s.name,
        status: 'not_started',
      })),
    };

    assignmentsStore = [created, ...assignmentsStore];
    return created;
  }
}

export const teacherService = new TeacherService();
