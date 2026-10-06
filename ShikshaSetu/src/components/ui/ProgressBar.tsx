import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showValueLabel?: boolean;
  variant?: 'brand' | 'saffron' | 'forest' | 'gradient';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showValueLabel = true,
  variant = 'brand',
  size = 'md',
  className = '',
}) => {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const fillVariantClasses = {
    brand: 'bg-brand-600',
    saffron: 'bg-saffron-500',
    forest: 'bg-forest-500',
    gradient: 'bg-gradient-to-r from-brand-600 via-saffron-500 to-forest-500',
  };

  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {(label || showValueLabel) && (
        <div className="flex justify-between items-center text-xs font-medium text-slate-700">
          <span>{label}</span>
          {showValueLabel && <span className="text-slate-500">{percentage}%</span>}
        </div>
      )}
      <div
        className={`w-full bg-slate-200/80 rounded-full overflow-hidden ${sizeClasses[size]}`}
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${fillVariantClasses[variant]}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
