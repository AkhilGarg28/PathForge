import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { Button } from './Button.jsx';

export function Navbar({ className = '' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
