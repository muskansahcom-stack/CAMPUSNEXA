import React from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import {
  Cpu,
  WifiOff,
  Volume2,
  Smartphone,
  BarChart3,
  Layers,
  Globe2,
  BatteryCharging,
  ShieldCheck,
  Zap,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export const FeaturesPage: React.FC = () => {
  const featureList = [
    {
      icon: Cpu,
      title: 'Contextual Adaptive Engine',
      category: 'Pedagogy',
      desc: 'Dynamically adapts question difficulty, problem wording, and pacing to the learner’s demonstrable understanding rather than arbitrary grade benchmarks.',
    },
    {
      icon: WifiOff,
      title: '100% Offline-Capable PWA',
      category: 'Resilience',
      desc: 'Complete offline persistence via modern Service Workers and IndexedDB. Learners can complete entire units and quizzes without maintaining a live network link.',
    },
    {
      icon: Volume2,
      title: 'Vernacular Audio Explanations',
      category: 'Inclusion',
      desc: 'Voice prompts and audio hints recorded in natural, comforting regional dialects to assist students developing reading fluency.',
    },
    {
      icon: Smartphone,
      title: 'Shared Device Co-Profiles',
      category: 'Accessibility',
      desc: 'Allows multiple siblings or peers to utilize a single family smartphone without conflating mastery scores, streaks, or lesson progress.',
    },
    {
      icon: BarChart3,
      title: 'Teacher Diagnostic Heatmap',
      category: 'Educator Superpower',
      desc: 'Provides teachers with an instant matrix of classroom conceptual blockers, grouping students for 10-minute peer circles effortlessly.',
    },
    {
      icon: BatteryCharging,
      title: 'Ultra-Low Battery & 2G Profile',
      category: 'Efficiency',
      desc: 'Payloads under 200KB, muted background animations, and high daylight contrast to preserve phone battery and function on spotty 2G/EDGE networks.',
    },
    {
      icon: Layers,
      title: 'Local Edge Server Sync',
      category: 'Infrastructure',
      desc: 'Compatible with school-based Raspberry Pi offline caches. Synchronizes tablets over zero-cost local Wi-Fi without needing internet uplink.',
    },
    {
      icon: Globe2,
      title: 'Six Regional Indian Languages',
      category: 'Multilingual',
      desc: 'First-class support for Hindi, Bengali, Marathi, Telugu, Tamil, and English, with seamless on-the-fly toggling during lessons.',
    },
    {
      icon: ShieldCheck,
      title: 'Supabase-Ready RLS Security',
      category: 'Enterprise Quality',
      desc: 'Backend architecture with strict Row-Level Security ensuring absolute privacy of student data, school records, and teacher interventions.',
    },
  ];

  return (
    <div className="py-12 sm:py-20 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="brand" size="md">
            Production-Grade Capabilities
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Features Built for Real-World Rural Conditions
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Every feature in ShikshaSetu is engineered around real community infrastructure—solving
            for shared handsets, power cuts, linguistic richness, and educator bandwidth.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featureList.map((f, i) => {
            const Icon = f.icon;
            return (
              <Card key={i} variant="elevated" className="p-6 flex flex-col justify-between">
                <CardContent className="p-0 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-11 h-11 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
                      <Icon className="w-5 h-5" />
                    </div>
                    <Badge variant="neutral" size="sm">
                      {f.category}
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{f.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Interactive Try-it CTA */}
        <div className="p-8 sm:p-12 rounded-3xl bg-brand-900 text-white text-center space-y-6 max-w-4xl mx-auto shadow-elevated">
          <div className="inline-flex p-3 rounded-2xl bg-saffron-500/20 text-saffron-400">
            <Zap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold">
            Ready to explore these features in real time?
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            Switch between the Student, Teacher, and School Admin portals to see how adaptive
            quizzing, audio hints, and classroom heatmaps function together.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link to="/student">
              <Button variant="saffron" size="md">
                Launch Student Portal
              </Button>
            </Link>
            <Link to="/teacher">
              <Button variant="outline" size="md" className="text-white border-white/20 hover:bg-white/10">
                Launch Teacher Cockpit
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
