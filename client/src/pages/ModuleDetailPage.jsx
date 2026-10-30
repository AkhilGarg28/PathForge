import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import * as api from '../services/api.js';
import { useToast } from '../hooks/useToast.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import Button from '../components/Button.jsx';
import Skeleton from '../components/Skeleton.jsx';
import ErrorState from '../components/ErrorState.jsx';
import StatusCircle from '../components/StatusCircle.jsx';
import './ModuleDetailPage.css';

function getResourceIcon(type) {
  const normalized = (type || '').toLowerCase();
  if (normalized.includes('video')) return '🎬';
  if (normalized.includes('doc')) return '📚';
  if (normalized.includes('article') || normalized.includes('post')) return '📄';
  return '🔗';
}

export default function ModuleDetailPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { success, error: toastError, info } = useToast();

  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCompleting, setIsCompleting] = useState(false);

  const enableCheckpoint = import.meta.env.VITE_ENABLE_CHECKPOINT === 'true';

  const modules = roadmap?.modules || [];
  const currentIndex = modules.findIndex((m) => m.moduleId === moduleId);
  const currentModule = modules[currentIndex];

  usePageTitle(currentModule ? `${currentModule.title} - Module` : 'Module Overview');

  // Fetch roadmap and inspect target module
  const loadModuleData = useCallback(() => {
    let isCancelled = false;

    api
      .getRoadmap()
      .then((data) => {
        if (isCancelled) return;

        const targetRoadmap = data.roadmap;
        const targetModule = targetRoadmap?.modules?.find((m) => m.moduleId === moduleId);

        if (!targetModule) {
          info(`Module "${moduleId}" was not found in your active roadmap.`);
          navigate('/dashboard', { replace: true });
          return;
        }

        if (targetModule.status === 'locked') {
          info('This module is locked. Complete the active module to unlock it.');
          navigate('/dashboard', { replace: true });
          return;
        }

        setRoadmap(targetRoadmap);
        setError(null);
      })
      .catch((err) => {
        if (isCancelled) return;

        if (err.code === 'NO_ROADMAP' || err.status === 404) {
          info('No active roadmap found. Please select a role first.');
          navigate('/role-selection', { replace: true });
          return;
        }

        setError(err);
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [moduleId, info, navigate]);

  const handleRetry = useCallback(() => {
    setLoading(true);
    loadModuleData();
  }, [loadModuleData]);

  useEffect(() => {
    const cleanup = loadModuleData();
    return cleanup;
  }, [loadModuleData]);

  // Complete module handler
  const handleMarkComplete = async () => {
    if (isCompleting) return;
    setIsCompleting(true);

    try {
      await api.completeModule(moduleId);
      success('Module completed! Next module unlocked.');
      navigate('/dashboard');
    } catch (err) {
      setIsCompleting(false);
      toastError(err.message || 'Unable to complete module. Please try again.');
    }
  };

  // 1. Loading State
  if (loading) {
    return (
      <main id="main-content" className="pf-module-detail-page" aria-busy="true">
        <div className="pf-module-back-bar">
          <Skeleton width="140px" height="24px" />
        </div>

        <div className="pf-module-card">
          <Skeleton width="100px" height="20px" />
          <Skeleton width="70%" height="32px" />
          <Skeleton lines={3} height="20px" />
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <Skeleton width="90px" height="26px" />
            <Skeleton width="90px" height="26px" />
          </div>
        </div>

        <div className="pf-module-resources-section">
          <Skeleton width="200px" height="24px" />
          <Skeleton width="100%" height="60px" style={{ marginBottom: '10px' }} />
          <Skeleton width="100%" height="60px" />
        </div>
      </main>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <main id="main-content" className="pf-module-detail-page">
        <ErrorState
          title="Failed to Load Module"
          message={
            error.message ||
            'We encountered an issue loading this module. Please try again.'
          }
          onRetry={handleRetry}
          retryLabel="Try Again"
        />
      </main>
    );
  }

  if (!currentModule) {
    return null;
  }

  const prevModule = currentIndex > 0 ? modules[currentIndex - 1] : null;
  const nextModule = currentIndex < modules.length - 1 ? modules[currentIndex + 1] : null;

  const isActive = currentModule.status === 'active';
  const isComplete = currentModule.status === 'complete';

  return (
    <main id="main-content" className="pf-module-detail-page">
      {/* Back Link Bar */}
      <nav className="pf-module-back-bar" aria-label="Breadcrumb">
        <Link to="/dashboard" className="pf-module-back-link">
          ← Back to Curriculum Dashboard
        </Link>
      </nav>

      {/* Module Overview Card */}
      <article className="pf-module-card">
        <div className="pf-module-header-top">
          <div className="pf-module-title-group">
            <span className="pf-module-step-number">
              Module {currentIndex + 1} of {modules.length}
            </span>
            <h1 className="pf-module-title">{currentModule.title}</h1>
          </div>

          <div
            className={`pf-module-status-badge pf-module-status-badge--${currentModule.status}`}
          >
            <StatusCircle status={currentModule.status} size="18px" />
            <span>{isActive ? 'In Progress' : isComplete ? 'Completed' : 'Locked'}</span>
          </div>
        </div>

        <p className="pf-module-desc">{currentModule.description}</p>

        <div className="pf-module-meta-row">
          {currentModule.estimatedHours && (
            <span className="pf-module-estimate-pill">
              ⏱ {currentModule.estimatedHours} hours estimated
            </span>
          )}

          {currentModule.resourceTags?.map((tag, idx) => (
            <span key={idx} className="pf-module-tag-chip">
              #{tag}
            </span>
          ))}
        </div>
      </article>

      {/* Completion Action / State Card */}
      {isActive && (
        <section className="pf-module-action-card" aria-label="Module Progress Action">
          <div className="pf-module-action-info">
            <h2 className="pf-module-action-title">Ready to Complete this Module?</h2>
            <p className="pf-module-action-desc">
              Finished studying the materials? Mark this module complete to unlock the
              next milestone in your roadmap.
            </p>
          </div>

          <div className="pf-module-action-buttons">
            {enableCheckpoint && (
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => navigate(`/checkpoint/${encodeURIComponent(moduleId)}`)}
              >
                Take Checkpoint Quiz
              </Button>
            )}

            <Button
              type="button"
              variant="primary"
              size="md"
              loading={isCompleting}
              disabled={isCompleting}
              onClick={handleMarkComplete}
            >
              ✓ Mark as Complete
            </Button>
          </div>
        </section>
      )}

      {isComplete && (
        <section
          className="pf-module-completed-banner"
          aria-label="Module Completion Status"
        >
          <div className="pf-module-completed-left">
            <div className="pf-module-completed-icon" aria-hidden="true">
              ✓
            </div>
            <div>
              <h2 className="pf-module-completed-title">Milestone Complete!</h2>
              <p className="pf-module-completed-desc">
                You have successfully completed this module. Review the resources anytime
                or advance to subsequent coursework.
              </p>
            </div>
          </div>

          {enableCheckpoint && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => navigate(`/checkpoint/${encodeURIComponent(moduleId)}`)}
            >
              Review Checkpoint Quiz
            </Button>
          )}
        </section>
      )}

      {/* Curated Resources Section */}
      <section
        className="pf-module-resources-section"
        aria-label="Curated Learning Materials"
      >
        <div className="pf-module-resources-heading">
          <h2 className="pf-module-resources-title">
            Curated Learning Resources ({currentModule.resources?.length || 0})
          </h2>
          <p className="pf-module-resources-sub">
            Review these handpicked materials to master the topics in this module.
          </p>
        </div>

        <div className="pf-module-resource-list" role="list">
          {currentModule.resources?.map((res, idx) => (
            <a
              key={idx}
              href={res.url}
              target="_blank"
              rel="noopener noreferrer"
              className="pf-module-resource-card"
              role="listitem"
              aria-label={`${res.title} (${res.type || 'resource'}), opens in new tab`}
            >
              <div className="pf-module-resource-left">
                <span className="pf-module-resource-icon" aria-hidden="true">
                  {getResourceIcon(res.type)}
                </span>
                <div className="pf-module-resource-info">
                  <span className="pf-module-resource-title">{res.title}</span>
                  <span className="pf-module-resource-type">
                    {res.type || 'Resource'}
                  </span>
                </div>
              </div>

              <span className="pf-module-resource-arrow" aria-hidden="true">
                ↗
              </span>
            </a>
          ))}
        </div>
      </section>

      {/* Previous / Next Module Navigation Bar */}
      <footer className="pf-module-nav-bar" aria-label="Module Navigation">
        <div className="pf-module-nav-prev">
          {prevModule && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() =>
                navigate(`/module/${encodeURIComponent(prevModule.moduleId)}`)
              }
              aria-label={`Go to previous module: ${prevModule.title}`}
            >
              ← Previous: {prevModule.title}
            </Button>
          )}
        </div>

        <div className="pf-module-nav-next">
          {nextModule && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={nextModule.status === 'locked'}
              onClick={() => {
                if (nextModule.status !== 'locked') {
                  navigate(`/module/${encodeURIComponent(nextModule.moduleId)}`);
                }
              }}
              title={
                nextModule.status === 'locked'
                  ? 'Complete current module to unlock'
                  : undefined
              }
              aria-label={
                nextModule.status === 'locked'
                  ? `Next module: ${nextModule.title} (Locked)`
                  : `Go to next module: ${nextModule.title}`
              }
            >
              Next: {nextModule.title} {nextModule.status === 'locked' ? '🔒' : '→'}
            </Button>
          )}
        </div>
      </footer>
    </main>
  );
}
