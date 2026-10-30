import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import LandingPage from './pages/LandingPage';
import SignupPage from './pages/SignupPage';
import LoginPage from './pages/LoginPage';
import RolesPage from './pages/RolesPage';
import DiagnosticPage from './pages/DiagnosticPage';
import GeneratingPage from './pages/GeneratingPage';
import DashboardPage from './pages/DashboardPage';
import ModuleDetailPage from './pages/ModuleDetailPage';
import SettingsPage from './pages/SettingsPage';

function App() {
  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/diagnostic" element={<DiagnosticPage />} />
          <Route path="/generating" element={<GeneratingPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/module/:moduleId" element={<ModuleDetailPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
