import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import ProgressBar from '../components/ProgressBar';
import ErrorMessage from '../components/ErrorMessage';
import QuizQuestion from '../components/QuizQuestion';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';
import { useRoadmap } from '../context/RoadmapContext';
import api from '../services/api';

const DiagnosticPage = () => {
  const { user } = useAuth();
  const { roadmap, fetchRoadmap } = useRoadmap();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const isRetake = Boolean(location.state?.retake);

  const [checkingRoadmap, setCheckingRoadmap] = useState(true);
  const [hasExistingRoadmap, setHasExistingRoadmap] = useState(false);

  const [roleId, setRoleId] = useState(location.state?.roleId || null);
  const [roleName, setRoleName] = useState(user?.targetRole || '');
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [error, setError] = useState(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const storageKey = useMemo(() => {
    if (!user?.id || !roleId) return null;
    return `pathforge_diagnostic_progress_${user.id}_${roleId}`;
  }, [user?.id, roleId]);

  // 1. Validate Target Role & Existing Roadmap
  useEffect(() => {
    if (!user) return;

    if (!user.targetRole) {
      addToast('Please select a target role before taking the diagnostic.', 'info');
      navigate('/roles', { replace: true });
      return;
    }

    const checkExistingRoadmap = async () => {
      setCheckingRoadmap(true);
      try {
        const existing = await fetchRoadmap();
        if (existing && !isRetake) {
          setHasExistingRoadmap(true);
        } else {
          setHasExistingRoadmap(false);
        }
      } catch (err) {
        setHasExistingRoadmap(false);
      } finally {
        setCheckingRoadmap(false);
      }
    };

    checkExistingRoadmap();
  }, [user, isRetake, navigate, addToast, fetchRoadmap]);

  // 2. Resolve Role ID if missing
  useEffect(() => {
    if (!user?.targetRole || roleId || hasExistingRoadmap) return;

    const resolveRoleId = async () => {
      try {
        const res = await api.get('/roles');
        const rolesList = res.data?.roles || [];
        const matching = rolesList.find((r) => r.name === user.targetRole);
        if (matching) {
          setRoleId(matching.id);
          setRoleName(matching.name);
        } else {
          setError(`Role '${user.targetRole}' could not be resolved.`);
        }
      } catch (err) {
        setError('Failed to resolve role information.');
      }
    };

    resolveRoleId();
  }, [user?.targetRole, roleId, hasExistingRoadmap]);

  // 3. Fetch Questions & Restore Session
  const loadQuestions = useCallback(async () => {
    if (!roleId || hasExistingRoadmap) return;

    setLoadingQuestions(true);
    setError(null);
    try {
      const response = await api.get(`/diagnostic/${roleId}`);
      const qs = response.data?.questions || [];
      setQuestions(qs);
      if (response.data?.roleName) {
        setRoleName(response.data.roleName);
      }

      // Restore saved progress from sessionStorage
      if (storageKey) {
        try {
          const savedData = sessionStorage.getItem(storageKey);
          if (savedData) {
            const parsed = JSON.parse(savedData);
            if (parsed.answers && typeof parsed.answers === 'object') {
              setAnswers(parsed.answers);
            }
            if (typeof parsed.currentIndex === 'number' && parsed.currentIndex < qs.length) {
              setCurrentIndex(parsed.currentIndex);
            }
          }
        } catch (e) {
          console.warn('Failed to parse saved session diagnostic answers', e);
        }
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load diagnostic questions.';
      setError(msg);
    } finally {
      setLoadingQuestions(false);
    }
  }, [roleId, hasExistingRoadmap, storageKey]);

  useEffect(() => {
    if (roleId && !hasExistingRoadmap && !checkingRoadmap) {
      loadQuestions();
    }
  }, [roleId, hasExistingRoadmap, checkingRoadmap, loadQuestions]);

  // Handle Option Selection
  const handleSelectOption = (index) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    const updatedAnswers = {
      ...answers,
      [currentQ.id]: index,
    };
    setAnswers(updatedAnswers);

    // Save to sessionStorage immediately
    if (storageKey) {
      try {
        sessionStorage.setItem(
          storageKey,
          JSON.stringify({
            answers: updatedAnswers,
            currentIndex,
          })
        );
      } catch (e) {
        console.warn('Failed to save to sessionStorage', e);
      }
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      if (storageKey) {
        sessionStorage.setItem(
          storageKey,
          JSON.stringify({
            answers,
            currentIndex: nextIdx,
          })
        );
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      const prevIdx = currentIndex - 1;
      setCurrentIndex(prevIdx);
      if (storageKey) {
        sessionStorage.setItem(
          storageKey,
          JSON.stringify({
            answers,
            currentIndex: prevIdx,
          })
        );
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    setIsSubmitting(true);

    const formattedAnswers = questions.map((q) => ({
      questionId: q.id,
      selectedIndex: answers[q.id],
    }));

    // Navigate to /generating while it runs
    navigate('/generating', {
      replace: true,
      state: {
        roleId,
        roleName,
        answers: formattedAnswers,
        storageKey,
      },
    });
  };

  // State: Checking session or roadmap
  if (checkingRoadmap) {
    return (
      <div className="page-center-container">
        <Spinner size="lg" label="Checking roadmap status..." />
      </div>
    );
  }

  // State: Existing Roadmap Guard (Retake only via Settings)
  if (hasExistingRoadmap && !isRetake) {
    return (
      <div className="page-container" style={{ maxWidth: '650px', marginTop: '40px' }}>
        <Card
          title="Active Roadmap Already In Progress"
          subtitle={`You already have an active roadmap for ${user?.targetRole}.`}
        >
          <div className="placeholder-notice" style={{ margin: '16px 0' }}>
            <p>
              To maintain learning momentum, your diagnostic is not shown automatically when an active curriculum exists. You can review your roadmap on the Dashboard, or choose to retake the diagnostic through Account Settings.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '24px', flexWrap: 'wrap' }}>
            <Link to="/dashboard" className="btn btn-primary">
              View Active Dashboard &rarr;
            </Link>
            <Link to="/settings" className="btn btn-secondary">
              Go to Settings to Retake
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // State: Loading Questions
  if (loadingQuestions) {
    return (
      <div className="page-center-container">
        <Spinner size="lg" label={`Loading diagnostic assessment for ${roleName}...`} />
      </div>
    );
  }

  // State: Error
  if (error) {
    return (
      <div className="page-container" style={{ maxWidth: '600px', marginTop: '40px' }}>
        <ErrorMessage message={error} onRetry={loadQuestions} />
        <div style={{ marginTop: '16px' }}>
          <Link to="/roles" className="btn btn-secondary">
            &larr; Choose a Different Role
          </Link>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="page-center-container">
        <p>No questions found for role {roleName}.</p>
        <Link to="/roles" className="btn btn-secondary" style={{ marginTop: '16px' }}>
          Return to Roles
        </Link>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const selectedIndexForCurrent = answers[currentQuestion.id];
  const isAnswered = selectedIndexForCurrent !== undefined;
  const isLastQuestion = currentIndex === questions.length - 1;
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);
  const totalAnsweredCount = Object.keys(answers).length;

  return (
    <div className="page-container diagnostic-page-container">
      {/* Header & Meta */}
      <div className="diagnostic-header">
        <div className="diagnostic-header-top">
          <span className="badge badge-active">{roleName} Diagnostic</span>
          <span className="diagnostic-step-counter">
            Question <strong>{currentIndex + 1}</strong> of <strong>{questions.length}</strong>
          </span>
        </div>

        {/* Progress Bar */}
        <div style={{ marginTop: '12px' }}>
          <ProgressBar
            value={progressPercent}
            label={`Assessment Progress (${totalAnsweredCount} of ${questions.length} answered)`}
            showPercentage={true}
          />
        </div>
      </div>

      {/* Main Single-Question Card */}
      <QuizQuestion
        question={currentQuestion}
        selectedIndex={selectedIndexForCurrent}
        onSelectOption={handleSelectOption}
      />

      {/* Navigation Buttons: Back, Next, Submit */}
      <div className="diagnostic-nav-bar">
        <Button
          variant="secondary"
          onClick={handleBack}
          disabled={currentIndex === 0 || isSubmitting}
        >
          &larr; Back
        </Button>

        <div className="diagnostic-nav-right">
          {!isLastQuestion ? (
            <Button
              variant="primary"
              onClick={handleNext}
              disabled={!isAnswered || isSubmitting}
            >
              Next &rarr;
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={() => setShowConfirmModal(true)}
              disabled={!isAnswered || isSubmitting}
              loading={isSubmitting}
              className="btn-submit-diagnostic"
            >
              Submit Assessment
            </Button>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-card">
            <h3 className="modal-title">Submit Diagnostic Assessment</h3>
            <p className="modal-body-text">
              You have answered all <strong>{questions.length}</strong> questions for the{' '}
              <strong>{roleName}</strong> diagnostic.
            </p>
            <p className="modal-body-text" style={{ marginTop: '8px', color: 'var(--color-text-secondary)' }}>
              Once submitted, our engine will score your skill dimensions and generate your customized learning roadmap.
            </p>

            <div className="modal-actions">
              <Button
                variant="secondary"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
              >
                Review Answers
              </Button>
              <Button
                variant="primary"
                onClick={handleConfirmSubmit}
                loading={isSubmitting}
                disabled={isSubmitting}
              >
                Confirm &amp; Submit
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiagnosticPage;
