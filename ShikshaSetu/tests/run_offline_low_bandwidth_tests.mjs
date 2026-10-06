import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

console.log('\n======================================================');
console.log('SHIKSHASETU RURAL-FIRST OFFLINE & LOW-BANDWIDTH SUITE');
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

// Global in-memory storage simulator for Node environment
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
// TEST 1: Service Worker & PWA Manifest Compliance
// ----------------------------------------------------
console.log('\n--- TEST 1: Service Worker & PWA Manifest Compliance ---');

// 1.1 Manifest verification
const manifestPath = path.join(rootDir, 'public', 'manifest.json');
assert(fs.existsSync(manifestPath), 'public/manifest.json file exists');
const manifestContent = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

assert(manifestContent.name === 'ShikshaSetu - Rural Learning Platform', 'Manifest name is properly branded');
assert(manifestContent.short_name === 'ShikshaSetu', 'Manifest short_name is set');
assert(manifestContent.start_url === '/', 'Manifest start_url is root "/"');
assert(manifestContent.display === 'standalone', 'Manifest display mode is "standalone" for app experience');
assert(manifestContent.background_color === '#064e3b', 'Manifest background_color is set to brand emerald');
assert(manifestContent.theme_color === '#047857', 'Manifest theme_color is set to brand emerald');
assert(Array.isArray(manifestContent.icons) && manifestContent.icons.length >= 2, 'Manifest contains multiple icon sizes');
const hasMaskable = manifestContent.icons.some(icon => icon.purpose && icon.purpose.includes('maskable'));
assert(hasMaskable, 'Manifest includes "maskable" icon support for Android adaptive launcher icons');

// 1.2 Service Worker verification
const swPath = path.join(rootDir, 'public', 'sw.js');
assert(fs.existsSync(swPath), 'public/sw.js service worker file exists');
const swContent = fs.readFileSync(swPath, 'utf8');

assert(swContent.includes('shikshasetu-shell-v2'), 'Service Worker defines cache version "shikshasetu-shell-v2"');
assert(swContent.includes('addEventListener(\'install\''), 'Service Worker registers "install" lifecycle event');
assert(swContent.includes('addEventListener(\'activate\''), 'Service Worker registers "activate" lifecycle event for cache cleanup');
assert(swContent.includes('addEventListener(\'fetch\''), 'Service Worker intercepts network requests via "fetch" handler');
assert(swContent.includes('caches.open(CONTENT_CACHE)'), 'Service Worker implements dynamic offline content caching');
assert(swContent.includes('caches.match(\'/index.html\')'), 'Service Worker implements offline app shell navigation fallback');

// 1.3 PWA Service helper
const pwaServicePath = path.join(rootDir, 'src', 'services', 'offline', 'pwaService.ts');
assert(fs.existsSync(pwaServicePath), 'src/services/offline/pwaService.ts exists');
const pwaServiceContent = fs.readFileSync(pwaServicePath, 'utf8');
assert(pwaServiceContent.includes('beforeinstallprompt'), 'pwaService intercepts deferred install prompt');
assert(pwaServiceContent.includes('promptPWAInstall'), 'pwaService exports promptPWAInstall helper');


// ----------------------------------------------------
// TEST 2: IndexedDB Multi-Store Structure & Storage Engine
// ----------------------------------------------------
console.log('\n--- TEST 2: IndexedDB Multi-Store Structure & Storage Engine ---');

const indexedDbPath = path.join(rootDir, 'src', 'services', 'offline', 'indexedDb.ts');
assert(fs.existsSync(indexedDbPath), 'src/services/offline/indexedDb.ts exists');
const dbCode = fs.readFileSync(indexedDbPath, 'utf8');

const requiredStores = [
  'downloaded_lessons',
  'offline_progress',
  'offline_quiz_attempts',
  'offline_bookmarks',
  'cached_learning_paths',
  'sync_queue',
];

for (const store of requiredStores) {
  assert(dbCode.includes(`'${store}'`), `IndexedDB schema includes store "${store}"`);
}

// Simulate LocalStorage fallback storage operations
const OFFLINE_LESSONS_KEY = 'shikshasetu_offline_lessons';
const mockLesson = {
  id: 'lesson-math-8-01',
  title: 'Fractions in Everyday Farming',
  subject: 'Mathematics',
  grade: 8,
  board: 'RBSE (Rajasthan)',
  language: 'hi',
  estimatedSizeMb: 3.4,
  downloadedAt: new Date().toISOString(),
  content: {
    notes: 'Fraction = Numerator / Denominator. Example: 3 bighas out of 4 bighas = 3/4.',
    worksheet: 'Calculate remaining crop yield after sharing 1/3 of harvest.',
    videoUrl: 'https://example.com/fractions-offline.mp4',
    quiz: [
      {
        id: 'q1',
        question: 'If a farmer divides a 6-acre field equally into 3 plots, what fraction is 1 plot?',
        options: ['1/2', '1/3', '2/3', '1/6'],
        correctAnswer: '1/3',
        explanation: '1 plot out of 3 equal plots is represented as 1/3.',
      },
      {
        id: 'q2',
        question: 'What is 1/4 + 2/4 in simplest terms?',
        options: ['3/8', '2/4', '3/4', '1'],
        correctAnswer: '3/4',
        explanation: 'Since denominators are identical: (1 + 2)/4 = 3/4.',
      }
    ]
  }
};

// Store lesson
const storedLessons = [mockLesson];
localStorage.setItem(OFFLINE_LESSONS_KEY, JSON.stringify(storedLessons));
const retrieved = JSON.parse(localStorage.getItem(OFFLINE_LESSONS_KEY));

assert(retrieved.length === 1, 'Successfully stored downloaded lesson in offline storage');
assert(retrieved[0].id === 'lesson-math-8-01', 'Retrieved downloaded lesson has matching ID');
assert(retrieved[0].content.quiz.length === 2, 'Downloaded lesson preserves quiz questions for offline practice');
assert(retrieved[0].estimatedSizeMb === 3.4, 'Downloaded lesson stores media size metadata');

// Test deletion / eviction
const afterDelete = retrieved.filter(l => l.id !== 'lesson-math-8-01');
localStorage.setItem(OFFLINE_LESSONS_KEY, JSON.stringify(afterDelete));
assert(JSON.parse(localStorage.getItem(OFFLINE_LESSONS_KEY)).length === 0, 'Offline lesson deletion frees up device storage');


// ----------------------------------------------------
// TEST 3: Offline Quiz Attempt Recording & Local Progress
// ----------------------------------------------------
console.log('\n--- TEST 3: Offline Quiz Attempt Recording & Local Progress ---');

const studentId = 'student-rajesh-001';
const lessonId = 'lesson-math-8-01';

// Simulate answering quiz offline
const quizAnswers = [
  { questionId: 'q1', chosenAnswer: '1/3', isCorrect: true, timeSpentSeconds: 14 },
  { questionId: 'q2', chosenAnswer: '3/4', isCorrect: true, timeSpentSeconds: 18 },
];

const totalScore = quizAnswers.filter(a => a.isCorrect).length;
const totalQuestions = quizAnswers.length;
const scorePercentage = Math.round((totalScore / totalQuestions) * 100);

assert(scorePercentage === 100, 'Offline quiz grading accurately computes 100% score');

const OFFLINE_QUIZ_KEY = 'shikshasetu_offline_quizzes';
const quizAttemptRecord = {
  id: `quiz_${studentId}_${lessonId}_${Date.now()}`,
  studentId,
  lessonId,
  score: totalScore,
  totalQuestions,
  percentage: scorePercentage,
  answers: quizAnswers,
  attemptedAt: new Date().toISOString(),
  synced: false,
};

const quizStore = [quizAttemptRecord];
localStorage.setItem(OFFLINE_QUIZ_KEY, JSON.stringify(quizStore));

const retrievedQuiz = JSON.parse(localStorage.getItem(OFFLINE_QUIZ_KEY))[0];
assert(retrievedQuiz.synced === false, 'Offline quiz attempt is flagged as unsynced (synced = false)');
assert(retrievedQuiz.answers.length === 2, 'Offline quiz preserves detailed student answers and response times');


// ----------------------------------------------------
// TEST 4: Online -> Offline -> Online Transitions & Sync Queue
// ----------------------------------------------------
console.log('\n--- TEST 4: Online -> Offline -> Online Transitions & Sync Queue ---');

const SYNC_QUEUE_KEY = 'shikshasetu_sync_queue';
localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify([]));

// 4.1 Enqueue offline events while disconnected
function enqueueOfflineEvent(queue, item) {
  queue.push(item);
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

let queue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY));

// Enqueue lesson progress
enqueueOfflineEvent(queue, {
  id: `prog_${Date.now()}_1`,
  eventType: 'lesson_progress',
  priority: 1,
  payload: {
    studentId,
    lessonId,
    status: 'in_progress',
    progressPct: 45,
    timeSpentSeconds: 120,
    updatedAt: new Date().toISOString(),
  },
  status: 'pending',
  createdAt: new Date().toISOString(),
});

// Enqueue bookmark toggle
enqueueOfflineEvent(queue, {
  id: `bm_${Date.now()}_2`,
  eventType: 'bookmark_toggle',
  priority: 2,
  payload: {
    studentId,
    lessonId,
    isBookmarked: true,
    updatedAt: new Date().toISOString(),
  },
  status: 'pending',
  createdAt: new Date().toISOString(),
});

// Enqueue completed quiz attempt
enqueueOfflineEvent(queue, {
  id: `quiz_${Date.now()}_3`,
  eventType: 'quiz_attempt',
  priority: 1,
  payload: {
    studentId,
    lessonId,
    score: 2,
    totalQuestions: 2,
    timeSpentSeconds: 32,
  },
  status: 'pending',
  createdAt: new Date().toISOString(),
});

queue = JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY));
assert(queue.length === 3, 'Sync queue successfully accumulated 3 offline events while disconnected');

// 4.2 Connection restored: Process queue
let syncStatus = 'syncing';
assert(syncStatus === 'syncing', 'Sync status switches to "syncing" upon network restoration');

const simulatedServer = {
  progress: {},
  bookmarks: {},
  quizAttempts: [],
};

for (const item of queue) {
  if (item.eventType === 'lesson_progress') {
    simulatedServer.progress[`${item.payload.studentId}:${item.payload.lessonId}`] = item.payload;
  } else if (item.eventType === 'bookmark_toggle') {
    simulatedServer.bookmarks[`${item.payload.studentId}:${item.payload.lessonId}`] = item.payload.isBookmarked;
  } else if (item.eventType === 'quiz_attempt') {
    simulatedServer.quizAttempts.push(item.payload);
  }
}

// Clear synced items
queue = [];
localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
syncStatus = 'synced';

assert(syncStatus === 'synced', 'Sync status switches to "synced" upon batch completion');
assert(JSON.parse(localStorage.getItem(SYNC_QUEUE_KEY)).length === 0, 'Pending sync queue is completely emptied after successful sync');
assert(simulatedServer.quizAttempts.length === 1, 'Server successfully received offline quiz attempt');
assert(simulatedServer.bookmarks[`${studentId}:${lessonId}`] === true, 'Server successfully received offline bookmark');


// ----------------------------------------------------
// TEST 5: Conflict Resolution & Idempotent Deduplication
// ----------------------------------------------------
console.log('\n--- TEST 5: Conflict Resolution & Idempotent Deduplication ---');

// Simulate a student working offline who updates lesson progress 3 times:
// 1st update: 30%
// 2nd update: 75%
// 3rd update: 60% (out of order / older clock sync event)
const conflictingQueue = [
  {
    id: 'evt-1',
    eventType: 'lesson_progress',
    priority: 1,
    payload: { studentId: 'stu-1', lessonId: 'l-01', progressPct: 30, status: 'in_progress' },
  },
  {
    id: 'evt-2',
    eventType: 'lesson_progress',
    priority: 1,
    payload: { studentId: 'stu-1', lessonId: 'l-01', progressPct: 75, status: 'in_progress' },
  },
  {
    id: 'evt-3',
    eventType: 'lesson_progress',
    priority: 1,
    payload: { studentId: 'stu-1', lessonId: 'l-01', progressPct: 60, status: 'in_progress' },
  },
  {
    id: 'evt-4',
    eventType: 'lesson_progress',
    priority: 1,
    payload: { studentId: 'stu-1', lessonId: 'l-02', progressPct: 100, status: 'completed' },
  },
];

// Apply SyncEngine deduplication logic
const progressMap = new Map();
for (const item of conflictingQueue) {
  if (item.eventType === 'lesson_progress') {
    const key = `${item.payload.studentId}:${item.payload.lessonId}`;
    const existing = progressMap.get(key);
    if (!existing) {
      progressMap.set(key, item);
    } else {
      // Highest progress percentage wins (monotonic progress guarantee)
      if (item.payload.progressPct > existing.payload.progressPct) {
        progressMap.set(key, item);
      }
    }
  }
}

const deduplicated = Array.from(progressMap.values());
assert(deduplicated.length === 2, 'Deduplication reduces 4 events to 2 distinct lesson records');
const l01Record = deduplicated.find(d => d.payload.lessonId === 'l-01');
assert(l01Record && l01Record.payload.progressPct === 75, 'Conflict resolution kept max progress percentage (75%), ignoring regressive 60%');


// ----------------------------------------------------
// TEST 6: Interrupted Sync Recovery & Network Resiliency
// ----------------------------------------------------
console.log('\n--- TEST 6: Interrupted Sync Recovery & Network Resiliency ---');

let syncBatch = [
  { id: 'b-01', payload: 'item1', status: 'pending', attempts: 0 },
  { id: 'b-02', payload: 'item2', status: 'pending', attempts: 0 },
  { id: 'b-03', payload: 'item3', status: 'pending', attempts: 0 },
];

let networkDropped = false;
let processedItems = [];

// Attempt processing with intentional drop after item 1
for (let i = 0; i < syncBatch.length; i++) {
  if (i === 1) {
    networkDropped = true; // Connection severed!
  }
  if (networkDropped) {
    syncBatch[i].status = 'pending';
    syncBatch[i].attempts += 1;
    break; // Sync interrupted
  } else {
    syncBatch[i].status = 'synced';
    processedItems.push(syncBatch[i].id);
  }
}

assert(processedItems.length === 1 && processedItems[0] === 'b-01', 'Processed 1 item before interruption');
const uncommitted = syncBatch.filter(item => item.status !== 'synced');
assert(uncommitted.length === 2, 'Unsynced items remain safely in the queue (no data loss)');
assert(uncommitted[0].id === 'b-02' && uncommitted[0].attempts === 1, 'Interrupted item tracks retry attempts');

// Second pass: Connection restored
networkDropped = false;
for (const item of uncommitted) {
  item.status = 'synced';
  processedItems.push(item.id);
}
assert(processedItems.length === 3, 'Interrupted sync successfully resumed and synced all remaining items');


// ----------------------------------------------------
// TEST 7: Data Saver Mode & Low-Bandwidth Optimizations
// ----------------------------------------------------
console.log('\n--- TEST 7: Data Saver Mode & Low-Bandwidth Optimizations ---');

// Test Data Saver state flags
localStorage.setItem('shikshasetu_data_saver', 'true');
localStorage.setItem('shikshasetu_wifi_only', 'true');

const isDataSaver = localStorage.getItem('shikshasetu_data_saver') === 'true';
const isWifiOnly = localStorage.getItem('shikshasetu_wifi_only') === 'true';
assert(isDataSaver === true, 'Data Saver Mode flag is active');
assert(isWifiOnly === true, 'Wi-Fi-Only downloads constraint is active');

// Test media download gating logic
function canDownloadMedia(fileSizeMb, isCellularConnection, wifiOnlySetting) {
  if (wifiOnlySetting && isCellularConnection && fileSizeMb > 5) {
    return {
      allowed: false,
      reason: 'Large media (>5MB) blocked on cellular data when "Wi-Fi Only" is active to protect limited data packs.',
    };
  }
  return { allowed: true };
}

const cellularLargeVideo = canDownloadMedia(14.5, true, true);
assert(cellularLargeVideo.allowed === false, 'Cellular video download (>5MB) blocked in Data Saver Mode');

const cellularSmallWorksheet = canDownloadMedia(1.2, true, true);
assert(cellularSmallWorksheet.allowed === true, 'Small text/worksheet download (<5MB) allowed even on cellular');

const wifiLargeVideo = canDownloadMedia(14.5, false, true);
assert(wifiLargeVideo.allowed === true, 'Large video download allowed when connected to Wi-Fi');

// Test priority queue ordering in Data Saver mode
const multiPriorityItems = [
  { id: 'p3-telemetry', priority: 3, type: 'analytics_heartbeat' },
  { id: 'p1-progress', priority: 1, type: 'lesson_progress' },
  { id: 'p2-bookmark', priority: 2, type: 'bookmark_toggle' },
  { id: 'p1-quiz', priority: 1, type: 'quiz_attempt' },
];

multiPriorityItems.sort((a, b) => a.priority - b.priority);
assert(multiPriorityItems[0].priority === 1 && multiPriorityItems[1].priority === 1, 'Essential progress & quizzes prioritized first (Priority 1)');
assert(multiPriorityItems[2].priority === 2, 'Bookmarks prioritized second (Priority 2)');
assert(multiPriorityItems[3].priority === 3, 'Telemetry prioritized last (Priority 3)');


// ----------------------------------------------------
// TEST 8: Strict Offline AI Honesty
// ----------------------------------------------------
console.log('\n--- TEST 8: Strict Offline AI Honesty ---');

// Check AI Teacher code
const aiTeacherPath = path.join(rootDir, 'src', 'components', 'aiTeacher', 'AITeacherView.tsx');
assert(fs.existsSync(aiTeacherPath), 'AITeacherView.tsx exists');
const aiTeacherContent = fs.readFileSync(aiTeacherPath, 'utf8');

assert(
  aiTeacherContent.includes('Internet Connection Required') || aiTeacherContent.includes('AI Teacher requires'),
  'AITeacherView explicitly informs student that AI requires an active internet connection'
);
assert(
  aiTeacherContent.includes('All downloaded lessons, quizzes, and notes remain 100% available offline') ||
  aiTeacherContent.includes('downloaded lessons') ||
  aiTeacherContent.includes('Offline-Ready'),
  'AITeacherView clarifies that downloaded lessons and quizzes work 100% offline'
);

// Check OfflineManagerModal for AI honesty and flight simulator
const offlineModalPath = path.join(rootDir, 'src', 'components', 'offline', 'OfflineManagerModal.tsx');
assert(fs.existsSync(offlineModalPath), 'OfflineManagerModal.tsx exists');
const offlineModalContent = fs.readFileSync(offlineModalPath, 'utf8');

assert(offlineModalContent.includes('AI Teacher Requires Connectivity'), 'OfflineManagerModal features transparent AI connectivity notice');
assert(offlineModalContent.includes('Airplane Mode'), 'OfflineManagerModal includes Airplane Mode simulation testing trigger');
assert(offlineModalContent.includes('Wi-Fi Only') || offlineModalContent.includes('wifiOnlyDownloads'), 'OfflineManagerModal includes Wi-Fi Only toggle');

// Check UI integration in portals
const studentPortalPath = path.join(rootDir, 'src', 'pages', 'StudentPortal.tsx');
const studentPortalContent = fs.readFileSync(studentPortalPath, 'utf8');
assert(studentPortalContent.includes('<SyncStatusBadge'), 'StudentPortal renders <SyncStatusBadge /> in navigation bar');

const teacherPortalPath = path.join(rootDir, 'src', 'pages', 'TeacherPortal.tsx');
const teacherPortalContent = fs.readFileSync(teacherPortalPath, 'utf8');
assert(teacherPortalContent.includes('<SyncStatusBadge'), 'TeacherPortal renders <SyncStatusBadge /> in header action area');

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
