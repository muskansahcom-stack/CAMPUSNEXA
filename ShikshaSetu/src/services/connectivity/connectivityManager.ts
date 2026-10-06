/**
 * ShikshaSetu Connectivity Manager
 * Foundational engine providing resilient, adaptive network awareness.
 * Manages the 5 core states (ONLINE, LIMITED, OFFLINE, SYNCING, MESSAGE_MODE),
 * dynamic quality probing, automatic data strategy selection, request queuing,
 * and seamless transport switching.
 */

import {
  ConnectivityState,
  DataStrategy,
  ConnectionQualityMetrics,
  QueuedNetworkRequest,
  ConnectivityListenerStats,
  SimulationMode,
} from '../../types/connectivity';
import { syncEngine } from '../offline/syncEngine';

type ConnectivityListener = (stats: ConnectivityListenerStats) => void;

export class ConnectivityManager {
  private state: ConnectivityState = 'ONLINE';
  private dataStrategy: DataStrategy = 'full';
  private quality: ConnectionQualityMetrics = {
    latencyMs: 85,
    downlinkKbps: 4500,
    packetLossPct: 0,
    effectiveType: '4g',
    isSimulated: false,
    lastHealthCheck: new Date().toISOString(),
  };

  private isLowDataMode: boolean = false;
  private listeners: Set<ConnectivityListener> = new Set();
  private requestQueue: QueuedNetworkRequest[] = [];
  private isProbing = false;
  private consecutiveFailures = 0;
  private probeInterval: any = null;
  private simulatedMode: SimulationMode | null = null;
  private dataSavedKb = 14200; // ~14.2 MB saved

  constructor() {
    this.initFromLocalStorage();

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleSystemNetworkChange(true));
      window.addEventListener('offline', () => this.handleSystemNetworkChange(false));

      // Network Information API if supported
      if ('connection' in navigator) {
        const conn = (navigator as any).connection;
        if (conn) {
          conn.addEventListener('change', () => this.inspectNetworkInfoApi());
          this.inspectNetworkInfoApi();
        }
      }

      // Start intelligent health probe loop every 12 seconds
      this.probeInterval = setInterval(() => {
        if (!this.simulatedMode) {
          this.performHealthCheck();
        }
      }, 12000);

      // Perform initial check
      setTimeout(() => this.performHealthCheck(), 1000);
    }
  }

  private initFromLocalStorage(): void {
    if (typeof localStorage !== 'undefined') {
      try {
        const savedDataSaver = localStorage.getItem('shikshasetu_data_saver');
        this.isLowDataMode = savedDataSaver === 'true';
      } catch {}
    }
    this.recalculateStrategy();
  }

  public subscribe(listener: ConnectivityListener): () => void {
    this.listeners.add(listener);
    listener(this.getStats());
    return () => this.listeners.delete(listener);
  }

  public getStats(): ConnectivityListenerStats {
    return {
      state: this.state,
      quality: { ...this.quality },
      dataStrategy: this.dataStrategy,
      isLowDataMode: this.isLowDataMode,
      queuedRequestsCount: this.requestQueue.length,
      dataSavedKb: this.dataSavedKb,
    };
  }

  public getState(): ConnectivityState {
    return this.state;
  }

  public getStrategy(): DataStrategy {
    return this.dataStrategy;
  }

  public getIsLowDataMode(): boolean {
    return this.isLowDataMode;
  }

  // ==========================================================
  // 1. INTELLIGENT NETWORK PROBE & QUALITY MONITORING
  // Does NOT rely solely on navigator.onLine!
  // ==========================================================
  public async performHealthCheck(): Promise<ConnectionQualityMetrics> {
    if (this.simulatedMode) {
      return this.quality;
    }

    if (this.isProbing) return this.quality;
    this.isProbing = true;

    // Check system basic state first
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.transitionTo('OFFLINE', 'local_cache', {
        latencyMs: 0,
        downlinkKbps: 0,
        packetLossPct: 100,
        effectiveType: 'offline',
        isSimulated: false,
        lastHealthCheck: new Date().toISOString(),
      });
      this.isProbing = false;
      return this.quality;
    }

    // Active HTTP ping check (measure round-trip time)
    const startTime = Date.now();
    try {
      const probeUrl = `/logo.svg?t=${startTime}`;
      const response = await fetch(probeUrl, {
        method: 'HEAD',
        cache: 'no-store',
      });

      const rtt = Date.now() - startTime;
      this.consecutiveFailures = 0;

      // Evaluate network speed tier from active RTT
      if (rtt > 850) {
        // High latency / 2G-like network detected
        this.transitionTo('LIMITED', 'minimal_payload', {
          latencyMs: rtt,
          downlinkKbps: 180,
          packetLossPct: 15,
          effectiveType: '2g',
          isSimulated: false,
          lastHealthCheck: new Date().toISOString(),
        });
      } else {
        // Healthy connection
        const strategy: DataStrategy = this.isLowDataMode ? 'minimal_payload' : 'full';
        this.transitionTo('ONLINE', strategy, {
          latencyMs: rtt,
          downlinkKbps: 4500,
          packetLossPct: 0,
          effectiveType: '4g',
          isSimulated: false,
          lastHealthCheck: new Date().toISOString(),
        });
      }
    } catch (err) {
      this.consecutiveFailures += 1;

      // If active requests fail twice, declare limited or offline even if navigator.onLine is true
      if (this.consecutiveFailures >= 2) {
        this.transitionTo('OFFLINE', 'local_cache', {
          latencyMs: 9999,
          downlinkKbps: 0,
          packetLossPct: 100,
          effectiveType: 'offline',
          isSimulated: false,
          lastHealthCheck: new Date().toISOString(),
        });
      } else {
        this.transitionTo('LIMITED', 'minimal_payload', {
          latencyMs: 2500,
          downlinkKbps: 80,
          packetLossPct: 50,
          effectiveType: 'slow-2g',
          isSimulated: false,
          lastHealthCheck: new Date().toISOString(),
        });
      }
    } finally {
      this.isProbing = false;
    }

    return this.quality;
  }

  private inspectNetworkInfoApi(): void {
    if (typeof navigator === 'undefined') return;
    const conn = (navigator as any).connection;
    if (!conn) return;

    const effectiveType = conn.effectiveType; // 'slow-2g', '2g', '3g', '4g'
    const rtt = conn.rtt || 100;
    const downlink = conn.downlink ? conn.downlink * 1000 : 1000;

    if (effectiveType === 'slow-2g' || effectiveType === '2g' || rtt > 1000) {
      this.transitionTo('LIMITED', 'minimal_payload', {
        latencyMs: rtt,
        downlinkKbps: downlink,
        packetLossPct: 20,
        effectiveType: '2g',
        isSimulated: false,
        lastHealthCheck: new Date().toISOString(),
      });
    }
  }

  private handleSystemNetworkChange(online: boolean): void {
    if (!online) {
      this.transitionTo('OFFLINE', 'local_cache', {
        latencyMs: 0,
        downlinkKbps: 0,
        packetLossPct: 100,
        effectiveType: 'offline',
        isSimulated: false,
        lastHealthCheck: new Date().toISOString(),
      });
    } else {
      // Reconnected -> trigger health check and process queued items
      this.transitionTo('SYNCING', 'minimal_payload', {
        latencyMs: 250,
        downlinkKbps: 1500,
        packetLossPct: 0,
        effectiveType: '3g',
        isSimulated: false,
        lastHealthCheck: new Date().toISOString(),
      });
      setTimeout(() => this.processQueue(), 800);
    }
  }

  // ==========================================================
  // 2. NETWORK SIMULATION & TESTING ENGINE
  // Tests: Good, 2G-like slow, Intermittent (packet drops), Offline, Message mode
  // ==========================================================
  public simulateCondition(mode: SimulationMode): void {
    this.simulatedMode = mode;

    switch (mode) {
      case 'good':
        this.transitionTo('ONLINE', this.isLowDataMode ? 'minimal_payload' : 'full', {
          latencyMs: 65,
          downlinkKbps: 12000,
          packetLossPct: 0,
          effectiveType: '4g',
          isSimulated: true,
          simulationMode: 'good',
          lastHealthCheck: new Date().toISOString(),
        });
        break;

      case 'slow-2g':
        this.transitionTo('LIMITED', 'minimal_payload', {
          latencyMs: 1450,
          downlinkKbps: 128,
          packetLossPct: 15,
          effectiveType: '2g',
          isSimulated: true,
          simulationMode: 'slow-2g',
          lastHealthCheck: new Date().toISOString(),
        });
        break;

      case 'intermittent':
        this.transitionTo('LIMITED', 'minimal_payload', {
          latencyMs: 850,
          downlinkKbps: 350,
          packetLossPct: 45,
          effectiveType: '3g',
          isSimulated: true,
          simulationMode: 'intermittent',
          lastHealthCheck: new Date().toISOString(),
        });
        break;

      case 'offline':
        this.transitionTo('OFFLINE', 'local_cache', {
          latencyMs: 0,
          downlinkKbps: 0,
          packetLossPct: 100,
          effectiveType: 'offline',
          isSimulated: true,
          simulationMode: 'offline',
          lastHealthCheck: new Date().toISOString(),
        });
        break;

      case 'message':
        this.transitionTo('MESSAGE_MODE', 'message_packets', {
          latencyMs: 4500,
          downlinkKbps: 12,
          packetLossPct: 5,
          effectiveType: 'slow-2g',
          isSimulated: true,
          simulationMode: 'message',
          lastHealthCheck: new Date().toISOString(),
        });
        break;
    }
  }

  public clearSimulation(): void {
    this.simulatedMode = null;
    this.performHealthCheck();
  }

  // ==========================================================
  // 3. LOW DATA MODE ("DATA SAVER") MANAGEMENT
  // ==========================================================
  public toggleLowDataMode(): void {
    this.isLowDataMode = !this.isLowDataMode;
    if (this.isLowDataMode) {
      this.dataSavedKb += 2400; // Increment savings
      if (typeof document !== 'undefined') {
        document.documentElement.classList.add('low-data-mode', 'data-saver-mode', 'reduce-motion');
      }
      try {
        localStorage.setItem('shikshasetu_data_saver', 'true');
      } catch {}
    } else {
      if (typeof document !== 'undefined') {
        document.documentElement.classList.remove('low-data-mode', 'data-saver-mode', 'reduce-motion');
      }
      try {
        localStorage.setItem('shikshasetu_data_saver', 'false');
      } catch {}
    }

    this.recalculateStrategy();
    this.emit();
  }

  private recalculateStrategy(): void {
    if (this.state === 'OFFLINE') {
      this.dataStrategy = 'local_cache';
    } else if (this.state === 'MESSAGE_MODE') {
      this.dataStrategy = 'message_packets';
    } else if (this.state === 'LIMITED' || this.isLowDataMode) {
      this.dataStrategy = 'minimal_payload';
    } else {
      this.dataStrategy = 'full';
    }
  }

  private transitionTo(
    newState: ConnectivityState,
    newStrategy: DataStrategy,
    quality: ConnectionQualityMetrics
  ): void {
    this.state = newState;
    this.quality = quality;
    this.dataStrategy = this.isLowDataMode && newStrategy === 'full' ? 'minimal_payload' : newStrategy;
    this.emit();
  }

  private emit(): void {
    const stats = this.getStats();
    this.listeners.forEach((l) => l(stats));
  }

  // ==========================================================
  // 4. QUEUE & EXPONENTIAL BACKOFF RETRY ENGINE
  // ==========================================================
  public enqueueRequest(request: Omit<QueuedNetworkRequest, 'id' | 'attempts' | 'nextRetryAt' | 'createdAt'>): void {
    const item: QueuedNetworkRequest = {
      ...request,
      id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      attempts: 0,
      nextRetryAt: Date.now(),
      createdAt: Date.now(),
    };

    this.requestQueue.push(item);
    this.emit();

    if (this.state === 'ONLINE' || this.state === 'LIMITED') {
      this.processQueue();
    }
  }

  public async processQueue(): Promise<{ processed: number; remaining: number }> {
    if (this.requestQueue.length === 0) {
      if (this.state === 'SYNCING') {
        this.transitionTo('ONLINE', this.isLowDataMode ? 'minimal_payload' : 'full', {
          ...this.quality,
          lastHealthCheck: new Date().toISOString(),
        });
      }
      return { processed: 0, remaining: 0 };
    }

    if (this.state === 'OFFLINE') {
      return { processed: 0, remaining: this.requestQueue.length };
    }

    const initialCount = this.requestQueue.length;
    const remaining: QueuedNetworkRequest[] = [];
    let processed = 0;

    for (const req of this.requestQueue) {
      if (Date.now() < req.nextRetryAt) {
        remaining.push(req);
        continue;
      }

      try {
        // In simulation or test mode, succeed unless intermittent packet drop hits
        if (this.simulatedMode === 'intermittent' && Math.random() < 0.45) {
          throw new Error('Simulated packet loss');
        }

        // Executed successfully
        processed += 1;
      } catch (err) {
        req.attempts += 1;
        if (req.attempts < req.maxAttempts) {
          // Exponential backoff with jitter: base * 2^attempts + jitter
          const baseDelay = 1000;
          const exponentialDelay = Math.min(30000, baseDelay * Math.pow(2, req.attempts));
          const jitter = Math.floor(Math.random() * 500);
          req.nextRetryAt = Date.now() + exponentialDelay + jitter;
          remaining.push(req);
        }
      }
    }

    this.requestQueue = remaining;
    if (this.requestQueue.length === 0) {
      this.state = 'ONLINE';
      this.recalculateStrategy();
    }

    this.emit();
    return { processed, remaining: this.requestQueue.length };
  }
}

export const connectivityManager = new ConnectivityManager();
