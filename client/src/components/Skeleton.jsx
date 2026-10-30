import React from 'react';

export function Skeleton({ variant = 'text', width = '100%', height, className = '', style = {} }) {
  const isCircle = variant === 'circle';
  const computedHeight = height || (isCircle ? width : variant === 'text' ? '1rem' : '100px');
  const borderRadius = isCircle
    ? 'var(--radius-full)'
    : variant === 'text'
      ? 'var(--radius-sm)'
      : 'var(--radius-md)';

  return (
    <div
      className={className}
      aria-hidden="true"
      style={{
        display: 'inline-block',
        width,
        height: computedHeight,
        borderRadius,
        backgroundColor: 'var(--color-neutral-200)',
        animation: 'pf-pulse 1.5s ease-in-out infinite',
        ...style
      }}
    >
      <style>{`
        @keyframes pf-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </div>
  );
}

export default Skeleton;
