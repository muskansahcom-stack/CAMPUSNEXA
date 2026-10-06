import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://shikshasetu-prod.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  !import.meta.env.VITE_SUPABASE_URL.includes('your-project-ref')
);

// Typed Supabase client with session persistence & token auto-refresh
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: localStorage,
    detectSessionInUrl: true,
  },
});

/**
 * Format raw Supabase Auth & PostgreSQL error codes into friendly user messages
 */
export function formatAuthError(error: any): string {
  if (!error) return 'An unexpected error occurred.';
  const msg = error.message || String(error);

  if (msg.includes('Invalid login credentials') || error.code === 'invalid_credentials') {
    return 'Invalid email or password. Please verify your credentials.';
  }
  if (msg.includes('User already registered') || error.code === 'user_already_exists') {
    return 'An account with this email already exists. Please sign in instead.';
  }
  if (msg.includes('Password should be at least') || error.code === 'weak_password') {
    return 'Password is too short. It must contain at least 6 characters.';
  }
  if (msg.includes('Email not confirmed')) {
    return 'Please confirm your email address before signing in, or contact your school admin.';
  }
  if (msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
    return 'Unable to reach the authentication server. Please check your internet connectivity.';
  }
  if (msg.includes('Security Violation')) {
    return msg;
  }

  return msg;
}

export const SECURITY_DISCLAIMER =
  'Production Security Architecture: User role permissions, grade assignments, and institutional access are cryptographically validated server-side through Supabase Row-Level Security (RLS) and JWT claims, never trusted from client-side requests.';
