import React from 'react';
import Card from './Card';
import Button from './Button';

/**
 * Global Error Boundary Component
 *
 * Catches rendering errors anywhere in the React component tree, logs the error,
 * and renders a user-friendly fallback view instead of a white screen or raw trace.
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log unexpected runtime UI errors
    console.error('[PathForge Global Error Boundary Caught]:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="page-center-container error-boundary-container">
          <Card className="error-boundary-card text-center" style={{ maxWidth: '580px', padding: '40px 24px' }}>
            <div
              className="error-icon-bubble"
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-danger-bg)',
                color: 'var(--color-danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                margin: '0 auto 16px',
              }}
              aria-hidden="true"
            >
              ⚠️
            </div>

            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              Something went wrong
            </h1>

            <p style={{ fontSize: '0.95rem', color: 'var(--color-text-secondary)', lineHeight: 1.5, marginBottom: '24px' }}>
              An unexpected display issue occurred. Your progress and curriculum data are safe. Please reload the page or return to the main dashboard.
            </p>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button variant="primary" onClick={this.handleReload}>
                Reload Page
              </Button>
              <Button variant="secondary" onClick={this.handleGoHome}>
                Return to Dashboard
              </Button>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
