import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Logo } from '../components/common/Logo';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { validateEmail } from '../lib/securityUtils';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, resetPassword, user, role, isLoading: authLoading, securityDisclaimer } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Forgot Password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetSubmitting, setIsResetSubmitting] = useState(false);
  const [resetSent, setResetSent] = useState(false);

  // If already authenticated and profile loaded, redirect to appropriate role portal
  useEffect(() => {
    if (!authLoading && user && role) {
      const fromPath = (location.state as any)?.from?.pathname;
      if (fromPath && !['/login', '/register'].includes(fromPath)) {
        navigate(fromPath, { replace: true });
      } else {
        const dest = role === 'student' ? '/student' : role === 'teacher' ? '/teacher' : '/admin';
        navigate(dest, { replace: true });
      }
    }
  }, [user, role, authLoading, navigate, location.state]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const trimmedEmail = email.trim();
    if (!validateEmail(trimmedEmail)) {
      setLoginError('Please enter a valid email address.');
      return;
    }

    if (!password) {
      setLoginError('Password is required.');
      return;
    }

    setIsSubmitting(true);

    try {
      const { role: authenticatedRole } = await login(trimmedEmail, password);

      showToast({
        type: 'success',
        title: 'Sign In Successful',
        message: `Welcome back! Opening your ${authenticatedRole || 'learning'} dashboard...`,
      });

      const fromPath = (location.state as any)?.from?.pathname;
      if (fromPath && !['/login', '/register'].includes(fromPath)) {
        navigate(fromPath, { replace: true });
      } else {
        const target =
          authenticatedRole === 'teacher'
            ? '/teacher'
            : authenticatedRole === 'school_admin'
            ? '/admin'
            : '/student';
        navigate(target, { replace: true });
      }
    } catch (err: any) {
      setLoginError(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedResetEmail = resetEmail.trim();

    if (!validateEmail(trimmedResetEmail)) {
      showToast({
        type: 'error',
        title: 'Invalid Email',
        message: 'Please provide a valid email address for password recovery.',
      });
      return;
    }

    setIsResetSubmitting(true);

    try {
      await resetPassword(trimmedResetEmail);
      setResetSent(true);
      showToast({
        type: 'success',
        title: 'Recovery Email Dispatched',
        message: 'A password reset link has been sent to your email address.',
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Reset Request Failed',
        message: err.message || 'Could not process password reset request.',
      });
    } finally {
      setIsResetSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Logo size="lg" showTagline />
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-4">
          Sign In to ShikshaSetu
        </h1>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Authenticate with your verified email and password
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl shadow-elevated border border-slate-200/80 space-y-6">
          {/* Security Architecture Callout */}
          <div className="p-3.5 rounded-2xl bg-brand-50/80 border border-brand-200/80 flex items-start gap-2.5 text-xs text-brand-900">
            <ShieldCheck className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Real Supabase Auth: </span>
              Your dashboard role is strictly authorized by database RLS policies.
            </div>
          </div>

          {/* Error Banner */}
          {loginError && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-700 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              autoComplete="email"
              placeholder="e.g. learner@shikshasetu.org.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="Your secure password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500 text-[11px]">
                Redirects to: Student (/student), Teacher (/teacher), Admin (/admin)
              </span>
              <button
                type="button"
                onClick={() => {
                  setResetEmail(email);
                  setResetSent(false);
                  setIsForgotModalOpen(true);
                }}
                className="text-brand-700 font-semibold hover:underline"
              >
                Forgot Password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-2"
              isLoading={isSubmitting}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In with Supabase
            </Button>
          </form>

          {/* Registration link */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account yet?{' '}
              <Link to="/register" className="font-bold text-brand-700 hover:underline">
                Register as Student, Teacher, or Admin
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Reset Password"
        description="Enter your registered email to receive a password reset link."
        maxWidth="md"
      >
        {resetSent ? (
          <div className="py-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Check Your Inbox</h4>
            <p className="text-xs text-slate-600">
              We have sent password reset instructions to <strong>{resetEmail}</strong>.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsForgotModalOpen(false)}
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <Input
              label="Registered Email Address"
              type="email"
              required
              placeholder="e.g. learner@shikshasetu.org.in"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
            />
            <div className="pt-2 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsForgotModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isResetSubmitting}
              >
                Send Reset Link
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
