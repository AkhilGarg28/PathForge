import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { useRoadmap } from '../context/RoadmapContext';
import { useToast } from '../hooks/useToast';
import api from '../services/api';

const ModuleDetailPage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { roadmap, setRoadmap, fetchRoadmap } = useRoadmap();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(!roadmap);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Sub-task checklist kept in local component state only
  const [checkedTasks, setCheckedTasks] = useState({});

  // 1. Ensure roadmap is loaded
  const loadModuleRoadmap = useCallback(async () => {
    if (roadmap) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const activeRoadmap = await fetchRoadmap();
      if (!activeRoadmap) {
        addToast('No active roadmap found. Please start the diagnostic first.', 'info');
        navigate('/dashboard', { replace: true });
        return;
      }
    } catch (err) {
      setError('Failed to load roadmap.');
    } finally {
      setLoading(false);
    }
  }, [roadmap, fetchRoadmap, addToast, navigate]);

  useEffect(() => {
    loadModuleRoadmap();
  }, [loadModuleRoadmap]);

  // 2. Identify the target module
  const { currentModule, moduleIndex, totalModules } = useMemo(() => {
    if (!roadmap?.modules) return { currentModule: null, moduleIndex: -1, totalModules: 0 };
    const modules = roadmap.modules;
    const index = modules.findIndex(
      (m) =>
        m.moduleId === moduleId ||
        m._id?.toString() === moduleId ||
        m.id?.toString() === moduleId
    );
    return {
      currentModule: index !== -1 ? modules[index] : null,
      moduleIndex: index,
      totalModules: modules.length,
    };
  }, [roadmap, moduleId]);

  // 3. Guard against unknown id or locked module
  useEffect(() => {
    if (loading) return;

    if (!currentModule) {
      addToast('Module not found in your curriculum.', 'error');
      navigate('/dashboard', { replace: true });
      return;
    }

    if (currentModule.status === 'locked') {
      addToast(
        'This module is locked. Please complete preceding milestones first.',
        'warning'
      );
      navigate('/dashboard', { replace: true });
    }
  }, [loading, currentModule, addToast, navigate]);

  // 4. Initialize checklist state if complete or when module loads
  useEffect(() => {
    if (currentModule?.resources) {
      if (currentModule.status === 'complete') {
        const allChecked = {};
        currentModule.resources.forEach((_, idx) => {
          allChecked[idx] = true;
        });
        setCheckedTasks(allChecked);
      }
    }
  }, [currentModule]);

  if (loading || !currentModule) {
    return (
      <div className="page-center-container">
        <Spinner size="lg" label="Loading module details..." />
      </div>
    );
  }

  const resources = currentModule.resources || [];
  const checkedCount = Object.values(checkedTasks).filter(Boolean).length;
  const allTasksChecked = resources.length === 0 || checkedCount === resources.length;
  const isModuleActive = currentModule.status === 'active';
  const isModuleComplete = currentModule.status === 'complete';

  // Toggle checkbox state
  const handleToggleTask = (index) => {
    if (isModuleComplete) return; // Read-only once complete
    setCheckedTasks((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Complete Module Action
  const handleMarkAsComplete = async () => {
    if (!allTasksChecked || !isModuleActive || submitting) return;

    setSubmitting(true);
    try {
      const response = await api.patch(
        `/roadmap/module/${currentModule.moduleId}/complete`
      );

      const updatedRoadmap = response.data?.roadmap;
      if (updatedRoadmap) {
        setRoadmap(updatedRoadmap);
      }

      addToast('Module completed successfully! Next milestone unlocked.', 'success');

      // Find the newly unlocked next active module to highlight on dashboard
      const nextActive = updatedRoadmap?.modules?.find(
        (m, idx) => idx > moduleIndex && m.status === 'active'
      ) || updatedRoadmap?.modules?.find((m) => m.status === 'active');

      navigate('/dashboard', {
        state: { highlightedModuleId: nextActive?.moduleId || nextActive?._id },
      });
    } catch (err) {
      console.error('Failed to complete module:', err);
      const msg = err.response?.data?.message || 'Failed to complete module. Please try again.';
      addToast(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // Helper for resource icon and label
  const getResourceMeta = (type) => {
    switch (type) {
      case 'video':
        return { icon: '🎥', label: 'Video Tutorial', tagClass: 'res-tag-video' };
      case 'docs':
        return { icon: '📚', label: 'Documentation', tagClass: 'res-tag-docs' };
      case 'article':
      default:
        return { icon: '📄', label: 'Technical Article', tagClass: 'res-tag-article' };
    }
  };

  return (
    <div className="page-container module-detail-page">
      {/* Back to Dashboard Breadcrumb */}
      <div className="module-breadcrumb-bar">
        <Link to="/dashboard" className="breadcrumb-back-link">
          &larr; Back to Dashboard
        </Link>
        <span className="breadcrumb-divider">/</span>
        <span className="breadcrumb-current">Milestone {moduleIndex + 1}</span>
      </div>

      {error && (
        <ErrorMessage message={error} style={{ marginBottom: '24px' }} />
      )}

      {/* Module Hero / Header Card */}
      <Card className="module-hero-card">
        <div className="module-hero-top">
          <div className="module-hero-counter">
            <span className="milestone-pill">
              Milestone {moduleIndex + 1} of {totalModules}
            </span>
            <span className="estimated-pill">
              ⏱️ {currentModule.estimatedHours || 10} hrs estimated
            </span>
          </div>

          <div className="module-status-container">
            {isModuleComplete ? (
              <span className="badge badge-complete">Complete ✓</span>
            ) : (
              <span className="badge badge-active">Active In Progress ▶</span>
            )}
          </div>
        </div>

        <h1 className="module-hero-title">{currentModule.title}</h1>
        <p className="module-hero-desc">
          {currentModule.description ||
            'Master core concepts, explore curated technical references, and verify concept checkpoints.'}
        </p>

        {currentModule.resourceTags && currentModule.resourceTags.length > 0 && (
          <div className="module-tags-row">
            {currentModule.resourceTags.map((tag, i) => (
              <span key={i} className="dimension-chip">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </Card>

      {/* Curated Resources Section */}
      <section className="module-section">
        <div className="section-header-compact">
          <h2 className="section-title">Curated Learning Resources</h2>
          <p className="section-subtitle">
            Study each reference carefully. Links open directly in a new tab.
          </p>
        </div>

        {resources.length === 0 ? (
          <p className="no-resources-note">No specific resources attached to this module.</p>
        ) : (
          <div className="resources-cards-grid">
            {resources.map((res, idx) => {
              const meta = getResourceMeta(res.type);
              return (
                <a
                  key={idx}
                  href={res.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="resource-card-link"
                  aria-label={`${res.title} (${meta.label}) - opens in a new tab`}
                >
                  <div className="resource-card-header">
                    <span className={`resource-type-tag ${meta.tagClass}`}>
                      <span className="res-icon" aria-hidden="true">{meta.icon}</span>
                      <span>{meta.label}</span>
                    </span>
                    <span className="external-link-arrow" aria-hidden="true">↗</span>
                  </div>

                  <h3 className="resource-title">{res.title}</h3>
                  <span className="resource-url-preview">{res.url}</span>
                </a>
              );
            })}
          </div>
        )}
      </section>

      {/* Sub-Task Checklist Section */}
      <section className="module-section">
        <Card className="checklist-card">
          <div className="checklist-header">
            <div>
              <h2 className="checklist-title">Learning Task Checklist</h2>
              <p className="checklist-subtitle">
                Check off each resource as you complete studying it to enable milestone completion.
              </p>
            </div>
            <div className="checklist-counter-pill">
              {checkedCount} of {resources.length} completed
            </div>
          </div>

          <div className="checklist-items-container" role="group" aria-label="Module Tasks">
            {resources.map((res, idx) => {
              const isChecked = Boolean(checkedTasks[idx]);
              const meta = getResourceMeta(res.type);

              return (
                <div
                  key={idx}
                  className={`checklist-item ${isChecked ? 'item-checked' : ''} ${isModuleComplete ? 'item-readonly' : ''}`}
                  onClick={() => handleToggleTask(idx)}
                >
                  <div className="checklist-checkbox-wrapper">
                    <input
                      type="checkbox"
                      id={`chk-${idx}`}
                      checked={isChecked}
                      disabled={isModuleComplete}
                      onChange={() => handleToggleTask(idx)}
                      onClick={(e) => e.stopPropagation()}
                      className="checklist-native-checkbox"
                    />
                    <label htmlFor={`chk-${idx}`} className="checklist-label-bubble">
                      {isChecked && <span>✓</span>}
                    </label>
                  </div>

                  <div className="checklist-text-wrapper">
                    <span className="checklist-action-prefix">
                      Review &amp; Study {meta.label}:
                    </span>
                    <span className="checklist-resource-name">{res.title}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Bar with Mark as Complete Button */}
          <div className="checklist-footer-bar">
            {!allTasksChecked && isModuleActive && (
              <span className="checklist-help-text">
                Complete all {resources.length} learning tasks above to enable completion.
              </span>
            )}

            {isModuleComplete ? (
              <div className="module-completed-notice">
                <span className="notice-icon">✓</span>
                <span>You have successfully completed this module!</span>
              </div>
            ) : (
              <Button
                variant="primary"
                disabled={!allTasksChecked || !isModuleActive || submitting}
                loading={submitting}
                onClick={handleMarkAsComplete}
                className="btn-mark-complete"
              >
                Mark as Complete &amp; Unlock Next &rarr;
              </Button>
            )}
          </div>
        </Card>
      </section>

      {/* Checkpoint Quiz Placeholder */}
      <section className="module-section">
        <Card className="checkpoint-placeholder-card">
          <div className="checkpoint-header">
            <div>
              <h2 className="checkpoint-title">Module Checkpoint Assessment</h2>
              <p className="checkpoint-subtitle">
                Quick diagnostic evaluation to verify conceptual mastery of this module.
              </p>
            </div>
            <span className="badge badge-locked">Coming soon</span>
          </div>

          <div className="checkpoint-body">
            <p className="checkpoint-description">
              Checkpoint quizzes are being calibrated to automatically assess milestone retention before unlocking subsequent phases.
            </p>
            <Button variant="secondary" disabled className="btn-checkpoint-disabled">
              Take Checkpoint (Coming soon)
            </Button>
          </div>
        </Card>
      </section>
    </div>
  );
};

export default ModuleDetailPage;
