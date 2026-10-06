import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';
import { supabase, formatAuthError, SECURITY_DISCLAIMER } from '../lib/supabase';
import { UserRole, ProfileRow, StudentProfileRow, TeacherProfileRow } from '../types/database';
import { ActiveStudentSession } from '../types/enrollment';
import { enrollmentService } from '../services/enrollmentService';

export interface RegisterParams {
  email: string;
  password: string;
  fullName: string;
  role: UserRole;
  preferredLanguage?: string;
  schoolId?: string;
  grade?: number;
  deviceAccess?: string;
  employeeId?: string;
  institutionalCode?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: ProfileRow | null;
  role: UserRole | null;
  studentProfile: StudentProfileRow | null;
  teacherProfile: TeacherProfileRow | null;
  studentSession: ActiveStudentSession | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ role: UserRole | null }>;
  studentLogin: (studentId: string, pin: string) => Promise<ActiveStudentSession>;
  register: (params: RegisterParams) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  securityDisclaimer: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfileRow | null>(null);
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfileRow | null>(null);
  const [studentSession, setStudentSession] = useState<ActiveStudentSession | null>(() => {
    try {
      const saved = localStorage.getItem('rla_active_student_session');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch verified profile from Supabase database
  const fetchProfile = useCallback(async (currentUser: User): Promise<ProfileRow | null> => {
    try {
      const { data, error: profileErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('auth_user_id', currentUser.id)
        .maybeSingle();

      if (profileErr) {
        console.warn('Profile fetch note:', profileErr.message);
      }

      if (data) {
        const profileData = data as ProfileRow;
        setProfile(profileData);

        // Fetch auxiliary role profile
        if (profileData.role === 'student') {
          const { data: stdData } = await supabase
            .from('student_profiles')
            .select('*')
            .eq('profile_id', profileData.id)
            .maybeSingle();
          if (stdData) setStudentProfile(stdData as StudentProfileRow);
        } else if (profileData.role === 'teacher') {
          const { data: tchData } = await supabase
            .from('teacher_profiles')
            .select('*')
            .eq('profile_id', profileData.id)
            .maybeSingle();
          if (tchData) setTeacherProfile(tchData as TeacherProfileRow);
        }

        return profileData;
      }

      // If database trigger has slight delay or offline preview metadata fallback
      const metadata = currentUser.user_metadata || {};
      const fallbackRole: UserRole = (metadata.role as UserRole) || 'student';
      const syntheticProfile: ProfileRow = {
        id: currentUser.id,
        auth_user_id: currentUser.id,
        full_name: metadata.full_name || currentUser.email?.split('@')[0] || 'ShikshaSetu User',
        email: currentUser.email || '',
        role: fallbackRole,
        preferred_language: metadata.preferred_language || 'en',
        avatar_url: metadata.avatar_url || null,
        school_id: metadata.school_id || null,
        created_at: currentUser.created_at,
        updated_at: currentUser.updated_at || currentUser.created_at,
      };

      setProfile(syntheticProfile);
      return syntheticProfile;
    } catch (err: any) {
      console.error('Error fetching user profile:', err);
      return null;
    }
  }, []);

  // Initialize session on mount and listen to auth changes
  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { data, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) {
          console.warn('Initial session error:', sessionErr.message);
        }

        if (isMounted) {
          if (data.session?.user) {
            setSession(data.session);
            setUser(data.session.user);
            await fetchProfile(data.session.user);
          } else {
            setSession(null);
            setUser(null);
            setProfile(null);
          }
        }
      } catch (err: any) {
        console.error('Auth initialization error:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initAuth();

    // Subscribe to auth state transitions
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, newSession: Session | null) => {
      if (!isMounted) return;

      setSession(newSession);
      setUser(newSession?.user || null);

      if (event === 'SIGNED_OUT' || !newSession?.user) {
        setProfile(null);
        setStudentProfile(null);
        setTeacherProfile(null);
        setIsLoading(false);
      } else if (newSession?.user) {
        setIsLoading(true);
        await fetchProfile(newSession.user);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Real Supabase Login
  const login = async (email: string, password: string): Promise<{ role: UserRole | null }> => {
    setError(null);
    setIsLoading(true);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        const formatted = formatAuthError(signInError);
        setError(formatted);
        throw new Error(formatted);
      }

      if (!data.user) {
        throw new Error('Authentication succeeded but user data was not returned.');
      }

      setUser(data.user);
      setSession(data.session);

      const userProfile = await fetchProfile(data.user);
      const userRole = userProfile?.role || (data.user.user_metadata?.role as UserRole) || 'student';
      return { role: userRole };
    } catch (err: any) {
      setError(err.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Sync student session on mount if available
  useEffect(() => {
    if (studentSession && !user) {
      const syntheticUser: any = {
        id: studentSession.student.id,
        email: `${studentSession.student.student_id.toLowerCase()}@rurallearn.school`,
        user_metadata: {
          full_name: studentSession.student.full_name,
          role: 'student',
          grade: studentSession.classEntity.grade,
          student_id: studentSession.student.student_id,
          class_name: `Class ${studentSession.classEntity.grade}-${studentSession.section.name}`,
          school_name: studentSession.school.name,
        },
      };
      setUser(syntheticUser);
      setProfile({
        id: studentSession.student.id,
        auth_user_id: studentSession.student.id,
        full_name: studentSession.student.full_name,
        email: `${studentSession.student.student_id.toLowerCase()}@rurallearn.school`,
        role: 'student',
        preferred_language: studentSession.student.preferred_language,
        avatar_url: null,
        school_id: studentSession.school.id,
        created_at: studentSession.student.created_at || new Date().toISOString(),
        updated_at: studentSession.student.updated_at || new Date().toISOString(),
      });
      setStudentProfile({
        id: `std-prof-${studentSession.student.id}`,
        profile_id: studentSession.student.id,
        grade: studentSession.classEntity.grade,
        class_name: `Class ${studentSession.classEntity.grade}-${studentSession.section.name}`,
        learning_level: 'Grade Level Foundation & Core',
        device_access: 'shared_phone',
        connectivity_level: 'intermittent_2g',
        created_at: new Date().toISOString(),
      });
      setIsLoading(false);
    }
  }, [studentSession, user]);

  // School-Controlled Student Login with Student ID + PIN
  const studentLogin = async (studentId: string, pin: string): Promise<ActiveStudentSession> => {
    setError(null);
    setIsLoading(true);
    try {
      const sessionData = await enrollmentService.validateAndLoginStudent(studentId, pin);
      setStudentSession(sessionData);

      const syntheticUser: any = {
        id: sessionData.student.id,
        email: `${sessionData.student.student_id.toLowerCase()}@rurallearn.school`,
        user_metadata: {
          full_name: sessionData.student.full_name,
          role: 'student',
          grade: sessionData.classEntity.grade,
          student_id: sessionData.student.student_id,
          class_name: `Class ${sessionData.classEntity.grade}-${sessionData.section.name}`,
          school_name: sessionData.school.name,
        },
      };
      const syntheticProfile: ProfileRow = {
        id: sessionData.student.id,
        auth_user_id: sessionData.student.id,
        full_name: sessionData.student.full_name,
        email: `${sessionData.student.student_id.toLowerCase()}@rurallearn.school`,
        role: 'student',
        preferred_language: sessionData.student.preferred_language,
        avatar_url: null,
        school_id: sessionData.school.id,
        created_at: sessionData.student.created_at || new Date().toISOString(),
        updated_at: sessionData.student.updated_at || new Date().toISOString(),
      };

      setUser(syntheticUser);
      setProfile(syntheticProfile);
      setStudentProfile({
        id: `std-prof-${sessionData.student.id}`,
        profile_id: sessionData.student.id,
        grade: sessionData.classEntity.grade,
        class_name: `Class ${sessionData.classEntity.grade}-${sessionData.section.name}`,
        learning_level: 'Grade Level Foundation & Core',
        device_access: 'shared_phone',
        connectivity_level: 'intermittent_2g',
        created_at: new Date().toISOString(),
      });

      try {
        localStorage.setItem('rla_active_student_session', JSON.stringify(sessionData));
      } catch (e) {
        // ignore
      }
      return sessionData;
    } catch (err: any) {
      const msg = err.message || 'Invalid or inactive student account. Please contact your school or teacher.';
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Real Supabase Registration
  const register = async (params: RegisterParams): Promise<void> => {
    setError(null);
    setIsLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: params.email,
        password: params.password,
        options: {
          data: {
            full_name: params.fullName,
            role: params.role,
            preferred_language: params.preferredLanguage || 'en',
            school_id: params.schoolId || null,
            grade: params.grade || 8,
            device_access: params.deviceAccess || 'shared_phone',
            employee_id: params.employeeId || null,
            institutional_code: params.institutionalCode || null,
          },
        },
      });

      if (signUpError) {
        const formatted = formatAuthError(signUpError);
        setError(formatted);
        throw new Error(formatted);
      }

      if (data.session && data.user) {
        setSession(data.session);
        setUser(data.user);
        await fetchProfile(data.user);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Real Supabase Logout (Safely clears session & sensitive client caches for shared devices)
  const logout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.warn('Sign out warning:', signOutError.message);
      }
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      setStudentProfile(null);
      setTeacherProfile(null);
      setStudentSession(null);
      setIsLoading(false);

      // Clean up sensitive user cached items from shared device storage
      try {
        localStorage.removeItem('rla_active_student_session');
        localStorage.removeItem('shikshasetu_auth');
        localStorage.removeItem('shikshasetu_progress');
        localStorage.removeItem('shikshasetu_bookmarks');
        localStorage.removeItem('shikshasetu_authored_lessons');
        if (typeof localStorage !== 'undefined') {
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (
              key &&
              (key.startsWith('shiksha_latest_report_') ||
                key.startsWith('shikshasetu_idb_progress') ||
                key.startsWith('shiksha_profile_'))
            ) {
              localStorage.removeItem(key);
            }
          }
        }
      } catch (e) {
        console.warn('Error clearing storage on logout:', e);
      }
    }
  };

  // Real Password Reset Request
  const resetPassword = async (email: string): Promise<void> => {
    setError(null);
    const redirectUrl = `${window.location.origin}/reset-password`;

    const { error: resetErr } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    });

    if (resetErr) {
      const formatted = formatAuthError(resetErr);
      setError(formatted);
      throw new Error(formatted);
    }
  };

  // Update Password
  const updatePassword = async (newPassword: string): Promise<void> => {
    setError(null);
    const { error: updateErr } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateErr) {
      const formatted = formatAuthError(updateErr);
      setError(formatted);
      throw new Error(formatted);
    }
  };

  const refreshProfile = async (): Promise<void> => {
    if (user) {
      await fetchProfile(user);
    }
  };

  const role = profile?.role || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        role,
        studentProfile,
        teacherProfile,
        studentSession,
        isLoading,
        error,
        login,
        studentLogin,
        register,
        logout,
        resetPassword,
        updatePassword,
        refreshProfile,
        securityDisclaimer: SECURITY_DISCLAIMER,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
