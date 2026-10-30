import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute.jsx';
import PublicOnlyRoute from '../components/PublicOnlyRoute.jsx';
import { renderWithProviders } from './testUtils.jsx';

describe('Route Guards: ProtectedRoute and PublicOnlyRoute', () => {
  describe('ProtectedRoute', () => {
    it('shows loading state while auth is being checked', () => {
      renderWithProviders(
        <ProtectedRoute>
          <div>Protected Content</div>
        </ProtectedRoute>,
        { loading: true, user: null },
      );

      expect(screen.getByText(/Checking authentication…/i)).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('redirects unauthenticated users to /login', () => {
      renderWithProviders(
        <Routes>
          <Route path="/login" element={<div>Login Page Target</div>} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>,
        { loading: false, user: null, initialEntries: ['/dashboard'] },
      );

      expect(screen.getByText('Login Page Target')).toBeInTheDocument();
      expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    });

    it('renders children when authenticated user is present', () => {
      renderWithProviders(
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Protected Content</div>
              </ProtectedRoute>
            }
          />
        </Routes>,
        {
          loading: false,
          user: { id: 'u1', name: 'Learner', roleId: 'mern-developer' },
          initialEntries: ['/dashboard'],
        },
      );

      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  describe('PublicOnlyRoute', () => {
    it('shows loading state while auth is being checked', () => {
      renderWithProviders(
        <PublicOnlyRoute>
          <div>Public Form</div>
        </PublicOnlyRoute>,
        { loading: true, user: null },
      );

      expect(screen.getByText(/Loading…/i)).toBeInTheDocument();
      expect(screen.queryByText('Public Form')).not.toBeInTheDocument();
    });

    it('redirects authenticated user with role to /dashboard', () => {
      renderWithProviders(
        <Routes>
          <Route path="/dashboard" element={<div>Dashboard Target</div>} />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <div>Login Page</div>
              </PublicOnlyRoute>
            }
          />
        </Routes>,
        {
          loading: false,
          user: { id: 'u1', name: 'Learner', roleId: 'mern-developer' },
          initialEntries: ['/login'],
        },
      );

      expect(screen.getByText('Dashboard Target')).toBeInTheDocument();
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });

    it('redirects authenticated user without role to /role-selection', () => {
      renderWithProviders(
        <Routes>
          <Route path="/role-selection" element={<div>Role Selection Target</div>} />
          <Route
            path="/login"
            element={
              <PublicOnlyRoute>
                <div>Login Page</div>
              </PublicOnlyRoute>
            }
          />
        </Routes>,
        {
          loading: false,
          user: { id: 'u1', name: 'Learner', roleId: null },
          initialEntries: ['/login'],
        },
      );

      expect(screen.getByText('Role Selection Target')).toBeInTheDocument();
      expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    });

    it('renders public children when no user is logged in', () => {
      renderWithProviders(
        <PublicOnlyRoute>
          <div>Login Form Component</div>
        </PublicOnlyRoute>,
        { loading: false, user: null },
      );

      expect(screen.getByText('Login Form Component')).toBeInTheDocument();
    });
  });
});
