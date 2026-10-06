import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useLanguage } from '../contexts/LanguageContext';
import {
  ArrowRight,
  BookOpen,
  Cpu,
  Sparkles,
  Users,
  WifiOff,
  Globe2,
  Smartphone,
  CheckCircle2,
  Volume2,
  BarChart,
  Shield,
  Layers,
  ChevronRight,
  GraduationCap,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { t } = useLanguage();
  const [activeWorkflowStep, setActiveWorkflowStep] = useState<number>(0);

  const workflowSteps = [
    {
      id: 'student',
      title: '1. Student',
      subtitle: 'Accessible Entry Point',
      icon: GraduationCap,
      color: 'bg-blue-50 text-blue-700 border-blue-200',
      description:
        'A student logs in from a shared smartphone, 2G connection, or local village kiosk in their preferred language.',
      metric: 'Zero-pressure micro-diagnostic',
    },
    {
      id: 'ai-engine',
      title: '2. AI Learning Engine',
      subtitle: 'Adaptive Knowledge Graph',
      icon: Cpu,
      color: 'bg-purple-50 text-purple-700 border-purple-200',
      description:
        'Diagnoses the student’s exact conceptual mastery level, detects prerequisite gaps, and sizes lessons to byte-sized micro-units.',
      metric: 'Runs locally or in <200KB payload',
    },
    {
      id: 'personalized',
      title: '3. Personalized Learning',
      subtitle: 'Multimodal Delivery',
      icon: Sparkles,
      color: 'bg-amber-50 text-amber-700 border-amber-200',
      description:
        'Delivers personalized questions, vernacular voice explainers, and interactive simulations that cache seamlessly for offline study.',
      metric: 'Voice hints & audio stories',
    },
    {
      id: 'teacher',
      title: '4. Teacher Support',
      subtitle: 'Actionable Superpowers',
      icon: Users,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      description:
        'Alerts the rural school teacher with grouping recommendations, pinpointing struggling concepts before students fall behind.',
      metric: 'Zero manual data entry',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-brand-50/60 via-white to-slate-50 border-b border-slate-200/70">
        {/* Subtle background decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 pointer-events-none opacity-40 overflow-hidden">
          <div className="absolute -top-32 left-1/4 w-96 h-96 bg-brand-200/50 rounded-full blur-3xl" />
          <div className="absolute -top-20 right-1/4 w-80 h-80 bg-saffron-200/40 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 mb-6">
            <Badge variant="saffron" size="md">
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              Pan-India Rural EdTech Platform
            </Badge>
            <span className="text-xs font-semibold text-slate-500 hidden sm:inline">
              Built for Intermittent Connectivity & Shared Devices
            </span>
          </div>

          {/* Headline & Subheadline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]">
            Learning That Adapts to <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-brand-700 via-brand-600 to-saffron-600 bg-clip-text text-transparent">
              Every Student.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2.5xl mx-auto leading-relaxed">
            ShikshaSetu connects students, teachers, and learning resources through personalized,
            accessible, and low-bandwidth learning.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 max-w-md mx-auto">
            <Link to="/student" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" className="w-full sm:w-auto" rightIcon={<ArrowRight className="w-4 h-4" />}>
                {t('startLearning')}
              </Button>
            </Link>
            <Link to="/how-it-works" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                {t('explorePlatform')}
              </Button>
            </Link>
          </div>

          {/* VISUAL REPRESENTATION: Student → AI Learning Engine → Personalized Learning → Teacher Support */}
          <div className="mt-16 max-w-5xl mx-auto">
            <div className="text-xs font-extrabold uppercase tracking-widest text-slate-400 mb-4 text-center">
              The ShikshaSetu Continuous Adaptation Loop
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
              {workflowSteps.map((step, idx) => {
                const Icon = step.icon;
                const isSelected = activeWorkflowStep === idx;
                return (
                  <div
                    key={step.id}
                    onClick={() => setActiveWorkflowStep(idx)}
                    className={`relative p-5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white border-brand-500 shadow-elevated ring-2 ring-brand-500/20'
                        : 'bg-white/80 border-slate-200/80 hover:border-slate-300 hover:bg-white'
                    }`}
                  >
                    {/* Step indicator */}
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2.5 rounded-xl border ${step.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-400">Step {idx + 1}</span>
                    </div>

                    <h3 className="text-sm font-bold text-slate-900">{step.title}</h3>
                    <p className="text-xs font-semibold text-brand-600 mt-0.5">{step.subtitle}</p>
                    <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                      {step.description}
                    </p>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <span className="font-medium text-emerald-600">{step.metric}</span>
                      {idx < 3 && (
                        <ArrowRight className="hidden lg:block w-3.5 h-3.5 text-slate-300 -mr-7 z-10" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Resiliency Metric Badges */}
          <div className="mt-14 pt-8 border-t border-slate-200/60 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-black text-brand-900">&lt; 200 KB</div>
              <p className="text-xs text-slate-500 mt-1">Average Lesson Payload</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-brand-900">100%</div>
              <p className="text-xs text-slate-500 mt-1">Offline Cache Capable</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-brand-900">6+</div>
              <p className="text-xs text-slate-500 mt-1">Indian Languages Supported</p>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-black text-brand-900">45:1 → 1:1</div>
              <p className="text-xs text-slate-500 mt-1">Classroom Ratio Personalized</p>
            </div>
          </div>
        </div>
      </section>

      {/* CORE PHILOSOPHY & ANTI-STEREOTYPE STATEMENT */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <Badge variant="brand" size="md">
                Equity & Dignity
              </Badge>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight leading-snug">
                Equal Talent. <br />
                Unequal Access to Tools.
              </h2>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Rural students across India possess the exact same intellectual curiosity,
                problem-solving instincts, and ambition as any urban learner. What they lack is
                not cognitive capacity—it is access to continuous electricity, individual devices,
                high-speed bandwidth, and instruction in their native mother tongue.
              </p>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-medium">
                ShikshaSetu removes these friction points so their natural brilliance can flourish.
              </p>

              <div className="space-y-3 pt-2">
                {[
                  'Technology adapts to the student’s real life, not an ideal lab scenario.',
                  'Shared smartphone profiles allow siblings to learn without data collision.',
                  'Audio-first explanations bridge language and reading fluency hurdles.',
                  'Local mesh caching lets village schools learn during prolonged grid outages.',
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="text-xs sm:text-sm text-slate-700 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white shadow-elevated relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <BookOpen className="w-48 h-48" />
                </div>
                <div className="relative z-10 space-y-6">
                  <div className="inline-block px-3 py-1 rounded-full bg-saffron-500/20 text-saffron-400 text-xs font-bold uppercase tracking-wider">
                    Product Principle in Action
                  </div>
                  <blockquote className="text-xl sm:text-2xl font-bold leading-relaxed text-slate-100">
                    "Technology should adapt to the student—not the student to the technology."
                  </blockquote>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Rather than requiring expensive laptops or 5G fiber, ShikshaSetu runs effortlessly
                    on 7-year-old budget smartphones, compresses multimedia into fractional voice
                    clips, and syncs learning progress when the student briefly passes near a village
                    bus stand or school Wi-Fi hot spot.
                  </p>
                  <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                    <div className="text-xs font-semibold text-slate-300">
                      National Educational Curriculum Aligned
                    </div>
                    <Link to="/about" className="text-xs font-bold text-saffron-400 hover:text-saffron-300 flex items-center gap-1">
                      Read Full Manifesto <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* THREE PILLARS: STUDENTS, TEACHERS, SCHOOLS */}
      <section className="py-16 sm:py-24 bg-slate-50 border-y border-slate-200/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="forest" size="md">
              Inclusive Ecosystem
            </Badge>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
              Built for Every Stakeholder
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-2">
              Transforming the entire rural education loop from learners to classrooms and regional
              administration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* For Students */}
            <Card variant="elevated" className="flex flex-col justify-between">
              <CardContent className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 text-saffron-600 flex items-center justify-center font-bold">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">For Students</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Bite-sized, gamified daily quests that meet you at your exact comprehension level.
                  Mother tongue voice explanations remove intimidation and build confidence in
                  Math and Science.
                </p>
                <ul className="space-y-2 text-xs text-slate-600 pt-2">
                  <li className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-saffron-600" />
                    <span>Vernacular Audio Explanations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <WifiOff className="w-4 h-4 text-saffron-600" />
                    <span>Works completely without active internet</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-saffron-600" />
                    <span>Shared phone profile separation</span>
                  </li>
                </ul>
              </CardContent>
              <div className="p-5 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
                <Link to="/for-students" className="text-xs font-bold text-brand-700 flex items-center gap-1">
                  Explore Student Experience <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>

            {/* For Teachers */}
            <Card variant="elevated" className="flex flex-col justify-between">
              <CardContent className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
                  <Sparkles className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">For Teachers</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Supercharge multi-grade single-classroom educators. Automatically group students
                  by conceptual bottlenecks and generate targeted remedial activities in seconds.
                </p>
                <ul className="space-y-2 text-xs text-slate-600 pt-2">
                  <li className="flex items-center gap-2">
                    <BarChart className="w-4 h-4 text-brand-600" />
                    <span>Instant Classroom Mastery Heatmap</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-brand-600" />
                    <span>AI-suggested micro-interventions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-brand-600" />
                    <span>Voice dispatches to parents in local dialect</span>
                  </li>
                </ul>
              </CardContent>
              <div className="p-5 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
                <Link to="/for-teachers" className="text-xs font-bold text-brand-700 flex items-center gap-1">
                  Explore Teacher Cockpit <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>

            {/* For Schools */}
            <Card variant="elevated" className="flex flex-col justify-between">
              <CardContent className="space-y-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-forest-600 flex items-center justify-center font-bold">
                  <Layers className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">For Schools & Hubs</h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Institutional coordination for remote government schools and community learning
                  centers. Track device battery health, sync age, and curriculum milestones across
                  grades.
                </p>
                <ul className="space-y-2 text-xs text-slate-600 pt-2">
                  <li className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <span>Tablet & Community Phone fleet manager</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-emerald-600" />
                    <span>Local Raspberry Pi Edge Cache server ready</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Globe2 className="w-4 h-4 text-emerald-600" />
                    <span>District & State UDISE+ reporting</span>
                  </li>
                </ul>
              </CardContent>
              <div className="p-5 border-t border-slate-100 bg-slate-50/50 rounded-b-2xl">
                <Link to="/for-schools" className="text-xs font-bold text-brand-700 flex items-center gap-1">
                  Explore School Hub <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CALL TO ACTION */}
      <section className="py-16 bg-brand-800 text-white relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Ready to bridge your classroom to better learning?
          </h2>
          <p className="mt-4 text-sm sm:text-base text-brand-100 max-w-xl mx-auto leading-relaxed">
            Experience the adaptive engine immediately or register your school for the offline edge
            pilot.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link to="/student">
              <Button size="lg" variant="saffron" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Try Student Portal Now
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                Register Your School
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
