import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';
import ProgressBar from '../components/ProgressBar';
import Spinner from '../components/Spinner';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useRoadmap } from '../context/RoadmapContext';

const DashboardPage = () => {
  const { user } = useAuth();
  const { roadmap, loading, fetchRoadmap } = useRoadmap();

  useEffect(() => {
    if (!roadmap && user?.targetRole) {
      fetchRoadmap();
    }
  }, [roadmap, user?.targetRole, fetchRoadmap]);

  if (loading && !roadmap) {
    return (
      <div className="page-center-container">
        <Spinner size="lg" label="Loading your personalized roadmap..." />
      </div>
    );
  }

  // If no target role selected yet
  if (!user?.targetRole) {
    return (
      <div className="page-container" style={{ maxWidth: '600px', marginTop: '40px' }}>
        <Card title="No Target Role Selected" subtitle="Select a role to unlock your diagnostic and roadmap.">
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
            Choose a target technical career path to begin your personalized skill diagnostic.
          </p>
          <Link to="/roles" className="btn btn-primary">
            Choose Your Target Role &rarr;
          </Link>
        </Card>
      </div>
    );
  }

  // If role is selected but no roadmap has been generated yet
  if (!roadmap) {
    return (
      <div className="page-container" style={{ maxWidth: '600px', marginTop: '40px' }}>
        <Card title="Diagnostic Required" subtitle={`Target Role: ${user.targetRole}`}>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '20px', lineHeight: '1.6' }}>
            You haven't generated a roadmap for <strong>{user.targetRole}</strong> yet. Complete the 12-question diagnostic to identify your competency gaps and construct your customized milestone path.
          </p>
          <Link to="/diagnostic" className="btn btn-primary">
            Start Skill Diagnostic &rarr;
          </Link>
        </Card>
      </div>
    );
  }

  const completedModulesCount = roadmap.modules?.filter((m) => m.status === 'complete').length || 0;
  const totalModulesCount = roadmap.modules?.length || 0;
  const readiness = typeof roadmap.readinessScore === 'number' ? roadmap.readinessScore : 0;

  return (
    <div className="page-container">
      <div
        className="page-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 className="page-title">{user.targetRole} Roadmap</h1>
          <p className="page-subtitle">Track your milestones, module completion, and career readiness.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to="/roles" className="btn btn-secondary">
            Switch Role
          </Link>
          <Link to="/settings" className="btn btn-secondary">
            Settings
          </Link>
        </div>
      </div>

      <div className="demo-grid" style={{ marginBottom: '32px' }}>
        <Card title="Career Readiness" subtitle="Weighted progress across all curriculum milestones">
          <ProgressBar
            value={readiness}
            label="Readiness Score"
            showPercentage={true}
          />
          <p style={{ marginTop: '12px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
            {completedModulesCount} of {totalModulesCount} modules completed. Completing active modules advances your readiness.
          </p>
        </Card>

        <Card title="Current Target Role" subtitle={user.targetRole}>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
            Your roadmap is active. Work through each module in sequence and pass the checkpoint quizzes to unlock milestones.
          </p>
          <Link to="/settings" className="btn btn-secondary" style={{ fontSize: '13px' }}>
            Retake Diagnostic in Settings
          </Link>
        </Card>
      </div>

      <h2 className="section-title">Roadmap Modules</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
        {roadmap.modules?.map((mod, index) => {
          const isComplete = mod.status === 'complete';
          const isActive = mod.status === 'active';
          const isLocked = mod.status === 'locked';

          let badgeVariant = 'badge-locked';
          let badgeLabel = 'Locked';
          if (isComplete) {
            badgeVariant = 'badge-complete';
            badgeLabel = 'Complete';
          } else if (isActive) {
            badgeVariant = 'badge-active';
            badgeLabel = 'Active';
          }

          return (
            <Card
              key={mod._id || mod.id || index}
              title={`${index + 1}. ${mod.title}`}
              subtitle={`Estimated: ${mod.estimatedHours || 10} hrs`}
              headerAction={<span className={`badge ${badgeVariant}`}>{badgeLabel}</span>}
              style={{
                borderColor: isActive ? 'var(--color-primary)' : undefined,
                borderWidth: isActive ? '2px' : undefined,
                backgroundColor: isActive ? '#FAFCFE' : undefined,
              }}
            >
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                {mod.description || 'Module covering core dimensions and practical implementation.'}
              </p>

              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                {isActive && (
                  <Link
                    to={`/module/${mod._id || mod.id || index + 1}`}
                    className="btn btn-primary"
                    style={{ fontSize: '13px' }}
                  >
                    Continue Learning &rarr;
                  </Link>
                )}
                {isComplete && (
                  <Link
                    to={`/module/${mod._id || mod.id || index + 1}`}
                    className="btn btn-secondary"
                    style={{ fontSize: '13px' }}
                  >
                    Review Completed Module
                  </Link>
                )}
                {isLocked && (
                  <Button variant="secondary" disabled style={{ fontSize: '13px' }}>
                    🔒 Locked (Complete Previous Milestone)
                  </Button>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DashboardPage;
