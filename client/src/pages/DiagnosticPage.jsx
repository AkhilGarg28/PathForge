import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import ProgressBar from '../components/ProgressBar';

const DiagnosticPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Role Skill Diagnostic</h1>
        <p className="page-subtitle">
          Answer multiple choice questions to assess baseline proficiency across core role dimensions.
        </p>
      </div>

      <div className="placeholder-notice" style={{ marginBottom: '24px' }}>
        <p><strong>[Placeholder Page]</strong> Diagnostic questions from <code>GET /api/diagnostic/:roleId</code> will be interactive here.</p>
      </div>

      <ProgressBar value={25} label="Assessment Progress (3 of 12 Questions Answered)" />

      <div style={{ marginTop: '24px' }}>
        <Card title="Question 4: React Ecosystem" subtitle="Component State Lifecycle">
          <p style={{ fontSize: '16px', marginBottom: '16px', fontWeight: 500 }}>
            What is the primary difference between useEffect and useLayoutEffect in React?
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label className="radio-option">
              <input type="radio" name="sample_q" disabled />
              <span>useLayoutEffect fires synchronously after all DOM mutations.</span>
            </label>
            <label className="radio-option">
              <input type="radio" name="sample_q" disabled />
              <span>useEffect only runs on component unmount.</span>
            </label>
            <label className="radio-option">
              <input type="radio" name="sample_q" disabled />
              <span>useLayoutEffect runs exclusively on the server side.</span>
            </label>
            <label className="radio-option">
              <input type="radio" name="sample_q" disabled />
              <span>There is no difference; useLayoutEffect is a legacy alias.</span>
            </label>
          </div>
        </Card>

        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'space-between' }}>
          <Button variant="secondary" disabled>Previous Question</Button>
          <Link to="/generating" className="btn btn-primary">
            Submit Assessment (Proceed to /generating)
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticPage;
