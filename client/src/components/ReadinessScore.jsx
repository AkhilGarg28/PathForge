import { memo } from 'react';
import './ReadinessScore.css';

/**
 * Animated circular gauge displaying the user's 0-100 employability readiness score.
 * Employs the single amber progress token and supports a compact variant for mobile.
 * Wrapped in React.memo to optimize gauge re-renders.
 */
function ReadinessScore({
  score = 0,
  label = 'Readiness Score',
  compact = false,
  className = '',
}) {
  const clampedScore = Math.min(Math.max(Number(score) || 0, 0), 100);

  // Geometry configuration
  const radius = compact ? 18 : 52;
  const strokeWidth = compact ? 4 : 9;
  const size = compact ? 44 : 124;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedScore / 100) * circumference;

  return (
    <div
      role="meter"
      aria-label={`${label}: ${clampedScore} out of 100`}
      aria-valuenow={clampedScore}
      aria-valuemin={0}
      aria-valuemax={100}
      className={`pf-readiness-gauge ${compact ? 'pf-readiness-gauge--compact' : ''} ${className}`.trim()}
    >
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg
          className="pf-readiness-gauge__svg"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden="true"
        >
          {/* Background Track */}
          <circle
            className="pf-readiness-gauge__track"
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
          />
          {/* Animated Value Stroke */}
          <circle
            className="pf-readiness-gauge__fill"
            cx={center}
            cy={center}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>

        <div
          className="pf-readiness-gauge__center"
          style={{ width: size, height: size, top: 0, left: 0 }}
        >
          <span className="pf-readiness-gauge__number">{clampedScore}</span>
          {!compact && (
            <span className="pf-readiness-gauge__percent" aria-hidden="true">
              %
            </span>
          )}
        </div>
      </div>

      {label && <span className="pf-readiness-gauge__label">{label}</span>}
    </div>
  );
}

export default memo(ReadinessScore);
