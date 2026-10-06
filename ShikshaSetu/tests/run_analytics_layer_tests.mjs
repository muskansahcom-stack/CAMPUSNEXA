import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('\n======================================================');
console.log('SHIKSHASETU REAL DATABASE ANALYTICS LAYER VERIFICATION');
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
// TEST 1: Contracts & Types for Analytics Layer
// ----------------------------------------------------
console.log('\n--- TEST 1: Types & Contracts for Analytics Layer ---');

const analyticsTypesPath = path.join(rootDir, 'src', 'types', 'analytics.ts');
assert(fs.existsSync(analyticsTypesPath), 'src/types/analytics.ts exists');
const analyticsTypesContent = fs.readFileSync(analyticsTypesPath, 'utf8');

// Date Range Filter contract
assert(analyticsTypesContent.includes("export type DateFilterPeriod = 'today' | '7d' | '30d' | 'custom'"), 'Defines DateFilterPeriod union');
assert(analyticsTypesContent.includes('export interface DateRangeFilter'), 'Defines DateRangeFilter interface');

// Student Analytics contract (7 core requirements)
const requiredStudentContracts = [
  'export interface StudentAnalyticsData',
  'topicMastery:',
  'learningTime:',
  'quizPerformance:',
  'lessonsCompleted:',
  'improvementOverTime:',
  'streak:',
  'learningConsistency:',
];
for (const req of requiredStudentContracts) {
  assert(analyticsTypesContent.includes(req), `Student analytics contract contains: "${req}"`);
}

// Teacher Analytics contract (5 core requirements)
const requiredTeacherContracts = [
  'export interface TeacherAnalyticsData',
  'classProgress:',
  'topicDifficultyPatterns:',
  'studentsNeedingSupport:',
  'assignmentCompletion:',
  'learningEngagement:',
];
for (const req of requiredTeacherContracts) {
  assert(analyticsTypesContent.includes(req), `Teacher analytics contract contains: "${req}"`);
}

// School Analytics contract (7 core requirements)
const requiredSchoolContracts = [
  'export interface SchoolAnalyticsData',
  'overallProgress:',
  'participation:',
  'completion:',
  'learningTime:',
  'subjectTrends:',
  'contentUsage:',
  'offlineUsage:',
];
for (const req of requiredSchoolContracts) {
  assert(analyticsTypesContent.includes(req), `School analytics contract contains: "${req}"`);
}

// ----------------------------------------------------
// TEST 2: Real Database Analytics Service Implementation
// ----------------------------------------------------
console.log('\n--- TEST 2: Real Database Analytics Service Implementation ---');

const analyticsServicePath = path.join(rootDir, 'src', 'services', 'analyticsService.ts');
assert(fs.existsSync(analyticsServicePath), 'src/services/analyticsService.ts exists');
const analyticsServiceContent = fs.readFileSync(analyticsServicePath, 'utf8');

// Verifying real Supabase table targets
const requiredTables = [
  'student_mastery',
  'assessments',
  'student_progress',
  'student_learning_stats',
  'classes',
];
for (const tbl of requiredTables) {
  assert(analyticsServiceContent.includes(tbl), `Analytics service queries table: "${tbl}"`);
}

// Verifying service API methods
assert(analyticsServiceContent.includes('fetchStudentAnalytics') && analyticsServiceContent.includes('getStudentAnalytics'), 'Service exposes fetchStudentAnalytics and getStudentAnalytics');
assert(analyticsServiceContent.includes('fetchTeacherAnalytics') && analyticsServiceContent.includes('getTeacherAnalytics'), 'Service exposes fetchTeacherAnalytics and getTeacherAnalytics');
assert(analyticsServiceContent.includes('fetchSchoolAnalytics') && analyticsServiceContent.includes('getSchoolAnalytics'), 'Service exposes fetchSchoolAnalytics and getSchoolAnalytics');
assert(analyticsServiceContent.includes('getDateRangeBoundaries'), 'Service exposes getDateRangeBoundaries');

// Verify date boundary calculations for 'today', '7d', '30d', 'custom'
assert(analyticsServiceContent.includes("case 'today':"), 'Boundary handles "today"');
assert(analyticsServiceContent.includes("case '7d':"), 'Boundary handles "7d"');
assert(analyticsServiceContent.includes("case '30d':"), 'Boundary handles "30d"');
assert(analyticsServiceContent.includes("case 'custom':"), 'Boundary handles "custom"');

// ----------------------------------------------------
// TEST 3: Clear Chart Components (Accessible SVG, Non-Overloaded)
// ----------------------------------------------------
console.log('\n--- TEST 3: Clear Chart Components (Non-Overloaded SVG) ---');

const chartDir = path.join(rootDir, 'src', 'components', 'analytics', 'charts');
assert(fs.existsSync(chartDir), 'charts directory exists');

const trendAreaChartPath = path.join(chartDir, 'TrendAreaChart.tsx');
assert(fs.existsSync(trendAreaChartPath), 'TrendAreaChart.tsx exists');
const trendContent = fs.readFileSync(trendAreaChartPath, 'utf8');
assert(trendContent.includes('<svg'), 'TrendAreaChart renders clean responsive SVG');
assert(trendContent.includes('linearGradient'), 'TrendAreaChart uses smooth accessible gradients');

const comparisonBarChartPath = path.join(chartDir, 'ComparisonBarChart.tsx');
assert(fs.existsSync(comparisonBarChartPath), 'ComparisonBarChart.tsx exists');

const consistencyHeatmapPath = path.join(chartDir, 'ConsistencyHeatmap.tsx');
assert(fs.existsSync(consistencyHeatmapPath), 'ConsistencyHeatmap.tsx exists');

const distributionDonutPath = path.join(chartDir, 'DistributionDonut.tsx');
assert(fs.existsSync(distributionDonutPath), 'DistributionDonut.tsx exists');

// DateFilterBar
const dateFilterBarPath = path.join(rootDir, 'src', 'components', 'analytics', 'DateFilterBar.tsx');
assert(fs.existsSync(dateFilterBarPath), 'DateFilterBar.tsx exists');
const dateFilterContent = fs.readFileSync(dateFilterBarPath, 'utf8');
assert(dateFilterContent.includes('Today'), 'DateFilterBar provides "Today" option');
assert(dateFilterContent.includes('7 Days'), 'DateFilterBar provides "7 Days" option');
assert(dateFilterContent.includes('30 Days'), 'DateFilterBar provides "30 Days" option');
assert(dateFilterContent.includes('Custom'), 'DateFilterBar provides "Custom" option');

// ----------------------------------------------------
// TEST 4: Student Analytics View (All 7 Metric Sections)
// ----------------------------------------------------
console.log('\n--- TEST 4: Student Analytics View Requirements ---');

const studentAnalyticsViewPath = path.join(rootDir, 'src', 'components', 'analytics', 'StudentAnalyticsView.tsx');
assert(fs.existsSync(studentAnalyticsViewPath), 'StudentAnalyticsView.tsx exists');
const studentViewContent = fs.readFileSync(studentAnalyticsViewPath, 'utf8');

// Verify all 7 student metrics are rendered
const studentViewMetrics = [
  { name: 'Topic Mastery', match: studentViewContent.includes('Topic Mastery') },
  { name: 'Learning Time', match: studentViewContent.includes('Learning Time') },
  { name: 'Quiz Performance', match: studentViewContent.includes('Quiz Performance') },
  { name: 'Lessons Completed', match: studentViewContent.includes('Lessons Completed') },
  { name: 'Improvement Over Time', match: studentViewContent.includes('Improvement Over Time') },
  { name: 'Streak', match: studentViewContent.includes('streak.currentStreakDays') && studentViewContent.includes('Streak') },
  { name: 'Learning Consistency', match: studentViewContent.includes('Learning Consistency') },
];
for (const m of studentViewMetrics) {
  assert(m.match, `StudentAnalyticsView renders "${m.name}"`);
}

// Verify loading, empty, and error states
assert(studentViewContent.includes('animate-pulse') && studentViewContent.includes('isLoading'), 'Student view has loading state');
assert(studentViewContent.includes('hasNoActivity') && studentViewContent.includes('No Learning Activity in this Date Range'), 'Student view has empty state');
assert(studentViewContent.includes('errorMessage') && studentViewContent.includes('Learning Analytics Unavailable'), 'Student view has error state');

// ----------------------------------------------------
// TEST 5: Teacher Analytics View (All 5 Metric Sections + Support Action)
// ----------------------------------------------------
console.log('\n--- TEST 5: Teacher Analytics View Requirements ---');

const teacherAnalyticsViewPath = path.join(rootDir, 'src', 'components', 'analytics', 'TeacherAnalyticsView.tsx');
assert(fs.existsSync(teacherAnalyticsViewPath), 'TeacherAnalyticsView.tsx exists');
const teacherViewContent = fs.readFileSync(teacherAnalyticsViewPath, 'utf8');

// Verify all 5 teacher metrics
const teacherViewMetrics = [
  { name: 'Class Progress', match: teacherViewContent.includes('Class Progress') },
  { name: 'Topic Difficulty Patterns', match: teacherViewContent.includes('Topic Difficulty Patterns') },
  { name: 'Students Needing Support', match: teacherViewContent.includes('Students Needing Support') },
  { name: 'Assignment Completion', match: teacherViewContent.includes('Assignment Completion') },
  { name: 'Learning Engagement', match: teacherViewContent.includes('Learning Engagement') },
];
for (const m of teacherViewMetrics) {
  assert(m.match, `TeacherAnalyticsView renders "${m.name}"`);
}

// Verify teacher action triggers (Assign Practice, View Student)
assert(teacherViewContent.includes('onAssignRemedialPractice'), 'Supports remedial practice assignment trigger');
assert(teacherViewContent.includes('onViewStudentDetail'), 'Supports viewing individual student detail privately');

// Verify loading, empty, and error states
assert(teacherViewContent.includes('animate-pulse') && teacherViewContent.includes('isLoading'), 'Teacher view has loading state');
assert(teacherViewContent.includes('hasNoActivity') && teacherViewContent.includes('No Classroom Activity Found'), 'Teacher view has empty state');
assert(teacherViewContent.includes('errorMessage') && teacherViewContent.includes('Classroom Analytics Unavailable'), 'Teacher view has error state');

// ----------------------------------------------------
// TEST 6: School Analytics View (All 7 Metric Sections)
// ----------------------------------------------------
console.log('\n--- TEST 6: School Analytics View Requirements ---');

const schoolAnalyticsViewPath = path.join(rootDir, 'src', 'components', 'analytics', 'SchoolAnalyticsView.tsx');
assert(fs.existsSync(schoolAnalyticsViewPath), 'SchoolAnalyticsView.tsx exists');
const schoolViewContent = fs.readFileSync(schoolAnalyticsViewPath, 'utf8');

// Verify all 7 school metrics
const schoolViewMetrics = [
  { name: 'Overall Progress', match: schoolViewContent.includes('Overall Progress') || schoolViewContent.includes('Curriculum Progress') },
  { name: 'Participation', match: schoolViewContent.includes('Participation') },
  { name: 'Completion', match: schoolViewContent.includes('Completion Rate') },
  { name: 'Learning Time', match: schoolViewContent.includes('Learning Time') },
  { name: 'Subject Trends', match: schoolViewContent.includes('Subject Performance Trends') || schoolViewContent.includes('subjectTrends') },
  { name: 'Content Usage', match: schoolViewContent.includes('Content Format Usage') || schoolViewContent.includes('contentUsage') },
  { name: 'Offline Usage', match: schoolViewContent.includes('Rural Offline Usage Telemetry') || schoolViewContent.includes('offlineUsage') },
];
for (const m of schoolViewMetrics) {
  assert(m.match, `SchoolAnalyticsView renders "${m.name}"`);
}

// Verify loading, empty, and error states
assert(schoolViewContent.includes('animate-pulse') && schoolViewContent.includes('isLoading'), 'School view has loading state');
assert(schoolViewContent.includes('hasNoActivity') && schoolViewContent.includes('No Institutional Records in Range'), 'School view has empty state');
assert(schoolViewContent.includes('errorMessage') && schoolViewContent.includes('Institutional Telemetry Error'), 'School view has error state');

// ----------------------------------------------------
// TEST 7: Privacy & Non-Shaming Ethics Standard
// ----------------------------------------------------
console.log('\n--- TEST 7: Privacy & Non-Shaming Ethics Standard ---');

// Verify neither teacher nor school views expose raw private PII (such as phone numbers, addresses, personal bank data)
assert(!teacherViewContent.includes('aadhaar') && !teacherViewContent.includes('phone_number'), 'Teacher analytics does not expose student phone/aadhaar');
assert(!schoolViewContent.includes('aadhaar') && !schoolViewContent.includes('phone_number'), 'School analytics does not expose student phone/aadhaar');

// Verify ethical non-shaming guidance banner in teacher view
assert(teacherViewContent.includes('Confidential Educator View') || teacherViewContent.includes('strictly omitted from educator telemetry'), 'Teacher analytics includes privacy & non-shaming pedagogical guidance');

// Verify positive encouragement framing in student view
assert(studentViewContent.includes('Encouragement-First Educational Architecture') || studentViewContent.includes('Growth Mindset Note'), 'Student analytics emphasizes growth & consistency over punishment');

// ----------------------------------------------------
// TEST 8: Portal Integrations
// ----------------------------------------------------
console.log('\n--- TEST 8: Portal Integrations ---');

// StudentPortal integration
const studentPortalPath = path.join(rootDir, 'src', 'pages', 'StudentPortal.tsx');
const studentPortalContent = fs.readFileSync(studentPortalPath, 'utf8');
assert(studentPortalContent.includes('<StudentAnalyticsView'), 'StudentPortal renders StudentAnalyticsView component');
assert(studentPortalContent.includes("id: 'analytics'"), 'StudentPortal includes analytics tab in tab navigation');

// TeacherPortal integration
const teacherPortalPath = path.join(rootDir, 'src', 'pages', 'TeacherPortal.tsx');
const teacherPortalContent = fs.readFileSync(teacherPortalPath, 'utf8');
assert(teacherPortalContent.includes('<TeacherAnalyticsView'), 'TeacherPortal renders TeacherAnalyticsView component');
assert(teacherPortalContent.includes("activeTab === 'analytics'"), 'TeacherPortal handles analytics tab rendering');

// AdminPortal integration
const adminPortalPath = path.join(rootDir, 'src', 'pages', 'AdminPortal.tsx');
const adminPortalContent = fs.readFileSync(adminPortalPath, 'utf8');
assert(adminPortalContent.includes('<SchoolAnalyticsView'), 'AdminPortal renders SchoolAnalyticsView component');
assert(adminPortalContent.includes("activeTab === 'analytics'"), 'AdminPortal handles analytics tab rendering');

// ----------------------------------------------------
// SUMMARY
// ----------------------------------------------------
console.log('\n======================================================');
console.log(`ANALYTICS LAYER SUITE FINISHED: ${passedTests} passed, ${failedTests} failed`);
console.log('======================================================\n');

if (failedTests > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
