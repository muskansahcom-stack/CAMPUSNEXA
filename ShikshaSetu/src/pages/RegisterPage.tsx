import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Logo } from '../components/common/Logo';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { supabase } from '../lib/supabase';
import { UserRole, SchoolRow } from '../types/database';
import {
  sanitizeInput,
  validateEmail,
  validatePassword,
  verifyInstitutionalCode,
} from '../lib/securityUtils';
import {
  GraduationCap,
  Sparkles,
  Layers,
  Lock,
  Mail,
  User,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { showToast } = useToast();

  const [selectedRole, setSelectedRole] = useState<UserRole>('student');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [grade, setGrade] = useState('8');
  const [deviceAccess, setDeviceAccess] = useState('shared_phone');
  const [preferredLang, setPreferredLang] = useState('hi');
  const [employeeId, setEmployeeId] = useState('');
  const [institutionalCode, setInstitutionalCode] = useState('');
  const [schoolId, setSchoolId] = useState('');
  const [schools, setSchools] = useState<SchoolRow[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [regError, setRegError] = useState<string | null>(null);
  const [confirmationNotice, setConfirmationNotice] = useState(false);

  // Fetch available schools from database
  useEffect(() => {
    const fetchSchools = async () => {
      try {
        const { data, error } = await supabase
          .from('schools')
          .select('*')
          .order('name');

        if (!error && data && data.length > 0) {
          const rows = data as unknown as SchoolRow[];
          setSchools(rows);
          setSchoolId(rows[0].id);
        } else {
          // Fallback initial schools
          const fallbackSchools: SchoolRow[] = [
            {
              id: '11111111-1111-1111-1111-111111111111',
              name: 'Govt. Higher Secondary School Mandawa (Rajasthan)',
              region: 'North',
              state: 'Rajasthan',
              district: 'Jhunjhunu',
              address: 'Mandawa',
              created_at: new Date().toISOString(),
            },
            {
              id: '22222222-2222-2222-2222-222222222222',
              name: 'Zilla Parishad High School Wardha (Maharashtra)',
              region: 'West',
              state: 'Maharashtra',
              district: 'Wardha',
              address: 'Wardha',
              created_at: new Date().toISOString(),
            },
            {
              id: '33333333-3333-3333-3333-333333333333',
              name: 'Kalahandi Model Residential School (Odisha)',
              region: 'East',
              state: 'Odisha',
              district: 'Kalahandi',
              address: 'Kalahandi',
              created_at: new Date().toISOString(),
            },
            {
              id: '44444444-4444-4444-4444-444444444444',
              name: 'Majuli Adarsha Vidyalaya (Assam)',
              region: 'North-East',
              state: 'Assam',
              district: 'Majuli',
              address: 'Majuli',
              created_at: new Date().toISOString(),
            },
          ];
          setSchools(fallbackSchools);
          setSchoolId(fallbackSchools[0].id);
        }
      } catch (err) {
        console.warn('Could not query schools list:', err);
      }
    };

    fetchSchools();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError(null);

    const sanitizedName = sanitizeInput(fullName);
    const trimmedEmail = email.trim();

    if (!sanitizedName) {
      setRegError('Full Name is required.');
      return;
    }

    if (!validateEmail(trimmedEmail)) {
      setRegError('Please provide a valid email address.');
      return;
    }

    const passCheck = validatePassword(password);
    if (!passCheck.valid) {
      setRegError(passCheck.message || 'Invalid password.');
      return;
    }

    // Role Escalation Defense:
    // Only students can self-register freely.
    // Teachers & Admins must supply a verified institutional key or be enrolled by administration.
    if (selectedRole !== 'student') {
      if (!verifyInstitutionalCode(institutionalCode)) {
        setRegError(
          `Institutional Authorization Required: Creating a ${
            selectedRole === 'teacher' ? 'Teacher' : 'School Admin'
          } account requires a valid Institutional Access Code or UDISE Code provided by school leadership.`
        );
        return;
      }
    }

    setIsLoading(true);

    try {
      await register({
        email: trimmedEmail,
        password,
        fullName: sanitizedName,
        role: selectedRole,
        preferredLanguage: preferredLang,
        schoolId: schoolId || undefined,
        grade: selectedRole === 'student' ? parseInt(grade, 10) : undefined,
        deviceAccess: selectedRole === 'student' ? deviceAccess : undefined,
        employeeId: selectedRole === 'teacher' ? employeeId || `TCH-${Date.now().toString().slice(-4)}` : undefined,
        institutionalCode: selectedRole !== 'student' ? institutionalCode : undefined,
      });

      showToast({
        type: 'success',
        title: 'Account Created Successfully',
        message: `Welcome to ShikshaSetu, ${sanitizedName}! Your profile is securely registered.`,
      });

      // Navigate to respective portal
      const dest =
        selectedRole === 'student'
          ? '/student'
          : selectedRole === 'teacher'
          ? '/teacher'
          : '/admin';
      navigate(dest, { replace: true });
    } catch (err: any) {
      if (err.message?.includes('confirm') || err.message?.includes('verification')) {
        setConfirmationNotice(true);
      } else {
        setRegError(err.message || 'Registration failed. Please check form values.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Logo size="lg" showTagline />
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-4">
          Create Your ShikshaSetu Account
        </h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Real Supabase registration with server-enforced role security
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-elevated border border-slate-200/80 space-y-6">
          {/* Security Banner */}
          <div className="p-3.5 rounded-2xl bg-brand-50/80 border border-brand-200/80 flex items-start gap-2.5 text-xs text-brand-900">
            <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Database Enforced: </span>
              Your profile and permissions are managed by PostgreSQL Row-Level Security.
            </div>
          </div>

          {confirmationNotice ? (
            <div className="text-center py-8 space-y-4 animate-in fade-in">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Registration Complete</h3>
              <p className="text-xs text-slate-600 max-w-sm mx-auto">
                A confirmation email has been dispatched to <strong>{email}</strong>. Please check
                your inbox to verify and proceed to sign in.
              </p>
              <Link to="/login">
                <Button variant="primary" size="md">
                  Go to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              {regError && (
                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                  <span>{regError}</span>
                </div>
              )}

              {/* Role Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Select Your Account Role
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'student' as UserRole, label: 'Student', icon: GraduationCap },
                    { id: 'teacher' as UserRole, label: 'Teacher', icon: Sparkles },
                    { id: 'school_admin' as UserRole, label: 'School Admin', icon: Layers },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = selectedRole === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setSelectedRole(item.id)}
                        className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                          isSelected
                            ? 'border-brand-600 bg-brand-50 text-brand-900 shadow-sm ring-1 ring-brand-500'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <Icon
                          className={`w-5 h-5 mb-1 ${
                            isSelected ? 'text-brand-600' : 'text-slate-400'
                          }`}
                        />
                        <span className="text-xs font-bold">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Basic Fields */}
              <Input
                label="Full Name"
                type="text"
                required
                placeholder="e.g. Aarav Sharma"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Email Address"
                  type="email"
                  required
                  placeholder="e.g. aarav@shikshasetu.org.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                />

                <Input
                  label="Password (min 6 chars)"
                  type="password"
                  required
                  placeholder="Create secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                />
              </div>

              {/* School selection */}
              <Select
                label="Assigned School / Institution"
                options={schools.map((s) => ({
                  value: s.id,
                  label: `${s.name} (${s.district}, ${s.state})`,
                }))}
                value={schoolId}
                onChange={(e) => setSchoolId(e.target.value)}
              />

              {/* Role-Specific fields */}
              {selectedRole === 'student' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Grade Level"
                    options={[
                      { value: '6', label: 'Grade 6 (Class 6)' },
                      { value: '7', label: 'Grade 7 (Class 7)' },
                      { value: '8', label: 'Grade 8 (Class 8)' },
                      { value: '9', label: 'Grade 9 (Class 9)' },
                      { value: '10', label: 'Grade 10 (Class 10)' },
                    ]}
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                  />

                  <Select
                    label="Device Situation"
                    options={[
                      { value: 'shared_phone', label: 'Shared Family Mobile' },
                      { value: 'dedicated_phone', label: 'Personal Smartphone' },
                      { value: 'tablet', label: 'School / Panchayat Tablet' },
                      { value: 'desktop', label: 'Community PC' },
                    ]}
                    value={deviceAccess}
                    onChange={(e) => setDeviceAccess(e.target.value)}
                  />
                </div>
              )}

              {selectedRole === 'teacher' && (
                <Input
                  label="Employee ID or UDISE Staff Code"
                  type="text"
                  placeholder="e.g. TCH-RAJ-402"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                />
              )}

              {/* Institutional Authorization Guard for Educator and Admin Roles */}
              {selectedRole !== 'student' && (
                <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-2 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>Institutional Authorization Required</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    To prevent privilege escalation, {selectedRole === 'teacher' ? 'Teacher' : 'School Admin'} accounts require your institution's registration key (e.g. UDISE or District Admin code).
                  </p>
                  <Input
                    label="Institutional Access Code / UDISE Key"
                    type="password"
                    required
                    placeholder="Enter institutional verification key"
                    value={institutionalCode}
                    onChange={(e) => setInstitutionalCode(e.target.value)}
                    leftIcon={<Lock className="w-4 h-4" />}
                  />
                </div>
              )}

              {/* Language selection */}
              <Select
                label="Preferred Learning Language"
                options={[
                  { value: 'hi', label: 'हिन्दी (Hindi)' },
                  { value: 'en', label: 'English' },
                  { value: 'bn', label: 'বাংলা (Bengali)' },
                  { value: 'mr', label: 'मराठी (Marathi)' },
                  { value: 'te', label: 'తెలుగు (Telugu)' },
                  { value: 'ta', label: 'தமிழ் (Tamil)' },
                ]}
                value={preferredLang}
                onChange={(e) => setPreferredLang(e.target.value)}
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                className="w-full mt-3"
                isLoading={isLoading}
                rightIcon={<ArrowRight className="w-4 h-4" />}
              >
                Register & Access {selectedRole === 'student' ? 'Student' : selectedRole === 'teacher' ? 'Teacher' : 'Admin'} Dashboard
              </Button>
            </form>
          )}

          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-brand-700 hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
