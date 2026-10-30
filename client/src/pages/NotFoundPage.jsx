import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import { useAuth } from '../context/AuthContext';

/**
 * Friendly 404 Page Component
 *
 * Renders when the requested URL does not match any registered route.
 */
const NotFoundPage = () => {
  const { user } = useAuth();

  return (
    <div className="page-center-container not-found-page">
      <Card className="not-found-card text-center" style={{ maxWidth: '540px', padding: '48px 24px' }}>
        <div
          className="not-found-icon-bubble"
          style={{
            width: '68px',
            height: '68px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            margin: '0 auto 16px',
          }}
          aria-hidden="true"
        >
          🧭
        </div>

        <span
          className="badge badge-active"
          style={{ marginBottom: '12px', display: 'inline-block' }}
        >
          Error 404
        </span>

        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
          Page Not Found
        </h1>

        <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '28px' }}>
          We could not find the milestone, page, or resource you are looking for. It may have been moved, renamed, or never existed.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {user ? (
            <Link
              to={user.targetRole ? '/dashboard' : '/roles'}
              className="btn btn-primary"
            >
              Continue to {user.targetRole ? 'Dashboard' : 'Roles'} &rarr;
            </Link>
          ) : (
            <Link to="/" className="btn btn-primary">
              Return to Homepage &rarr;
            </Link>
          )}

          <Link to="/roles" className="btn btn-secondary">
            Explore Roles
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default NotFoundPage;
