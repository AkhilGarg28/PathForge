import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import Button from '../components/Button.jsx';
import './NotFoundPage.css';

export default function NotFoundPage() {
  const { user } = useAuth();
  usePageTitle('Page Not Found');

  return (
    <main id="main-content" className="pf-not-found-page">
      <div
        className="pf-not-found-card"
        role="region"
        aria-labelledby="not-found-heading"
      >
        <div className="pf-not-found-visual" aria-hidden="true">
          <div className="pf-not-found-icon-wrapper">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="m4.93 4.93 4.24 4.24" />
              <path d="m14.83 9.17 4.24-4.24" />
              <path d="m14.83 14.83 4.24 4.24" />
              <path d="m9.17 14.83-4.24 4.24" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </div>
        </div>

        <span className="pf-not-found-code">Error 404</span>
        <h1 id="not-found-heading" className="pf-not-found-title">
          Page Not Found
        </h1>

        <p className="pf-not-found-desc">
          We couldn&apos;t find the path you were looking for. It may have moved, been
          renamed, or you may have followed an outdated link.
        </p>

        <div className="pf-not-found-actions">
          <Link to="/" style={{ textDecoration: 'none' }}>
            <Button variant="primary" size="md">
              Return to Home
            </Button>
          </Link>

          {user && (
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <Button variant="secondary" size="md">
                Go to Dashboard
              </Button>
            </Link>
          )}
        </div>

        <div className="pf-not-found-links">
          <span>Need help finding your way?</span>
          <Link to="/role-selection">Browse Career Tracks</Link>
        </div>
      </div>
    </main>
  );
}
