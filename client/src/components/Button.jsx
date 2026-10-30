import './Button.css';

/**
 * Accessible button supporting primary, secondary, ghost, danger variants,
 * loading spinner state, custom sizes, and minimum 44px touch targets.
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  ...props
}) {
  const classes = [
    'pf-button',
    `pf-button--${variant}`,
    `pf-button--${size}`,
    loading ? 'pf-button--loading' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      aria-busy={loading}
      {...props}
    >
      {loading && <span className="pf-button__spinner" aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
}
