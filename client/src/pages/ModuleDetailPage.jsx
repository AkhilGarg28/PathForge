import React from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';

const ModuleDetailPage = () => {
  const { moduleId } = useParams();

  return (
    <div className="page-container">
      <div style={{ marginBottom: '16px' }}>
        <Link to="/dashboard" style={{ fontSize: '14px', color: 'var(--color-primary)', textDecoration: 'none' }}>
          &larr; Back to Dashboard
        </Link>
      </div>

      <div className="page-header">
        <h1 className="page-title">Module: {moduleId || 'Detail'}</h1>
        <p className="page-subtitle">Learn concepts, review curated resources, and verify your checkpoints.</p>
      </div>

      <div className="placeholder-notice" style={{ marginBottom: '24px' }}>
        <p><strong>[Placeholder Page]</strong> Module details and completion via <code>PATCH /api/roadmap/module/:moduleId/complete</code> will be wired here.</p>
      </div>

      <div className="demo-grid">
        <Card title="Curated Resources" subtitle="Articles, Documentation, and Video Tutorials">
          <ul style={{ paddingLeft: '20px', lineHeight: '1.8', color: 'var(--color-gray-700)' }}>
            <li><a href="#article" style={{ color: 'var(--color-primary)' }}>Express Routing Best Practices</a> (Article)</li>
            <li><a href="#docs" style={{ color: 'var(--color-primary)' }}>MDN Web Docs: Express / Node Overview</a> (Docs)</li>
            <li><a href="#video" style={{ color: 'var(--color-primary)' }}>Building Robust REST APIs</a> (Video)</li>
          </ul>
        </Card>

        <Card title="Checkpoint Quiz" subtitle="Verify concept mastery">
          <p style={{ fontSize: '14px', color: 'var(--color-gray-600)', marginBottom: '16px' }}>
            Answer checkpoint questions to validate your learning before completing this module.
          </p>
          <Button variant="primary" disabled style={{ width: '100%' }}>
            Start Checkpoint Quiz
          </Button>
        </Card>
      </div>

      <div style={{ marginTop: '24px', textAlign: 'right' }}>
        <Button variant="primary" disabled>
          Complete Module & Unlock Next
        </Button>
      </div>
    </div>
  );
};

export default ModuleDetailPage;
