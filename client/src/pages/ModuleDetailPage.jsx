import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '../components/Layout.jsx';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Spinner } from '../components/Spinner.jsx';
import { StatusCircle } from '../components/StatusCircle.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { useToast } from '../hooks/useToast.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { api } from '../services/api.js';

export function ModuleDetailPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [roadmap, setRoadmap] = useState(null);
  const [module, setModule] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [notFound, setNotFound] = useState(false);

  usePageTitle(module ? module.title : 'Module Detail');

  const completingRef = useRef(false);
  const enableCheckpoint = import.meta.env.VITE_ENABLE_CHECKPOINT === 'true';

  const fetchModuleData = async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const res = await api.getRoadmap();
      const currentRoadmap = res?.data?.roadmap;
      setRoadmap(currentRoadmap);

      const foundModule = (currentRoadmap?.modules || []).find((m) => m.moduleId === moduleId);

      if (!foundModule) {
        setNotFound(true);
        return;
      }

      // Locked module check: redirect immediately with info toast
      if (foundModule.status === 'locked') {
        toast.info('This module is locked. Complete previous modules to unlock it.');
        navigate('/dashboard', { replace: true });
        return;
      }

      setModule(foundModule);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModuleData();
  }, [moduleId]);

  const handleCompleteModule = async () => {
    if (!module || module.status !== 'active') return;
    if (completingRef.current || completing) return;

    completingRef.current = true;
    setCompleting(true);

    try {
      const res = await api.completeModule(moduleId);
      const newScore =
        res?.data?.readinessScore ||
        res?.data?.roadmap?.readinessScore ||
        roadmap?.readinessScore ||
        0;

      toast.success(`Module completed! New readiness score: ${newScore}%`);

      // Update local state to complete
      setModule((prev) => ({ ...prev, status: 'complete' }));
      if (res?.data?.roadmap) {
        setRoadmap(res.data.roadmap);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to mark module as complete');
    } finally {
      setCompleting(false);
      completingRef.current = false;
    }
  };

  const getResourceTypeIcon = (type) => {
    switch (type) {
      case 'video':
        return '▶';
      case 'docs':
        return '📄';
      case 'article':
        return '📰';
      default:
        return '🔗';
    }
  };

  if (loading) {
    return (
      <Layout maxWidth="800px">
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-8) 0',
            gap: 'var(--space-2)'
          }}
        >
          <Spinner size="lg" />
          <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
            Loading module curriculum...
          </span>
        </div>
      </Layout>
    );
  }

  if (notFound || !module) {
    return (
      <Layout maxWidth="800px">
        <div style={{ padding: 'var(--space-8) 0' }}>
          <EmptyState
            title="Module Not Found"
            description={`No module with identifier "${moduleId}" exists in your active curriculum.`}
            actionLabel="Back to Dashboard"
            onAction={() => navigate('/dashboard')}
          />
        </div>
      </Layout>
    );
  }

  const isActive = module.status === 'active';
  const isComplete = module.status === 'complete';

  return (
    <Layout maxWidth="800px">
      <div style={{ padding: 'var(--space-4) 0 var(--space-8)' }}>
        {/* Back Navigation Link */}
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <Link
            to="/dashboard"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--color-primary)',
              textDecoration: 'none'
            }}
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Module Header Card */}
        <Card style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-1)',
              marginBottom: 'var(--space-1)'
            }}
          >
            <StatusCircle status={module.status} size="sm" />

            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                color: isActive
                  ? 'var(--color-primary)'
                  : isComplete
                    ? 'var(--color-success)'
                    : 'var(--color-text-muted)'
              }}
            >
              {module.status} Module
            </span>

            <span style={{ color: 'var(--color-border)' }}>•</span>

            <span
              style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', fontWeight: 600 }}
            >
              {module.estimatedHours} hours
            </span>

            {/* Complete Badge */}
            {isComplete && (
              <span
                style={{
                  marginLeft: 'auto',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  backgroundColor: 'var(--color-success-bg)',
                  color: 'var(--color-success-700)',
                  border: '1px solid var(--color-success-border)',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-full)'
                }}
              >
                Completed ✓
              </span>
            )}
          </div>

          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: 'var(--color-neutral-900)',
              marginBottom: 'var(--space-1)'
            }}
          >
            {module.title}
          </h1>

          <p
            style={{
              fontSize: '1rem',
              color: 'var(--color-text-body)',
              lineHeight: 1.6,
              marginBottom: 'var(--space-3)'
            }}
          >
            {module.description}
          </p>

          {/* Resource Tags */}
          {module.resourceTags && module.resourceTags.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {module.resourceTags.map((tag) => (
                <span
                  key={tag}
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    backgroundColor: 'var(--color-primary-50)',
                    color: 'var(--color-primary-800)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-full)',
                    border: '1px solid var(--color-primary-200)'
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </Card>

        {/* Curated Resources List */}
        <div style={{ marginBottom: 'var(--space-5)' }}>
          <h2
            style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              color: 'var(--color-neutral-900)',
              marginBottom: 'var(--space-1)'
            }}
          >
            Curated Learning Resources
          </h2>

          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-3)'
            }}
          >
            Study the official documentation and guides before marking this milestone complete:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {(module.resources || []).map((res, idx) => (
              <a
                key={idx}
                href={res.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <Card
                  interactive
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--space-2) var(--space-3)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-lg)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <span
                      style={{
                        fontSize: '1.25rem',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: 'var(--color-surface-subtle)',
                        borderRadius: 'var(--radius-md)'
                      }}
                    >
                      {getResourceTypeIcon(res.type)}
                    </span>

                    <div>
                      <h4
                        style={{
                          fontSize: '0.9375rem',
                          fontWeight: 700,
                          color: 'var(--color-neutral-900)',
                          marginBottom: '2px'
                        }}
                      >
                        {res.title}
                      </h4>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          textTransform: 'uppercase',
                          fontWeight: 600,
                          color: 'var(--color-text-muted)'
                        }}
                      >
                        {res.type}
                      </span>
                    </div>
                  </div>

                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'var(--color-primary)'
                    }}
                  >
                    Open Resource ↗
                  </span>
                </Card>
              </a>
            ))}
          </div>
        </div>

        {/* Actions Bar */}
        <Card
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--space-3)',
            backgroundColor: 'var(--color-surface-subtle)',
            border: '1px solid var(--color-border)',
            gap: 'var(--space-2)'
          }}
        >
          <div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-neutral-900)' }}>
              {isComplete
                ? 'Module Completed'
                : isActive
                  ? 'Ready to complete this milestone?'
                  : 'Module Inactive'}
            </h4>
            <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
              {isComplete
                ? 'You have mastered this module! Continue forward on your roadmap.'
                : isActive
                  ? 'Marking complete recalculates your readiness metric and unlocks the next module.'
                  : ''}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 'var(--space-2)',
              alignItems: 'center'
            }}
          >
            {/* Mark as complete (active only) */}
            {isActive && (
              <Button
                variant="primary"
                size="md"
                loading={completing}
                disabled={completing}
                onClick={handleCompleteModule}
              >
                Mark as Complete ✓
              </Button>
            )}

            {/* Back to dashboard */}
            <Link to="/dashboard">
              <Button variant="outline" size="md">
                Back to Dashboard
              </Button>
            </Link>

            {/* Hidden Checkpoint Quiz behind VITE_ENABLE_CHECKPOINT */}
            {enableCheckpoint && (isActive || isComplete) && (
              <Link to={`/checkpoint/${module.moduleId}`}>
                <Button variant="secondary" size="md">
                  Take checkpoint quiz
                </Button>
              </Link>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
}

export default ModuleDetailPage;
