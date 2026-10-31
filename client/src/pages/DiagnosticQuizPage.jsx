import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout.jsx';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Spinner } from '../components/Spinner.jsx';
import { ProgressBar } from '../components/ProgressBar.jsx';
import { QuizQuestion } from '../components/QuizQuestion.jsx';
import { ErrorState } from '../components/ErrorState.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { api } from '../services/api.js';

export function DiagnosticQuizPage() {
  usePageTitle('Skill Diagnostic');
  const { user, loading: authLoading } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [roleInfo, setRoleInfo] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionId]: selectedIndex }
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const submittingRef = useRef(false);

  // Storage keys scoped to user's role
  const storageKey = user?.roleId
    ? `pathforge_diagnostic_answers_${user.roleId}`
    : 'pathforge_diagnostic_answers';
  const indexStorageKey = user?.roleId
    ? `pathforge_diagnostic_index_${user.roleId}`
    : 'pathforge_diagnostic_index';

  // Load saved answers from sessionStorage
  useEffect(() => {
    if (authLoading) return;
    try {
      const savedAnswers =
        sessionStorage.getItem(storageKey) ||
        sessionStorage.getItem('pathforge_diagnostic_answers');
      if (savedAnswers) {
        setAnswers(JSON.parse(savedAnswers));
      }
      const savedIdx =
        sessionStorage.getItem(indexStorageKey) ||
        sessionStorage.getItem('pathforge_diagnostic_index');
      if (savedIdx !== null) {
        const parsed = parseInt(savedIdx, 10);
        if (!isNaN(parsed) && parsed >= 0) {
          setCurrentIndex(parsed);
        }
      }
    } catch {
      // Ignore storage parse errors
    }
  }, [storageKey, indexStorageKey, authLoading]);

  const fetchQuestions = async () => {
    if (authLoading) return;
    if (!user?.roleId) {
      navigate('/roles');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const targetRoleId = user?.roleId || 'current';
      const res = await api.getDiagnostic(targetRoleId);
      const data = res?.data || {};
      const fetchedQuestions = data.questions || [];
      setQuestions(fetchedQuestions);
      setRoleInfo(data);

      // Clamp index if out of range
      if (fetchedQuestions.length > 0) {
        setCurrentIndex((prev) => Math.min(prev, fetchedQuestions.length - 1));
      }
    } catch (err) {
      setError(err.message || 'Failed to load diagnostic assessment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      fetchQuestions();
    }
  }, [user?.roleId, authLoading]);

  const handleSelectOption = (index) => {
    const currentQ = questions[currentIndex];
    if (!currentQ || isSubmitting) return;

    setAnswers((prev) => {
      const updated = {
        ...prev,
        [currentQ.id]: index
      };
      try {
        sessionStorage.setItem(storageKey, JSON.stringify(updated));
      } catch {
        // Ignore storage errors
      }
      return updated;
    });
  };

  const handleGoToIndex = (targetIndex) => {
    if (isSubmitting || targetIndex < 0 || targetIndex >= questions.length) return;
    setCurrentIndex(targetIndex);
    try {
      sessionStorage.setItem(indexStorageKey, String(targetIndex));
    } catch {
      // Ignore storage errors
    }
  };

  const answeredCount = Object.keys(answers).length;
  const totalCount = questions.length;
  const allAnswered = totalCount > 0 && answeredCount === totalCount;
  const currentQ = questions[currentIndex];
  const isLastQuestion = currentIndex === totalCount - 1;

  const navigateToGenerating = (payloadAnswers) => {
    try {
      sessionStorage.setItem(
        'pathforge_pending_submission',
        JSON.stringify({
          roleId: user.roleId,
          answers: payloadAnswers
        })
      );
    } catch {
      // Ignore storage errors
    }

    navigate('/generating', {
      state: {
        roleId: user.roleId,
        answers: payloadAnswers
      }
    });
  };

  const handleSubmit = (e) => {
    if (e) e.preventDefault();

    // Prevent double-click submissions
    if (submittingRef.current || isSubmitting) return;

    if (!allAnswered) {
      const unansweredCount = totalCount - answeredCount;
      const confirmEarly = window.confirm(
        `You have ${unansweredCount} unanswered question(s). Unanswered questions will receive 0 points. Do you want to submit anyway?`
      );
      if (!confirmEarly) return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);

    const payloadAnswers = questions
      .map((q) => ({
        questionId: q.id,
        selectedIndex: answers[q.id] !== undefined ? answers[q.id] : -1
      }))
      .filter((a) => a.selectedIndex >= 0);

    navigateToGenerating(payloadAnswers);
  };

  return (
    <Layout maxWidth="780px">
      <div style={{ padding: 'var(--space-4) 0 var(--space-8)' }}>
        {authLoading || loading ? (
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
              Preparing your diagnostic assessment...
            </span>
          </div>
        ) : error ? (
          <ErrorState title="Unable to Load Diagnostic" message={error} onRetry={fetchQuestions} />
        ) : questions.length === 0 ? (
          <ErrorState
            title="No Questions Found"
            message="We could not find questions for your target career role. Please choose another path."
            onRetry={() => navigate('/roles')}
          />
        ) : (
          <div>
            {/* Header and Progress Indicator */}
            <div style={{ marginBottom: 'var(--space-4)' }}>
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 'var(--space-1)',
                  gap: 'var(--space-1)'
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: 'var(--color-primary-700)',
                      backgroundColor: 'var(--color-primary-50)',
                      padding: '4px 10px',
                      borderRadius: 'var(--radius-full)',
                      border: '1px solid var(--color-primary-200)'
                    }}
                  >
                    Step 2 of 3: Skill Diagnostic
                  </span>
                  <h1
                    style={{
                      fontSize: '1.5rem',
                      fontWeight: 800,
                      color: 'var(--color-neutral-900)',
                      marginTop: 'var(--space-1)'
                    }}
                  >
                    {roleInfo?.roleName || 'Technical'} Baseline Assessment
                  </h1>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 700,
                      color: 'var(--color-primary)'
                    }}
                  >
                    {answeredCount} of {totalCount} Answered
                  </span>
                </div>
              </div>

              {/* Progress Bar (Strictly Amber) */}
              <ProgressBar
                value={answeredCount}
                max={totalCount}
                showPercentage={false}
                height="8px"
              />
            </div>

            {/* Quick-Jump Step Pills */}
            <div
              style={{
                display: 'flex',
                gap: '6px',
                flexWrap: 'wrap',
                marginBottom: 'var(--space-3)'
              }}
            >
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = idx === currentIndex;

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => handleGoToIndex(idx)}
                    disabled={isSubmitting}
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: 'var(--radius-md)',
                      border: isCurrent
                        ? '2px solid var(--color-primary)'
                        : isAnswered
                          ? '1px solid var(--color-primary-300)'
                          : '1px solid var(--color-border)',
                      backgroundColor: isCurrent
                        ? 'var(--color-primary-100)'
                        : isAnswered
                          ? 'var(--color-primary-50)'
                          : 'var(--color-surface)',
                      color: isCurrent
                        ? 'var(--color-primary-900)'
                        : isAnswered
                          ? 'var(--color-primary-700)'
                          : 'var(--color-text-muted)',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      cursor: isSubmitting ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.15s ease'
                    }}
                    title={`Question ${idx + 1}: ${isAnswered ? 'Answered' : 'Unanswered'}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Single Question Card */}
            <Card style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              {currentQ && (
                <QuizQuestion
                  question={currentQ}
                  questionNumber={currentIndex + 1}
                  totalQuestions={totalCount}
                  selectedIndex={answers[currentQ.id]}
                  onSelectOption={handleSelectOption}
                  disabled={isSubmitting}
                />
              )}
            </Card>

            {/* Incomplete Notice if questions remaining */}
            {!allAnswered && (
              <div
                style={{
                  backgroundColor: 'var(--color-surface-subtle)',
                  border: '1px solid var(--color-border)',
                  padding: 'var(--space-1) var(--space-2)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                  color: 'var(--color-text-muted)',
                  marginBottom: 'var(--space-3)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span>
                  <strong>{totalCount - answeredCount}</strong> question(s) remaining to complete
                  all dimensions.
                </span>
                <button
                  type="button"
                  onClick={handleSubmit}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-primary)',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Submit early anyway
                </button>
              </div>
            )}

            {/* Navigation and Submission Action Controls */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Button
                variant="outline"
                size="md"
                onClick={() => handleGoToIndex(currentIndex - 1)}
                disabled={currentIndex === 0 || isSubmitting}
              >
                ← Previous
              </Button>

              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                {!isLastQuestion ? (
                  <Button
                    variant="secondary"
                    size="md"
                    onClick={() => handleGoToIndex(currentIndex + 1)}
                    disabled={isSubmitting}
                  >
                    Next Question →
                  </Button>
                ) : null}

                {/* Submit button is disabled until all questions are answered */}
                <Button
                  variant="primary"
                  size="md"
                  loading={isSubmitting}
                  disabled={!allAnswered || isSubmitting}
                  onClick={handleSubmit}
                >
                  Submit Diagnostic
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default DiagnosticQuizPage;
