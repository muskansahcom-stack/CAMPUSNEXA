import React from 'react';

export interface LoadingStateProps {
  type?: 'card' | 'list' | 'spinner' | 'table';
  count?: number;
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'card',
  count = 3,
  message = 'Loading adaptive learning resources...',
}) => {
  if (type === 'spinner') {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="w-10 h-10 border-3 border-brand-200 border-t-brand-700 rounded-full animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-medium">{message}</p>
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-3 w-full animate-pulse">
        {Array.from({ length: count }).map((_, idx) => (
          <div
            key={idx}
            className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 bg-white"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-200 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-200 rounded w-2/5" />
              <div className="h-3 bg-slate-100 rounded w-4/5" />
            </div>
            <div className="w-16 h-8 bg-slate-200 rounded-lg shrink-0" />
          </div>
        ))}
      </div>
    );
  }

  // Default card skeletons
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 w-full animate-pulse">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="rounded-2xl border border-slate-200/80 bg-white p-6 space-y-4 shadow-soft"
        >
          <div className="flex justify-between items-center">
            <div className="h-5 bg-slate-200 rounded-full w-24" />
            <div className="h-4 bg-slate-100 rounded w-16" />
          </div>
          <div className="h-6 bg-slate-200 rounded w-3/4" />
          <div className="space-y-2">
            <div className="h-3.5 bg-slate-100 rounded w-full" />
            <div className="h-3.5 bg-slate-100 rounded w-5/6" />
          </div>
          <div className="pt-2 flex justify-between items-center border-t border-slate-100">
            <div className="h-3 bg-slate-200 rounded w-20" />
            <div className="h-8 bg-slate-200 rounded-xl w-24" />
          </div>
        </div>
      ))}
    </div>
  );
};
