import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import * as api from '../services/api.js';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import {
  validateName,
  validatePassword,
  validateConfirmPassword,
} from '../utils/validation.js';
import Button from '../components/Button.jsx';
import Input from '../components/Input.jsx';
import Modal from '../components/Modal.jsx';
import './SettingsPage.css';

function getRoleTitle(id, rolesList = []) {
  if (!id) return 'None Selected';
  const match = rolesList.find((r) => r.id === id || r.name === id || r.title === id);
  if (match?.title) return match.title;
  if (match?.name) return match.name;
  if (id === 'mern-developer') return 'MERN Developer';
  if (id === 'data-analyst') return 'Data Analyst';
  return id.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, refreshUser, logout } = useAuth();
  const { success, error: toastError } = useToast();
  usePageTitle('Account Settings');

  const [roles, setRoles] = useState([]);

  // Fetch available roles metadata
  useEffect(() => {
    let isCancelled = false;
    api
      .getRoles()
      .then((res) => {
        if (!isCancelled) {
          setRoles(res.roles || []);
        }
      })
      .catch(() => {
        // Non-critical metadata
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  // --------------------------------------------------------------------------
  // 1. Profile Section State
  // --------------------------------------------------------------------------
  const [customName, setCustomName] = useState(null);
  const name = customName !== null ? customName : user?.name || '';
  const [nameError, setNameError] = useState(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (isSavingProfile) return;

    const validationErr = validateName(name);
    if (validationErr) {
      setNameError(validationErr);
      return;
    }
    setNameError(null);
    setIsSavingProfile(true);

    try {
      await api.updateProfile({ name: name.trim() });
      await refreshUser();
      setCustomName(null);
      success('Profile updated successfully.');
    } catch (err) {
      toastError(err.message || 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // --------------------------------------------------------------------------
  // 2. Change Password Section State
  // --------------------------------------------------------------------------
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [currentPasswordError, setCurrentPasswordError] = useState(null);
  const [newPasswordError, setNewPasswordError] = useState(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState(null);
  const [passwordServerErr, setPasswordServerErr] = useState(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (isUpdatingPassword) return;

    let hasErrors = false;

    if (!currentPassword) {
      setCurrentPasswordError('Current password is required.');
      hasErrors = true;
    } else {
      setCurrentPasswordError(null);
    }

    const newPassErr = validatePassword(newPassword);
    if (newPassErr) {
      setNewPasswordError(newPassErr);
      hasErrors = true;
    } else {
      setNewPasswordError(null);
    }

    const confirmErr = validateConfirmPassword(confirmPassword, newPassword);
    if (confirmErr) {
      setConfirmPasswordError(confirmErr);
      hasErrors = true;
    } else {
      setConfirmPasswordError(null);
    }

    if (hasErrors) return;

    setIsUpdatingPassword(true);
    setPasswordServerErr(null);

    try {
      await api.updatePassword({
        currentPassword,
        newPassword,
      });
      success('Password updated successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setCurrentPasswordError(null);
      setNewPasswordError(null);
      setConfirmPasswordError(null);
    } catch (err) {
      const msg = err.message || 'Failed to update password.';
      setPasswordServerErr(msg);
      if (err.code === 'INVALID_PASSWORD' || err.status === 401) {
        setCurrentPasswordError('Current password is incorrect.');
      }
      toastError(msg);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // --------------------------------------------------------------------------
  // 3. Target Role Section State
  // --------------------------------------------------------------------------
  const [showRoleModal, setShowRoleModal] = useState(false);

  const handleConfirmChangeRole = useCallback(() => {
    setShowRoleModal(false);
    navigate('/role-selection');
  }, [navigate]);

  // --------------------------------------------------------------------------
  // 4. Danger Zone / Delete Account Section State
  // --------------------------------------------------------------------------
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteError, setDeleteError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleCloseDeleteModal = useCallback(() => {
    setShowDeleteModal(false);
    setDeletePassword('');
    setDeleteError(null);
  }, []);

  const handleConfirmDelete = async (e) => {
    e.preventDefault();
    if (isDeleting) return;

    if (!deletePassword) {
      setDeleteError('Please enter your password to confirm deletion.');
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      await api.deleteUser({ password: deletePassword });
      handleCloseDeleteModal();
      await logout();
      success('Your account has been deleted.');
      navigate('/');
    } catch (err) {
      const msg = err.message || 'Failed to delete account.';
      setDeleteError(msg);
      toastError(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const activeRoleTitle = getRoleTitle(user?.roleId || user?.targetRole, roles);

  return (
    <main id="main-content" className="pf-settings-page">
      <header className="pf-settings-header">
        <h1 className="pf-settings-title">Account Settings</h1>
        <p className="pf-settings-subtitle">
          Manage your personal details, credentials, and career roadmap preferences.
        </p>
      </header>

      <div className="pf-settings-sections">
        {/* Section 1: Profile */}
        <section className="pf-settings-card" aria-labelledby="profile-heading">
          <div className="pf-settings-card__header">
            <h2 id="profile-heading" className="pf-settings-card__title">
              Profile Information
            </h2>
            <p className="pf-settings-card__desc">
              Update your display name. Your email address is read-only.
            </p>
          </div>

          <form onSubmit={handleProfileSubmit} noValidate>
            <div className="pf-settings-card__body">
              <Input
                label="Full Name"
                name="name"
                value={name}
                onChange={(e) => {
                  setCustomName(e.target.value);
                  if (nameError) setNameError(null);
                }}
                error={nameError}
                required
                autoComplete="name"
              />

              <Input
                label="Email Address"
                value={user?.email || ''}
                disabled
                hint="Your registered login email address cannot be changed."
              />
            </div>

            <div className="pf-settings-card__footer">
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isSavingProfile}
                disabled={isSavingProfile || name.trim() === (user?.name || '')}
              >
                Save Profile
              </Button>
            </div>
          </form>
        </section>

        {/* Section 2: Change Password */}
        <section className="pf-settings-card" aria-labelledby="password-heading">
          <div className="pf-settings-card__header">
            <h2 id="password-heading" className="pf-settings-card__title">
              Change Password
            </h2>
            <p className="pf-settings-card__desc">
              Choose a strong password containing at least 8 characters with letters and
              numbers.
            </p>
          </div>

          <form onSubmit={handlePasswordSubmit} noValidate>
            <div className="pf-settings-card__body">
              {passwordServerErr && (
                <div className="pf-settings-inline-error" role="alert" aria-live="polite">
                  {passwordServerErr}
                </div>
              )}

              <Input
                label="Current Password"
                type="password"
                name="currentPassword"
                value={currentPassword}
                onChange={(e) => {
                  setCurrentPassword(e.target.value);
                  if (currentPasswordError) setCurrentPasswordError(null);
                }}
                error={currentPasswordError}
                required
                autoComplete="current-password"
              />

              <Input
                label="New Password"
                type="password"
                name="newPassword"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  if (newPasswordError) setNewPasswordError(null);
                }}
                error={newPasswordError}
                hint="Must be at least 8 characters with at least one letter and one number."
                required
                autoComplete="new-password"
              />

              <Input
                label="Confirm New Password"
                type="password"
                name="confirmPassword"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (confirmPasswordError) setConfirmPasswordError(null);
                }}
                error={confirmPasswordError}
                required
                autoComplete="new-password"
              />
            </div>

            <div className="pf-settings-card__footer">
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isUpdatingPassword}
                disabled={isUpdatingPassword}
              >
                Update Password
              </Button>
            </div>
          </form>
        </section>

        {/* Section 3: Target Role */}
        <section className="pf-settings-card" aria-labelledby="role-heading">
          <div className="pf-settings-card__header">
            <h2 id="role-heading" className="pf-settings-card__title">
              Target Career Role
            </h2>
            <p className="pf-settings-card__desc">
              Your personalized curriculum and roadmap are aligned with this career path.
            </p>
          </div>

          <div className="pf-settings-card__body">
            <div className="pf-settings-role-box">
              <div className="pf-settings-role-info">
                <span className="pf-settings-role-label">Active Career Path</span>
                <span className="pf-settings-role-title">🎯 {activeRoleTitle}</span>
              </div>

              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setShowRoleModal(true)}
              >
                Change Role
              </Button>
            </div>
          </div>
        </section>

        {/* Section 4: Danger Zone */}
        <section
          className="pf-settings-card pf-settings-card--danger"
          aria-labelledby="danger-heading"
        >
          <div className="pf-settings-card__header">
            <h2 id="danger-heading" className="pf-settings-card__title">
              <span aria-hidden="true">⚠️</span> Danger Zone
            </h2>
            <p className="pf-settings-card__desc">
              Permanent account actions that cannot be undone.
            </p>
          </div>

          <div className="pf-settings-card__body">
            <div className="pf-settings-danger-banner">
              <strong>Account Deletion Notice:</strong>
              <span>
                Deleting your account will immediately remove your profile, diagnostic
                results, learning history, and progress milestones.
              </span>
            </div>
          </div>

          <div className="pf-settings-card__footer">
            <Button
              type="button"
              variant="danger"
              size="md"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Account
            </Button>
          </div>
        </section>
      </div>

      {/* Confirmation Modal: Change Role */}
      <Modal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        title="Change Target Career Role?"
        size="md"
        role="dialog"
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              size="md"
              onClick={() => setShowRoleModal(false)}
            >
              Keep Current Role
            </Button>
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleConfirmChangeRole}
            >
              Change Role & Replace Roadmap
            </Button>
          </>
        }
      >
        <p>
          Selecting a new career track will <strong>replace your current roadmap</strong>{' '}
          and module milestones. You will take the diagnostic assessment tailored to your
          newly chosen role.
        </p>
        <p>Are you sure you want to proceed to role selection?</p>
      </Modal>

      {/* Confirmation Modal: Delete Account (Focus Trap & Password required) */}
      <Modal
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
        title="Permanently Delete Account"
        size="md"
        role="alertdialog"
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              size="md"
              disabled={isDeleting}
              onClick={handleCloseDeleteModal}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="md"
              loading={isDeleting}
              disabled={isDeleting}
              onClick={handleConfirmDelete}
            >
              Permanently Delete Account
            </Button>
          </>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p>
            This action is <strong>irreversible</strong>. All your learning milestones,
            checkpoint quizzes, and diagnostic history will be erased.
          </p>

          <form onSubmit={handleConfirmDelete} noValidate>
            <Input
              label="Enter your password to confirm deletion"
              type="password"
              name="deletePassword"
              value={deletePassword}
              onChange={(e) => {
                setDeletePassword(e.target.value);
                if (deleteError) setDeleteError(null);
              }}
              error={deleteError}
              required
              autoComplete="current-password"
            />
          </form>
        </div>
      </Modal>
    </main>
  );
}
