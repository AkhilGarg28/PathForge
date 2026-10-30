import React from 'react';

export function ReadinessScore({
  score = 0,
  size = 'md',
  showTier = true,
  className = '',
  style = {}
}) {
  const normalizedScore = Math.min(100, Math.max(0, Math.round(Number(score) || 0)));

  const getTier = (s) => {
    if (s >= 85) return { label: 'Interview Ready', color: 'var(--color-success)' };
    if (s >= 60) return { label: 'Job Competent', color: 'var(--color-primary)' };
    if (s >= 30) return { label: 'Developing Skills', color: 'var(--color-accent)' };
    return { label: 'Foundational Stage', color: 'var(--color-neutral-500)' };
  };

  const tier = getTier(normalizedScore);
  const sizePx = size === 'sm' ? 70 : size === 'lg' ? 140 : 100;
  const strokeWidth = size === 'sm' ? 6 : size === 'lg' ? 10 : 8;
  const radius = (sizePx - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 'var(--space-1)',
        ...style
      }}
    >
      <div style={{ position: 'relative', width: sizePx, height: sizePx }}>
        <svg width={sizePx} height={sizePx} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background Track */}
          <circle
            cx={sizePx / 2}
            cy={sizePx / 2}
            r={radius}
            stroke="var(--color-neutral-200)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {/* Amber Progress Fill */}
          <circle
            cx={sizePx / 2}
            cy={sizePx / 2}
            r={radius}
            stroke="var(--color-accent)"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="none"
            style={{ transition: 'stroke-dashoffset 0.6s ease' }}
          />
        </svg>

        {/* Center Score Text */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1
          }}
        >
          <span
            style={{
              fontSize: size === 'sm' ? '1rem' : size === 'lg' ? '2rem' : '1.5rem',
              fontWeight: 800,
              color: 'var(--color-neutral-900)'
            }}
          >
            {normalizedScore}%
          </span>
          <span
            style={{
              fontSize: size === 'sm' ? '0.625rem' : '0.75rem',
              fontWeight: 600,
              color: 'var(--color-text-muted)',
              marginTop: '2px'
            }}
          >
            Readiness
          </span>
        </div>
      </div>

      {showTier && (
        <span
          style={{
            fontSize: '0.8125rem',
            fontWeight: 700,
            color: tier.color,
            backgroundColor: 'var(--color-surface)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {tier.label}
        </span>
      )}
    </div>
  );
}

export default ReadinessScore;
