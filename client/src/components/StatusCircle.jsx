import React from 'react';

export function StatusCircle({ status = 'locked', size = 'md', className = '' }) {
  const sizePx = size === 'sm' ? 24 : size === 'lg' ? 40 : 32;
  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 20 : 16;

  const config =
    {
      complete: {
        bg: 'var(--color-success)',
        border: 'var(--color-success)',
        color: 'var(--color-neutral-0)',
        icon: (
          <svg
            width={iconSize}
            height={iconSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )
      },
      active: {
        bg: 'var(--color-primary)',
        border: 'var(--color-primary)',
        color: 'var(--color-neutral-0)',
        pulse: true,
        icon: (
          <svg width={iconSize} height={iconSize} viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
        )
      },
      locked: {
        bg: 'var(--color-neutral-200)',
        border: 'var(--color-neutral-300)',
        color: 'var(--color-neutral-500)',
        icon: (
          <svg
            width={iconSize}
            height={iconSize}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        )
      }
    }[status] || config.locked;

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: sizePx,
        height: sizePx,
        borderRadius: '50%',
        backgroundColor: config.bg,
        border: `2px solid ${config.border}`,
        color: config.color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}
      aria-label={`Module status: ${status}`}
    >
      {config.pulse && (
        <span
          style={{
            position: 'absolute',
            inset: -4,
            borderRadius: '50%',
            border: '2px solid var(--color-primary-400)',
            animation: 'pf-ring-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }}
        />
      )}
      <style>{`
        @keyframes pf-ring-pulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 0; transform: scale(1.3); }
        }
      `}</style>
      {config.icon}
    </div>
  );
}

export default StatusCircle;
