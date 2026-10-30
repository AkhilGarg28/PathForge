import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import * as api from '../services/api.js';
import { useRoadmapGeneration } from '../hooks/useRoadmapGeneration.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import Button from '../components/Button.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import Skeleton from '../components/Skeleton.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ErrorState from '../components/ErrorState.jsx';
import QuizQuestion from '../components/QuizQuestion.jsx';
import './DiagnosticPage.css';

function getRoleTitle(id, rolesList = []) {
  const match = rolesList.find((r) => r.id === id);
  if (match?.title) return match.title;
  if (id === 'mern-developer') return 'MERN Developer';
  if (id === 'data-analyst') return 'Data Analyst';
  return id
    ? id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    : 'Target Role';
}

export default function DiagnosticPage() {
  const { roleId } = useParams();
  const navigate = useNavigate();
  const { startGeneration } = useRoadmapGeneration();
  usePageTitle('Skill Diagnostic Assessment');

  const [questions, setQuestions] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Restore answers from sessionStorage per roleId
  const [answers, setAnswers] = useState(() => {
    try {
      const stored = sessionStorage.getItem(`pathforge_diagnostic_${roleId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && typeof parsed === 'object') {
          return parsed;
        }
      }
    } catch {
      // Ignore sessionStorage read failure
    }
    return {};
  });

  const questionCardRef = useRef(null);

  // Fetch assessment questions and roles
  const loadData = useCallback(() => {
    let isCancelled = false;

    Promise.all([api.getDiagnostic(roleId), api.getRoles().catch(() => ({ roles: [] }))])
      .then(([diagRes, rolesRes]) => {
        if (!isCancelled) {
          setQuestions(diagRes.questions || []);
          setRoles(rolesRes.roles || []);
          setError(null);
        }
      })
      .catch((err) => {
        if (!isCancelled) {
          setError(err);
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [roleId]);

  const handleRetry = useCallback(() => {
    setLoading(true);
    loadData();
  }, [loadData]);

  useEffect(() => {
    const cleanup = loadData();
    return cleanup;
  }, [loadData]);

  // Persist answer change to state & sessionStorage
  const handleSelectOption = useCallback(
    (questionId, optionIndex) => {
      setAnswers((prev) => {
        const next = { ...prev, [questionId]: optionIndex };
        try {
          sessionStorage.setItem(`pathforge_diagnostic_${roleId}`, JSON.stringify(next));
        } catch {
          // Ignore storage error
        }
        return next;
      });
    },
    [roleId],
  );

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
  const roleTitle = useMemo(() => getRoleTitle(roleId, roles), [roleId, roles]);

  // Submit action: clear storage, start async generation in context, and navigate to /generating
  const handleConfirmSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setShowConfirmModal(false);

    const submissionAnswers = questions.map((q) => ({
      questionId: q.id,
      selectedIndex: answers[q.id] !== undefined ? answers[q.id] : 0,
    }));

    try {
      sessionStorage.removeItem(`pathforge_diagnostic_${roleId}`);
    } catch {
      // Ignore
    }

    try {
      startGeneration({ roleId, answers: submissionAnswers }).catch(() => {
        // GeneratingPage will display error and handle retry
      });
      navigate('/generating');
    } catch {
      setIsSubmitting(false);
    }
  }, [answers, questions, roleId, startGeneration, navigate]);

  // Keyboard navigation: 1-5 keys to pick option, Enter to advance / submit, Escape for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (showConfirmModal) {
        if (e.key === 'Escape') {
          setShowConfirmModal(false);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          handleConfirmSubmit();
        }
        return;
      }

      // If user is actively typing inside an input/button, allow native handling
      if (e.target && (e.target.tagName === 'BUTTON' || e.target.tagName === 'A')) {
        return;
      }

      // 1-5 number keys select option for current question
      if (currentQuestion && /^[1-9]$/.test(e.key)) {
        const optionNum = Number(e.key);
        if (optionNum >= 1 && optionNum <= currentQuestion.options.length) {
          e.preventDefault();
          handleSelectOption(currentQuestion.id, optionNum - 1);
        }
      }

      // Enter advances to next or opens confirmation on last
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
    currentQuestion,
    currentIndex,
    totalQuestions,
    isAllAnswered,
    handleConfirmSubmit,
    handleSelectOption,
  ]);

  // Scroll to question card smoothly on question jump
  const jumpToQuestion = (index) => {
    setCurrentIndex(index);
    if (questionCardRef.current) {
      questionCardRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  };

  // 1. Loading State
  if (loading) {
    return (
      <main id="main-content" className="pf-diagnostic-page" aria-busy="true">
        <div className="pf-diagnostic-header">
          <Skeleton width="140px" height="28px" />
          <Skeleton width="60%" height="36px" />
          <Skeleton lines={2} />
        </div>
        <div className="pf-diagnostic-progress-card">
          <Skeleton width="100%" height="16px" />
          <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} width="44px" height="44px" />
            ))}
          </div>
        </div>
        <div className="pf-diagnostic-quiz-wrapper">
          <Skeleton width="40%" height="24px" style={{ marginBottom: '16px' }} />
          <Skeleton lines={4} height="52px" style={{ marginBottom: '12px' }} />
        </div>
      </main>
    );
  }

  // 2. Error State
  if (error) {
    const isNotFound = error.status === 404 || error.code === 'ROLE_NOT_FOUND';
    return (
      <main id="main-content" className="pf-diagnostic-page">
        <ErrorState
          title={isNotFound ? 'Role Not Found' : 'Assessment Unavailable'}
          message={
            isNotFound
              ? `We could not find diagnostic questions for "${roleId}". The role may not exist or has been updated.`
              : error.message || 'Unable to load diagnostic questions. Please try again.'
          }
          onRetry={isNotFound ? () => navigate('/role-selection') : handleRetry}
          retryLabel={isNotFound ? 'Browse Available Roles' : 'Try Again'}
        />
      </main>
    );
  }

  // 3. Empty State
  if (totalQuestions === 0) {
    return (
      <main id="main-content" className="pf-diagnostic-page">
        <EmptyState
          title="No Questions Available"
          message="There are no assessment questions configured for this role at the moment."
          action={
            <Button variant="primary" onClick={() => navigate('/role-selection')}>
              Back to Role Selection
            </Button>
          }
        />
      </main>
    );
  }

  return (
    <main id="main-content" className="pf-diagnostic-page">
      {/* Header & Meta */}
      <header className="pf-diagnostic-header">
        <div className="pf-diagnostic-header__badge-row">
          <span className="pf-diagnostic-role-badge">
            <span aria-hidden="true">🎯</span> {roleTitle}
          </span>
          <span className="pf-diagnostic-hint-badge" aria-hidden="true">
            ⌨️ 1-5 keys to pick, Enter to advance
          </span>
        </div>
        <h1 className="pf-diagnostic-title">Diagnostic Assessment</h1>
        <p className="pf-diagnostic-description">
          Answer {totalQuestions} self-assessment questions to evaluate your proficiency
          across essential dimensions. Your answers will tailor your custom roadmap.
        </p>
      </header>

      {/* Progress & Navigator */}
      <section className="pf-diagnostic-progress-card" aria-label="Assessment Progress">
        <ProgressBar
          value={answeredCount}
          max={totalQuestions}
          label={`Question ${currentIndex + 1} of ${totalQuestions}`}
          showValueText={true}
        />

        {/* Question Navigator */}
        <nav className="pf-diagnostic-navigator" aria-label="Question Navigator">
          <span className="pf-diagnostic-navigator__label">
            Questions ({answeredCount}/{totalQuestions} answered)
          </span>
          <div className="pf-diagnostic-navigator__dots" role="list">
            {questions.map((q, idx) => {
              const isAnswered = answers[q.id] !== undefined;
              const isActive = idx === currentIndex;
              const dotClass = [
                'pf-diagnostic-nav-dot',
                isActive ? 'pf-diagnostic-nav-dot--active' : '',
                isAnswered ? 'pf-diagnostic-nav-dot--answered' : '',
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
                  {isAnswered && !isActive && (
                    <span className="pf-diagnostic-nav-dot__badge" aria-hidden="true" />
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      </section>

      {/* Active Question */}
      <section
        ref={questionCardRef}
        className="pf-diagnostic-quiz-wrapper"
        aria-live="polite"
      >
        {currentQuestion && (
          <QuizQuestion
            questionId={currentQuestion.id}
            questionNumber={currentIndex + 1}
            questionText={currentQuestion.text || currentQuestion.question}
            subtitle={currentQuestion.dimension}
            options={currentQuestion.options}
            selectedIndex={answers[currentQuestion.id] ?? null}
            onSelectOption={(idx) => handleSelectOption(currentQuestion.id, idx)}
          />
        )}
      </section>

      {/* Unanswered Banner on Last Question */}
      {isLastQuestion && unansweredIndices.length > 0 && (
        <aside
          className="pf-diagnostic-unanswered-banner"
          role="alert"
          aria-live="polite"
        >
          <div className="pf-diagnostic-unanswered-banner__header">
            <span aria-hidden="true">⚠️</span>
            <span>
              {unansweredIndices.length} Question
              {unansweredIndices.length > 1 ? 's' : ''} Remaining
            </span>
          </div>
          <p className="pf-diagnostic-unanswered-banner__text">
            Please answer all diagnostic questions before submitting your assessment:
          </p>
          <div className="pf-diagnostic-unanswered-banner__chips">
            {unansweredIndices.map((uIdx) => (
              <button
                key={uIdx}
                type="button"
                className="pf-diagnostic-jump-chip"
                onClick={() => jumpToQuestion(uIdx)}
                aria-label={`Jump to unanswered question ${uIdx + 1}`}
              >
                Go to Question {uIdx + 1} ({questions[uIdx].dimension})
              </button>
            ))}
          </div>
        </aside>
      )}

      {/* Actions Bar */}
      <footer className="pf-diagnostic-actions">
        <div className="pf-diagnostic-actions__left">
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

        <div className="pf-diagnostic-actions__right">
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
              aria-label="Submit diagnostic assessment"
            >
              Submit Assessment
            </Button>
          )}
        </div>
      </footer>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div
          className="pf-diagnostic-modal-backdrop"
          onClick={() => setShowConfirmModal(false)}
        >
          <div
            className="pf-diagnostic-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-modal-title"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="pf-diagnostic-modal__header">
              <div className="pf-diagnostic-modal__icon" aria-hidden="true">
                🚀
              </div>
              <div className="pf-diagnostic-modal__title-group">
                <h2 id="confirm-modal-title" className="pf-diagnostic-modal__title">
                  Ready to Submit?
                </h2>
                <p className="pf-diagnostic-modal__subtitle">
                  Generate your personalized {roleTitle} roadmap
                </p>
              </div>
            </div>

            <div className="pf-diagnostic-modal__summary">
              <div>
                <strong>Completed:</strong> {totalQuestions} of {totalQuestions} questions
                answered.
              </div>
              <div>
                PathForge will analyze your skill proficiency across all evaluated
                dimensions and craft a step-by-step roadmap tailored to your gaps.
              </div>
            </div>

            <div className="pf-diagnostic-modal__actions">
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
                Yes, Generate Roadmap
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
