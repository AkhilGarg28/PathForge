import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { validateEmail, validatePassword } from '../utils/validation';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
  });

  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const validateField = (field, value) => {
    let error = '';
    if (field === 'email') {
      error = validateEmail(value);
    } else if (field === 'password') {
      error = validatePassword(value, false);
    }

    setFieldErrors((prev) => ({ ...prev, [field]: error }));
    return error;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setServerError('');

    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    setTouched({
      email: true,
      password: true,
    });

    const emailErr = validateField('email', formData.email);
    const passErr = validateField('password', formData.password);

    if (emailErr || passErr) {
      return;
    }

    setLoading(true);
    try {
      const user = await login({
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      addToast('Logged in successfully!', 'success');

      // Determine destination: prioritize previously attempted route if targetRole exists
      const fromPath = location.state?.from?.pathname;
      let destination;
      if (!user.targetRole) {
        destination = '/roles';
      } else {
        destination = fromPath && fromPath !== '/login' && fromPath !== '/signup' ? fromPath : '/dashboard';
      }

      navigate(destination, { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 401
          ? 'Invalid credentials'
          : 'Failed to log in. Please check your network connection.');
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center-container">
      <Card
        title="Log In to PathForge"
        subtitle="Enter your credentials to continue your journey"
        className="auth-card"
      >
        {serverError && (
          <ErrorMessage message={serverError} className="auth-error-box" />
        )}

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          {/* Email Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-email">
              Email Address <span className="required-star">*</span>
            </label>
            <input
              id="login-email"
              type="email"
              name="email"
              autoComplete="email"
              className={`form-input ${
                touched.email && fieldErrors.email ? 'form-input-error' : ''
              }`}
              placeholder="user@example.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
              aria-invalid={touched.email && Boolean(fieldErrors.email)}
              aria-describedby={
                touched.email && fieldErrors.email ? 'login-email-error' : undefined
              }
              disabled={loading}
              required
            />
            {touched.email && fieldErrors.email && (
              <p id="login-email-error" className="field-error-text" role="alert">
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="login-password">
              Password <span className="required-star">*</span>
            </label>
            <input
              id="login-password"
              type="password"
              name="password"
              autoComplete="current-password"
              className={`form-input ${
                touched.password && fieldErrors.password ? 'form-input-error' : ''
              }`}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              aria-invalid={touched.password && Boolean(fieldErrors.password)}
              aria-describedby={
                touched.password && fieldErrors.password ? 'login-password-error' : undefined
              }
              disabled={loading}
              required
            />
            {touched.password && fieldErrors.password && (
              <p id="login-password-error" className="field-error-text" role="alert">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <Button
            variant="primary"
            type="submit"
            loading={loading}
            disabled={loading}
            style={{ width: '100%', marginTop: '12px' }}
          >
            {loading ? 'Logging In...' : 'Log In'}
          </Button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/signup" className="auth-link">
            Sign up
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
