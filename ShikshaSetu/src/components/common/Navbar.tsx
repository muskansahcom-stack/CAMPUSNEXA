import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Logo } from './Logo';
import { LanguageSelector } from './LanguageSelector';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAccessibility } from '../../contexts/AccessibilityContext';
import { useAuth } from '../../contexts/AuthContext';
import { AccessibilitySettingsModal } from '../accessibility/AccessibilitySettingsModal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import {
  Menu,
  X,
  GraduationCap,
  Sparkles,
  Layers,
  LogOut,
  User,
  Eye,
  Settings,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { user, profile, role, logout } = useAuth();
  const { isSettingsModalOpen, openSettingsModal, closeSettingsModal } = useAccessibility();
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { to: '/', label: t('navHome') },
    { to: '/about', label: t('navAbout') },
    { to: '/how-it-works', label: t('navHowItWorks') },
    { to: '/features', label: t('navFeatures') },
    { to: '/for-students', label: t('navForStudents') },
    { to: '/for-teachers', label: t('navForTeachers') },
    { to: '/for-schools', label: t('navForSchools') },
    { to: '/contact', label: t('navContact') },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '';
    return location.pathname.startsWith(path);
  };

  const dashboardPath =
    role === 'student' ? '/student' : role === 'teacher' ? '/teacher' : '/admin';

  const handleSignOut = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Logo size="md" showTagline />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isActive(link.to)
                    ? 'text-brand-700 bg-brand-50'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Action Cluster */}
          <div className="hidden md:flex items-center gap-3">
            {/* Language Switcher */}
            <LanguageSelector />

            {/* Accessibility & Display Settings Modal Trigger */}
            <button
              type="button"
              onClick={openSettingsModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] text-xs font-semibold rounded-2xl bg-white border border-slate-200 text-slate-700 hover:border-slate-300 shadow-xs transition-all focus:outline-none focus:ring-2 focus:ring-brand-500"
              aria-label="Display & Accessibility Settings"
              title="Display & Accessibility Settings"
            >
              <Eye className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span className="hidden lg:inline">{t('common.settings')}</span>
            </button>

            {/* Authenticated User Status or Guest Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-2.5">
                <Link
                  to={dashboardPath}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-brand-200 bg-brand-50 text-brand-900 text-xs font-bold hover:bg-brand-100 transition-colors"
                >
                  <User className="w-3.5 h-3.5 text-brand-700" />
                  <span className="max-w-[120px] truncate">{profile?.full_name || user.email}</span>
                  <Badge variant="brand" size="sm">
                    {role?.replace('_', ' ')}
                  </Badge>
                </Link>

                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleSignOut}
                  className="text-slate-500 hover:text-red-600"
                  leftIcon={<LogOut className="w-3.5 h-3.5" />}
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button size="sm" variant="ghost">
                    {t('login')}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button size="sm" variant="saffron">
                    {t('register')}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 xl:hidden">
            <LanguageSelector variant="minimal" />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-2 pb-3 border-b border-slate-100">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`px-3 py-2 rounded-xl text-xs font-semibold ${
                  isActive(link.to)
                    ? 'text-brand-700 bg-brand-50'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {user ? (
            <div className="space-y-2 pt-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="font-bold text-slate-900 truncate">{profile?.full_name || user.email}</div>
                <div className="text-[11px] text-slate-500 capitalize mt-0.5">
                  Verified Role: <span className="font-bold text-brand-700">{role?.replace('_', ' ')}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to={dashboardPath} className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" variant="primary" className="w-full">
                    Open My Dashboard
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleSignOut();
                  }}
                  className="text-red-600"
                >
                  Sign Out
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link to="/login" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" variant="outline" className="w-full">
                  {t('login')}
                </Button>
              </Link>
              <Link to="/register" className="flex-1" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" variant="saffron" className="w-full">
                  {t('register')}
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Global Accessibility & Display Settings Modal */}
      <AccessibilitySettingsModal
        isOpen={isSettingsModalOpen}
        onClose={closeSettingsModal}
      />
    </header>
  );
};
