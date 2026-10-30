import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../components/Layout.jsx';
import { Card } from '../components/Card.jsx';
import { Input } from '../components/Input.jsx';
import { Button } from '../components/Button.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { api } from '../services/api.js';

export function LoginPage() {
  usePageTitle('Sign In');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, loading: authLoading, login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  // Redirect away if already logged in
  useEffect(() => {
    let isMounted = true;

    async function redirectLoggedInUser() {
      if (!authLoading && user) {
        if (!user.roleId) {
          navigate('/roles', { replace: true });
          return;
        }

        try {
          await api.getRoadmap();
          if (isMounted) navigate(from || '/dashboard', { replace: true });
        } catch {
          if (isMounted) navigate('/diagnostic', { replace: true });
        }
      }
    }

    redirectLoggedInUser();

    return () => {
      isMounted = false;
    };
  }, [user, authLoading, navigate, from]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password) {
      setError('Please provide your email and password');
      return;
    }

    setLoading(true);

    try {
      const res = await login({ email: email.trim(), password });
      toast.success('Welcome back!');
      const loggedInUser = res?.data?.user;

      if (!loggedInUser?.roleId) {
        navigate('/roles');
        return;
      }

      // Check roadmap existence to direct user to dashboard or diagnostic
      try {
        await api.getRoadmap();
        navigate(from || '/dashboard', { replace: true });
      } catch (roadmapErr) {
        if (
          roadmapErr.statusCode === 404 ||
          roadmapErr.message?.toLowerCase().includes('no roadmap')
        ) {
          navigate('/diagnostic', { replace: true });
        } else {
          navigate(from || '/dashboard', { replace: true });
        }
      }
    } catch (err) {
      // Contract: Always display generic error message
      const genericMessage = 'Invalid email or password';
      setError(genericMessage);
      toast.error(genericMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout maxWidth="440px">
      <div style={{ marginTop: 'var(--space-6)', marginBottom: 'var(--space-6)' }}>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-3)' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
              Sign In to PathForge
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Resume your personalized learning roadmap
            </p>
          </div>

          {error && (
            <div
              role="alert"
              style={{
                backgroundColor: 'var(--color-error-bg)',
                border: '1px solid var(--color-error-border)',
                color: 'var(--color-error)',
                padding: 'var(--space-1) var(--space-2)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                marginBottom: 'var(--space-2)'
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <Input
              label="Email Address"
              type="email"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              loading={loading}
              disabled={loading}
              style={{ marginTop: 'var(--space-2)' }}
            >
              Sign In
            </Button>
          </form>

          <div
            style={{
              textAlign: 'center',
              marginTop: 'var(--space-3)',
              fontSize: '0.875rem',
              color: 'var(--color-text-muted)'
            }}
          >
            Don't have an account?{' '}
            <Link to="/signup" style={{ fontWeight: 600 }}>
              Create an account
            </Link>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

export default LoginPage;
