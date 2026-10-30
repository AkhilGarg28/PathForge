import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';

const DashboardPage = () => {
  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">MERN Developer Roadmap</h1>
          <p className="page-subtitle">Track your milestones, module completion, and career readiness.</p>
        </div>
        <Link to="/settings" className="btn btn-secondary">
          Settings
        </Link>
      </div>

      <div className="placeholder-notice" style={{ marginBottom: '24px' }}>
        <p><strong>[Placeholder Page]</strong> Live roadmap data from <code>GET /api/roadmap</code> will be rendered here.</p>
      </div>

      <div className="demo-grid" style={{ marginBottom: '32px' }}>
        <Card title="Career Readiness" subtitle="Weighted progress across all curriculum milestones">
          <ProgressBar value={40} label="Readiness Score" />
          <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--color-gray-600)' }}>
            2 of 5 modules completed. Completing modules advances your overall readiness score.
          </p>
        </Card>

        <Card title="Current Target Role" subtitle="MERN Developer">
          <p style={{ fontSize: '14px', color: 'var(--color-gray-600)', marginBottom: '16px' }}>
            Diagnostic baseline completed. Next active module: Backend & APIs.
          </p>
          <Link to="/roles" className="btn btn-secondary">
            Change Target Role
          </Link>
        </Card>
      </div>

      <h2 className="section-title">Roadmap Modules</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Module 1 - Completed */}
        <Card
          title="1. Frontend Foundations & Semantic HTML"
          subtitle="Estimated time: 10 hrs"
          headerAction={<span className="badge badge-complete">Complete</span>}
        >
          <p style={{ fontSize: '14px', color: 'var(--color-gray-600)', marginBottom: '12px' }}>
            Covers modern semantic HTML5 tags, accessibility standards, CSS box model, and layout techniques.
          </p>
          <Link to="/module/mod-1" className="btn btn-secondary" style={{ fontSize: '13px' }}>
            Review Module
          </Link>
        </Card>

        {/* Module 2 - Completed */}
        <Card
          title="2. React Ecosystem & State Management"
          subtitle="Estimated time: 15 hrs"
          headerAction={<span className="badge badge-complete">Complete</span>}
        >
          <p style={{ fontSize: '14px', color: 'var(--color-gray-600)', marginBottom: '12px' }}>
            Deep dive into hooks (useState, useEffect, useMemo), component lifecycle, and state architecture.
          </p>
          <Link to="/module/mod-2" className="btn btn-secondary" style={{ fontSize: '13px' }}>
            Review Module
          </Link>
        </Card>

        {/* Module 3 - Active */}
        <Card
          title="3. Backend APIs with Node & Express"
          subtitle="Estimated time: 20 hrs"
          headerAction={<span className="badge badge-active">Active</span>}
          style={{ borderColor: 'var(--color-primary)', borderWidth: '2px' }}
        >
          <p style={{ fontSize: '14px', color: 'var(--color-gray-600)', marginBottom: '12px' }}>
            RESTful API design, Express middleware architecture, error handling pipelines, and route validation.
          </p>
          <Link to="/module/mod-3" className="btn btn-primary" style={{ fontSize: '13px' }}>
            Continue Learning
          </Link>
        </Card>

        {/* Module 4 - Locked */}
        <Card
          title="4. Database Modeling with MongoDB & Mongoose"
          subtitle="Estimated time: 15 hrs"
          headerAction={<span className="badge badge-locked">Locked</span>}
        >
          <p style={{ fontSize: '14px', color: 'var(--color-gray-600)', marginBottom: '12px' }}>
            Schema design, indexing strategies, relationships vs embedding, and aggregation pipelines.
          </p>
          <Button variant="secondary" disabled style={{ fontSize: '13px' }}>
            Locked (Complete Previous Modules)
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
