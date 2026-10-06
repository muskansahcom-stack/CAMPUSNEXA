import React from 'react';
import { useConnectivity } from '../../contexts/ConnectivityContext';
import { Wifi, WifiOff, Zap, RefreshCw, CheckCircle2 } from 'lucide-react';

export const LowBandwidthBanner: React.FC = () => {
  const {
    isOnline,
    isLowBandwidthMode,
    toggleLowBandwidthMode,
    dataSavedMb,
    syncQueueCount,
    triggerManualSync,
    isSyncing,
    connectivityState,
    dataStrategy,
    connectionQuality,
  } = useConnectivity();

  const getBannerTheme = () => {
    if (connectivityState === 'OFFLINE' || !isOnline) {
      return 'bg-amber-50 border-amber-200 text-amber-900';
    }
    if (connectivityState === 'LIMITED') {
      return 'bg-amber-100/90 border-amber-300 text-amber-950';
    }
    if (connectivityState === 'MESSAGE_MODE') {
      return 'bg-purple-50 border-purple-200 text-purple-900';
    }
    if (isLowBandwidthMode) {
      return 'bg-brand-900 border-brand-800 text-white';
    }
    return 'bg-slate-100 border-slate-200 text-slate-700';
  };

  return (
    <div className={`text-xs border-b transition-colors ${getBannerTheme()}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex flex-wrap items-center justify-between gap-2">
        {/* Left: Connectivity indicator */}
        <div className="flex items-center gap-2">
          {connectivityState === 'ONLINE' && isOnline ? (
            <span className="flex items-center gap-1.5 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Wifi className="w-3.5 h-3.5 text-emerald-600" />
              <span>Online</span>
              {connectionQuality?.latencyMs ? (
                <span className="text-[10px] opacity-75 font-mono">
                  ({connectionQuality.latencyMs}ms)
                </span>
              ) : null}
            </span>
          ) : connectivityState === 'LIMITED' ? (
            <span className="flex items-center gap-1.5 font-bold text-amber-900">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-600"></span>
              </span>
              <Wifi className="w-3.5 h-3.5 text-amber-700" />
              <span>2G Weak Signal • Minimal Payload Active ({connectionQuality?.latencyMs || 1200}ms)</span>
            </span>
          ) : connectivityState === 'MESSAGE_MODE' ? (
            <span className="flex items-center gap-1.5 font-bold text-purple-900">
              <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse" />
              <span>SMS / Micro-Packet Mesh Active</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 font-bold text-amber-800">
              <WifiOff className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>Offline Mode • Zero-Lag Local Storage (IndexedDB)</span>
            </span>
          )}

          <span className="hidden sm:inline opacity-40">|</span>

          {/* Sync indicator */}
          {syncQueueCount > 0 ? (
            <span className="hidden md:inline-flex items-center gap-1 opacity-90">
              <span>{syncQueueCount} learning events waiting to sync</span>
              {isOnline && connectivityState !== 'OFFLINE' && (
                <button
                  onClick={triggerManualSync}
                  disabled={isSyncing}
                  className="ml-1 underline font-semibold hover:opacity-100 flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                  {isSyncing ? 'Syncing...' : 'Sync Now'}
                </button>
              )}
            </span>
          ) : (
            <span className="hidden md:inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-3 h-3" />
              <span>All progress synced</span>
            </span>
          )}
        </div>

        {/* Right: Low-Bandwidth Mode Switch & Data Saved */}
        <div className="flex items-center gap-3 ml-auto">
          {isLowBandwidthMode && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-saffron-300">
              <Zap className="w-3 h-3 text-saffron-400" />
              <span>Saved ~{dataSavedMb} MB</span>
            </span>
          )}

          <label className="inline-flex items-center gap-2 cursor-pointer select-none">
            <span className="text-[11px] font-semibold tracking-tight">
              {isLowBandwidthMode ? '2G Low-Data' : 'Low Data Mode'}
            </span>
            <input
              type="checkbox"
              checked={isLowBandwidthMode}
              onChange={toggleLowBandwidthMode}
              className="sr-only peer"
            />
            <div className="w-7 h-4 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-saffron-500 relative"></div>
          </label>
        </div>
      </div>
    </div>
  );
};
