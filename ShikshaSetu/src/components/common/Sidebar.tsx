import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import {
  BookOpen,
  Award,
  Download,
  Users,
  Compass,
  BarChart3,
  HardDrive,
  LogOut,
  Sparkles,
  Wifi,
  ShieldCheck,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, profile, role, logout } = useAuth();
  const navigate = useNavigate();

  const studentLinks = [
    { to: '/student', label: 'Home Dashboard', icon: Sparkles },
    { to: '/student?tab=growth', label: 'My Growth & Badges', icon: Award },
    { to: '/student?tab=learn', label: 'Learning Journey', icon: BookOpen },
    { to: '/student?tab=practice', label: 'Adaptive Practice', icon: Compass },
    { to: '/student?tab=ai-teacher', label: 'AI Voice Teacher', icon: Download },
    { to: '/student?tab=profile', label: 'Companion Profile', icon: Users },
  ];

  const teacherLinks = [
    { to: '/teacher', label: 'Class Heatmap', icon: BarChart3 },
    { to: '/teacher?tab=interventions', label: 'AI Interventions', icon: Sparkles },
    { to: '/teacher?tab=roster', label: 'Student Roster', icon: Users },
  ];

  const adminLinks = [
    { to: '/admin', label: 'School Overview', icon: BarChart3 },
    { to: '/admin?tab=students', label: 'Students', icon: Users },
    { to: '/admin?tab=teachers', label: 'Faculty Staff', icon: BookOpen },
    { to: '/admin?tab=classes', label: 'Classrooms', icon: Compass },
    { to: '/admin?tab=content', label: 'Content Approval', icon: Sparkles },
    { to: '/admin?tab=analytics', label: 'School Analytics', icon: BarChart3 },
  ];

  const activeLinks =
    role === 'teacher' ? teacherLinks : role === 'school_admin' ? adminLinks : studentLinks;

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200/80 bg-white min-h-[calc(100vh-5rem)] p-4 shrink-0">
      {/* Current Verified Profile Summary */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 mb-5">
        <div className="flex items-center gap-3">
          <Avatar
            name={profile?.full_name || user?.email || 'User'}
            src={profile?.avatar_url || undefined}
            role={role || 'student'}
            size="md"
          />
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold text-slate-900 truncate">
              {profile?.full_name || user?.email?.split('@')[0]}
            </h4>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Badge variant="brand" size="sm">
                {role?.replace('_', ' ')}
              </Badge>
            </div>
            <p className="text-[10px] text-slate-400 truncate mt-1">
              {user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Role Navigation Items */}
      <div className="flex-1 space-y-1">
        <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {role?.replace('_', ' ')} Workspace
        </div>
        {activeLinks.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 border border-brand-200/60'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`
              }
            >
              <Icon className="w-4 h-4 text-brand-600 shrink-0" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      {/* RLS Security Status & Sign Out */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 text-[10px] text-slate-500 flex items-start gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
          <span>PostgreSQL Row-Level Security active. Role cannot be escalated from client.</span>
        </div>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};
