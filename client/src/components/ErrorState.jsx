import React from 'react';
import { Button } from './Button.jsx';

export function ErrorState({
  title = 'Something Went Wrong',
  message = 'An error occurred while loading this section. Please try again.',
  onRetry,
  retryLabel = 'Try Again',
  className = ''
}) {
  return (
    <div
      className={className}
      role="alert"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-6) var(--space-3)',
        textAlign: 'center',
        backgroundColor: 'var(--color-error-bg)',
        border: '1px solid var(--color-error-border)',
        borderRadius: 'var(--radius-lg)'
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-error)',
          color: 'var(--color-neutral-0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-2)'
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <h3
        style={{
          fontSize: '1.125rem',
          fontWeight: 700,
          color: 'var(--color-neutral-900)',
          marginBottom: 'var(--space-0-5)'
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--color-text-body)',
          maxWidth: '420px',
          marginBottom: onRetry ? 'var(--space-3)' : 0
        }}
      >
        {message}
      </p>

      {onRetry && (
        <Button variant="danger" size="md" onClick={onRetry}>
          {retryLabel}
        </Button>
      )}
    </div>
  );
}

export default ErrorState;
