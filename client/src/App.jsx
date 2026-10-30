import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { Spinner } from './components/Spinner.jsx';

// Route-level code splitting via React.lazy
const LandingPage = lazy(() =>
  import('./pages/LandingPage.jsx').then((m) => ({ default: m.LandingPage }))
);
const SignupPage = lazy(() =>
  import('./pages/SignupPage.jsx').then((m) => ({ default: m.SignupPage }))
);
const LoginPage = lazy(() =>
  import('./pages/LoginPage.jsx').then((m) => ({ default: m.LoginPage }))
);
const RoleSelectionPage = lazy(() =>
  import('./pages/RoleSelectionPage.jsx').then((m) => ({ default: m.RoleSelectionPage }))
);
const DiagnosticQuizPage = lazy(() =>
  import('./pages/DiagnosticQuizPage.jsx').then((m) => ({ default: m.DiagnosticQuizPage }))
);
const GeneratingRoadmapPage = lazy(() =>
  import('./pages/GeneratingRoadmapPage.jsx').then((m) => ({ default: m.GeneratingRoadmapPage }))
);
const DashboardPage = lazy(() =>
  import('./pages/DashboardPage.jsx').then((m) => ({ default: m.DashboardPage }))
);
const ModuleDetailPage = lazy(() =>
  import('./pages/ModuleDetailPage.jsx').then((m) => ({ default: m.ModuleDetailPage }))
);
const CheckpointQuizPage = lazy(() =>
  import('./pages/CheckpointQuizPage.jsx').then((m) => ({ default: m.CheckpointQuizPage }))
);
const SettingsPage = lazy(() =>
  import('./pages/SettingsPage.jsx').then((m) => ({ default: m.SettingsPage }))
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage.jsx').then((m) => ({ default: m.NotFoundPage }))
);
const StyleguidePage = lazy(() =>
  import('./pages/StyleguidePage.jsx').then((m) => ({ default: m.StyleguidePage }))
);

function RouteFallback() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: 'var(--space-2)'
      }}
    >
      <Spinner size="lg" />
      <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
        Loading page module...
      </span>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/login" element={<LoginPage />} />
              {/* Dev & Test only route */}
              {(import.meta.env.DEV || import.meta.env.MODE === 'test') && (
                <Route path="/styleguide" element={<StyleguidePage />} />
              )}

              {/* Protected Routes: Authenticated User (Can select role) */}
              <Route
                path="/roles"
                element={
                  <ProtectedRoute requireRole={false}>
                    <RoleSelectionPage />
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes: Authenticated User with Role */}
              <Route
                path="/diagnostic"
                element={
                  <ProtectedRoute requireRole={true}>
                    <DiagnosticQuizPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/generating"
                element={
                  <ProtectedRoute requireRole={true}>
                    <GeneratingRoadmapPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requireRole={true}>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/module/:moduleId"
                element={
                  <ProtectedRoute requireRole={true}>
                    <ModuleDetailPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/checkpoint/:moduleId"
                element={
                  <ProtectedRoute requireRole={true}>
                    <CheckpointQuizPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/settings"
                element={
                  <ProtectedRoute requireRole={false}>
                    <SettingsPage />
                  </ProtectedRoute>
                }
              />

              {/* Fallback 404 Route */}
              <Route path="/404" element={<NotFoundPage />} />
              <Route path="*" element={<Navigate to="/404" replace />} />
            </Routes>
          </Suspense>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
