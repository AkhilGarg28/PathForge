import './EmptyState.css';

/**
 * Standardized empty state presentation component.
 */
export default function EmptyState({
  icon = '📭',
  title = 'No items found',
  message = 'There is currently no data to display here.',
  action,
  className = '',
}) {
  return (
    <div className={`pf-empty-state ${className}`.trim()}>
      {icon && (
        <div className="pf-empty-state__icon" aria-hidden="true">
          {icon}
        </div>
      )}

      <h3 className="pf-empty-state__title">{title}</h3>

      {message && <p className="pf-empty-state__message">{message}</p>}

      {action && <div className="pf-empty-state__action">{action}</div>}
    </div>
  );
}
