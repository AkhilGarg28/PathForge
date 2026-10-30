import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

export function NotFoundPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  usePageTitle('Page Not Found');

  return (
    <Layout>
      <div style={{ padding: 'var(--space-8) 0' }}>
        <EmptyState
          title="404 - Page Not Found"
          description="The link you followed may be broken or the page may have been removed. Let's get you back on track."
          actionLabel={user ? 'Return to Dashboard' : 'Back to Home'}
          onAction={() => navigate(user ? '/dashboard' : '/')}
        />
      </div>
    </Layout>
  );
}

export default NotFoundPage;
