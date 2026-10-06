import React from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  BarChart3,
  Users,
  Mic,
  ArrowRight,
  Clock,
  CheckCircle2,
  HeartHandshake,
} from 'lucide-react';

export const ForTeachersPage: React.FC = () => {
  return (
    <div className="py-12 sm:py-20 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="brand" size="md">
            For Rural Educators
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Superpowers for the Multi-Grade Classroom
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Rural teachers carry an immense load, often teaching multiple grades in a single room.
            ShikshaSetu acts as your intelligent teaching companion, surfacing exactly who needs
            support and how to provide it in minutes.
          </p>
          <div className="pt-2">
            <Link to="/teacher">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Open Teacher Cockpit
              </Button>
            </Link>
          </div>
        </div>

        {/* 3 Core Teacher Superpowers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="elevated" className="p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-700 flex items-center justify-center font-bold">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Classroom Heatmap</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Instantly see conceptual roadblocks across all 45 students in your class. Know exactly
              which concept needs whole-class review before moving forward.
            </p>
          </Card>

          <Card variant="elevated" className="p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">AI Remedial Actions</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              No manual worksheet prep. Receive concrete recommendations: "Pair Aarav with Kavita
              for 10 minutes on balance equations," or "Print 1-page tactile worksheet."
            </p>
          </Card>

          <Card variant="elevated" className="p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-forest-600 flex items-center justify-center font-bold">
              <Mic className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Vernacular Voice Notes</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Record a 30-second audio progress update in Marathi, Hindi, or Assamese for parents who
              may not read written report cards, fostering deep community trust.
            </p>
          </Card>
        </div>

        {/* Teacher quote */}
        <div className="bg-slate-900 text-white p-8 sm:p-10 rounded-3xl shadow-elevated space-y-4">
          <div className="flex items-center gap-3">
            <HeartHandshake className="w-6 h-6 text-saffron-400" />
            <h3 className="text-lg font-bold">Honoring the Dedicated Rural Educator</h3>
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            "Before ShikshaSetu, I spent 2 hours every evening manually checking notebooks to find out
            which student didn’t understand fractions. Now I walk into class with an instant
            breakdown, and I spend all my time doing what I love: teaching and encouraging children."
          </p>
          <p className="text-xs font-semibold text-saffron-400">
            — Meera Deshmukh, Zilla Parishad High School, Wardha
          </p>
        </div>
      </div>
    </div>
  );
};
