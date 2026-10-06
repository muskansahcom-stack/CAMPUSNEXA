import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'brand' | 'saffron' | 'forest' | 'neutral' | 'danger' | 'offline';
  size?: 'sm' | 'md';
  dot?: boolean;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'brand',
  size = 'md',
  dot = false,
  className = '',
  ...props
}) => {
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  };

  const variantClasses = {
    brand: 'bg-brand-50 text-brand-700 border border-brand-200/60',
    saffron: 'bg-amber-50 text-amber-800 border border-amber-200/80',
    forest: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
    danger: 'bg-red-50 text-red-700 border border-red-200',
    offline: 'bg-amber-500/10 text-amber-900 border border-amber-300 font-medium',
  };

  const dotColors = {
    brand: 'bg-brand-500',
    saffron: 'bg-saffron-500',
    forest: 'bg-forest-500',
    neutral: 'bg-slate-400',
    danger: 'bg-red-500',
    offline: 'bg-amber-600',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]} shrink-0`} />}
      <span>{children}</span>
    </span>
  );
};
