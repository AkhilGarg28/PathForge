import React from 'react';

const Spinner = ({ size = 'md', label = 'Loading...', inline = false, className = '' }) => {
  const sizeMap = {
    sm: 'spinner-sm',
    md: 'spinner-md',
    lg: 'spinner-lg',
  };

  const spinnerClass = `spinner ${sizeMap[size] || 'spinner-md'} ${className}`.trim();

  if (inline) {
    return (
      <span className={spinnerClass} role="status" aria-label={label}>
        <span className="sr-only">{label}</span>
      </span>
    );
  }

  return (
    <div className="spinner-container" role="status" aria-label={label}>
      <div className={spinnerClass}></div>
      {label && <span className="spinner-label">{label}</span>}
    </div>
  );
};

export default Spinner;
