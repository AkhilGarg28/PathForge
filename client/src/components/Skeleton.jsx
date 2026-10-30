import './Skeleton.css';

/**
 * Animated placeholder shimmer for loading states.
 * Supports 'text', 'card', and 'circle' variants.
 */
export default function Skeleton({
  variant = 'text',
  width,
  height,
  lines = 1,
  className = '',
  style = {},
}) {
  const inlineStyle = {
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
    ...style,
  };

  if (variant === 'text' && lines > 1) {
    return (
      <div className={`pf-skeleton-text-group ${className}`.trim()} aria-hidden="true">
        {Array.from({ length: lines }).map((_, index) => (
          <span
            key={index}
            className="pf-skeleton pf-skeleton--text"
            style={{
              ...inlineStyle,
              width: index === lines - 1 && !width ? '70%' : width || '100%',
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <span
      className={`pf-skeleton pf-skeleton--${variant} ${className}`.trim()}
      style={inlineStyle}
      aria-hidden="true"
    />
  );
}
