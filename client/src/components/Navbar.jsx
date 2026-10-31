import React, { useState, useEffect } from 'react';
import { api } from '../services/api.js';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Button } from './Button.jsx';

export function Navbar({ className = '' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [systemStatus, setSystemStatus] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchStatus = async () => {
      try {
        const res = await api.getSystemStatus();
        if (mounted && res?.data) {
          setSystemStatus(res.data);
        }
      } catch (err) {
        // Silently keep default
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header
      className={className}
      style={{
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: 'var(--shadow-sm)'
      }}
    >
      <div
        className="container"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '64px'
        }}
      >
        {/* Brand / Logo */}
        <Link
          to={user ? '/dashboard' : '/'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-1)',
            fontWeight: 800,
            fontSize: '1.25rem',
            color: 'var(--color-primary-900)',
            textDecoration: 'none'
          }}
        >
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-neutral-0)',
              fontWeight: 800
            }}
          >
            P
          </div>
          <span>PathForge</span>
        </Link>

        {/* Center / Right Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          {user ? (
            <>
              <Link
                to="/personalized-dashboard"
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--color-primary)',
                  padding: 'var(--space-0-5) var(--space-1)'
                }}
              >
                Roadmap
              </Link>

              <Link
                to="/onboarding"
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--color-neutral-700)',
                  padding: 'var(--space-0-5) var(--space-1)'
                }}
              >
                Onboarding
              </Link>

              <Link
                to="/dashboard"
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--color-neutral-700)',
                  padding: 'var(--space-0-5) var(--space-1)'
                }}
              >
                Dashboard
              </Link>

              <Link
                to="/settings"
                style={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'var(--color-neutral-700)',
                  padding: 'var(--space-0-5) var(--space-1)'
                }}
              >
                Settings
              </Link>

              
              {/* System AI / Mock Mode Indicator */}
              {systemStatus && (
                <Link
                  to="/settings"
                  title={`Engine: ${systemStatus.activeModel || systemStatus.label}. Click to adjust settings.`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px',
                    padding: '3px 10px',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textDecoration: 'none',
                    border: '1px solid',
                    ...(systemStatus.mode === 'ai_mode'
                      ? { backgroundColor: '#dcfce7', color: '#15803d', borderColor: '#86efac' }
                      : systemStatus.mode === 'fallback_mode'
                      ? { backgroundColor: '#fef3c7', color: '#b45309', borderColor: '#fde68a' }
                      : { backgroundColor: '#e0f2fe', color: '#0369a1', borderColor: '#bae6fd' })
                  }}
                >
                  <span>{systemStatus.mode === 'ai_mode' ? '⚡' : systemStatus.mode === 'fallback_mode' ? '🛡️' : '🧪'}</span>
                  <span>{systemStatus.label || 'AI Mode'}</span>
                </Link>
              )}

              {/* User Pill */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-1)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.8125rem',
                  fontWeight: 600
                }}
              >
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--color-primary-100)',
                    color: 'var(--color-primary-800)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.6875rem'
                  }}
                >
                  {user.name?.charAt(0) || 'U'}
                </div>
                <span>{user.name}</span>
              </div>

              <Button variant="ghost" size="sm" onClick={handleLogout}>
                Sign Out
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;
