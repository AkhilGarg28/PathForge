import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import ProgressBar from '../components/ProgressBar';
import ErrorMessage from '../components/ErrorMessage';
import QuizQuestion from '../components/QuizQuestion';
import { useRoadmap } from '../context/RoadmapContext';
import { useToast } from '../hooks/useToast';
import api from '../services/api';

/**
 * CheckpointPage Component
 *
 * Route: /module/:moduleId/checkpoint
 *
 * Implements conceptual checkpoint assessment for active modules.
 * Adapts roadmap curriculum based on learner performance:
 * - Score >= 80: Fast-tracks curriculum (compresses/removes redundant module)
 * - Score < 40: Inserts a focused remedial review module
 * - Score 40-79: Advances module with standard curriculum
 * - Fallback (404): Falls back to plain module completion
 */
const CheckpointPage = () => {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { roadmap, setRoadmap, fetchRoadmap } = useRoadmap();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  // Fallback state if 404 (no checkpoint exists for this module)
  const [noCheckpointFallback, setNoCheckpointFallback] = useState(false);
  const [completingFallback, setCompletingFallback] = useState(false);

  // Checkpoint questions and answers state
  const [questions, setQuestions] = useState([]);
  const [moduleTitle, setModuleTitle] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});

  // Result state after submission
  const [result, setResult] = useState(null);

  // 1. Resolve Module from Context or API
  const currentModule = useMemo(() => {
    if (!roadmap?.modules) return null;
    return roadmap.modules.find(
      (m) =>
        m.moduleId === moduleId ||
        m._id?.toString() === moduleId ||
        m.id?.toString() === moduleId
    );
  }, [roadmap, moduleId]);

  // 2. Fetch Checkpoint Questions
  const loadCheckpointQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    setNoCheckpointFallback(false);

    try {
      const response = await api.get(`/roadmap/module/${moduleId}/checkpoint`);
      const qs = response.data?.questions || [];

      if (qs.length === 0) {
        setNoCheckpointFallback(true);
        return;
      }

      setQuestions(qs);
      setModuleTitle(
        response.data?.moduleTitle || currentModule?.title || 'Milestone Checkpoint'
      );
    } catch (err) {
      if (err.response?.status === 404) {
        // Module has no checkpoint or directs to plain completion
        setNoCheckpointFallback(true);
      } else {
        const msg =
          err.response?.data?.message ||
          'Failed to load checkpoint assessment questions. Please try again.';
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  }, [moduleId, currentModule?.title]);

  useEffect(() => {
    loadCheckpointQuestions();
  }, [loadCheckpointQuestions]);

  // 3. Fallback: Plain Mark as Complete
  const handlePlainComplete = async () => {
    setCompletingFallback(true);
    try {
      const response = await api.patch(`/roadmap/module/${moduleId}/complete`);
      const updated = response.data?.roadmap;
      if (updated) {
        setRoadmap(updated);
      }
      addToast('Module completed successfully! Next milestone unlocked.', 'success');
      navigate('/dashboard', {
        state: {
          highlightedModuleId: updated?.modules?.find((m) => m.status === 'active')?.moduleId,
        },
      });
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Failed to complete module. Please try again.';
      addToast(msg, 'error');
    } finally {
      setCompletingFallback(false);
    }
  };

  // 4. Handle Option Selection
  const handleSelectOption = (optIdx) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optIdx,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 5. Submit Checkpoint Answers
  const handleSubmitCheckpoint = async () => {
    if (submitting) return;

    // Validate that all questions have been answered
    const formattedAnswers = questions.map((q) => ({
      questionId: q.id,
      selectedIndex: answers[q.id] !== undefined ? answers[q.id] : 0,
    }));

    setSubmitting(true);
    setError(null);

    try {
      const response = await api.post(`/roadmap/module/${moduleId}/checkpoint`, {
        answers: formattedAnswers,
      });

      const data = response.data; // { score, changes, roadmap }
      if (data?.roadmap) {
        setRoadmap(data.roadmap);
      }
      setResult(data);
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Failed to submit checkpoint assessment. Please retry.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  // -------------------------------------------------------------
  // Render: Loading State
  // -------------------------------------------------------------
  if (loading) {
    return (
      <div className="page-center-container">
        <Spinner size="lg" label="Loading checkpoint assessment..." />
      </div>
    );
  }

  // -------------------------------------------------------------
  // Render: Fallback State (404 - No Checkpoint Available)
  // -------------------------------------------------------------
  if (noCheckpointFallback) {
    return (
      <div className="page-container checkpoint-fallback-container">
        <div className="module-breadcrumb-bar">
          <Link to={`/module/${moduleId}`} className="breadcrumb-back-link">
            &larr; Back to Module Details
          </Link>
          <span className="breadcrumb-divider">/</span>
          <span className="breadcrumb-current">Checkpoint</span>
        </div>

        <Card className="checkpoint-fallback-card">
          <div className="fallback-icon-bubble" aria-hidden="true">
            📋
          </div>
          <h1 className="fallback-title">Standard Milestone Completion</h1>
          <p className="fallback-subtitle">
            This module does not require a conceptual checkpoint quiz. You can mark
            it as complete directly to unlock your next curriculum milestone.
          </p>

          <div className="fallback-actions-row">
            <Button
              variant="primary"
              loading={completingFallback}
              onClick={handlePlainComplete}
              className="btn-hero"
            >
              Mark as Complete &amp; Unlock Next &rarr;
            </Button>

            <Link to={`/module/${moduleId}`} className="btn btn-secondary">
              Return to Module Learning Tasks
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Render: Error State
  // -------------------------------------------------------------
  if (error && !result) {
    return (
      <div className="page-container" style={{ maxWidth: '640px', marginTop: '40px' }}>
        <ErrorMessage message={error} onRetry={loadCheckpointQuestions} />
        <div style={{ marginTop: '16px', display: 'flex', gap: '12px' }}>
          <Link to={`/module/${moduleId}`} className="btn btn-secondary">
            &larr; Back to Module
          </Link>
          <Link to="/dashboard" className="btn btn-secondary">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Render: Result Screen (After Submission)
  // -------------------------------------------------------------
  if (result) {
    const { score, changes = [], roadmap: updatedRoadmap } = result;
    const isHighScore = score >= 80;
    const isLowScore = score < 40;
    const isMidScore = score >= 40 && score < 80;

    // Plain-language summary text
    let summaryHeadline = '';
    let summaryDetail = '';
    let scoreBadgeVariant = 'active';

    if (isHighScore) {
      summaryHeadline = 'Mastery Demonstrated! 🚀';
      summaryDetail =
        'Great score! We skipped one topic you already know to accelerate your progress.';
      scoreBadgeVariant = 'complete';
    } else if (isLowScore) {
      summaryHeadline = 'Foundation Reinforcement Added 📚';
      summaryDetail =
        'We added a short review module to strengthen your grasp of core concepts before moving ahead.';
      scoreBadgeVariant = 'warning';
    } else {
      summaryHeadline = 'Milestone Cleared! 🎉';
      summaryDetail =
        'Solid score! You demonstrated consistent understanding. Continuing along your standard curriculum path.';
      scoreBadgeVariant = 'active';
    }

    const removedChange = changes.find((c) => c.type === 'removed');
    const insertedChange = changes.find((c) => c.type === 'inserted');

    const handleContinueToDashboard = () => {
      // Find changed module IDs to animate on dashboard
      const changedIds = changes.map((c) => c.moduleId).filter(Boolean);

      // Determine module to highlight/scroll to
      let highlightId = null;
      if (insertedChange) {
        highlightId = insertedChange.moduleId;
      } else {
        const nextActive = updatedRoadmap?.modules?.find((m) => m.status === 'active');
        highlightId = nextActive?.moduleId || nextActive?._id;
      }

      navigate('/dashboard', {
        state: {
          roadmapUpdated: true,
          replanToast: true,
          changedModuleIds: changedIds,
          highlightedModuleId: highlightId,
        },
      });
    };

    return (
      <div className="page-container checkpoint-result-container">
        <Card className="checkpoint-result-card">
          <div className="result-header-badge">
            <span className={`badge badge-${scoreBadgeVariant}`}>
              {isHighScore && 'Fast Track Applied'}
              {isLowScore && 'Curriculum Adapted'}
              {isMidScore && 'Milestone Achieved'}
            </span>
          </div>

          <h1 className="result-headline">{summaryHeadline}</h1>

          {/* Big Score Dial / Badge */}
          <div className="checkpoint-score-display">
            <div
              className={`score-circle ${
                isHighScore ? 'score-high' : isLowScore ? 'score-low' : 'score-mid'
              }`}
            >
              <span className="score-number">{score}%</span>
              <span className="score-subtext">Checkpoint Score</span>
            </div>
          </div>

          {/* Plain-Language Summary Callout */}
          <div
            className={`replan-summary-callout ${
              isHighScore
                ? 'callout-fasttrack'
                : isLowScore
                ? 'callout-remedial'
                : 'callout-standard'
            }`}
          >
            <p className="summary-primary-text">{summaryDetail}</p>
          </div>

          {/* Detailed Structural Changes List */}
          <div className="replan-changes-section">
            <h2 className="replan-changes-title">Roadmap Adjustments:</h2>

            {changes.length === 0 && (
              <div className="change-item change-item-none">
                <span className="change-icon">✓</span>
                <span>
                  No modules skipped or added. All milestone objectives satisfied.
                </span>
              </div>
            )}

            {removedChange && (
              <div className="change-item change-item-removed">
                <span className="change-pill pill-removed">Skipped</span>
                <div className="change-info">
                  <strong className="change-module-title">{removedChange.title}</strong>
                  <span className="change-note">
                    Accelerated past this topic based on your verified proficiency.
                  </span>
                </div>
              </div>
            )}

            {insertedChange && (
              <div className="change-item change-item-inserted">
                <span className="change-pill pill-inserted">Review Module Added</span>
                <div className="change-info">
                  <strong className="change-module-title">{insertedChange.title}</strong>
                  <span className="change-note">
                    Inserted 3-6 hour focused practice module to reinforce key concepts.
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Action to Dashboard */}
          <div className="result-actions-footer">
            <Button
              variant="primary"
              onClick={handleContinueToDashboard}
              className="btn-hero"
            >
              View Updated Dashboard &rarr;
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // -------------------------------------------------------------
  // Render: Active Quiz Questions Flow
  // -------------------------------------------------------------
  if (questions.length === 0) {
    return (
      <div className="page-center-container">
        <p>No questions available for this checkpoint.</p>
        <Link to={`/module/${moduleId}`} className="btn btn-secondary">
          Return to Module
        </Link>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const selectedIndex = answers[currentQuestion.id];
  const isAnswered = selectedIndex !== undefined;
  const isLastQuestion = currentIndex === questions.length - 1;
  const totalAnswered = Object.keys(answers).length;
  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="page-container checkpoint-quiz-container">
      {/* Breadcrumb Navigation */}
      <div className="module-breadcrumb-bar">
        <Link to={`/module/${moduleId}`} className="breadcrumb-back-link">
          &larr; Exit Checkpoint
        </Link>
        <span className="breadcrumb-divider">/</span>
        <span className="breadcrumb-current">Milestone Checkpoint</span>
      </div>

      {/* Checkpoint Header & Progress Bar */}
      <div className="checkpoint-quiz-header">
        <div className="checkpoint-quiz-meta">
          <span className="badge badge-active">Milestone Checkpoint</span>
          <span className="checkpoint-counter">
            Question <strong>{currentIndex + 1}</strong> of{' '}
            <strong>{questions.length}</strong>
          </span>
        </div>

        <h1 className="checkpoint-module-heading">{moduleTitle}</h1>

        <div style={{ marginTop: '12px' }}>
          <ProgressBar
            value={progressPercent}
            label={`Quiz Progress (${totalAnswered} of ${questions.length} answered)`}
            showPercentage={true}
          />
        </div>
      </div>

      {/* Submitting Loading Overlay */}
      {submitting ? (
        <Card className="checkpoint-submitting-card">
          <Spinner size="lg" label="Scoring checkpoint and evaluating curriculum..." />
          <h2 className="submitting-title">Analyzing Your Milestone Competency</h2>
          <p className="submitting-desc">
            PathForge is evaluating your responses and adaptively adjusting your upcoming
            milestones...
          </p>
        </Card>
      ) : (
        <>
          {/* Reusable QuizQuestion Component */}
          <QuizQuestion
            question={currentQuestion}
            selectedIndex={selectedIndex}
            onSelectOption={handleSelectOption}
            disabled={submitting}
          />

          {/* Navigation Controls: Back, Next, Submit */}
          <div className="checkpoint-nav-bar">
            <Button
              variant="secondary"
              onClick={handleBack}
              disabled={currentIndex === 0 || submitting}
            >
              &larr; Back
            </Button>

            <div className="checkpoint-nav-right">
              {isLastQuestion ? (
                <Button
                  variant="primary"
                  onClick={handleSubmitCheckpoint}
                  disabled={!isAnswered || submitting}
                  loading={submitting}
                  className="btn-submit-checkpoint"
                >
                  Submit Checkpoint &rarr;
                </Button>
              ) : (
                <Button
                  variant="primary"
                  onClick={handleNext}
                  disabled={!isAnswered || submitting}
                >
                  Next Question &rarr;
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CheckpointPage;
