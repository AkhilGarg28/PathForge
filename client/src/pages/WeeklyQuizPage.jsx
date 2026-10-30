import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout.jsx';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Spinner } from '../components/Spinner.jsx';
import { ProgressBar } from '../components/ProgressBar.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';

export function WeeklyQuizPage() {
  const { weekNumber } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const weekNum = Number(weekNumber) || 1;
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [answers, setAnswers] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submissionResult, setSubmissionResult] = useState(null);

  useEffect(() => {
    loadQuiz();
  }, [weekNum]);

  const loadQuiz = async () => {
    try {
      setLoading(true);
      const res = await api.getWeeklyQuiz(weekNum);
      if (res.data) {
        setQuiz(res.data);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load weekly quiz', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qId, optIdx) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: optIdx
    }));
  };

  const handleSubmit = async () => {
    const questions = quiz?.questions || [];
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < questions.length) {
      const confirmed = window.confirm(
        `You have answered ${answeredCount} of ${questions.length} questions. Submit anyway?`
      );
      if (!confirmed) return;
    }

    try {
      setSubmitting(true);
      const res = await api.submitWeeklyQuiz({
        weekNumber: weekNum,
        answers
      });
      setSubmissionResult(res.data);
      showToast('Weekly assessment evaluated! Roadmap automatically updated.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to submit quiz', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <Spinner size="lg" />
          <p style={{ marginTop: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>
            Generating dynamic Week {weekNum} adaptive assessment...
          </p>
        </div>
      </Layout>
    );
  }

  // --- RESULTS VIEW (AFTER SUBMISSION) ---
  if (submissionResult) {
    const isPassed = submissionResult.passed;
    const score = submissionResult.scorePercent;
    const reviewQuestions = submissionResult.reviewQuestions || [];

    return (
      <Layout>
        <div style={{ maxWidth: '820px', margin: '0 auto', padding: 'var(--space-6) var(--space-4)' }}>
          {/* Result Score Card */}
          <Card>
            <div style={{ textAlign: 'center', padding: 'var(--space-4)' }}>
              <span
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  color: isPassed ? 'var(--color-success)' : 'var(--color-warning, #f59e0b)',
                  letterSpacing: '0.05em'
                }}
              >
                Week {weekNum} Assessment Evaluation
              </span>
              <h1 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '10px 0' }}>
                Score: {score}%
              </h1>
              <div
                style={{
                  display: 'inline-block',
                  padding: '6px 16px',
                  borderRadius: '9999px',
                  backgroundColor: isPassed ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  color: isPassed ? '#16a34a' : '#dc2626',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  marginBottom: 'var(--space-4)'
                }}
              >
                {submissionResult.performanceCategory}
              </div>
              <p style={{ color: 'var(--color-text-secondary)', maxWidth: '580px', margin: '0 auto' }}>
                {submissionResult.feedbackMessage}
              </p>
            </div>
          </Card>

          {/* DYNAMIC ROADMAP ADJUSTMENT BANNER (Phase 5 Requirement) */}
          <div
            style={{
              margin: 'var(--space-4) 0',
              padding: 'var(--space-4)',
              borderRadius: 'var(--radius-lg)',
              backgroundColor: 'var(--color-primary-subtle)',
              border: '2px solid var(--color-primary)',
              animation: 'pulse 2s infinite'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
              <span style={{ fontSize: '1.75rem', lineHeight: 1 }}>🔄</span>
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-primary)', margin: '0 0 4px' }}>
                  Automatic Roadmap Adaptation Triggered
                </h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-primary)', margin: 0 }}>
                  {submissionResult.roadmapActionTaken}
                </p>
              </div>
            </div>
          </div>

          {/* Weak & Strong Topics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            {submissionResult.weakTopics?.length > 0 && (
              <Card>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#f59e0b', margin: '0 0 8px' }}>
                  Areas Targeted for Reinforcement
                </h4>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  {submissionResult.weakTopics.map((t, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{t}</li>
                  ))}
                </ul>
              </Card>
            )}

            {submissionResult.strongTopics?.length > 0 && (
              <Card>
                <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--color-success)', margin: '0 0 8px' }}>
                  Demonstrated Mastery
                </h4>
                <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>
                  {submissionResult.strongTopics.map((t, i) => (
                    <li key={i} style={{ marginBottom: '4px' }}>{t}</li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          {/* Detailed Question Review */}
          <Card>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: 'var(--space-4)' }}>
              Comprehensive Answers Review
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {reviewQuestions.map((q, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: 'var(--space-4)',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg-base)',
                    border: q.isCorrect ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(239, 68, 68, 0.4)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '1rem' }}>{q.isCorrect ? '✅' : '❌'}</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: q.isCorrect ? '#16a34a' : '#dc2626' }}>
                      {q.isCorrect ? 'Correct' : 'Incorrect'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>• {q.topic}</span>
                  </div>

                  <p style={{ fontWeight: 600, fontSize: '0.95rem', margin: '4px 0 8px' }}>
                    {idx + 1}. {q.question}
                  </p>

                  {q.codeSnippet && (
                    <pre
                      style={{
                        backgroundColor: '#0f172a',
                        color: '#38bdf8',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.85rem',
                        overflowX: 'auto',
                        margin: '8px 0'
                      }}
                    >
                      {q.codeSnippet}
                    </pre>
                  )}

                  <div style={{ fontSize: '0.85rem', margin: '8px 0' }}>
                    <div>
                      Your Answer: <strong style={{ color: q.isCorrect ? '#16a34a' : '#dc2626' }}>{q.options[q.userAnswerIndex] || 'None'}</strong>
                    </div>
                    {!q.isCorrect && (
                      <div style={{ marginTop: '2px' }}>
                        Correct Answer: <strong style={{ color: '#16a34a' }}>{q.options[q.correctIndex]}</strong>
                      </div>
                    )}
                  </div>

                  {q.explanation && (
                    <div
                      style={{
                        marginTop: '8px',
                        padding: '8px 12px',
                        backgroundColor: 'var(--color-bg-surface)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.8rem',
                        color: 'var(--color-text-secondary)',
                        borderLeft: '3px solid var(--color-primary)'
                      }}
                    >
                      <strong>Explanation:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: 'var(--space-6)' }}>
              <Button variant="primary" size="lg" onClick={() => navigate('/dashboard')}>
                Return to My Learning Roadmap →
              </Button>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  // --- QUIZ TAKING VIEW ---
  const questions = quiz?.questions || [];
  if (questions.length === 0) {
    return (
      <Layout>
        <div style={{ maxWidth: '600px', margin: 'var(--space-8) auto', textAlign: 'center' }}>
          <Card>
            <h2>No Questions Available for Week {weekNum}</h2>
            <Button variant="primary" onClick={() => navigate('/dashboard')} style={{ marginTop: 'var(--space-4)' }}>
              Back to Dashboard
            </Button>
          </Card>
        </div>
      </Layout>
    );
  }

  const currentQ = questions[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <Layout>
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: 'var(--space-6) var(--space-4)' }}>
        {/* Header */}
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span
              style={{
                fontSize: '0.8rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                color: 'var(--color-primary)',
                letterSpacing: '0.05em'
              }}
            >
              Week {weekNum} Quiz • Question {currentIndex + 1} of {questions.length}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              {currentQ.skill} • {currentQ.topic}
            </span>
          </div>
          <ProgressBar progress={progressPercent} />
        </div>

        {/* Question Card */}
        <Card>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.4, margin: '8px 0' }}>
              {currentQ.question}
            </h2>

            {currentQ.codeSnippet && (
              <pre
                style={{
                  backgroundColor: '#0f172a',
                  color: '#38bdf8',
                  padding: 'var(--space-4)',
                  borderRadius: 'var(--radius-md)',
                  fontFamily: 'monospace',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  overflowX: 'auto',
                  border: '1px solid #1e293b',
                  margin: 'var(--space-3) 0'
                }}
              >
                {currentQ.codeSnippet}
              </pre>
            )}
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {currentQ.options.map((opt, idx) => {
              const isSelected = answers[currentQ.id] === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(currentQ.id, idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '12px 16px',
                    borderRadius: 'var(--radius-lg)',
                    border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                    backgroundColor: isSelected ? 'var(--color-primary-subtle)' : 'var(--color-bg-base)',
                    color: isSelected ? 'var(--color-primary)' : 'var(--color-text-primary)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    fontSize: '0.95rem',
                    fontWeight: isSelected ? 600 : 400,
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-border)',
                      marginRight: '12px',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                      color: isSelected ? '#ffffff' : 'var(--color-text-muted)'
                    }}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span>{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: 'var(--space-6)',
              borderTop: '1px solid var(--color-border)',
              paddingTop: 'var(--space-4)'
            }}
          >
            <Button
              variant="ghost"
              disabled={currentIndex === 0 || submitting}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            >
              ← Previous
            </Button>

            {currentIndex < questions.length - 1 ? (
              <Button
                variant="primary"
                onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
              >
                Next Question →
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={submitting}
                style={{ backgroundColor: 'var(--color-success)', borderColor: 'var(--color-success)' }}
              >
                {submitting ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Spinner size="sm" /> Evaluating & Adapting...
                  </span>
                ) : (
                  'Submit Assessment'
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
}

export default WeeklyQuizPage;
