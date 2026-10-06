/**
 * ShikshaSetu Transport Manager
 * Decouples the UI and Learning State from underlying network transports.
 * The UI receives identical normalized data structures whether from:
 * - Supabase API (full online)
 * - Low-bandwidth compressed payload (2G / limited)
 * - IndexedDB (local offline cache)
 * - Message micro-packets (SMS / edge mesh)
 */

import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import {
  NormalizedQuestion,
  NormalizedLesson,
  NormalizedProgressCard,
  NormalizedLearningPath,
  NormalizedAssignment,
  DataStrategy,
} from '../../types/connectivity';
import {
  getOfflineQuestionsByTopic,
  saveOfflineQuestions,
  getDownloadedLesson,
  saveDownloadedLesson,
  getOfflineProgress,
  saveOfflineProgress,
  getCachedLearningPath,
  saveCachedLearningPath,
  addToSyncQueue,
} from '../offline/indexedDb';

export class TransportManager {
  // ==========================================================
  // 1. QUESTIONS RETRIEVAL (UNIVERSAL NORMALIZATION)
  // ==========================================================
  public async getQuestions(
    topicId: string,
    strategy: DataStrategy
  ): Promise<NormalizedQuestion[]> {
    // A. Offline or Message Mode: Pull immediately from Local IndexedDB Cache
    if (strategy === 'local_cache' || strategy === 'message_packets') {
      return this.getLocalQuestions(topicId, strategy);
    }

    // B. Online API or Minimal Payload
    try {
      if (isSupabaseConfigured) {
        let query = supabase.from('questions').select('*').limit(10);
        if (topicId) {
          query = query.eq('topic_id', topicId);
        }

        const { data, error } = await query;
        if (!error && data && data.length > 0) {
          const normalized: NormalizedQuestion[] = data.map((q: any) => ({
            id: q.id,
            topic: q.topic_id || topicId,
            topicId: q.topic_id,
            question: q.question,
            options: Array.isArray(q.options) ? q.options.map((o: any) => (typeof o === 'string' ? o : o.text || String(o))) : ['A', 'B', 'C', 'D'],
            type: 'mcq',
            explanation: q.explanation || 'Step-by-step reasoning.',
            correct_answer: q.correct_answer || 'A',
            difficulty: q.difficulty || 1,
            dataSource: strategy === 'minimal_payload' ? 'minimal_payload' : 'online_api',
          }));

          // Stale-While-Revalidate: Seed local cache silently
          saveOfflineQuestions(normalized).catch(() => {});
          return normalized;
        }
      }
    } catch (err) {
      console.warn('Network request failed, transparently falling back to local cache:', err);
    }

    // Fallback to local cache if network errored or empty
    return this.getLocalQuestions(topicId, 'local_cache');
  }

  private async getLocalQuestions(
    topicId: string,
    strategy: DataStrategy
  ): Promise<NormalizedQuestion[]> {
    const cached = await getOfflineQuestionsByTopic(topicId);
    if (cached && cached.length > 0) {
      return cached.map((q: any) => ({
        ...q,
        dataSource: strategy === 'message_packets' ? 'message_packet' : 'local_cache',
      }));
    }

    // High-quality rural curriculum fallback templates (always available offline)
    return [
      {
        id: 'q-norm-01',
        topic: 'Fractions',
        topicId: 'top-frac-01',
        question: 'A farmer divides 1 bigha of land equally among 4 sons. What fraction of land does each son receive?',
        options: ['1/2 bigha', '1/4 bigha', '2/4 bigha', '1/3 bigha'],
        type: 'mcq',
        explanation: 'When 1 whole unit is divided into 4 equal portions, each portion equals 1/4.',
        correct_answer: '1/4 bigha',
        difficulty: 1,
        hint: 'Think of 1 whole roti divided into 4 equal quarters.',
        dataSource: strategy === 'message_packets' ? 'message_packet' : 'local_cache',
      },
      {
        id: 'q-norm-02',
        topic: 'Fractions',
        topicId: 'top-frac-01',
        question: 'What is 1/2 + 1/2 in simplest form?',
        options: ['1/4', '2/4', '1', '2'],
        type: 'mcq',
        explanation: '1/2 plus 1/2 equals 2/2, which simplifies to 1 whole.',
        correct_answer: '1',
        difficulty: 1,
        dataSource: strategy === 'message_packets' ? 'message_packet' : 'local_cache',
      },
      {
        id: 'q-norm-03',
        topic: 'Fractions',
        topicId: 'top-frac-01',
        question: 'True or False: 2/4 and 1/2 represent the exact same quantity.',
        options: ['True', 'False'],
        type: 'true_false',
        explanation: 'Dividing numerator and denominator by 2 gives 2/4 = 1/2. They are equivalent.',
        correct_answer: 'True',
        difficulty: 1,
        dataSource: strategy === 'message_packets' ? 'message_packet' : 'local_cache',
      },
      {
        id: 'q-norm-04',
        topic: 'Fractions',
        topicId: 'top-frac-01',
        question: 'Complete the sentence: In the fraction 3/5, the number 5 is the _______.',
        options: ['Numerator', 'Denominator', 'Quotient', 'Factor'],
        type: 'fill_blank',
        explanation: 'The bottom number indicating total equal parts is the Denominator.',
        correct_answer: 'Denominator',
        difficulty: 1,
        dataSource: strategy === 'message_packets' ? 'message_packet' : 'local_cache',
      },
    ];
  }

  // ==========================================================
  // 2. LESSON RETRIEVAL (UNIVERSAL NORMALIZATION)
  // ==========================================================
  public async getLesson(
    lessonId: string,
    strategy: DataStrategy
  ): Promise<NormalizedLesson> {
    if (strategy === 'local_cache' || strategy === 'message_packets') {
      return this.getLocalLesson(lessonId, strategy);
    }

    try {
      if (isSupabaseConfigured) {
        const { data, error } = (await supabase
          .from('lessons')
          .select('*, chapters(*)')
          .eq('id', lessonId)
          .maybeSingle()) as any;

        if (!error && data) {
          const normalized: NormalizedLesson = {
            id: data.id,
            topicId: data.topic_id || 'top-frac-01',
            title: data.title,
            shortExplanation: data.short_explanation,
            subject: 'Mathematics',
            grade: 8,
            bodyText: data.short_explanation,
            keyConcepts: Array.isArray(data.learning_objectives) ? data.learning_objectives : ['Fractions', 'Equivalence'],
            videoUrl: strategy === 'minimal_payload' ? undefined : 'https://example.com/video.mp4',
            audioUrl: 'https://example.com/audio.mp3',
            isOfflineCached: true,
            byteSize: 185000,
            dataSource: strategy === 'minimal_payload' ? 'minimal_payload' : 'online_api',
          };
          return normalized;
        }
      }
    } catch (err) {
      console.warn('Lesson API request failed, serving local fallback:', err);
    }

    return this.getLocalLesson(lessonId, 'local_cache');
  }

  private async getLocalLesson(
    lessonId: string,
    strategy: DataStrategy
  ): Promise<NormalizedLesson> {
    const cached = await getDownloadedLesson(lessonId);
    if (cached) {
      return {
        id: cached.id,
        topicId: 'top-frac-01',
        title: cached.title,
        shortExplanation: cached.short_explanation,
        subject: cached.subject_name || 'Mathematics',
        grade: cached.grade || 8,
        bodyText: cached.short_explanation,
        keyConcepts: cached.learning_objectives || ['Fractions Basics', 'Sharing Model'],
        videoUrl: strategy === 'message_packets' ? undefined : undefined,
        audioUrl: strategy === 'message_packets' ? undefined : undefined,
        isOfflineCached: true,
        byteSize: cached.totalSizeBytes || 140000,
        dataSource: strategy === 'message_packets' ? 'message_packet' : 'local_cache',
      };
    }

    return {
      id: lessonId || 'l-frac-01',
      topicId: 'top-frac-01',
      title: 'Understanding Fractions: Parts of a Whole',
      shortExplanation: 'Fractions represent equal parts of a whole, illustrated through daily roti division.',
      subject: 'Mathematics',
      grade: 8,
      bodyText: 'When dividing food, land, or seeds equally, each part is a fraction. The denominator tells us total equal parts; the numerator tells how many parts are taken.',
      keyConcepts: ['Equal Division', 'Numerator & Denominator', 'Physical Representation'],
      isOfflineCached: true,
      byteSize: 140000,
      dataSource: strategy === 'message_packets' ? 'message_packet' : 'local_cache',
    };
  }

  // ==========================================================
  // 3. PROGRESS SUBMISSION (DATA-FIRST NETWORK MODEL)
  // ==========================================================
  public async submitProgress(
    studentId: string,
    lessonId: string,
    progressPct: number,
    strategy: DataStrategy
  ): Promise<{ success: boolean; synced: boolean; strategyUsed: DataStrategy }> {
    const now = new Date().toISOString();

    // 1. Always record in local IndexedDB first (Zero Latency)
    await saveOfflineProgress({
      id: `${studentId}:${lessonId}`,
      studentId,
      lessonId,
      status: progressPct >= 100 ? 'completed' : 'in_progress',
      progressPct,
      timeSpentSeconds: 60,
      completedAt: progressPct >= 100 ? now : null,
      updatedAt: now,
    });

    // 2. Route according to strategy
    if (strategy === 'local_cache') {
      // Enqueue to sync queue for future reconnection
      await addToSyncQueue({
        id: `prog_${Date.now()}`,
        eventType: 'lesson_progress',
        priority: 1,
        payload: { studentId, lessonId, progressPct, updatedAt: now },
        createdAt: now,
        attempts: 0,
        status: 'pending',
      });
      return { success: true, synced: false, strategyUsed: 'local_cache' };
    }

    if (strategy === 'message_packets') {
      // Simulate compact message serialization: base64 micro-packet
      const payloadStr = JSON.stringify({ s: studentId, l: lessonId, p: progressPct, t: Date.now() });
      const microPacket = btoa(unescape(encodeURIComponent(payloadStr)));
      console.log('Dispatched micro-packet via message transport:', microPacket);
      return { success: true, synced: true, strategyUsed: 'message_packets' };
    }

    // Online or Minimal Payload: Direct Supabase sync
    try {
      if (isSupabaseConfigured) {
        await (supabase.from('student_progress') as any).upsert(
          {
            student_id: studentId,
            lesson_id: lessonId,
            progress_pct: progressPct,
            status: progressPct >= 100 ? 'completed' : 'in_progress',
            last_accessed_at: now,
          },
          { onConflict: 'student_id, lesson_id' }
        );
        return { success: true, synced: true, strategyUsed: strategy };
      }
    } catch (err) {
      console.warn('Direct upload failed, deferred to background queue:', err);
    }

    // Queued fallback
    await addToSyncQueue({
      id: `prog_${Date.now()}`,
      eventType: 'lesson_progress',
      priority: 1,
      payload: { studentId, lessonId, progressPct, updatedAt: now },
      createdAt: now,
      attempts: 0,
      status: 'pending',
    });

    return { success: true, synced: false, strategyUsed: 'local_cache' };
  }
}

export const transportManager = new TransportManager();
