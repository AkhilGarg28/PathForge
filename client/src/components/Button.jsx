import React from 'react';
import Spinner from './Spinner';

const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary'
  disabled = false,
  loading = false,
  type = 'button',
  onClick,
  className = '',
  ...props
}) => {
  const isDisabled = disabled || loading;

  const btnClasses = [
    'btn',
    variant === 'secondary' ? 'btn-secondary' : 'btn-primary',
    loading ? 'btn-loading' : '',
    isDisabled ? 'btn-disabled' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={isDisabled ? undefined : onClick}
      className={btnClasses}
      {...props}
    >
      {loading ? (
        <span className="btn-content-loading">
          <Spinner size="sm" inline label="Processing..." />
          <span className="btn-text">{children}</span>
        </span>
      ) : (
        <span className="btn-text">{children}</span>
      )}
    </button>
  );
};

export default Button;
