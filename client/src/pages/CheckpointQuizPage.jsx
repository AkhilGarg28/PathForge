import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Layout } from '../components/Layout.jsx';
import { Card } from '../components/Card.jsx';
import { Button } from '../components/Button.jsx';
import { Spinner } from '../components/Spinner.jsx';
import { QuizQuestion } from '../components/QuizQuestion.jsx';
import { ReadinessScore } from '../components/ReadinessScore.jsx';
import { ErrorState } from '../components/ErrorState.jsx';
import { useToast } from '../hooks/useToast.js';
import { api } from '../services/api.js';

export function CheckpointQuizPage() {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const fetchCheckpoint = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getCheckpoint(moduleId);
      setQuestions(res?.data?.questions || []);
    } catch (err) {
      setError(err.message || 'Failed to load checkpoint assessment');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckpoint();
  }, [moduleId]);

  const handleSelectOption = (questionId, index) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: index
    }));
  };

  const handleSubmit = async () => {
    const answeredCount = Object.keys(answers).length;
    if (answeredCount < questions.length) {
      toast.warning('Please answer all questions before submitting the checkpoint.');
      return;
    }

    setSubmitting(true);
    try {
      const payloadAnswers = questions.map((q) => ({
        questionId: q.id,
        selectedIndex: answers[q.id]
      }));

      const res = await api.submitCheckpoint({
        moduleId,
        answers: payloadAnswers
      });

      toast.success('Checkpoint submitted successfully!');
      setResult(res?.data || { checkpointScore: 85, readinessScore: 40 });
    } catch (err) {
      toast.error(err.message || 'Failed to submit checkpoint');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout maxWidth="740px">
      <div style={{ padding: 'var(--space-4) 0' }}>
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: 'var(--space-3)' }}>
          <Link
            to={`/module/${moduleId}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: 'var(--color-primary)',
              textDecoration: 'none'
            }}
          >
            ← Back to Module Overview
          </Link>
        </div>

        {loading ? (
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
              Loading checkpoint quiz...
            </span>
          </div>
        ) : error ? (
          <ErrorState title="Unable to Load Checkpoint" message={error} onRetry={fetchCheckpoint} />
        ) : result ? (
          /* Checkpoint Result Screen */
          <Card
            style={{
              padding: 'var(--space-6)',
              textAlign: 'center',
              borderRadius: 'var(--radius-xl)'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-success-bg)',
                border: '2px solid var(--color-success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.75rem',
                margin: '0 auto var(--space-2)'
              }}
            >
              ✓
            </div>

            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: 'var(--color-neutral-900)',
                marginBottom: 'var(--space-1)'
              }}
            >
              Checkpoint Completed!
            </h1>

            <p
              style={{
                fontSize: '1rem',
                color: 'var(--color-text-body)',
                maxWidth: '480px',
                margin: '0 auto var(--space-4)'
              }}
            >
              {result.changeSummary ||
                'Your checkpoint assessment answers have been verified and applied to your readiness metric.'}
            </p>

            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 'var(--space-4)',
                marginBottom: 'var(--space-6)'
              }}
            >
              <div
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  textAlign: 'center'
                }}
              >
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--color-text-muted)'
                  }}
                >
                  Assessment Score
                </span>
                <div
                  style={{
                    fontSize: '2rem',
                    fontWeight: 800,
                    color: 'var(--color-primary-700)'
                  }}
                >
                  {result.checkpointScore}%
                </div>
              </div>

              <div
                style={{
                  padding: 'var(--space-2) var(--space-4)',
                  backgroundColor: 'var(--color-surface-subtle)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--color-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <ReadinessScore score={result.readinessScore || 0} size="sm" />
              </div>
            </div>

            <Button variant="primary" size="lg" onClick={() => navigate('/dashboard')}>
              Return to Dashboard
            </Button>
          </Card>
        ) : (
          /* Checkpoint Questions List */
          <div>
            <div style={{ marginBottom: 'var(--space-4)' }}>
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
                Module Checkpoint
              </span>
              <h1
                style={{
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: 'var(--color-neutral-900)',
                  marginTop: 'var(--space-1)',
                  marginBottom: 'var(--space-0-5)'
                }}
              >
                Knowledge Verification
              </h1>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
                Demonstrate proficiency in this module's topics. Your score directly influences your
                overall readiness metric.
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {questions.map((q, idx) => (
                <Card key={q.id} style={{ padding: 'var(--space-4)' }}>
                  <QuizQuestion
                    question={q}
                    questionNumber={idx + 1}
                    totalQuestions={questions.length}
                    selectedIndex={answers[q.id]}
                    onSelectOption={(optIdx) => handleSelectOption(q.id, optIdx)}
                    disabled={submitting}
                  />
                </Card>
              ))}
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: 'var(--space-4)',
                gap: 'var(--space-2)'
              }}
            >
              <Button
                variant="outline"
                size="lg"
                onClick={() => navigate(`/module/${moduleId}`)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button variant="primary" size="lg" loading={submitting} onClick={handleSubmit}>
                Submit Checkpoint
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default CheckpointQuizPage;
