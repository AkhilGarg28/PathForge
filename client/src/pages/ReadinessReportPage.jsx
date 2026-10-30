import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout.jsx';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Spinner } from '../components/Spinner.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';

export function ReadinessReportPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [report, setReport] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!location.state?.result);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!report) {
      loadReport();
    }
  }, []);

  const loadReport = async () => {
    try {
      setLoading(true);
      const res = await api.getReadinessReport();
      if (res.data?.assessment) {
        setReport(res.data.assessment);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load readiness report', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoadmap = async () => {
    try {
      setGenerating(true);
      await api.generatePersonalizedRoadmap();
      showToast('12-Week Bespoke Roadmap generated successfully!', 'success');
      navigate('/dashboard');
    } catch (err) {
      showToast(err.message || 'Failed to generate roadmap', 'error');
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <Spinner size="lg" />
          <p style={{ marginTop: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>
            Synthesizing assessment report and calibrating skill levels...
          </p>
        </div>
      </Layout>
    );
  }

  const overallScore = report?.overallScore ?? 70;
  const discrepancies = report?.claimDiscrepancies || [];
  const strongSkills = report?.strongSkills || [];
  const weakSkills = report?.weakSkills || [];
  const recommendation = report?.recommendation || 'Continue focusing on core foundational concepts.';

  return (
    <Layout>
      <div style={{ maxWidth: '840px', margin: '0 auto', padding: 'var(--space-6) var(--space-4)' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <span
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--color-primary)'
            }}
          >
            Phase 2 Verification Complete
          </span>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, margin: '8px 0' }}>
            AI Readiness & Verification Report
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            We cross-referenced your assessment answers with your claimed resume skills to create an authentic baseline.
          </p>
        </div>

        {/* Score & Discrepancies Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
          {/* Readiness Score Card */}
          <Card>
            <div style={{ textAlign: 'center', padding: 'var(--space-3)' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
                VERIFIED READINESS SCORE
              </div>
              <div
                style={{
                  fontSize: '3.5rem',
                  fontWeight: 900,
                  margin: '12px 0',
                  color: overallScore >= 70 ? 'var(--color-success)' : 'var(--color-primary)'
                }}
              >
                {overallScore}%
              </div>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                {overallScore >= 80
                  ? 'Excellent readiness! Fast-track advanced topics available.'
                  : overallScore >= 60
                  ? 'Solid foundation. Targeted practice on weak areas will accelerate mastery.'
                  : 'Foundational gaps detected. Roadmap will prioritize remedial core mechanics.'}
              </p>
            </div>
          </Card>

          {/* Quick Metrics */}
          <Card>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 'var(--space-3)' }}>
              Skill Breakdown
            </h3>
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--color-success)', textTransform: 'uppercase' }}>
                Demonstrated Strengths
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                {strongSkills.length > 0 ? (
                  strongSkills.map((s, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        color: '#16a34a',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}
                    >
                      ✓ {s}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Core fundamentals demonstrated</span>
                )}
              </div>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>
                High Priority Reinforcements
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                {weakSkills.length > 0 ? (
                  weakSkills.map((w, i) => (
                    <span
                      key={i}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        color: '#f59e0b',
                        fontSize: '0.8rem',
                        fontWeight: 600
                      }}
                    >
                      ⚡ {w}
                    </span>
                  ))
                ) : (
                  <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>None identified</span>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* RESUME CLAIM VERIFICATION ENGINE ALERT (Phase 2 Requirement) */}
        {discrepancies.length > 0 ? (
          <div
            style={{
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              marginBottom: 'var(--space-4)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>⚠️</span>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#dc2626', margin: '0 0 6px' }}>
                  Resume Claim Discrepancy Calibration
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: '0 0 10px', lineHeight: 1.5 }}>
                  Our AI verification engine noticed a divergence between your resume's claimed experience and your assessment responses. To protect your learning trajectory and prevent frustration, we have calibrated your roadmap:
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {discrepancies.map((d, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: 'var(--color-bg-surface)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--color-border)',
                        fontSize: '0.85rem'
                      }}
                    >
                      <strong style={{ color: 'var(--color-text-primary)' }}>{d.skill}:</strong>{' '}
                      Claimed <em>{d.claimedLevel}</em>, but scored <strong>{d.observedScore}%</strong> on assessment questions.{' '}
                      <span style={{ color: 'var(--color-text-muted)' }}>{d.observation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'rgba(34, 197, 94, 0.08)',
              border: '1px solid rgba(34, 197, 94, 0.3)',
              marginBottom: 'var(--space-4)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.5rem' }}>✅</span>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#16a34a', margin: '0 0 4px' }}>
                  Claims Fully Verified
                </h3>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', margin: 0 }}>
                  Your assessment scores align closely with your resume claims and GitHub code evidence!
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Personalized Roadmap Call to Action */}
        <Card>
          <div style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '8px' }}>
              Ready to Generate Your 12-Week Bespoke Roadmap?
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', maxWidth: '560px', margin: '0 auto var(--space-6)' }}>
              PathForge will now synthesize your verified skills, goal timeline, and detected weak areas into a day-by-day learning curriculum with practical coding exercises and weekly adaptive assessments.
            </p>

            <Button
              variant="primary"
              size="lg"
              onClick={handleGenerateRoadmap}
              disabled={generating}
              style={{ padding: '14px 32px', fontSize: '1.05rem', fontWeight: 700 }}
            >
              {generating ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Spinner size="sm" /> Generating 12-Week Roadmap...
                </span>
              ) : (
                'Generate My Personalized Roadmap →'
              )}
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
}

export default ReadinessReportPage;
