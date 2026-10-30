import React from 'react';

const DashboardSkeleton = () => {
  return (
    <div className="page-container dashboard-page-wrapper" aria-busy="true" aria-label="Loading dashboard...">
      {/* Top Header Skeleton */}
      <div className="dashboard-header-skeleton">
        <div className="skeleton-line skeleton-title-line"></div>
        <div className="skeleton-line skeleton-subtitle-line"></div>
      </div>

      {/* Top Readiness Score Card Skeleton */}
      <div className="dashboard-top-section skeleton-card-top">
        <div className="skeleton-circle-ring"></div>
        <div className="skeleton-meta-lines">
          <div className="skeleton-line skeleton-w60"></div>
          <div className="skeleton-line skeleton-w80"></div>
          <div className="skeleton-line skeleton-w40" style={{ height: '24px', marginTop: '12px' }}></div>
        </div>
      </div>

      {/* Stepper Skeletons */}
      <div className="stepper-skeleton-container" style={{ marginTop: '32px' }}>
        <div className="skeleton-line skeleton-w40" style={{ height: '20px', marginBottom: '16px' }}></div>
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="stepper-item-skeleton">
            <div className="stepper-node-skeleton"></div>
            <div className="stepper-card-skeleton">
              <div className="skeleton-line skeleton-w50" style={{ height: '18px', marginBottom: '8px' }}></div>
              <div className="skeleton-line skeleton-w80" style={{ marginBottom: '6px' }}></div>
              <div className="skeleton-line skeleton-w30"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardSkeleton;
