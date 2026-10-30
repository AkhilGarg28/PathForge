import './StatusCircle.css';

const STATUS_CONFIG = {
  locked: {
    label: 'Status: Locked',
    symbol: '🔒',
  },
  active: {
    label: 'Status: In Progress',
    symbol: '▶',
  },
  complete: {
    label: 'Status: Complete',
    symbol: '✓',
  },
};

/**
 * Status indicator circle that does NOT rely on color alone.
 * Uses distinct icons (lock, play, checkmark) and explicit aria-label.
 */
export default function StatusCircle({ status = 'locked', className = '', size }) {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.locked;
  const customStyle = size ? { width: size, height: size } : undefined;

  return (
    <span
      role="img"
      aria-label={config.label}
      className={`pf-status-circle pf-status-circle--${status} ${className}`.trim()}
      style={customStyle}
    >
      <span className="pf-status-circle__icon" aria-hidden="true">
        {config.symbol}
      </span>
    </span>
  );
}
