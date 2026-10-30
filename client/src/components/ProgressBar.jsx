import './ProgressBar.css';

/**
 * Accessible progress bar utilizing the single amber accent token reserved exclusively
 * for progression tracking across PathForge.
 */
export default function ProgressBar({
  value = 0,
  max = 100,
  label,
  showValueText = true,
  size = 'md',
  className = '',
}) {
  const clampedValue = Math.min(Math.max(Number(value) || 0, 0), max);
  const percentage = Math.round((clampedValue / max) * 100);

  return (
    <div className={`pf-progress-container ${className}`.trim()}>
      {(label || showValueText) && (
        <div className="pf-progress-header">
          {label && <span>{label}</span>}
          {showValueText && (
            <span className="pf-progress-header__value">{percentage}%</span>
          )}
        </div>
      )}

      <div
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || 'Progress'}
        className={`pf-progress-track pf-progress-track--${size}`}
      >
        <div className="pf-progress-fill" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}
