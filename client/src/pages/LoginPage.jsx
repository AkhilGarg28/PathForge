import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';

const LoginPage = () => {
  const { loginAsDemo } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const handleDemoLogin = () => {
    loginAsDemo();
    addToast('Signed in as Demo Learner (Alex)', 'success');
    navigate(from, { replace: true });
  };

  return (
    <div className="page-center-container">
      <Card title="Log In to PathForge" subtitle="Enter your credentials to continue" className="auth-card">
        <div className="placeholder-notice" style={{ marginBottom: '16px' }}>
          <p><strong>[Placeholder Page]</strong> Real API auth connects next. To preview protected routes right now:</p>
          <div style={{ marginTop: '12px' }}>
            <Button variant="secondary" onClick={handleDemoLogin} style={{ width: '100%' }}>
              ⚡ 1-Click Demo Sign-In (Preview Protected Routes)
            </Button>
          </div>
        </div>
        <form onSubmit={(e) => e.preventDefault()} className="auth-form-placeholder">
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="user@example.com"
              disabled
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              disabled
            />
          </div>
          <Button variant="primary" type="submit" disabled style={{ width: '100%', marginTop: '8px' }}>
            Log In
          </Button>
        </form>
        <div className="auth-footer" style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px' }}>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
