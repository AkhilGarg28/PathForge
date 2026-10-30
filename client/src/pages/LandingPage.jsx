import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import ProgressBar from '../components/ProgressBar';
import ErrorMessage from '../components/ErrorMessage';
import { useToast } from '../hooks/useToast';

const LandingPage = () => {
  const { addToast } = useToast();
  const [btnLoading, setBtnLoading] = useState(false);
  const [progressVal, setProgressVal] = useState(45);
  const [showError, setShowError] = useState(false);

  const handleSimulateAction = () => {
    setBtnLoading(true);
    setTimeout(() => {
      setBtnLoading(false);
      addToast('Operation completed successfully!', 'success');
    }, 1500);
  };

  return (
    <div className="page-container">
      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">Adaptive Learning Roadmaps for Tech Careers</h1>
        <p className="hero-subtitle">
          Diagnose your skill gaps, generate tailored milestone roadmaps, and level up with precision.
        </p>
        <div className="hero-actions">
          <Link to="/signup" className="btn btn-primary">
            Get Started Free
          </Link>
          <Link to="/roles" className="btn btn-secondary">
            Explore Supported Roles
          </Link>
        </div>
      </section>

      {/* Route Quick Navigation Grid */}
      <section className="section">
        <h2 className="section-title">Application Route Directory</h2>
        <p className="section-description">Quickly navigate to any placeholder page in the application:</p>
        <div className="routes-grid">
          <Link to="/" className="route-card">
            <span className="route-path">/</span>
            <span className="route-name">Landing Page</span>
          </Link>
          <Link to="/signup" className="route-card">
            <span className="route-path">/signup</span>
            <span className="route-name">Sign Up</span>
          </Link>
          <Link to="/login" className="route-card">
            <span className="route-path">/login</span>
            <span className="route-name">Log In</span>
          </Link>
          <Link to="/roles" className="route-card">
            <span className="route-path">/roles</span>
            <span className="route-name">Role Selection</span>
          </Link>
          <Link to="/diagnostic" className="route-card">
            <span className="route-path">/diagnostic</span>
            <span className="route-name">Diagnostic Quiz</span>
          </Link>
          <Link to="/generating" className="route-card">
            <span className="route-path">/generating</span>
            <span className="route-name">Roadmap Generation</span>
          </Link>
          <Link to="/dashboard" className="route-card">
            <span className="route-path">/dashboard</span>
            <span className="route-name">Learner Dashboard</span>
          </Link>
          <Link to="/module/sample-1" className="route-card">
            <span className="route-path">/module/:moduleId</span>
            <span className="route-name">Module Detail</span>
          </Link>
          <Link to="/settings" className="route-card">
            <span className="route-path">/settings</span>
            <span className="route-name">Account Settings</span>
          </Link>
        </div>
      </section>

      {/* Shared Component Demo Showcase */}
      <section className="section demo-section">
        <div className="demo-header">
          <h2 className="section-title">Design System & Shared Components Demo</h2>
          <p className="section-description">
            All components adhere strictly to the 8px spacing scale, Light mode palette, deep blue primary (#065A82), secondary teal (#1C7293), and amber accent (#D97706) reserved for progress.
          </p>
        </div>

        <div className="demo-grid">
          {/* Buttons Card */}
          <Card title="Buttons" subtitle="Primary, secondary, disabled, and loading states">
            <div className="demo-flex">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="primary" disabled>Disabled State</Button>
              <Button
                variant="primary"
                loading={btnLoading}
                onClick={handleSimulateAction}
              >
                {btnLoading ? 'Saving...' : 'Click for Loading State'}
              </Button>
            </div>
          </Card>

          {/* Progress Bar Card */}
          <Card title="Progress Bar" subtitle="Uses amber accent token exclusively for progress">
            <ProgressBar
              value={progressVal}
              label="Roadmap Readiness Score"
              showPercentage={true}
            />
            <div className="progress-controls" style={{ marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
              <Button variant="secondary" onClick={() => setProgressVal((v) => Math.max(0, v - 15))}>
                -15%
              </Button>
              <Button variant="secondary" onClick={() => setProgressVal((v) => Math.min(100, v + 15))}>
                +15%
              </Button>
              <span style={{ fontSize: '14px', color: 'var(--color-gray-600)', marginLeft: '8px' }}>
                Current: {progressVal}%
              </span>
            </div>
          </Card>

          {/* Spinners Card */}
          <Card title="Spinners" subtitle="Small, medium, and large loading indicators">
            <div className="demo-flex" style={{ alignItems: 'center' }}>
              <Spinner size="sm" label="Small spinner" />
              <Spinner size="md" label="Medium spinner" />
              <Spinner size="lg" label="Large spinner" />
            </div>
          </Card>

          {/* Toast Notifications Card */}
          <Card title="Toast Notifications" subtitle="Dispatched via useToast hook">
            <div className="demo-flex">
              <Button
                variant="secondary"
                onClick={() => addToast('Changes saved successfully!', 'success')}
              >
                Trigger Success Toast
              </Button>
              <Button
                variant="secondary"
                onClick={() => addToast('Your session will expire soon.', 'warning')}
              >
                Trigger Warning Toast
              </Button>
              <Button
                variant="secondary"
                onClick={() => addToast('Failed to connect to the server.', 'error')}
              >
                Trigger Error Toast
              </Button>
              <Button
                variant="secondary"
                onClick={() => addToast('A new milestone is now available.', 'info')}
              >
                Trigger Info Toast
              </Button>
            </div>
          </Card>

          {/* Error Message Card */}
          <Card title="Error Messages" subtitle="Field-level and alert-style error displays">
            <Button
              variant="secondary"
              onClick={() => setShowError(!showError)}
              style={{ marginBottom: '16px' }}
            >
              {showError ? 'Hide Error Message' : 'Show Error Message'}
            </Button>
            {showError && (
              <ErrorMessage
                message="Unable to submit diagnostic answers"
                errors={[
                  'Question 3: Must select a valid answer option.',
                  'Question 7: Question is unanswered.',
                ]}
                onRetry={() => addToast('Retrying submission...', 'info')}
              />
            )}
          </Card>

          {/* Status Indicators */}
          <Card title="Status Color Tokens" subtitle="Module states across the roadmap">
            <div className="demo-flex">
              <span className="badge badge-locked">Locked (Gray)</span>
              <span className="badge badge-active">Active (Primary Blue)</span>
              <span className="badge badge-complete">Complete (Green)</span>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
