import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';

const RolesPage = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Choose Your Target Role</h1>
        <p className="page-subtitle">
          Select a role to generate a targeted diagnostic assessment.
        </p>
      </div>

      <div className="placeholder-notice" style={{ marginBottom: '24px' }}>
        <p><strong>[Placeholder Page]</strong> Live roles from <code>GET /api/roles</code> will be populated here.</p>
      </div>

      <div className="demo-grid">
        <Card
          title="MERN Developer"
          subtitle="Full-stack web development with MongoDB, Express, React, and Node.js"
          footer={
            <Link to="/diagnostic" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>
              Select Role & Start Diagnostic
            </Link>
          }
        >
          <p style={{ fontSize: '14px', color: 'var(--color-gray-600)', marginBottom: '12px' }}>
            Includes 6 skill dimensions: Frontend Basics, React Ecosystem, Backend & APIs, Database Design, Authentication, and Testing.
          </p>
          <div className="demo-flex">
            <span className="badge badge-active">6 Dimensions</span>
            <span className="badge badge-active">12 Diagnostic MCQs</span>
          </div>
        </Card>

        <Card
          title="Data Analyst"
          subtitle="Extract insights, build dashboards, and model structured business data"
          footer={
            <Link to="/diagnostic" className="btn btn-primary" style={{ width: '100%', textAlign: 'center' }}>
              Select Role & Start Diagnostic
            </Link>
          }
        >
          <p style={{ fontSize: '14px', color: 'var(--color-gray-600)', marginBottom: '12px' }}>
            Includes 6 skill dimensions: SQL Fundamentals, Python & Pandas, Data Cleaning, Visualization & BI, Statistics, and Communication.
          </p>
          <div className="demo-flex">
            <span className="badge badge-active">6 Dimensions</span>
            <span className="badge badge-active">12 Diagnostic MCQs</span>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default RolesPage;
