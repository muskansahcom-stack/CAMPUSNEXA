import React from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import {
  Layers,
  HardDrive,
  Wifi,
  ShieldCheck,
  Building2,
  Battery,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export const ForSchoolsPage: React.FC = () => {
  return (
    <div className="py-12 sm:py-20 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <Badge variant="forest" size="md">
            For Institutions & Communities
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Built for Rural School Infrastructure
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            From single-teacher panchayat learning centers to regional government high schools,
            ShikshaSetu manages hardware health, offline synchronization, and state curriculum
            benchmarks.
          </p>
          <div className="pt-2">
            <Link to="/admin">
              <Button size="lg" variant="primary" rightIcon={<ArrowRight className="w-4 h-4" />}>
                View School Admin Hub
              </Button>
            </Link>
          </div>
        </div>

        {/* 3 Capabilities */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="elevated" className="p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-forest-600 flex items-center justify-center font-bold">
              <HardDrive className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Local Edge Micro-Servers</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              A low-cost Raspberry Pi or old desktop acts as an offline intranet server. School
              tablets synchronize without spending a single rupee on cellular data.
            </p>
          </Card>

          <Card variant="elevated" className="p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-saffron-600 flex items-center justify-center font-bold">
              <Battery className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Hardware Fleet Telemetry</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Track battery percentages, hardware health, and sync ages across all community tablets
              and shared village smartphones in one unified dashboard.
            </p>
          </Card>

          <Card variant="elevated" className="p-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-brand-700 flex items-center justify-center font-bold">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">District & UDISE+ Reporting</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automated aggregation of competency levels aligned with national curricula, allowing
              headmasters to generate compliance and progress reports effortlessly.
            </p>
          </Card>
        </div>

        {/* Onboarding Box */}
        <div className="bg-white p-8 sm:p-10 rounded-3xl border border-slate-200 shadow-soft flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-slate-900">
              Pilot ShikshaSetu in Your School or Block
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg">
              We provide free open deployment blueprints, offline cache packages, and teacher
              workshops for government schools, community centers, and non-profit partners.
            </p>
          </div>
          <Link to="/contact">
            <Button size="md" variant="saffron" className="whitespace-nowrap">
              Request School Pilot
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
