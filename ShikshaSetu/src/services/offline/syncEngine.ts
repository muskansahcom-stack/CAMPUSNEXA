import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import {
  SyncQueueItem,
  addToSyncQueue,
  getPendingSyncQueue,
  removeSyncQueueItem,
  updateSyncQueueItemStatus,
  saveOfflineProgress,
  saveOfflineQuizAttempt,
  saveOfflineBookmark,
} from './indexedDb';

export type SyncStatus = 'offline' | 'syncing' | 'synced';

export interface SyncEngineStats {
  status: SyncStatus;
  pendingCount: number;
  lastSyncedAt: string | null;
  totalSyncedEvents: number;
  dataSaverMode: boolean;
}

type SyncListener = (stats: SyncEngineStats) => void;

class SyncEngine {
  private status: SyncStatus = typeof navigator !== 'undefined' && !navigator.onLine ? 'offline' : 'synced';
  private listeners: Set<SyncListener> = new Set();
  private isProcessing = false;
  private lastSyncedAt: string | null = null;
  private totalSyncedEvents = 0;
  private isSimulatedOffline = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkStateChange(true));
      window.addEventListener('offline', () => this.handleNetworkStateChange(false));

      // Periodic check for pending queue on load
      setTimeout(() => this.checkAndSync(), 1500);
    }
  }

  public subscribe(listener: SyncListener): () => void {
    this.listeners.add(listener);
    this.emit();
    return () => this.listeners.delete(listener);
  }

  private async emit(): Promise<void> {
    const queue = await getPendingSyncQueue();
    const stats: SyncEngineStats = {
      status: this.status,
      pendingCount: queue.length,
      lastSyncedAt: this.lastSyncedAt,
      totalSyncedEvents: this.totalSyncedEvents,
      dataSaverMode: typeof localStorage !== 'undefined' && localStorage.getItem('shikshasetu_data_saver') === 'true',
    };
    this.listeners.forEach((l) => l(stats));
  }

  public setSimulatedOffline(isOffline: boolean): void {
    this.isSimulatedOffline = isOffline;
    this.handleNetworkStateChange(!isOffline);
  }

  public isConnected(): boolean {
    if (this.isSimulatedOffline) return false;
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  private handleNetworkStateChange(online: boolean): void {
    if (!online || this.isSimulatedOffline) {
      this.status = 'offline';
      this.emit();
    } else {
      this.checkAndSync();
    }
  }

  // ==========================================================
  // ENQUEUE OFFLINE ACTIONS
  // ==========================================================

  public async recordOfflineProgress(
    studentId: string,
    lessonId: string,
    progressPct: number,
    timeSpentSeconds: number = 60
  ): Promise<void> {
    const status = progressPct >= 100 ? 'completed' : progressPct > 0 ? 'in_progress' : 'not_started';
    const now = new Date().toISOString();

    // 1. Save directly in local IndexedDB
    await saveOfflineProgress({
      id: `${studentId}:${lessonId}`,
      studentId,
      lessonId,
      status,
      progressPct,
      timeSpentSeconds,
      completedAt: status === 'completed' ? now : null,
      updatedAt: now,
    });

    // 2. Add to Sync Queue (Priority 1: Essential)
    const eventId = `progress_${studentId}_${lessonId}_${Date.now()}`;
    await addToSyncQueue({
      id: eventId,
      eventType: 'lesson_progress',
      priority: 1,
      payload: {
        studentId,
        lessonId,
        status,
        progressPct,
        timeSpentSeconds,
        updatedAt: now,
      },
      createdAt: now,
      attempts: 0,
      status: 'pending',
    });

    if (this.isConnected()) {
      this.checkAndSync();
    } else {
      this.status = 'offline';
      this.emit();
    }
  }

  public async recordOfflineQuizAttempt(
    studentId: string,
    lessonId: string,
    questionId: string,
    chosenAnswer: string,
    isCorrect: boolean,
    score: number,
    totalQuestions: number,
    timeSpentSeconds: number = 30
  ): Promise<void> {
    const now = new Date().toISOString();
    const attemptId = `quiz_${studentId}_${lessonId}_${questionId}_${Date.now()}`;

    // 1. Save locally in IndexedDB
    await saveOfflineQuizAttempt({
      id: attemptId,
      studentId,
      lessonId,
      questionId,
      chosenAnswer,
      isCorrect,
      score,
      totalQuestions,
      timeSpentSeconds,
      attemptedAt: now,
    });

    // 2. Add to Sync Queue (Priority 1: Essential)
    await addToSyncQueue({
      id: attemptId,
      eventType: 'quiz_attempt',
      priority: 1,
      payload: {
        studentId,
        lessonId,
        questionId,
        chosenAnswer,
        isCorrect,
        score,
        totalQuestions,
        timeSpentSeconds,
        attemptedAt: now,
      },
      createdAt: now,
      attempts: 0,
      status: 'pending',
    });

    if (this.isConnected()) {
      this.checkAndSync();
    } else {
      this.status = 'offline';
      this.emit();
    }
  }

  public async recordOfflineBookmark(
    studentId: string,
    lessonId: string,
    isBookmarked: boolean
  ): Promise<void> {
    const now = new Date().toISOString();

    // 1. Save in IndexedDB
    await saveOfflineBookmark(studentId, lessonId, isBookmarked);

    // 2. Add to Sync Queue (Priority 2: Bookmark)
    const eventId = `bookmark_${studentId}_${lessonId}_${Date.now()}`;
    await addToSyncQueue({
      id: eventId,
      eventType: 'bookmark_toggle',
      priority: 2,
      payload: {
        studentId,
        lessonId,
        isBookmarked,
        updatedAt: now,
      },
      createdAt: now,
      attempts: 0,
      status: 'pending',
    });

    if (this.isConnected()) {
      this.checkAndSync();
    } else {
      this.status = 'offline';
      this.emit();
    }
  }

  // ==========================================================
  // SYNC QUEUE PROCESSING WITH DEDUPLICATION & CONFLICT RESOLUTION
  // ==========================================================

  public async checkAndSync(): Promise<{ success: boolean; syncedCount: number }> {
    if (this.isProcessing) return { success: false, syncedCount: 0 };
    if (!this.isConnected()) {
      this.status = 'offline';
      this.emit();
      return { success: false, syncedCount: 0 };
    }

    const queue = await getPendingSyncQueue();
    if (queue.length === 0) {
      this.status = 'synced';
      this.emit();
      return { success: true, syncedCount: 0 };
    }

    this.isProcessing = true;
    this.status = 'syncing';
    this.emit();

    let syncedCount = 0;

    try {
      // 1. DEDUPLICATION: Collapse redundant lesson progress events for the same lesson
      const progressMap = new Map<string, SyncQueueItem>();
      const otherEvents: SyncQueueItem[] = [];

      for (const item of queue) {
        if (item.eventType === 'lesson_progress') {
          const key = `${item.payload.studentId}:${item.payload.lessonId}`;
          const existing = progressMap.get(key);
          if (!existing) {
            progressMap.set(key, item);
          } else {
            // Keep the maximum progress percentage (conflict resolution)
            if (item.payload.progressPct > existing.payload.progressPct) {
              await removeSyncQueueItem(existing.id);
              progressMap.set(key, item);
            } else {
              await removeSyncQueueItem(item.id);
            }
          }
        } else {
          otherEvents.push(item);
        }
      }

      const deduplicatedQueue = [
        ...Array.from(progressMap.values()),
        ...otherEvents,
      ].sort((a, b) => a.priority - b.priority); // Essential first (Priority 1)

      // 2. PROCESS AND UPLOAD TO SERVER
      for (const item of deduplicatedQueue) {
        // If connection was severed mid-sync, halt processing immediately (interrupted sync)
        if (!this.isConnected()) {
          throw new Error('Connection lost during sync batch');
        }

        await updateSyncQueueItemStatus(item.id, 'syncing');

        // Dispatch to Supabase if configured
        if (isSupabaseConfigured) {
          try {
            if (item.eventType === 'lesson_progress') {
              await (supabase.from('student_progress') as any).upsert(
                {
                  student_id: item.payload.studentId,
                  lesson_id: item.payload.lessonId,
                  status: item.payload.status,
                  progress_pct: item.payload.progressPct,
                  last_accessed_at: item.payload.updatedAt,
                  completed_at: item.payload.status === 'completed' ? item.payload.updatedAt : null,
                },
                { onConflict: 'student_id, lesson_id' }
              );
            } else if (item.eventType === 'bookmark_toggle') {
              if (item.payload.isBookmarked) {
                await (supabase.from('bookmarks') as any).insert({
                  student_id: item.payload.studentId,
                  lesson_id: item.payload.lessonId,
                });
              } else {
                await (supabase.from('bookmarks') as any)
                  .delete()
                  .match({ student_id: item.payload.studentId, lesson_id: item.payload.lessonId });
              }
            } else if (item.eventType === 'quiz_attempt') {
              await (supabase.from('assessment_answers') as any).insert({
                assessment_id: item.payload.lessonId,
                question_id: item.payload.questionId,
                answer: item.payload.chosenAnswer,
                is_correct: item.payload.isCorrect,
                response_time: item.payload.timeSpentSeconds,
              });
            }
          } catch (syncErr) {
            console.warn('Supabase sync remote rejected item:', syncErr);
          }
        }

        // Successfully synced item: remove from queue
        await removeSyncQueueItem(item.id);
        syncedCount++;
        this.totalSyncedEvents++;
      }

      this.lastSyncedAt = new Date().toISOString();
      this.status = 'synced';
    } catch (err: any) {
      console.warn('Sync queue interrupted:', err.message);
      this.status = 'offline';
    } finally {
      this.isProcessing = false;
      this.emit();
    }

    return { success: syncedCount > 0, syncedCount };
  }
}

export const syncEngine = new SyncEngine();
