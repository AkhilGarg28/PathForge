import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { Card, Input, Button } from '../components/index.js';
import {
  validateName,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
} from '../utils/validation.js';

export default function SignupPage() {
  const { signup } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  usePageTitle('Sign up');

  // Controlled form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // Touched state for onBlur validation
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    password: false,
    confirmPassword: false,
  });

  // Client validation errors
  const [errors, setErrors] = useState({});

  // Submitting state for double-submit prevention
  const [submitting, setSubmitting] = useState(false);

  // Server error message
  const [serverError, setServerError] = useState(null);

  // Input element refs for automated focus management
  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const confirmPasswordRef = useRef(null);

  // Validation runner per field
  const validateField = (field, value, allValues = formData) => {
    switch (field) {
      case 'name':
        return validateName(value);
      case 'email':
        return validateEmail(value);
      case 'password':
        return validatePassword(value);
      case 'confirmPassword':
        return validateConfirmPassword(value, allValues.password);
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
    const updatedForm = { ...formData, [field]: value };
    setFormData(updatedForm);
    setServerError(null);

    // If already touched, re-validate
    if (touched[field]) {
      const error = validateField(field, value, updatedForm);
      setErrors((prev) => ({ ...prev, [field]: error }));
    }

    // If modifying password and confirmPassword was already touched, re-validate confirmPassword
    if (field === 'password' && touched.confirmPassword) {
      const confirmError = validateConfirmPassword(formData.confirmPassword, value);
      setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // Double-submit prevention

    // Validate all fields
    const nameError = validateField('name', formData.name);
    const emailError = validateField('email', formData.email);
    const passwordError = validateField('password', formData.password);
    const confirmError = validateField(
      'confirmPassword',
      formData.confirmPassword,
      formData,
    );

    const validationErrors = {};
    if (nameError) validationErrors.name = nameError;
    if (emailError) validationErrors.email = emailError;
    if (passwordError) validationErrors.password = passwordError;
    if (confirmError) validationErrors.confirmPassword = confirmError;

    setTouched({
      name: true,
      email: true,
      password: true,
      confirmPassword: true,
    });
    setErrors(validationErrors);
    setServerError(null);

    // If validation fails, focus the first erroneous input
    if (Object.keys(validationErrors).length > 0) {
      if (validationErrors.name) {
        nameRef.current?.focus();
      } else if (validationErrors.email) {
        emailRef.current?.focus();
      } else if (validationErrors.password) {
        passwordRef.current?.focus();
      } else if (validationErrors.confirmPassword) {
        confirmPasswordRef.current?.focus();
      }
      return;
    }

    setSubmitting(true);
    try {
      await signup(formData.name.trim(), formData.email.trim(), formData.password);
      toast.success('Account created successfully!');
      navigate('/role-selection', { replace: true });
    } catch (err) {
      let message = 'Unable to create account. Please try again.';

      if (err?.status === 409 || err?.code === 'EMAIL_ALREADY_EXISTS') {
        message = 'An account with this email already exists.';
        emailRef.current?.focus();
      } else if (err?.status === 429 || err?.code === 'RATE_LIMIT_EXCEEDED') {
        message = 'Too many attempts. Please try again later.';
      } else if (err?.status === 0 || err?.code === 'NETWORK_ERROR') {
        message = 'Unable to connect to PathForge server. Please check your network.';
      } else if (err?.message) {
        message = err.message;
      }

      setServerError(message);
      toast.error(message);
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
          Create Your Account
        </h1>
        <p
          style={{
            color: 'var(--color-text-secondary)',
            fontSize: 'var(--font-size-sm)',
            marginBottom: 'var(--space-3)',
          }}
        >
          Start building your employer-ready skill roadmap.
        </p>

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

        {/* Live announcement of client errors for screen readers */}
        <div className="sr-only" role="status" aria-live="assertive">
          {Object.values(errors).filter(Boolean).join('. ')}
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}
        >
          <Input
            ref={nameRef}
            label="Full Name"
            name="name"
            autoComplete="name"
            required
            placeholder="Alex Morgan"
            value={formData.name}
            disabled={submitting}
            error={touched.name ? errors.name : null}
            onChange={(e) => handleChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
          />

          <Input
            ref={emailRef}
            label="Email Address"
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
            autoComplete="new-password"
            required
            placeholder="At least 8 characters (1 letter, 1 number)"
            hint="Minimum 8 characters with at least one letter and one number."
            value={formData.password}
            disabled={submitting}
            error={touched.password ? errors.password : null}
            onChange={(e) => handleChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
          />

          <Input
            ref={confirmPasswordRef}
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            autoComplete="new-password"
            required
            placeholder="Re-enter your password"
            value={formData.confirmPassword}
            disabled={submitting}
            error={touched.confirmPassword ? errors.confirmPassword : null}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            onBlur={() => handleBlur('confirmPassword')}
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
              Sign up
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
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </Card>
    </main>
  );
}
