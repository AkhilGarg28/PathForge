import { memo } from 'react';
import StatusCircle from './StatusCircle.jsx';
import './StepperModule.css';

/**
 * Interactive roadmap step component.
 * Displays progress state, connector lines, estimates, and accessibility attributes.
 * Wrapped in React.memo to prevent re-rendering unchanged modules in the dashboard stepper.
 */
function StepperModule({
  title,
  description,
  estimatedHours,
  status = 'locked', // 'locked' | 'active' | 'complete'
  isLast = false,
  onClick,
  className = '',
  stepNumber,
  isUpdated = false,
}) {
  const isLocked = status === 'locked';

  const badgeLabels = {
    locked: 'Locked',
    active: 'In Progress',
    complete: 'Completed',
  };

  const handleClick = (e) => {
    if (isLocked) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  return (
    <div className="pf-stepper-wrapper">
      {!isLast && (
        <div
          className={`pf-stepper-connector ${status === 'complete' ? 'pf-stepper-connector--complete' : ''}`}
          aria-hidden="true"
        />
      )}

      <button
        type="button"
        disabled={isLocked}
        aria-disabled={isLocked}
        onClick={handleClick}
        className={`pf-stepper-module pf-stepper-module--${status} ${className}`.trim()}
      >
        <div className="pf-stepper-module__status-col">
          <StatusCircle status={status} />
        </div>

        <div className="pf-stepper-module__content">
          <div className="pf-stepper-module__header">
            <h3 className="pf-stepper-module__title">
              {stepNumber ? `${stepNumber}. ` : ''}
              {title}
            </h3>

            <span
              className={`pf-stepper-module__badge pf-stepper-module__badge--${status}`}
            >
              {badgeLabels[status] || status}
            </span>

            {isUpdated && (
              <span className="pf-stepper-module__badge pf-stepper-module__badge--updated">
                Updated
              </span>
            )}
          </div>

          {description && <p className="pf-stepper-module__desc">{description}</p>}

          <div className="pf-stepper-module__footer">
            {estimatedHours && <span>⏱ {estimatedHours} hrs estimated</span>}

            {isLocked && (
              <span className="pf-stepper-module__lock-hint">
                Complete prior module to unlock
              </span>
            )}
          </div>
        </div>
      </button>
    </div>
  );
}

export default memo(StepperModule);
