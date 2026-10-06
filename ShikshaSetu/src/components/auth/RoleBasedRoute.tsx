import React from 'react';
import { Navigate, useLocation, Link, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types/database';
import { LoadingState } from '../ui/LoadingState';
import { Button } from '../ui/Button';
import { ShieldAlert, ArrowRight, Lock } from 'lucide-react';

interface RoleBasedRouteProps {
  allowedRoles: UserRole[];
  children?: React.ReactNode;
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({ allowedRoles, children }) => {
  const { user, profile, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <LoadingState type="spinner" message="Validating database authorization & role..." />
      </div>
    );
  }

  // Not logged in -> Redirect to login
  if (!user || !profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Role verification
  if (!role || !allowedRoles.includes(role)) {
    const roleTarget =
      role === 'student' ? '/student' : role === 'teacher' ? '/teacher' : '/admin';

    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white border border-red-200 shadow-elevated text-center space-y-5 animate-in fade-in duration-200">
          <div className="w-14 h-14 rounded-2xl bg-red-50 text-red-600 border border-red-200 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-600">
              Access Restricted • 403 Forbidden
            </span>
            <h2 className="text-xl font-bold text-slate-900">
              Unauthorized Dashboard Area
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              Your verified account has the role of{' '}
              <span className="font-bold text-slate-900 capitalize">{role?.replace('_', ' ')}</span>.
              This area is strictly restricted to accounts with the{' '}
              <span className="font-bold text-slate-900">
                {allowedRoles.map((r) => r.replace('_', ' ')).join(' or ')}
              </span>{' '}
              permission.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-[11px] text-slate-500">
            <ShieldAlert className="w-4 h-4 text-amber-600 inline mr-1 -mt-0.5" />
            Row-Level Security: Client role manipulation is blocked by the database.
          </div>

          <div className="pt-2">
            <Link to={roleTarget}>
              <Button variant="primary" size="md" className="w-full" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Go to My Authorized Dashboard ({role?.replace('_', ' ')})
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};
