import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout.jsx';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Spinner } from '../components/Spinner.jsx';
import { ProgressBar } from '../components/ProgressBar.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { api } from '../services/api.js';

export function ReadinessAssessmentPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    try {
      setLoading(true);
      const res = await api.getReadinessQuestions();
      if (res.data?.questions) {
        setQuestions(res.data.questions);
      }
    } catch (err) {
      showToast(err.message || 'Failed to load readiness questions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (questionId, optionIndex) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleSubmit = async () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < questions.length) {
      const confirmSubmit = window.confirm(
        `You have answered ${answeredCount} of ${questions.length} questions. Are you sure you want to submit?`
      );
      if (!confirmSubmit) return;
    }

    try {
      setSubmitting(true);
      const res = await api.submitReadinessAssessment({ answers });
      showToast('Assessment evaluated successfully!', 'success');
      navigate('/readiness/report', { state: { result: res.data } });
    } catch (err) {
      showToast(err.message || 'Failed to submit assessment', 'error');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ textAlign: 'center', padding: 'var(--space-12)' }}>
          <Spinner size="lg" />
          <p style={{ marginTop: 'var(--space-4)', color: 'var(--color-text-secondary)' }}>
            Calibrating your multi-skill readiness assessment...
          </p>
        </div>
      </Layout>
    );
  }

  if (questions.length === 0) {
    return (
      <Layout>
        <div style={{ maxWidth: '600px', margin: 'var(--space-8) auto', textAlign: 'center' }}>
          <Card>
            <h2>No Assessment Questions Available</h2>
            <p style={{ color: 'var(--color-text-muted)', margin: 'var(--space-4) 0' }}>
              Please complete onboarding or check your network connection.
            </p>
            <Button variant="primary" onClick={() => navigate('/onboarding')}>
              Return to Onboarding
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
        {/* Header with Progress */}
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
              AI Readiness Test • Question {currentIndex + 1} of {questions.length}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
              {currentQ.skill} ({currentQ.topic || 'Core Concept'})
            </span>
          </div>
          <ProgressBar progress={progressPercent} />
        </div>

        {/* Question Card */}
        <Card>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--color-primary-subtle)',
                  color: 'var(--color-primary)',
                  fontWeight: 600
                }}
              >
                {currentQ.type.toUpperCase()}
              </span>
              <span
                style={{
                  fontSize: '0.75rem',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  backgroundColor: 'var(--color-bg-base)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text-secondary)'
                }}
              >
                {currentQ.difficulty || 'Adaptive'}
              </span>
            </div>

            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, lineHeight: 1.4, margin: '8px 0' }}>
              {currentQ.question}
            </h2>

            {/* Code Snippet Box (if present) */}
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'var(--space-4)' }}>
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
                    <Spinner size="sm" /> Evaluating Claims...
                  </span>
                ) : (
                  'Submit Assessment & Verify Claims'
                )}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
}

export default ReadinessAssessmentPage;
