import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '../components/Layout.jsx';
import { Card } from '../components/Card.jsx';
import { Spinner } from '../components/Spinner.jsx';
import { ProgressBar } from '../components/ProgressBar.jsx';
import { ErrorState } from '../components/ErrorState.jsx';
import { Button } from '../components/Button.jsx';
import { useToast } from '../hooks/useToast.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { api } from '../services/api.js';

const ROTATING_MESSAGES = [
  'Analyzing your skill gaps',
  'Choosing resources',
  'Building your roadmap'
];

export function GeneratingRoadmapPage() {
  usePageTitle('Synthesizing Roadmap');
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const [messageIndex, setMessageIndex] = useState(0);
  const [progress, setProgress] = useState(15);
  const [isStillWorking, setIsStillWorking] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const hasSubmittedRef = useRef(false);
  const isSubmittingRef = useRef(false);

  // Retrieve pending submission from state or sessionStorage (survive refresh)
  const getSubmissionData = () => {
    if (location.state?.roleId && location.state?.answers) {
      return {
        roleId: location.state.roleId,
        answers: location.state.answers
      };
    }
    try {
      const stored = sessionStorage.getItem('pathforge_pending_submission');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  };

  const executeSubmission = async () => {
    const data = getSubmissionData();

    if (!data || !data.roleId || !Array.isArray(data.answers)) {
      navigate('/diagnostic', { replace: true });
      return;
    }

    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setLoading(true);
    setError(null);
    setIsStillWorking(false);
    setProgress(15);

    try {
      await api.submitDiagnostic({
        roleId: data.roleId,
        answers: data.answers
      });

      // Clear pending diagnostic session data on success
      try {
        sessionStorage.removeItem('pathforge_pending_submission');
        sessionStorage.removeItem(`pathforge_diagnostic_answers_${data.roleId}`);
        sessionStorage.removeItem(`pathforge_diagnostic_index_${data.roleId}`);
      } catch {
        // Ignore storage errors
      }

      toast.success('Your personalized roadmap is ready!');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'AI roadmap synthesis failed. Please try again.');
    } finally {
      setLoading(false);
      isSubmittingRef.current = false;
    }
  };

  // Initial trigger: submit is made from here once on mount
  useEffect(() => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;
    executeSubmission();
  }, []);

  // 20-second "Still working..." timeout
  useEffect(() => {
    if (!loading) return;

    const timer = setTimeout(() => {
      setIsStillWorking(true);
    }, 20000);

    return () => clearTimeout(timer);
  }, [loading]);

  // Animated progress and rotating status messages
  useEffect(() => {
    if (!loading) return;

    const messageInterval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % ROTATING_MESSAGES.length);
    }, 2200);

    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 90) return prev + 12;
        return 92;
      });
    }, 600);

    return () => {
      clearInterval(messageInterval);
      clearInterval(progressInterval);
    };
  }, [loading]);

  const handleRetry = () => {
    executeSubmission();
  };

  return (
    <Layout maxWidth="640px">
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '65vh',
          textAlign: 'center',
          padding: 'var(--space-6) 0'
        }}
      >
        {error ? (
          <div style={{ width: '100%' }}>
            <ErrorState title="Roadmap Generation Failed" message={error} onRetry={handleRetry} />

            <div style={{ marginTop: 'var(--space-3)', display: 'flex', justifyContent: 'center' }}>
              <Button variant="outline" size="md" onClick={() => navigate('/diagnostic')}>
                ← Back to quiz
              </Button>
            </div>
          </div>
        ) : (
          <Card
            style={{
              width: '100%',
              padding: 'var(--space-6) var(--space-4)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--space-4)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-md)'
            }}
          >
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-primary-50)',
                border: '2px solid var(--color-primary-200)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Spinner size="lg" />
            </div>

            <div>
              <h1
                style={{
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  color: 'var(--color-neutral-900)',
                  marginBottom: 'var(--space-1)'
                }}
              >
                {isStillWorking ? 'Still working...' : 'Synthesizing Your Learning Roadmap'}
              </h1>

              <p
                style={{
                  fontSize: '1rem',
                  fontWeight: 600,
                  color: 'var(--color-primary-800)',
                  minHeight: '28px'
                }}
              >
                {ROTATING_MESSAGES[messageIndex]}...
              </p>

              {isStillWorking && (
                <p
                  style={{
                    fontSize: '0.8125rem',
                    color: 'var(--color-text-muted)',
                    marginTop: 'var(--space-1)'
                  }}
                >
                  Our AI is curating in-depth modules and documentation links. Thank you for your
                  patience!
                </p>
              )}
            </div>

            {/* Progress Bar (Strictly Amber) */}
            <div style={{ width: '100%', maxWidth: '380px' }}>
              <ProgressBar value={progress} max={100} showPercentage={false} height="8px" />
            </div>

            <span
              style={{
                fontSize: '0.75rem',
                color: 'var(--color-text-muted)',
                fontStyle: 'italic'
              }}
            >
              Powered by Google Gemini AI & verified open-source documentation
            </span>
          </Card>
        )}
      </div>
    </Layout>
  );
}

export default GeneratingRoadmapPage;
