import { useState, useEffect } from 'react';
import './OfflineBanner.css';

/**
 * OfflineBanner component
 * Tracks network connectivity using the browser's online/offline window events.
 * Surfaces a prominent status banner whenever connectivity is lost.
 */
export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(() => {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  });
  const [showRestoredNotice, setShowRestoredNotice] = useState(false);

  useEffect(() => {
    let timer = null;

    const handleOnline = () => {
      setIsOnline(true);
      setShowRestoredNotice(true);
      timer = setTimeout(() => {
        setShowRestoredNotice(false);
      }, 3500);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowRestoredNotice(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (timer) clearTimeout(timer);
    };
  }, []);

  if (!isOnline) {
    return (
      <div
        className="pf-offline-banner pf-offline-banner--offline"
        role="status"
        aria-live="assertive"
      >
        <span className="pf-offline-banner__icon" aria-hidden="true">
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="1" y1="1" x2="23" y2="23" />
            <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
            <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
            <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
            <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
            <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
            <line x1="12" y1="20" x2="12.01" y2="20" />
          </svg>
        </span>
        <span>
          You are currently offline. Changes may not be saved until connection is
          restored.
        </span>
      </div>
    );
  }

  if (showRestoredNotice) {
    return (
      <div
        className="pf-offline-banner pf-offline-banner--restored"
        role="status"
        aria-live="polite"
      >
        <span className="pf-offline-banner__icon" aria-hidden="true">
          ✓
        </span>
        <span>Internet connection restored.</span>
      </div>
    );
  }

  return null;
}
