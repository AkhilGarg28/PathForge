import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as api from '../services/api.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import ReadinessScore from '../components/ReadinessScore.jsx';
import StepperModule from '../components/StepperModule.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import Button from '../components/Button.jsx';
import Skeleton from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import './DashboardPage.css';

function getRoleTitle(id, rolesList = []) {
  const match = rolesList.find((r) => r.id === id);
  if (match?.title) return match.title;
  if (id === 'mern-developer') return 'MERN Developer';
  if (id === 'data-analyst') return 'Data Analyst';
  return id
    ? id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Selected Role';
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const updatedModuleId = location.state?.updatedModuleId;
  usePageTitle('Curriculum Dashboard');

  const [roadmap, setRoadmap] = useState(null);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch roadmap and roles list
  const loadDashboardData = useCallback(() => {
    let isCancelled = false;

    Promise.all([api.getRoadmap(), api.getRoles().catch(() => ({ roles: [] }))])
      .then(([roadmapRes, rolesRes]) => {
        if (!isCancelled) {
          setRoadmap(roadmapRes.roadmap || null);
          setRoles(rolesRes.roles || []);
          setError(null);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(err);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleRetry = useCallback(() => {
    setLoading(true);
    loadDashboardData();
  }, [loadDashboardData]);

  // Initial fetch on mount
  useEffect(() => {
    const cleanup = loadDashboardData();
    return cleanup;
  }, [loadDashboardData]);

  // Refetch when window regains focus (e.g. returning from module detail in another tab)
  useEffect(() => {
    const handleFocus = () => {
      loadDashboardData();
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [loadDashboardData]);

  // Derived metrics and memoized callbacks
  const modules = useMemo(() => roadmap?.modules || [], [roadmap]);
  const totalModules = modules.length;
  const completedModules = useMemo(
    () => modules.filter((m) => m.status === 'complete').length,
    [modules],
  );
  const allComplete = totalModules > 0 && completedModules === totalModules;
  const hoursRemaining = useMemo(
    () =>
      modules
        .filter((m) => m.status !== 'complete')
        .reduce((sum, m) => sum + (m.estimatedHours || 0), 0),
    [modules],
  );
  const readinessScore = roadmap?.readinessScore ?? 0;
  const roleTitle = useMemo(
    () => getRoleTitle(roadmap?.roleId, roles),
    [roadmap?.roleId, roles],
  );

  const handleModuleClick = useCallback(
    (moduleId) => {
      navigate(`/module/${encodeURIComponent(moduleId)}`);
    },
    [navigate],
  );

  // 1. Loading Skeleton State
  if (loading) {
    return (
      <main id="main-content" className="pf-dashboard-page" aria-busy="true">
        <div className="pf-dashboard-header">
          <div className="pf-dashboard-header__text">
            <Skeleton width="120px" height="24px" />
            <Skeleton width="280px" height="36px" />
            <Skeleton width="340px" height="18px" />
          </div>
        </div>

        <div className="pf-dashboard-grid">
          <div className="pf-dashboard-sidebar">
            <div className="pf-dashboard-score-card">
              <Skeleton
                variant="circle"
                width="120px"
                height="120px"
                style={{ margin: '0 auto' }}
              />
              <Skeleton width="80%" height="20px" />
              <Skeleton width="100%" height="40px" />
            </div>
          </div>

          <div className="pf-dashboard-content">
            <div className="pf-dashboard-summary-card">
              <Skeleton width="50%" height="22px" />
              <Skeleton width="100%" height="16px" />
            </div>

            <div className="pf-dashboard-stepper-list">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  key={i}
                  width="100%"
                  height="100px"
                  style={{ marginBottom: '16px', borderRadius: '12px' }}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 2. Error & Empty State Handling
  if (error) {
    const isNoRoadmap = error.code === 'NO_ROADMAP' || error.status === 404;

    if (isNoRoadmap) {
      return (
        <main id="main-content" className="pf-dashboard-page">
          <EmptyState
            title="No Learning Roadmap Found"
            message="You haven't generated a personalized roadmap yet. Select your target career role and take the diagnostic assessment to build your curriculum!"
            action={
              <Button
                variant="primary"
                size="md"
                onClick={() => navigate('/role-selection')}
              >
                Select Role & Start Diagnostic
              </Button>
            }
          />
        </main>
      );
    }

    return (
      <main id="main-content" className="pf-dashboard-page">
        <ErrorState
          title="Unable to Load Dashboard"
          message={
            error.message ||
            'We encountered an issue fetching your roadmap. Please check your connection and try again.'
          }
          onRetry={handleRetry}
          retryLabel="Try Again"
        />
      </main>
    );
  }

  // 3. Empty Roadmap Guard
  if (modules.length === 0) {
    return (
      <main id="main-content" className="pf-dashboard-page">
        <EmptyState
          title="No Modules in Roadmap"
          message="Your roadmap currently has no modules. You can re-take the diagnostic assessment to generate an updated roadmap."
          action={
            <Button
              variant="primary"
              size="md"
              onClick={() => navigate('/role-selection')}
            >
              Configure Career Role
            </Button>
          }
        />
      </main>
    );
  }

  return (
    <main id="main-content" className="pf-dashboard-page">
      {/* Mobile Sticky Top Bar with Compact Readiness Gauge */}
      <div
        className="pf-dashboard-mobile-sticky-bar"
        aria-label="Current Progress Summary"
      >
        <div className="pf-dashboard-mobile-sticky-info">
          <span className="pf-dashboard-mobile-sticky-role">{roleTitle}</span>
          <span className="pf-dashboard-mobile-sticky-meta">
            {completedModules}/{totalModules} Modules • {hoursRemaining}h left
          </span>
        </div>
        <ReadinessScore score={readinessScore} compact={true} />
      </div>

      {/* Main Header */}
      <header className="pf-dashboard-header">
        <div className="pf-dashboard-header__text">
          <span className="pf-dashboard-role-badge">
            <span aria-hidden="true">🎯</span> {roleTitle}
          </span>
          <h1 className="pf-dashboard-title">Your Learning Dashboard</h1>
          <p className="pf-dashboard-subtitle">
            Follow your personalized curriculum, complete checkpoints, and track your
            employability readiness.
          </p>
        </div>

        <div className="pf-dashboard-header__actions">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleRetry}
            aria-label="Refresh roadmap progress"
          >
            ↻ Refresh
          </Button>
        </div>
      </header>

      {/* Responsive Two-Column Grid */}
      <div className="pf-dashboard-grid">
        {/* Desktop Sidebar with Full Gauge & Metrics */}
        <aside
          className="pf-dashboard-sidebar"
          aria-label="Readiness and Progress Metrics"
        >
          <div className="pf-dashboard-score-card">
            <ReadinessScore
              score={readinessScore}
              compact={false}
              label="Employability Readiness"
            />

            <div className="pf-dashboard-sidebar-metrics">
              <div className="pf-dashboard-metric-box">
                <span className="pf-dashboard-metric-val">
                  {completedModules}/{totalModules}
                </span>
                <span className="pf-dashboard-metric-lbl">Modules Done</span>
              </div>

              <div className="pf-dashboard-metric-box">
                <span className="pf-dashboard-metric-val">{hoursRemaining}h</span>
                <span className="pf-dashboard-metric-lbl">Remaining</span>
              </div>
            </div>

            <div className="pf-dashboard-sidebar-progress">
              <ProgressBar
                value={completedModules}
                max={totalModules}
                label="Overall Progress"
                showValueText={true}
              />
            </div>
          </div>
        </aside>

        {/* Main Content: Summary, Congratulations & Vertical Stepper */}
        <section className="pf-dashboard-content">
          {/* Summary Row Card */}
          <div className="pf-dashboard-summary-card">
            <div className="pf-dashboard-summary-header">
              <h2 className="pf-dashboard-summary-title">Curriculum Progress</h2>
              <span className="pf-dashboard-summary-meta">Role: {roleTitle}</span>
            </div>

            <div className="pf-dashboard-summary-stats">
              <div className="pf-dashboard-stat-item">
                <span className="pf-dashboard-stat-icon" aria-hidden="true">
                  📚
                </span>
                <span>
                  <strong>{completedModules}</strong> of <strong>{totalModules}</strong>{' '}
                  modules completed
                </span>
              </div>

              <div className="pf-dashboard-stat-item">
                <span className="pf-dashboard-stat-icon" aria-hidden="true">
                  ⏱
                </span>
                <span>
                  <strong>{hoursRemaining}</strong> hours estimated remaining
                </span>
              </div>
            </div>

            <ProgressBar
              value={completedModules}
              max={totalModules}
              label="Curriculum Milestones"
              showValueText={true}
            />
          </div>

          {/* Congratulations Banner on All Modules Complete */}
          {allComplete && (
            <div className="pf-dashboard-congrats-banner" role="alert" aria-live="polite">
              <div className="pf-dashboard-congrats-left">
                <div className="pf-dashboard-congrats-icon" aria-hidden="true">
                  🏆
                </div>
                <div>
                  <h3 className="pf-dashboard-congrats-title">
                    Outstanding Work! All Modules Complete
                  </h3>
                  <p className="pf-dashboard-congrats-desc">
                    You have mastered every step in your {roleTitle} curriculum. Your
                    skills and readiness are verified for employer demand!
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => navigate('/role-selection')}
              >
                Explore Other Tracks
              </Button>
            </div>
          )}

          {/* Vertical Stepper List */}
          <div className="pf-dashboard-stepper-section">
            <div className="pf-dashboard-stepper-heading">
              <h2 className="pf-dashboard-stepper-title">Curriculum Modules</h2>
              <span className="pf-dashboard-stepper-sub">
                Click active or completed modules to study
              </span>
            </div>

            <div
              className="pf-dashboard-stepper-list"
              role="list"
              aria-label="Roadmap Modules"
            >
              {modules.map((m, idx) => (
                <StepperModule
                  key={m.moduleId || idx}
                  stepNumber={idx + 1}
                  title={m.title}
                  description={m.description}
                  estimatedHours={m.estimatedHours}
                  status={m.status}
                  isLast={idx === modules.length - 1}
                  isUpdated={
                    Boolean(updatedModuleId) &&
                    (m.moduleId === updatedModuleId ||
                      m.resourceTags?.includes('Advanced'))
                  }
                  onClick={() => handleModuleClick(m.moduleId)}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
