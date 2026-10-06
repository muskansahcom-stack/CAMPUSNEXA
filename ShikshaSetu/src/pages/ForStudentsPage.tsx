import React from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Volume2,
  Award,
  Smartphone,
  ArrowRight,
  WifiOff,
  CheckCircle2,
  Clock,
  Heart,
} from 'lucide-react';

export const ForStudentsPage: React.FC = () => {
  return (
    <div className="py-12 sm:py-20 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="saffron" size="md">
            For Students
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Learn at Your Own Pace, In Your Own Language
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            No fear of wrong answers, no competitive ranking pressure, and no heavy data downloads.
            Just step-by-step mastery designed to make learning exciting and intuitive.
          </p>
          <div className="pt-2">
            <Link to="/student">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Go to My Student Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* 3 Student Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="elevated" className="p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-saffron-600 flex items-center justify-center font-bold">
              <Volume2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Audio Voice Hints</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Don’t understand a big word in a science problem? Tap the speaker icon to hear a
              warm, friendly explanation in your mother tongue with everyday examples.
            </p>
          </Card>

          <Card variant="elevated" className="p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Daily 10-Minute Quests</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Complete short, bite-sized quests. 3 to 5 questions daily build long-term retention
              without requiring hours on your parents' shared phone screen.
            </p>
          </Card>

          <Card variant="elevated" className="p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-forest-600 flex items-center justify-center font-bold">
              <WifiOff className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">100% Offline Practice</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Download your weekly lessons in seconds at school or the village center, then practice
              at home even when the mobile network or power goes off.
            </p>
          </Card>
        </div>

        {/* Shared Phone Safe Experience */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-soft space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700">
              <Smartphone className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">
              Sharing a Phone with Siblings? No Problem.
            </h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed">
            In many rural families, brothers and sisters take turns using a single mobile handset in
            the evening. ShikshaSetu includes a 1-tap sibling profile switcher that keeps everyone's
            progress, badges, and learning levels completely separate.
          </p>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-saffron-100 text-saffron-800 font-bold flex items-center justify-center">
                AS
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Aarav (Grade 8)</p>
                <p className="text-[11px] text-slate-500">Mastery: 78% • 4 Day Streak</p>
              </div>
            </div>
            <span className="text-xs font-semibold text-brand-700">Active Profile</span>
          </div>
        </div>
      </div>
    </div>
  );
};
