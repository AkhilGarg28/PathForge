import React from 'react';

const ProgressBar = ({
  value = 0,
  max = 100,
  label = '',
  showPercentage = true,
  className = '',
}) => {
  const clampedValue = Math.min(Math.max(0, value), max);
  const percentage = Math.round((clampedValue / max) * 100);

  return (
    <div className={`progress-wrapper ${className}`.trim()}>
      {(label || showPercentage) && (
        <div className="progress-labels">
          {label && <span className="progress-label-text">{label}</span>}
          {showPercentage && <span className="progress-percentage">{percentage}%</span>}
        </div>
      )}
      <div
        className="progress-track"
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
