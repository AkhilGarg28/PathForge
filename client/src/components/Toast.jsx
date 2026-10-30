import './Toast.css';

const VARIANT_ICONS = {
  success: '✓',
  error: '⚠',
  info: 'ℹ',
};

/**
 * Accessible individual toast notification.
 */
export default function Toast({ id, type = 'info', message, onDismiss }) {
  const isError = type === 'error';

  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      className={`pf-toast pf-toast--${type}`}
    >
      <div className="pf-toast__content">
        <span className="pf-toast__icon" aria-hidden="true">
          {VARIANT_ICONS[type] || '•'}
        </span>
        <p className="pf-toast__message">{message}</p>
      </div>

      <button
        type="button"
        className="pf-toast__close-btn"
        onClick={() => onDismiss(id)}
        aria-label="Dismiss notification"
      >
        <span aria-hidden="true">✕</span>
      </button>
    </div>
  );
}
