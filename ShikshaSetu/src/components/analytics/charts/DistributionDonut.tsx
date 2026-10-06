import React from 'react';

export interface DonutSegment {
  label: string;
  value: number; // percentage or count
  color: string;
}

interface DistributionDonutProps {
  segments: DonutSegment[];
  centerLabel?: string;
  centerValue?: string | number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

export const DistributionDonut: React.FC<DistributionDonutProps> = ({
  segments,
  centerLabel = 'Total',
  centerValue,
  size = 140,
  strokeWidth = 14,
  className = '',
}) => {
  const total = segments.reduce((acc, s) => acc + s.value, 0) || 1;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let currentOffset = 0;

  return (
    <div className={`flex flex-col sm:flex-row items-center gap-5 ${className}`}>
      {/* SVG Donut */}
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform -rotate-90"
        >
          {/* Background Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="transparent"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />

          {/* Donut Segments */}
          {segments.map((seg, idx) => {
            const segPct = seg.value / total;
            const strokeDasharray = `${segPct * circumference} ${circumference}`;
            const strokeDashoffset = -currentOffset;
            currentOffset += segPct * circumference;

            return (
              <circle
                key={idx}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="transparent"
                stroke={seg.color}
                strokeWidth={strokeWidth}
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            );
          })}
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-base font-black text-slate-900 leading-tight">
            {centerValue !== undefined ? centerValue : `${Math.round(total)}%`}
          </span>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
            {centerLabel}
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-2 flex-1 w-full text-xs">
        {segments.map((seg, idx) => (
          <div key={idx} className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-slate-700 font-medium">{seg.label}</span>
            </div>
            <span className="font-extrabold text-slate-900">{seg.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
