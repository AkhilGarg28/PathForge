import { useState, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { Card, Input, Button } from '../components/index.js';
import { validateEmail } from '../utils/validation.js';

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  usePageTitle('Log in');

  // Controlled form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Touched state for onBlur validation
  const [touched, setTouched] = useState({
    email: false,
    password: false,
  });

  // Client-side validation errors
  const [errors, setErrors] = useState({});

  // Submitting state for double-submit prevention
  const [submitting, setSubmitting] = useState(false);

  // Server error message
  const [serverError, setServerError] = useState(null);

  // Input element refs for automated focus management
  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const flashMessage = location.state?.message;
  const redirectTarget = location.state?.from?.pathname;

  // Validation runner
  const validateField = (field, value) => {
    switch (field) {
      case 'email':
        return validateEmail(value);
      case 'password':
        return !value ? 'Password is required.' : null;
      default:
        return null;
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setServerError(null);
    if (touched[field]) {
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // Double-submit prevention

    // Run complete validation
    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);

    const validationErrors = {};
    if (emailError) validationErrors.email = emailError;
    if (passwordError) validationErrors.password = passwordError;

    setTouched({ email: true, password: true });
    setErrors(validationErrors);
    setServerError(null);

    // If invalid, focus the first erroneous input
    if (Object.keys(validationErrors).length > 0) {
      if (validationErrors.email) {
        emailRef.current?.focus();
      } else if (validationErrors.password) {
        passwordRef.current?.focus();
      }
      return;
    }

    setSubmitting(true);
    try {
      const res = await login(formData.email.trim(), formData.password);
      const user = res?.user;
      toast.success('Welcome back!');
      const target = redirectTarget || (user?.roleId ? '/dashboard' : '/role-selection');
      navigate(target, { replace: true });
    } catch (err) {
      let message = 'Unable to log in. Please try again.';

      if (err?.status === 401 || err?.code === 'INVALID_CREDENTIALS') {
        message = 'Invalid email or password.';
      } else if (err?.status === 429 || err?.code === 'RATE_LIMIT_EXCEEDED') {
        message = 'Too many attempts. Please try again later.';
      } else if (err?.status === 0 || err?.code === 'NETWORK_ERROR') {
        message = 'Unable to connect to PathForge server. Please check your network.';
      } else if (err?.message) {
        message = err.message;
      }

      setServerError(message);
      toast.error(message);
      passwordRef.current?.focus();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main
      id="main-content"
      className="pf-auth-page"
      style={{
        maxWidth: 440,
        margin: 'var(--space-4) auto',
        padding: '0 var(--space-2)',
      }}
    >
      <Card>
        <h1 style={{ fontSize: 'var(--font-size-2xl)', marginBottom: 'var(--space-1)' }}>
          Log in to PathForge
        </h1>
        <p
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-sm)',
            marginBottom: 'var(--space-3)',
          }}
        >
          Continue your personalized journey to employability.
        </p>

        {flashMessage && (
          <div
            role="status"
            aria-live="polite"
            style={{
              padding: 'var(--space-1) var(--space-2)',
              backgroundColor: 'var(--color-warning-bg)',
              border: '1px solid var(--color-warning-border)',
              color: 'var(--color-warning-text)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--space-3)',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            {flashMessage}
          </div>
        )}

        {serverError && (
          <div
            role="alert"
            aria-live="assertive"
            style={{
              padding: 'var(--space-1) var(--space-2)',
              backgroundColor: 'var(--color-error-bg)',
              border: '1px solid var(--color-error-border)',
              color: 'var(--color-error-text)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 'var(--space-3)',
              fontSize: 'var(--font-size-sm)',
            }}
          >
            {serverError}
          </div>
        )}

        {/* Aria-live announcement for client validation errors */}
        <div className="sr-only" role="status" aria-live="assertive">
          {Object.values(errors).filter(Boolean).join('. ')}
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}
        >
          <Input
            ref={emailRef}
            label="Email"
            type="email"
            name="email"
            autoComplete="email"
            required
            placeholder="name@company.com"
            value={formData.email}
            disabled={submitting}
            error={touched.email ? errors.email : null}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
          />

          <Input
            ref={passwordRef}
            label="Password"
            type="password"
            name="password"
            autoComplete="current-password"
            required
            placeholder="Enter your password"
            value={formData.password}
            disabled={submitting}
            error={touched.password ? errors.password : null}
            onChange={(e) => handleChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
          />

          <div style={{ marginTop: 'var(--space-1)' }}>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={submitting}
              disabled={submitting}
              style={{ width: '100%' }}
            >
              Log in
            </Button>
          </div>
        </form>

        <p
          style={{
            marginTop: 'var(--space-3)',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text-muted)',
            textAlign: 'center',
          }}
        >
          Don&apos;t have an account? <Link to="/signup">Sign up</Link>
        </p>
      </Card>
    </main>
  );
}
