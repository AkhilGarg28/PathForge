import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import {
  Footer,
  Button,
  ReadinessScore,
  ProgressBar,
  StatusCircle,
} from '../components/index.js';
import './Landing.css';

export default function Landing() {
  const { user } = useAuth();
  usePageTitle('AI-Powered Skill Roadmaps for Employability');

  return (
    <div className="pf-landing">
      <main className="pf-landing__main" id="main-content">
        {/* ==================================================================
            Hero Section
            ================================================================== */}
        <section className="pf-landing__hero" aria-labelledby="hero-heading">
          <div className="pf-landing__hero-container">
            <div className="pf-landing__hero-content">
              <span className="pf-landing__pill">
                <span aria-hidden="true">🎯</span>
                <span>Bridging Education to Industry Employability</span>
              </span>

              <h1 id="hero-heading" className="pf-landing__headline">
                AI-Powered Personalized Skill Roadmaps for Employability
              </h1>

              <p className="pf-landing__subheading">
                Identify your skill gaps, follow an adaptive curriculum tailored to real
                job descriptions, and prove market readiness with verified checkpoint
                assessments.
              </p>

              <div className="pf-landing__hero-actions">
                {user ? (
                  <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                    <Button variant="primary" size="lg">
                      Go to Dashboard →
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/signup" style={{ textDecoration: 'none' }}>
                      <Button variant="primary" size="lg">
                        Get started
                      </Button>
                    </Link>
                    <Link to="/login" style={{ textDecoration: 'none' }}>
                      <Button variant="secondary" size="lg">
                        Log in
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* Hero Visual Preview Card (CSS/SVG only, zero external images) */}
            <div className="pf-landing__hero-visual" aria-hidden="true">
              <div className="pf-landing__hero-card-preview">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid var(--color-border-subtle)',
                    paddingBottom: 'var(--space-2)',
                  }}
                >
                  <div>
                    <strong style={{ fontSize: 'var(--font-size-sm)', display: 'block' }}>
                      MERN Stack Developer
                    </strong>
                    <span
                      style={{
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      Active Roadmap Track
                    </span>
                  </div>
                  <ReadinessScore score={68} compact label="" />
                </div>

                <div style={{ padding: 'var(--space-1) 0' }}>
                  <ProgressBar label="Overall Completion" value={42} size="sm" />
                </div>

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 'var(--space-1)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-1)',
                      fontSize: 'var(--font-size-xs)',
                      padding: 'var(--space-1)',
                      backgroundColor: 'var(--color-surface-subtle)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  >
                    <StatusCircle status="complete" />
                    <span>1. Modern JavaScript & Async</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-1)',
                      fontSize: 'var(--font-size-xs)',
                      padding: 'var(--space-1)',
                      backgroundColor: 'var(--color-progress-track)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--color-progress-text)',
                      fontWeight: 600,
                    }}
                  >
                    <StatusCircle status="active" />
                    <span>2. React Architecture & State</span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--space-1)',
                      fontSize: 'var(--font-size-xs)',
                      padding: 'var(--space-1)',
                      backgroundColor: 'var(--color-surface-subtle)',
                      borderRadius: 'var(--radius-md)',
                      opacity: 0.7,
                    }}
                  >
                    <StatusCircle status="locked" />
                    <span>3. Express API & JWT Sessions</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            How It Works (4 Steps)
            ================================================================== */}
        <section className="pf-landing__section" aria-labelledby="how-it-works-heading">
          <div className="pf-landing__section-container">
            <div className="pf-landing__section-header">
              <h2 id="how-it-works-heading" className="pf-landing__section-title">
                How PathForge Works
              </h2>
              <p className="pf-landing__section-desc">
                Four streamlined steps designed to transform ambitious learners into
                job-ready technical talent.
              </p>
            </div>

            <div className="pf-landing__steps-grid">
              {/* Step 1 */}
              <div className="pf-landing__step-card">
                <span className="pf-landing__step-number">1</span>
                <h3 className="pf-landing__step-title">Choose your role</h3>
                <p className="pf-landing__step-desc">
                  Select your target career track, such as MERN Stack Developer or Data
                  Analyst, mapped to current market demands.
                </p>
              </div>

              {/* Step 2 */}
              <div className="pf-landing__step-card">
                <span className="pf-landing__step-number">2</span>
                <h3 className="pf-landing__step-title">Take the diagnostic</h3>
                <p className="pf-landing__step-desc">
                  Complete a comprehensive multi-dimensional assessment that uncovers your
                  foundational competencies and hidden blind spots.
                </p>
              </div>

              {/* Step 3 */}
              <div className="pf-landing__step-card">
                <span className="pf-landing__step-number">3</span>
                <h3 className="pf-landing__step-title">Get your personalized roadmap</h3>
                <p className="pf-landing__step-desc">
                  Receive an AI-curated sequence of focused modules with industry
                  documentation, interactive labs, and practical guides.
                </p>
              </div>

              {/* Step 4 */}
              <div className="pf-landing__step-card">
                <span className="pf-landing__step-number">4</span>
                <h3 className="pf-landing__step-title">Track your readiness</h3>
                <p className="pf-landing__step-desc">
                  Validate your skills with rigorous checkpoint quizzes that dynamically
                  update your market readiness score and calibrate your pace.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            Features Section
            ================================================================== */}
        <section
          className="pf-landing__section pf-landing__features"
          aria-labelledby="features-heading"
        >
          <div className="pf-landing__section-container">
            <div className="pf-landing__section-header">
              <h2 id="features-heading" className="pf-landing__section-title">
                Engineered for Real-World Employability
              </h2>
              <p className="pf-landing__section-desc">
                Every feature in PathForge is built to provide actionable clarity,
                eliminating tutorial burnout and focusing on mastery.
              </p>
            </div>

            <div className="pf-landing__features-grid">
              {/* Feature 1 */}
              <div className="pf-landing__feature-card">
                <div className="pf-landing__feature-icon-wrapper" aria-hidden="true">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <h3 className="pf-landing__feature-title">Skill-Gap Diagnosis</h3>
                <p className="pf-landing__feature-desc">
                  Multi-dimensional profiling pinpoints exactly what you need to learn,
                  bypassing redundant material you already know.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="pf-landing__feature-card">
                <div className="pf-landing__feature-icon-wrapper" aria-hidden="true">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
                <h3 className="pf-landing__feature-title">AI Roadmap</h3>
                <p className="pf-landing__feature-desc">
                  Dynamic curriculum replanning automatically adapts your syllabus based
                  on your checkpoint scores and speed.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="pf-landing__feature-card">
                <div className="pf-landing__feature-icon-wrapper" aria-hidden="true">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <h3 className="pf-landing__feature-title">Readiness Score</h3>
                <p className="pf-landing__feature-desc">
                  An objective 0-100 metric calculated directly from your proven
                  assessment outcomes, giving employers verifiable proof of capability.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="pf-landing__feature-card">
                <div className="pf-landing__feature-icon-wrapper" aria-hidden="true">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <h3 className="pf-landing__feature-title">Progress Tracking</h3>
                <p className="pf-landing__feature-desc">
                  Clear step-by-step milestones with estimated hours, resource tags, and
                  checkpoint requirements to sustain momentum.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ==================================================================
            Final CTA Band
            ================================================================== */}
        <section className="pf-landing__cta-band" aria-labelledby="cta-heading">
          <div className="pf-landing__cta-content">
            <h2 id="cta-heading" className="pf-landing__cta-title">
              Ready to Forge Your Path to Technical Employability?
            </h2>

            <p className="pf-landing__cta-desc">
              Join thousands of aspiring developers and analysts who have replaced aimless
              tutorials with validated, structured skill paths.
            </p>

            <div className="pf-landing__cta-actions">
              {user ? (
                <Link to="/dashboard" style={{ textDecoration: 'none' }}>
                  <Button variant="primary" size="lg">
                    Go to Your Dashboard →
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/signup" style={{ textDecoration: 'none' }}>
                    <Button variant="primary" size="lg">
                      Start Your Free Diagnostic
                    </Button>
                  </Link>
                  <Link to="/login" style={{ textDecoration: 'none' }}>
                    <Button variant="secondary" size="lg">
                      Log in
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
