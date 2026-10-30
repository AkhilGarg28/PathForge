import './Card.css';

/**
 * Surface container with token-based borders, radii, elevation, and optional
 * header/footer slots.
 */
export default function Card({
  children,
  header,
  footer,
  variant = 'default',
  className = '',
  onClick,
  ...props
}) {
  const isInteractive = Boolean(onClick) || variant === 'interactive';
  const classes = [
    'pf-card',
    `pf-card--${variant}`,
    isInteractive ? 'pf-card--interactive' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className={classes}
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={
        isInteractive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.(e);
              }
            }
          : undefined
      }
      {...props}
    >
      {header && <div className="pf-card__header">{header}</div>}
      <div className="pf-card__body">{children}</div>
      {footer && <div className="pf-card__footer">{footer}</div>}
    </div>
  );
}
