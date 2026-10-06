import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';
import { ShieldCheck, HeartHandshake, Zap, Sparkles } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Core Principle Banner */}
        <div className="mb-12 p-6 rounded-3xl bg-gradient-to-r from-brand-950 via-slate-900 to-brand-900 border border-brand-800/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-saffron-500/20 text-saffron-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs uppercase font-extrabold tracking-wider text-saffron-400">
                Core Product Principle
              </p>
              <h4 className="text-base sm:text-lg font-bold text-white mt-0.5">
                "Technology should adapt to the student—not the student to the technology."
              </h4>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 bg-slate-800/80 px-4 py-2 rounded-xl">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Built for Low-Bandwidth & Device Resilience</span>
          </div>
        </div>

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <Logo size="lg" inverted showTagline />
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              ShikshaSetu is an AI-powered adaptive learning platform designed for students in rural
              communities across India. It personalizes learning according to each student's current
              understanding, pace, preferred language, device availability, and connectivity.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-brand-400" />
                <span>Supabase Ready</span>
              </span>
              <span className="flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-saffron-400" />
                <span>Pan-India Rural Reach</span>
              </span>
            </div>
          </div>

          {/* Public Pages */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Explore Platform
            </h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/" className="hover:text-white transition-colors">
                  Home Overview
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About ShikshaSetu
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="hover:text-white transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/features" className="hover:text-white transition-colors">
                  Adaptive Features
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Contact & Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Stakeholders */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              For Communities
            </h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/for-students" className="hover:text-white transition-colors">
                  For Students
                </Link>
              </li>
              <li>
                <Link to="/for-teachers" className="hover:text-white transition-colors">
                  For Teachers
                </Link>
              </li>
              <li>
                <Link to="/for-schools" className="hover:text-white transition-colors">
                  For Rural Schools
                </Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">
                  Account Sign In
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">
                  School Registration
                </Link>
              </li>
            </ul>
          </div>

          {/* Portals */}
          <div>
            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-4">
              Active Portals
            </h5>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li>
                <Link to="/student" className="hover:text-saffron-400 transition-colors font-medium">
                  Student Learning Portal →
                </Link>
              </li>
              <li>
                <Link to="/teacher" className="hover:text-saffron-400 transition-colors font-medium">
                  Teacher Cockpit →
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-saffron-400 transition-colors font-medium">
                  School Administration Hub →
                </Link>
              </li>
              <li className="pt-2 text-[11px] text-slate-500">
                PWA Enabled • Works on low-end 2G & offline
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} ShikshaSetu. All rights reserved across Indian States & Territories.</p>
          <p className="text-slate-400">
            Dignity, Equity, and Excellence in Rural Education.
          </p>
        </div>
      </div>
    </footer>
  );
};
