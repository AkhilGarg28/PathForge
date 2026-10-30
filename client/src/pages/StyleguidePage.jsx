import React, { useState } from 'react';
import { Layout } from '../components/Layout.jsx';
import { Button } from '../components/Button.jsx';
import { Input } from '../components/Input.jsx';
import { Card } from '../components/Card.jsx';
import { Spinner } from '../components/Spinner.jsx';
import { Skeleton } from '../components/Skeleton.jsx';
import { ProgressBar } from '../components/ProgressBar.jsx';
import { ReadinessScore } from '../components/ReadinessScore.jsx';
import { StatusCircle } from '../components/StatusCircle.jsx';
import { StepperModule } from '../components/StepperModule.jsx';
import { QuizQuestion } from '../components/QuizQuestion.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { ErrorState } from '../components/ErrorState.jsx';
import { useToast } from '../hooks/useToast.js';

export function StyleguidePage() {
  const toast = useToast();

  const [inputVal, setInputVal] = useState('Sample text');
  const [quizSelection, setQuizSelection] = useState(1);

  const sampleQuestion = {
    id: 'sg-q1',
    dimension: 'javascript',
    question:
      'Which method determines whether an array includes a certain value among its entries, returning true or false?',
    options: ['find()', 'includes()', 'indexOf()', 'some()']
  };

  const sampleModuleActive = {
    moduleId: 'mod-1',
    title: 'JavaScript Foundations & Modern ES6+',
    description: 'Master asynchronous JavaScript, promises, closures, and modern ES2022 syntax.',
    resourceTags: ['javascript', 'web'],
    estimatedHours: 10,
    status: 'active'
  };

  const sampleModuleComplete = {
    moduleId: 'mod-2',
    title: 'React Core Principles & Hooks Architecture',
    description: 'Build single-page apps with hooks, state reconciliations, and context.',
    resourceTags: ['react', 'frontend'],
    estimatedHours: 12,
    status: 'complete'
  };

  const sampleModuleLocked = {
    moduleId: 'mod-3',
    title: 'Node.js & Express RESTful API Services',
    description: 'Architect scalable backend services, custom routing, and middleware.',
    resourceTags: ['node', 'express'],
    estimatedHours: 14,
    status: 'locked'
  };

  return (
    <Layout maxWidth="1080px">
      <div style={{ padding: 'var(--space-6) 0' }}>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <span
            style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: 'var(--color-primary-700)',
              backgroundColor: 'var(--color-primary-50)',
              padding: '4px 12px',
              borderRadius: 'var(--radius-full)',
              border: '1px solid var(--color-primary-200)'
            }}
          >
            Design System & Component Library
          </span>
          <h1
            style={{
              fontSize: '2.25rem',
              fontWeight: 800,
              color: 'var(--color-neutral-900)',
              marginTop: 'var(--space-1)'
            }}
          >
            PathForge Component Styleguide
          </h1>
          <p style={{ color: 'var(--color-text-muted)' }}>
            Deep blue/teal primary palette, strict single amber accent for progress & readiness,
            neutral grays, 8px grid.
          </p>
        </div>

        {/* 1. Buttons */}
        <section style={{ marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
            1. Buttons (Variants & Sizes)
          </h2>
          <Card style={{ padding: 'var(--space-4)' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <div>
                <h4
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-text-muted)',
                    marginBottom: 'var(--space-1)'
                  }}
                >
                  Variants
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  <Button variant="primary">Primary</Button>
                  <Button variant="secondary">Secondary</Button>
                  <Button variant="outline">Outline</Button>
                  <Button variant="ghost">Ghost</Button>
                  <Button variant="danger">Danger</Button>
                </div>
              </div>

              <div>
                <h4
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-text-muted)',
                    marginBottom: 'var(--space-1)'
                  }}
                >
                  Sizes
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <Button size="sm">Small (sm)</Button>
                  <Button size="md">Medium (md)</Button>
                  <Button size="lg">Large (lg)</Button>
                </div>
              </div>

              <div>
                <h4
                  style={{
                    fontSize: '0.875rem',
                    color: 'var(--color-text-muted)',
                    marginBottom: 'var(--space-1)'
                  }}
                >
                  States: Disabled & Loading
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
                  <Button disabled>Disabled Primary</Button>
                  <Button variant="outline" disabled>
                    Disabled Outline
                  </Button>
                  <Button loading>Loading...</Button>
                  <Button variant="secondary" loading>
                    Loading Secondary
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </section>

        {/* 2. Form Inputs */}
        <section style={{ marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
            2. Form Inputs
          </h2>
          <Card style={{ padding: 'var(--space-4)' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 'var(--space-3)'
              }}
            >
              <Input
                label="Standard Input"
                placeholder="Type here..."
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
              />

              <Input
                label="Input with Helper Text"
                placeholder="e.g. alex@example.com"
                helperText="We will never share your email with third parties."
              />

              <Input
                label="Input with Error State"
                value="invalid-format@"
                readOnly
                error="Please enter a valid email address with a domain."
              />

              <Input label="Disabled Input" value="Fixed system identifier" disabled readOnly />
            </div>
          </Card>
        </section>

        {/* 3. Progress Bar & Readiness Scores */}
        <section style={{ marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
            3. Progress Bar & Readiness Scores (Strict Amber Accent)
          </h2>
          <Card style={{ padding: 'var(--space-4)' }}>
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <h4
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-text-muted)',
                  marginBottom: 'var(--space-2)'
                }}
              >
                Progress Bars (0%, 35%, 65%, 100%)
              </h4>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-2)',
                  maxWidth: '480px'
                }}
              >
                <ProgressBar value={0} max={100} label="Not Started" />
                <ProgressBar value={35} max={100} label="In Progress" />
                <ProgressBar value={65} max={100} label="Advancing" />
                <ProgressBar value={100} max={100} label="Completed" />
              </div>
            </div>

            <div>
              <h4
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-text-muted)',
                  marginBottom: 'var(--space-2)'
                }}
              >
                Readiness Score Radial Gauges (sm, md, lg)
              </h4>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 'var(--space-4)'
                }}
              >
                <ReadinessScore score={15} size="sm" />
                <ReadinessScore score={45} size="md" />
                <ReadinessScore score={72} size="lg" />
                <ReadinessScore score={95} size="md" />
              </div>
            </div>
          </Card>
        </section>

        {/* 4. Status Circle & Timeline Stepper */}
        <section style={{ marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
            4. Status Circles & Stepper Modules
          </h2>
          <Card style={{ padding: 'var(--space-4)' }}>
            <div style={{ marginBottom: 'var(--space-3)' }}>
              <h4
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-text-muted)',
                  marginBottom: 'var(--space-1)'
                }}
              >
                Status Circles (sm, md, lg)
              </h4>
              <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                <StatusCircle status="locked" size="sm" />
                <StatusCircle status="active" size="md" />
                <StatusCircle status="complete" size="lg" />
              </div>
            </div>

            <div>
              <h4
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-text-muted)',
                  marginBottom: 'var(--space-2)'
                }}
              >
                Sequential Module Stepper
              </h4>
              <div style={{ maxWidth: '640px' }}>
                <StepperModule module={sampleModuleComplete} index={0} isLast={false} />
                <StepperModule module={sampleModuleActive} index={1} isLast={false} />
                <StepperModule module={sampleModuleLocked} index={2} isLast={true} />
              </div>
            </div>
          </Card>
        </section>

        {/* 5. Quiz Question Component */}
        <section style={{ marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
            5. Accessible Quiz Question (Keyboard & Screen-Reader Accessible)
          </h2>
          <Card style={{ padding: 'var(--space-4)', maxWidth: '680px' }}>
            <QuizQuestion
              question={sampleQuestion}
              questionNumber={1}
              totalQuestions={12}
              selectedIndex={quizSelection}
              onSelectOption={setQuizSelection}
            />
          </Card>
        </section>

        {/* 6. Spinners & Skeletons */}
        <section style={{ marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
            6. Loading States (Spinners & Skeletons)
          </h2>
          <Card style={{ padding: 'var(--space-4)' }}>
            <div
              style={{
                display: 'flex',
                gap: 'var(--space-4)',
                alignItems: 'center',
                marginBottom: 'var(--space-3)'
              }}
            >
              <Spinner size="sm" />
              <Spinner size="md" />
              <Spinner size="lg" />
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-1-5)',
                maxWidth: '420px'
              }}
            >
              <Skeleton variant="text" width="60%" />
              <Skeleton variant="text" width="90%" />
              <Skeleton variant="rect" height="60px" />
              <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                <Skeleton variant="circle" width="36px" height="36px" />
                <Skeleton variant="text" width="50%" />
              </div>
            </div>
          </Card>
        </section>

        {/* 7. Toast Alerts */}
        <section style={{ marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
            7. Toast Notifications
          </h2>
          <Card style={{ padding: 'var(--space-4)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
              <Button
                variant="secondary"
                onClick={() => toast.info('Diagnostic progress auto-saved.')}
              >
                Trigger Info Toast
              </Button>
              <Button
                variant="primary"
                onClick={() => toast.success('Module marked as complete! Readiness increased.')}
              >
                Trigger Success Toast
              </Button>
              <Button
                variant="outline"
                onClick={() => toast.warning('Complete prior modules to unlock this stage.')}
              >
                Trigger Warning Toast
              </Button>
              <Button
                variant="danger"
                onClick={() => toast.error('Invalid email or password. Please try again.')}
              >
                Trigger Error Toast
              </Button>
            </div>
          </Card>
        </section>

        {/* 8. Empty & Error States */}
        <section style={{ marginBottom: 'var(--space-6)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 'var(--space-2)' }}>
            8. Empty & Error States
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: 'var(--space-3)'
            }}
          >
            <Card style={{ padding: 'var(--space-3)' }}>
              <EmptyState
                title="No Active Modules"
                description="You have completed all active modules in your current career roadmap."
                actionLabel="Explore New Roles"
                onAction={() => {}}
              />
            </Card>

            <Card style={{ padding: 'var(--space-3)' }}>
              <ErrorState
                title="Network Disconnected"
                message="Unable to reach PathForge API servers. Please check your internet connection."
                onRetry={() => {}}
              />
            </Card>
          </div>
        </section>
      </div>
    </Layout>
  );
}

export default StyleguidePage;
