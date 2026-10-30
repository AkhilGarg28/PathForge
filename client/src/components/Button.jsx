import React from 'react';
import { Spinner } from './Spinner.jsx';

export function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  onClick,
  className = '',
  fullWidth = false,
  style = {},
  ...props
}) {
  const isDisabled = disabled || loading;

  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--space-1)',
    fontFamily: 'inherit',
    fontWeight: 600,
    borderRadius: 'var(--radius-md)',
    border: '1px solid transparent',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled && !loading ? 0.6 : 1,
    transition: 'all 0.15s ease',
    width: fullWidth ? '100%' : 'auto',
    textDecoration: 'none',
    userSelect: 'none'
  };

  const sizeStyles =
    {
      sm: {
        padding: 'var(--space-0-5) var(--space-1-5)',
        fontSize: '0.8125rem'
      },
      md: {
        padding: 'var(--space-1) var(--space-2)',
        fontSize: '0.875rem'
      },
      lg: {
        padding: 'var(--space-1-5) var(--space-3)',
        fontSize: '1rem'
      }
    }[size] || sizeStyles.md;

  const variantStyles =
    {
      primary: {
        backgroundColor: 'var(--color-primary)',
        color: 'var(--color-neutral-0)',
        boxShadow: 'var(--shadow-sm)'
      },
      secondary: {
        backgroundColor: 'var(--color-neutral-100)',
        color: 'var(--color-neutral-800)',
        border: '1px solid var(--color-border)'
      },
      outline: {
        backgroundColor: 'transparent',
        borderColor: 'var(--color-primary)',
        color: 'var(--color-primary)'
      },
      ghost: {
        backgroundColor: 'transparent',
        color: 'var(--color-text-body)'
      },
      danger: {
        backgroundColor: 'var(--color-error)',
        color: 'var(--color-neutral-0)'
      }
    }[variant] || variantStyles.primary;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : onClick}
      className={`pf-btn ${className}`}
      style={{
        ...baseStyles,
        ...sizeStyles,
        ...variantStyles,
        ...style
      }}
      {...props}
    >
      {loading && (
        <Spinner
          size="sm"
          color={variant === 'primary' || variant === 'danger' ? 'white' : 'primary'}
        />
      )}
      <span>{children}</span>
    </button>
  );
}

export default Button;
