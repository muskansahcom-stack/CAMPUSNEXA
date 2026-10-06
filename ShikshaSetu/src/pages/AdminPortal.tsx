import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import {
  adminService,
  SCHOOL_A_ID,
  SCHOOL_B_ID,
} from '../services/adminService';
import {
  SchoolOverviewMetrics,
  SubjectPerformanceMetric,
  AdminStudent,
  AdminTeacher,
  AdminClass,
  AdminContentItem,
  AdminAnalyticsData,
  StudentManagementStatus,
  AddStudentPayload,
  AddTeacherPayload,
  CreateClassPayload,
} from '../types/admin';
import {
  AdminOverviewMetrics,
  SubjectPerformanceGrid,
  StudentsManagementSection,
  TeachersManagementSection,
  ClassesManagementSection,
  ContentManagementSection,
  AdminAnalyticsSection,
} from '../components/admin';
import { SchoolAnalyticsView } from '../components/analytics/SchoolAnalyticsView';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import {
  BarChart3,
  Users,
  GraduationCap,
  Layers,
  FileCheck,
  TrendingUp,
  ShieldCheck,
  Building,
  RefreshCw,
  AlertTriangle,
  Lock,
} from 'lucide-react';

export const AdminPortal: React.FC = () => {
  const { user, profile, role } = useAuth();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active tab state (synced with URL query param ?tab=...)
  const activeTab = searchParams.get('tab') || 'overview';
  const setActiveTab = (tab: string) => {
    setSearchParams({ tab });
  };

  // Active School Tenancy (Defaults to user's school_id or School A)
  const initialSchoolId = profile?.school_id || SCHOOL_A_ID;
  const [currentSchoolId, setCurrentSchoolId] = useState<string>(initialSchoolId);

  // Data states
  const [overview, setOverview] = useState<SchoolOverviewMetrics | null>(null);
  const [subjects, setSubjects] = useState<SubjectPerformanceMetric[]>([]);
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [classes, setClasses] = useState<AdminClass[]>([]);
  const [content, setContent] = useState<AdminContentItem[]>([]);
  const [analytics, setAnalytics] = useState<AdminAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load school data scoped strictly to currentSchoolId
  const loadSchoolData = async (schoolId: string) => {
    setIsLoading(true);
    try {
      const [
        overviewData,
        subjectsData,
        studentsData,
        teachersData,
        classesData,
        contentData,
        analyticsData,
      ] = await Promise.all([
        adminService.getSchoolOverview(schoolId),
        adminService.getSubjectPerformance(schoolId),
        adminService.getStudents(schoolId),
        adminService.getTeachers(schoolId),
        adminService.getClasses(schoolId),
        adminService.getContent(schoolId),
        adminService.getAnalytics(schoolId),
      ]);

      setOverview(overviewData);
      setSubjects(subjectsData);
      setStudents(studentsData);
      setTeachers(teachersData);
      setClasses(classesData);
      setContent(contentData);
      setAnalytics(analyticsData);
    } catch (err: any) {
      console.error('Failed to load admin school data:', err);
      showToast({
        type: 'error',
        title: 'Institutional Load Error',
        message: err.message || 'Could not load school records.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSchoolData(currentSchoolId);
  }, [currentSchoolId]);

  // Handlers for Students
  const handleAddStudent = async (payload: AddStudentPayload) => {
    const newStudent = await adminService.addStudent(currentSchoolId, payload);
    await loadSchoolData(currentSchoolId);
    showToast({
      type: 'success',
      title: 'Student Enrolled',
      message: `${newStudent.name} successfully added to ${newStudent.className}.`,
    });
  };

  const handleAssignStudentClass = async (studentId: string, newClassId: string) => {
    const updated = await adminService.assignStudentClass(currentSchoolId, studentId, newClassId);
    await loadSchoolData(currentSchoolId);
    showToast({
      type: 'success',
      title: 'Class Reassigned',
      message: `${updated.name} transferred to ${updated.className}.`,
    });
  };

  const handleUpdateStudentStatus = async (studentId: string, status: StudentManagementStatus) => {
    const updated = await adminService.updateStudentStatus(currentSchoolId, studentId, status);
    await loadSchoolData(currentSchoolId);
    showToast({
      type: 'info',
      title: 'Student Status Updated',
      message: `${updated.name} marked as "${status.replace('_', ' ')}".`,
    });
  };

  // Handlers for Teachers
  const handleAddTeacher = async (payload: AddTeacherPayload) => {
    const newTeacher = await adminService.addTeacher(currentSchoolId, payload);
    await loadSchoolData(currentSchoolId);
    showToast({
      type: 'success',
      title: 'Faculty Teacher Added',
      message: `${newTeacher.name} (${newTeacher.employeeId}) registered to teaching staff.`,
    });
  };

  const handleAssignTeacherClasses = async (teacherId: string, classIds: string[]) => {
    await adminService.assignTeacherClasses(currentSchoolId, teacherId, classIds);
    await loadSchoolData(currentSchoolId);
    showToast({
      type: 'success',
      title: 'Teaching Classes Updated',
      message: 'Class assignments successfully updated.',
    });
  };

  const handleAssignTeacherSubjects = async (teacherId: string, subjectsList: string[]) => {
    await adminService.assignTeacherSubjects(currentSchoolId, teacherId, subjectsList);
    await loadSchoolData(currentSchoolId);
    showToast({
      type: 'success',
      title: 'Assigned Subjects Updated',
      message: 'Teacher subject allocations updated.',
    });
  };

  // Handlers for Classes
  const handleCreateClass = async (payload: CreateClassPayload) => {
    const newClass = await adminService.createClass(currentSchoolId, payload);
    await loadSchoolData(currentSchoolId);
    showToast({
      type: 'success',
      title: 'Classroom Section Created',
      message: `${newClass.name} established with capacity for ${newClass.capacity} students.`,
    });
  };

  const handleEditClass = async (classId: string, payload: Partial<CreateClassPayload>) => {
    await adminService.editClass(currentSchoolId, classId, payload);
    await loadSchoolData(currentSchoolId);
    showToast({
      type: 'info',
      title: 'Class Updated',
      message: 'Classroom details and teacher assignment saved.',
    });
  };

  // Handlers for Content
  const handleApproveContent = async (contentId: string, approved: boolean, note?: string) => {
    const updated = await adminService.approveContent(currentSchoolId, contentId, approved, note);
    await loadSchoolData(currentSchoolId);
    showToast({
      type: approved ? 'success' : 'info',
      title: approved ? 'Content Approved & Published' : 'Content Archived',
      message: `"${updated.title}" status set to ${updated.status}.`,
    });
  };

  // Security Demonstration: Attempt Cross-School Access
  const handleTestCrossSchoolSecurity = async () => {
    const targetOtherSchoolId =
      currentSchoolId === SCHOOL_A_ID ? SCHOOL_B_ID : SCHOOL_A_ID;
    const targetSchoolName =
      targetOtherSchoolId === SCHOOL_B_ID ? 'Wardha (Maharashtra)' : 'Kalahandi (Odisha)';

    try {
      await adminService.accessCrossSchoolData(currentSchoolId, targetOtherSchoolId);
      // If it didn't throw, something is wrong
      showToast({
        type: 'error',
        title: 'Security Vulnerability Detected',
        message: 'Cross-school access was permitted! Boundary failed.',
      });
    } catch (err: any) {
      showToast({
        type: 'success',
        title: 'Institutional Boundary Enforced',
        message: `Cross-school access blocked: Admin from active school cannot access records of ${targetSchoolName}.`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* INSTITUTIONAL ADMIN HEADER */}
      <div className="p-6 sm:p-7 rounded-3xl bg-slate-900 text-white shadow-elevated flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="brand" size="sm">
              School Administration Hub
            </Badge>
            <span className="text-xs text-slate-300 font-mono">
              UDISE: {overview?.udiseCode || '21260401802'}
            </span>
            <span className="text-xs text-slate-400">• Institutional Scope Only</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {overview?.schoolName || 'Kalahandi Model Residential School'}
          </h1>

          <p className="text-xs sm:text-sm text-slate-300">
            {overview?.district}, {overview?.state} • Administrator{' '}
            <strong className="text-white font-semibold">
              {profile?.full_name || user?.email || 'Rameshwar Patnaik'}
            </strong>
          </p>
        </div>

        {/* Tenancy Controls & Security Verification */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="bg-slate-800/90 border border-slate-700 p-2 rounded-2xl flex items-center gap-2">
            <Building className="w-4 h-4 text-brand-400 shrink-0 ml-1" />
            <select
              value={currentSchoolId}
              onChange={(e) => setCurrentSchoolId(e.target.value)}
              className="bg-transparent text-xs text-slate-200 font-semibold focus:outline-none cursor-pointer pr-2"
              title="Demonstration: Switch School Tenancy Scope"
            >
              <option value={SCHOOL_A_ID} className="bg-slate-900 text-white">
                School A: Kalahandi (Odisha)
              </option>
              <option value={SCHOOL_B_ID} className="bg-slate-900 text-white">
                School B: Wardha (Maharashtra)
              </option>
            </select>
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleTestCrossSchoolSecurity}
            leftIcon={<Lock className="w-3.5 h-3.5 text-emerald-400" />}
            title="Verify that Admin from School A cannot access School B data"
          >
            Verify Isolation
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => loadSchoolData(currentSchoolId)}
            isLoading={isLoading}
            className="text-slate-300 hover:text-white"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* ADMIN NAVIGATION TABS */}
      <div className="flex items-center gap-1.5 p-1 bg-white rounded-2xl border border-slate-200 text-xs font-bold shadow-2xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 py-2 px-3.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Dashboard Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 py-2 px-3.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'students'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Students ({overview?.totalStudents || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('teachers')}
          className={`flex items-center gap-2 py-2 px-3.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'teachers'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5" />
          <span>Teachers ({overview?.totalTeachers || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('classes')}
          className={`flex items-center gap-2 py-2 px-3.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'classes'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Classes ({overview?.totalClasses || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('content')}
          className={`flex items-center gap-2 py-2 px-3.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'content'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <FileCheck className="w-3.5 h-3.5" />
          <span>Content Approval</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex items-center gap-2 py-2 px-3.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'analytics'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>School Analytics</span>
        </button>
      </div>

      {/* TAB CONTENT PANELS */}
      {overview && (
        <div className="space-y-6">
          {/* TAB 1: OVERVIEW & SUBJECT PERFORMANCE */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <AdminOverviewMetrics metrics={overview} />
              <SubjectPerformanceGrid subjects={subjects} />
            </div>
          )}

          {/* TAB 2: STUDENTS MANAGEMENT */}
          {activeTab === 'students' && (
            <StudentsManagementSection
              students={students}
              classes={classes}
              onAddStudent={handleAddStudent}
              onAssignClass={handleAssignStudentClass}
              onUpdateStatus={handleUpdateStudentStatus}
            />
          )}

          {/* TAB 3: TEACHERS MANAGEMENT */}
          {activeTab === 'teachers' && (
            <TeachersManagementSection
              teachers={teachers}
              classes={classes}
              onAddTeacher={handleAddTeacher}
              onAssignClasses={handleAssignTeacherClasses}
              onAssignSubjects={handleAssignTeacherSubjects}
            />
          )}

          {/* TAB 4: CLASSES MANAGEMENT */}
          {activeTab === 'classes' && (
            <ClassesManagementSection
              classes={classes}
              teachers={teachers}
              onCreateClass={handleCreateClass}
              onEditClass={handleEditClass}
            />
          )}

          {/* TAB 5: CONTENT MANAGEMENT & APPROVAL */}
          {activeTab === 'content' && (
            <ContentManagementSection
              content={content}
              onApproveContent={handleApproveContent}
            />
          )}

          {/* TAB 6: SCHOOL ANALYTICS (Real Database Telemetry with Date Filters) */}
          {activeTab === 'analytics' && (
            <div className="animate-in fade-in duration-150">
              <SchoolAnalyticsView schoolId={currentSchoolId} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};
