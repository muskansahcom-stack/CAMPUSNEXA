import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import {
  Compass,
  Cpu,
  Layers,
  ArrowRight,
  Wifi,
  Sparkles,
  Volume2,
  CheckCircle,
  HelpCircle,
  TrendingUp,
} from 'lucide-react';

export const HowItWorksPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'flow' | 'graph'>('flow');

  const steps = [
    {
      step: '01',
      title: 'Gentle Baseline Diagnostic',
      desc: 'Instead of an intimidating 50-question exam, students answer 3 contextual daily challenges. The engine detects confidence, response hesitation, and core conceptual anchors.',
      badge: 'Zero Anxiety',
    },
    {
      step: '02',
      title: 'Prerequisite Graph Mapping',
      desc: 'If a student struggles with algebraic equations, the system doesn’t repeat the question—it identifies that the underlying gap is fractional division from 2 grades prior.',
      badge: 'Root-Cause AI',
    },
    {
      step: '03',
      title: 'Bite-Sized Multimodal Delivery',
      desc: 'Concepts are taught in 5-to-8 minute audio-visual capsules using relatable real-world analogies (market bargaining, land division, solar pump operation).',
      badge: '<200KB Cached',
    },
    {
      step: '04',
      title: 'Offline Sync & Mesh Reconnect',
      desc: 'Answers, hints requested, and mastery scores are stored securely in IndexedDB offline. When connection is briefly detected, telemetry syncs in milliseconds.',
      badge: 'Zero Lost Progress',
    },
    {
      step: '05',
      title: 'Teacher Cockpit Action Loop',
      desc: 'The educator sees high-impact groupings: "Group 3 needs 10 minutes on balance equations today." The teacher is empowered as the hero of the classroom.',
      badge: 'Educator Superpower',
    },
  ];

  return (
    <div className="py-12 sm:py-20 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="saffron" size="md">
            The Technology & Pedagogy
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            How ShikshaSetu Bridges the Learning Gap
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            A look under the hood of our lightweight adaptive knowledge engine designed to operate
            under severe physical constraints without sacrificing academic rigour.
          </p>
        </div>

        {/* 5-Step Adaptive Timeline */}
        <div className="space-y-6">
          {steps.map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col sm:flex-row items-start gap-6 p-6 sm:p-8 bg-white rounded-3xl border border-slate-200/80 shadow-soft transition-all hover:border-slate-300"
            >
              <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-700 border border-brand-200/60 flex items-center justify-center font-black text-xl shrink-0">
                {item.step}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                  <Badge variant="brand" size="sm">
                    {item.badge}
                  </Badge>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Knowledge Graph Concept Box */}
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-elevated">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-800">
            <div>
              <span className="text-xs uppercase font-extrabold text-saffron-400 tracking-wider">
                Under the Hood: Adaptive Prerequisite Graph
              </span>
              <h2 className="text-xl sm:text-2xl font-bold mt-1">
                Pinpointing the Hidden Blocker
              </h2>
            </div>
            <Badge variant="saffron" size="sm">
              Live Pedagogy Model
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-slate-300">
            <div className="p-5 rounded-2xl bg-slate-800/80 border border-slate-700/60 space-y-2">
              <span className="text-[11px] font-bold text-red-400 uppercase tracking-wider">
                Observed Symptom
              </span>
              <h4 className="text-base font-bold text-white">Struggling with 2x + 5 = 15</h4>
              <p className="text-xs text-slate-400">
                Traditional platforms repeat 10 more algebra drills, causing frustration and
                disengagement.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-brand-950/80 border border-brand-800/80 space-y-2">
              <span className="text-[11px] font-bold text-saffron-400 uppercase tracking-wider">
                ShikshaSetu Diagnostic
              </span>
              <h4 className="text-base font-bold text-white">Detects Concept Imbalance</h4>
              <p className="text-xs text-slate-300">
                The engine discovers the student hasn’t solidified the physical concept of balance
                subtraction.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-emerald-950/80 border border-emerald-800/80 space-y-2">
              <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                Targeted Remediation
              </span>
              <h4 className="text-base font-bold text-white">3-Min Grocery Scale Model</h4>
              <p className="text-xs text-slate-300">
                A vernacular audio story about balancing grain bags on a market scale rebuilds the
                intuition.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-8 border-t border-slate-200">
          <Link to="/student">
            <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
              Try an Adaptive Question Now
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
