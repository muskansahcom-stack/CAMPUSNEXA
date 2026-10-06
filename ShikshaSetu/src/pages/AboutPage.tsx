import React from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import {
  Heart,
  Target,
  Compass,
  Award,
  Sparkles,
  CheckCircle2,
  Users2,
  Smartphone,
  Wifi,
  Languages,
} from 'lucide-react';

export const AboutPage: React.FC = () => {
  const pillars = [
    {
      icon: Wifi,
      title: 'Bandwidth & Offline Equity',
      desc: 'Lessons operate with ultra-compressed sub-200KB payloads and cache fully onto devices so learning never halts when cell towers lose power.',
    },
    {
      icon: Smartphone,
      title: 'Shared Device Architecture',
      desc: 'Most rural homes share a single smartphone among working parents and siblings. ShikshaSetu isolates sibling accounts with PIN-free voice and visual signatures.',
    },
    {
      icon: Languages,
      title: 'Linguistic Dignity & Mother Tongue',
      desc: 'Complex scientific and mathematical intuition starts in the language spoken at home, seamlessly bridging to standard academic terminology.',
    },
    {
      icon: Users2,
      title: 'Empowering the Rural Teacher',
      desc: 'Rural educators frequently balance 40–60 students across multiple grade levels in a single room. Our AI highlights where each child needs attention without paperwork.',
    },
  ];

  return (
    <div className="py-12 sm:py-20 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="brand" size="md">
            Our Purpose & Manifesto
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Bridging Potential to Equal Opportunity
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            ShikshaSetu was conceived on an unwavering conviction: every student across rural
            India has limitless capacity to master modern mathematics, sciences, and literacy when
            technology meets them where they are.
          </p>
        </div>

        {/* The Golden Rule Quote Card */}
        <div className="p-8 sm:p-12 rounded-3xl bg-brand-900 text-white shadow-elevated relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto text-center space-y-6">
            <span className="px-3 py-1 rounded-full bg-saffron-500/20 text-saffron-400 text-xs font-bold uppercase tracking-wider">
              Guiding Product Philosophy
            </span>
            <blockquote className="text-2xl sm:text-3xl font-extrabold leading-snug">
              “Technology should adapt to the student—not the student to the technology.”
            </blockquote>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              If an application fails because the user has a budget handset, intermittent electricity,
              or slow 2G data, the failure is in the engineering, not the learner. ShikshaSetu is
              engineered from the ground up for extreme physical resilience and pedagogical warmth.
            </p>
          </div>
        </div>

        {/* Pan-India Stance & Anti-Stereotyping */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200/80 shadow-soft space-y-6">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            A Pan-India Commitment: Rejecting Stereotypes
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            ShikshaSetu is built for learners across India—from the river islands of Majuli in Assam
            to the arid villages of Jhunjhunu in Rajasthan, the agrarian hills of Wardha in
            Maharashtra, the tribal belts of Kalahandi in Odisha, and rural settlements in Karnataka
            and Tamil Nadu.
          </p>
          <p className="text-sm text-slate-600 leading-relaxed">
            We explicitly refuse the condescending stereotype that rural students need "dumbed-down"
            content. They need the same rigorous, conceptual problem-solving as students in top
            metropolitan schools. What they require is structural bridging:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            {[
              'Content paced to existing understanding, not arbitrary age benchmarks',
              'Explanations that respect their lived experiences and local context',
              'Offline persistence so erratic village power cuts never delete homework',
              'Audio and visual hints that support emergent readers without penalty',
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <CheckCircle2 className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
                <span className="text-xs text-slate-700 font-medium leading-relaxed">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Four Structural Pillars */}
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              The 4 Pillars of Structural Adaptation
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Engineering around realities on the ground rather than wishing them away.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {pillars.map((pillar, i) => {
              const Icon = pillar.icon;
              return (
                <Card key={i} variant="default" className="p-6">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h4 className="text-base font-bold text-slate-900 mb-2">{pillar.title}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">{pillar.desc}</p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-8 border-t border-slate-200">
          <h4 className="text-lg font-bold text-slate-900 mb-4">
            Experience our adaptive learning engine in action
          </h4>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link to="/how-it-works">
              <Button variant="primary" size="md">
                Learn How It Works
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="outline" size="md">
                Partner With Us
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
