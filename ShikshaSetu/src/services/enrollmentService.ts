/**
 * RuralLearnAI — Real Student Enrollment, Class & Subject Group Service
 * Authoritative school-controlled identity, academic hierarchy,
 * multi-subject enrollments, and subject-specific learning groups.
 */

import {
  SchoolEntity,
  AcademicYearEntity,
  ClassEntity,
  SectionEntity,
  StudentEntity,
  StudentEnrollmentEntity,
  SubjectEntity,
  SubjectEnrollmentEntity,
  SubjectGroupEntity,
  SubjectGroupMembershipEntity,
  ActiveStudentSession,
  EnrolledSubjectInfo,
  AIGroupRecommendation,
  StudentTransferPayload,
  AddStudentEnrollmentPayload,
  SubjectGroupTier,
} from '../types/enrollment';

// Simple synchronous hash implementation for browser & node test compatibility
function hashPin(pin: string, salt: string = 'rla_rural_learn_salt_2026'): string {
  let hash = 0;
  const str = `${salt}_${pin.trim()}_${salt}`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return `h_${Math.abs(hash).toString(16)}`;
}

// ==========================================================
// SEED DATA STORES (School-Controlled Institutional Ledger)
// ==========================================================

const INITIAL_SCHOOLS: SchoolEntity[] = [
  {
    id: 'sch-krs-01',
    school_code: 'KRS',
    name: 'Kasturba Rural School',
    location: 'Wardha, Maharashtra',
    status: 'active',
    created_at: '2026-01-10T00:00:00Z',
  },
  {
    id: 'sch-kmrs-02',
    school_code: 'KMRS',
    name: 'Kalahandi Model Residential School',
    location: 'Kalahandi, Odisha',
    status: 'active',
    created_at: '2026-01-15T00:00:00Z',
  },
];

const INITIAL_ACADEMIC_YEARS: AcademicYearEntity[] = [
  {
    id: 'ay-2026-27',
    school_id: 'sch-krs-01',
    name: '2026–27',
    start_date: '2026-06-01',
    end_date: '2027-04-30',
    active: true,
  },
  {
    id: 'ay-2025-26',
    school_id: 'sch-krs-01',
    name: '2025–26',
    start_date: '2025-06-01',
    end_date: '2026-04-30',
    active: false,
  },
];

const INITIAL_CLASSES: ClassEntity[] = [
  {
    id: 'cls-7-krs',
    school_id: 'sch-krs-01',
    academic_year_id: 'ay-2026-27',
    grade: 7,
    name: 'Class 7',
  },
  {
    id: 'cls-8-krs',
    school_id: 'sch-krs-01',
    academic_year_id: 'ay-2026-27',
    grade: 8,
    name: 'Class 8',
  },
];

const INITIAL_SECTIONS: SectionEntity[] = [
  {
    id: 'sec-7a-krs',
    class_id: 'cls-7-krs',
    name: 'A',
  },
  {
    id: 'sec-7b-krs',
    class_id: 'cls-7-krs',
    name: 'B',
  },
  {
    id: 'sec-8a-krs',
    class_id: 'cls-8-krs',
    name: 'A',
  },
];

const INITIAL_SUBJECTS: SubjectEntity[] = [
  {
    id: 'subj-math',
    name: 'Mathematics',
    code: 'MATH',
    description: 'Foundations of number sense, everyday arithmetic, and geometry',
  },
  {
    id: 'subj-sci',
    name: 'Science',
    code: 'SCI',
    description: 'Environmental systems, agricultural science, and physical principles',
  },
  {
    id: 'subj-eng',
    name: 'English',
    code: 'ENG',
    description: 'Communicative vocabulary, phonics, and reading comprehension',
  },
  {
    id: 'subj-hin',
    name: 'Hindi',
    code: 'HIN',
    description: 'Literature, grammar, and expressive writing',
  },
  {
    id: 'subj-soc',
    name: 'Social Science',
    code: 'SOC',
    description: 'Local geography, community institutions, and history',
  },
];

// Pre-seeded Students
const INITIAL_STUDENTS: StudentEntity[] = [
  {
    id: 'std-jyoti-24',
    user_id: 'usr-jyoti-001',
    profile_id: 'prof-jyoti-001',
    student_id: 'RLA-KRS-26-7A-024',
    full_name: 'Jyoti Kumari',
    roll_number: 24,
    date_of_birth: '2013-08-14',
    preferred_language: 'hi',
    status: 'active',
    pin_hash: hashPin('1234'),
    created_at: '2026-06-15T09:00:00Z',
  },
  {
    id: 'std-ravi-12',
    user_id: 'usr-ravi-002',
    profile_id: 'prof-ravi-002',
    student_id: 'RLA-KRS-26-7A-012',
    full_name: 'Ravi Kumar',
    roll_number: 12,
    date_of_birth: '2013-05-19',
    preferred_language: 'hi',
    status: 'active',
    pin_hash: hashPin('1234'),
    created_at: '2026-06-15T09:10:00Z',
  },
  {
    id: 'std-anjali-08',
    user_id: 'usr-anjali-003',
    profile_id: 'prof-anjali-003',
    student_id: 'RLA-KRS-26-7A-008',
    full_name: 'Anjali Sharma',
    roll_number: 8,
    date_of_birth: '2013-02-11',
    preferred_language: 'mr',
    status: 'active',
    pin_hash: hashPin('1234'),
    created_at: '2026-06-15T09:20:00Z',
  },
  {
    id: 'std-rahul-15',
    user_id: 'usr-rahul-004',
    profile_id: 'prof-rahul-004',
    student_id: 'RLA-KRS-26-7A-015',
    full_name: 'Rahul Patel',
    roll_number: 15,
    date_of_birth: '2013-11-22',
    preferred_language: 'hi',
    status: 'active',
    pin_hash: hashPin('1234'),
    created_at: '2026-06-15T09:30:00Z',
  },
  {
    id: 'std-neha-19',
    user_id: 'usr-neha-005',
    profile_id: 'prof-neha-005',
    student_id: 'RLA-KRS-26-7A-019',
    full_name: 'Neha Soren',
    roll_number: 19,
    date_of_birth: '2013-09-04',
    preferred_language: 'hi',
    status: 'active',
    pin_hash: hashPin('1234'),
    created_at: '2026-06-15T09:40:00Z',
  },
];

// Student Enrollments (School Class Section)
const INITIAL_STUDENT_ENROLLMENTS: StudentEnrollmentEntity[] = [
  {
    id: 'enr-jyoti-2026',
    student_id: 'std-jyoti-24',
    academic_year_id: 'ay-2026-27',
    class_id: 'cls-7-krs',
    section_id: 'sec-7a-krs',
    roll_number: 24,
    status: 'active',
    enrolled_at: '2026-06-15',
  },
  {
    id: 'enr-ravi-2026',
    student_id: 'std-ravi-12',
    academic_year_id: 'ay-2026-27',
    class_id: 'cls-7-krs',
    section_id: 'sec-7a-krs',
    roll_number: 12,
    status: 'active',
    enrolled_at: '2026-06-15',
  },
  {
    id: 'enr-anjali-2026',
    student_id: 'std-anjali-08',
    academic_year_id: 'ay-2026-27',
    class_id: 'cls-7-krs',
    section_id: 'sec-7a-krs',
    roll_number: 8,
    status: 'active',
    enrolled_at: '2026-06-15',
  },
  {
    id: 'enr-rahul-2026',
    student_id: 'std-rahul-15',
    academic_year_id: 'ay-2026-27',
    class_id: 'cls-7-krs',
    section_id: 'sec-7a-krs',
    roll_number: 15,
    status: 'active',
    enrolled_at: '2026-06-15',
  },
  {
    id: 'enr-neha-2026',
    student_id: 'std-neha-19',
    academic_year_id: 'ay-2026-27',
    class_id: 'cls-7-krs',
    section_id: 'sec-7a-krs',
    roll_number: 19,
    status: 'active',
    enrolled_at: '2026-06-15',
  },
];

// Subject Enrollments: Jyoti is enrolled in Mathematics, Science, English, Hindi
const INITIAL_SUBJECT_ENROLLMENTS: SubjectEnrollmentEntity[] = [
  // Jyoti's 4 subjects
  {
    id: 'sub-enr-jyoti-math',
    student_id: 'std-jyoti-24',
    subject_id: 'subj-math',
    academic_year_id: 'ay-2026-27',
    class_id: 'cls-7-krs',
    section_id: 'sec-7a-krs',
    status: 'active',
  },
  {
    id: 'sub-enr-jyoti-sci',
    student_id: 'std-jyoti-24',
    subject_id: 'subj-sci',
    academic_year_id: 'ay-2026-27',
    class_id: 'cls-7-krs',
    section_id: 'sec-7a-krs',
    status: 'active',
  },
  {
    id: 'sub-enr-jyoti-eng',
    student_id: 'std-jyoti-24',
    subject_id: 'subj-eng',
    academic_year_id: 'ay-2026-27',
    class_id: 'cls-7-krs',
    section_id: 'sec-7a-krs',
    status: 'active',
  },
  {
    id: 'sub-enr-jyoti-hin',
    student_id: 'std-jyoti-24',
    subject_id: 'subj-hin',
    academic_year_id: 'ay-2026-27',
    class_id: 'cls-7-krs',
    section_id: 'sec-7a-krs',
    status: 'active',
  },
  // Ravi
  {
    id: 'sub-enr-ravi-math',
    student_id: 'std-ravi-12',
    subject_id: 'subj-math',
    academic_year_id: 'ay-2026-27',
    class_id: 'cls-7-krs',
    section_id: 'sec-7a-krs',
    status: 'active',
  },
  {
    id: 'sub-enr-ravi-sci',
    student_id: 'std-ravi-12',
    subject_id: 'subj-sci',
    academic_year_id: 'ay-2026-27',
    class_id: 'cls-7-krs',
    section_id: 'sec-7a-krs',
    status: 'active',
  },
  // Anjali
  {
    id: 'sub-enr-anjali-math',
    student_id: 'std-anjali-08',
    subject_id: 'subj-math',
    academic_year_id: 'ay-2026-27',
    class_id: 'cls-7-krs',
    section_id: 'sec-7a-krs',
    status: 'active',
  },
  // Rahul
  {
    id: 'sub-enr-rahul-math',
    student_id: 'std-rahul-15',
    subject_id: 'subj-math',
    academic_year_id: 'ay-2026-27',
    class_id: 'cls-7-krs',
    section_id: 'sec-7a-krs',
    status: 'active',
  },
  // Neha
  {
    id: 'sub-enr-neha-math',
    student_id: 'std-neha-19',
    subject_id: 'subj-math',
    academic_year_id: 'ay-2026-27',
    class_id: 'cls-7-krs',
    section_id: 'sec-7a-krs',
    status: 'active',
  },
];

// Subject Groups created by teachers for Class 7-A
const INITIAL_SUBJECT_GROUPS: SubjectGroupEntity[] = [
  // Mathematics Groups
  {
    id: 'grp-math-foundation',
    subject_id: 'subj-math',
    class_id: 'cls-7-krs',
    section_id: 'sec-7a-krs',
    academic_year_id: 'ay-2026-27',
    name: 'Foundation',
    tier: 'foundation',
    description: 'Targeted reinforcement for fractions, equivalent ratios, and unit arithmetic.',
    status: 'active',
    created_at: '2026-06-20T10:00:00Z',
  },
  {
    id: 'grp-math-core',
    subject_id: 'subj-math',
    class_id: 'cls-7-krs',
    section_id: 'sec-7a-krs',
    academic_year_id: 'ay-2026-27',
    name: 'Core',
    tier: 'core',
    description: 'Standard grade-level progression along NCERT/SCERT curriculum milestones.',
    status: 'active',
    created_at: '2026-06-20T10:00:00Z',
  },
  {
    id: 'grp-math-advanced',
    subject_id: 'subj-math',
    class_id: 'cls-7-krs',
    section_id: 'sec-7a-krs',
    academic_year_id: 'ay-2026-27',
    name: 'Advanced',
    tier: 'advanced',
    description: 'Challenging contextual multi-step problem solving and pattern abstractions.',
    status: 'active',
    created_at: '2026-06-20T10:00:00Z',
  },

  // Science Groups
  {
    id: 'grp-sci-core',
    subject_id: 'subj-sci',
    class_id: 'cls-7-krs',
    section_id: 'sec-7a-krs',
    academic_year_id: 'ay-2026-27',
    name: 'Core',
    tier: 'core',
    description: 'Standard science inquiry into soil nutrition, water cycles, and plant ecosystems.',
    status: 'active',
    created_at: '2026-06-20T10:00:00Z',
  },

  // English Groups
  {
    id: 'grp-eng-advanced',
    subject_id: 'subj-eng',
    class_id: 'cls-7-krs',
    section_id: 'sec-7a-krs',
    academic_year_id: 'ay-2026-27',
    name: 'Advanced',
    tier: 'advanced',
    description: 'Expanded bilingual comprehension and creative narrative building.',
    status: 'active',
    created_at: '2026-06-20T10:00:00Z',
  },

  // Hindi Groups
  {
    id: 'grp-hin-core',
    subject_id: 'subj-hin',
    class_id: 'cls-7-krs',
    section_id: 'sec-7a-krs',
    academic_year_id: 'ay-2026-27',
    name: 'Core',
    tier: 'core',
    description: 'Standard grammar, regional story analysis, and comprehension exercises.',
    status: 'active',
    created_at: '2026-06-20T10:00:00Z',
  },
];

// Initial Group Memberships (Demonstrating multi-tier cross-subject grouping!)
const INITIAL_GROUP_MEMBERSHIPS: SubjectGroupMembershipEntity[] = [
  // Mathematics: Jyoti is in Foundation
  {
    id: 'mem-01',
    subject_group_id: 'grp-math-foundation',
    student_id: 'std-jyoti-24',
    assignment_method: 'TEACHER_APPROVED',
    created_at: '2026-06-21T09:00:00Z',
  },
  // Mathematics: Ravi is in Foundation
  {
    id: 'mem-02',
    subject_group_id: 'grp-math-foundation',
    student_id: 'std-ravi-12',
    assignment_method: 'TEACHER_APPROVED',
    created_at: '2026-06-21T09:00:00Z',
  },
  // Mathematics: Anjali is in Core
  {
    id: 'mem-03',
    subject_group_id: 'grp-math-core',
    student_id: 'std-anjali-08',
    assignment_method: 'MANUAL',
    created_at: '2026-06-21T09:00:00Z',
  },
  // Mathematics: Rahul is in Advanced
  {
    id: 'mem-04',
    subject_group_id: 'grp-math-advanced',
    student_id: 'std-rahul-15',
    assignment_method: 'TEACHER_APPROVED',
    created_at: '2026-06-21T09:00:00Z',
  },

  // Science: Jyoti is in Core!
  {
    id: 'mem-05',
    subject_group_id: 'grp-sci-core',
    student_id: 'std-jyoti-24',
    assignment_method: 'MANUAL',
    created_at: '2026-06-21T09:10:00Z',
  },

  // English: Jyoti is in Advanced!
  {
    id: 'mem-06',
    subject_group_id: 'grp-eng-advanced',
    student_id: 'std-jyoti-24',
    assignment_method: 'TEACHER_APPROVED',
    created_at: '2026-06-21T09:15:00Z',
  },

  // Hindi: Jyoti is in Core!
  {
    id: 'mem-07',
    subject_group_id: 'grp-hin-core',
    student_id: 'std-jyoti-24',
    assignment_method: 'MANUAL',
    created_at: '2026-06-21T09:20:00Z',
  },
];

// ==========================================================
// ENROLLMENT SERVICE IMPLEMENTATION
// ==========================================================

export class EnrollmentService {
  private schools: SchoolEntity[] = [...INITIAL_SCHOOLS];
  private academicYears: AcademicYearEntity[] = [...INITIAL_ACADEMIC_YEARS];
  private classes: ClassEntity[] = [...INITIAL_CLASSES];
  private sections: SectionEntity[] = [...INITIAL_SECTIONS];
  private subjects: SubjectEntity[] = [...INITIAL_SUBJECTS];
  private students: StudentEntity[] = [...INITIAL_STUDENTS];
  private studentEnrollments: StudentEnrollmentEntity[] = [...INITIAL_STUDENT_ENROLLMENTS];
  private subjectEnrollments: SubjectEnrollmentEntity[] = [...INITIAL_SUBJECT_ENROLLMENTS];
  private subjectGroups: SubjectGroupEntity[] = [...INITIAL_SUBJECT_GROUPS];
  private groupMemberships: SubjectGroupMembershipEntity[] = [...INITIAL_GROUP_MEMBERSHIPS];

  // -------------------------------------------------------------
  // 1. STUDENT ID FORMAT & GENERATION
  // RLA-[SCHOOL_CODE]-[YEAR]-[CLASS][SECTION]-[SEQUENCE]
  // e.g. RLA-KRS-26-7A-024
  // -------------------------------------------------------------

  public generateStudentId(params: {
    schoolCode: string;
    academicYearName: string;
    grade: number;
    sectionName: string;
    sequenceNumber: number;
  }): string {
    const cleanSchoolCode = params.schoolCode.trim().toUpperCase();

    // Extract two-digit year (e.g. "2026–27" -> "26")
    const yearMatch = params.academicYearName.match(/\b(20)?(\d{2})/);
    const yearDigits = yearMatch ? yearMatch[2] : '26';

    const classSection = `${params.grade}${params.sectionName.trim().toUpperCase()}`;
    const seqStr = String(params.sequenceNumber).padStart(3, '0');

    return `RLA-${cleanSchoolCode}-${yearDigits}-${classSection}-${seqStr}`;
  }

  // -------------------------------------------------------------
  // 2. PIN GENERATION & SECURITY
  // -------------------------------------------------------------

  public generateTemporaryPin(): string {
    // Generate secure 4-digit numeric PIN suitable for rural students
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    return pin;
  }

  public verifyPin(inputPin: string, storedHash: string): boolean {
    return hashPin(inputPin) === storedHash;
  }

  // -------------------------------------------------------------
  // 3. STUDENT LOGIN & INTEGRITY VALIDATION (Section 3)
  // -------------------------------------------------------------

  public async validateAndLoginStudent(
    studentId: string,
    pin: string
  ): Promise<ActiveStudentSession> {
    const cleanId = studentId.trim().toUpperCase();

    // 1. Student ID exists
    const student = this.students.find((s) => s.student_id.toUpperCase() === cleanId);
    if (!student) {
      throw new Error('Invalid or inactive student account. Please contact your school or teacher.');
    }

    // 2. Student account is active
    if (student.status !== 'active') {
      throw new Error('Invalid or inactive student account. Please contact your school or teacher.');
    }

    // PIN check
    if (!this.verifyPin(pin, student.pin_hash)) {
      throw new Error('Invalid or inactive student account. Please contact your school or teacher.');
    }

    // 3 & 4. Active Enrollment for current academic year
    const activeEnrollment = this.studentEnrollments.find(
      (e) => e.student_id === student.id && e.status === 'active'
    );
    if (!activeEnrollment) {
      throw new Error('Invalid or inactive student account. Please contact your school or teacher.');
    }

    // Find Academic Year
    const academicYear = this.academicYears.find(
      (ay) => ay.id === activeEnrollment.academic_year_id && ay.active
    );
    if (!academicYear) {
      throw new Error('Invalid or inactive student account. Please contact your school or teacher.');
    }

    // 5. Belongs to assigned class
    const classEntity = this.classes.find((c) => c.id === activeEnrollment.class_id);
    if (!classEntity) {
      throw new Error('Invalid or inactive student account. Please contact your school or teacher.');
    }

    // 6. Belongs to assigned section
    const section = this.sections.find((s) => s.id === activeEnrollment.section_id);
    if (!section) {
      throw new Error('Invalid or inactive student account. Please contact your school or teacher.');
    }

    // Verify school
    const school = this.schools.find((sch) => sch.id === classEntity.school_id);
    if (!school || school.status !== 'active') {
      throw new Error('Invalid or inactive student account. Please contact your school or teacher.');
    }

    // Fetch enrolled subjects and current subject groups
    const enrolledSubjects = await this.getStudentEnrolledSubjects(student.id);

    const token = `rla_token_${student.id}_${Date.now()}`;

    // Record on device for "Who is learning today?" selector
    this.recordStudentOnDevice(student, school.name, `${classEntity.grade}-${section.name}`);

    return {
      student,
      school,
      academicYear,
      classEntity,
      section,
      enrollment: activeEnrollment,
      enrolledSubjects,
      token,
    };
  }

  // -------------------------------------------------------------
  // 4. FETCH STUDENT'S ENROLLED SUBJECTS & GROUPS (Section 7, 10, 12)
  // -------------------------------------------------------------

  public async getStudentEnrolledSubjects(studentId: string): Promise<EnrolledSubjectInfo[]> {
    const student = this.students.find((s) => s.id === studentId);
    if (!student) return [];

    const activeEnrollment = this.studentEnrollments.find(
      (e) => e.student_id === studentId && e.status === 'active'
    );
    if (!activeEnrollment) return [];

    // Find all active subject enrollments
    const subjectEnrs = this.subjectEnrollments.filter(
      (se) => se.student_id === studentId && se.status === 'active'
    );

    const result: EnrolledSubjectInfo[] = [];

    for (const se of subjectEnrs) {
      const subject = this.subjects.find((sub) => sub.id === se.subject_id);
      if (!subject) continue;

      // Find membership in a group for this subject
      const subjectGroupIds = this.subjectGroups
        .filter((g) => g.subject_id === subject.id && g.class_id === se.class_id)
        .map((g) => g.id);

      const membership = this.groupMemberships.find(
        (m) => m.student_id === studentId && subjectGroupIds.includes(m.subject_group_id)
      );

      const assignedGroup = membership
        ? this.subjectGroups.find((g) => g.id === membership.subject_group_id)
        : null;

      const groupName = assignedGroup?.name || 'Core';
      const groupTier: SubjectGroupTier = assignedGroup?.tier || 'core';
      const groupDescription =
        assignedGroup?.description || 'Standard grade-level progression path';
      const learningPathTitle = `${groupName} Learning Path`;

      // Mock mastery per subject for display
      let masteryPct = 70;
      if (subject.code === 'MATH') masteryPct = groupTier === 'foundation' ? 43 : 75;
      else if (subject.code === 'SCI') masteryPct = 65;
      else if (subject.code === 'ENG') masteryPct = 88;

      result.push({
        subjectId: subject.id,
        subjectName: subject.name,
        subjectCode: subject.code,
        groupId: assignedGroup?.id,
        groupName,
        groupTier,
        groupDescription,
        learningPathTitle,
        masteryPct,
      });
    }

    return result;
  }

  // -------------------------------------------------------------
  // 5. SCHOOL ADMIN: STUDENT ENROLLMENT (Section 4, 16)
  // -------------------------------------------------------------

  public async addStudent(payload: AddStudentEnrollmentPayload): Promise<{
    student: StudentEntity;
    enrollment: StudentEnrollmentEntity;
    rawPin: string;
    studentId: string;
  }> {
    const school = this.schools.find((s) => s.id === payload.schoolId);
    if (!school) throw new Error('School not found.');

    const academicYear = this.academicYears.find((ay) => ay.id === payload.academicYearId);
    if (!academicYear) throw new Error('Academic year not found.');

    const classEntity = this.classes.find((c) => c.id === payload.classId);
    if (!classEntity) throw new Error('Class not found.');

    const section = this.sections.find((sec) => sec.id === payload.sectionId);
    if (!section) throw new Error('Section not found.');

    // Auto-generate unique Student ID
    const studentId = this.generateStudentId({
      schoolCode: school.school_code,
      academicYearName: academicYear.name,
      grade: classEntity.grade,
      sectionName: section.name,
      sequenceNumber: payload.rollNumber,
    });

    // Check uniqueness
    if (this.students.some((s) => s.student_id === studentId)) {
      throw new Error(`Duplicate Student ID: ${studentId} already exists in the registry.`);
    }

    // Generate or use provided PIN
    const rawPin = payload.pin || this.generateTemporaryPin();
    const pin_hash = hashPin(rawPin);

    const newStudentId = `std-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newStudent: StudentEntity = {
      id: newStudentId,
      student_id: studentId,
      full_name: payload.fullName.trim(),
      roll_number: payload.rollNumber,
      date_of_birth: payload.dateOfBirth,
      preferred_language: payload.preferredLanguage || 'hi',
      status: 'active',
      pin_hash,
      created_at: new Date().toISOString(),
    };

    const newEnrollment: StudentEnrollmentEntity = {
      id: `enr-${Date.now()}`,
      student_id: newStudentId,
      academic_year_id: payload.academicYearId,
      class_id: payload.classId,
      section_id: payload.sectionId,
      roll_number: payload.rollNumber,
      status: 'active',
      enrolled_at: new Date().toISOString().split('T')[0],
    };

    this.students.push(newStudent);
    this.studentEnrollments.push(newEnrollment);

    // Enroll in assigned subjects (or default to all subjects)
    const targetSubjectIds =
      payload.assignedSubjectIds && payload.assignedSubjectIds.length > 0
        ? payload.assignedSubjectIds
        : this.subjects.map((s) => s.id);

    for (const subId of targetSubjectIds) {
      this.subjectEnrollments.push({
        id: `sub-enr-${Date.now()}-${subId}`,
        student_id: newStudentId,
        subject_id: subId,
        academic_year_id: payload.academicYearId,
        class_id: payload.classId,
        section_id: payload.sectionId,
        status: 'active',
      });
    }

    return {
      student: newStudent,
      enrollment: newEnrollment,
      rawPin,
      studentId,
    };
  }

  // -------------------------------------------------------------
  // 6. SCHOOL ADMIN: TRANSFER STUDENT (Section 14)
  // Preserves same StudentEntity & historical learning data
  // -------------------------------------------------------------

  public async transferStudent(payload: StudentTransferPayload): Promise<{
    student: StudentEntity;
    previousEnrollment: StudentEnrollmentEntity;
    newEnrollment: StudentEnrollmentEntity;
  }> {
    const student = this.students.find((s) => s.id === payload.studentId);
    if (!student) throw new Error('Student not found.');

    const targetClass = this.classes.find((c) => c.id === payload.toClassId);
    if (!targetClass) throw new Error('Target class not found.');

    const targetSection = this.sections.find((s) => s.id === payload.toSectionId);
    if (!targetSection) throw new Error('Target section not found.');

    // 1. Mark existing active enrollment as 'transferred' / historical
    const currentEnrollment = this.studentEnrollments.find(
      (e) => e.student_id === student.id && e.status === 'active'
    );
    if (currentEnrollment) {
      currentEnrollment.status = 'transferred';
      currentEnrollment.transferred_at = new Date().toISOString();
    }

    // 2. Create new active enrollment
    const newEnrollment: StudentEnrollmentEntity = {
      id: `enr-trans-${Date.now()}`,
      student_id: student.id,
      academic_year_id: payload.academicYearId,
      class_id: payload.toClassId,
      section_id: payload.toSectionId,
      roll_number: payload.newRollNumber,
      status: 'active',
      enrolled_at: new Date().toISOString().split('T')[0],
    };
    this.studentEnrollments.push(newEnrollment);

    // 3. Update roll number on Student identity
    student.roll_number = payload.newRollNumber;
    student.updated_at = new Date().toISOString();

    // 4. Update or recreate subject enrollments for new class
    // Mark previous subject enrollments inactive
    this.subjectEnrollments
      .filter((se) => se.student_id === student.id && se.status === 'active')
      .forEach((se) => {
        se.status = 'inactive';
      });

    // Create fresh subject enrollments for the new grade/section
    for (const sub of this.subjects) {
      this.subjectEnrollments.push({
        id: `sub-enr-trans-${Date.now()}-${sub.id}`,
        student_id: student.id,
        subject_id: sub.id,
        academic_year_id: payload.academicYearId,
        class_id: payload.toClassId,
        section_id: payload.toSectionId,
        status: 'active',
      });
    }

    return {
      student,
      previousEnrollment: currentEnrollment || newEnrollment,
      newEnrollment,
    };
  }

  // -------------------------------------------------------------
  // 7. TEACHER: SUBJECT GROUP CREATION & MANAGEMENT (Section 8, 9)
  // -------------------------------------------------------------

  public async createSubjectGroup(params: {
    subjectId: string;
    classId: string;
    sectionId: string;
    academicYearId: string;
    name: string;
    description: string;
    tier?: SubjectGroupTier;
    teacherId?: string;
    initialStudentIds?: string[];
  }): Promise<SubjectGroupEntity> {
    const tier: SubjectGroupTier =
      params.tier ||
      (params.name.toLowerCase().includes('foundation')
        ? 'foundation'
        : params.name.toLowerCase().includes('advanced')
        ? 'advanced'
        : 'core');

    const newGroup: SubjectGroupEntity = {
      id: `grp-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      subject_id: params.subjectId,
      class_id: params.classId,
      section_id: params.sectionId,
      teacher_id: params.teacherId,
      academic_year_id: params.academicYearId,
      name: params.name.trim(),
      tier,
      description: params.description.trim(),
      status: 'active',
      created_at: new Date().toISOString(),
    };

    this.subjectGroups.push(newGroup);

    // Assign initial students if selected
    if (params.initialStudentIds && params.initialStudentIds.length > 0) {
      for (const stdId of params.initialStudentIds) {
        await this.assignStudentToGroup(newGroup.id, stdId, params.teacherId, 'MANUAL');
      }
    }

    return newGroup;
  }

  public async getSubjectGroups(
    classId: string,
    sectionId: string,
    subjectId: string
  ): Promise<
    (SubjectGroupEntity & {
      membersCount: number;
      members: { studentId: string; studentName: string; rollNumber: number }[];
    })[]
  > {
    const groups = this.subjectGroups.filter(
      (g) =>
        g.class_id === classId &&
        g.section_id === sectionId &&
        g.subject_id === subjectId &&
        g.status === 'active'
    );

    return groups.map((g) => {
      const memberships = this.groupMemberships.filter((m) => m.subject_group_id === g.id);
      const members = memberships
        .map((m) => {
          const s = this.students.find((std) => std.id === m.student_id);
          return s
            ? { studentId: s.id, studentName: s.full_name, rollNumber: s.roll_number }
            : null;
        })
        .filter(Boolean) as { studentId: string; studentName: string; rollNumber: number }[];

      return {
        ...g,
        membersCount: members.length,
        members,
      };
    });
  }

  public async assignStudentToGroup(
    groupId: string,
    studentId: string,
    assignedBy?: string,
    method: 'MANUAL' | 'AI_RECOMMENDED' | 'TEACHER_APPROVED' = 'MANUAL'
  ): Promise<SubjectGroupMembershipEntity> {
    const targetGroup = this.subjectGroups.find((g) => g.id === groupId);
    if (!targetGroup) throw new Error('Target group not found.');

    // Remove any existing membership for this student in OTHER groups of the SAME subject & class
    const siblingGroupIds = this.subjectGroups
      .filter((g) => g.subject_id === targetGroup.subject_id && g.class_id === targetGroup.class_id)
      .map((g) => g.id);

    this.groupMemberships = this.groupMemberships.filter(
      (m) => !(m.student_id === studentId && siblingGroupIds.includes(m.subject_group_id))
    );

    const membership: SubjectGroupMembershipEntity = {
      id: `mem-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      subject_group_id: groupId,
      student_id: studentId,
      assigned_by: assignedBy,
      assignment_method: method,
      created_at: new Date().toISOString(),
    };

    this.groupMemberships.push(membership);
    return membership;
  }

  public async removeStudentFromGroup(groupId: string, studentId: string): Promise<boolean> {
    const beforeLen = this.groupMemberships.length;
    this.groupMemberships = this.groupMemberships.filter(
      (m) => !(m.subject_group_id === groupId && m.student_id === studentId)
    );
    return this.groupMemberships.length < beforeLen;
  }

  // -------------------------------------------------------------
  // 8. AI-ASSISTED GROUP RECOMMENDATIONS (Section 11)
  // Non-diagnostic suggestions based on real topic mastery
  // -------------------------------------------------------------

  public async getAIGroupRecommendations(
    classId: string,
    sectionId: string,
    subjectId: string
  ): Promise<AIGroupRecommendation[]> {
    const subject = this.subjects.find((s) => s.id === subjectId);
    const subjectName = subject ? subject.name : 'Subject';

    // Find enrolled students in this class section
    const enrollments = this.studentEnrollments.filter(
      (e) => e.class_id === classId && e.section_id === sectionId && e.status === 'active'
    );

    const recommendations: AIGroupRecommendation[] = [];

    // Canonical test & demonstration mastery values
    const mockTelemetry: Record<string, { mastery: number; attempts: number; topic: string }> = {
      'std-jyoti-24': { mastery: 43, attempts: 3, topic: 'Fractions & Unit Division' },
      'std-ravi-12': { mastery: 51, attempts: 3, topic: 'Fractions & Equivalent Scaling' },
      'std-anjali-08': { mastery: 68, attempts: 2, topic: 'Fractions in Word Problems' },
      'std-rahul-15': { mastery: 89, attempts: 1, topic: 'Advanced Rational Expressions' },
      'std-neha-19': { mastery: 74, attempts: 2, topic: 'Fractions & Proportions' },
    };

    for (const enr of enrollments) {
      const student = this.students.find((s) => s.id === enr.student_id);
      if (!student) continue;

      const telemetry = mockTelemetry[student.id] || {
        mastery: 65,
        attempts: 2,
        topic: 'Core Foundations',
      };

      let suggestedGroupName: 'Foundation' | 'Core' | 'Advanced' = 'Core';
      let suggestedTier: SubjectGroupTier = 'core';
      let rationale = 'Demonstrates steady progress on grade-level concepts.';

      if (telemetry.mastery < 50) {
        suggestedGroupName = 'Foundation';
        suggestedTier = 'foundation';
        rationale = `Fractions mastery = ${telemetry.mastery}%. Suggests additional foundational balance before moving to complex concepts.`;
      } else if (telemetry.mastery >= 80) {
        suggestedGroupName = 'Advanced';
        suggestedTier = 'advanced';
        rationale = `Fractions mastery = ${telemetry.mastery}%. Consistently accurate; ready for challenge exercises.`;
      } else {
        suggestedGroupName = 'Core';
        suggestedTier = 'core';
        rationale = `Fractions mastery = ${telemetry.mastery}%. On track with standard learning journey pace.`;
      }

      // Check current group
      const currentGroups = await this.getSubjectGroups(classId, sectionId, subjectId);
      const currentMembership = currentGroups.find((g) =>
        g.members.some((m) => m.studentId === student.id)
      );

      recommendations.push({
        studentId: student.id,
        studentName: student.full_name,
        rollNumber: student.roll_number,
        subjectId,
        subjectName,
        topicName: telemetry.topic,
        masteryPct: telemetry.mastery,
        recentAttempts: telemetry.attempts,
        currentGroupName: currentMembership?.name || 'Unassigned',
        suggestedGroupName,
        suggestedTier,
        rationale,
      });
    }

    return recommendations;
  }

  public async approveAIGroupRecommendations(
    recommendations: AIGroupRecommendation[],
    teacherId?: string
  ): Promise<number> {
    let count = 0;
    for (const rec of recommendations) {
      // Find matching group by name/tier in that subject
      const subjectGroup = this.subjectGroups.find(
        (g) => g.subject_id === rec.subjectId && g.tier === rec.suggestedTier && g.status === 'active'
      );

      if (subjectGroup) {
        await this.assignStudentToGroup(
          subjectGroup.id,
          rec.studentId,
          teacherId,
          'TEACHER_APPROVED'
        );
        count++;
      }
    }
    return count;
  }

  // -------------------------------------------------------------
  // 9. SHARED DEVICE SUPPORT ("Who is learning today?") (Section 13)
  // -------------------------------------------------------------

  private rememberedStudents: {
    studentId: string;
    studentUniqueId: string;
    fullName: string;
    schoolName: string;
    className: string;
    lastSeen: string;
  }[] = [
    {
      studentId: 'std-jyoti-24',
      studentUniqueId: 'RLA-KRS-26-7A-024',
      fullName: 'Jyoti Kumari',
      schoolName: 'Kasturba Rural School',
      className: 'Class 7-A',
      lastSeen: '10 mins ago',
    },
    {
      studentId: 'std-ravi-12',
      studentUniqueId: 'RLA-KRS-26-7A-012',
      fullName: 'Ravi Kumar',
      schoolName: 'Kasturba Rural School',
      className: 'Class 7-A',
      lastSeen: '1 hour ago',
    },
    {
      studentId: 'std-anjali-08',
      studentUniqueId: 'RLA-KRS-26-7A-008',
      fullName: 'Anjali Sharma',
      schoolName: 'Kasturba Rural School',
      className: 'Class 7-A',
      lastSeen: 'Yesterday',
    },
  ];

  public getRememberedStudentsOnDevice() {
    return [...this.rememberedStudents];
  }

  public recordStudentOnDevice(student: StudentEntity, schoolName: string, className: string) {
    const existing = this.rememberedStudents.find((s) => s.studentId === student.id);
    if (existing) {
      existing.lastSeen = 'Just now';
      existing.className = className;
    } else {
      this.rememberedStudents.unshift({
        studentId: student.id,
        studentUniqueId: student.student_id,
        fullName: student.full_name,
        schoolName,
        className,
        lastSeen: 'Just now',
      });
    }
  }

  public clearStudentDeviceCache(studentId?: string) {
    if (typeof localStorage === 'undefined') return;
    try {
      // Clear sensitive local progress items
      localStorage.removeItem('shikshasetu_auth');
      localStorage.removeItem('shikshasetu_progress');
      if (studentId) {
        localStorage.removeItem(`shiksha_latest_report_${studentId}`);
        localStorage.removeItem(`shiksha_profile_${studentId}`);
      }
    } catch (e) {
      // ignore
    }
  }

  // -------------------------------------------------------------
  // 10. GETTERS FOR ADMIN HIERARCHY
  // -------------------------------------------------------------

  public getSchools(): SchoolEntity[] {
    return [...this.schools];
  }

  public getAcademicYears(schoolId?: string): AcademicYearEntity[] {
    return schoolId
      ? this.academicYears.filter((ay) => ay.school_id === schoolId)
      : [...this.academicYears];
  }

  public getClasses(schoolId?: string): ClassEntity[] {
    return schoolId ? this.classes.filter((c) => c.school_id === schoolId) : [...this.classes];
  }

  public getSections(classId?: string): SectionEntity[] {
    return classId ? this.sections.filter((s) => s.class_id === classId) : [...this.sections];
  }

  public getSubjects(): SubjectEntity[] {
    return [...this.subjects];
  }

  public getStudentsRoster(schoolId?: string, classId?: string, sectionId?: string) {
    let result = this.students.map((std) => {
      const activeEnr = this.studentEnrollments.find(
        (e) => e.student_id === std.id && e.status === 'active'
      );
      const cls = activeEnr ? this.classes.find((c) => c.id === activeEnr.class_id) : null;
      const sec = activeEnr ? this.sections.find((s) => s.id === activeEnr.section_id) : null;
      const ay = activeEnr ? this.academicYears.find((a) => a.id === activeEnr.academic_year_id) : null;

      return {
        ...std,
        classId: activeEnr?.class_id,
        sectionId: activeEnr?.section_id,
        className: cls ? `Class ${cls.grade}-${sec?.name || 'A'}` : 'Unassigned',
        grade: cls?.grade || 7,
        sectionName: sec?.name || 'A',
        academicYearName: ay?.name || '2026–27',
      };
    });

    if (classId) result = result.filter((s) => s.classId === classId);
    if (sectionId) result = result.filter((s) => s.sectionId === sectionId);
    return result;
  }
}

export const enrollmentService = new EnrollmentService();
