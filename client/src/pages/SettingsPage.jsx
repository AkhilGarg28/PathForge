import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';
import { useRoadmap } from '../context/RoadmapContext';
import { useToast } from '../hooks/useToast';
import api from '../services/api';

const SettingsPage = () => {
  const { user, updateUserState, logout } = useAuth();
  const { clearRoadmap } = useRoadmap();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [availableRoles, setAvailableRoles] = useState([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [rolesError, setRolesError] = useState(null);

  const [selectedNewRoleId, setSelectedNewRoleId] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const modalRef = useRef(null);
  const triggerBtnRef = useRef(null);
  const cancelBtnRef = useRef(null);

  // 1. Fetch available roles for the dropdown
  const fetchRolesList = useCallback(async () => {
    setLoadingRoles(true);
    setRolesError(null);
    try {
      const response = await api.get('/roles');
      setAvailableRoles(response.data?.roles || []);
    } catch (err) {
      setRolesError('Failed to load available roles.');
    } finally {
      setLoadingRoles(false);
    }
  }, []);

  useEffect(() => {
    fetchRolesList();
  }, [fetchRolesList]);

  // Selected role object
  const newRoleObj = availableRoles.find((r) => r.id === selectedNewRoleId);

  // 2. Accessible modal: focus trapping & Escape key listener
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        return;
      }

      if (e.key === 'Tab') {
        const focusableElements = modalRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusableElements || focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    // Auto-focus the cancel button when modal opens
    const focusTimer = setTimeout(() => {
      cancelBtnRef.current?.focus();
    }, 50);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      clearTimeout(focusTimer);
    };
  }, [isModalOpen]);

  const openModal = () => {
    if (!selectedNewRoleId) return;
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    // Restore focus to the trigger button for accessibility
    setTimeout(() => {
      triggerBtnRef.current?.focus();
    }, 50);
  };

  // 3. Confirm target role change: archives roadmap and navigates to /diagnostic
  const handleConfirmRoleChange = async () => {
    if (!selectedNewRoleId || isSwitching) return;

    setIsSwitching(true);
    try {
      const response = await api.post('/user/role', { roleId: selectedNewRoleId });

      if (response.data && response.data.user) {
        updateUserState(response.data.user);
      }

      // Clear existing active roadmap in context
      clearRoadmap();

      // Clear previous diagnostic sessionStorage cache for this user
      if (user?.id) {
        try {
          const keysToRemove = [];
          for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && key.startsWith(`pathforge_diagnostic_progress_${user.id}_`)) {
              keysToRemove.push(key);
            }
          }
          keysToRemove.forEach((k) => sessionStorage.removeItem(k));
        } catch (e) {
          console.warn('Storage cleanup notice:', e);
        }
      }

      addToast(
        `Switched target role to ${newRoleObj?.name || 'new role'}. Starting new diagnostic assessment!`,
        'success'
      );

      closeModal();
      navigate('/diagnostic', {
        state: { roleId: selectedNewRoleId, retake: true },
        replace: true,
      });
    } catch (err) {
      console.error('Failed to update role:', err);
      const msg = err.response?.data?.message || 'Failed to change role. Please try again.';
      addToast(msg, 'error');
      setIsSwitching(false);
    }
  };

  // 4. Logout action: calls API, clears state and redirects to /
  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      addToast('Logged out successfully', 'info');
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Logout error:', err);
      navigate('/', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="page-container settings-page-container">
      <div className="page-header">
        <h1 className="page-title">Account Settings</h1>
        <p className="page-subtitle">
          Manage your personal account profile, authentication session, and career path settings.
        </p>
      </div>

      <div className="settings-cards-stack">
        {/* 1. Read-Only Profile & Current Target Role Card */}
        <Card
          title="Profile Information"
          subtitle="Your account details and current specialization"
        >
          <div className="settings-fields-grid">
            <div className="form-group">
              <label className="form-label" htmlFor="settings-name">
                Full Name
              </label>
              <input
                id="settings-name"
                type="text"
                readOnly
                disabled
                className="form-input form-input-readonly"
                value={user?.name || ''}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="settings-email">
                Email Address
              </label>
              <input
                id="settings-email"
                type="email"
                readOnly
                disabled
                className="form-input form-input-readonly"
                value={user?.email || ''}
              />
            </div>
          </div>

          <div className="current-role-display-box">
            <div className="role-label-group">
              <span className="role-label-heading">Current Target Role</span>
              <span className="role-label-subtext">
                Your active curriculum and milestone roadmap are configured for this path.
              </span>
            </div>
            <div className="role-badge-group">
              {user?.targetRole ? (
                <span className="badge badge-active role-active-badge">
                  {user.targetRole}
                </span>
              ) : (
                <span className="badge badge-locked">No Role Selected</span>
              )}
            </div>
          </div>
        </Card>

        {/* 2. Danger Zone: Change Target Role Section */}
        <div className="danger-zone-card">
          <div className="danger-zone-header">
            <div className="danger-zone-badge">
              <span aria-hidden="true">⚠️</span> Danger Zone
            </div>
            <h2 className="danger-zone-title">Change Target Role</h2>
            <p className="danger-zone-subtitle">
              Switching your target role will archive your active curriculum and require a new diagnostic assessment.
            </p>
          </div>

          {rolesError && (
            <ErrorMessage message={rolesError} onRetry={fetchRolesList} style={{ marginBottom: '16px' }} />
          )}

          <div className="danger-zone-controls">
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label" htmlFor="new-role-select">
                Select New Target Role
              </label>
              {loadingRoles ? (
                <div style={{ padding: '8px 0' }}>
                  <Spinner size="sm" label="Loading available roles..." />
                </div>
              ) : (
                <select
                  id="new-role-select"
                  className="form-input settings-role-select"
                  value={selectedNewRoleId}
                  onChange={(e) => setSelectedNewRoleId(e.target.value)}
                >
                  <option value="">-- Choose a new role --</option>
                  {availableRoles.map((r) => {
                    const isCurrent = r.name === user?.targetRole;
                    return (
                      <option key={r.id} value={r.id} disabled={isCurrent}>
                        {r.name} {isCurrent ? '(Current Role)' : ''}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            <Button
              ref={triggerBtnRef}
              variant="secondary"
              className="btn-danger-outline"
              disabled={!selectedNewRoleId || selectedNewRoleId === '' || loadingRoles}
              onClick={openModal}
            >
              Change Target Role
            </Button>
          </div>

          <div className="danger-zone-note">
            <span className="note-icon" aria-hidden="true">ℹ️</span>
            <span>
              All progress completed in your current roadmap will be safely preserved in history.
            </span>
          </div>
        </div>

        {/* 3. Account Session & Logout */}
        <Card title="Account Session" subtitle="Manage your active login session">
          <div className="session-logout-row">
            <div>
              <p className="session-text">
                Signed in as <strong>{user?.email}</strong>. Logging out clears your authentication cookie from this browser.
              </p>
            </div>
            <Button
              variant="secondary"
              className="btn-logout-settings"
              onClick={handleLogout}
              loading={isLoggingOut}
              disabled={isLoggingOut}
            >
              Log Out of PathForge
            </Button>
          </div>
        </Card>
      </div>

      {/* 4. Accessible Confirmation Modal */}
      {isModalOpen && (
        <div
          className="modal-backdrop"
          onClick={closeModal}
          role="presentation"
        >
          <div
            ref={modalRef}
            className="modal-card modal-card-danger"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="danger-modal-title"
            aria-describedby="danger-modal-desc"
          >
            <div className="modal-danger-header">
              <span className="modal-danger-icon" aria-hidden="true">⚠️</span>
              <div>
                <h3 id="danger-modal-title" className="modal-title">
                  Confirm Target Role Switch
                </h3>
                <span className="modal-danger-tag">Irreversible Curriculum Reset</span>
              </div>
            </div>

            <div id="danger-modal-desc" className="modal-danger-body">
              <p className="modal-body-text">
                You are about to switch your career path from{' '}
                <strong>{user?.targetRole || 'Current Role'}</strong> to{' '}
                <strong className="text-primary-highlight">{newRoleObj?.name}</strong>.
              </p>

              <div className="modal-warning-callout">
                <p>
                  <strong>⚠️ What will happen:</strong>
                </p>
                <ul className="modal-warning-list">
                  <li>Your active roadmap for <strong>{user?.targetRole}</strong> will be immediately <strong>archived</strong>.</li>
                  <li>You will be sent to the <strong>Skill Diagnostic</strong> to answer 12 questions for <strong>{newRoleObj?.name}</strong>.</li>
                  <li>A completely fresh, personalized milestone curriculum will be forged for your new role.</li>
                </ul>
              </div>
            </div>

            <div className="modal-actions">
              <Button
                ref={cancelBtnRef}
                variant="secondary"
                onClick={closeModal}
                disabled={isSwitching}
              >
                Cancel &amp; Keep Current Role
              </Button>
              <Button
                variant="primary"
                className="btn-danger-confirm"
                onClick={handleConfirmRoleChange}
                loading={isSwitching}
                disabled={isSwitching}
              >
                Yes, Archive &amp; Start Diagnostic &rarr;
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
