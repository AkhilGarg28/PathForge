import { useState, useCallback, useMemo } from 'react';
import { ToastContext } from './toastContextDef.js';
import Toast from '../components/Toast.jsx';

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = 'info', message, duration = 4000 }) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const newToast = { id, type, message };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    [removeToast],
  );

  const success = useCallback(
    (message, duration) => addToast({ type: 'success', message, duration }),
    [addToast],
  );

  const error = useCallback(
    (message, duration) => addToast({ type: 'error', message, duration }),
    [addToast],
  );

  const info = useCallback(
    (message, duration) => addToast({ type: 'info', message, duration }),
    [addToast],
  );

  const value = useMemo(
    () => ({
      addToast,
      removeToast,
      success,
      error,
      info,
    }),
    [addToast, removeToast, success, error, info],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pf-toast-container" aria-label="Notifications" role="region">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            id={toast.id}
            type={toast.type}
            message={toast.message}
            onDismiss={removeToast}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
