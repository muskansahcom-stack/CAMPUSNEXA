import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Home,
  BookOpen,
  Sparkles,
  Bot,
  User,
  BarChart3,
  Users,
  HardDrive,
  Award,
} from 'lucide-react';

export const BottomNavigation: React.FC = () => {
  const { role } = useAuth();
  const location = useLocation();

  // Exactly as requested: Home, Growth, Learn, Practice, AI Teacher
  const studentTabs = [
    { to: '/student', label: 'Home', icon: Home, exact: true },
    { to: '/student?tab=growth', label: 'Growth', icon: Award },
    { to: '/student?tab=learn', label: 'Learn', icon: BookOpen },
    { to: '/student?tab=practice', label: 'Practice', icon: Sparkles },
    { to: '/student?tab=ai-teacher', label: 'AI Teacher', icon: Bot },
  ];

  const teacherTabs = [
    { to: '/teacher', label: 'Heatmap', icon: BarChart3 },
    { to: '/teacher?tab=interventions', label: 'Interventions', icon: Sparkles },
    { to: '/teacher?tab=roster', label: 'Roster', icon: Users },
  ];

  const adminTabs = [
    { to: '/admin', label: 'Overview', icon: BarChart3, exact: true },
    { to: '/admin?tab=students', label: 'Students', icon: Users },
    { to: '/admin?tab=teachers', label: 'Teachers', icon: BookOpen },
    { to: '/admin?tab=classes', label: 'Classes', icon: Sparkles },
    { to: '/admin?tab=analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const tabs =
    role === 'teacher' ? teacherTabs : role === 'school_admin' ? adminTabs : studentTabs;

  const isTabActive = (tabTo: string, isExact?: boolean) => {
    const currentFull = location.pathname + location.search;
    if (isExact) {
      return location.pathname === '/student' && (!location.search || location.search === '');
    }
    return currentFull === tabTo;
  };

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-1.5 shadow-elevated">
      <div className="flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isTabActive(tab.to, (tab as any).exact);
          return (
            <NavLink
              key={tab.label}
              to={tab.to}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[10px] font-bold transition-all ${
                active
                  ? 'text-brand-700 font-extrabold scale-105'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div
                className={`p-1 rounded-lg ${
                  active ? 'bg-brand-50 text-brand-700' : 'text-slate-400'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span className="mt-0.5">{tab.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
