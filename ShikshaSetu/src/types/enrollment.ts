/**
 * RuralLearnAI — Real Student Enrollment, Class & Subject Group System Types
 * Defines the core entities for school-controlled identity, academic years,
 * class & section hierarchy, subjects, subject enrollments, and subject groups.
 */

export type StudentStatus = 'active' | 'inactive' | 'transferred';
export type EnrollmentStatus = 'active' | 'inactive' | 'completed' | 'transferred';
export type AssignmentMethod = 'MANUAL' | 'AI_RECOMMENDED' | 'TEACHER_APPROVED';

export type SubjectGroupTier = 'foundation' | 'core' | 'advanced' | 'custom';

// 1. School
export interface SchoolEntity {
  id: string;
  school_code: string; // e.g. "KRS", "ZPW", "KMRS"
  name: string;        // e.g. "Kasturba Rural School"
  location: string;    // e.g. "Wardha, Maharashtra"
  status: 'active' | 'inactive';
  created_at?: string;
}

// 2. Academic Year
export interface AcademicYearEntity {
  id: string;
  school_id: string;
  name: string;       // e.g. "2026–27", "2025–26"
  start_date: string; // e.g. "2026-06-01"
  end_date: string;   // e.g. "2027-04-30"
  active: boolean;
  created_at?: string;
}

// 3. Class (Grade level)
export interface ClassEntity {
  id: string;
  school_id: string;
  academic_year_id: string;
  grade: number;      // e.g. 7, 8
  name?: string;      // e.g. "Class 7"
  created_at?: string;
}

// 4. Section
export interface SectionEntity {
  id: string;
  class_id: string;
  name: string;       // e.g. "A", "B", "C"
  created_at?: string;
}

// 5. Student (Stable Identity)
export interface StudentEntity {
  id: string;
  user_id?: string;
  profile_id?: string;
  student_id: string;  // e.g. "RLA-KRS-26-7A-024"
  full_name: string;   // e.g. "Jyoti Kumari"
  roll_number: number; // e.g. 24
  date_of_birth?: string;
  preferred_language: string; // "hi", "en", "mr", "te", "ta", "or"
  status: StudentStatus;
  pin_hash: string;
  created_at?: string;
  updated_at?: string;
}

// 6. Student Enrollment (Academic Year & Class Section binding)
export interface StudentEnrollmentEntity {
  id: string;
  student_id: string;
  academic_year_id: string;
  class_id: string;
  section_id: string;
  roll_number: number;
  status: EnrollmentStatus;
  enrolled_at?: string;
  transferred_at?: string;
}

// 7. Subject
export interface SubjectEntity {
  id: string;
  name: string;        // "Mathematics", "Science", "English", "Hindi", "Social Science"
  code: string;        // "MATH", "SCI", "ENG", "HIN", "SOC"
  description?: string;
}

// 8. Subject Enrollment (Student's enrollment in a subject for an academic year)
export interface SubjectEnrollmentEntity {
  id: string;
  student_id: string;
  subject_id: string;
  academic_year_id: string;
  class_id: string;
  section_id: string;
  teacher_id?: string;
  status: 'active' | 'inactive';
}

// 9. Subject Group (e.g. Foundation, Core, Advanced inside a Subject for a Class Section)
export interface SubjectGroupEntity {
  id: string;
  subject_id: string;
  class_id: string;
  section_id: string;
  teacher_id?: string;
  academic_year_id: string;
  name: string;        // "Fractions Foundation", "Foundation", "Core", "Advanced"
  tier: SubjectGroupTier;
  description: string;
  status: 'active' | 'archived';
  created_at?: string;
}

// 10. Subject Group Membership (Student assignment to a group inside a subject)
export interface SubjectGroupMembershipEntity {
  id: string;
  subject_group_id: string;
  student_id: string;
  assigned_by?: string;
  assignment_method: AssignmentMethod;
  created_at: string;
}

// -------------------------------------------------------------
// Combined DTOs & Session Contexts
// -------------------------------------------------------------

export interface EnrolledSubjectInfo {
  subjectId: string;
  subjectName: string;
  subjectCode: string;
  teacherName?: string;
  groupId?: string;
  groupName: string;   // e.g. "Foundation", "Core", "Advanced"
  groupTier: SubjectGroupTier;
  groupDescription: string;
  learningPathTitle: string; // e.g. "Foundation Learning Path"
  masteryPct: number;
}

export interface ActiveStudentSession {
  student: StudentEntity;
  school: SchoolEntity;
  academicYear: AcademicYearEntity;
  classEntity: ClassEntity;
  section: SectionEntity;
  enrollment: StudentEnrollmentEntity;
  enrolledSubjects: EnrolledSubjectInfo[];
  token: string;
}

export interface AIGroupRecommendation {
  studentId: string;
  studentName: string;
  rollNumber: number;
  subjectId: string;
  subjectName: string;
  topicName: string;
  masteryPct: number;
  recentAttempts: number;
  currentGroupName: string;
  suggestedGroupName: 'Foundation' | 'Core' | 'Advanced';
  suggestedTier: SubjectGroupTier;
  rationale: string;
}

export interface StudentTransferPayload {
  studentId: string;
  fromClassId: string;
  fromSectionId: string;
  toClassId: string;
  toSectionId: string;
  newRollNumber: number;
  academicYearId: string;
  reason?: string;
}

export interface AddStudentEnrollmentPayload {
  schoolId: string;
  academicYearId: string;
  classId: string;
  sectionId: string;
  fullName: string;
  rollNumber: number;
  dateOfBirth?: string;
  preferredLanguage?: string;
  pin?: string;
  assignedSubjectIds?: string[];
}
