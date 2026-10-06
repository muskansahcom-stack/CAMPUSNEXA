import React, { useState } from 'react';
import { useConnectivity } from '../../contexts/ConnectivityContext';
import { Badge } from '../ui/Badge';
import { OfflineManagerModal } from './OfflineManagerModal';
import {
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle2,
  HardDriveDownload,
  Sliders,
  ShieldCheck,
} from 'lucide-react';

interface SyncStatusBadgeProps {
  className?: string;
  showDetailsOnClick?: boolean;
}

export const SyncStatusBadge: React.FC<SyncStatusBadgeProps> = ({
  className = '',
  showDetailsOnClick = true,
}) => {
  const {
    isOnline,
    syncStatus,
    syncQueueCount,
    isDataSaverMode,
    isSimulatedOffline,
    connectivityState,
    connectionQuality,
  } = useConnectivity();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleClick = () => {
    if (showDetailsOnClick) {
      setIsModalOpen(true);
    }
  };

  // Determine badge visual style based on 5 adaptive states
  const getBadgeStyle = () => {
    if (connectivityState === 'OFFLINE' || isSimulatedOffline || !isOnline) {
      return 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100 ring-2 ring-amber-500/20';
    }
    if (connectivityState === 'SYNCING' || syncStatus === 'syncing') {
      return 'bg-blue-50 text-blue-900 border-blue-300 hover:bg-blue-100 ring-2 ring-blue-500/20';
    }
    if (connectivityState === 'LIMITED') {
      return 'bg-amber-100/70 text-amber-950 border-amber-300 hover:bg-amber-100';
    }
    if (connectivityState === 'MESSAGE_MODE') {
      return 'bg-purple-50 text-purple-950 border-purple-300 hover:bg-purple-100';
    }
    return 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100';
  };

  return (
    <>
      <button
        onClick={handleClick}
        className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border shadow-xs cursor-pointer ${getBadgeStyle()} ${className}`}
        title="Click to view Adaptive Connectivity & Offline Manager"
      >
        {connectivityState === 'OFFLINE' || isSimulatedOffline || !isOnline ? (
          <>
            <WifiOff className="w-3.5 h-3.5 text-amber-600 animate-pulse shrink-0" />
            <span>Offline</span>
            {syncQueueCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-200 text-amber-900 text-[10px] font-extrabold">
                {syncQueueCount} queued
              </span>
            )}
          </>
        ) : connectivityState === 'SYNCING' || syncStatus === 'syncing' ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 text-blue-600 animate-spin shrink-0" />
            <span>Syncing...</span>
            {syncQueueCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-blue-200 text-blue-900 text-[10px] font-extrabold">
                {syncQueueCount}
              </span>
            )}
          </>
        ) : connectivityState === 'LIMITED' ? (
          <>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span>2G Limited</span>
            {connectionQuality?.latencyMs ? (
              <span className="text-[10px] text-amber-800 font-mono">
                {connectionQuality.latencyMs}ms
              </span>
            ) : null}
          </>
        ) : connectivityState === 'MESSAGE_MODE' ? (
          <>
            <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
            <span>SMS Mesh</span>
          </>
        ) : (
          <>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Online</span>
          </>
        )}

        {isDataSaverMode && (
          <span className="ml-1 px-1.5 py-0.5 rounded bg-brand-100 text-brand-800 text-[9px] font-black uppercase">
            Data Saver
          </span>
        )}
      </button>

      {/* Offline & Sync Manager Modal */}
      <OfflineManagerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
