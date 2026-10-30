import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api.js';
import { useRoadmapGeneration } from '../hooks/useRoadmapGeneration.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import Button from '../components/Button.jsx';
import ErrorState from '../components/ErrorState.jsx';
import Skeleton from '../components/Skeleton.jsx';
import './GeneratingPage.css';

const STATUS_MESSAGES = [
  'Analyzing your skill gaps...',
  'Selecting the best resources...',
  'Building your personalized roadmap...',
];

export default function GeneratingPage({ timeoutMs = 40000 }) {
  const navigate = useNavigate();
  const { generationState, payload, error, retryGeneration } = useRoadmapGeneration();
  usePageTitle('Crafting Your Roadmap');

  const [messageIndex, setMessageIndex] = useState(0);
  const [isTimedOut, setIsTimedOut] = useState(false);

  // Check roadmap existence if user refreshed or navigated directly without pending request
  const [isCheckingRoadmap, setIsCheckingRoadmap] = useState(() => {
    return generationState === 'idle' && !payload;
  });

  // 1. Refresh handling: check GET /api/roadmap if no pending request
  useEffect(() => {
    if (generationState !== 'idle' || payload) {
      return;
    }

    let isCancelled = false;

    api
      .getRoadmap()
      .then((res) => {
        if (!isCancelled) {
          if (res?.roadmap) {
            navigate('/dashboard', { replace: true });
          } else {
            navigate('/role-selection', { replace: true });
          }
        }
      })
      .catch(() => {
        if (!isCancelled) {
          navigate('/role-selection', { replace: true });
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsCheckingRoadmap(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [generationState, payload, navigate]);

  // 2. Rotating status messages every 2.5s while generating
  useEffect(() => {
    if (generationState !== 'generating' || isTimedOut) {
      return;
    }

    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % STATUS_MESSAGES.length);
    }, 2500);

    return () => clearInterval(interval);
  }, [generationState, isTimedOut]);

  // 3. Timeout guard of ~40s (configurable for testing)
  useEffect(() => {
    if (generationState !== 'generating') {
      return;
    }

    const timer = setTimeout(() => {
      setIsTimedOut(true);
    }, timeoutMs);

    return () => clearTimeout(timer);
  }, [generationState, timeoutMs]);

  // 4. Success state transition: navigate to /dashboard after ~1s
  useEffect(() => {
    if (generationState === 'success' && !isTimedOut) {
      const timer = setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [generationState, isTimedOut, navigate]);

  const backToQuizPath = payload?.roleId
    ? `/diagnostic/${encodeURIComponent(payload.roleId)}`
    : '/role-selection';

  const handleRetry = async () => {
    setIsTimedOut(false);
    try {
      await retryGeneration();
    } catch {
      // Error will be caught and reflected in context
    }
  };

  // State A: Checking session / roadmap on reload
  if (isCheckingRoadmap) {
    return (
      <main id="main-content" className="pf-generating-page">
        <div className="pf-generating-card" aria-busy="true">
          <Skeleton
            variant="circle"
            width="64px"
            height="64px"
            style={{ margin: '0 auto' }}
          />
          <Skeleton width="60%" height="28px" />
          <Skeleton width="80%" height="18px" />
          <p className="pf-generating-subtitle">Checking your roadmap status...</p>
        </div>
      </main>
    );
  }

  // State B: Timeout guard triggered
  if (isTimedOut) {
    return (
      <main id="main-content" className="pf-generating-page">
        <div className="pf-generating-error-wrapper">
          <ErrorState
            title="Taking Longer Than Expected"
            message="Our servers may be starting up or under heavy load. Don't worry, your assessment answers are saved."
            onRetry={handleRetry}
            retryLabel="Retry Generation"
          />
          <div className="pf-generating-back-action">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => navigate(backToQuizPath)}
            >
              ← Back to Assessment Quiz
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // State C: Generation error
  if (generationState === 'error') {
    return (
      <main id="main-content" className="pf-generating-page">
        <div className="pf-generating-error-wrapper">
          <ErrorState
            title="Roadmap Generation Failed"
            message={
              error?.message ||
              'We encountered an issue generating your customized roadmap. Please try again.'
            }
            onRetry={handleRetry}
            retryLabel="Retry Generation"
          />
          <div className="pf-generating-back-action">
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => navigate(backToQuizPath)}
            >
              ← Back to Assessment Quiz
            </Button>
          </div>
        </div>
      </main>
    );
  }

  // State D: Generation success
  if (generationState === 'success') {
    return (
      <main id="main-content" className="pf-generating-page">
        <div
          className="pf-generating-card pf-generating-card--success"
          role="status"
          aria-live="polite"
        >
          <div className="pf-generating-success-icon" aria-hidden="true">
            ✓
          </div>
          <h1 className="pf-generating-title">Your Roadmap is Ready!</h1>
          <p className="pf-generating-subtitle">
            Tailored specifically to your skill assessment. Taking you to your
            dashboard...
          </p>
        </div>
      </main>
    );
  }

  // State E: Generating in progress (default)
  return (
    <main id="main-content" className="pf-generating-page">
      <div className="pf-generating-card" role="status" aria-busy="true">
        <div className="pf-generating-visual" aria-hidden="true">
          <div className="pf-generating-ring" />
          <div className="pf-generating-spinner" />
          <div className="pf-generating-icon-center">✨</div>
        </div>

        <h1 className="pf-generating-title">Crafting Your Roadmap</h1>
        <p className="pf-generating-subtitle">
          Synthesizing your assessment responses into a step-by-step curriculum.
        </p>

        <div
          className="pf-generating-status-container"
          aria-live="polite"
          aria-atomic="true"
        >
          <p className="pf-generating-status-message">{STATUS_MESSAGES[messageIndex]}</p>
        </div>
      </div>
    </main>
  );
}
