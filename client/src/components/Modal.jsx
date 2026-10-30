import { useEffect, useRef, useId } from 'react';
import './Modal.css';

/**
 * Reusable, accessible Modal Dialog component.
 * Features:
 * - Proper WAI-ARIA dialog attributes (role, aria-modal, aria-labelledby)
 * - Complete keyboard focus trap (Tab / Shift+Tab cycling)
 * - Escape key dismissal
 * - Returns focus to previously active trigger element on close
 * - Background body scroll locking while open
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  role = 'dialog',
  ariaLabelledBy,
  closeOnBackdrop = true,
  closeOnEsc = true,
  showCloseButton = true,
  className = '',
}) {
  const autoId = useId();
  const titleId = ariaLabelledBy || `pf-modal-title-${autoId}`;

  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;

    // Save active element to return focus on modal dismissal
    previousFocusRef.current = document.activeElement;

    // Lock body scrolling
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Focus the modal container or the first focusable element inside it
    const modalElement = modalRef.current;
    if (modalElement) {
      const focusable = modalElement.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusable.length > 0) {
        focusable[0].focus();
      } else {
        modalElement.focus();
      }
    }

    // Keyboard navigation & Focus Trap
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && closeOnEsc) {
        e.preventDefault();
        onClose?.();
        return;
      }

      if (e.key === 'Tab') {
        if (!modalElement) return;

        const focusable = modalElement.querySelectorAll(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        );

        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;

      // Return focus to previous element
      if (
        previousFocusRef.current &&
        typeof previousFocusRef.current.focus === 'function'
      ) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen, closeOnEsc, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e) => {
    if (closeOnBackdrop && e.target === e.currentTarget) {
      onClose?.();
    }
  };

  return (
    <div className="pf-modal-backdrop" onClick={handleBackdropClick} role="presentation">
      <div
        ref={modalRef}
        role={role}
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`pf-modal-container pf-modal-container--${size} ${className}`.trim()}
      >
        <div className="pf-modal-header">
          {title && (
            <h2 id={titleId} className="pf-modal-title">
              {title}
            </h2>
          )}

          {showCloseButton && (
            <button
              type="button"
              className="pf-modal-close-btn"
              onClick={onClose}
              aria-label="Close dialog"
            >
              ✕
            </button>
          )}
        </div>

        <div className="pf-modal-body">{children}</div>

        {footer && <div className="pf-modal-footer">{footer}</div>}
      </div>
    </div>
  );
}
