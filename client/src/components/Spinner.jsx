import React from 'react';

export function Spinner({ size = 'md', color = 'primary', className = '' }) {
  const sizePx = size === 'sm' ? '16px' : size === 'lg' ? '36px' : '24px';
  const strokeWidth = size === 'sm' ? '2.5px' : '3px';

  const colorVar =
    color === 'white'
      ? 'var(--color-neutral-0)'
      : color === 'accent'
        ? 'var(--color-accent)'
        : 'var(--color-primary)';

  return (
    <div
      role="status"
      aria-label="Loading"
      className={className}
      style={{
        display: 'inline-block',
        width: sizePx,
        height: sizePx,
        border: `${strokeWidth} solid var(--color-border)`,
        borderTopColor: colorVar,
        borderRadius: '50%',
        animation: 'pf-spin 0.6s linear infinite'
      }}
    >
      <style>{`
        @keyframes pf-spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default Spinner;
