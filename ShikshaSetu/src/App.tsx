import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { ConnectivityProvider } from './contexts/ConnectivityContext';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './contexts/ToastContext';
import { ToastContainer } from './components/ui/Toast';
import { ScrollToTop } from './components/common/ScrollToTop';

import { PublicLayout } from './components/layout/PublicLayout';
import { PortalLayout } from './components/layout/PortalLayout';

import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { RoleBasedRoute } from './components/auth/RoleBasedRoute';

import { LandingPage } from './pages/LandingPage';
import { AboutPage } from './pages/AboutPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { ForStudentsPage } from './pages/ForStudentsPage';
import { ForTeachersPage } from './pages/ForTeachersPage';
import { ForSchoolsPage } from './pages/ForSchoolsPage';
import { ContactPage } from './pages/ContactPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';

import { StudentPortal } from './pages/StudentPortal';
import { TeacherPortal } from './pages/TeacherPortal';
import { AdminPortal } from './pages/AdminPortal';
import { AccessibilitySettingsModal } from './components/accessibility/AccessibilitySettingsModal';
import { useAccessibility } from './contexts/AccessibilityContext';

const GlobalModals: React.FC = () => {
  const { isSettingsModalOpen, closeSettingsModal } = useAccessibility();
  return (
    <AccessibilitySettingsModal
      isOpen={isSettingsModalOpen}
      onClose={closeSettingsModal}
    />
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <LanguageProvider>
        <AccessibilityProvider>
          <GlobalModals />
          <ConnectivityProvider>
            <AuthProvider>
              <ToastProvider>
                <ScrollToTop />
              <Routes>
                {/* Public Website Routes */}
                <Route element={<PublicLayout />}>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/how-it-works" element={<HowItWorksPage />} />
                  <Route path="/features" element={<FeaturesPage />} />
                  <Route path="/for-students" element={<ForStudentsPage />} />
                  <Route path="/for-teachers" element={<ForTeachersPage />} />
                  <Route path="/for-schools" element={<ForSchoolsPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                </Route>

                {/* Protected & Role-Isolated Application Portals */}
                <Route element={<ProtectedRoute />}>
                  <Route element={<PortalLayout />}>
                    {/* Student Dashboard: Accessible ONLY to verified students */}
                    <Route
                      path="/student"
                      element={
                        <RoleBasedRoute allowedRoles={['student']}>
                          <StudentPortal />
                        </RoleBasedRoute>
                      }
                    />

                    {/* Teacher Cockpit: Accessible ONLY to verified teachers */}
                    <Route
                      path="/teacher"
                      element={
                        <RoleBasedRoute allowedRoles={['teacher']}>
                          <TeacherPortal />
                        </RoleBasedRoute>
                      }
                    />

                    {/* School Admin Hub: Accessible ONLY to verified school_admins */}
                    <Route
                      path="/admin"
                      element={
                        <RoleBasedRoute allowedRoles={['school_admin']}>
                          <AdminPortal />
                        </RoleBasedRoute>
                      }
                    />
                  </Route>
                </Route>

                {/* Catch-all redirect to Home */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              <ToastContainer />
            </ToastProvider>
          </AuthProvider>
        </ConnectivityProvider>
        </AccessibilityProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
};

export default App;
