import React from 'react';

export function ProgressBar({
  value = 0,
  max = 100,
  label,
  showPercentage = true,
  height = '8px',
  className = '',
  style = {}
}) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-0-5)',
        width: '100%',
        ...style
      }}
    >
      {(label || showPercentage) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.8125rem',
            fontWeight: 600,
            color: 'var(--color-text-body)'
          }}
        >
          {label && <span>{label}</span>}
          {showPercentage && (
            <span style={{ color: 'var(--color-accent-600)' }}>{percentage}%</span>
          )}
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        style={{
          width: '100%',
          height,
          backgroundColor: 'var(--color-neutral-200)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            backgroundColor: 'var(--color-accent)', // Strictly amber accent for progress
            borderRadius: 'var(--radius-full)',
            transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        />
      </div>
    </div>
  );
}

export default ProgressBar;
