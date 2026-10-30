import React from 'react';

const Toast = ({ id: _id, message, type = 'info', onClose }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '!';
      default:
        return 'ℹ';
    }
  };

  return (
    <div className={`toast toast-${type}`} role="alert">
      <span className="toast-icon">{getIcon()}</span>
      <div className="toast-content">{message}</div>
      {onClose && (
        <button
          className="toast-close-btn"
          onClick={onClose}
          aria-label="Close notification"
        >
          &times;
        </button>
      )}
    </div>
  );
};

export default Toast;
