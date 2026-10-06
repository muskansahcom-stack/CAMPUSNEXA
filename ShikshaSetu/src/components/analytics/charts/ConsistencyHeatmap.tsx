import React from 'react';
import { StudentDayActivityItem } from '../../../types/analytics';
import { CheckCircle2, Flame, Award } from 'lucide-react';

interface ConsistencyHeatmapProps {
  days: StudentDayActivityItem[];
  consistencyScore: number;
  ratingLabel?: string;
  className?: string;
}

export const ConsistencyHeatmap: React.FC<ConsistencyHeatmapProps> = ({
  days,
  consistencyScore,
  ratingLabel = 'Consistent Learner',
  className = '',
}) => {
  return (
    <div className={`p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3.5 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
            Routine Regularity
          </span>
          <h4 className="text-sm font-bold text-slate-900 mt-0.5">{ratingLabel}</h4>
        </div>

        <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200 font-extrabold text-xs">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>{consistencyScore}% Consistency</span>
        </div>
      </div>

      {/* Grid of days */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((d, idx) => {
          let bgClass = 'bg-slate-100 border-slate-200 text-slate-400';
          let intensityBadge = 'Rest day';

          if (d.active) {
            if (d.minutes >= 20) {
              bgClass = 'bg-emerald-500 border-emerald-600 text-white shadow-xs';
              intensityBadge = `${d.minutes}m Focus`;
            } else if (d.minutes >= 10) {
              bgClass = 'bg-emerald-400/90 border-emerald-500 text-white';
              intensityBadge = `${d.minutes}m Regular`;
            } else {
              bgClass = 'bg-emerald-200 border-emerald-300 text-emerald-950';
              intensityBadge = `${d.minutes}m Light`;
            }
          }

          return (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border text-center flex flex-col justify-between items-center transition-all ${bgClass}`}
              title={`${d.day}: ${intensityBadge} (${d.score}% score)`}
            >
              <span className="text-[10px] font-bold uppercase">{d.day}</span>
              <div className="my-1">
                {d.active ? (
                  <Flame className="w-4 h-4 fill-current opacity-90" />
                ) : (
                  <span className="text-[10px] opacity-40">-</span>
                )}
              </div>
              <span className="text-[9px] font-extrabold truncate max-w-full">
                {d.active ? `${d.minutes}m` : 'Rest'}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          Daily goal reached (20m+)
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-200 inline-block" />
          Light practice (5-10m)
        </span>
      </div>
    </div>
  );
};
