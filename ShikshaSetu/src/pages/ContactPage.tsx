import React, { useState } from 'react';
import { Card, CardContent } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useToast } from '../contexts/ToastContext';
import { Mail, MapPin, Phone, Send, CheckCircle, School } from 'lucide-react';

export const ContactPage: React.FC = () => {
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: '',
    role: 'Teacher',
    schoolName: '',
    districtState: '',
    emailOrPhone: '',
    deviceCount: '1-5 devices',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      showToast({
        type: 'success',
        title: 'Inquiry Submitted Successfully',
        message: 'A ShikshaSetu coordinator will contact you via SMS / Call within 48 hours.',
      });
    }, 1000);
  };

  return (
    <div className="py-12 sm:py-20 bg-slate-50 min-h-screen">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <Badge variant="brand" size="md">
            Get in Touch
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
            Connect with ShikshaSetu
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Whether you are a rural teacher, headmaster, panchayat leader, or education partner, we
            are here to help bring adaptive learning to your students.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Contact Details Column */}
          <div className="lg:col-span-5 space-y-6">
            <Card variant="elevated" className="p-6 space-y-6">
              <h3 className="text-base font-bold text-slate-900">Partner & Support Inquiries</h3>

              <div className="space-y-4 text-xs text-slate-600">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-brand-50 text-brand-700">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Email Address</p>
                    <p className="text-slate-500">support@shikshasetu.org.in</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-50 text-saffron-600">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Toll-Free Educator Helpline</p>
                    <p className="text-slate-500">1800-202-SHIKSHA (Mon-Sat, 9AM - 6PM)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 text-forest-600">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Field Outreach Coordinations</p>
                    <p className="text-slate-500">Active programs across 12 States in India</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <p className="text-[11px] text-slate-400">
                  SMS / WhatsApp callback service available for areas with limited voice connectivity.
                </p>
              </div>
            </Card>
          </div>

          {/* Contact Form Column */}
          <div className="lg:col-span-7">
            <Card variant="elevated" className="p-6 sm:p-8">
              {submitted ? (
                <div className="py-12 text-center space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle className="w-7 h-7" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Thank You for Connecting!</h3>
                  <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto">
                    We received your details. Our regional coordinator will reach out to schedule an
                    offline cache pilot demonstration.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
                    Send Another Inquiry
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    Request Information or Pilot Kit
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    Fill out the form below and we will prepare a customized onboarding recommendation.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Your Full Name"
                      placeholder="e.g. Rameshwar Patnaik"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />

                    <Select
                      label="Your Role"
                      options={[
                        { value: 'Teacher', label: 'Teacher / Educator' },
                        { value: 'Headmaster', label: 'School Headmaster / Principal' },
                        { value: 'Student', label: 'Student / Parent' },
                        { value: 'NGO', label: 'NGO / Foundation' },
                        { value: 'Officer', label: 'Government Education Official' },
                      ]}
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="School / Institution Name"
                      placeholder="e.g. Govt. Model School"
                      required
                      value={form.schoolName}
                      onChange={(e) => setForm({ ...form, schoolName: e.target.value })}
                    />

                    <Input
                      label="District & State"
                      placeholder="e.g. Kalahandi, Odisha"
                      required
                      value={form.districtState}
                      onChange={(e) => setForm({ ...form, districtState: e.target.value })}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      label="Mobile Number or Email"
                      placeholder="e.g. +91 98765 43210"
                      required
                      value={form.emailOrPhone}
                      onChange={(e) => setForm({ ...form, emailOrPhone: e.target.value })}
                    />

                    <Select
                      label="Available Devices for Learners"
                      options={[
                        { value: '1-5 devices', label: '1 - 5 Shared Devices' },
                        { value: '6-15 devices', label: '6 - 15 Devices' },
                        { value: '16+ devices', label: '16+ Tablets / Smart Classroom' },
                        { value: '0 devices', label: 'No Devices Yet (Need Hardware Support)' },
                      ]}
                      value={form.deviceCount}
                      onChange={(e) => setForm({ ...form, deviceCount: e.target.value })}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 text-left">
                    <label className="text-xs font-semibold text-slate-700 tracking-wide">
                      Tell us about your learners or specific requirements
                    </label>
                    <textarea
                      rows={3}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="e.g., We have 45 students in Grade 6-8 with erratic 2G connectivity..."
                      className="w-full rounded-xl border border-slate-300 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                  </div>

                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="w-full mt-2"
                    isLoading={isSubmitting}
                    rightIcon={<Send className="w-4 h-4" />}
                  >
                    Submit Request
                  </Button>
                </form>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
