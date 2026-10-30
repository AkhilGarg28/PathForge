import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';
import { useRoadmap } from '../context/RoadmapContext';
import { useToast } from '../hooks/useToast';
import api from '../services/api';

const ROTATING_STATUS_TEXTS = [
  'Analyzing your skills',
  'Sequencing your modules',
  'Matching resources',
];

const GeneratingPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { setRoadmap, setDimensionScores } = useRoadmap();
  const { addToast } = useToast();

  // Retrieve cached answers and roleId from state or sessionStorage
  const [cachedPayload, setCachedPayload] = useState(() => {
    const stateRoleId = location.state?.roleId;
    const stateAnswers = location.state?.answers;
    const stateRoleName = location.state?.roleName;
    const stateKey = location.state?.storageKey;

    if (stateRoleId && stateAnswers && stateAnswers.length > 0) {
      return {
        roleId: stateRoleId,
        answers: stateAnswers,
        roleName: stateRoleName || user?.targetRole || 'Target Role',
        storageKey: stateKey,
      };
    }

    // Attempt to recover from sessionStorage
    if (user?.id) {
      try {
        // Look for any diagnostic key for this user
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && key.startsWith(`pathforge_diagnostic_progress_${user.id}_`)) {
            const raw = sessionStorage.getItem(key);
            if (raw) {
              const parsed = JSON.parse(raw);
              const extractedRoleId = key.replace(`pathforge_diagnostic_progress_${user.id}_`, '');
              if (parsed.answers && Object.keys(parsed.answers).length > 0) {
                const formatted = Object.entries(parsed.answers).map(([qId, sIdx]) => ({
                  questionId: qId,
                  selectedIndex: sIdx,
                }));
                return {
                  roleId: extractedRoleId,
                  answers: formatted,
                  roleName: user?.targetRole || 'Target Role',
                  storageKey: key,
                };
              }
            }
          }
        }
      } catch (e) {
        console.warn('Session recovery error:', e);
      }
    }

    return null;
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusIndex, setStatusIndex] = useState(0);
  const [isLongWaiting, setIsLongWaiting] = useState(false);

  const requestInProgressRef = useRef(false);

  // 1. Rotating status text timer (cycles through the 3 required status messages)
  useEffect(() => {
    if (!loading) return;
    const statusInterval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % ROTATING_STATUS_TEXTS.length);
    }, 2800);
    return () => clearInterval(statusInterval);
  }, [loading]);

  // 2. 15-second reassuring message timer
  useEffect(() => {
    if (!loading) {
      setIsLongWaiting(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsLongWaiting(true);
    }, 15000);

    return () => clearTimeout(timer);
  }, [loading]);

  // 3. Execution function: owns the submit request
  const executeGeneration = useCallback(async (payload) => {
    if (!payload || !payload.roleId || !payload.answers || payload.answers.length === 0) {
      setError('No submission data found. Please complete the diagnostic assessment.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    setIsLongWaiting(false);

    try {
      const response = await api.post('/diagnostic/submit', {
        roleId: payload.roleId,
        answers: payload.answers,
      });

      const { roadmap, dimensionScores } = response.data;

      // Clean up sessionStorage answers now that generation succeeded
      if (payload.storageKey) {
        try {
          sessionStorage.removeItem(payload.storageKey);
        } catch (e) {
          console.warn('Could not clear sessionStorage:', e);
        }
      }

      // Store in RoadmapContext
      if (roadmap) {
        setRoadmap(roadmap);
      }
      if (dimensionScores) {
        setDimensionScores(dimensionScores);
      }

      addToast('Your learning roadmap is ready!', 'success');
      navigate('/dashboard', { replace: true });
    } catch (err) {
      console.error('Roadmap generation error:', err);
      const message =
        err.response?.data?.message ||
        (err.response?.status === 429
          ? 'Generation rate limit reached: please wait a moment before retrying.'
          : 'Failed to generate roadmap. Please click Retry to re-submit your answers.');
      setError(message);
      setLoading(false);
    }
  }, [addToast, navigate, setDimensionScores, setRoadmap]);

  // Initial trigger
  useEffect(() => {
    if (requestInProgressRef.current) return;
    requestInProgressRef.current = true;

    if (cachedPayload) {
      executeGeneration(cachedPayload);
    } else {
      setLoading(false);
      setError('No cached diagnostic answers found.');
    }
  }, [cachedPayload, executeGeneration]);

  const handleRetry = () => {
    if (cachedPayload) {
      executeGeneration(cachedPayload);
    } else {
      navigate('/diagnostic');
    }
  };

  return (
    <div className="page-center-container generating-page-wrapper">
      <Card className="generating-card-main">
        {loading ? (
          <div className="generating-centered-animation">
            {/* Centered Pulse & Orbit Animation */}
            <div className="pulse-orb-container" aria-hidden="true">
              <div className="pulse-orb-outer"></div>
              <div className="pulse-orb-middle"></div>
              <div className="pulse-orb-core">
                <span className="pulse-orb-icon">⚡</span>
              </div>
            </div>

            <h1 className="generating-main-title">Forging Your Roadmap</h1>

            {/* Rotating Status Text */}
            <div className="rotating-status-box" aria-live="polite">
              <span className="rotating-status-dot"></span>
              <p className="rotating-status-text">
                {ROTATING_STATUS_TEXTS[statusIndex]}...
              </p>
            </div>

            {/* Reassuring message if longer than 15 seconds */}
            {isLongWaiting && (
              <div className="long-wait-reassurance-box" role="status">
                <p className="long-wait-text">
                  AI curriculum synthesis is performing deep competency sequencing to ensure the highest quality milestones. Hang tight, we're almost done!
                </p>
              </div>
            )}

            <p className="generating-subhint">
              Target Role: <strong>{cachedPayload?.roleName || user?.targetRole || 'Tech Career'}</strong>
            </p>
          </div>
        ) : error ? (
          <div className="generating-error-view">
            <div className="error-badge-icon" aria-hidden="true">✕</div>
            <h2 className="generating-error-title">Generation Incomplete</h2>
            <ErrorMessage message={error} style={{ margin: '16px 0' }} />
            
            <p className="cached-answers-note">
              Your diagnostic answers are safely preserved. Click <strong>Retry</strong> to re-send them without retaking the quiz.
            </p>

            <div className="generating-action-buttons">
              <Button
                variant="primary"
                onClick={handleRetry}
                style={{ minWidth: '160px' }}
              >
                Retry Generation
              </Button>
              <Link to="/diagnostic" className="btn btn-secondary">
                Return to Diagnostic
              </Link>
            </div>
          </div>
        ) : (
          <div className="generating-fallback-notice">
            <p>No active generation request. Redirecting...</p>
            <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: '16px' }}>
              Go to Dashboard
            </Link>
          </div>
        )}
      </Card>
    </div>
  );
};

export default GeneratingPage;
