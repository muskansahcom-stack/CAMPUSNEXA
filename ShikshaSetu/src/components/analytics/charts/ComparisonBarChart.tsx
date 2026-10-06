import React from 'react';

export interface BarChartItem {
  label: string;
  value: number;
  sublabel?: string;
  badge?: string;
  color?: string;
  benchmark?: number;
}

interface ComparisonBarChartProps {
  items: BarChartItem[];
  orientation?: 'horizontal' | 'vertical';
  unit?: string;
  maxValue?: number;
  height?: number;
  className?: string;
}

export const ComparisonBarChart: React.FC<ComparisonBarChartProps> = ({
  items,
  orientation = 'horizontal',
  unit = '%',
  maxValue,
  height,
  className = '',
}) => {
  if (!items || items.length === 0) {
    return (
      <div className="p-6 text-center text-xs text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200">
        No comparative data in selected range
      </div>
    );
  }

  const computedMax = maxValue || Math.max(...items.map((i) => i.value), 100);

  if (orientation === 'horizontal') {
    return (
      <div className={`space-y-3.5 ${className}`}>
        {items.map((item, idx) => {
          const pct = Math.min(100, Math.max(0, (item.value / computedMax) * 100));
          const barColor = item.color || '#2563eb';

          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{item.label}</span>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                      {item.badge}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {item.benchmark !== undefined && (
                    <span className="text-[11px] text-slate-400">
                      Target: {item.benchmark}
                      {unit}
                    </span>
                  )}
                  <span className="font-black text-slate-900">
                    {item.value}
                    {unit}
                  </span>
                </div>
              </div>

              {/* Progress bar line */}
              <div className="relative w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                <div
                  style={{
                    width: `${pct}%`,
                    backgroundColor: barColor,
                  }}
                  className="h-full rounded-full transition-all duration-300"
                />

                {item.benchmark !== undefined && (
                  <div
                    style={{ left: `${(item.benchmark / computedMax) * 100}%` }}
                    className="absolute top-0 bottom-0 w-0.5 bg-slate-400 z-10"
                    title={`Benchmark target: ${item.benchmark}${unit}`}
                  />
                )}
              </div>

              {item.sublabel && (
                <p className="text-[11px] text-slate-500 italic">{item.sublabel}</p>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Vertical orientation
  return (
    <div
      className={`flex items-end justify-between gap-2 pt-6 pb-2 px-2 ${className}`}
      style={{ height: height || 200 }}
    >
      {items.map((item, idx) => {
        const pct = Math.min(100, Math.max(0, (item.value / computedMax) * 100));
        const barColor = item.color || '#2563eb';

        return (
          <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
            {/* Value on hover */}
            <span className="text-[10px] font-bold text-slate-700 opacity-70 group-hover:opacity-100 transition-opacity mb-1">
              {item.value}
              {unit}
            </span>

            {/* Bar */}
            <div className="w-full max-w-[36px] bg-slate-100 rounded-t-xl overflow-hidden flex flex-col justify-end h-full">
              <div
                style={{
                  height: `${pct}%`,
                  backgroundColor: barColor,
                }}
                className="w-full rounded-t-xl transition-all duration-300 group-hover:brightness-110"
              />
            </div>

            {/* Label */}
            <span className="text-[10px] font-semibold text-slate-600 mt-2 text-center truncate max-w-full">
              {item.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
