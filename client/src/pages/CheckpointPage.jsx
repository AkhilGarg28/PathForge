import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../services/api.js';
import { useToast } from '../hooks/useToast.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import Button from '../components/Button.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import Skeleton from '../components/Skeleton.jsx';
import ErrorState from '../components/ErrorState.jsx';
import EmptyState from '../components/EmptyState.jsx';
import QuizQuestion from '../components/QuizQuestion.jsx';
import Modal from '../components/Modal.jsx';
import './CheckpointPage.css';

export default function CheckpointPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { success, error: toastError, info } = useToast();
  usePageTitle('Module Checkpoint');

  const isCheckpointEnabled = import.meta.env.VITE_ENABLE_CHECKPOINT === 'true';

  const [checkpointTitle, setCheckpointTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  const [moduleTitle, setModuleTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const questionCardRef = useRef(null);

  // 1. Feature Flag Guard: redirect to dashboard if disabled
  useEffect(() => {
    if (!isCheckpointEnabled) {
      navigate('/dashboard', { replace: true });
    }
  }, [isCheckpointEnabled, navigate]);

  // 2. Fetch Checkpoint Questions & Verify Locked Status
  const loadCheckpointData = useCallback(() => {
    let isCancelled = false;

    Promise.all([api.getRoadmap(), api.getCheckpoint(moduleId)])
      .then(([roadmapRes, cpRes]) => {
        if (isCancelled) return;

        const targetModule = roadmapRes.roadmap?.modules?.find(
          (m) => m.moduleId === moduleId,
        );

        if (!targetModule) {
          info(`Module "${moduleId}" was not found.`);
          navigate('/dashboard', { replace: true });
          return;
        }

        if (targetModule.status === 'locked') {
          info('This module is locked. Checkpoint is unavailable.');
          navigate('/dashboard', { replace: true });
          return;
        }

        setModuleTitle(targetModule.title || moduleId);
        setCheckpointTitle(cpRes.title || 'Module Checkpoint');
        setQuestions(cpRes.questions || []);
        setError(null);
      })
      .catch((err) => {
        if (isCancelled) return;
        if (err.code === 'NO_ROADMAP' || err.status === 404) {
          info('No active roadmap found.');
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
    loadCheckpointData();
  }, [loadCheckpointData]);

  useEffect(() => {
    if (!isCheckpointEnabled) return;
    const cleanup = loadCheckpointData();
    return cleanup;
  }, [isCheckpointEnabled, loadCheckpointData]);

  // Answer selection handler
  const handleSelectOption = useCallback((questionId, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  }, []);

  // Jump to specific question
  const jumpToQuestion = (index) => {
    setCurrentIndex(index);
    if (questionCardRef.current) {
      questionCardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  };

  // Calculations for progress & validation (memoized)
  const totalQuestions = questions.length;
  const answeredCount = useMemo(
    () => questions.filter((q) => answers[q.id] !== undefined).length,
    [questions, answers],
  );
  const isAllAnswered = totalQuestions > 0 && answeredCount === totalQuestions;
  const isLastQuestion = totalQuestions > 0 && currentIndex === totalQuestions - 1;

  const unansweredIndices = useMemo(
    () =>
      questions
        .map((q, idx) => (answers[q.id] === undefined ? idx : null))
        .filter((idx) => idx !== null),
    [questions, answers],
  );

  const currentQuestion = questions[currentIndex];

  // Submit assessment handler (memoized)
  const handleConfirmSubmit = useCallback(async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setShowConfirmModal(false);

    const submissionAnswers = questions.map((q) => ({
      questionId: q.id,
      selectedIndex: answers[q.id] !== undefined ? answers[q.id] : 0,
    }));

    try {
      const submitRes = await api.submitCheckpoint(moduleId, submissionAnswers);
      setResult(submitRes);
      success('Roadmap updated.');
    } catch (err) {
      toastError(err.message || 'Failed to submit checkpoint.');
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, questions, answers, moduleId, success, toastError]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showConfirmModal || result) return;

      if (e.target && (e.target.tagName === 'BUTTON' || e.target.tagName === 'A')) {
        return;
      }

      if (currentQuestion && /^[1-9]$/.test(e.key)) {
        const optionNum = Number(e.key);
        if (optionNum >= 1 && optionNum <= currentQuestion.options.length) {
          e.preventDefault();
          handleSelectOption(currentQuestion.id, optionNum - 1);
        }
      }

      if (e.key === 'Enter') {
        e.preventDefault();
        if (currentIndex < totalQuestions - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else if (isAllAnswered) {
          setShowConfirmModal(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    showConfirmModal,
    result,
    currentQuestion,
    currentIndex,
    totalQuestions,
    isAllAnswered,
    handleSelectOption,
  ]);

  if (!isCheckpointEnabled) {
    return null;
  }

  // 1. Loading State
  if (loading) {
    return (
      <main id="main-content" className="pf-checkpoint-page" aria-busy="true">
        <div className="pf-checkpoint-header">
          <Skeleton width="160px" height="26px" />
          <Skeleton width="60%" height="34px" />
          <Skeleton lines={2} />
        </div>
        <div className="pf-checkpoint-progress-card">
          <Skeleton width="100%" height="16px" />
        </div>
        <div className="pf-checkpoint-quiz-wrapper">
          <Skeleton width="40%" height="24px" style={{ marginBottom: '16px' }} />
          <Skeleton lines={4} height="52px" />
        </div>
      </main>
    );
  }

  // 2. Error State
  if (error) {
    return (
      <main id="main-content" className="pf-checkpoint-page">
        <ErrorState
          title="Checkpoint Assessment Unavailable"
          message={
            error.message || 'Unable to load checkpoint questions. Please try again.'
          }
          onRetry={handleRetry}
          retryLabel="Try Again"
        />
      </main>
    );
  }

  // 3. Result Screen Presentation
  if (result) {
    const isReplanned = Boolean(result.replanned);
    let replanBadgeText = 'No changes';
    if (result.score >= 80) {
      replanBadgeText = 'Roadmap updated: 1 module skipped / fast-tracked';
    } else if (result.score < 50) {
      replanBadgeText = 'Roadmap updated: 1 reinforcement module added';
    }

    return (
      <main id="main-content" className="pf-checkpoint-page">
        <section className="pf-checkpoint-result-card" aria-labelledby="result-heading">
          <div className="pf-checkpoint-result-score-circle">
            <span className="pf-checkpoint-result-score-number">{result.score}%</span>
            <span className="pf-checkpoint-result-score-label">Score</span>
          </div>

          <div className="pf-checkpoint-result-info">
            <h1 id="result-heading" className="pf-checkpoint-result-title">
              Checkpoint Complete
            </h1>

            <span
              className={`pf-checkpoint-replan-badge ${isReplanned ? 'pf-checkpoint-replan-badge--replanned' : 'pf-checkpoint-replan-badge--standard'}`}
            >
              {isReplanned ? '⚡' : '✓'} {replanBadgeText}
            </span>
          </div>

          <div className="pf-checkpoint-change-summary">
            <strong>Curriculum Evaluation:</strong>
            <p style={{ margin: '6px 0 0' }}>
              {result.changeSummary ||
                'Your checkpoint assessment responses have been evaluated against employer benchmarks.'}
            </p>
          </div>

          <div className="pf-checkpoint-result-actions">
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={() =>
                navigate('/dashboard', {
                  state: { updatedModuleId: moduleId },
                })
              }
            >
              Return to Curriculum Dashboard
            </Button>
          </div>
        </section>
      </main>
    );
  }

  // 4. Empty State Guard
  if (totalQuestions === 0) {
    return (
      <main id="main-content" className="pf-checkpoint-page">
        <EmptyState
          title="No Checkpoint Questions"
          message="There are no checkpoint assessment questions configured for this module."
          action={
            <Button variant="primary" onClick={() => navigate('/dashboard')}>
              Back to Dashboard
            </Button>
          }
        />
      </main>
    );
  }

  // 5. Quiz Assessment Presentation
  return (
    <main id="main-content" className="pf-checkpoint-page">
      {/* Header & Meta */}
      <header className="pf-checkpoint-header">
        <div className="pf-checkpoint-header__badge-row">
          <span className="pf-checkpoint-module-badge">
            <span aria-hidden="true">🎯</span> {moduleTitle}
          </span>
          <span className="pf-checkpoint-hint-badge" aria-hidden="true">
            ⌨️ 1-4 keys to pick, Enter to advance
          </span>
        </div>
        <h1 className="pf-checkpoint-title">{checkpointTitle}</h1>
        <p className="pf-checkpoint-description">
          Verify your mastery of key concepts from this module. High performance may
          fast-track advanced curriculum milestones!
        </p>
      </header>

      {/* Progress & Navigator */}
      <section className="pf-checkpoint-progress-card" aria-label="Checkpoint Progress">
        <ProgressBar
          value={answeredCount}
          max={totalQuestions}
          label={`Question ${currentIndex + 1} of ${totalQuestions}`}
          showValueText={true}
        />

        <nav className="pf-checkpoint-navigator" aria-label="Question Navigator">
          <span className="pf-checkpoint-navigator__label">
            Questions ({answeredCount}/{totalQuestions} answered)
          </span>
          <div className="pf-checkpoint-navigator__dots" role="list">
            {questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined;
              const isActive = idx === currentIndex;
              const dotClass = [
                'pf-checkpoint-nav-dot',
                isActive ? 'pf-checkpoint-nav-dot--active' : '',
                isAnswered ? 'pf-checkpoint-nav-dot--answered' : '',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <button
                  key={q.id}
                  type="button"
                  className={dotClass}
                  onClick={() => jumpToQuestion(idx)}
                  aria-label={`Question ${idx + 1}: ${isAnswered ? 'Answered' : 'Unanswered'}${isActive ? ', Current Question' : ''}`}
                  aria-current={isActive ? 'step' : undefined}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </nav>
      </section>

      {/* Active Question */}
      <section
        ref={questionCardRef}
        className="pf-checkpoint-quiz-wrapper"
        aria-live="polite"
      >
        {currentQuestion && (
          <QuizQuestion
            questionId={currentQuestion.id}
            questionNumber={currentIndex + 1}
            questionText={currentQuestion.text || currentQuestion.question}
            options={currentQuestion.options}
            selectedIndex={answers[currentQuestion.id] ?? null}
            onSelectOption={(idx) => handleSelectOption(currentQuestion.id, idx)}
          />
        )}
      </section>

      {/* Unanswered Banner on Last Question */}
      {isLastQuestion && unansweredIndices.length > 0 && (
        <aside
          className="pf-checkpoint-unanswered-banner"
          role="alert"
          aria-live="polite"
        >
          <div className="pf-checkpoint-unanswered-banner__header">
            <span aria-hidden="true">⚠️</span>
            <span>
              {unansweredIndices.length} Question
              {unansweredIndices.length > 1 ? 's' : ''} Remaining
            </span>
          </div>
          <p style={{ margin: '4px 0 0', fontSize: 'var(--font-size-sm)' }}>
            Please answer all questions before submitting your checkpoint:
          </p>
          <div
            style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}
          >
            {unansweredIndices.map((uIdx) => (
              <button
                key={uIdx}
                type="button"
                className="pf-checkpoint-jump-chip"
                onClick={() => jumpToQuestion(uIdx)}
                aria-label={`Jump to unanswered question ${uIdx + 1}`}
              >
                Go to Question {uIdx + 1}
              </button>
            ))}
          </div>
        </aside>
      )}

      {/* Actions Footer Bar */}
      <footer className="pf-checkpoint-actions">
        <div className="pf-checkpoint-actions__left">
          <Button
            type="button"
            variant="secondary"
            size="md"
            disabled={currentIndex === 0}
            onClick={() => jumpToQuestion(currentIndex - 1)}
            aria-label="Previous question"
          >
            ← Previous
          </Button>
        </div>

        <div className="pf-checkpoint-actions__right">
          {!isLastQuestion ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => jumpToQuestion(currentIndex + 1)}
              aria-label="Next question"
            >
              Next →
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              size="md"
              disabled={!isAllAnswered || isSubmitting}
              loading={isSubmitting}
              onClick={() => setShowConfirmModal(true)}
              aria-label="Submit checkpoint assessment"
            >
              Submit Checkpoint
            </Button>
          )}
        </div>
      </footer>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Submit Checkpoint Assessment?"
        size="md"
        role="dialog"
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              size="md"
              disabled={isSubmitting}
              onClick={() => setShowConfirmModal(false)}
            >
              Review Answers
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              disabled={isSubmitting}
              loading={isSubmitting}
              onClick={handleConfirmSubmit}
            >
              Confirm & Submit
            </Button>
          </>
        }
      >
        <p>
          You are about to submit your checkpoint responses for{' '}
          <strong>{moduleTitle}</strong>.
        </p>
        <p>
          Your answers will be analyzed to calibrate your curriculum pace and dynamically
          adjust upcoming modules.
        </p>
      </Modal>
    </main>
  );
}
