import { Component } from 'react';
import Button from './Button.jsx';
import './ErrorBoundary.css';

/**
 * Global ErrorBoundary
 * Catches unhandled JavaScript rendering exceptions across the component tree,
 * logs them, and renders an accessible fallback card with a "Reload" action.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    if (typeof console !== 'undefined' && console.error) {
      console.error('ErrorBoundary caught unhandled render exception:', error, errorInfo);
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function'
          ? this.props.fallback({
              error: this.state.error,
              reset: this.handleReset,
              reload: this.handleReload,
            })
          : this.props.fallback;
      }

      return (
        <div className="pf-error-boundary" role="alert" aria-live="assertive">
          <div className="pf-error-boundary__card">
            <div className="pf-error-boundary__icon" aria-hidden="true">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <h1 className="pf-error-boundary__title">Something went wrong</h1>
            <p className="pf-error-boundary__description">
              An unexpected error occurred while loading this view. You can reload the
              page or return to the home screen.
            </p>
            <div className="pf-error-boundary__actions">
              <Button variant="primary" onClick={this.handleReload}>
                Reload page
              </Button>
              <a href="/" className="pf-error-boundary__home-link">
                Return home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
