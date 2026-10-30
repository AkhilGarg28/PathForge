import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '../components/Layout.jsx';
import { Button } from '../components/Button.jsx';
import { Card } from '../components/Card.jsx';
import { ReadinessScore } from '../components/ReadinessScore.jsx';
import { usePageTitle } from '../hooks/usePageTitle.js';

export function LandingPage() {
  usePageTitle('AI-Powered Personalized Skill Roadmaps');
  const steps = [
    {
      step: '01',
      title: 'Target Your Career Role',
      desc: 'Choose your desired industry track — MERN Developer or Data Analyst — aligned with real-world hiring criteria.'
    },
    {
      step: '02',
      title: 'Take the Diagnostic Quiz',
      desc: 'Answer 12 targeted multiple-choice questions evaluating your baseline across 4 core technical dimensions.'
    },
    {
      step: '03',
      title: 'AI Synthesizes Your Roadmap',
      desc: 'Our Gemini AI engine identifies your skill gaps, prioritizing weak dimensions with curated official documentation.'
    },
    {
      step: '04',
      title: 'Track Readiness & Prove Mastery',
      desc: 'Work through interactive modules, pass checkpoints, and watch your objective Employability Readiness Score rise.'
    }
  ];

  const features = [
    {
      icon: '⚡',
      title: 'Adaptive AI Sequencing',
      desc: 'Curricula are prioritized from your weakest to strongest dimensions, eliminating foundational blindspots first.'
    },
    {
      icon: '📚',
      title: 'Curated Official Documentation',
      desc: 'Zero hallucinated links or low-quality tutorials. Every resource comes from MDN, official manuals, or freeCodeCamp.'
    },
    {
      icon: '🎯',
      title: 'Objective Readiness Metric',
      desc: 'A formulaic 0–100% readiness score calibrated against entry-level and junior job market benchmarks.'
    },
    {
      icon: '🛡️',
      title: 'Deterministic Fallback Safety',
      desc: 'Reliability first. If AI services experience latency or timeout, expert-authored fallback tracks activate immediately.'
    }
  ];

  return (
    <Layout maxWidth="1160px">
      {/* 1. Hero Section */}
      <section
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          padding: 'var(--space-8) 0 var(--space-6)',
          gap: 'var(--space-3)'
        }}
      >
        <span
          style={{
            fontSize: '0.8125rem',
            fontWeight: 700,
            color: 'var(--color-primary-700)',
            backgroundColor: 'var(--color-primary-50)',
            padding: '4px 14px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--color-primary-200)'
          }}
        >
          Adaptive AI Career Acceleration
        </span>

        <h1
          style={{
            fontSize: '2.75rem',
            fontWeight: 800,
            maxWidth: '820px',
            lineHeight: 1.15,
            color: 'var(--color-neutral-900)',
            letterSpacing: '-0.02em'
          }}
        >
          AI-Powered Personalized Skill Roadmaps for Employability
        </h1>

        <p
          style={{
            fontSize: '1.125rem',
            color: 'var(--color-text-body)',
            maxWidth: '680px',
            lineHeight: 1.6
          }}
        >
          Bridge the gap between academic theory and industry engineering standards. Diagnose real
          skill proficiencies with 12 targeted questions and let generative AI synthesize your
          personalized curriculum.
        </p>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: 'var(--space-2)',
            marginTop: 'var(--space-1)'
          }}
        >
          <Link to="/signup">
            <Button variant="primary" size="lg">
              Start Free Assessment
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" size="lg">
              Sign In to PathForge
            </Button>
          </Link>
        </div>

        {/* Hero Preview Card */}
        <div style={{ marginTop: 'var(--space-6)', width: '100%', maxWidth: '780px' }}>
          <Card
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 'var(--space-4) var(--space-5)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-lg)',
              gap: 'var(--space-3)'
            }}
          >
            <div style={{ textAlign: 'left', flex: '1 1 320px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  marginBottom: 'var(--space-1)'
                }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--color-primary-700)',
                    backgroundColor: 'var(--color-primary-50)',
                    padding: '2px 8px',
                    borderRadius: 'var(--radius-sm)'
                  }}
                >
                  Active Career Track
                </span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)' }}>
                  6 Modules
                </span>
              </div>

              <h2
                style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--color-neutral-900)' }}
              >
                MERN Developer Roadmap
              </h2>

              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-text-muted)',
                  marginBottom: 'var(--space-2)'
                }}
              >
                Targeting React architecture, Express REST APIs, MongoDB data modeling, and JWT
                authentication.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {['JavaScript (ES6+)', 'React Hooks', 'Node & Express', 'MongoDB & Git'].map(
                  (dim) => (
                    <span
                      key={dim}
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        backgroundColor: 'var(--color-surface-subtle)',
                        border: '1px solid var(--color-border)',
                        padding: '2px 8px',
                        borderRadius: 'var(--radius-full)',
                        color: 'var(--color-neutral-700)'
                      }}
                    >
                      {dim}
                    </span>
                  )
                )}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', flex: '0 0 auto' }}>
              <ReadinessScore score={74} size="lg" />
            </div>
          </Card>
        </div>
      </section>

      {/* 2. 4-Step 'How It Works' Section */}
      <section style={{ padding: 'var(--space-8) 0', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-primary)'
            }}
          >
            Structured Career Progression
          </span>
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--color-neutral-900)',
              marginTop: 'var(--space-0-5)'
            }}
          >
            How PathForge Works
          </h2>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '580px', margin: '0 auto' }}>
            Four scientific steps to diagnose your real technical gaps, synthesize targeted
            coursework, and systematically elevate your job readiness.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'var(--space-3)'
          }}
        >
          {steps.map((item) => (
            <Card
              key={item.step}
              style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative'
              }}
            >
              <div
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 900,
                  color: 'var(--color-primary-200)',
                  lineHeight: 1,
                  marginBottom: 'var(--space-1-5)'
                }}
              >
                {item.step}
              </div>

              <h3
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: 'var(--color-neutral-900)',
                  marginBottom: 'var(--space-1)'
                }}
              >
                {item.title}
              </h3>

              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-body)', lineHeight: 1.5 }}>
                {item.desc}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* 3. Feature Highlights Section */}
      <section style={{ padding: 'var(--space-8) 0', borderTop: '1px solid var(--color-border)' }}>
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-6)' }}>
          <span
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--color-primary)'
            }}
          >
            Designed for Student Success
          </span>
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--color-neutral-900)',
              marginTop: 'var(--space-0-5)'
            }}
          >
            Engineered for Job Employability
          </h2>
          <p style={{ color: 'var(--color-text-muted)', maxWidth: '580px', margin: '0 auto' }}>
            Built specifically to eliminate tutorial hell and replace uncurated video playlists with
            verifiable engineering competency.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'var(--space-3)'
          }}
        >
          {features.map((feat) => (
            <Card
              key={feat.title}
              style={{
                padding: 'var(--space-4)',
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)'
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-primary-50)',
                  border: '1px solid var(--color-primary-200)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.25rem',
                  marginBottom: 'var(--space-2)'
                }}
              >
                {feat.icon}
              </div>

              <h3
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: 'var(--color-neutral-900)',
                  marginBottom: 'var(--space-1)'
                }}
              >
                {feat.title}
              </h3>

              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-body)', lineHeight: 1.5 }}>
                {feat.desc}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {/* 4. Bottom Call to Action Banner */}
      <section style={{ padding: 'var(--space-6) 0 var(--space-8)' }}>
        <Card
          style={{
            padding: 'var(--space-6) var(--space-4)',
            textAlign: 'center',
            backgroundColor: 'var(--color-primary-900)',
            color: 'var(--color-neutral-0)',
            borderRadius: 'var(--radius-2xl)',
            boxShadow: 'var(--shadow-xl)'
          }}
        >
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: 800,
              color: 'var(--color-neutral-0)',
              marginBottom: 'var(--space-1)'
            }}
          >
            Ready to Accelerate Your Career Trajectory?
          </h2>

          <p
            style={{
              fontSize: '1.0625rem',
              color: 'var(--color-primary-100)',
              maxWidth: '560px',
              margin: '0 auto var(--space-4)',
              lineHeight: 1.5
            }}
          >
            Join hundreds of aspiring software engineers and data analysts using PathForge to
            diagnose gaps, follow curated roadmaps, and land developer roles.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--space-2)' }}>
            <Link to="/signup">
              <Button
                variant="primary"
                size="lg"
                style={{
                  backgroundColor: 'var(--color-neutral-0)',
                  color: 'var(--color-primary-900)',
                  border: 'none',
                  fontWeight: 700
                }}
              >
                Get Started Free →
              </Button>
            </Link>
          </div>
        </Card>
      </section>
    </Layout>
  );
}

export default LandingPage;
