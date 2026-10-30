import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

// Pages
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import RolesPage from './pages/RolesPage';
import DiagnosticPage from './pages/DiagnosticPage';
import GeneratingPage from './pages/GeneratingPage';
import DashboardPage from './pages/DashboardPage';
import ModuleDetailPage from './pages/ModuleDetailPage';
import CheckpointPage from './pages/CheckpointPage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
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
      </main>
    </div>
  );
}

export default App;
