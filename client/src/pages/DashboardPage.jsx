import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import ReadinessScore from '../components/ReadinessScore';
import ReadinessHistoryChart from '../components/ReadinessHistoryChart';
import DashboardSkeleton from '../components/DashboardSkeleton';
import { useAuth } from '../context/AuthContext';
import { useRoadmap } from '../context/RoadmapContext';
import api from '../services/api';

const DashboardPage = () => {
  const { user } = useAuth();
  const { roadmap, setRoadmap } = useRoadmap();
  const navigate = useNavigate();
  const location = useLocation();

  const highlightedModuleId = location.state?.highlightedModuleId;
  const highlightedRef = useRef(null);

  const [localLoading, setLocalLoading] = useState(!roadmap);
  const [localError, setLocalError] = useState(null);

  const fetchDashboardRoadmap = useCallback(async () => {
    setLocalLoading(true);
    setLocalError(null);

    try {
      const response = await api.get('/roadmap');
      if (response.data && response.data.roadmap) {
        setRoadmap(response.data.roadmap);
      } else {
        setRoadmap(null);
      }
    } catch (err) {
      if (err.response?.status === 404) {
        setRoadmap(null);
      } else {
        const msg =
          err.response?.data?.message ||
          'Failed to load your roadmap. Please check your connection and try again.';
        setLocalError(msg);
      }
    } finally {
      setLocalLoading(false);
    }
  }, [setRoadmap]);

  useEffect(() => {
    fetchDashboardRoadmap();
  }, [fetchDashboardRoadmap]);

  // Scroll highlighted module into view when navigated from completion
  useEffect(() => {
    if (highlightedModuleId && highlightedRef.current) {
      highlightedRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlightedModuleId, roadmap]);

  // 1. Loading State with Skeletons
  if (localLoading && !roadmap) {
    return <DashboardSkeleton />;
  }

  // 2. Error State with Retry
  if (localError && !roadmap) {
    return (
      <div className="page-container dashboard-error-wrapper">
        <div style={{ maxWidth: '600px', margin: '48px auto' }}>
          <ErrorMessage
            message={localError}
            onRetry={fetchDashboardRoadmap}
          />
          <div style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link to="/roles" className="btn btn-secondary">
              View Available Roles
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // 3. Empty State: No Target Role or No Roadmap Yet
  if (!roadmap) {
    return (
      <div className="page-container dashboard-empty-wrapper">
        <div className="dashboard-empty-card">
          <div className="empty-icon-bubble" aria-hidden="true">🗺️</div>
          <h2 className="empty-card-title">
            {!user?.targetRole ? 'No Target Role Selected' : 'No Active Roadmap Yet'}
          </h2>
          <p className="empty-card-text">
            {!user?.targetRole
              ? 'Select a technical career path to unlock your targeted competency diagnostic and customized milestone curriculum.'
              : `You are targeting ${user.targetRole}, but have not taken the skill diagnostic yet. Take the 12-question diagnostic to generate your personalized roadmap.`}
          </p>

          <div className="empty-card-actions">
            {!user?.targetRole ? (
              <Link to="/roles" className="btn btn-primary btn-hero">
                Choose Your Target Role &rarr;
              </Link>
            ) : (
              <Link to="/diagnostic" className="btn btn-primary btn-hero">
                Start Skill Diagnostic &rarr;
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Calculate Metrics
  const modules = roadmap.modules || [];
  const completedCount = modules.filter((m) => m.status === 'complete').length;
  const totalCount = modules.length;
  const readinessValue = typeof roadmap.readinessScore === 'number' ? roadmap.readinessScore : 0;
  const roleTitle = user?.targetRole || 'Software Engineering';

  const handleModuleClick = (mod) => {
    if (mod.status === 'active' || mod.status === 'complete') {
      const targetId = mod.moduleId || mod._id || mod.id;
      navigate(`/module/${targetId}`);
    }
  };

  return (
    <div className="page-container dashboard-page-wrapper">
      {/* Page Header */}
      <div className="dashboard-page-header">
        <div className="dashboard-header-titles">
          <span className="dashboard-kicker">Learner Journey</span>
          <h1 className="dashboard-main-title">{roleTitle} Curriculum</h1>
          <p className="dashboard-main-subtitle">
            Track your milestone progress, complete modules, and advance your career readiness.
          </p>
        </div>

        <div className="dashboard-header-actions">
          <Link to="/roles" className="btn btn-secondary" title="Switch your target tech role">
            Switch Role
          </Link>
          <Link to="/settings" className="btn btn-secondary" title="Retake diagnostic or manage profile">
            Settings
          </Link>
        </div>
      </div>

      {/* Top Section: Pinned / Prioritized Readiness Score & Chart */}
      <section className="dashboard-top-section" aria-label="Readiness Overview">
        <Card className="readiness-score-card">
          <ReadinessScore
            score={readinessValue}
            completedCount={completedCount}
            totalCount={totalCount}
          />
        </Card>

        {/* Readiness Over Time Chart (hidden if < 2 points) */}
        {roadmap.history && roadmap.history.length >= 2 && (
          <Card className="readiness-chart-card">
            <ReadinessHistoryChart history={roadmap.history} />
          </Card>
        )}
      </section>

      {/* Main Section: Vertical Stepper of Module Cards */}
      <section className="dashboard-modules-section" aria-label="Curriculum Milestones">
        <div className="section-title-bar">
          <h2 className="section-title">Milestone Roadmap</h2>
          <span className="modules-count-tag">
            {completedCount} of {totalCount} Completed
          </span>
        </div>

        <div className="vertical-stepper" role="list">
          {modules.map((mod, index) => {
            const isComplete = mod.status === 'complete';
            const isActive = mod.status === 'active';
            const isLocked = mod.status === 'locked';
            const isClickable = isActive || isComplete;
            const targetId = mod.moduleId || mod._id || mod.id;
            const isHighlighted =
              highlightedModuleId &&
              (mod.moduleId === highlightedModuleId || mod._id?.toString() === highlightedModuleId);

            return (
              <div
                key={mod._id || mod.id || index}
                ref={isHighlighted ? highlightedRef : null}
                className={`stepper-item ${isComplete ? 'step-complete' : ''} ${isActive ? 'step-active' : ''} ${isLocked ? 'step-locked' : ''} ${isHighlighted ? 'step-highlighted' : ''}`}
                role="listitem"
              >
                {/* Stepper Node & Connecting Line */}
                <div className="stepper-rail">
                  <div className={`stepper-node stepper-node-${mod.status} ${isHighlighted ? 'stepper-node-highlighted' : ''}`}>
                    {isComplete && <span className="node-icon">✓</span>}
                    {isActive && <span className="node-icon">▶</span>}
                    {isLocked && <span className="node-icon">🔒</span>}
                  </div>
                  {index < modules.length - 1 && <div className="stepper-line"></div>}
                </div>

                {/* Module Card */}
                <div
                  className={`stepper-card-wrapper ${isClickable ? 'stepper-card-clickable' : 'stepper-card-unclickable'}`}
                  onClick={() => handleModuleClick(mod)}
                  onKeyDown={(e) => {
                    if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault();
                      handleModuleClick(mod);
                    }
                  }}
                  tabIndex={isClickable ? 0 : -1}
                  role={isClickable ? 'link' : 'region'}
                  aria-label={`${mod.title}, status: ${mod.status}`}
                >
                  <Card
                    className={`stepper-module-card ${isActive ? 'module-card-active' : ''} ${isHighlighted ? 'module-card-highlighted' : ''}`}
                  >
                    <div className="module-card-header">
                      <div className="module-title-group">
                        <span className="module-step-counter">Milestone {index + 1}</span>
                        <h3 className="module-title">{mod.title}</h3>
                      </div>

                      <div className="module-badge-wrapper">
                        {isComplete && (
                          <span className="badge badge-complete">
                            Complete ✓
                          </span>
                        )}
                        {isActive && (
                          <span className="badge badge-active">
                            Active ▶
                          </span>
                        )}
                        {isLocked && (
                          <span className="badge badge-locked">
                            Locked 🔒
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="module-description">
                      {mod.description || 'Master key concepts, practical implementations, and verify checkpoint questions.'}
                    </p>

                    <div className="module-card-footer">
                      <span className="module-estimated-hours">
                        ⏱️ Estimated: <strong>{mod.estimatedHours || 10} hrs</strong>
                      </span>

                      {/* Action Prompt / Locked Explanation */}
                      <div className="module-footer-action">
                        {isActive && (
                          <span className="module-action-link active-link">
                            Continue Module &rarr;
                          </span>
                        )}
                        {isComplete && (
                          <span className="module-action-link complete-link">
                            Review Module &rarr;
                          </span>
                        )}
                        {isLocked && (
                          <div className="locked-explanation">
                            <span className="lock-icon" aria-hidden="true">🔒</span>
                            <span>Locked &bull; Complete preceding milestone to unlock</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default DashboardPage;
