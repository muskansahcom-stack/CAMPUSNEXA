/**
 * ShikshaSetu Adaptive Connectivity Engine - Types & Data Contracts
 * Defines the 5 core connectivity states, transport strategies, quality metrics,
 * and normalized universal UI data templates.
 */

export type ConnectivityState =
  | 'ONLINE'        // High-speed reliable network (4G/Wi-Fi)
  | 'LIMITED'       // Slow 2G/3G network, high latency, minimal payload mode
  | 'OFFLINE'       // Completely disconnected; 100% local IndexedDB execution
  | 'SYNCING'       // Background queue reconciliation in progress
  | 'MESSAGE_MODE'; // Extreme low-bandwidth SMS/Mesh micro-packet exchange

export type DataStrategy =
  | 'full'              // Fetch full rich data with media links
  | 'minimal_payload'   // Fetch compressed minimal JSON (text-first, no bloat)
  | 'local_cache'       // Serve strictly from local IndexedDB
  | 'message_packets';  // Micro-packet serialization (SMS / local mesh)

export type SimulationMode = 'good' | 'slow-2g' | 'intermittent' | 'offline' | 'message';

export interface ConnectionQualityMetrics {
  latencyMs: number;
  downlinkKbps: number;
  packetLossPct: number;
  effectiveType: '4g' | '3g' | '2g' | 'slow-2g' | 'offline';
  isSimulated: boolean;
  simulationMode?: SimulationMode;
  lastHealthCheck: string;
}

// ==========================================================
// NORMALIZED UNIVERSAL DATA STRUCTURES
// The UI receives identical structures regardless of network origin!
// ==========================================================

export type QuestionType = 'mcq' | 'true_false' | 'fill_blank';

export interface NormalizedQuestion {
  id: string;
  topic: string;
  topicId?: string;
  question: string;
  options: string[];
  type: QuestionType;
  explanation: string;
  correct_answer: string;
  difficulty?: 1 | 2 | 3;
  hint?: string;
  cachedAt?: string;
  dataSource?: 'online_api' | 'minimal_payload' | 'local_cache' | 'message_packet';
}

export interface NormalizedLesson {
  id: string;
  topicId: string;
  title: string;
  shortExplanation: string;
  subject: string;
  grade: number;
  bodyText: string;
  keyConcepts: string[];
  videoUrl?: string;
  audioUrl?: string;
  isOfflineCached: boolean;
  byteSize: number;
  dataSource?: 'online_api' | 'minimal_payload' | 'local_cache' | 'message_packet';
}

export interface NormalizedProgressCard {
  studentId: string;
  overallProgressPct: number;
  streakDays: number;
  xpPoints: number;
  dailyGoalMinutes: number;
  todayCompletedMinutes: number;
  levelTitle: string;
  activeTopic: string;
  dataSource?: 'online_api' | 'minimal_payload' | 'local_cache' | 'message_packet';
}

export interface NormalizedLearningPathNode {
  id: string;
  title: string;
  orderIndex: number;
  status: 'completed' | 'in_progress' | 'locked' | 'needs_practice';
  masteryScore: number;
}

export interface NormalizedLearningPath {
  subject: string;
  nodes: NormalizedLearningPathNode[];
  dataSource?: 'online_api' | 'minimal_payload' | 'local_cache' | 'message_packet';
}

export interface NormalizedAssignment {
  id: string;
  title: string;
  topic: string;
  subject: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  completionPct: number;
  score?: number;
  dataSource?: 'online_api' | 'minimal_payload' | 'local_cache' | 'message_packet';
}

export interface NormalizedAchievement {
  id: string;
  badgeCode: string;
  title: string;
  description: string;
  unlockedAt: string;
  iconName: string;
}

export interface QueuedNetworkRequest {
  id: string;
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  payload: any;
  priority: 1 | 2 | 3; // 1 = Essential, 2 = Standard, 3 = Telemetry
  attempts: number;
  maxAttempts: number;
  nextRetryAt: number;
  createdAt: number;
}

export interface ConnectivityListenerStats {
  state: ConnectivityState;
  quality: ConnectionQualityMetrics;
  dataStrategy: DataStrategy;
  isLowDataMode: boolean;
  queuedRequestsCount: number;
  dataSavedKb: number;
}
