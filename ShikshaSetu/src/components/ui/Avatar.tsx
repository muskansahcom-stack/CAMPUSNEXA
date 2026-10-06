import React from 'react';
import { UserRole } from '../../types';

export interface AvatarProps {
  src?: string;
  name: string;
  role?: UserRole;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  role,
  size = 'md',
  className = '',
}) => {
  const [imageError, setImageError] = React.useState(false);

  const getInitials = (n: string) => {
    const parts = n.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  const sizeClasses = {
    sm: 'w-7 h-7 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const roleBadgeColors: Record<UserRole, string> = {
    student: 'bg-saffron-500 text-slate-950',
    teacher: 'bg-brand-600 text-white',
    school_admin: 'bg-forest-600 text-white',
  };

  return (
    <div className="relative inline-block shrink-0">
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden flex items-center justify-center font-bold bg-brand-100 text-brand-800 border-2 border-white shadow-sm ${className}`}
      >
        {src && !imageError ? (
          <img
            src={src}
            alt={name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{getInitials(name)}</span>
        )}
      </div>

      {role && (
        <span
          title={`Role: ${role}`}
          className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black uppercase ${roleBadgeColors[role]}`}
        >
          {role[0]}
        </span>
      )}
    </div>
  );
};
