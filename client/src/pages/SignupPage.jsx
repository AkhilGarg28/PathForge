import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { validateName, validateEmail, validatePassword } from '../utils/validation';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
  });

  const [fieldErrors, setFieldErrors] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signup } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field, formData[field]);
  };

  const validateField = (field, value) => {
    let error = '';
    if (field === 'name') {
      error = validateName(value);
    } else if (field === 'email') {
      error = validateEmail(value);
    } else if (field === 'password') {
      error = validatePassword(value, true);
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

    // Mark all as touched
    setTouched({
      name: true,
      email: true,
      password: true,
    });

    const nameErr = validateField('name', formData.name);
    const emailErr = validateField('email', formData.email);
    const passErr = validateField('password', formData.password);

    if (nameErr || emailErr || passErr) {
      return;
    }

    setLoading(true);
    try {
      const user = await signup({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });

      addToast('Account created successfully! Welcome to PathForge.', 'success');
      
      const destination = user.targetRole ? '/dashboard' : '/roles';
      navigate(destination, { replace: true });
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        (err.response?.status === 409
          ? 'An account with this email already exists'
          : 'Failed to sign up. Please try again.');
      setServerError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-center-container">
      <Card
        title="Create an Account"
        subtitle="Start your tailored learning roadmap today"
        className="auth-card"
      >
        {serverError && (
          <ErrorMessage message={serverError} className="auth-error-box" />
        )}

        <form onSubmit={handleSubmit} noValidate className="auth-form">
          {/* Name Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="signup-name">
              Full Name <span className="required-star">*</span>
            </label>
            <input
              id="signup-name"
              type="text"
              name="name"
              autoComplete="name"
              className={`form-input ${
                touched.name && fieldErrors.name ? 'form-input-error' : ''
              }`}
              placeholder="e.g. Alex Doe"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              onBlur={() => handleBlur('name')}
              aria-invalid={touched.name && Boolean(fieldErrors.name)}
              aria-describedby={
                touched.name && fieldErrors.name ? 'signup-name-error' : undefined
              }
              disabled={loading}
              required
            />
            {touched.name && fieldErrors.name && (
              <p id="signup-name-error" className="field-error-text" role="alert">
                {fieldErrors.name}
              </p>
            )}
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="signup-email">
              Email Address <span className="required-star">*</span>
            </label>
            <input
              id="signup-email"
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
                touched.email && fieldErrors.email ? 'signup-email-error' : undefined
              }
              disabled={loading}
              required
            />
            {touched.email && fieldErrors.email && (
              <p id="signup-email-error" className="field-error-text" role="alert">
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-label" htmlFor="signup-password">
              Password <span className="required-star">*</span>
            </label>
            <input
              id="signup-password"
              type="password"
              name="password"
              autoComplete="new-password"
              className={`form-input ${
                touched.password && fieldErrors.password ? 'form-input-error' : ''
              }`}
              placeholder="Min. 8 characters, 1 letter, 1 number"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
              aria-invalid={touched.password && Boolean(fieldErrors.password)}
              aria-describedby={
                touched.password && fieldErrors.password
                  ? 'signup-password-error'
                  : 'signup-password-hint'
              }
              disabled={loading}
              required
            />
            {touched.password && fieldErrors.password ? (
              <p id="signup-password-error" className="field-error-text" role="alert">
                {fieldErrors.password}
              </p>
            ) : (
              <p id="signup-password-hint" className="field-hint-text">
                At least 8 characters with at least one letter and one number.
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
            {loading ? 'Creating Account...' : 'Sign Up'}
          </Button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">
            Log in
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default SignupPage;
