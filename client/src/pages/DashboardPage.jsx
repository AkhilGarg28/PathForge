import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout.jsx';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Skeleton } from '../components/Skeleton.jsx';
import { ReadinessScore } from '../components/ReadinessScore.jsx';
import { ProgressBar } from '../components/ProgressBar.jsx';
import { StepperModule } from '../components/StepperModule.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { ErrorState } from '../components/ErrorState.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { api } from '../services/api.js';

export function DashboardPage() {
  usePageTitle('Employability Dashboard');
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [is404, setIs404] = useState(false);

  const fetchRoadmap = async () => {
    setLoading(true);
    setError(null);
    setIs404(false);
    try {
      const res = await api.getRoadmap();
      setRoadmap(res?.data?.roadmap || null);
    } catch (err) {
      if (err.statusCode === 404 || err.message?.toLowerCase().includes('no roadmap')) {
        setIs404(true);
      } else {
        setError(err.message || 'Failed to load learning roadmap');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmap();
  }, []);

  const handleModuleClick = (module) => {
    if (module.status === 'locked') {
      toast.info('This module is locked. Complete preceding modules to unlock it.');
      return;
    }
    navigate(`/module/${module.moduleId}`);
  };

  const handleRetakeDiagnostic = () => {
    const confirmed = window.confirm(
      'Retaking the diagnostic will replace your current roadmap and progress. Are you sure you want to proceed?'
    );
    if (confirmed) {
      navigate('/diagnostic');
    }
  };

  // 1. Loading State (Skeletons)
  if (loading) {
    return (
      <Layout maxWidth="960px">
        <div style={{ padding: 'var(--space-4) 0' }}>
          {/* Header Skeleton */}
          <Card style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 'var(--space-3)'
              }}
            >
              <div
                style={{
                  flex: '1 1 320px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-1)'
                }}
              >
                <Skeleton variant="text" width="140px" height="1.25rem" />
                <Skeleton variant="text" width="65%" height="2rem" />
                <Skeleton variant="text" width="50%" height="1rem" />
                <Skeleton
                  variant="rect"
                  width="100%"
                  height="8px"
                  style={{ marginTop: 'var(--space-1)' }}
                />
              </div>
              <Skeleton variant="circle" width="120px" height="120px" />
            </div>
          </Card>

          {/* Stepper Skeletons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[1, 2, 3].map((i) => (
              <Card key={i} style={{ padding: 'var(--space-3)' }}>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}
                >
                  <Skeleton variant="text" width="100px" height="0.875rem" />
                  <Skeleton variant="text" width="60px" height="0.875rem" />
                </div>
                <Skeleton variant="text" width="70%" height="1.25rem" />
                <Skeleton variant="text" width="95%" height="1rem" style={{ marginTop: '6px' }} />
              </Card>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  // 2. Error State with Retry
  if (error) {
    return (
      <Layout maxWidth="800px">
        <div style={{ padding: 'var(--space-8) 0' }}>
          <ErrorState title="Failed to Load Dashboard" message={error} onRetry={fetchRoadmap} />
        </div>
      </Layout>
    );
  }

  // 3. Empty State (No Roadmap -> Start Diagnostic)
  if (is404 || !roadmap) {
    return (
      <Layout maxWidth="800px">
        <div style={{ padding: 'var(--space-8) 0' }}>
          <EmptyState
            title="No Learning Roadmap Yet"
            description="Complete the targeted 12-question technical diagnostic assessment to synthesize your personalized curriculum and baseline readiness score."
            actionLabel="Start Skill Diagnostic"
            onAction={() => navigate('/diagnostic')}
          />
        </div>
      </Layout>
    );
  }

  const modules = roadmap.modules || [];
  const completedCount = modules.filter((m) => m.status === 'complete').length;
  const totalModules = modules.length;
  const dimensionScores = roadmap.dimensionScores || {};

  // Formatted role name
  const roleDisplay =
    roadmap.roleId === 'data-analyst' || user?.roleId === 'data-analyst'
      ? 'Data Analyst'
      : 'MERN Developer';

  return (
    <Layout maxWidth="960px">
      <div style={{ padding: 'var(--space-4) 0 var(--space-8)' }}>
        {/* Pinned Overview Card */}
        <Card
          style={{
            padding: 'var(--space-4) var(--space-4)',
            marginBottom: 'var(--space-4)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: 'var(--shadow-md)'
          }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 'var(--space-4)'
            }}
          >
            {/* Left Content */}
            <div style={{ flex: '1 1 320px', minWidth: '280px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-1)',
                  marginBottom: 'var(--space-1)'
                }}
              >
                {/* AI generated vs Template roadmap badge */}
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    color:
                      roadmap.generatedBy === 'llm'
                        ? 'var(--color-primary-800)'
                        : 'var(--color-neutral-700)',
                    backgroundColor:
                      roadmap.generatedBy === 'llm'
                        ? 'var(--color-primary-50)'
                        : 'var(--color-surface-subtle)',
                    border: `1px solid ${roadmap.generatedBy === 'llm' ? 'var(--color-primary-200)' : 'var(--color-border)'}`,
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  {roadmap.generatedBy === 'llm' ? 'AI generated roadmap' : 'Template roadmap'}
                </span>

                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'var(--color-primary-700)',
                    backgroundColor: 'var(--color-primary-50)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--color-primary-200)'
                  }}
                >
                  {roleDisplay}
                </span>
              </div>

              <h1
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: 'var(--color-neutral-900)',
                  marginBottom: 'var(--space-0-5)'
                }}
              >
                {user?.name ? `${user.name}'s Roadmap` : 'Employability Roadmap'}
              </h1>

              {/* Summary of modules */}
              <p
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  color: 'var(--color-text-body)',
                  marginBottom: 'var(--space-2)'
                }}
              >
                {completedCount} of {totalModules} modules completed
              </p>

              {/* Progress Bar (Strictly Amber) */}
              <div style={{ maxWidth: '400px' }}>
                <ProgressBar
                  value={completedCount}
                  max={totalModules}
                  label="Curriculum Progress"
                  height="8px"
                />
              </div>
            </div>

            {/* Right: Pinned ReadinessScore Ring */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 'var(--space-2) var(--space-3)',
                backgroundColor: 'var(--color-surface-subtle)',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--color-border)',
                flex: '0 0 auto'
              }}
            >
              <ReadinessScore score={roadmap.readinessScore || 0} size="lg" />
            </div>
          </div>

          {/* Dimension Score Bars */}
          {Object.keys(dimensionScores).length > 0 && (
            <div
              style={{
                marginTop: 'var(--space-4)',
                paddingTop: 'var(--space-3)',
                borderTop: '1px solid var(--color-border)'
              }}
            >
              <h3
                style={{
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  color: 'var(--color-text-muted)',
                  marginBottom: 'var(--space-2)'
                }}
              >
                Diagnostic Dimension Scores (0.0 – 5.0)
              </h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 'var(--space-2)'
                }}
              >
                {Object.entries(dimensionScores).map(([dimension, score]) => {
                  const numScore = Number(score) || 0;
                  const percent = Math.min(100, Math.round((numScore / 5.0) * 100));
                  const isWeak = numScore < 3.0;

                  return (
                    <div
                      key={dimension}
                      style={{
                        padding: 'var(--space-1-5)',
                        backgroundColor: 'var(--color-surface-subtle)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          color: 'var(--color-neutral-800)'
                        }}
                      >
                        <span style={{ textTransform: 'capitalize' }}>
                          {dimension.replace('-', ' & ')}
                        </span>
                        <span
                          style={{
                            fontWeight: 800,
                            color: isWeak ? 'var(--color-accent-700)' : 'var(--color-success-700)'
                          }}
                        >
                          {numScore.toFixed(1)} / 5.0
                        </span>
                      </div>

                      {/* Dimension mini bar */}
                      <div
                        style={{
                          width: '100%',
                          height: '6px',
                          backgroundColor: 'var(--color-neutral-200)',
                          borderRadius: 'var(--radius-full)',
                          overflow: 'hidden'
                        }}
                      >
                        <div
                          style={{
                            width: `${percent}%`,
                            height: '100%',
                            backgroundColor: isWeak
                              ? 'var(--color-accent)'
                              : 'var(--color-primary)',
                            borderRadius: 'var(--radius-full)'
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </Card>

        {/* Stepper Header & Actions */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-3)',
            gap: 'var(--space-2)'
          }}
        >
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}>
              Curriculum Modules
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Complete active modules sequentially to unlock the next milestone.
            </p>
          </div>

          <Button variant="outline" size="sm" onClick={handleRetakeDiagnostic}>
            Retake Diagnostic
          </Button>
        </div>

        {/* Vertical Stepper */}
        <div>
          {modules.map((mod, idx) => (
            <StepperModule
              key={mod.moduleId || idx}
              module={mod}
              index={idx}
              isLast={idx === modules.length - 1}
              onClick={handleModuleClick}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default DashboardPage;
