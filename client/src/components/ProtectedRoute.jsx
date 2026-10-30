import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Spinner } from './Spinner.jsx';

/**
 * Route protection guard.
 *
 * Enforces:
 * 1. Authenticated session (redirects unauthenticated users to /login).
 * 2. Career role assignment (redirects users without roleId to /roles).
 * 3. Diagnostic roadmap generation (redirects users without roadmap to /diagnostic if requireRoadmap is true).
 */
export function ProtectedRoute({
  children,
  requireRole = true,
  requireRoadmap = false,
  userHasRoadmap = true
}) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
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
          Verifying PathForge credentials...
        </span>
      </div>
    );
  }

  // 1. Not logged in -> redirect to /login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Logged in but has no role assigned -> redirect to /roles (unless currently on /roles)
  if (requireRole && !user.roleId && location.pathname !== '/roles') {
    return <Navigate to="/roles" replace />;
  }

  // 3. Logged in and role assigned, but requires a generated roadmap -> redirect to /diagnostic
  if (requireRoadmap && !userHasRoadmap && location.pathname !== '/diagnostic') {
    return <Navigate to="/diagnostic" replace />;
  }

  return children;
}

export default ProtectedRoute;
