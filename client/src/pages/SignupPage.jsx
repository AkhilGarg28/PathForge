import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout.jsx';
import { Card } from '../components/Card.jsx';
import { Input } from '../components/Input.jsx';
import { Button } from '../components/Button.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { usePageTitle } from '../hooks/usePageTitle.js';

export function SignupPage() {
  usePageTitle('Create Account');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { user, loading: authLoading, signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Redirect away if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      if (!user.roleId) {
        navigate('/roles', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, authLoading, navigate]);

  const validate = () => {
    const errs = {};
    const trimmedName = name.trim();

    if (!trimmedName || trimmedName.length < 2) {
      errs.name = 'Name must be at least 2 characters';
    } else if (trimmedName.length > 50) {
      errs.name = 'Name cannot exceed 50 characters';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email.trim())) {
      errs.email = 'Please provide a valid email address';
    }

    if (!password || password.length < 8) {
      errs.password = 'Password must be at least 8 characters long';
    } else if (!/[a-zA-Z]/.test(password)) {
      errs.password = 'Password must contain at least one letter';
    } else if (!/[0-9]/.test(password)) {
      errs.password = 'Password must contain at least one number';
    }

    if (password !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      return;
    }

    setLoading(true);
    try {
      await signup({
        name: name.trim(),
        email: email.trim(),
        password
      });
      toast.success('Account created successfully! Choose your career path.');
      navigate('/roles');
    } catch (err) {
      // Server errors displayed exclusively via toast per contract
      toast.error(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout maxWidth="480px">
      <div style={{ marginTop: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <Card>
          <div style={{ textAlign: 'center', marginBottom: 'var(--space-3)' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
              Create Your Account
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Get your personalized AI skill roadmap
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <Input
              label="Full Name"
              type="text"
              placeholder="Alex Mercer"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
              }}
              error={errors.name}
              disabled={loading}
              required
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="alex@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
              }}
              error={errors.email}
              disabled={loading}
              required
            />

            <Input
              label="Password"
              type="password"
              placeholder="At least 8 characters with letter & number"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
              }}
              error={errors.password}
              helperText={
                !errors.password
                  ? 'Must be at least 8 characters long, containing letters and numbers.'
                  : null
              }
              disabled={loading}
              required
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (errors.confirmPassword)
                  setErrors((prev) => ({ ...prev, confirmPassword: null }));
              }}
              error={errors.confirmPassword}
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
              Sign Up
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
            Already have an account?{' '}
            <Link to="/login" style={{ fontWeight: 600 }}>
              Sign In
            </Link>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

export default SignupPage;
