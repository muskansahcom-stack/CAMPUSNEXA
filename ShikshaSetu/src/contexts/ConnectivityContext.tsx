import React, { createContext, useContext, useState, useEffect } from 'react';
import { syncEngine, SyncStatus } from '../services/offline/syncEngine';
import { connectivityManager } from '../services/connectivity/connectivityManager';
import {
  ConnectivityState,
  DataStrategy,
  ConnectionQualityMetrics,
  SimulationMode,
} from '../types/connectivity';

interface ConnectivityContextType {
  // Legacy & Direct flags
  isOnline: boolean;
  isLowBandwidthMode: boolean; // Alias for isDataSaverMode
  isDataSaverMode: boolean;
  toggleDataSaverMode: () => void;
  toggleLowBandwidthMode: () => void;
  wifiOnlyDownloads: boolean;
  setWifiOnlyDownloads: (enabled: boolean) => void;
  dataSavedMb: number;
  syncStatus: SyncStatus;
  syncQueueCount: number;
  lastSyncedAt: string | null;
  triggerManualSync: () => Promise<boolean>;
  isSyncing: boolean;
  isSimulatedOffline: boolean;
  setSimulatedOffline: (simulated: boolean) => void;
  effectiveConnectionType: '2g' | '3g' | '4g' | 'wifi' | 'offline';
  canDownloadMedia: (sizeBytes: number) => { allowed: boolean; reason?: string };

  // Adaptive Connectivity Engine (5 States & Introspection)
  connectivityState: ConnectivityState; // 'ONLINE' | 'LIMITED' | 'OFFLINE' | 'SYNCING' | 'MESSAGE_MODE'
  dataStrategy: DataStrategy; // 'full' | 'minimal_payload' | 'local_cache' | 'message_packets'
  connectionQuality: ConnectionQualityMetrics;
  simulateNetworkCondition: (mode: SimulationMode) => void;
  clearSimulation: () => void;
  performHealthCheck: () => Promise<ConnectionQualityMetrics>;
}

const ConnectivityContext = createContext<ConnectivityContextType | undefined>(undefined);

export const ConnectivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [managerStats, setManagerStats] = useState(() => connectivityManager.getStats());
  const [isOnline, setIsOnline] = useState<boolean>(syncEngine.isConnected());
  const [dataSavedMb, setDataSavedMb] = useState<number>(14.2);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('synced');
  const [syncQueueCount, setSyncQueueCount] = useState<number>(0);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [isSimulatedOffline, setIsSimulatedOfflineState] = useState<boolean>(false);

  const [wifiOnlyDownloads, setWifiOnlyDownloads] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('shikshasetu_wifi_only');
      return saved ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  // 1. Subscribe to ConnectivityManager (Adaptive Engine)
  useEffect(() => {
    const unsubManager = connectivityManager.subscribe((stats) => {
      setManagerStats(stats);
      setIsOnline(stats.state !== 'OFFLINE');
    });

    return () => unsubManager();
  }, []);

  // 2. Subscribe to SyncEngine
  useEffect(() => {
    const unsubscribe = syncEngine.subscribe((stats) => {
      setSyncStatus(stats.status);
      setSyncQueueCount(stats.pendingCount);
      setLastSyncedAt(stats.lastSyncedAt);
      if (stats.status === 'offline') {
        setIsOnline(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // 3. Keep DOM classes synchronized for Data Saver / Low Bandwidth
  useEffect(() => {
    if (managerStats.isLowDataMode) {
      document.documentElement.classList.add('low-bandwidth-mode', 'data-saver-mode', 'low-data-mode', 'reduce-motion');
    } else {
      document.documentElement.classList.remove('low-bandwidth-mode', 'data-saver-mode', 'low-data-mode', 'reduce-motion');
    }
  }, [managerStats.isLowDataMode]);

  useEffect(() => {
    try {
      localStorage.setItem('shikshasetu_wifi_only', String(wifiOnlyDownloads));
    } catch {}
  }, [wifiOnlyDownloads]);

  const toggleDataSaverMode = () => {
    connectivityManager.toggleLowDataMode();
    setDataSavedMb((d) => +(d + 2.4).toFixed(1));
  };

  const toggleLowBandwidthMode = toggleDataSaverMode;

  const setSimulatedOffline = (simulated: boolean) => {
    setIsSimulatedOfflineState(simulated);
    syncEngine.setSimulatedOffline(simulated);
    if (simulated) {
      connectivityManager.simulateCondition('offline');
    } else {
      connectivityManager.clearSimulation();
    }
  };

  const triggerManualSync = async (): Promise<boolean> => {
    const res = await syncEngine.checkAndSync();
    return res.success;
  };

  const canDownloadMedia = (sizeBytes: number): { allowed: boolean; reason?: string } => {
    if (!isOnline || managerStats.state === 'OFFLINE') {
      return { allowed: false, reason: 'Device is currently offline.' };
    }

    const sizeMb = sizeBytes / (1024 * 1024);
    if (managerStats.isLowDataMode && wifiOnlyDownloads && sizeMb > 5) {
      return {
        allowed: false,
        reason: `Low Data Mode active. Downloads over 5 MB (${sizeMb.toFixed(1)} MB) require Wi-Fi or disabling Low Data Mode.`,
      };
    }

    return { allowed: true };
  };

  const effectiveConnectionType: '2g' | '3g' | '4g' | 'wifi' | 'offline' =
    managerStats.state === 'OFFLINE'
      ? 'offline'
      : managerStats.state === 'LIMITED' || managerStats.isLowDataMode
      ? '2g'
      : '4g';

  return (
    <ConnectivityContext.Provider
      value={{
        isOnline,
        isLowBandwidthMode: managerStats.isLowDataMode,
        isDataSaverMode: managerStats.isLowDataMode,
        toggleDataSaverMode,
        toggleLowBandwidthMode,
        wifiOnlyDownloads,
        setWifiOnlyDownloads,
        dataSavedMb,
        syncStatus,
        syncQueueCount,
        lastSyncedAt,
        triggerManualSync,
        isSyncing: syncStatus === 'syncing' || managerStats.state === 'SYNCING',
        isSimulatedOffline,
        setSimulatedOffline,
        effectiveConnectionType,
        canDownloadMedia,

        // Adaptive Engine Features
        connectivityState: managerStats.state,
        dataStrategy: managerStats.dataStrategy,
        connectionQuality: managerStats.quality,
        simulateNetworkCondition: (mode: SimulationMode) => connectivityManager.simulateCondition(mode),
        clearSimulation: () => connectivityManager.clearSimulation(),
        performHealthCheck: () => connectivityManager.performHealthCheck(),
      }}
    >
      {children}
    </ConnectivityContext.Provider>
  );
};

export const useConnectivity = () => {
  const context = useContext(ConnectivityContext);
  if (!context) {
    throw new Error('useConnectivity must be used within a ConnectivityProvider');
  }
  return context;
};
