import React from 'react';
import { Link } from 'react-router-dom';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  inverted?: boolean;
  className?: string;
  to?: string;
}

export const Logo: React.FC<LogoProps> = ({
  size = 'md',
  showTagline = false,
  inverted = false,
  className = '',
  to = '/',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* SVG Icon */}
      <div className={`${iconSizes[size]} shrink-0 drop-shadow-sm flex items-center justify-center`}>
        <svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
          <defs>
            <linearGradient id="logoBookL" x1="15" y1="35" x2="50" y2="75" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#2563EB" />
              <stop offset="100%" stopColor="#1E3A8A" />
            </linearGradient>
            <linearGradient id="logoBookR" x1="85" y1="35" x2="50" y2="75" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1E3A8A" />
            </linearGradient>
            <linearGradient id="logoBridge" x1="20" y1="50" x2="80" y2="25" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="60%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#EA580C" />
            </linearGradient>
          </defs>

          {/* Bridge Arch spanning up from pages */}
          <path d="M 22 64 C 36 34, 64 34, 78 64 C 70 52, 30 52, 22 64 Z" fill="url(#logoBridge)" />
          
          {/* Bridge Suspender Cables */}
          <line x1="36" y1="44" x2="36" y2="58" stroke="#FEF3C7" strokeWidth="2" strokeLinecap="round" />
          <line x1="50" y1="38" x2="50" y2="55" stroke="#FEF3C7" strokeWidth="2.2" strokeLinecap="round" />
          <line x1="64" y1="44" x2="64" y2="58" stroke="#FEF3C7" strokeWidth="2" strokeLinecap="round" />

          {/* Book Open Pages */}
          <path d="M 50 78 C 38 71, 24 71, 14 74 L 14 42 C 25 38, 38 38, 50 45 Z" fill="url(#logoBookL)" />
          <path d="M 50 78 C 62 71, 76 71, 86 74 L 86 42 C 75 38, 62 38, 50 45 Z" fill="url(#logoBookR)" />
          <path d="M 50 45 L 50 78" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.6" />

          {/* Rising Sun of Enlightenment */}
          <circle cx="50" cy="22" r="5.5" fill="#F59E0B" />
        </svg>
      </div>

      {/* Typography */}
      <div className="flex flex-col text-left">
        <span
          className={`font-extrabold tracking-tight leading-tight ${titleSizes[size]} ${
            inverted ? 'text-white' : 'text-slate-900'
          }`}
        >
          Shiksha<span className="text-saffron-600 font-bold">Setu</span>
        </span>
        {showTagline && (
          <span
            className={`text-[10px] tracking-wide font-medium ${
              inverted ? 'text-slate-300' : 'text-slate-500'
            }`}
          >
            Bridging Every Student
          </span>
        )}
      </div>
    </div>
  );

  if (to) {
    return <Link to={to} className="inline-block focus:outline-none">{content}</Link>;
  }

  return content;
};
