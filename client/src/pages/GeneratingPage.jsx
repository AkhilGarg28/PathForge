import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Card from '../components/Card';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import { useRoadmap } from '../context/RoadmapContext';
import { useToast } from '../hooks/useToast';
import api from '../services/api';

const GeneratingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setRoadmap, setDimensionScores } = useRoadmap();
  const { addToast } = useToast();

  const roleId = location.state?.roleId;
  const roleName = location.state?.roleName || 'Target Role';
  const answers = location.state?.answers;
  const storageKey = location.state?.storageKey;

  const [generating, setGenerating] = useState(true);
  const [error, setError] = useState(null);
  const [statusStep, setStatusStep] = useState(0);

  const requestSentRef = useRef(false);

  const statusMessages = [
    'Evaluating baseline responses across skill dimensions...',
    'Analyzing competency gaps and calculating initial readiness...',
    'Synthesizing milestone roadmap with tailored checkpoints...',
    'Finalizing curriculum and assembling curated learning resources...',
  ];

  // Animated status message progression
  useEffect(() => {
    if (!generating) return;
    const interval = setInterval(() => {
      setStatusStep((prev) => (prev < statusMessages.length - 1 ? prev + 1 : prev));
    }, 1800);
    return () => clearInterval(interval);
  }, [generating, statusMessages.length]);

  const runGeneration = async () => {
    if (!roleId || !answers || answers.length === 0) {
      setError('No submission data found. Please complete the diagnostic assessment.');
      setGenerating(false);
      return;
    }

    setGenerating(true);
    setError(null);

    try {
      const response = await api.post('/diagnostic/submit', {
        roleId,
        answers,
      });

      const { roadmap, dimensionScores } = response.data;

      // 1. Clear session storage draft
      if (storageKey) {
        try {
          sessionStorage.removeItem(storageKey);
        } catch (e) {
          console.warn('Failed to clear sessionStorage', e);
        }
      }

      // 2. Store returned roadmap & dimension scores in context state
      if (roadmap) {
        setRoadmap(roadmap);
      }
      if (dimensionScores) {
        setDimensionScores(dimensionScores);
      }

      addToast('Your learning roadmap is ready!', 'success');

      // 3. Navigate to dashboard
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Diagnostic submission failed:', err);
      const serverMsg =
        err.response?.data?.message ||
        (err.response?.status === 429
          ? 'Too many roadmap generation requests. Please wait a moment before trying again.'
          : 'Failed to generate your roadmap. Please check your network connection and try again.');
      setError(serverMsg);
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (requestSentRef.current) return;
    requestSentRef.current = true;

    if (!roleId || !answers) {
      setError('No submission data found. Please complete the diagnostic assessment.');
      setGenerating(false);
      return;
    }

    runGeneration();
  }, []);

  return (
    <div className="page-center-container">
      <Card
        className="generating-card"
        style={{ maxWidth: '520px', width: '100%', textAlign: 'center', padding: '36px var(--space-3)' }}
      >
        {generating ? (
          <div className="generating-in-progress">
            <Spinner size="lg" label="Generating personalized roadmap..." />
            
            <h2 className="generating-heading" style={{ marginTop: '24px', color: 'var(--color-primary)' }}>
              Generating Your Roadmap
            </h2>

            <p className="generating-role-pill" style={{ margin: '8px 0 16px' }}>
              Target Role: <strong>{roleName}</strong>
            </p>

            <div className="generating-status-container">
              <p className="generating-status-text">
                {statusMessages[statusStep]}
              </p>
            </div>

            <p className="generating-hint" style={{ fontSize: '13px', color: 'var(--color-text-muted)', marginTop: '20px' }}>
              Our adaptive engine is constructing a sequenced milestone path tailored to your diagnostic scores.
            </p>
          </div>
        ) : error ? (
          <div className="generating-error-container">
            <ErrorMessage message={error} />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
              <Button variant="primary" onClick={runGeneration}>
                Retry Generation
              </Button>
              <Link to="/diagnostic" className="btn btn-secondary">
                Return to Diagnostic
              </Link>
            </div>
          </div>
        ) : (
          <div className="generating-complete">
            <h3>Roadmap Ready!</h3>
            <p>Redirecting to your learner dashboard...</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default GeneratingPage;
