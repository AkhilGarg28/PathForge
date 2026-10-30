import React from 'react';
import { Button } from './Button.jsx';

export function EmptyState({
  title = 'No Data Available',
  description = 'There are currently no items to display.',
  actionLabel,
  onAction,
  icon,
  className = ''
}) {
  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-6) var(--space-3)',
        textAlign: 'center',
        backgroundColor: 'var(--color-surface)',
        border: '1px dashed var(--color-border)',
        borderRadius: 'var(--radius-lg)'
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-primary-50)',
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 'var(--space-2)'
        }}
      >
        {icon || (
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        )}
      </div>

      <h3
        style={{
          fontSize: '1.125rem',
          fontWeight: 700,
          color: 'var(--color-neutral-900)',
          marginBottom: 'var(--space-1)'
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '0.875rem',
          color: 'var(--color-text-muted)',
          maxWidth: '400px',
          marginBottom: actionLabel ? 'var(--space-3)' : 0
        }}
      >
        {description}
      </p>

      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default EmptyState;
