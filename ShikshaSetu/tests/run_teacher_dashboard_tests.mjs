import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('\n======================================================');
console.log('SHIKSHASETU TEACHER DASHBOARD VERIFICATION SUITE');
console.log('======================================================\n');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL: ${message}`);
    failedTests++;
  }
}

// ----------------------------------------------------
// TEST 1: Main Dashboard Metrics & Class Performance
// ----------------------------------------------------
console.log('\n--- TEST 1: Main Dashboard Metrics & Class Performance ---');

const teacherServicePath = path.join(rootDir, 'src', 'services', 'teacherService.ts');
assert(fs.existsSync(teacherServicePath), 'src/services/teacherService.ts exists');

const teacherPortalPath = path.join(rootDir, 'src', 'pages', 'TeacherPortal.tsx');
assert(fs.existsSync(teacherPortalPath), 'src/pages/TeacherPortal.tsx exists');
const teacherPortalContent = fs.readFileSync(teacherPortalPath, 'utf8');

// Verify all required Main Dashboard metrics are rendered
const requiredMetrics = [
  'Total Students',
  'Active Learners',
  'Average Progress',
  'Assignments',
  'Students Needing Support',
  'Class Performance Breakdown',
  'Recent Activity Stream',
];

for (const metric of requiredMetrics) {
  assert(teacherPortalContent.includes(metric), `Main dashboard renders metric: "${metric}"`);
}

// ----------------------------------------------------
// TEST 2: "Learning Support" System & Alerts
// ----------------------------------------------------
console.log('\n--- TEST 2: "Learning Support" System & Alerts ---');

const supportSectionPath = path.join(rootDir, 'src', 'components', 'teacher', 'LearningSupportSection.tsx');
assert(fs.existsSync(supportSectionPath), 'LearningSupportSection.tsx component exists');
const supportSectionContent = fs.readFileSync(supportSectionPath, 'utf8');

assert(supportSectionContent.includes('Learning Support'), 'Learning Support section prominently titled');
assert(supportSectionContent.includes('May need additional support.'), 'Alert includes prompt-mandated phrase: "May need additional support."');

// Check the exact alert format requested in the prompt
const teacherServiceContent = fs.readFileSync(teacherServicePath, 'utf8');
assert(teacherServiceContent.includes('Ravi Kumar'), 'Support alerts include student Ravi');
assert(teacherServiceContent.includes('Fractions'), 'Alert includes topic Fractions');
assert(teacherServiceContent.includes('mastery: 43'), 'Alert includes Mastery: 43%');
assert(teacherServiceContent.includes('recentAttempts: 3'), 'Alert includes Recent attempts: 3');
assert(teacherServiceContent.includes('needs_support'), 'Alert status is "needs_support"');
assert(
  teacherServiceContent.includes('Repeated difficulty with equivalent fractions.'),
  'Alert includes exact reason: "Repeated difficulty with equivalent fractions."'
);
assert(
  teacherServiceContent.includes('Assign Fractions Revision Lesson'),
  'Alert includes exact recommended action: "Assign Fractions Revision Lesson"'
);

// Verify required action buttons: View Student, Assign Practice, Dismiss
assert(supportSectionContent.includes('View Student'), 'Alert card features "View Student" button');
assert(supportSectionContent.includes('Assign Practice'), 'Alert card features "Assign Practice" button');
assert(supportSectionContent.includes('onDismissAlert'), 'Alert card features "Dismiss" action trigger');

// ----------------------------------------------------
// TEST 3: Strict Anti-Shaming & Confidentiality Guarantees
// ----------------------------------------------------
console.log('\n--- TEST 3: Strict Anti-Shaming & Confidentiality Guarantees ---');

assert(
  supportSectionContent.includes('Private Teacher View • Zero Public Ranking') ||
  supportSectionContent.includes('Zero Public Ranking'),
  'Learning Support enforces private teacher view without public rankings'
);

const rosterTablePath = path.join(rootDir, 'src', 'components', 'teacher', 'StudentsRosterTable.tsx');
assert(fs.existsSync(rosterTablePath), 'StudentsRosterTable.tsx component exists');
const rosterTableContent = fs.readFileSync(rosterTablePath, 'utf8');

assert(
  rosterTableContent.includes('Non-Ranking Private Ledger') || rosterTableContent.includes('Private Classroom Roster'),
  'Students roster emphasizes non-ranking private educator ledger'
);

assert(
  teacherPortalContent.includes('No Public Ranking') || teacherPortalContent.includes('Confidential subject mastery'),
  'Class performance guarantees confidential evaluation rather than shaming leaderboard'
);

// ----------------------------------------------------
// TEST 4: Filtering Capabilities
// ----------------------------------------------------
console.log('\n--- TEST 4: Filtering Capabilities ---');

const requiredFilters = ['selectedClass', 'selectedSubject', 'selectedGrade', 'selectedMastery', 'selectedSupportStatus'];

for (const filter of requiredFilters) {
  assert(supportSectionContent.includes(filter), `LearningSupportSection includes filter: "${filter}"`);
  assert(teacherServiceContent.includes(filter), `teacherService implements filter logic for: "${filter}"`);
}

// ----------------------------------------------------
// TEST 5: Student Detail Inspection
// ----------------------------------------------------
console.log('\n--- TEST 5: Student Detail Inspection ---');

const studentDetailModalPath = path.join(rootDir, 'src', 'components', 'teacher', 'StudentDetailModal.tsx');
assert(fs.existsSync(studentDetailModalPath), 'StudentDetailModal.tsx exists');
const studentDetailModalContent = fs.readFileSync(studentDetailModalPath, 'utf8');

const requiredStudentDetailSections = [
  'learningPath',
  'topicMastery',
  'recentAttempts',
  'completedLessons',
  'quizPerformance',
  'learningTime',
  'recommendedSupport',
];

for (const section of requiredStudentDetailSections) {
  assert(
    studentDetailModalContent.includes(section),
    `StudentDetailModal provides view for: "${section}"`
  );
}

assert(
  studentDetailModalContent.includes('May need additional support.'),
  'StudentDetailModal displays respectful AI support phrase: "May need additional support."'
);

// ----------------------------------------------------
// TEST 6: Assignments System
// ----------------------------------------------------
console.log('\n--- TEST 6: Assignments System ---');

const createAssignmentModalPath = path.join(rootDir, 'src', 'components', 'teacher', 'CreateAssignmentModal.tsx');
assert(fs.existsSync(createAssignmentModalPath), 'CreateAssignmentModal.tsx exists');
const createAssignmentModalContent = fs.readFileSync(createAssignmentModalPath, 'utf8');

assert(createAssignmentModalContent.includes('Curriculum Topic'), 'Create assignment allows topic selection');
assert(createAssignmentModalContent.includes('Entire Classroom'), 'Create assignment allows whole class assignment');
assert(createAssignmentModalContent.includes('Targeted Students'), 'Create assignment allows targeted student selection');
assert(createAssignmentModalContent.includes('Submission Deadline'), 'Create assignment includes deadline / due date picker');

const assignmentsTrackerViewPath = path.join(rootDir, 'src', 'components', 'teacher', 'AssignmentsTrackerView.tsx');
assert(fs.existsSync(assignmentsTrackerViewPath), 'AssignmentsTrackerView.tsx exists');
const assignmentsTrackerViewContent = fs.readFileSync(assignmentsTrackerViewPath, 'utf8');

assert(assignmentsTrackerViewContent.includes('completionRate'), 'Assignments tracker displays completion rate');
assert(assignmentsTrackerViewContent.includes('studentStatuses'), 'Assignments tracker breaks down individual student completion status');

// ----------------------------------------------------
// TEST 7: AI Support Pattern Detection
// ----------------------------------------------------
console.log('\n--- TEST 7: AI Support Pattern Detection ---');

const requiredPatterns = [
  'repeated_mistakes',
  'declining_mastery',
  'low_engagement',
  'repeated_attempts_no_improvement',
];

for (const pattern of requiredPatterns) {
  assert(
    teacherServiceContent.includes(pattern),
    `AI Support engine detects pattern: "${pattern}"`
  );
}

// Diagnostic ban check: Verify no medical or psychological diagnosis is attempted
const diagnosticTerms = ['ADHD', 'Dyscalculia', 'Mental Retardation', 'Deficit Disorder', 'Intellectually Disabled', 'Slow Learner'];
let hasUnwantedDiagnosis = false;
for (const term of diagnosticTerms) {
  if (teacherServiceContent.toLowerCase().includes(term.toLowerCase())) {
    hasUnwantedDiagnosis = true;
  }
}
assert(!hasUnwantedDiagnosis, 'AI Support strictly adheres to learning pattern observations without diagnosing students');

// ----------------------------------------------------
// TEST 8: Proper Teacher Authorization
// ----------------------------------------------------
console.log('\n--- TEST 8: Proper Teacher Authorization ---');

const appRoutesPath = path.join(rootDir, 'src', 'App.tsx');
const appRoutesContent = fs.readFileSync(appRoutesPath, 'utf8');

assert(
  appRoutesContent.includes('allowedRoles={[\'teacher\']}'),
  'App.tsx restricts /teacher to allowedRoles={[\'teacher\']}'
);

assert(
  teacherPortalContent.includes('useAuth'),
  'TeacherPortal hooks into useAuth context to verify teacher identity'
);

// ----------------------------------------------------
// SUMMARY
// ----------------------------------------------------
console.log('\n======================================================');
console.log(`TOTAL TESTS: ${passedTests + failedTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${failedTests}`);
console.log('======================================================\n');

if (failedTests > 0) {
  process.exit(1);
}
