import React, { useId } from 'react';

export function Input({
  label,
  id,
  type = 'text',
  error,
  helperText,
  disabled = false,
  required = false,
  fullWidth = true,
  className = '',
  style = {},
  inputStyle = {},
  ...props
}) {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-0-5)',
        width: fullWidth ? '100%' : 'auto',
        marginBottom: 'var(--space-1-5)',
        ...style
      }}
    >
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '0.875rem',
            fontWeight: 600,
            color: error ? 'var(--color-error)' : 'var(--color-neutral-800)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-0-5)'
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--color-error)' }}>*</span>}
        </label>
      )}

      <input
        id={inputId}
        type={type}
        disabled={disabled}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
        style={{
          width: '100%',
          padding: 'var(--space-1) var(--space-1-5)',
          fontSize: '0.875rem',
          color: 'var(--color-text)',
          backgroundColor: disabled ? 'var(--color-neutral-100)' : 'var(--color-surface)',
          border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-sm)',
          transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
          cursor: disabled ? 'not-allowed' : 'text',
          boxSizing: 'border-box',
          ...inputStyle
        }}
        {...props}
      />

      {error ? (
        <span
          id={`${inputId}-error`}
          role="alert"
          style={{
            fontSize: '0.75rem',
            color: 'var(--color-error)',
            fontWeight: 500
          }}
        >
          {error}
        </span>
      ) : helperText ? (
        <span
          id={`${inputId}-helper`}
          style={{
            fontSize: '0.75rem',
            color: 'var(--color-text-muted)'
          }}
        >
          {helperText}
        </span>
      ) : null}
    </div>
  );
}

export default Input;
