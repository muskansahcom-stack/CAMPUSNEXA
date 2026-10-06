import React from 'react';
import { Zap, Wifi, Signal, Info } from 'lucide-react';
import { ConnectivityState, ConnectionQualityMetrics } from '../../../types/connectivity';

interface LowDataModeBadgeProps {
  isLowDataMode: boolean;
  connectivityState: ConnectivityState;
  quality?: ConnectionQualityMetrics;
  onToggle?: () => void;
  className?: string;
}

export const LowDataModeBadge: React.FC<LowDataModeBadgeProps> = ({
  isLowDataMode,
  connectivityState,
  quality,
  onToggle,
  className = '',
}) => {
  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      {/* Subtle visible indicator: Low Data Mode */}
      {isLowDataMode && (
        <button
          onClick={onToggle}
          title="Data Saver Active: Video autoplay disabled, compressed images, text-first content, reduced animations to protect limited daily recharges."
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-saffron-500/10 border border-saffron-300 text-saffron-800 text-[11px] font-bold hover:bg-saffron-500/20 transition-all shadow-2xs"
        >
          <Zap className="w-3.5 h-3.5 text-saffron-600 fill-saffron-600" />
          <span>Low Data Mode</span>
        </button>
      )}

      {/* Network State indicator: ONLINE | LIMITED | OFFLINE | SYNCING | MESSAGE_MODE */}
      <div
        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all ${
          connectivityState === 'ONLINE'
            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            : connectivityState === 'LIMITED'
            ? 'bg-amber-50 text-amber-900 border border-amber-300'
            : connectivityState === 'OFFLINE'
            ? 'bg-slate-100 text-slate-700 border border-slate-300'
            : connectivityState === 'SYNCING'
            ? 'bg-blue-50 text-blue-800 border border-blue-200'
            : 'bg-purple-50 text-purple-900 border border-purple-200'
        }`}
      >
        <span
          className={`w-2 h-2 rounded-full ${
            connectivityState === 'ONLINE'
              ? 'bg-emerald-500'
              : connectivityState === 'LIMITED'
              ? 'bg-amber-500 animate-pulse'
              : connectivityState === 'OFFLINE'
              ? 'bg-slate-400'
              : connectivityState === 'SYNCING'
              ? 'bg-blue-500 animate-ping'
              : 'bg-purple-500'
          }`}
        />
        <span className="capitalize">{connectivityState.replace('_', ' ').toLowerCase()}</span>
        {quality?.latencyMs ? (
          <span className="text-[10px] text-slate-400 font-mono">
            ({quality.latencyMs}ms)
          </span>
        ) : null}
      </div>
    </div>
  );
};
