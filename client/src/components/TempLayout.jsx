import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { setMockFailure } from '../mocks/mockFailures.js';
import * as api from '../services/api.js';
import Navbar from './Navbar.jsx';
import RouteSkeletonFallback from './RouteSkeletonFallback.jsx';

/**
 * Main application shell with accessibility skip-link, official Navbar,
 * and compact development controls.
 */
export default function TempLayout() {
  const { user, loading, login } = useAuth();
  const toast = useToast();

  const handleSimulate401 = async () => {
    setMockFailure('401');
    try {
      await api.getMe();
    } catch {
      // 401 handler in AuthContext will automatically trigger
    }
  };

  const handleTestToast = () => {
    toast.success('Design system loaded successfully!');
  };

  return (
    <div className="pf-app-shell">
      {/* 1. Skip-to-content accessibility link */}
      <a href="#main-content" className="pf-skip-link">
        Skip to main content
      </a>

      {/* 2. Compact Development Bar */}
      <aside
        aria-label="Development status and testing tools"
        style={{
          background: 'var(--color-neutral-100)',
          padding: '0.35rem 1rem',
          borderBottom: '1px solid var(--color-border-subtle)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 'var(--font-size-xs)',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <div>
          <strong>Dev Auth: </strong>
          {loading ? (
            <span>Checking…</span>
          ) : user ? (
            <span style={{ color: 'var(--color-success-text)' }}>
              {user.name} ({user.email}) [{user.roleId || 'No role'}]
            </span>
          ) : (
            <span style={{ color: 'var(--color-error-text)' }}>Logged Out (Guest)</span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            type="button"
            onClick={handleTestToast}
            style={{
              padding: '0.2rem 0.5rem',
              fontSize: '0.75rem',
              cursor: 'pointer',
              background: '#f0fdfa',
              border: '1px solid #14b8a6',
              color: '#0f766e',
              borderRadius: '3px',
              minHeight: '28px',
            }}
          >
            Test Toast
          </button>
          {user ? (
            <button
              type="button"
              onClick={handleSimulate401}
              title="Sets mockFail=401 and calls api.getMe() to trigger global session expiration"
              style={{
                padding: '0.2rem 0.5rem',
                fontSize: '0.75rem',
                cursor: 'pointer',
                background: '#fef2f2',
                border: '1px solid #f87171',
                color: '#991b1b',
                borderRadius: '3px',
                minHeight: '28px',
              }}
            >
              Simulate 401
            </button>
          ) : (
            <button
              type="button"
              onClick={() => login('learner@pathforge.dev', 'password123')}
              style={{
                padding: '0.2rem 0.5rem',
                fontSize: '0.75rem',
                cursor: 'pointer',
                background: '#e0e7ff',
                border: '1px solid #818cf8',
                color: '#3730a3',
                borderRadius: '3px',
                minHeight: '28px',
              }}
            >
              Demo Login
            </button>
          )}
        </div>
      </aside>

      {/* 3. Official Application Navbar with Working Hamburger */}
      <Navbar />

      {/* 4. Page Outlet with Suspense Skeleton Fallback */}
      <div className="pf-app-content-wrapper">
        <Suspense fallback={<RouteSkeletonFallback />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}
