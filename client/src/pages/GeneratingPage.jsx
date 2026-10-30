import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Spinner from '../components/Spinner';

const GeneratingPage = () => {
  return (
    <div className="page-center-container">
      <Card className="generating-card" style={{ maxWidth: '480px', textAlign: 'center', padding: '32px' }}>
        <Spinner size="lg" label="Generating customized roadmap..." />
        <h2 style={{ marginTop: '24px', marginBottom: '8px', color: 'var(--color-primary)' }}>
          Generating Your Roadmap
        </h2>
        <p style={{ color: 'var(--color-gray-600)', fontSize: '15px', marginBottom: '24px' }}>
          Our adaptive engine is analyzing your diagnostic scores across skill dimensions to construct your tailored learning roadmap...
        </p>
        <div className="placeholder-notice" style={{ marginBottom: '24px' }}>
          <p><strong>[Placeholder Page]</strong> In the full flow, this polls/awaits <code>POST /api/diagnostic/submit</code> response.</p>
        </div>
        <Link to="/dashboard" className="btn btn-primary" style={{ display: 'inline-block' }}>
          Proceed to Learner Dashboard
        </Link>
      </Card>
    </div>
  );
};

export default GeneratingPage;
