import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
  const { user } = useAuth();

  return (
    <div className="landing-page-wrapper">
      <div className="page-container">
        {/* 1. Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <span className="hero-pill">⚡ Adaptive Learning Engine</span>
            <h1 className="hero-title">
              Forge Your Tech Career with Precision Roadmaps
            </h1>
            <p className="hero-subtitle">
              Diagnose your exact technical skill gaps with an adaptive assessment, generate a personalized milestone curriculum, and track your career readiness score in real time.
            </p>
            <div className="hero-actions">
              {user ? (
                <Link
                  to={user.targetRole ? '/dashboard' : '/roles'}
                  className="btn btn-primary btn-hero"
                >
                  Continue to {user.targetRole ? 'Dashboard' : 'Role Selection'} &rarr;
                </Link>
              ) : (
                <>
                  <Link to="/signup" className="btn btn-primary btn-hero">
                    Find Your Path &rarr;
                  </Link>
                  <Link to="/roles" className="btn btn-secondary btn-hero">
                    Explore Roles
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>

        {/* 2. Three-Step 'How It Works' Section */}
        <section className="section how-it-works-section">
          <div className="section-header text-center">
            <h2 className="section-title">How PathForge Works</h2>
            <p className="section-description">
              Three simple steps to transform undefined goals into a structured, milestone-driven technical career plan.
            </p>
          </div>

          <div className="steps-grid">
            {/* Step 1 */}
            <div className="step-card">
              <div className="step-number-badge">1</div>
              <h3 className="step-title">Choose Your Target Role</h3>
              <p className="step-text">
                Select your target career path—such as <strong>MERN Developer</strong> or <strong>Data Analyst</strong>—defined by real-world competencies and industry-standard dimensions.
              </p>
            </div>

            {/* Step 2 */}
            <div className="step-card">
              <div className="step-number-badge">2</div>
              <h3 className="step-title">Take the Skill Diagnostic</h3>
              <p className="step-text">
                Answer 12 adaptive multiple-choice questions across 6 core skill dimensions. Our scoring engine identifies your baseline strengths and pinpoint gaps.
              </p>
            </div>

            {/* Step 3 */}
            <div className="step-card">
              <div className="step-number-badge">3</div>
              <h3 className="step-title">Follow Your Roadmap</h3>
              <p className="step-text">
                Receive an AI-synthesized or curriculum-backed roadmap with curated articles, videos, and checkpoints. Complete modules to unlock subsequent milestones and boost readiness.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Static Sample Roadmap Preview */}
        <section className="section sample-roadmap-section">
          <div className="section-header text-center">
            <h2 className="section-title">Interactive Roadmap Preview</h2>
            <p className="section-description">
              Here is how an active curriculum looks for a learner targeting the <strong>MERN Developer</strong> role.
            </p>
          </div>

          <div className="sample-roadmap-container">
            {/* Readiness Summary Header */}
            <Card className="sample-readiness-card">
              <div className="sample-header-flex">
                <div>
                  <h3 className="sample-role-title">Target Role: MERN Developer</h3>
                  <p className="sample-role-meta">Overall Career Readiness Score (Weighted by Module Hours)</p>
                </div>
                <div className="sample-badge-group">
                  <span className="badge badge-complete">2 Completed</span>
                  <span className="badge badge-active">1 Active</span>
                  <span className="badge badge-locked">2 Locked</span>
                </div>
              </div>
              <div style={{ marginTop: '16px' }}>
                <ProgressBar
                  value={40}
                  label="Roadmap Readiness Progress"
                  showPercentage={true}
                />
              </div>
            </Card>

            {/* Module Steps Preview */}
            <div className="sample-modules-list">
              {/* Module 1: Complete */}
              <div className="sample-module-item sample-module-complete">
                <div className="sample-module-indicator">
                  <span className="indicator-icon">✓</span>
                </div>
                <div className="sample-module-body">
                  <div className="sample-module-top">
                    <h4 className="sample-module-title">1. HTML5 Semantics, Accessibility & Responsive CSS</h4>
                    <span className="badge badge-complete">Complete</span>
                  </div>
                  <p className="sample-module-desc">
                    Box model, flexbox/grid layout systems, WCAG accessibility standards, and semantic document structures.
                  </p>
                  <span className="sample-module-hours">Estimated: 10 hrs &bull; Checkpoint passed</span>
                </div>
              </div>

              {/* Module 2: Complete */}
              <div className="sample-module-item sample-module-complete">
                <div className="sample-module-indicator">
                  <span className="indicator-icon">✓</span>
                </div>
                <div className="sample-module-body">
                  <div className="sample-module-top">
                    <h4 className="sample-module-title">2. React Ecosystem & State Management</h4>
                    <span className="badge badge-complete">Complete</span>
                  </div>
                  <p className="sample-module-desc">
                    Component lifecycle, hooks (useState, useEffect, useMemo), state elevation, and custom hooks architecture.
                  </p>
                  <span className="sample-module-hours">Estimated: 14 hrs &bull; Checkpoint passed</span>
                </div>
              </div>

              {/* Module 3: Active */}
              <div className="sample-module-item sample-module-active">
                <div className="sample-module-indicator">
                  <span className="indicator-icon">▶</span>
                </div>
                <div className="sample-module-body">
                  <div className="sample-module-top">
                    <h4 className="sample-module-title">3. Backend REST APIs with Node & Express</h4>
                    <span className="badge badge-active">Active</span>
                  </div>
                  <p className="sample-module-desc">
                    Express routing, custom middleware pipelines, centralized error handling, and robust input validation with Zod.
                  </p>
                  <span className="sample-module-hours">Estimated: 18 hrs &bull; Currently in progress</span>
                </div>
              </div>

              {/* Module 4: Locked */}
              <div className="sample-module-item sample-module-locked">
                <div className="sample-module-indicator">
                  <span className="indicator-icon">🔒</span>
                </div>
                <div className="sample-module-body">
                  <div className="sample-module-top">
                    <h4 className="sample-module-title">4. Database Modeling with MongoDB & Mongoose</h4>
                    <span className="badge badge-locked">Locked</span>
                  </div>
                  <p className="sample-module-desc">
                    Schema definitions, compound indexes, aggregation pipelines, and ACID transactions in NoSQL.
                  </p>
                  <span className="sample-module-hours">Estimated: 16 hrs &bull; Unlocks after Module 3</span>
                </div>
              </div>

              {/* Module 5: Locked */}
              <div className="sample-module-item sample-module-locked">
                <div className="sample-module-indicator">
                  <span className="indicator-icon">🔒</span>
                </div>
                <div className="sample-module-body">
                  <div className="sample-module-top">
                    <h4 className="sample-module-title">5. JWT Authentication & Production Hardening</h4>
                    <span className="badge badge-locked">Locked</span>
                  </div>
                  <p className="sample-module-desc">
                    HttpOnly cookie JWTs, bcrypt password hashing, rate limiting, and NoSQL operator sanitization.
                  </p>
                  <span className="sample-module-hours">Estimated: 12 hrs &bull; Unlocks after Module 4</span>
                </div>
              </div>
            </div>

            {/* Bottom Call to Action Card */}
            <div className="sample-cta-banner">
              <div className="sample-cta-content">
                <h3>Build Your Customized Roadmap</h3>
                <p>Sign up now, take your 5-minute diagnostic, and unlock your personalized path.</p>
              </div>
              <Link to="/signup" className="btn btn-primary btn-hero">
                Find Your Path
              </Link>
            </div>
          </div>
        </section>
      </div>

      {/* 4. Footer */}
      <footer className="app-footer">
        <div className="footer-container">
          <div className="footer-col brand-col">
            <div className="footer-brand">
              <span className="brand-icon">⚡</span>
              <span className="brand-name">PathForge</span>
            </div>
            <p className="footer-tagline">
              Adaptive skill assessment and personalized milestone-driven career roadmaps for software engineers and data professionals.
            </p>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Platform</h4>
            <ul className="footer-links">
              <li><Link to="/roles">Roles</Link></li>
              <li><Link to="/diagnostic">Diagnostic</Link></li>
              <li><Link to="/dashboard">Dashboard</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Account</h4>
            <ul className="footer-links">
              <li><Link to="/login">Log In</Link></li>
              <li><Link to="/signup">Sign Up</Link></li>
              <li><Link to="/settings">Settings</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4 className="footer-heading">Supported Roles</h4>
            <ul className="footer-links">
              <li><span className="footer-text-link">MERN Developer</span></li>
              <li><span className="footer-text-link">Data Analyst</span></li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="footer-bottom-container">
            <p>&copy; {new Date().getFullYear()} PathForge. All rights reserved.</p>
            <p className="footer-note">Built with React, Express, MongoDB, and Gemini AI.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
