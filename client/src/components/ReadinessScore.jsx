import React from 'react';

const ReadinessScore = ({
  score = 0,
  completedCount = 0,
  totalCount = 0,
  className = '',
}) => {
  const clampedScore = Math.min(Math.max(0, Math.round(score)), 100);

  // SVG Circular Ring parameters
  const size = 140;
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className={`readiness-score-widget ${className}`.trim()}>
      <div className="readiness-ring-wrapper">
        <svg
          className="readiness-svg-ring"
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-hidden="true"
        >
          {/* Background circle */}
          <circle
            className="ring-bg"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          {/* Progress circle in Amber Accent */}
          <circle
            className="ring-progress"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </svg>

        {/* Big Bold Number & Percent Centered inside Ring */}
        <div className="readiness-ring-inner">
          <span className="readiness-number">{clampedScore}</span>
          <span className="readiness-symbol">%</span>
        </div>
      </div>

      <div className="readiness-meta-content">
        <h3 className="readiness-title">Readiness Score</h3>
        <p className="readiness-subtitle">
          Weighted progress calculated from completed curriculum milestones.
        </p>

        <div className="readiness-completed-badge">
          <span className="completed-counter-icon">✓</span>
          <span className="completed-counter-text">
            <strong>{completedCount}</strong> of <strong>{totalCount}</strong> modules completed
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReadinessScore;
