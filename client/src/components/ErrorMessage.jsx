import React from 'react';

const ErrorMessage = ({
  message,
  errors = [],
  onRetry,
  className = '',
}) => {
  if (!message && (!errors || errors.length === 0)) {
    return null;
  }

  return (
    <div className={`error-message-box ${className}`.trim()} role="alert">
      <div className="error-icon" aria-hidden="true">⚠</div>
      <div className="error-content">
        {message && <p className="error-title">{message}</p>}
        {errors && errors.length > 0 && (
          <ul className="error-list">
            {errors.map((err, index) => (
              <li key={index} className="error-item">
                {typeof err === 'string' ? err : err.message || JSON.stringify(err)}
              </li>
            ))}
          </ul>
        )}
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="error-retry-btn"
        >
          Retry
        </button>
      )}
    </div>
  );
};

export default ErrorMessage;
