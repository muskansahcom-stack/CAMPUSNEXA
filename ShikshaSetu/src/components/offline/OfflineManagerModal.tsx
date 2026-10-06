import React, { useState, useEffect } from 'react';
import { useConnectivity } from '../../contexts/ConnectivityContext';
import {
  getAllDownloadedLessons,
  deleteDownloadedLesson,
  getPendingSyncQueue,
  OfflineDownloadedLessonRecord,
  SyncQueueItem,
} from '../../services/offline/indexedDb';
import { syncEngine } from '../../services/offline/syncEngine';
import { pwaService } from '../../services/offline/pwaService';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useToast } from '../../contexts/ToastContext';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  HardDriveDownload,
  Trash2,
  CheckCircle2,
  Sliders,
  Smartphone,
  Layers,
  Sparkles,
  Zap,
  Clock,
  ShieldCheck,
  AlertTriangle,
  AlertCircle,
  Download,
  Play,
  FileText,
  Activity,
  Radio,
  Signal,
} from 'lucide-react';
import { UniversalQuestionRenderer } from '../learning/templates/UniversalQuestionRenderer';
import { NormalizedQuestion, SimulationMode } from '../../types/connectivity';

interface OfflineManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfflineManagerModal: React.FC<OfflineManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { showToast } = useToast();
  const {
    isOnline,
    syncStatus,
    syncQueueCount,
    isDataSaverMode,
    toggleDataSaverMode,
    wifiOnlyDownloads,
    setWifiOnlyDownloads,
    dataSavedMb,
    triggerManualSync,
    isSimulatedOffline,
    setSimulatedOffline,
    connectivityState,
    dataStrategy,
    connectionQuality,
    simulateNetworkCondition,
    clearSimulation,
    performHealthCheck,
  } = useConnectivity();

  const [downloadedLessons, setDownloadedLessons] = useState<OfflineDownloadedLessonRecord[]>([]);
  const [pendingQueue, setPendingQueue] = useState<SyncQueueItem[]>([]);
  const [canInstallPwa, setCanInstallPwa] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isProbing, setIsProbing] = useState(false);
  const [activeTab, setActiveTab] = useState<'cockpit' | 'lessons' | 'queue' | 'templates'>('cockpit');

  const loadOfflineData = async () => {
    try {
      const [lessons, queue] = await Promise.all([
        getAllDownloadedLessons(),
        getPendingSyncQueue(),
      ]);
      setDownloadedLessons(lessons);
      setPendingQueue(queue);
    } catch (err) {
      console.warn('Failed to load offline data:', err);
    }
  };

  useEffect(() => {
    if (!isOpen) return;
    loadOfflineData();

    const unsubPwa = pwaService.subscribeInstallable((canInstall) => {
      setCanInstallPwa(canInstall);
    });

    return () => unsubPwa();
  }, [isOpen, syncStatus]);

  if (!isOpen) return null;

  const handleSyncNow = async () => {
    setIsSyncing(true);
    const success = await triggerManualSync();
    setIsSyncing(false);
    await loadOfflineData();

    if (success) {
      showToast({
        type: 'success',
        title: 'Synchronization Complete',
        message: 'All pending offline learning events have been securely uploaded to the cloud.',
      });
    } else {
      showToast({
        type: 'info',
        title: 'Sync Deferred',
        message: 'No active internet connection detected. Offline events remain safely queued.',
      });
    }
  };

  const handleDeleteOfflineLesson = async (id: string, title: string) => {
    await deleteDownloadedLesson(id);
    await loadOfflineData();
    showToast({
      type: 'info',
      title: 'Offline Copy Deleted',
      message: `"${title}" removed from device cache. Storage freed up.`,
    });
  };

  const handleInstallPwa = async () => {
    const accepted = await pwaService.promptInstall();
    if (accepted) {
      showToast({
        type: 'success',
        title: 'App Installed Successfully',
        message: 'ShikshaSetu is now accessible directly from your home screen.',
      });
      setCanInstallPwa(false);
    }
  };

  const handleRunHealthCheck = async () => {
    setIsProbing(true);
    try {
      const q = await performHealthCheck();
      showToast({
        type: 'info',
        title: 'Active Network Probe Complete',
        message: `Measured RTT: ${q.latencyMs}ms | Downlink: ${q.downlinkKbps ? (q.downlinkKbps / 1000).toFixed(1) : '10'} Mbps`,
      });
    } finally {
      setIsProbing(false);
    }
  };

  const handleSimulateDuplicateSync = async () => {
    // Test duplicate event insertion into queue
    await syncEngine.recordOfflineProgress('demo-student', 'd0000000-0000-0000-0000-000000000001', 50);
    await syncEngine.recordOfflineProgress('demo-student', 'd0000000-0000-0000-0000-000000000001', 80);
    await loadOfflineData();
    showToast({
      type: 'info',
      title: 'Duplicate Events Enqueued',
      message: 'Generated 2 consecutive progress events. Next sync will automatically fold them into highest progress (80%).',
    });
  };

  const sampleQuestion: NormalizedQuestion = {
    id: 'demo-adaptive-q1',
    topic: 'Mathematics • Fractions',
    type: 'mcq',
    question: 'Ravi has 1 whole roti and shares 1 of 4 equal pieces with his sister. What fraction of the roti does he still have?',
    options: ['1/4', '2/4', '3/4', '4/4'],
    correct_answer: '3/4',
    explanation: '4/4 (whole roti) - 1/4 (shared) = 3/4 roti remaining.',
    hint: 'Count the number of pieces remaining out of the total 4 slices.',
    difficulty: 1,
    dataSource:
      connectivityState === 'OFFLINE'
        ? 'local_cache'
        : connectivityState === 'LIMITED'
        ? 'minimal_payload'
        : connectivityState === 'MESSAGE_MODE'
        ? 'message_packet'
        : 'online_api',
    cachedAt: new Date().toISOString(),
  };

  const handleAnswerDemo = async (ans: string, isCorrect: boolean) => {
    await syncEngine.recordOfflineQuizAttempt(
      'demo-student',
      'demo-lesson',
      'demo-adaptive-q1',
      ans,
      isCorrect,
      isCorrect ? 1 : 0,
      1,
      30
    );
    await loadOfflineData();
    showToast({
      type: isCorrect ? 'success' : 'info',
      title: isCorrect ? 'Correct Answer!' : 'Review Explanation',
      message: `Answer recorded via ${dataStrategy}. Action safely queued in IndexedDB pending ledger.`,
    });
  };

  const totalStorageKb = downloadedLessons.reduce(
    (acc, l) => acc + Math.round((l.totalSizeBytes || 150000) / 1024),
    0
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Adaptive Connectivity & Offline Cockpit"
      description="Zero-compromise learning for rural communities facing weak 2G signals, packet drops, and intermittent power."
      maxWidth="3xl"
    >
      <div className="space-y-5 max-h-[78vh] overflow-y-auto pr-1">
        {/* NETWORK & ADAPTIVE STRATEGY BANNER */}
        <div
          className={`p-5 rounded-3xl border transition-all ${
            connectivityState === 'OFFLINE' || isSimulatedOffline || !isOnline
              ? 'bg-amber-50/90 border-amber-300 text-amber-950'
              : connectivityState === 'LIMITED'
              ? 'bg-amber-100/90 border-amber-300 text-amber-950'
              : connectivityState === 'MESSAGE_MODE'
              ? 'bg-purple-50/90 border-purple-300 text-purple-950'
              : syncStatus === 'syncing' || connectivityState === 'SYNCING'
              ? 'bg-blue-50/90 border-blue-300 text-blue-950'
              : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  connectivityState === 'OFFLINE' || isSimulatedOffline || !isOnline
                    ? 'bg-amber-200 text-amber-800'
                    : connectivityState === 'LIMITED'
                    ? 'bg-amber-200 text-amber-900'
                    : connectivityState === 'MESSAGE_MODE'
                    ? 'bg-purple-200 text-purple-900'
                    : syncStatus === 'syncing'
                    ? 'bg-blue-200 text-blue-800'
                    : 'bg-emerald-200 text-emerald-800'
                }`}
              >
                {connectivityState === 'OFFLINE' || isSimulatedOffline || !isOnline ? (
                  <WifiOff className="w-6 h-6 animate-pulse" />
                ) : connectivityState === 'LIMITED' ? (
                  <Radio className="w-6 h-6 text-amber-700 animate-pulse" />
                ) : connectivityState === 'MESSAGE_MODE' ? (
                  <Signal className="w-6 h-6 text-purple-700 animate-pulse" />
                ) : syncStatus === 'syncing' ? (
                  <RefreshCw className="w-6 h-6 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-6 h-6" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold">
                    {connectivityState === 'OFFLINE' || isSimulatedOffline || !isOnline
                      ? 'Offline Mode Active'
                      : connectivityState === 'LIMITED'
                      ? '2G Slow Network Active'
                      : connectivityState === 'MESSAGE_MODE'
                      ? 'SMS / Micro-Packet Mesh Active'
                      : syncStatus === 'syncing'
                      ? 'Synchronizing Queued Events...'
                      : 'All Telemetry Synced (Broadband Online)'}
                  </h3>
                  <Badge
                    variant={
                      connectivityState === 'ONLINE'
                        ? 'brand'
                        : connectivityState === 'LIMITED'
                        ? 'saffron'
                        : 'neutral'
                    }
                    size="sm"
                  >
                    Strategy: {dataStrategy.replace('_', ' ')}
                  </Badge>
                </div>
                <p className="text-xs opacity-90 mt-0.5">
                  {connectivityState === 'OFFLINE' || !isOnline
                    ? `${pendingQueue.length} learning action(s) safe in IndexedDB. Will auto-sync when connection returns.`
                    : `${pendingQueue.length} pending events. RTT: ${connectionQuality?.latencyMs || 0}ms • Downlink: ${connectionQuality?.downlinkKbps ? (connectionQuality.downlinkKbps / 1000).toFixed(1) : '10'} Mbps.`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleRunHealthCheck}
                isLoading={isProbing}
                leftIcon={<Activity className="w-3.5 h-3.5" />}
                title="Send active HEAD health check to measure latency"
              >
                Probe Network
              </Button>

              <Button
                variant={!isOnline || connectivityState === 'OFFLINE' ? 'secondary' : 'primary'}
                size="sm"
                onClick={handleSyncNow}
                isLoading={isSyncing}
                disabled={!isOnline || connectivityState === 'OFFLINE'}
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              >
                Sync Now
              </Button>
            </div>
          </div>
        </div>

        {/* STRICT OFFLINE AI HONESTY NOTICE */}
        <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-950 space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>AI Teacher Requires Connectivity</span>
          </div>
          <p className="text-slate-600">
            ShikshaSetu never simulates fake AI tutoring offline. All downloaded curriculum materials, notes, worksheets, and interactive quizzes function 100% offline, but AI-powered conversational tutoring and diagnostic path generation require an active internet connection.
          </p>
        </div>

        {/* TAB CONTROLS */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200 text-xs font-bold">
          <button
            onClick={() => setActiveTab('cockpit')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all ${
              activeTab === 'cockpit'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Flight Simulator
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all ${
              activeTab === 'templates'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Template Testbed
          </button>
          <button
            onClick={() => setActiveTab('lessons')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all ${
              activeTab === 'lessons'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Offline Lessons ({downloadedLessons.length})
          </button>
          <button
            onClick={() => setActiveTab('queue')}
            className={`flex-1 py-2 px-3 rounded-xl transition-all ${
              activeTab === 'queue'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Queue ({pendingQueue.length})
          </button>
        </div>

        {/* TAB 1: COCKPIT & NETWORK FLIGHT SIMULATOR */}
        {activeTab === 'cockpit' && (
          <div className="space-y-4">
            {/* QUALITY TELEMETRY GAUGES */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-white border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Active State
                </span>
                <span className="text-sm font-extrabold text-slate-900 capitalize">
                  {connectivityState.toLowerCase()}
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  RTT Latency
                </span>
                <span className="text-sm font-extrabold text-slate-900 font-mono">
                  {connectionQuality?.latencyMs || 0} ms
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Downlink
                </span>
                <span className="text-sm font-extrabold text-slate-900 font-mono">
                  {connectionQuality?.downlinkKbps ? (connectionQuality.downlinkKbps / 1000).toFixed(1) : '10'} Mbps
                </span>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Packet Loss
                </span>
                <span className="text-sm font-extrabold text-slate-900 font-mono">
                  {connectionQuality?.packetLossPct || 0}%
                </span>
              </div>
            </div>

            {/* SIMULATION SWITCHBOARD */}
            <div className="p-5 rounded-3xl bg-slate-900 text-white space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-saffron-400" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-100">
                      Network Condition Flight Simulator
                    </h4>
                    <p className="text-xs text-slate-400">
                      Test how ShikshaSetu adapts seamlessly without breaking UI stability.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    clearSimulation();
                    showToast({
                      type: 'info',
                      title: 'Simulation Cleared',
                      message: 'Restored real hardware connectivity listeners.',
                    });
                  }}
                  className="text-xs underline text-slate-400 hover:text-white cursor-pointer"
                >
                  Reset to Live Network
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                <button
                  onClick={() => {
                    simulateNetworkCondition('good');
                    showToast({
                      type: 'success',
                      title: 'Broadband 4G Simulated',
                      message: 'Full payload mode with 45ms latency.',
                    });
                  }}
                  className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-all"
                >
                  <div className="font-bold text-xs text-emerald-400 flex items-center gap-1.5">
                    <Wifi className="w-3.5 h-3.5" />
                    <span>1. Good Network (4G)</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    45ms RTT, full media download allowed
                  </span>
                </button>

                <button
                  onClick={() => {
                    simulateNetworkCondition('slow-2g');
                    showToast({
                      type: 'info',
                      title: '2G Slow Network Simulated',
                      message: 'High latency (1200ms). Minimal payload engaged automatically.',
                    });
                  }}
                  className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-all"
                >
                  <div className="font-bold text-xs text-amber-400 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5" />
                    <span>2. 2G Slow Network</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    1200ms latency, strips images to text-first
                  </span>
                </button>

                <button
                  onClick={() => {
                    simulateNetworkCondition('intermittent');
                    showToast({
                      type: 'info',
                      title: 'Intermittent Network Simulated',
                      message: '45% packet loss. Request queue with exponential backoff & jitter engaged.',
                    });
                  }}
                  className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-all"
                >
                  <div className="font-bold text-xs text-saffron-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>3. Intermittent (Flaky)</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    45% packet loss with automatic jitter retries
                  </span>
                </button>

                <button
                  onClick={() => {
                    simulateNetworkCondition('offline');
                    showToast({
                      type: 'info',
                      title: 'Offline Mode Simulated',
                      message: '100% disconnected. All reads & writes route to IndexedDB.',
                    });
                  }}
                  className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-all"
                >
                  <div className="font-bold text-xs text-red-400 flex items-center gap-1.5">
                    <WifiOff className="w-3.5 h-3.5" />
                    <span>4. Complete Offline (Airplane Mode)</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Zero network. 100% local IndexedDB execution
                  </span>
                </button>

                <button
                  onClick={() => {
                    simulateNetworkCondition('message');
                    showToast({
                      type: 'info',
                      title: 'Micro-Packet Mesh Simulated',
                      message: 'Extreme low bandwidth. Payloads packed into base64 micro-packets.',
                    });
                  }}
                  className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-all"
                >
                  <div className="font-bold text-xs text-purple-400 flex items-center gap-1.5">
                    <Signal className="w-3.5 h-3.5" />
                    <span>5. Micro-Packet (SMS/Mesh)</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Micro-packet transport for deep rural mesh
                  </span>
                </button>

                <button
                  onClick={handleSimulateDuplicateSync}
                  className="p-3 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-left transition-all"
                >
                  <div className="font-bold text-xs text-blue-400 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    <span>Deduplication Test</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-1">
                    Enqueue 2 consecutive updates to verify rollup
                  </span>
                </button>
              </div>
            </div>

            {/* DATA SAVER MODE SETTINGS */}
            <div className="p-5 rounded-3xl bg-white border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-saffron-500" />
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      Data Saver Mode (Rural 2G / 3G Optimization)
                    </h4>
                    <p className="text-xs text-slate-500">
                      Estimated {dataSavedMb} MB cellular data saved this week.
                    </p>
                  </div>
                </div>

                <button
                  onClick={toggleDataSaverMode}
                  className={`w-12 h-6 rounded-full transition-colors relative focus:outline-none ${
                    isDataSaverMode ? 'bg-saffron-500' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      isDataSaverMode ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-slate-100 text-xs text-slate-700">
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Disable media autoplay</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Compress images & prefer text capsules</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Reduce animations for low-power devices</span>
                </div>
                <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Sync essential progress & quizzes first</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="wifiOnly"
                    checked={wifiOnlyDownloads}
                    onChange={(e) => setWifiOnlyDownloads(e.target.checked)}
                    className="w-4 h-4 text-brand-600 rounded"
                  />
                  <label htmlFor="wifiOnly" className="font-medium cursor-pointer">
                    Wi-Fi Only for Heavy Media Downloads (&gt; 5 MB)
                  </label>
                </div>
                <span className="text-[11px] text-slate-400">Protects daily cellular limits</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: UNIVERSAL TEMPLATE TESTBED */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 text-xs text-brand-900 space-y-1">
              <span className="font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-brand-600" />
                Universal Learning Template Normalization
              </span>
              <p className="text-slate-600">
                Regardless of whether data arrives via full broadband, 2G minimal payload, local IndexedDB cache, or micro-packets, the UI receives the exact same normalized structure. Answer the question below and observe zero UI flicker as connectivity shifts.
              </p>
            </div>

            <UniversalQuestionRenderer
              question={sampleQuestion}
              onAnswerSubmitted={handleAnswerDemo}
              showDataSourceBadge={true}
            />
          </div>
        )}

        {/* TAB 3: DOWNLOADED LESSONS */}
        {activeTab === 'lessons' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDriveDownload className="w-4 h-4 text-brand-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  Downloaded Offline Lessons ({downloadedLessons.length})
                </h4>
              </div>
              <span className="text-xs text-slate-500 font-medium">
                Device Footprint: {totalStorageKb} KB
              </span>
            </div>

            {downloadedLessons.length > 0 ? (
              <div className="space-y-2.5">
                {downloadedLessons.map((l) => (
                  <div
                    key={l.id}
                    className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between gap-3 shadow-soft"
                  >
                    <div className="space-y-0.5 overflow-hidden">
                      <div className="flex items-center gap-2">
                        <Badge variant="brand" size="sm">
                          {l.subject_name || 'Mathematics'}
                        </Badge>
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {l.title}
                        </span>
                      </div>
                      <span className="block text-[11px] text-slate-500">
                        Downloaded {new Date(l.downloadedAt).toLocaleDateString()} •{' '}
                        {Math.round((l.totalSizeBytes || 150000) / 1024)} KB stored in IndexedDB
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeleteOfflineLesson(l.id, l.title)}
                      className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors cursor-pointer"
                      title="Remove from device storage"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-xs text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700">No Lessons Downloaded Yet</p>
                <p>
                  Visit the Learning Library and click "Save Offline" on any lesson to learn without
                  an active data connection.
                </p>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: PENDING SYNC QUEUE */}
        {activeTab === 'queue' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-brand-600" />
                Pending Synchronizations ({pendingQueue.length})
              </div>
              {pendingQueue.length > 0 && isOnline && (
                <Button size="sm" variant="secondary" onClick={handleSyncNow} isLoading={isSyncing}>
                  Sync Now
                </Button>
              )}
            </div>

            {pendingQueue.length > 0 ? (
              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                {pendingQueue.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-white border border-slate-200 text-xs flex items-center justify-between shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <Badge
                        variant={item.priority === 1 ? 'brand' : 'neutral'}
                        size="sm"
                      >
                        {item.eventType.replace('_', ' ')}
                      </Badge>
                      <span className="text-slate-800 font-medium">
                        {item.eventType === 'lesson_progress'
                          ? `Progress: ${item.payload.progressPct}%`
                          : item.eventType === 'quiz_attempt'
                          ? `Answer: ${item.payload.chosenAnswer}`
                          : 'Action recorded'}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 text-xs text-slate-500">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                <p className="font-semibold text-slate-700">Sync Ledger is Empty</p>
                <p>All local learning activities have been verified and reconciled with the cloud.</p>
              </div>
            )}
          </div>
        )}

        {/* INSTALL PWA BANNER */}
        {canInstallPwa && (
          <div className="p-4 rounded-2xl bg-brand-50 border border-brand-200 flex items-center justify-between">
            <div className="space-y-0.5">
              <h5 className="text-xs font-bold text-brand-900">
                Install ShikshaSetu App on this Device
              </h5>
              <p className="text-xs text-brand-700">
                Add to home screen for instant full-screen offline learning.
              </p>
            </div>
            <Button
              size="sm"
              variant="saffron"
              onClick={handleInstallPwa}
              leftIcon={<Smartphone className="w-3.5 h-3.5" />}
            >
              Install App
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};
