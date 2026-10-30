import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext.jsx';
import { ToastProvider } from '../context/ToastContext.jsx';
import { ProtectedRoute } from '../components/ProtectedRoute.jsx';
import { RoleSelectionPage } from '../pages/RoleSelectionPage.jsx';
import { DiagnosticQuizPage } from '../pages/DiagnosticQuizPage.jsx';
import { DashboardPage } from '../pages/DashboardPage.jsx';
import { setMockMode, api } from '../services/api.js';

describe('Client Regression & Edge Cases Test Suite', () => {
  beforeEach(() => {
    setMockMode(true);
    sessionStorage.clear();
  });

  // 1. Expired/Deleted token causes 401 and ProtectedRoute redirects to /login
  it('redirects unauthenticated user to /login when session is invalid or expired', async () => {
    const originalGetMe = api.getMe;
    api.getMe = async () => {
      const err = new Error('Authentication token has expired. Please log in again.');
      err.statusCode = 401;
      throw err;
    };

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/login" element={<div>Sign In Screen</div>} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requireRole={true}>
                    <div>Secret Protected Content</div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Sign In Screen')).toBeInTheDocument();
      expect(screen.queryByText('Secret Protected Content')).not.toBeInTheDocument();
    });

    api.getMe = originalGetMe;
  });

  // 2. User with no role hitting /diagnostic directly is redirected to /roles
  it('redirects authenticated user without a role from /diagnostic to /roles', async () => {
    const originalGetMe = api.getMe;
    api.getMe = async () => ({
      success: true,
      data: { user: { id: 'u1', name: 'No Role User', email: 'norole@test.com', roleId: null } }
    });

    render(
      <MemoryRouter initialEntries={['/diagnostic']}>
        <AuthProvider>
          <ToastProvider>
            <Routes>
              <Route path="/roles" element={<div>Role Selection Trajectory</div>} />
              <Route
                path="/diagnostic"
                element={
                  <ProtectedRoute requireRole={true}>
                    <div>Diagnostic Assessment</div>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Role Selection Trajectory')).toBeInTheDocument();
      expect(screen.queryByText('Diagnostic Assessment')).not.toBeInTheDocument();
    });

    api.getMe = originalGetMe;
  });

  // 3. Refresh mid-quiz restores saved answers from sessionStorage
  it('restores answered question state from sessionStorage upon refresh', async () => {
    const originalGetMe = api.getMe;
    api.getMe = async () => ({
      success: true,
      data: {
        user: { id: 'u1', name: 'MERN Student', email: 'mern@test.com', roleId: 'mern-developer' }
      }
    });

    sessionStorage.setItem(
      'pathforge_diagnostic_answers_mern-developer',
      JSON.stringify({ 'mern-js-1': 1 })
    );
    sessionStorage.setItem('pathforge_diagnostic_index_mern-developer', '2');

    render(
      <MemoryRouter initialEntries={['/diagnostic']}>
        <AuthProvider>
          <ToastProvider>
            <DiagnosticQuizPage />
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/question 3 of 12/i)).toBeInTheDocument();
    });

    api.getMe = originalGetMe;
  });

  // 4. Empty roles in database renders EmptyState on RoleSelectionPage
  it('renders EmptyState when role collection is completely empty', async () => {
    const originalGetRoles = api.getRoles;
    api.getRoles = async () => ({ success: true, data: { roles: [] } });

    render(
      <MemoryRouter initialEntries={['/roles']}>
        <AuthProvider>
          <ToastProvider>
            <RoleSelectionPage />
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no career roles available/i)).toBeInTheDocument();
    });

    api.getRoles = originalGetRoles;
  });

  // 5. Empty roadmap on DashboardPage renders EmptyState
  it('renders EmptyState on DashboardPage when user has no roadmap yet', async () => {
    const originalGetMe = api.getMe;
    const originalGetRoadmap = api.getRoadmap;
    api.getMe = async () => ({
      success: true,
      data: {
        user: { id: 'u1', name: 'Ready Student', email: 'ready@test.com', roleId: 'mern-developer' }
      }
    });
    api.getRoadmap = async () => {
      const err = new Error('No roadmap found');
      err.statusCode = 404;
      throw err;
    };

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <ToastProvider>
            <DashboardPage />
          </ToastProvider>
        </AuthProvider>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/no learning roadmap yet/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /start skill diagnostic/i })).toBeInTheDocument();
    });

    api.getMe = originalGetMe;
    api.getRoadmap = originalGetRoadmap;
  });
});
