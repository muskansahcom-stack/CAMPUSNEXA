import React, { useState } from 'react';

export interface TrendDataPoint {
  label: string;
  value: number;
  secondaryValue?: number;
}

interface TrendAreaChartProps {
  data: TrendDataPoint[];
  color?: string;
  secondaryColor?: string;
  unit?: string;
  height?: number;
  ariaLabel?: string;
  className?: string;
}

export const TrendAreaChart: React.FC<TrendAreaChartProps> = ({
  data,
  color = '#2563eb', // brand-600
  secondaryColor,
  unit = '%',
  height = 180,
  ariaLabel = 'Progression Trend Chart',
  className = '',
}) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div
        className="w-full flex items-center justify-center text-xs text-slate-400 italic bg-slate-50 rounded-2xl border border-dashed border-slate-200"
        style={{ height }}
      >
        No trend records in selected interval
      </div>
    );
  }

  const paddingLeft = 36;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;
  const viewBoxWidth = 600;
  const viewBoxHeight = height;

  const chartWidth = viewBoxWidth - paddingLeft - paddingRight;
  const chartHeight = viewBoxHeight - paddingTop - paddingBottom;

  const values = data.map((d) => d.value);
  if (secondaryColor) {
    data.forEach((d) => {
      if (d.secondaryValue !== undefined) values.push(d.secondaryValue);
    });
  }

  const rawMin = Math.min(...values, 0);
  const rawMax = Math.max(...values, 100);
  const minVal = Math.max(0, Math.floor(rawMin / 10) * 10);
  const maxVal = Math.ceil(rawMax / 10) * 10 || 100;
  const valRange = maxVal - minVal || 1;

  const getX = (idx: number) => {
    if (data.length <= 1) return paddingLeft + chartWidth / 2;
    return paddingLeft + (idx / (data.length - 1)) * chartWidth;
  };

  const getY = (val: number) => {
    const norm = (val - minVal) / valRange;
    return paddingTop + chartHeight - norm * chartHeight;
  };

  // Primary path points
  const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');
  const areaPath = `M ${getX(0)},${getY(data[0].value)} L ${points.replace(/ /g, ' L ')} L ${getX(
    data.length - 1
  )},${paddingTop + chartHeight} L ${getX(0)},${paddingTop + chartHeight} Z`;

  // Secondary path (if available)
  let secondaryPoints = '';
  if (secondaryColor) {
    secondaryPoints = data
      .filter((d) => d.secondaryValue !== undefined)
      .map((d, i) => `${getX(i)},${getY(d.secondaryValue!)}`)
      .join(' ');
  }

  return (
    <div className={`relative w-full ${className}`}>
      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        className="w-full overflow-visible"
        aria-label={ariaLabel}
        role="img"
      >
        <defs>
          <linearGradient id={`area-grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.28" />
            <stop offset="95%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
        </defs>

        {/* Horizontal Grid lines */}
        {[0, 0.5, 1].map((pct, idx) => {
          const y = paddingTop + chartHeight * (1 - pct);
          const gridVal = Math.round(minVal + pct * valRange);
          return (
            <g key={idx}>
              <line
                x1={paddingLeft}
                y1={y}
                x2={viewBoxWidth - paddingRight}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray="4 4"
                strokeWidth="1"
              />
              <text
                x={paddingLeft - 8}
                y={y + 3}
                textAnchor="end"
                className="text-[10px] fill-slate-400 font-semibold"
              >
                {gridVal}
                {unit}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        <path d={areaPath} fill={`url(#area-grad-${color.replace('#', '')})`} />

        {/* Secondary Line */}
        {secondaryColor && secondaryPoints && (
          <path
            d={`M ${secondaryPoints.replace(/ /g, ' L ')}`}
            fill="none"
            stroke={secondaryColor}
            strokeWidth="2"
            strokeDasharray="4 4"
          />
        )}

        {/* Primary Line */}
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />

        {/* Data Points */}
        {data.map((d, i) => {
          const cx = getX(i);
          const cy = getY(d.value);
          const isHovered = hoveredIdx === i;

          return (
            <g key={i}>
              <circle
                cx={cx}
                cy={cy}
                r={isHovered ? 6 : 4}
                fill="#ffffff"
                stroke={color}
                strokeWidth={isHovered ? 3 : 2}
                className="transition-all cursor-pointer"
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />

              {/* X Axis Label */}
              <text
                x={cx}
                y={paddingTop + chartHeight + 18}
                textAnchor="middle"
                className={`text-[10px] font-semibold transition-all ${
                  isHovered ? 'fill-slate-900 font-bold' : 'fill-slate-500'
                }`}
              >
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Interactive Tooltip Callout */}
      {hoveredIdx !== null && data[hoveredIdx] && (
        <div
          className="absolute -top-3 transform -translate-x-1/2 bg-slate-900 text-white text-[11px] font-bold px-2.5 py-1 rounded-xl shadow-lg border border-slate-700 pointer-events-none transition-all flex items-center gap-1.5"
          style={{
            left: `${((getX(hoveredIdx) - paddingLeft) / chartWidth) * 100}%`,
          }}
        >
          <span>{data[hoveredIdx].label}:</span>
          <span className="text-amber-400">
            {data[hoveredIdx].value}
            {unit}
          </span>
          {data[hoveredIdx].secondaryValue !== undefined && (
            <span className="text-slate-400 text-[10px]">
              (Target: {data[hoveredIdx].secondaryValue}
              {unit})
            </span>
          )}
        </div>
      )}
    </div>
  );
};
