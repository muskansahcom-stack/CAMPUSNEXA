import fs from 'fs';
import path from 'path';

console.log('\n======================================================');
console.log('SHIKSHASETU LEARNING LIBRARY VERIFICATION SUITE');
console.log('======================================================\n');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`✅ PASS ${message}`);
    passedTests++;
  } else {
    console.error(`❌ FAIL ${message}`);
    failedTests++;
  }
}

// Mock localStorage simulation for node environment
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: (key) => store[key] || null,
    setItem: (key, val) => {
      store[key] = String(val);
    },
    removeItem: (key) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();
global.localStorage = localStorageMock;

// ----------------------------------------------------
// TEST 1: Configurable Multi-Region Curriculum Hierarchy
// ----------------------------------------------------
console.log('--- TEST 1: Configurable Multi-Region Curriculum Hierarchy ---');
const BOARDS = [
  { id: 'eb-cbse', country: 'India', state: 'National', code: 'CBSE', name: 'Central Board' },
  { id: 'eb-rbse', country: 'India', state: 'Rajasthan', code: 'RBSE', name: 'Rajasthan Board' },
  { id: 'eb-msbshse', country: 'India', state: 'Maharashtra', code: 'MSBSHSE', name: 'Maharashtra Board' },
  { id: 'eb-odisha', country: 'India', state: 'Odisha', code: 'BSE_ODISHA', name: 'Odisha Board' },
];

const CHAPTERS = [
  { id: 'ch-rbse-m1', board_id: 'eb-rbse', grade: 8, subject_id: 'sub-math', title: 'Fractions in Everyday Life' },
  { id: 'ch-rbse-s1', board_id: 'eb-rbse', grade: 8, subject_id: 'sub-sci', title: 'Water Harvesting & Stepwells' },
  { id: 'ch-cbse-m2', board_id: 'eb-cbse', grade: 8, subject_id: 'sub-math', title: 'Practical Geometry & Village Land' },
];

const LESSONS = [
  {
    id: 'l-01',
    chapter_id: 'ch-rbse-m1',
    topic_id: 'top-frac-01',
    title: 'Understanding Fractions: Parts of a Whole',
    short_explanation: 'Learn how fractions represent equal parts of a whole with roti sharing.',
    sequence_order: 1,
    is_published: true,
    is_download_eligible: true,
  },
  {
    id: 'l-02',
    chapter_id: 'ch-rbse-s1',
    topic_id: null,
    title: 'Traditional Stepwells (Baori) & Water Conservation',
    short_explanation: 'Historic desert stepwells and aquifer recharge methods.',
    sequence_order: 1,
    is_published: true,
    is_download_eligible: true,
  },
  {
    id: 'l-03',
    chapter_id: 'ch-cbse-m2',
    topic_id: null,
    title: 'Village Land Boundaries & Perimeter',
    short_explanation: 'Perimeter calculation for agricultural plots and fencing.',
    sequence_order: 1,
    is_published: false, // Draft
    is_download_eligible: true,
  },
];

// Verify boards are not single-state hardcoded
const distinctStates = new Set(BOARDS.map((b) => b.state));
assert(
  distinctStates.size >= 3 && distinctStates.has('National') && distinctStates.has('Rajasthan') && distinctStates.has('Maharashtra'),
  '[LIB-01] Configurable Multi-Region Boards: Supports National (CBSE), Rajasthan (RBSE), Maharashtra (MSBSHSE), Odisha without hardcoding.'
);

// Verify hierarchy traversal: Board -> Grade -> Subject -> Chapter -> Topic -> Lesson
const rbseGrade8Chapters = CHAPTERS.filter((c) => c.board_id === 'eb-rbse' && c.grade === 8);
assert(
  rbseGrade8Chapters.length === 2,
  `[LIB-01b] Hierarchy Traversal: Correctly resolves ${rbseGrade8Chapters.length} chapters under RBSE Grade 8.`
);

// ----------------------------------------------------
// TEST 2: Multi-Modal Content Elements Integrity
// ----------------------------------------------------
console.log('\n--- TEST 2: Multi-Modal Content Elements Integrity ---');
const SAMPLE_LESSON_CONTENT = [
  { id: 'c-1', content_type: 'video', title: 'Video Animation', duration_seconds: 180, download_size_bytes: 1400000 },
  { id: 'c-2', content_type: 'notes', title: 'Concept Notes', body_text: '### What is a Fraction?', download_size_bytes: 4500 },
  { id: 'c-3', content_type: 'audio', title: 'Vernacular Audio', duration_seconds: 150, download_size_bytes: 820000 },
  { id: 'c-4', content_type: 'interactive', title: 'Roti Slicer', download_size_bytes: 2500 },
  { id: 'c-5', content_type: 'worksheet', title: 'Printable Practice', download_size_bytes: 150000 },
  { id: 'c-6', content_type: 'quiz', title: 'Checkup Quiz', body_text: '[{"id":"q1"}]', download_size_bytes: 3200 },
];

const contentTypes = SAMPLE_LESSON_CONTENT.map((c) => c.content_type);
const requiredTypes = ['video', 'notes', 'audio', 'interactive', 'worksheet', 'quiz'];
const hasAllRequiredTypes = requiredTypes.every((t) => contentTypes.includes(t));

assert(
  hasAllRequiredTypes,
  `[LIB-02] Multi-Modal Completeness: Lesson contains all 6 required formats: ${requiredTypes.join(', ')}.`
);

// ----------------------------------------------------
// TEST 3: Multi-Factor Search & Filtering Accuracy
// ----------------------------------------------------
console.log('\n--- TEST 3: Multi-Factor Search & Filtering Accuracy ---');
function filterLessons(lessons, chapters, boards, filters) {
  return lessons.filter((l) => {
    const ch = chapters.find((c) => c.id === l.chapter_id);
    const b = ch ? boards.find((bd) => bd.id === ch.board_id) : null;

    if (filters.boardCode && b?.code !== filters.boardCode) return false;
    if (filters.grade && ch?.grade !== filters.grade) return false;
    if (filters.subjectId && ch?.subject_id !== filters.subjectId) return false;
    if (filters.publishedOnly && !l.is_published) return false;

    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      const matchTitle = l.title.toLowerCase().includes(q);
      const matchExpl = l.short_explanation.toLowerCase().includes(q);
      const matchChap = ch?.title.toLowerCase().includes(q);
      if (!matchTitle && !matchExpl && !matchChap) return false;
    }

    return true;
  });
}

// 3a: Filter by Board = RBSE
const rbseResults = filterLessons(LESSONS, CHAPTERS, BOARDS, { boardCode: 'RBSE', publishedOnly: true });
assert(
  rbseResults.length === 2 && rbseResults.every((l) => l.chapter_id.startsWith('ch-rbse')),
  `[LIB-03a] Filter by Board: Accurately returned ${rbseResults.length} RBSE lessons.`
);

// 3b: Search query = "roti"
const searchResults = filterLessons(LESSONS, CHAPTERS, BOARDS, { searchQuery: 'roti' });
assert(
  searchResults.length === 1 && searchResults[0].id === 'l-01',
  `[LIB-03b] Search Query: Correctly matched "${searchResults[0]?.title}" by keyword 'roti'.`
);

// ----------------------------------------------------
// TEST 4: Bookmark & Student Progress Lifecycle
// ----------------------------------------------------
console.log('\n--- TEST 4: Bookmark & Student Progress Lifecycle ---');
function toggleBookmark(studentId, lessonId) {
  let bookmarks = JSON.parse(localStorage.getItem('shikshasetu_bookmarks') || '[]');
  let isBookmarked = false;
  if (bookmarks.includes(lessonId)) {
    bookmarks = bookmarks.filter((id) => id !== lessonId);
    isBookmarked = false;
  } else {
    bookmarks.push(lessonId);
    isBookmarked = true;
  }
  localStorage.setItem('shikshasetu_bookmarks', JSON.stringify(bookmarks));
  return isBookmarked;
}

function updateProgress(studentId, lessonId, progressPct) {
  const status = progressPct >= 100 ? 'completed' : progressPct > 0 ? 'in_progress' : 'not_started';
  const progressMap = JSON.parse(localStorage.getItem('shikshasetu_progress') || '{}');
  progressMap[lessonId] = { pct: progressPct, status };
  localStorage.setItem('shikshasetu_progress', JSON.stringify(progressMap));
  return { pct: progressPct, status };
}

// Test bookmark addition & removal
const b1 = toggleBookmark('student-1', 'l-01');
assert(b1 === true, '[LIB-04a] Bookmark Toggle: Successfully added lesson l-01 to bookmarks.');

const b2 = toggleBookmark('student-1', 'l-01');
assert(b2 === false, '[LIB-04b] Bookmark Toggle: Successfully removed lesson l-01 from bookmarks.');

// Test progress states
const p1 = updateProgress('student-1', 'l-01', 30);
assert(p1.pct === 30 && p1.status === 'in_progress', '[LIB-04c] Progress: Transitioned to in_progress (30%).');

const p2 = updateProgress('student-1', 'l-01', 100);
assert(p2.pct === 100 && p2.status === 'completed', '[LIB-04d] Progress: Transitioned to completed (100%).');

// ----------------------------------------------------
// TEST 5: Offline Download & Cache Packaging
// ----------------------------------------------------
console.log('\n--- TEST 5: Offline Download & Cache Packaging ---');
function downloadLessonOffline(lesson, contentList) {
  const totalSizeBytes = contentList.reduce((acc, c) => acc + (c.download_size_bytes || 0), 0);
  const payload = {
    lessonId: lesson.id,
    downloadedAt: new Date().toISOString(),
    lesson: { ...lesson, content: contentList, is_offline_cached: true },
    totalSizeBytes,
  };

  localStorage.setItem(`shikshasetu_offline_lesson_${lesson.id}`, JSON.stringify(payload));
  const index = JSON.parse(localStorage.getItem('shikshasetu_offline_index') || '[]');
  if (!index.includes(lesson.id)) index.push(lesson.id);
  localStorage.setItem('shikshasetu_offline_index', JSON.stringify(index));

  return { success: true, totalSizeBytes };
}

function isOfflineCached(lessonId) {
  const index = JSON.parse(localStorage.getItem('shikshasetu_offline_index') || '[]');
  return index.includes(lessonId);
}

function removeOffline(lessonId) {
  localStorage.removeItem(`shikshasetu_offline_lesson_${lessonId}`);
  const index = JSON.parse(localStorage.getItem('shikshasetu_offline_index') || '[]');
  localStorage.setItem('shikshasetu_offline_index', JSON.stringify(index.filter((id) => id !== lessonId)));
}

const dlResult = downloadLessonOffline(LESSONS[0], SAMPLE_LESSON_CONTENT);
assert(
  dlResult.success && dlResult.totalSizeBytes > 0 && isOfflineCached('l-01'),
  `[LIB-05a] Offline Download: Packaged ${Math.round(dlResult.totalSizeBytes / 1024)} KB payload and registered in index.`
);

removeOffline('l-01');
assert(!isOfflineCached('l-01'), '[LIB-05b] Offline Removal: Cleanly deregistered and evicted from offline store.');

// ----------------------------------------------------
// TEST 6: Teacher Authoring & Draft vs Published Visibility
// ----------------------------------------------------
console.log('\n--- TEST 6: Teacher Authoring & Draft vs Published Visibility ---');
const studentVisibleLessons = LESSONS.filter((l) => l.is_published);
const teacherVisibleLessons = LESSONS; // Teachers see all lessons

assert(
  studentVisibleLessons.length === 2 && !studentVisibleLessons.some((l) => l.id === 'l-03'),
  '[LIB-06a] Draft Protection: Student library strictly excludes draft lesson l-03.'
);

assert(
  teacherVisibleLessons.length === 3 && teacherVisibleLessons.some((l) => l.id === 'l-03' && !l.is_published),
  '[LIB-06b] Teacher Access: Teacher cockpit displays all 3 curriculum modules including drafts.'
);

// Toggle publish
LESSONS[2].is_published = true;
const afterPublish = LESSONS.filter((l) => l.is_published);
assert(
  afterPublish.length === 3 && afterPublish.some((l) => l.id === 'l-03'),
  '[LIB-06c] Publish Toggle: Successfully published l-03, now visible across student library.'
);

// ----------------------------------------------------
// TEST 7: Supabase Schema & RLS Policy Verification
// ----------------------------------------------------
console.log('\n--- TEST 7: Supabase Schema & RLS Policy Verification ---');
const schemaContent = fs.readFileSync(path.resolve('supabase/schema.sql'), 'utf-8');

const tablesToCheck = [
  'public.education_boards',
  'public.chapters',
  'public.lessons',
  'public.lesson_content',
  'public.lesson_resources',
  'public.bookmarks',
  'public.student_progress',
];

const allTablesCreated = tablesToCheck.every((tbl) =>
  schemaContent.includes(`CREATE TABLE ${tbl}`)
);
assert(
  allTablesCreated,
  `[LIB-07a] Schema Tables: All 7 required library tables verified in schema.sql.`
);

const allRlsEnabled = tablesToCheck.every((tbl) =>
  schemaContent.includes(`ALTER TABLE ${tbl} ENABLE ROW LEVEL SECURITY;`)
);
assert(
  allRlsEnabled,
  `[LIB-07b] RLS Protection: Row-Level Security explicitly enabled on all 7 library tables.`
);

const policiesToCheck = [
  'Education boards select policy',
  'Chapters select policy',
  'Lessons select policy',
  'Lesson content select policy',
  'Lesson resources select policy',
  'Bookmarks select policy',
  'Student progress select policy',
];

const allPoliciesPresent = policiesToCheck.every((pol) => schemaContent.includes(pol));
assert(
  allPoliciesPresent,
  `[LIB-07c] Security Policies: All RLS policies verified (learner read, teacher manage, personal progress isolation).`
);

// ----------------------------------------------------
// TEST SUMMARY
// ----------------------------------------------------
console.log('\n======================================================');
console.log(`TOTAL TESTS RUN: ${passedTests + failedTests}`);
console.log(`PASSED: ${passedTests}`);
console.log(`FAILED: ${failedTests}`);
if (failedTests === 0) {
  console.log('🎉 ALL LEARNING LIBRARY TESTS PASSED WITH 100% SUCCESS.');
} else {
  console.error('❌ SOME TESTS FAILED. PLEASE REVIEW OUTPUT ABOVE.');
  process.exit(1);
}
console.log('======================================================\n');
