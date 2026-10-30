import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';

const SignupPage = () => {
  return (
    <div className="page-center-container">
      <Card title="Create an Account" subtitle="Start your personalized learning path" className="auth-card">
        <div className="placeholder-notice">
          <p><strong>[Placeholder Page]</strong> Signup form functionality will be connected in the next phase.</p>
        </div>
        <form onSubmit={(e) => e.preventDefault()} className="auth-form-placeholder">
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              className="form-input"
              placeholder="Alex Doe"
              disabled
            />
          </div>
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
              placeholder="Min. 8 chars, 1 letter, 1 number"
              disabled
            />
          </div>
          <Button variant="primary" type="submit" disabled style={{ width: '100%', marginTop: '8px' }}>
            Create Account
          </Button>
        </form>
        <div className="auth-footer" style={{ marginTop: '16px', textAlign: 'center', fontSize: '14px' }}>
          Already have an account? <Link to="/login">Log in</Link>
        </div>
      </Card>
    </div>
  );
};

export default SignupPage;
