/**
 * ShikshaSetu School Admin Dashboard - Types & Contracts
 * High-level institutional telemetry, multi-tenant school isolation,
 * student/teacher/class management, and content approval.
 */

export interface SchoolOverviewMetrics {
  schoolId: string;
  schoolName: string;
  district: string;
  state: string;
  udiseCode: string;
  totalStudents: number;
  totalTeachers: number;
  activeLearners: number;
  activeLearnersPct: number;
  totalClasses: number;
  overallProgressPct: number;
  totalLearningHours: number;
  lessonCompletions: number;
  completionRatePct: number;
  offlineLearnersCount: number;
  offlineLearnersPct: number;
  contentUsageCount: number;
}

export interface SubjectPerformanceMetric {
  id: string;
  subject: string;
  grade: number;
  averageMasteryPct: number;
  activeLearners: number;
  totalLearningHours: number;
  completionRatePct: number;
  status: 'excelling' | 'on_track' | 'needs_attention';
}

export type StudentManagementStatus = 'active' | 'inactive' | 'needs_support';

export interface AdminStudent {
  id: string;
  schoolId: string;
  name: string;
  grade: number;
  classId: string;
  className: string;
  learningLevel: string;
  deviceAccess: 'shared_phone' | 'dedicated_phone' | 'tablet' | 'desktop';
  connectivityMode: 'offline' | 'intermittent_2g' | '3g' | '4g';
  overallProgressPct: number;
  learningHours: number;
  status: StudentManagementStatus;
  lastActive: string;
  enrolledAt: string;
}

export type TeacherManagementStatus = 'active' | 'on_leave';

export interface AdminTeacher {
  id: string;
  schoolId: string;
  name: string;
  email: string;
  employeeId: string;
  assignedClasses: string[];
  assignedClassNames: string[];
  assignedSubjects: string[];
  lessonsAssignedCount: number;
  supportAlertsResolvedCount: number;
  lastActive: string;
  status: TeacherManagementStatus;
}

export interface AdminClass {
  id: string;
  schoolId: string;
  name: string;
  grade: number;
  section: string;
  teacherId: string | null;
  teacherName: string | null;
  studentCount: number;
  capacity: number;
  averageProgressPct: number;
  createdAt: string;
}

export type ContentApprovalStatus = 'approved' | 'pending_approval' | 'draft' | 'archived';

export interface AdminContentItem {
  id: string;
  schoolId: string;
  title: string;
  subject: string;
  grade: number;
  authorTeacherName: string;
  authorTeacherId: string;
  contentType: 'lesson' | 'worksheet' | 'quiz' | 'audio_story';
  status: ContentApprovalStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedByAdminId?: string;
  usageCount: number;
  feedbackNote?: string;
  topicsCovered: string[];
}

export interface ProgressTrendPoint {
  week: string;
  averageProgressPct: number;
  targetPct: number;
}

export interface ParticipationTrendPoint {
  day: string;
  activeRatePct: number;
  offlineSyncPct: number;
}

export interface CompletionRateCategory {
  category: string;
  completionPct: number;
  benchmarkPct: number;
}

export interface LearningTimeDistribution {
  deviceType: string;
  hours: number;
  percentage: number;
}

export interface SubjectTrendPoint {
  subject: string;
  currentMastery: number;
  previousMastery: number;
  growthPct: number;
}

export interface AdminAnalyticsData {
  progressTrends: ProgressTrendPoint[];
  participationRate: ParticipationTrendPoint[];
  completionRate: CompletionRateCategory[];
  learningTimeDistribution: LearningTimeDistribution[];
  subjectTrends: SubjectTrendPoint[];
}

// -------------------------------------------------------------
// Form Payloads
// -------------------------------------------------------------

export interface AddStudentPayload {
  name: string;
  grade: number;
  classId: string;
  learningLevel?: string;
  deviceAccess: 'shared_phone' | 'dedicated_phone' | 'tablet' | 'desktop';
  connectivityMode: 'offline' | 'intermittent_2g' | '3g' | '4g';
}

export interface AddTeacherPayload {
  name: string;
  email: string;
  employeeId: string;
  assignedClasses: string[];
  assignedSubjects: string[];
}

export interface CreateClassPayload {
  name: string;
  grade: number;
  section: string;
  teacherId?: string;
  capacity?: number;
}

export interface ContentApprovalActionPayload {
  contentId: string;
  approved: boolean;
  feedbackNote?: string;
}
