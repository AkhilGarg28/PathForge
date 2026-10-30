import React, { createContext, useContext, useState, useCallback, useMemo } from 'react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = 'info', message, duration = 4000 }) => {
      const id = Date.now() + Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, message }]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
      return id;
    },
    [removeToast]
  );

  const toast = useMemo(
    () => ({
      info: (msg, duration) => addToast({ type: 'info', message: msg, duration }),
      success: (msg, duration) => addToast({ type: 'success', message: msg, duration }),
      error: (msg, duration) => addToast({ type: 'error', message: msg, duration }),
      warning: (msg, duration) => addToast({ type: 'warning', message: msg, duration })
    }),
    [addToast]
  );

  const contextValue = useMemo(
    () => ({ toast, addToast, removeToast, toasts }),
    [toast, addToast, removeToast, toasts]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />
    </ToastContext.Provider>
  );
}

function ToastContainer({ toasts, onDismiss }) {
  if (toasts.length === 0) return null;

  return (
    <div
      style={containerStyles}
      role="region"
      aria-label="Notifications"
      aria-live="polite"
      aria-atomic="true"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.type === 'error' ? 'alert' : 'status'}
          aria-live={t.type === 'error' ? 'assertive' : 'polite'}
          style={{ ...toastBaseStyles, ...typeStyles[t.type] }}
        >
          <span style={{ flex: 1, fontSize: '0.875rem', fontWeight: 500 }}>{t.message}</span>
          <button
            onClick={() => onDismiss(t.id)}
            style={closeButtonStyles}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

const containerStyles = {
  position: 'fixed',
  bottom: 'var(--space-3)',
  right: 'var(--space-3)',
  zIndex: 9999,
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--space-1)',
  maxWidth: '380px',
  width: '100%',
  pointerEvents: 'none'
};

const toastBaseStyles = {
  pointerEvents: 'auto',
  display: 'flex',
  alignItems: 'center',
  padding: 'var(--space-1-5) var(--space-2)',
  borderRadius: 'var(--radius-md)',
  boxShadow: 'var(--shadow-lg)',
  color: 'var(--color-text)',
  animation: 'slideIn 0.2s ease-out'
};

const typeStyles = {
  info: {
    backgroundColor: 'var(--color-surface)',
    border: '1px solid var(--color-border)',
    borderLeft: '4px solid var(--color-primary)'
  },
  success: {
    backgroundColor: 'var(--color-success-bg)',
    border: '1px solid var(--color-success-border)',
    borderLeft: '4px solid var(--color-success)'
  },
  error: {
    backgroundColor: 'var(--color-error-bg)',
    border: '1px solid var(--color-error-border)',
    borderLeft: '4px solid var(--color-error)'
  },
  warning: {
    backgroundColor: 'var(--color-warning-bg)',
    border: '1px solid var(--color-warning)',
    borderLeft: '4px solid var(--color-warning)'
  }
};

const closeButtonStyles = {
  background: 'none',
  border: 'none',
  fontSize: '1.25rem',
  cursor: 'pointer',
  marginLeft: 'var(--space-1)',
  color: 'var(--color-text-muted)',
  lineHeight: 1
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx.toast;
}

export default ToastContext;
