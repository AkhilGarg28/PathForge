import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { Button, Skeleton, EmptyState, ErrorState } from '../components/index.js';
import './RoleSelectionPage.css';

export default function RoleSelectionPage() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  usePageTitle('Choose Career Target');

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const userRoleId = user?.roleId || user?.targetRole;

  // Initial load
  useEffect(() => {
    let ignore = false;

    api
      .getRoles()
      .then((data) => {
        if (!ignore) {
          const loadedRoles = data?.roles || [];
          setRoles(loadedRoles);
          if (userRoleId) {
            const matching = loadedRoles.find(
              (r) => r.id === userRoleId || r.name === userRoleId || r.title === userRoleId,
            );
            if (matching) {
              setSelectedRoleId(matching.id);
            }
          }
        }
      })
      .catch((err) => {
        if (!ignore) {
          const msg = err?.message || 'Failed to load available roles. Please try again.';
          setError(msg);
          toast.error(msg);
        }
      })
      .finally(() => {
        if (!ignore) {
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [userRoleId, toast]);

  // Retry action for ErrorState
  const handleRetry = () => {
    setLoading(true);
    setError(null);
    api
      .getRoles()
      .then((data) => {
        const loadedRoles = data?.roles || [];
        setRoles(loadedRoles);
        if (userRoleId) {
          const matching = loadedRoles.find(
            (r) => r.id === userRoleId || r.name === userRoleId || r.title === userRoleId,
          );
          if (matching) {
            setSelectedRoleId(matching.id);
          }
        }
      })
      .catch((err) => {
        const msg = err?.message || 'Failed to load available roles. Please try again.';
        setError(msg);
        toast.error(msg);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleContinue = async () => {
    if (!selectedRoleId || submitting) return; // Double-submit prevention

    setSubmitting(true);
    try {
      await api.setUserRole(selectedRoleId);
      await refreshUser();
      toast.success('Role selected! Preparing diagnostic assessment.');
      navigate(`/diagnostic/${encodeURIComponent(selectedRoleId)}`);
    } catch (err) {
      const msg = err?.message || 'Unable to save your role selection. Please try again.';
      toast.error(msg);
      setSubmitting(false);
    }
  };

  // Find existing role title if user already has an active track
  const currentRole = userRoleId
    ? roles.find(
        (r) => r.id === userRoleId || r.name === userRoleId || r.title === userRoleId,
      ) || { title: userRoleId }
    : null;

  return (
    <main id="main-content" className="pf-role-selection">
      <header className="pf-role-selection__header">
        <h1 id="roles-heading" className="pf-role-selection__title">
          Choose Your Career Target
        </h1>
        <p className="pf-role-selection__subtitle">
          Select the engineering or analytics track you want to prepare for. Your
          diagnostic and generated roadmap will be calibrated directly to this role.
        </p>
      </header>

      {/* Notice if user already has a role & roadmap */}
      {currentRole && (
        <div role="status" aria-live="polite" className="pf-role-selection__notice">
          <span className="pf-role-selection__notice-icon" aria-hidden="true">
            ℹ️
          </span>
          <div>
            <strong>Notice: Active Roadmap in Progress</strong>
            <p style={{ marginTop: 'var(--space-0-5)' }}>
              You currently have an active roadmap for{' '}
              <strong>{currentRole.title}</strong>. Selecting a different role will
              replace your current roadmap and require completing that track&apos;s
              diagnostic assessment.
            </p>
          </div>
        </div>
      )}

      {/* 1. Loading State with Skeletons */}
      {loading && (
        <div
          className="pf-role-selection__grid"
          role="status"
          aria-label="Loading available career tracks"
        >
          <Skeleton variant="card" height="240px" />
          <Skeleton variant="card" height="240px" />
        </div>
      )}

      {/* 2. Error State with Retry Button */}
      {!loading && error && (
        <ErrorState
          title="Could not load roles"
          message={error}
          onRetry={handleRetry}
          retryLabel="Retry Loading Roles"
        />
      )}

      {/* 3. Empty State */}
      {!loading && !error && roles.length === 0 && (
        <EmptyState
          icon="🎯"
          title="No roles available yet"
          message="There are currently no active roles published. Please check back shortly or retry."
          action={
            <Button variant="primary" onClick={handleRetry}>
              Refresh Roles
            </Button>
          }
        />
      )}

      {/* 4. Success State (Selectable Cards) */}
      {!loading && !error && roles.length > 0 && (
        <>
          <div
            className="pf-role-selection__grid"
            role="radiogroup"
            aria-labelledby="roles-heading"
          >
            {roles.map((role) => {
              const isSelected = selectedRoleId === role.id;
              const inputId = `role-opt-${role.id}`;

              return (
                <label
                  key={role.id}
                  htmlFor={inputId}
                  className={`pf-role-card ${isSelected ? 'pf-role-card--selected' : ''}`}
                >
                  <input
                    id={inputId}
                    type="radio"
                    name="careerRole"
                    value={role.id}
                    checked={isSelected}
                    disabled={submitting}
                    onChange={() => setSelectedRoleId(role.id)}
                    className="sr-only"
                  />

                  <div className="pf-role-card__header">
                    <h2 className="pf-role-card__title">{role.title}</h2>
                    <span className="pf-role-card__check-indicator" aria-hidden="true">
                      ✓
                    </span>
                  </div>

                  <p className="pf-role-card__desc">{role.description}</p>

                  <div>
                    <div className="pf-role-card__dimensions-header">
                      Core Dimensions Evaluated:
                    </div>
                    <div className="pf-role-card__chips">
                      {(role.dimensions || []).map((dim, idx) => (
                        <span key={idx} className="pf-role-card__chip">
                          {dim}
                        </span>
                      ))}
                    </div>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="pf-role-selection__actions">
            <Button
              type="button"
              variant="primary"
              size="lg"
              disabled={!selectedRoleId || submitting}
              loading={submitting}
              onClick={handleContinue}
            >
              Continue to Diagnostic →
            </Button>
          </div>
        </>
      )}
    </main>
  );
}
