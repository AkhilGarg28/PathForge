import Skeleton from './Skeleton.jsx';

/**
 * Accessible route loading skeleton fallback used by React.Suspense
 * while lazy-loaded page chunks are being fetched.
 */
export default function RouteSkeletonFallback() {
  return (
    <main
      id="main-content"
      className="pf-route-loading-fallback"
      role="status"
      aria-live="polite"
      aria-label="Loading page content"
      style={{
        maxWidth: 'var(--container-max, 1200px)',
        margin: '0 auto',
        padding: 'var(--space-4, 32px) var(--space-2, 16px)',
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      <div style={{ marginBottom: 'var(--space-3, 24px)' }}>
        <Skeleton
          width="160px"
          height="24px"
          style={{ marginBottom: 'var(--space-1, 8px)' }}
        />
        <Skeleton
          width="280px"
          height="36px"
          style={{ marginBottom: 'var(--space-1, 8px)' }}
        />
        <Skeleton width="360px" height="18px" />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-3, 24px)',
        }}
      >
        <Skeleton variant="card" height="180px" />
        <Skeleton variant="card" height="180px" />
        <Skeleton variant="card" height="180px" />
      </div>
    </main>
  );
}
