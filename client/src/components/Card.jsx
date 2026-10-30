import React from 'react';

export function Card({
  children,
  interactive = false,
  onClick,
  className = '',
  style = {},
  padding = 'var(--space-3)',
  ...props
}) {
  return (
    <div
      onClick={interactive ? onClick : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      className={className}
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-sm)',
        padding,
        transition: 'all 0.2s ease',
        cursor: interactive ? 'pointer' : 'default',
        ...(interactive
          ? {
              ':hover': {
                transform: 'translateY(-2px)',
                boxShadow: 'var(--shadow-md)',
                borderColor: 'var(--color-primary-300)'
              }
            }
          : {}),
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
