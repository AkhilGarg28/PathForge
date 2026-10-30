import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';

export default function PublicOnlyRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        role="status"
        aria-live="polite"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          gap: '1rem',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e2e8f0',
            borderTop: '4px solid #4f46e5',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        <p style={{ color: '#475569', fontSize: '0.95rem' }}>Loading…</p>
      </div>
    );
  }

  if (user) {
    const hasRole = Boolean(user.roleId || user.targetRole);
    const destination = hasRole ? '/dashboard' : '/role-selection';
    return <Navigate to={destination} replace />;
  }

  return children;
}
