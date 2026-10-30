import { lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { RoadmapGenerationProvider } from './context/RoadmapGenerationContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import PublicOnlyRoute from './components/PublicOnlyRoute.jsx';
import TempLayout from './components/TempLayout.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import OfflineBanner from './components/OfflineBanner.jsx';

const LandingPage = lazy(() => import('./pages/LandingPage.jsx'));
const SignupPage = lazy(() => import('./pages/SignupPage.jsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const RoleSelectionPage = lazy(() => import('./pages/RoleSelectionPage.jsx'));
const DiagnosticPage = lazy(() => import('./pages/DiagnosticPage.jsx'));
const GeneratingPage = lazy(() => import('./pages/GeneratingPage.jsx'));
const DashboardPage = lazy(() => import('./pages/DashboardPage.jsx'));
const ModuleDetailPage = lazy(() => import('./pages/ModuleDetailPage.jsx'));
const CheckpointPage = lazy(() => import('./pages/CheckpointPage.jsx'));
const SettingsPage = lazy(() => import('./pages/SettingsPage.jsx'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage.jsx'));
const StyleguidePage = lazy(() => import('./pages/StyleguidePage.jsx'));

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <RoadmapGenerationProvider>
              <OfflineBanner />
              <Routes>
                <Route element={<TempLayout />}>
                  {/* Public Landing & Styleguide */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/styleguide" element={<StyleguidePage />} />

                  {/* Public-only routes (redirect to dashboard or role-selection if already logged in) */}
                  <Route
                    path="/signup"
                    element={
                      <PublicOnlyRoute>
                        <SignupPage />
                      </PublicOnlyRoute>
                    }
                  />
                  <Route
                    path="/login"
                    element={
                      <PublicOnlyRoute>
                        <LoginPage />
                      </PublicOnlyRoute>
                    }
                  />

                  {/* Protected routes */}
                  <Route
                    path="/role-selection"
                    element={
                      <ProtectedRoute>
                        <RoleSelectionPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/diagnostic/:roleId"
                    element={
                      <ProtectedRoute>
                        <DiagnosticPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/generating"
                    element={
                      <ProtectedRoute>
                        <GeneratingPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/module/:moduleId"
                    element={
                      <ProtectedRoute>
                        <ModuleDetailPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/checkpoint/:moduleId"
                    element={
                      <ProtectedRoute>
                        <CheckpointPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/settings"
                    element={
                      <ProtectedRoute>
                        <SettingsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch-all 404 */}
                  <Route path="*" element={<NotFoundPage />} />
                </Route>
              </Routes>
            </RoadmapGenerationProvider>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
