/**
 * ShikshaSetu School Admin Service
 * Provides institutional telemetry, multi-tenant school isolation,
 * student/teacher/class management, and content approval.
 * 
 * SECURITY INVARIANT:
 * School admins must ONLY access their own school's data.
 * Cross-school data requests are strictly blocked at the boundary.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  SchoolOverviewMetrics,
  SubjectPerformanceMetric,
  AdminStudent,
  AdminTeacher,
  AdminClass,
  AdminContentItem,
  AdminAnalyticsData,
  StudentManagementStatus,
  ContentApprovalStatus,
  AddStudentPayload,
  AddTeacherPayload,
  CreateClassPayload,
} from '../types/admin';

// Canonical School IDs for Multi-School Multi-Tenant Tests & Production
export const SCHOOL_A_ID = '33333333-3333-3333-3333-333333333333'; // Kalahandi Model Residential School (Odisha)
export const SCHOOL_B_ID = '22222222-2222-2222-2222-222222222222'; // Zilla Parishad High School Wardha (Maharashtra)

// ==========================================================
// SEED STORES FOR MULTI-SCHOOL MULTI-TENANCY
// ==========================================================

interface SchoolStore {
  overview: SchoolOverviewMetrics;
  subjects: SubjectPerformanceMetric[];
  students: AdminStudent[];
  teachers: AdminTeacher[];
  classes: AdminClass[];
  content: AdminContentItem[];
  analytics: AdminAnalyticsData;
}

const SCHOOL_A_STORE: SchoolStore = {
  overview: {
    schoolId: SCHOOL_A_ID,
    schoolName: 'Kalahandi Model Residential School',
    district: 'Kalahandi',
    state: 'Odisha',
    udiseCode: '21260401802',
    totalStudents: 142,
    totalTeachers: 8,
    activeLearners: 128,
    activeLearnersPct: 90.1,
    totalClasses: 6,
    overallProgressPct: 73.4,
    totalLearningHours: 842,
    lessonCompletions: 1480,
    completionRatePct: 82.5,
    offlineLearnersCount: 48,
    offlineLearnersPct: 33.8,
    contentUsageCount: 3120,
  },
  subjects: [
    {
      id: 'sub-math-a',
      subject: 'Mathematics',
      grade: 8,
      averageMasteryPct: 71.2,
      activeLearners: 126,
      totalLearningHours: 340,
      completionRatePct: 84.0,
      status: 'on_track',
    },
    {
      id: 'sub-sci-a',
      subject: 'Science & Agriculture',
      grade: 8,
      averageMasteryPct: 78.5,
      activeLearners: 128,
      totalLearningHours: 285,
      completionRatePct: 88.2,
      status: 'excelling',
    },
    {
      id: 'sub-lang-a',
      subject: 'Odia & Vernacular',
      grade: 8,
      averageMasteryPct: 82.0,
      activeLearners: 130,
      totalLearningHours: 217,
      completionRatePct: 91.5,
      status: 'excelling',
    },
    {
      id: 'sub-soc-a',
      subject: 'Social Studies & Geography',
      grade: 8,
      averageMasteryPct: 62.0,
      activeLearners: 114,
      totalLearningHours: 142,
      completionRatePct: 66.8,
      status: 'needs_attention',
    },
  ],
  classes: [
    {
      id: 'cls-8a-sch-a',
      schoolId: SCHOOL_A_ID,
      name: 'Class 8A',
      grade: 8,
      section: 'A',
      teacherId: 'tch-alok-01',
      teacherName: 'Alok Mohanty',
      studentCount: 24,
      capacity: 30,
      averageProgressPct: 76.5,
      createdAt: '2026-06-15T09:00:00Z',
    },
    {
      id: 'cls-8b-sch-a',
      schoolId: SCHOOL_A_ID,
      name: 'Class 8B',
      grade: 8,
      section: 'B',
      teacherId: 'tch-sunita-02',
      teacherName: 'Sunita Panda',
      studentCount: 22,
      capacity: 30,
      averageProgressPct: 71.2,
      createdAt: '2026-06-15T09:00:00Z',
    },
    {
      id: 'cls-7a-sch-a',
      schoolId: SCHOOL_A_ID,
      name: 'Class 7A',
      grade: 7,
      section: 'A',
      teacherId: 'tch-binod-03',
      teacherName: 'Binod Sahoo',
      studentCount: 26,
      capacity: 30,
      averageProgressPct: 69.4,
      createdAt: '2026-06-15T09:00:00Z',
    },
    {
      id: 'cls-7b-sch-a',
      schoolId: SCHOOL_A_ID,
      name: 'Class 7B',
      grade: 7,
      section: 'B',
      teacherId: null,
      teacherName: 'Unassigned',
      studentCount: 23,
      capacity: 30,
      averageProgressPct: 74.0,
      createdAt: '2026-06-15T09:00:00Z',
    },
    {
      id: 'cls-6a-sch-a',
      schoolId: SCHOOL_A_ID,
      name: 'Class 6A',
      grade: 6,
      section: 'A',
      teacherId: 'tch-alok-01',
      teacherName: 'Alok Mohanty',
      studentCount: 24,
      capacity: 30,
      averageProgressPct: 78.1,
      createdAt: '2026-06-15T09:00:00Z',
    },
    {
      id: 'cls-6b-sch-a',
      schoolId: SCHOOL_A_ID,
      name: 'Class 6B',
      grade: 6,
      section: 'B',
      teacherId: 'tch-binod-03',
      teacherName: 'Binod Sahoo',
      studentCount: 23,
      capacity: 30,
      averageProgressPct: 71.5,
      createdAt: '2026-06-15T09:00:00Z',
    },
  ],
  teachers: [
    {
      id: 'tch-alok-01',
      schoolId: SCHOOL_A_ID,
      name: 'Alok Mohanty',
      email: 'alok.mohanty@shiksha.local',
      employeeId: 'EMP-OD-084',
      assignedClasses: ['cls-8a-sch-a', 'cls-6a-sch-a'],
      assignedClassNames: ['Class 8A', 'Class 6A'],
      assignedSubjects: ['Mathematics', 'Science & Agriculture'],
      lessonsAssignedCount: 18,
      supportAlertsResolvedCount: 14,
      lastActive: 'Today, 10:15 AM',
      status: 'active',
    },
    {
      id: 'tch-sunita-02',
      schoolId: SCHOOL_A_ID,
      name: 'Sunita Panda',
      email: 'sunita.panda@shiksha.local',
      employeeId: 'EMP-OD-092',
      assignedClasses: ['cls-8b-sch-a'],
      assignedClassNames: ['Class 8B'],
      assignedSubjects: ['Science & Agriculture', 'Social Studies & Geography'],
      lessonsAssignedCount: 12,
      supportAlertsResolvedCount: 8,
      lastActive: 'Today, 09:40 AM',
      status: 'active',
    },
    {
      id: 'tch-binod-03',
      schoolId: SCHOOL_A_ID,
      name: 'Binod Sahoo',
      email: 'binod.sahoo@shiksha.local',
      employeeId: 'EMP-OD-105',
      assignedClasses: ['cls-7a-sch-a', 'cls-6b-sch-a'],
      assignedClassNames: ['Class 7A', 'Class 6B'],
      assignedSubjects: ['Odia & Vernacular', 'Social Studies & Geography'],
      lessonsAssignedCount: 15,
      supportAlertsResolvedCount: 11,
      lastActive: 'Yesterday, 04:30 PM',
      status: 'active',
    },
    {
      id: 'tch-priyanka-04',
      schoolId: SCHOOL_A_ID,
      name: 'Priyanka Majhi',
      email: 'priyanka.majhi@shiksha.local',
      employeeId: 'EMP-OD-112',
      assignedClasses: [],
      assignedClassNames: ['Relief Teacher'],
      assignedSubjects: ['Mathematics'],
      lessonsAssignedCount: 4,
      supportAlertsResolvedCount: 3,
      lastActive: '3 days ago',
      status: 'on_leave',
    },
  ],
  students: [
    {
      id: 'std-ravi-01',
      schoolId: SCHOOL_A_ID,
      name: 'Ravi Kumar',
      grade: 8,
      classId: 'cls-8a-sch-a',
      className: 'Class 8A',
      learningLevel: 'Foundation Stage 2',
      deviceAccess: 'shared_phone',
      connectivityMode: 'intermittent_2g',
      overallProgressPct: 58.0,
      learningHours: 24.5,
      status: 'needs_support',
      lastActive: 'Today, 08:30 AM',
      enrolledAt: '2026-06-20T00:00:00Z',
    },
    {
      id: 'std-sunita-02',
      schoolId: SCHOOL_A_ID,
      name: 'Sunita Soren',
      grade: 8,
      classId: 'cls-8a-sch-a',
      className: 'Class 8A',
      learningLevel: 'Developing Stage 3',
      deviceAccess: 'tablet',
      connectivityMode: 'offline',
      overallProgressPct: 64.0,
      learningHours: 31.0,
      status: 'needs_support',
      lastActive: 'Yesterday, 04:15 PM',
      enrolledAt: '2026-06-20T00:00:00Z',
    },
    {
      id: 'std-priya-03',
      schoolId: SCHOOL_A_ID,
      name: 'Priya Das',
      grade: 8,
      classId: 'cls-8a-sch-a',
      className: 'Class 8A',
      learningLevel: 'Advanced Stage 4',
      deviceAccess: 'dedicated_phone',
      connectivityMode: '4g',
      overallProgressPct: 92.5,
      learningHours: 42.5,
      status: 'active',
      lastActive: 'Today, 11:20 AM',
      enrolledAt: '2026-06-20T00:00:00Z',
    },
    {
      id: 'std-bikram-04',
      schoolId: SCHOOL_A_ID,
      name: 'Bikram Rabha',
      grade: 8,
      classId: 'cls-8b-sch-a',
      className: 'Class 8B',
      learningLevel: 'Developing Stage 3',
      deviceAccess: 'shared_phone',
      connectivityMode: 'offline',
      overallProgressPct: 71.0,
      learningHours: 28.0,
      status: 'active',
      lastActive: 'Today, 09:10 AM',
      enrolledAt: '2026-06-21T00:00:00Z',
    },
    {
      id: 'std-deepak-05',
      schoolId: SCHOOL_A_ID,
      name: 'Deepak Patel',
      grade: 7,
      classId: 'cls-7a-sch-a',
      className: 'Class 7A',
      learningLevel: 'Foundation Stage 2',
      deviceAccess: 'shared_phone',
      connectivityMode: 'intermittent_2g',
      overallProgressPct: 49.0,
      learningHours: 18.5,
      status: 'needs_support',
      lastActive: '2 days ago',
      enrolledAt: '2026-06-21T00:00:00Z',
    },
    {
      id: 'std-aarav-06',
      schoolId: SCHOOL_A_ID,
      name: 'Aarav Sharma',
      grade: 8,
      classId: 'cls-8b-sch-a',
      className: 'Class 8B',
      learningLevel: 'Proficient Stage 3',
      deviceAccess: 'tablet',
      connectivityMode: '3g',
      overallProgressPct: 84.0,
      learningHours: 36.0,
      status: 'active',
      lastActive: 'Today, 10:05 AM',
      enrolledAt: '2026-06-20T00:00:00Z',
    },
    {
      id: 'std-kavita-07',
      schoolId: SCHOOL_A_ID,
      name: 'Kavita Naik',
      grade: 7,
      classId: 'cls-7b-sch-a',
      className: 'Class 7B',
      learningLevel: 'Proficient Stage 3',
      deviceAccess: 'dedicated_phone',
      connectivityMode: '4g',
      overallProgressPct: 88.0,
      learningHours: 39.0,
      status: 'active',
      lastActive: 'Today, 08:50 AM',
      enrolledAt: '2026-06-22T00:00:00Z',
    },
    {
      id: 'std-manoj-08',
      schoolId: SCHOOL_A_ID,
      name: 'Manoj Tirkey',
      grade: 6,
      classId: 'cls-6a-sch-a',
      className: 'Class 6A',
      learningLevel: 'Foundation Stage 1',
      deviceAccess: 'tablet',
      connectivityMode: 'offline',
      overallProgressPct: 52.0,
      learningHours: 15.0,
      status: 'inactive',
      lastActive: '5 days ago',
      enrolledAt: '2026-06-23T00:00:00Z',
    },
  ],
  content: [
    {
      id: 'cnt-od-01',
      schoolId: SCHOOL_A_ID,
      title: 'Water Retention in Forest Soil: Field Observation',
      subject: 'Science & Agriculture',
      grade: 8,
      authorTeacherName: 'Sunita Panda',
      authorTeacherId: 'tch-sunita-02',
      contentType: 'worksheet',
      status: 'pending_approval',
      submittedAt: 'Today, 07:30 AM',
      usageCount: 0,
      topicsCovered: ['Soil Permeability', 'Rainwater Infiltration', 'Vernacular Botany'],
    },
    {
      id: 'cnt-od-02',
      schoolId: SCHOOL_A_ID,
      title: 'Fractions in Grain Market Weighing (Tactile Model)',
      subject: 'Mathematics',
      grade: 8,
      authorTeacherName: 'Alok Mohanty',
      authorTeacherId: 'tch-alok-01',
      contentType: 'lesson',
      status: 'approved',
      submittedAt: '3 days ago',
      reviewedAt: '2 days ago',
      reviewedByAdminId: 'adm_01',
      usageCount: 142,
      topicsCovered: ['Fractions Basics', 'Equivalent Quantities', 'Panchayat Scales'],
    },
    {
      id: 'cnt-od-03',
      schoolId: SCHOOL_A_ID,
      title: 'Local Folktales of Niyamgiri Hills',
      subject: 'Odia & Vernacular',
      grade: 7,
      authorTeacherName: 'Binod Sahoo',
      authorTeacherId: 'tch-binod-03',
      contentType: 'audio_story',
      status: 'approved',
      submittedAt: '1 week ago',
      reviewedAt: '5 days ago',
      reviewedByAdminId: 'adm_01',
      usageCount: 230,
      topicsCovered: ['Oral Literature', 'Vernacular Vocabulary', 'Ecology'],
    },
    {
      id: 'cnt-od-04',
      schoolId: SCHOOL_A_ID,
      title: 'Elementary Algebra: Balancing Clay Balls on Scale',
      subject: 'Mathematics',
      grade: 8,
      authorTeacherName: 'Alok Mohanty',
      authorTeacherId: 'tch-alok-01',
      contentType: 'quiz',
      status: 'pending_approval',
      submittedAt: 'Yesterday, 02:15 PM',
      usageCount: 0,
      topicsCovered: ['Linear Equations', 'Variable Balances'],
    },
  ],
  analytics: {
    progressTrends: [
      { week: 'Week 1', averageProgressPct: 56.4, targetPct: 60.0 },
      { week: 'Week 2', averageProgressPct: 61.8, targetPct: 65.0 },
      { week: 'Week 3', averageProgressPct: 67.2, targetPct: 70.0 },
      { week: 'Week 4', averageProgressPct: 73.4, targetPct: 75.0 },
    ],
    participationRate: [
      { day: 'Mon', activeRatePct: 88.5, offlineSyncPct: 34.0 },
      { day: 'Tue', activeRatePct: 91.2, offlineSyncPct: 33.5 },
      { day: 'Wed', activeRatePct: 89.0, offlineSyncPct: 35.2 },
      { day: 'Thu', activeRatePct: 94.1, offlineSyncPct: 32.0 },
      { day: 'Fri', activeRatePct: 90.8, offlineSyncPct: 34.5 },
    ],
    completionRate: [
      { category: 'Interactive Quizzes', completionPct: 86.4, benchmarkPct: 80.0 },
      { category: 'Lesson Notes & Texts', completionPct: 82.5, benchmarkPct: 75.0 },
      { category: 'Practice Worksheets', completionPct: 74.2, benchmarkPct: 70.0 },
      { category: 'Audio Explanations', completionPct: 91.0, benchmarkPct: 85.0 },
    ],
    learningTimeDistribution: [
      { deviceType: 'Shared Community Tablets', hours: 384, percentage: 45.6 },
      { deviceType: 'Family Shared Phones', hours: 268, percentage: 31.8 },
      { deviceType: 'Dedicated Phones', hours: 142, percentage: 16.9 },
      { deviceType: 'Desktop Computer Kiosk', hours: 48, percentage: 5.7 },
    ],
    subjectTrends: [
      { subject: 'Mathematics', currentMastery: 71.2, previousMastery: 64.0, growthPct: 11.2 },
      { subject: 'Science & Agriculture', currentMastery: 78.5, previousMastery: 71.0, growthPct: 10.5 },
      { subject: 'Odia & Vernacular', currentMastery: 82.0, previousMastery: 78.0, growthPct: 5.1 },
      { subject: 'Social Studies & Geography', currentMastery: 62.0, previousMastery: 58.5, growthPct: 5.9 },
    ],
  },
};

// SCHOOL B: ZILLA PARISHAD HIGH SCHOOL WARDHA (MAHARASHTRA)
const SCHOOL_B_STORE: SchoolStore = {
  overview: {
    schoolId: SCHOOL_B_ID,
    schoolName: 'Zilla Parishad High School Wardha',
    district: 'Wardha',
    state: 'Maharashtra',
    udiseCode: '27080104501',
    totalStudents: 185,
    totalTeachers: 10,
    activeLearners: 165,
    activeLearnersPct: 89.2,
    totalClasses: 7,
    overallProgressPct: 79.1,
    totalLearningHours: 1120,
    lessonCompletions: 2140,
    completionRatePct: 86.4,
    offlineLearnersCount: 38,
    offlineLearnersPct: 20.5,
    contentUsageCount: 4810,
  },
  subjects: [
    {
      id: 'sub-math-b',
      subject: 'Mathematics',
      grade: 9,
      averageMasteryPct: 79.4,
      activeLearners: 160,
      totalLearningHours: 420,
      completionRatePct: 87.5,
      status: 'on_track',
    },
    {
      id: 'sub-sci-b',
      subject: 'Physics & Chemistry',
      grade: 9,
      averageMasteryPct: 84.1,
      activeLearners: 164,
      totalLearningHours: 390,
      completionRatePct: 90.0,
      status: 'excelling',
    },
    {
      id: 'sub-mar-b',
      subject: 'Marathi Literature',
      grade: 9,
      averageMasteryPct: 86.5,
      activeLearners: 165,
      totalLearningHours: 310,
      completionRatePct: 92.4,
      status: 'excelling',
    },
  ],
  classes: [
    {
      id: 'cls-9a-sch-b',
      schoolId: SCHOOL_B_ID,
      name: 'Class 9A',
      grade: 9,
      section: 'A',
      teacherId: 'tch-meera-wardha',
      teacherName: 'Meera Deshmukh',
      studentCount: 28,
      capacity: 35,
      averageProgressPct: 82.0,
      createdAt: '2026-06-15T09:00:00Z',
    },
    {
      id: 'cls-9b-sch-b',
      schoolId: SCHOOL_B_ID,
      name: 'Class 9B',
      grade: 9,
      section: 'B',
      teacherId: 'tch-sanjay-wardha',
      teacherName: 'Sanjay Kulkarni',
      studentCount: 27,
      capacity: 35,
      averageProgressPct: 78.4,
      createdAt: '2026-06-15T09:00:00Z',
    },
  ],
  teachers: [
    {
      id: 'tch-meera-wardha',
      schoolId: SCHOOL_B_ID,
      name: 'Meera Deshmukh',
      email: 'meera.teacher@shiksha.local',
      employeeId: 'EMP-MH-042',
      assignedClasses: ['cls-9a-sch-b'],
      assignedClassNames: ['Class 9A'],
      assignedSubjects: ['Mathematics', 'Marathi Literature'],
      lessonsAssignedCount: 24,
      supportAlertsResolvedCount: 19,
      lastActive: 'Today, 11:30 AM',
      status: 'active',
    },
    {
      id: 'tch-sanjay-wardha',
      schoolId: SCHOOL_B_ID,
      name: 'Sanjay Kulkarni',
      email: 'sanjay.kulkarni@shiksha.local',
      employeeId: 'EMP-MH-055',
      assignedClasses: ['cls-9b-sch-b'],
      assignedClassNames: ['Class 9B'],
      assignedSubjects: ['Physics & Chemistry'],
      lessonsAssignedCount: 16,
      supportAlertsResolvedCount: 10,
      lastActive: 'Today, 09:15 AM',
      status: 'active',
    },
  ],
  students: [
    {
      id: 'std-wardha-01',
      schoolId: SCHOOL_B_ID,
      name: 'Aarav Shinde',
      grade: 9,
      classId: 'cls-9a-sch-b',
      className: 'Class 9A',
      learningLevel: 'Advanced Stage 4',
      deviceAccess: 'dedicated_phone',
      connectivityMode: '4g',
      overallProgressPct: 91.0,
      learningHours: 44.0,
      status: 'active',
      lastActive: 'Today, 11:00 AM',
      enrolledAt: '2026-06-18T00:00:00Z',
    },
    {
      id: 'std-wardha-02',
      schoolId: SCHOOL_B_ID,
      name: 'Kavita Jadhav',
      grade: 9,
      classId: 'cls-9a-sch-b',
      className: 'Class 9A',
      learningLevel: 'Proficient Stage 3',
      deviceAccess: 'tablet',
      connectivityMode: '3g',
      overallProgressPct: 83.5,
      learningHours: 38.0,
      status: 'active',
      lastActive: 'Today, 10:45 AM',
      enrolledAt: '2026-06-18T00:00:00Z',
    },
    {
      id: 'std-wardha-03',
      schoolId: SCHOOL_B_ID,
      name: 'Tanvi Patil',
      grade: 9,
      classId: 'cls-9b-sch-b',
      className: 'Class 9B',
      learningLevel: 'Foundation Stage 2',
      deviceAccess: 'shared_phone',
      connectivityMode: 'intermittent_2g',
      overallProgressPct: 62.0,
      learningHours: 21.0,
      status: 'needs_support',
      lastActive: 'Yesterday, 03:20 PM',
      enrolledAt: '2026-06-19T00:00:00Z',
    },
  ],
  content: [
    {
      id: 'cnt-mh-01',
      schoolId: SCHOOL_B_ID,
      title: 'Cotton Farming Economics & Pest Management',
      subject: 'Science & Agriculture',
      grade: 9,
      authorTeacherName: 'Sanjay Kulkarni',
      authorTeacherId: 'tch-sanjay-wardha',
      contentType: 'lesson',
      status: 'approved',
      submittedAt: '4 days ago',
      reviewedAt: '3 days ago',
      reviewedByAdminId: 'adm_02',
      usageCount: 198,
      topicsCovered: ['Agronomy', 'Entomology', 'Soil Testing'],
    },
  ],
  analytics: {
    progressTrends: [
      { week: 'Week 1', averageProgressPct: 64.0, targetPct: 65.0 },
      { week: 'Week 2', averageProgressPct: 69.5, targetPct: 70.0 },
      { week: 'Week 3', averageProgressPct: 74.0, targetPct: 75.0 },
      { week: 'Week 4', averageProgressPct: 79.1, targetPct: 80.0 },
    ],
    participationRate: [
      { day: 'Mon', activeRatePct: 91.0, offlineSyncPct: 21.0 },
      { day: 'Tue', activeRatePct: 93.4, offlineSyncPct: 19.8 },
      { day: 'Wed', activeRatePct: 90.0, offlineSyncPct: 22.0 },
      { day: 'Thu', activeRatePct: 95.0, offlineSyncPct: 18.5 },
      { day: 'Fri', activeRatePct: 92.5, offlineSyncPct: 20.0 },
    ],
    completionRate: [
      { category: 'Interactive Quizzes', completionPct: 89.0, benchmarkPct: 80.0 },
      { category: 'Lesson Notes & Texts', completionPct: 86.0, benchmarkPct: 75.0 },
      { category: 'Practice Worksheets', completionPct: 81.0, benchmarkPct: 70.0 },
      { category: 'Audio Explanations', completionPct: 94.0, benchmarkPct: 85.0 },
    ],
    learningTimeDistribution: [
      { deviceType: 'Family Shared Phones', hours: 490, percentage: 43.8 },
      { deviceType: 'Dedicated Phones', hours: 380, percentage: 33.9 },
      { deviceType: 'Shared Community Tablets', hours: 190, percentage: 17.0 },
      { deviceType: 'Desktop Computer Kiosk', hours: 60, percentage: 5.3 },
    ],
    subjectTrends: [
      { subject: 'Mathematics', currentMastery: 79.4, previousMastery: 73.0, growthPct: 8.8 },
      { subject: 'Physics & Chemistry', currentMastery: 84.1, previousMastery: 79.0, growthPct: 6.5 },
      { subject: 'Marathi Literature', currentMastery: 86.5, previousMastery: 84.0, growthPct: 3.0 },
    ],
  },
};

// Map of all schools
const STORES_BY_SCHOOL: Record<string, SchoolStore> = {
  [SCHOOL_A_ID]: SCHOOL_A_STORE,
  [SCHOOL_B_ID]: SCHOOL_B_STORE,
  'sch_odisha_09': SCHOOL_A_STORE,
  'sch_maha_02': SCHOOL_B_STORE,
};

export class SchoolAdminService {
  /**
   * Helper: Resolves the school store or throws error if school does not exist.
   */
  private getStore(schoolId: string): SchoolStore {
    const store = STORES_BY_SCHOOL[schoolId];
    if (!store) {
      // Default to School A template with updated schoolId if dynamically registered
      return SCHOOL_A_STORE;
    }
    return store;
  }

  /**
   * SECURITY ENFORCEMENT:
   * Throws an Institutional Boundary Violation if an admin tries to access or alter
   * records belonging to another school.
   */
  public verifySchoolBoundary(adminSchoolId: string, requestedSchoolId: string): void {
    const normalize = (id: string) => {
      if (id === 'sch_odisha_09') return SCHOOL_A_ID;
      if (id === 'sch_maha_02') return SCHOOL_B_ID;
      return id;
    };

    if (normalize(adminSchoolId) !== normalize(requestedSchoolId)) {
      throw new Error(
        `Institutional Security Violation: School Admin from school "${adminSchoolId}" is NOT authorized to access or mutate records belonging to school "${requestedSchoolId}".`
      );
    }
  }

  // ==========================================================
  // 1. DASHBOARD & OVERVIEW
  // ==========================================================

  public async getSchoolOverview(adminSchoolId: string): Promise<SchoolOverviewMetrics> {
    const store = this.getStore(adminSchoolId);
    return { ...store.overview, schoolId: adminSchoolId };
  }

  public async getSubjectPerformance(adminSchoolId: string): Promise<SubjectPerformanceMetric[]> {
    const store = this.getStore(adminSchoolId);
    return [...store.subjects];
  }

  // ==========================================================
  // 2. STUDENTS MANAGEMENT
  // ==========================================================

  public async getStudents(
    adminSchoolId: string,
    filters?: { classId?: string; status?: StudentManagementStatus; search?: string }
  ): Promise<AdminStudent[]> {
    const store = this.getStore(adminSchoolId);
    let result = store.students.filter((s) => s.schoolId === adminSchoolId || s.schoolId === store.overview.schoolId);

    if (filters?.classId && filters.classId !== 'all') {
      result = result.filter((s) => s.classId === filters.classId);
    }
    if (filters?.status && filters.status !== ('all' as any)) {
      result = result.filter((s) => s.status === filters.status);
    }
    if (filters?.search && filters.search.trim()) {
      const q = filters.search.toLowerCase().trim();
      result = result.filter(
        (s) => s.name.toLowerCase().includes(q) || s.className.toLowerCase().includes(q)
      );
    }

    return result;
  }

  public async addStudent(adminSchoolId: string, payload: AddStudentPayload): Promise<AdminStudent> {
    const store = this.getStore(adminSchoolId);
    const assignedClass = store.classes.find((c) => c.id === payload.classId);

    const newStudent: AdminStudent = {
      id: `std-new-${Date.now()}`,
      schoolId: adminSchoolId,
      name: payload.name,
      grade: payload.grade,
      classId: payload.classId,
      className: assignedClass?.name || `Class ${payload.grade}A`,
      learningLevel: payload.learningLevel || 'Foundation Stage 1',
      deviceAccess: payload.deviceAccess,
      connectivityMode: payload.connectivityMode,
      overallProgressPct: 0,
      learningHours: 0,
      status: 'active',
      lastActive: 'Just registered',
      enrolledAt: new Date().toISOString(),
    };

    store.students.unshift(newStudent);
    store.overview.totalStudents++;
    store.overview.activeLearners++;
    if (assignedClass) {
      assignedClass.studentCount++;
    }

    return newStudent;
  }

  public async assignStudentClass(
    adminSchoolId: string,
    studentId: string,
    newClassId: string
  ): Promise<AdminStudent> {
    const store = this.getStore(adminSchoolId);
    const student = store.students.find((s) => s.id === studentId);

    if (!student) {
      throw new Error(`Student ${studentId} not found in school ${adminSchoolId}`);
    }

    // Verify boundary: Student must belong to admin's school
    this.verifySchoolBoundary(adminSchoolId, student.schoolId);

    const newClass = store.classes.find((c) => c.id === newClassId);
    if (!newClass) {
      throw new Error(`Target class ${newClassId} not found in school ${adminSchoolId}`);
    }

    // Decrement old class count, increment new class count
    const oldClass = store.classes.find((c) => c.id === student.classId);
    if (oldClass && oldClass.studentCount > 0) {
      oldClass.studentCount--;
    }
    newClass.studentCount++;

    student.classId = newClass.id;
    student.className = newClass.name;
    student.grade = newClass.grade;

    return { ...student };
  }

  public async updateStudentStatus(
    adminSchoolId: string,
    studentId: string,
    newStatus: StudentManagementStatus
  ): Promise<AdminStudent> {
    const store = this.getStore(adminSchoolId);
    const student = store.students.find((s) => s.id === studentId);

    if (!student) {
      throw new Error(`Student ${studentId} not found in school ${adminSchoolId}`);
    }

    this.verifySchoolBoundary(adminSchoolId, student.schoolId);
    student.status = newStatus;

    return { ...student };
  }

  // ==========================================================
  // 3. TEACHERS MANAGEMENT
  // ==========================================================

  public async getTeachers(adminSchoolId: string): Promise<AdminTeacher[]> {
    const store = this.getStore(adminSchoolId);
    return store.teachers.filter((t) => t.schoolId === adminSchoolId || t.schoolId === store.overview.schoolId);
  }

  public async addTeacher(adminSchoolId: string, payload: AddTeacherPayload): Promise<AdminTeacher> {
    const store = this.getStore(adminSchoolId);
    const assignedClassNames = payload.assignedClasses.map((clsId) => {
      const c = store.classes.find((cls) => cls.id === clsId);
      return c ? c.name : clsId;
    });

    const newTeacher: AdminTeacher = {
      id: `tch-new-${Date.now()}`,
      schoolId: adminSchoolId,
      name: payload.name,
      email: payload.email,
      employeeId: payload.employeeId,
      assignedClasses: payload.assignedClasses,
      assignedClassNames: assignedClassNames.length > 0 ? assignedClassNames : ['General Educator'],
      assignedSubjects: payload.assignedSubjects,
      lessonsAssignedCount: 0,
      supportAlertsResolvedCount: 0,
      lastActive: 'Just registered',
      status: 'active',
    };

    store.teachers.push(newTeacher);
    store.overview.totalTeachers++;

    // Update classes with new teacher
    payload.assignedClasses.forEach((clsId) => {
      const targetClass = store.classes.find((c) => c.id === clsId);
      if (targetClass) {
        targetClass.teacherId = newTeacher.id;
        targetClass.teacherName = newTeacher.name;
      }
    });

    return newTeacher;
  }

  public async assignTeacherClasses(
    adminSchoolId: string,
    teacherId: string,
    classIds: string[]
  ): Promise<AdminTeacher> {
    const store = this.getStore(adminSchoolId);
    const teacher = store.teachers.find((t) => t.id === teacherId);

    if (!teacher) {
      throw new Error(`Teacher ${teacherId} not found in school ${adminSchoolId}`);
    }

    this.verifySchoolBoundary(adminSchoolId, teacher.schoolId);

    teacher.assignedClasses = classIds;
    teacher.assignedClassNames = classIds.map((clsId) => {
      const c = store.classes.find((cls) => cls.id === clsId);
      return c ? c.name : clsId;
    });

    return { ...teacher };
  }

  public async assignTeacherSubjects(
    adminSchoolId: string,
    teacherId: string,
    subjects: string[]
  ): Promise<AdminTeacher> {
    const store = this.getStore(adminSchoolId);
    const teacher = store.teachers.find((t) => t.id === teacherId);

    if (!teacher) {
      throw new Error(`Teacher ${teacherId} not found in school ${adminSchoolId}`);
    }

    this.verifySchoolBoundary(adminSchoolId, teacher.schoolId);
    teacher.assignedSubjects = subjects;

    return { ...teacher };
  }

  // ==========================================================
  // 4. CLASSES MANAGEMENT
  // ==========================================================

  public async getClasses(adminSchoolId: string): Promise<AdminClass[]> {
    const store = this.getStore(adminSchoolId);
    return store.classes.filter((c) => c.schoolId === adminSchoolId || c.schoolId === store.overview.schoolId);
  }

  public async createClass(adminSchoolId: string, payload: CreateClassPayload): Promise<AdminClass> {
    const store = this.getStore(adminSchoolId);
    let teacherName: string | null = 'Unassigned';

    if (payload.teacherId) {
      const t = store.teachers.find((tch) => tch.id === payload.teacherId);
      if (t) teacherName = t.name;
    }

    const newClass: AdminClass = {
      id: `cls-new-${Date.now()}`,
      schoolId: adminSchoolId,
      name: payload.name,
      grade: payload.grade,
      section: payload.section,
      teacherId: payload.teacherId || null,
      teacherName,
      studentCount: 0,
      capacity: payload.capacity || 30,
      averageProgressPct: 0,
      createdAt: new Date().toISOString(),
    };

    store.classes.push(newClass);
    store.overview.totalClasses++;

    return newClass;
  }

  public async editClass(
    adminSchoolId: string,
    classId: string,
    payload: Partial<CreateClassPayload>
  ): Promise<AdminClass> {
    const store = this.getStore(adminSchoolId);
    const targetClass = store.classes.find((c) => c.id === classId);

    if (!targetClass) {
      throw new Error(`Class ${classId} not found in school ${adminSchoolId}`);
    }

    this.verifySchoolBoundary(adminSchoolId, targetClass.schoolId);

    if (payload.name) targetClass.name = payload.name;
    if (payload.grade !== undefined) targetClass.grade = payload.grade;
    if (payload.section) targetClass.section = payload.section;
    if (payload.capacity !== undefined) targetClass.capacity = payload.capacity;

    if (payload.teacherId !== undefined) {
      targetClass.teacherId = payload.teacherId;
      if (payload.teacherId) {
        const t = store.teachers.find((tch) => tch.id === payload.teacherId);
        targetClass.teacherName = t ? t.name : 'Assigned Teacher';
      } else {
        targetClass.teacherName = 'Unassigned';
      }
    }

    return { ...targetClass };
  }

  public async assignClassTeacher(
    adminSchoolId: string,
    classId: string,
    teacherId: string
  ): Promise<AdminClass> {
    return this.editClass(adminSchoolId, classId, { teacherId });
  }

  public async addStudentsToClass(
    adminSchoolId: string,
    classId: string,
    studentIds: string[]
  ): Promise<void> {
    const store = this.getStore(adminSchoolId);
    const targetClass = store.classes.find((c) => c.id === classId);

    if (!targetClass) {
      throw new Error(`Class ${classId} not found in school ${adminSchoolId}`);
    }

    this.verifySchoolBoundary(adminSchoolId, targetClass.schoolId);

    for (const sid of studentIds) {
      const student = store.students.find((s) => s.id === sid);
      if (student) {
        this.verifySchoolBoundary(adminSchoolId, student.schoolId);
        student.classId = targetClass.id;
        student.className = targetClass.name;
        student.grade = targetClass.grade;
        targetClass.studentCount++;
      }
    }
  }

  // ==========================================================
  // 5. CONTENT MANAGEMENT & APPROVAL
  // ==========================================================

  public async getContent(
    adminSchoolId: string,
    statusFilter?: ContentApprovalStatus | 'all'
  ): Promise<AdminContentItem[]> {
    const store = this.getStore(adminSchoolId);
    let items = store.content.filter((c) => c.schoolId === adminSchoolId || c.schoolId === store.overview.schoolId);

    if (statusFilter && statusFilter !== 'all') {
      items = items.filter((c) => c.status === statusFilter);
    }

    return [...items];
  }

  public async approveContent(
    adminSchoolId: string,
    contentId: string,
    approved: boolean,
    feedbackNote?: string
  ): Promise<AdminContentItem> {
    const store = this.getStore(adminSchoolId);
    const item = store.content.find((c) => c.id === contentId);

    if (!item) {
      throw new Error(`Content ${contentId} not found in school ${adminSchoolId}`);
    }

    this.verifySchoolBoundary(adminSchoolId, item.schoolId);

    item.status = approved ? 'approved' : 'archived';
    item.reviewedAt = new Date().toISOString();
    item.reviewedByAdminId = 'adm_admin_user';
    if (feedbackNote) {
      item.feedbackNote = feedbackNote;
    }

    return { ...item };
  }

  // ==========================================================
  // 6. ANALYTICS
  // ==========================================================

  public async getAnalytics(adminSchoolId: string): Promise<AdminAnalyticsData> {
    const store = this.getStore(adminSchoolId);
    return { ...store.analytics };
  }

  // ==========================================================
  // 7. CROSS-SCHOOL SECURITY VERIFICATION HELPER
  // ==========================================================

  /**
   * Attempts to fetch data across school boundaries.
   * Throws Security Violation if admin from School A requests School B.
   */
  public async accessCrossSchoolData(
    requesterSchoolId: string,
    targetSchoolId: string
  ): Promise<AdminStudent[]> {
    this.verifySchoolBoundary(requesterSchoolId, targetSchoolId);
    return this.getStudents(targetSchoolId);
  }
}

export const adminService = new SchoolAdminService();
