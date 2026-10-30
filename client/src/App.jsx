import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';
import Spinner from './components/Spinner';

// Lazy-loaded pages
const LandingPage = lazy(() => import('./pages/LandingPage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RolesPage = lazy(() => import('./pages/RolesPage'));
const DiagnosticPage = lazy(() => import('./pages/DiagnosticPage'));
const GeneratingPage = lazy(() => import('./pages/GeneratingPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const ModuleDetailPage = lazy(() => import('./pages/ModuleDetailPage'));
const CheckpointPage = lazy(() => import('./pages/CheckpointPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const PageFallback = () => (
  <div className="page-center-container" style={{ minHeight: '60vh' }}>
    <Spinner size="lg" label="Loading content..." />
  </div>
);

function App() {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <Suspense fallback={<PageFallback />}>
          <Routes>
            {/* Public General Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/roles" element={<RolesPage />} />

            {/* Public Only Routes (Redirects logged-in users away) */}
            <Route element={<PublicRoute />}>
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/login" element={<LoginPage />} />
            </Route>

            {/* Protected Routes (Redirects unauthenticated users to /login) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/diagnostic" element={<DiagnosticPage />} />
              <Route path="/generating" element={<GeneratingPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/module/:moduleId" element={<ModuleDetailPage />} />
              <Route path="/module/:moduleId/checkpoint" element={<CheckpointPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>

            {/* Friendly 404 Fallback */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default App;
