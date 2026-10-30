import Button from './Button.jsx';
import './ErrorState.css';

/**
 * Standardized error state presentation component with retry capability.
 */
export default function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred while loading this section.',
  onRetry,
  retryLabel = 'Try Again',
  className = '',
}) {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className={`pf-error-state ${className}`.trim()}
    >
      <div className="pf-error-state__icon" aria-hidden="true">
        ⚠️
      </div>

      <h3 className="pf-error-state__title">{title}</h3>

      {message && <p className="pf-error-state__message">{message}</p>}

      {onRetry && (
        <div className="pf-error-state__action">
          <Button variant="danger" size="md" onClick={onRetry}>
            {retryLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
