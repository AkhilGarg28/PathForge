import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from './Navbar.jsx';

export function Layout({ children, maxWidth = '1200px' }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <a href="#main-content" className="pf-skip-link">
        Skip to main content
      </a>

      <Navbar />

      <main
        id="main-content"
        tabIndex="-1"
        style={{
          flex: 1,
          width: '100%',
          maxWidth,
          marginLeft: 'auto',
          marginRight: 'auto',
          padding: 'var(--space-4) var(--space-2)',
          outline: 'none'
        }}
      >
        {children}
      </main>

      <footer
        style={{
          backgroundColor: 'var(--color-surface)',
          borderTop: '1px solid var(--color-border)',
          padding: 'var(--space-6) 0 var(--space-4)',
          color: 'var(--color-text-muted)',
          fontSize: '0.875rem'
        }}
      >
        <div
          className="container"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              gap: 'var(--space-4)',
              alignItems: 'flex-start'
            }}
          >
            {/* Brand column */}
            <div style={{ maxWidth: '360px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-1)',
                  fontWeight: 800,
                  fontSize: '1.25rem',
                  color: 'var(--color-primary-900)',
                  marginBottom: 'var(--space-1)'
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-neutral-0)',
                    fontWeight: 800,
                    fontSize: '0.875rem'
                  }}
                >
                  P
                </div>
                <span>PathForge</span>
              </div>
              <p
                style={{ fontSize: '0.8125rem', lineHeight: 1.5, color: 'var(--color-text-muted)' }}
              >
                AI-Powered Personalized Skill Roadmaps for Employability. Diagnostic-driven skill
                profiling, curated open-source curricula, and continuous career readiness scoring.
              </p>
            </div>

            {/* Quick Links */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-6)' }}>
              <div>
                <h4
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--color-neutral-900)',
                    marginBottom: 'var(--space-1)'
                  }}
                >
                  Platform
                </h4>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <li>
                    <Link
                      to="/roles"
                      style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}
                    >
                      Career Tracks
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/diagnostic"
                      style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}
                    >
                      Diagnostic Assessment
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/styleguide"
                      style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}
                    >
                      Design System
                    </Link>
                  </li>
                </ul>
              </div>

              <div>
                <h4
                  style={{
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--color-neutral-900)',
                    marginBottom: 'var(--space-1)'
                  }}
                >
                  Account
                </h4>
                <ul
                  style={{
                    listStyle: 'none',
                    padding: 0,
                    margin: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  <li>
                    <Link
                      to="/login"
                      style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}
                    >
                      Sign In
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/signup"
                      style={{ color: 'var(--color-text-muted)', textDecoration: 'none' }}
                    >
                      Create Account
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div
            style={{
              paddingTop: 'var(--space-3)',
              borderTop: '1px solid var(--color-border)',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.75rem',
              color: 'var(--color-text-muted)',
              gap: 'var(--space-1)'
            }}
          >
            <span>© 2026 PathForge. All rights reserved.</span>
            <span>Empowering future engineers with deterministic AI roadmaps.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Layout;
