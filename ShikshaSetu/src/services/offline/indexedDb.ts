/**
 * ShikshaSetu Robust IndexedDB Storage Engine
 * Built for rural students with weak connectivity, intermittent 2G, and shared devices.
 * Zero external dependencies; native IndexedDB API with memory/localStorage fallback.
 */

export const DB_NAME = 'ShikshaSetuDB';
export const DB_VERSION = 3;

export interface OfflineDownloadedLessonRecord {
  id: string;
  lessonId: string;
  title: string;
  short_explanation: string;
  learning_objectives: string[];
  chapter_title: string;
  board_code: string;
  grade: number;
  subject_name: string;
  content: any[];
  resources: any[];
  downloadedAt: string;
  totalSizeBytes: number;
  is_offline: boolean;
}

export interface OfflineProgressRecord {
  id: string; // `${studentId}:${lessonId}`
  studentId: string;
  lessonId: string;
  status: 'not_started' | 'in_progress' | 'completed';
  progressPct: number;
  timeSpentSeconds: number;
  completedAt: string | null;
  updatedAt: string;
}

export interface OfflineQuizAttemptRecord {
  id: string;
  studentId: string;
  lessonId: string;
  questionId: string;
  chosenAnswer: string;
  isCorrect: boolean;
  score: number;
  totalQuestions: number;
  timeSpentSeconds: number;
  attemptedAt: string;
}

export interface OfflineBookmarkRecord {
  id: string; // `${studentId}:${lessonId}`
  studentId: string;
  lessonId: string;
  isBookmarked: boolean;
  updatedAt: string;
}

export interface SyncQueueItem {
  id: string;
  eventType: 'quiz_attempt' | 'lesson_progress' | 'bookmark_toggle' | 'time_spent';
  priority: 1 | 2 | 3; // 1 = Essential (quizzes, completions), 2 = Bookmarks, 3 = Telemetry
  payload: any;
  createdAt: string;
  attempts: number;
  lastAttemptAt?: string;
  error?: string;
  status: 'pending' | 'syncing' | 'failed' | 'synced';
}

export interface CachedLearningPathRecord {
  studentId: string;
  nodes: any[];
  cachedAt: string;
}

// In-memory / localStorage fallback storage for environments where IndexedDB is blocked
const memoryStore: Record<string, Record<string, any>> = {
  downloaded_lessons: {},
  lessons: {},
  topics: {},
  questions: {},
  quiz_templates: {},
  offline_progress: {},
  student_progress: {},
  offline_quiz_attempts: {},
  offline_bookmarks: {},
  cached_learning_paths: {},
  learning_path: {},
  language_resources: {},
  downloaded_media_metadata: {},
  sync_queue: {},
  pending_actions: {},
};

function hasIndexedDb(): boolean {
  return typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB !== null;
}

let dbPromise: Promise<IDBDatabase> | null = null;

export function getDatabase(): Promise<IDBDatabase> {
  if (!hasIndexedDb()) {
    return Promise.reject(new Error('IndexedDB not supported in this environment'));
  }

  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // 1. Downloaded lessons & alias
        if (!db.objectStoreNames.contains('downloaded_lessons')) {
          db.createObjectStore('downloaded_lessons', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('lessons')) {
          db.createObjectStore('lessons', { keyPath: 'id' });
        }

        // 2. Topics & Questions
        if (!db.objectStoreNames.contains('topics')) {
          const store = db.createObjectStore('topics', { keyPath: 'id' });
          store.createIndex('by_subject', 'subjectId', { unique: false });
        }
        if (!db.objectStoreNames.contains('questions')) {
          const store = db.createObjectStore('questions', { keyPath: 'id' });
          store.createIndex('by_topic', 'topic_id', { unique: false });
        }

        // 3. Quiz templates / data
        if (!db.objectStoreNames.contains('quiz_templates')) {
          db.createObjectStore('quiz_templates', { keyPath: 'id' });
        }

        // 4. Offline progress & student progress
        if (!db.objectStoreNames.contains('offline_progress')) {
          const store = db.createObjectStore('offline_progress', { keyPath: 'id' });
          store.createIndex('by_student', 'studentId', { unique: false });
          store.createIndex('by_lesson', 'lessonId', { unique: false });
        }
        if (!db.objectStoreNames.contains('student_progress')) {
          const store = db.createObjectStore('student_progress', { keyPath: 'id' });
          store.createIndex('by_student', 'studentId', { unique: false });
        }

        // 5. Offline quiz attempts & bookmarks
        if (!db.objectStoreNames.contains('offline_quiz_attempts')) {
          const store = db.createObjectStore('offline_quiz_attempts', { keyPath: 'id' });
          store.createIndex('by_student', 'studentId', { unique: false });
          store.createIndex('by_lesson', 'lessonId', { unique: false });
        }
        if (!db.objectStoreNames.contains('offline_bookmarks')) {
          const store = db.createObjectStore('offline_bookmarks', { keyPath: 'id' });
          store.createIndex('by_student', 'studentId', { unique: false });
        }

        // 6. Cached learning paths
        if (!db.objectStoreNames.contains('cached_learning_paths')) {
          db.createObjectStore('cached_learning_paths', { keyPath: 'studentId' });
        }
        if (!db.objectStoreNames.contains('learning_path')) {
          db.createObjectStore('learning_path', { keyPath: 'studentId' });
        }

        // 7. Language resources
        if (!db.objectStoreNames.contains('language_resources')) {
          db.createObjectStore('language_resources', { keyPath: 'langCode' });
        }

        // 8. Downloaded media metadata
        if (!db.objectStoreNames.contains('downloaded_media_metadata')) {
          db.createObjectStore('downloaded_media_metadata', { keyPath: 'id' });
        }

        // 9. Sync queue & pending actions
        if (!db.objectStoreNames.contains('sync_queue')) {
          const store = db.createObjectStore('sync_queue', { keyPath: 'id' });
          store.createIndex('by_status', 'status', { unique: false });
          store.createIndex('by_priority', 'priority', { unique: false });
        }
        if (!db.objectStoreNames.contains('pending_actions')) {
          const store = db.createObjectStore('pending_actions', { keyPath: 'id' });
          store.createIndex('by_status', 'status', { unique: false });
        }
      };

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        reject(request.error);
      };
    } catch (err) {
      reject(err);
    }
  });

  return dbPromise;
}

// ==========================================================
// OBJECT STORE 1: DOWNLOADED LESSONS
// ==========================================================

export async function saveDownloadedLesson(
  lesson: OfflineDownloadedLessonRecord
): Promise<void> {
  if (!hasIndexedDb()) {
    memoryStore.downloaded_lessons[lesson.id] = lesson;
    localStorage.setItem('shikshasetu_idb_lessons', JSON.stringify(memoryStore.downloaded_lessons));
    return;
  }

  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('downloaded_lessons', 'readwrite');
    const store = tx.objectStore('downloaded_lessons');
    const req = store.put(lesson);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getDownloadedLesson(
  id: string
): Promise<OfflineDownloadedLessonRecord | null> {
  if (!hasIndexedDb()) {
    return memoryStore.downloaded_lessons[id] || null;
  }

  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('downloaded_lessons', 'readonly');
    const store = tx.objectStore('downloaded_lessons');
    const req = store.get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllDownloadedLessons(): Promise<OfflineDownloadedLessonRecord[]> {
  if (!hasIndexedDb()) {
    try {
      const saved = localStorage.getItem('shikshasetu_idb_lessons');
      if (saved) memoryStore.downloaded_lessons = JSON.parse(saved);
    } catch {}
    return Object.values(memoryStore.downloaded_lessons);
  }

  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('downloaded_lessons', 'readonly');
    const store = tx.objectStore('downloaded_lessons');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteDownloadedLesson(id: string): Promise<void> {
  if (!hasIndexedDb()) {
    delete memoryStore.downloaded_lessons[id];
    localStorage.setItem('shikshasetu_idb_lessons', JSON.stringify(memoryStore.downloaded_lessons));
    return;
  }

  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('downloaded_lessons', 'readwrite');
    const store = tx.objectStore('downloaded_lessons');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// ==========================================================
// OBJECT STORE 2: OFFLINE PROGRESS & TIME SPENT
// ==========================================================

export async function saveOfflineProgress(
  record: OfflineProgressRecord
): Promise<void> {
  const compositeKey = `${record.studentId}:${record.lessonId}`;
  record.id = compositeKey;

  if (!hasIndexedDb()) {
    memoryStore.offline_progress[compositeKey] = record;
    localStorage.setItem('shikshasetu_idb_progress', JSON.stringify(memoryStore.offline_progress));
    return;
  }

  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_progress', 'readwrite');
    const store = tx.objectStore('offline_progress');
    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getOfflineProgress(
  studentId: string,
  lessonId: string
): Promise<OfflineProgressRecord | null> {
  const compositeKey = `${studentId}:${lessonId}`;

  if (!hasIndexedDb()) {
    return memoryStore.offline_progress[compositeKey] || null;
  }

  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_progress', 'readonly');
    const store = tx.objectStore('offline_progress');
    const req = store.get(compositeKey);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function getAllOfflineProgress(
  studentId: string
): Promise<OfflineProgressRecord[]> {
  if (!hasIndexedDb()) {
    return Object.values(memoryStore.offline_progress).filter((p) => p.studentId === studentId);
  }

  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_progress', 'readonly');
    const store = tx.objectStore('offline_progress');
    const idx = store.index('by_student');
    const req = idx.getAll(studentId);
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

// ==========================================================
// OBJECT STORE 3: OFFLINE QUIZ ATTEMPTS
// ==========================================================

export async function saveOfflineQuizAttempt(
  attempt: OfflineQuizAttemptRecord
): Promise<void> {
  if (!hasIndexedDb()) {
    memoryStore.offline_quiz_attempts[attempt.id] = attempt;
    return;
  }

  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_quiz_attempts', 'readwrite');
    const store = tx.objectStore('offline_quiz_attempts');
    const req = store.put(attempt);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getOfflineQuizAttempts(
  studentId: string
): Promise<OfflineQuizAttemptRecord[]> {
  if (!hasIndexedDb()) {
    return Object.values(memoryStore.offline_quiz_attempts).filter((a) => a.studentId === studentId);
  }

  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_quiz_attempts', 'readonly');
    const store = tx.objectStore('offline_quiz_attempts');
    const idx = store.index('by_student');
    const req = idx.getAll(studentId);
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

// ==========================================================
// OBJECT STORE 4: OFFLINE BOOKMARKS
// ==========================================================

export async function saveOfflineBookmark(
  studentId: string,
  lessonId: string,
  isBookmarked: boolean
): Promise<void> {
  const compositeKey = `${studentId}:${lessonId}`;
  const record: OfflineBookmarkRecord = {
    id: compositeKey,
    studentId,
    lessonId,
    isBookmarked,
    updatedAt: new Date().toISOString(),
  };

  if (!hasIndexedDb()) {
    memoryStore.offline_bookmarks[compositeKey] = record;
    return;
  }

  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_bookmarks', 'readwrite');
    const store = tx.objectStore('offline_bookmarks');
    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getOfflineBookmarks(studentId: string): Promise<string[]> {
  if (!hasIndexedDb()) {
    return Object.values(memoryStore.offline_bookmarks)
      .filter((b) => b.studentId === studentId && b.isBookmarked)
      .map((b) => b.lessonId);
  }

  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_bookmarks', 'readonly');
    const store = tx.objectStore('offline_bookmarks');
    const idx = store.index('by_student');
    const req = idx.getAll(studentId);
    req.onsuccess = () => {
      const records: OfflineBookmarkRecord[] = req.result || [];
      resolve(records.filter((r) => r.isBookmarked).map((r) => r.lessonId));
    };
    req.onerror = () => reject(req.error);
  });
}

// ==========================================================
// OBJECT STORE 5: CACHED LEARNING PATH
// ==========================================================

export async function saveCachedLearningPath(
  studentId: string,
  nodes: any[]
): Promise<void> {
  const record: CachedLearningPathRecord = {
    studentId,
    nodes,
    cachedAt: new Date().toISOString(),
  };

  if (!hasIndexedDb()) {
    memoryStore.cached_learning_paths[studentId] = record;
    localStorage.setItem('shikshasetu_cached_path', JSON.stringify(record));
    return;
  }

  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('cached_learning_paths', 'readwrite');
    const store = tx.objectStore('cached_learning_paths');
    const req = store.put(record);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getCachedLearningPath(
  studentId: string
): Promise<CachedLearningPathRecord | null> {
  if (!hasIndexedDb()) {
    return memoryStore.cached_learning_paths[studentId] || null;
  }

  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('cached_learning_paths', 'readonly');
    const store = tx.objectStore('cached_learning_paths');
    const req = store.get(studentId);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

// ==========================================================
// OBJECT STORE 6: SYNC QUEUE
// ==========================================================

export async function addToSyncQueue(item: SyncQueueItem): Promise<void> {
  if (!hasIndexedDb()) {
    memoryStore.sync_queue[item.id] = item;
    localStorage.setItem('shikshasetu_sync_queue', JSON.stringify(memoryStore.sync_queue));
    return;
  }

  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_queue', 'readwrite');
    const store = tx.objectStore('sync_queue');
    const req = store.put(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getPendingSyncQueue(): Promise<SyncQueueItem[]> {
  if (!hasIndexedDb()) {
    try {
      const raw = localStorage.getItem('shikshasetu_sync_queue');
      if (raw) memoryStore.sync_queue = JSON.parse(raw);
    } catch {}
    return Object.values(memoryStore.sync_queue).filter((i) => i.status !== 'synced');
  }

  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_queue', 'readonly');
    const store = tx.objectStore('sync_queue');
    const req = store.getAll();
    req.onsuccess = () => {
      const all: SyncQueueItem[] = req.result || [];
      resolve(all.filter((i) => i.status !== 'synced'));
    };
    req.onerror = () => reject(req.error);
  });
}

export async function removeSyncQueueItem(id: string): Promise<void> {
  if (!hasIndexedDb()) {
    delete memoryStore.sync_queue[id];
    localStorage.setItem('shikshasetu_sync_queue', JSON.stringify(memoryStore.sync_queue));
    return;
  }

  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_queue', 'readwrite');
    const store = tx.objectStore('sync_queue');
    const req = store.delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function updateSyncQueueItemStatus(
  id: string,
  status: SyncQueueItem['status'],
  error?: string
): Promise<void> {
  if (!hasIndexedDb()) {
    if (memoryStore.sync_queue[id]) {
      memoryStore.sync_queue[id].status = status;
      memoryStore.sync_queue[id].attempts = (memoryStore.sync_queue[id].attempts || 0) + 1;
      memoryStore.sync_queue[id].lastAttemptAt = new Date().toISOString();
      if (error) memoryStore.sync_queue[id].error = error;
      localStorage.setItem('shikshasetu_sync_queue', JSON.stringify(memoryStore.sync_queue));
    }
    return;
  }

  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('sync_queue', 'readwrite');
    const store = tx.objectStore('sync_queue');
    const getReq = store.get(id);

    getReq.onsuccess = () => {
      const item: SyncQueueItem | undefined = getReq.result;
      if (!item) {
        resolve();
        return;
      }
      item.status = status;
      item.attempts = (item.attempts || 0) + 1;
      item.lastAttemptAt = new Date().toISOString();
      if (error) item.error = error;

      const putReq = store.put(item);
      putReq.onsuccess = () => resolve();
      putReq.onerror = () => reject(putReq.error);
    };

    getReq.onerror = () => reject(getReq.error);
  });
}

// ==========================================================
// OBJECT STORE: TOPICS & QUESTIONS
// ==========================================================

export async function saveOfflineTopics(topics: any[]): Promise<void> {
  if (!hasIndexedDb()) {
    topics.forEach((t) => {
      memoryStore.topics[t.id] = t;
    });
    localStorage.setItem('shikshasetu_idb_topics', JSON.stringify(memoryStore.topics));
    return;
  }

  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('topics', 'readwrite');
    const store = tx.objectStore('topics');
    topics.forEach((t) => store.put(t));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getOfflineTopics(): Promise<any[]> {
  if (!hasIndexedDb()) {
    try {
      const raw = localStorage.getItem('shikshasetu_idb_topics');
      if (raw) memoryStore.topics = JSON.parse(raw);
    } catch {}
    return Object.values(memoryStore.topics);
  }

  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('topics', 'readonly');
    const store = tx.objectStore('topics');
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

export async function saveOfflineQuestions(questions: any[]): Promise<void> {
  if (!hasIndexedDb()) {
    questions.forEach((q) => {
      memoryStore.questions[q.id] = q;
    });
    localStorage.setItem('shikshasetu_idb_questions', JSON.stringify(memoryStore.questions));
    return;
  }

  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('questions', 'readwrite');
    const store = tx.objectStore('questions');
    questions.forEach((q) => store.put(q));
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getOfflineQuestionsByTopic(topicId?: string): Promise<any[]> {
  if (!hasIndexedDb()) {
    try {
      const raw = localStorage.getItem('shikshasetu_idb_questions');
      if (raw) memoryStore.questions = JSON.parse(raw);
    } catch {}
    const all = Object.values(memoryStore.questions);
    return topicId ? all.filter((q) => q.topic_id === topicId || q.topic === topicId) : all;
  }

  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('questions', 'readonly');
    const store = tx.objectStore('questions');
    const req = store.getAll();
    req.onsuccess = () => {
      const all: any[] = req.result || [];
      resolve(topicId ? all.filter((q) => q.topic_id === topicId || q.topic === topicId) : all);
    };
    req.onerror = () => reject(req.error);
  });
}

// ==========================================================
// OBJECT STORE: QUIZ TEMPLATES & PENDING ACTIONS
// ==========================================================

export async function saveQuizTemplate(template: { id: string; name: string; template: any }): Promise<void> {
  if (!hasIndexedDb()) {
    memoryStore.quiz_templates[template.id] = template;
    return;
  }
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('quiz_templates', 'readwrite');
    const store = tx.objectStore('quiz_templates');
    const req = store.put(template);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function getQuizTemplate(templateId: string): Promise<any | null> {
  if (!hasIndexedDb()) {
    return memoryStore.quiz_templates[templateId] || null;
  }
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('quiz_templates', 'readonly');
    const store = tx.objectStore('quiz_templates');
    const req = store.get(templateId);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function saveMediaMetadata(meta: { id: string; url: string; sizeBytes: number; mimeType: string }): Promise<void> {
  if (!hasIndexedDb()) {
    memoryStore.downloaded_media_metadata[meta.id] = meta;
    return;
  }
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('downloaded_media_metadata', 'readwrite');
    const store = tx.objectStore('downloaded_media_metadata');
    const req = store.put(meta);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function enqueuePendingAction(action: {
  id: string;
  type: string;
  payload: any;
  status: 'pending' | 'syncing' | 'failed' | 'synced';
  createdAt: string;
}): Promise<void> {
  if (!hasIndexedDb()) {
    memoryStore.pending_actions[action.id] = action;
    return;
  }
  const db = await getDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('pending_actions', 'readwrite');
    const store = tx.objectStore('pending_actions');
    const req = store.put(action);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

