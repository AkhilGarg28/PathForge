import { useState } from 'react';
import { usePageTitle } from '../hooks/usePageTitle.js';
import {
  Button,
  Input,
  Card,
  ProgressBar,
  StatusCircle,
  StepperModule,
  ReadinessScore,
  QuizQuestion,
  Skeleton,
  EmptyState,
  ErrorState,
  useToast,
} from '../components/index.js';
import './StyleguidePage.css';

export default function StyleguidePage() {
  const toast = useToast();
  usePageTitle('Design System Styleguide');

  // Interactive component states for testing
  const [inputValue, setInputValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('SuperSecret123!');
  const [quizSelection, setQuizSelection] = useState(1);
  const [readinessValue, setReadinessValue] = useState(65);
  const [clickedModule, setClickedModule] = useState(null);

  const sampleQuizOptions = [
    'No familiarity or background experience',
    'Understand fundamental theory, basic practical knowledge',
    'Comfortable implementing production features with docs',
    'Advanced mastery, optimization, and system design capability',
  ];

  return (
    <main id="main-content" className="pf-styleguide">
      <header className="pf-styleguide__header">
        <h1 style={{ fontSize: 'var(--font-size-3xl)' }}>
          PathForge Design System Styleguide
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
          Comprehensive living catalog of all core tokens, form elements, status
          indicators, and domain components in every state.
        </p>
      </header>

      {/* 1. BUTTONS */}
      <section className="pf-styleguide__section">
        <h2 className="pf-styleguide__section-title">1. Button Component</h2>

        <div className="pf-styleguide__demo-box">
          <span className="pf-styleguide__label">Variants</span>
          <div className="pf-styleguide__row">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="danger">Danger</Button>
          </div>
        </div>

        <div className="pf-styleguide__demo-box">
          <span className="pf-styleguide__label">Sizes</span>
          <div className="pf-styleguide__row">
            <Button size="sm">Small (sm)</Button>
            <Button size="md">Medium (md)</Button>
            <Button size="lg">Large (lg)</Button>
          </div>
        </div>

        <div className="pf-styleguide__demo-box">
          <span className="pf-styleguide__label">States (Loading & Disabled)</span>
          <div className="pf-styleguide__row">
            <Button loading variant="primary">
              Saving…
            </Button>
            <Button disabled variant="primary">
              Disabled Primary
            </Button>
            <Button disabled variant="secondary">
              Disabled Secondary
            </Button>
          </div>
        </div>
      </section>

      {/* 2. INPUTS */}
      <section className="pf-styleguide__section">
        <h2 className="pf-styleguide__section-title">2. Input Component</h2>
        <div className="pf-styleguide__grid">
          <div className="pf-styleguide__demo-box">
            <span className="pf-styleguide__label">Standard Input with Hint</span>
            <Input
              label="Full Name"
              placeholder="e.g. Alex Morgan"
              hint="Enter your legal name as it appears on certificates."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>

          <div className="pf-styleguide__demo-box">
            <span className="pf-styleguide__label">Validation Error State</span>
            <Input
              label="Email Address"
              type="email"
              value="invalid-email@"
              error="Please enter a valid email address."
              onChange={() => {}}
            />
          </div>

          <div className="pf-styleguide__demo-box">
            <span className="pf-styleguide__label">Password with Show/Hide Toggle</span>
            <Input
              label="Account Password"
              type="password"
              value={passwordValue}
              onChange={(e) => setPasswordValue(e.target.value)}
            />
          </div>

          <div className="pf-styleguide__demo-box">
            <span className="pf-styleguide__label">Disabled State</span>
            <Input
              label="User ID"
              value="usr-readonly-99"
              disabled
              hint="System-generated identifier."
            />
          </div>
        </div>
      </section>

      {/* 3. CARDS & CONTAINERS */}
      <section className="pf-styleguide__section">
        <h2 className="pf-styleguide__section-title">3. Card Component</h2>
        <div className="pf-styleguide__grid">
          <Card>
            <h3
              style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-1)' }}
            >
              Standard Card
            </h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Clean content container with token-based elevation and rounded corners.
            </p>
          </Card>

          <Card
            variant="interactive"
            onClick={() => toast.info('Interactive card clicked!')}
          >
            <h3
              style={{ fontSize: 'var(--font-size-lg)', marginBottom: 'var(--space-1)' }}
            >
              Interactive Card (Click Me)
            </h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Displays hover elevation, focus ring, and keyboard trigger support.
            </p>
          </Card>

          <Card
            header={<strong>Card Header Slot</strong>}
            footer={
              <Button size="sm" variant="primary">
                Action
              </Button>
            }
          >
            <p style={{ color: 'var(--color-text-secondary)' }}>
              Card configured with custom header and footer slots.
            </p>
          </Card>
        </div>
      </section>

      {/* 4. PROGRESS BAR (SINGLE AMBER ACCENT) */}
      <section className="pf-styleguide__section">
        <h2 className="pf-styleguide__section-title">
          4. ProgressBar (Reserved Amber Accent)
        </h2>
        <div className="pf-styleguide__demo-box">
          <ProgressBar label="Overall Roadmap Progress" value={42} size="md" />
          <ProgressBar label="Beginner Track (sm)" value={15} size="sm" />
          <ProgressBar label="Mastery Track Complete (lg)" value={100} size="lg" />
        </div>
      </section>

      {/* 5. STATUS CIRCLE */}
      <section className="pf-styleguide__section">
        <h2 className="pf-styleguide__section-title">
          5. StatusCircle (No Color-Alone Reliance)
        </h2>
        <div className="pf-styleguide__demo-box">
          <div className="pf-styleguide__row" style={{ gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <StatusCircle status="locked" />
              <span>Locked (Lock Symbol)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <StatusCircle status="active" />
              <span>Active / In Progress (Play Icon & Amber)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
              <StatusCircle status="complete" />
              <span>Complete (Checkmark & Green)</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. STEPPER MODULE */}
      <section className="pf-styleguide__section">
        <h2 className="pf-styleguide__section-title">6. StepperModule Roadmap Steps</h2>
        <div style={{ maxWidth: 640 }}>
          {clickedModule && (
            <p
              style={{
                color: 'var(--color-primary)',
                fontWeight: 'bold',
                marginBottom: 'var(--space-2)',
              }}
            >
              Selected: {clickedModule}
            </p>
          )}

          <StepperModule
            stepNumber={1}
            title="Modern JavaScript & Event Loop"
            description="Deep dive into asynchronous JavaScript, Promises, and the V8 runtime queue."
            estimatedHours={8}
            status="complete"
            isLast={false}
            onClick={() => setClickedModule('Module 1: Complete')}
          />

          <StepperModule
            stepNumber={2}
            title="React Architecture & State Models"
            description="Component lifecycles, custom hooks, and state composition patterns."
            estimatedHours={12}
            status="active"
            isLast={false}
            onClick={() => setClickedModule('Module 2: Active')}
          />

          <StepperModule
            stepNumber={3}
            title="Secure API Construction with Node & Express"
            description="RESTful endpoints, middleware validation pipelines, and secure JWT cookies."
            estimatedHours={10}
            status="locked"
            isLast={true}
            onClick={() => setClickedModule('Module 3: Locked')}
          />
        </div>
      </section>

      {/* 7. READINESS SCORE */}
      <section className="pf-styleguide__section">
        <h2 className="pf-styleguide__section-title">
          7. ReadinessScore (Circular SVG Gauge)
        </h2>
        <div className="pf-styleguide__demo-box">
          <div className="pf-styleguide__row" style={{ justifyContent: 'space-around' }}>
            <ReadinessScore score={28} label="Early Stage" />
            <ReadinessScore score={readinessValue} label="Interactive Gauge" />
            <ReadinessScore score={100} label="Job Ready" />
          </div>

          <div style={{ marginTop: 'var(--space-3)' }}>
            <span className="pf-styleguide__label">Test Live Gauge Animation:</span>
            <div className="pf-styleguide__row" style={{ marginTop: 'var(--space-1)' }}>
              <Button size="sm" variant="secondary" onClick={() => setReadinessValue(20)}>
                Set 20%
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setReadinessValue(50)}>
                Set 50%
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setReadinessValue(85)}>
                Set 85%
              </Button>
            </div>
          </div>

          <div style={{ marginTop: 'var(--space-3)' }}>
            <span className="pf-styleguide__label">
              Compact Variant (for Mobile / Header):
            </span>
            <div style={{ marginTop: 'var(--space-1)' }}>
              <ReadinessScore score={readinessValue} compact label="Readiness" />
            </div>
          </div>
        </div>
      </section>

      {/* 8. QUIZ QUESTION */}
      <section className="pf-styleguide__section">
        <h2 className="pf-styleguide__section-title">8. QuizQuestion Component</h2>
        <div className="pf-styleguide__demo-box">
          <span className="pf-styleguide__label">Interactive Assessment State</span>
          <QuizQuestion
            questionNumber={1}
            questionText="How proficient are you diagnosing asynchronous memory leaks in JavaScript?"
            subtitle="Rate your hands-on production experience."
            options={sampleQuizOptions}
            selectedIndex={quizSelection}
            onSelectOption={setQuizSelection}
          />

          <span className="pf-styleguide__label" style={{ marginTop: 'var(--space-2)' }}>
            Review / Checkpoint Result State (Correct vs Choice)
          </span>
          <QuizQuestion
            questionNumber={2}
            questionText="Where should sensitive session tokens be stored to protect against XSS attacks?"
            options={[
              'localStorage',
              'httpOnly Secure Cookie',
              'URL query parameters',
              'sessionStorage',
            ]}
            selectedIndex={0}
            correctIndex={1}
            showResult
          />
        </div>
      </section>

      {/* 9. SKELETONS, EMPTY & ERROR STATES */}
      <section className="pf-styleguide__section">
        <h2 className="pf-styleguide__section-title">
          9. Skeletons, Empty States & Error States
        </h2>

        <div className="pf-styleguide__demo-box">
          <span className="pf-styleguide__label">Skeleton Shimmer Variants</span>
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}
          >
            <Skeleton variant="circle" />
            <Skeleton variant="text" lines={3} />
            <Skeleton variant="card" height="90px" />
          </div>
        </div>

        <div className="pf-styleguide__demo-box">
          <span className="pf-styleguide__label">Empty State</span>
          <EmptyState
            icon="📚"
            title="No modules completed yet"
            message="Start with Module 1 to unlock your tailored employability path."
            action={<Button variant="primary">Begin First Module</Button>}
          />
        </div>

        <div className="pf-styleguide__demo-box">
          <span className="pf-styleguide__label">Error State with Retry Action</span>
          <ErrorState
            title="Failed to load roadmap data"
            message="The PathForge API could not be reached. Please check your network connection."
            onRetry={() => toast.error('Retried request! (Simulated error state)')}
          />
        </div>
      </section>

      {/* 10. TOAST NOTIFICATIONS */}
      <section className="pf-styleguide__section">
        <h2 className="pf-styleguide__section-title">10. Toast Notifications</h2>
        <div className="pf-styleguide__demo-box">
          <span className="pf-styleguide__label">Trigger Toasts</span>
          <div className="pf-styleguide__row">
            <Button
              variant="secondary"
              onClick={() =>
                toast.success('Module successfully completed! +15% readiness')
              }
            >
              Trigger Success Toast
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast.error('Failed to save assessment answers')}
            >
              Trigger Error Toast
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast.info('New checkpoint quiz available for Module 2')}
            >
              Trigger Info Toast
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}
