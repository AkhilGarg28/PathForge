import React from 'react';
import { StatusCircle } from './StatusCircle.jsx';

export const StepperModule = React.memo(function StepperModule({
  module,
  index = 0,
  isLast = false,
  onClick,
  className = ''
}) {
  const isLocked = module.status === 'locked';
  const isActive = module.status === 'active';
  const isComplete = module.status === 'complete';

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        position: 'relative',
        gap: 'var(--space-2)',
        paddingBottom: isLast ? 0 : 'var(--space-3)'
      }}
    >
      {/* Connecting Timeline Line */}
      {!isLast && (
        <div
          style={{
            position: 'absolute',
            left: '15px',
            top: '32px',
            bottom: 0,
            width: '2px',
            backgroundColor: isComplete ? 'var(--color-success)' : 'var(--color-border)',
            zIndex: 0
          }}
        />
      )}

      {/* Status Circle */}
      <div style={{ zIndex: 1 }}>
        <StatusCircle status={module.status} size="md" />
      </div>

      {/* Content Card */}
      <div
        onClick={!isLocked && onClick ? () => onClick(module) : undefined}
        onKeyDown={
          !isLocked && onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick(module);
                }
              }
            : undefined
        }
        role={!isLocked && onClick ? 'button' : undefined}
        tabIndex={!isLocked && onClick ? 0 : undefined}
        aria-disabled={isLocked}
        aria-label={`${module.title} (${module.status})`}
        style={{
          flex: 1,
          backgroundColor: isActive
            ? 'var(--color-surface)'
            : isComplete
              ? 'var(--color-surface)'
              : 'var(--color-surface-subtle)',
          border: `1px solid ${isActive ? 'var(--color-primary-400)' : 'var(--color-border)'}`,
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--space-2)',
          boxShadow: isActive ? 'var(--shadow-md)' : 'var(--shadow-sm)',
          cursor: !isLocked && onClick ? 'pointer' : 'default',
          transition: 'all 0.15s ease'
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 'var(--space-0-5)'
          }}
        >
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: isActive
                ? 'var(--color-primary)'
                : isComplete
                  ? 'var(--color-success)'
                  : 'var(--color-text-muted)'
            }}
          >
            Module {index + 1} • {module.status}
          </span>
          <span
            style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 500 }}
          >
            {module.estimatedHours} hrs
          </span>
        </div>

        <h3
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: isLocked ? 'var(--color-neutral-600)' : 'var(--color-neutral-900)',
            marginBottom: 'var(--space-0-5)'
          }}
        >
          {module.title}
        </h3>

        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--color-text-body)',
            lineHeight: 1.4,
            marginBottom: 'var(--space-1)'
          }}
        >
          {module.description}
        </p>

        {module.resourceTags && module.resourceTags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-0-5)' }}>
            {module.resourceTags.map((tag) => (
              <span
                key={tag}
                style={{
                  fontSize: '0.6875rem',
                  fontWeight: 600,
                  backgroundColor: 'var(--color-primary-50)',
                  color: 'var(--color-primary-800)',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)'
                }}
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

export default StepperModule;
