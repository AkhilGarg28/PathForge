import { useState, useId, forwardRef } from 'react';
import './Input.css';

/**
 * Accessible form input supporting label, hint text, validation error text,
 * automated aria-describedby associations, ref forwarding, and password show/hide toggle.
 */
const Input = forwardRef(function Input(
  {
    label,
    hint,
    error,
    type = 'text',
    id,
    required = false,
    disabled = false,
    className = '',
    ...props
  },
  ref,
) {
  const autoId = useId();
  const inputId = id || `pf-input-${autoId}`;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;

  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const effectiveType = isPassword ? (showPassword ? 'text' : 'password') : type;

  const describedBy = [props['aria-describedby'], hintId, errorId]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={`pf-input-group ${className}`.trim()}>
      {label && (
        <label htmlFor={inputId} className="pf-input-group__label">
          <span>{label}</span>
          {required && (
            <span className="pf-input-group__required" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div
        className={`pf-input-group__control ${isPassword ? 'pf-input-group__control--has-toggle' : ''}`.trim()}
      >
        <input
          ref={ref}
          id={inputId}
          type={effectiveType}
          required={required}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={describedBy || undefined}
          className={`pf-input-group__field ${error ? 'pf-input-group__field--error' : ''}`.trim()}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            className="pf-input-group__toggle-btn"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            title={showPassword ? 'Hide password' : 'Show password'}
            tabIndex={0}
          >
            {showPassword ? (
              <span aria-hidden="true">👁️</span>
            ) : (
              <span aria-hidden="true">🙈</span>
            )}
          </button>
        )}
      </div>

      {hint && !error && (
        <p id={hintId} className="pf-input-group__hint">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} role="alert" className="pf-input-group__error">
          {error}
        </p>
      )}
    </div>
  );
});

export default Input;
