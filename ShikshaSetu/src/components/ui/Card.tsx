import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'flat' | 'elevated' | 'outline' | 'saffron-subtle' | 'forest-subtle';
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  interactive = false,
  className = '',
  ...props
}) => {
  const baseClasses = 'rounded-2xl transition-all duration-200';

  const variantClasses = {
    default: 'bg-white border border-slate-200/80 shadow-soft',
    flat: 'bg-slate-50/80 border border-slate-200/50',
    elevated: 'bg-white border border-slate-100 shadow-elevated',
    outline: 'bg-transparent border border-slate-300',
    'saffron-subtle': 'bg-amber-50/60 border border-amber-200/70',
    'forest-subtle': 'bg-emerald-50/60 border border-emerald-200/70',
  };

  const interactiveClasses = interactive
    ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-elevated hover:border-slate-300'
    : '';

  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${interactiveClasses} ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`p-5 sm:p-6 border-b border-slate-100 flex flex-col gap-1.5 ${className}`} {...props}>
    {children}
  </div>
);

export const CardTitle: React.FC<React.HTMLAttributes<HTMLHeadingElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <h3 className={`text-lg sm:text-xl font-bold tracking-tight text-slate-900 ${className}`} {...props}>
    {children}
  </h3>
);

export const CardDescription: React.FC<React.HTMLAttributes<HTMLParagraphElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <p className={`text-xs sm:text-sm text-slate-500 leading-relaxed ${className}`} {...props}>
    {children}
  </p>
);

export const CardContent: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`p-5 sm:p-6 ${className}`} {...props}>
    {children}
  </div>
);

export const CardFooter: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  children,
  className = '',
  ...props
}) => (
  <div className={`p-4 sm:p-6 bg-slate-50/60 rounded-b-2xl border-t border-slate-100 ${className}`} {...props}>
    {children}
  </div>
);
