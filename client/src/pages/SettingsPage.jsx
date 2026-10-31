import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout.jsx';
import { Card } from '../components/Card.jsx';
import { Input } from '../components/Input.jsx';
import { Button } from '../components/Button.jsx';
import { useAuth } from '../hooks/useAuth.js';
import { useToast } from '../hooks/useToast.js';
import { usePageTitle } from '../hooks/usePageTitle.js';
import { api } from '../services/api.js';

export function SettingsPage() {
  usePageTitle('Account Settings');
  const { user, setUser, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  // Profile Name State
  const [name, setName] = useState(user?.name || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

  // Password Update State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});

  // Delete Account Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // --- System & Mock Mode Settings State ---
  const [systemStatus, setSystemStatus] = useState(null);
  const [systemMode, setSystemMode] = useState('auto');
  const [modeSaving, setModeSaving] = useState(false);
  const [aiProbeLoading, setAiProbeLoading] = useState(false);
  const [aiProbeResult, setAiProbeResult] = useState(null);
  const [dbProbeLoading, setDbProbeLoading] = useState(false);
  const [dbProbeResult, setDbProbeResult] = useState(null);
  const [resetHistoryLoading, setResetHistoryLoading] = useState(false);
  const [mockTrack, setMockTrack] = useState('mern-developer');
  const [mockDifficulty, setMockDifficulty] = useState('intermediate');
  const [mockCount, setMockCount] = useState(5);
  const [generatedMockQuiz, setGeneratedMockQuiz] = useState(null);
  const [generatingMock, setGeneratingMock] = useState(false);

  useEffect(() => {
    let mounted = true;
    api.getSystemStatus().then((res) => {
      if (mounted && res?.data) {
        setSystemStatus(res.data);
        if (res.data.settings?.mode) {
          setSystemMode(res.data.settings.mode);
        }
      }
    }).catch(() => {});
    return () => { mounted = false; };
  }, []);

  const handleModeChange = async (newMode) => {
    setSystemMode(newMode);
    setModeSaving(true);
    try {
      const res = await api.updateSystemSettings({ mode: newMode });
      if (res?.data?.settings) {
        toast.success(`AI mode updated to: ${newMode.replace('_', ' ').toUpperCase()}`);
      }
      const refreshed = await api.getSystemStatus();
      if (refreshed?.data) setSystemStatus(refreshed.data);
    } catch (err) {
      toast.error(err.message || 'Failed to update system mode');
    } finally {
      setModeSaving(false);
    }
  };

  const handleProbeAi = async () => {
    setAiProbeLoading(true);
    setAiProbeResult(null);
    try {
      const res = await api.probeAi();
      setAiProbeResult(res.data);
      toast.success('AI Health check completed');
    } catch (err) {
      setAiProbeResult({ healthy: false, message: err.message });
      toast.error('AI Health check failed');
    } finally {
      setAiProbeLoading(false);
    }
  };

  const handleProbeDb = async () => {
    setDbProbeLoading(true);
    setDbProbeResult(null);
    try {
      const res = await api.probeDb();
      setDbProbeResult(res.data);
      toast.success('Database latency test completed');
    } catch (err) {
      setDbProbeResult({ connected: false, message: err.message });
      toast.error('Database connection test failed');
    } finally {
      setDbProbeLoading(false);
    }
  };

  const handleResetHistory = async () => {
    if (!window.confirm('Are you sure you want to reset your quiz history and question repetition tracking?')) {
      return;
    }
    setResetHistoryLoading(true);
    try {
      await api.resetQuizProgress();
      toast.success('Quiz repetition history cleared successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to reset quiz history');
    } finally {
      setResetHistoryLoading(false);
    }
  };

  const handleGenerateMockAssessment = async () => {
    setGeneratingMock(true);
    try {
      const res = await api.getMockAssessment({
        track: mockTrack,
        difficulty: mockDifficulty,
        count: mockCount
      });
      if (res?.data?.questions) {
        setGeneratedMockQuiz(res.data);
        toast.success(`Generated ${res.data.questions.length} questions from ${mockTrack === 'mern-developer' ? 'MERN' : 'Data Analyst'} bank`);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to generate mock assessment');
    } finally {
      setGeneratingMock(false);
    }
  };

  // 1. Update Profile Name
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileError(null);
    const trimmed = name.trim();

    if (!trimmed || trimmed.length < 2) {
      setProfileError('Name must be at least 2 characters');
      return;
    }
    if (trimmed.length > 50) {
      setProfileError('Name cannot exceed 50 characters');
      return;
    }

    setProfileLoading(true);
    try {
      const res = await api.updateProfile({ name: trimmed });
      if (res?.data?.user) {
        setUser(res.data.user);
      }
      toast.success('Display name updated successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to update profile name');
    } finally {
      setProfileLoading(false);
    }
  };

  // 2. Change Password
  const validatePasswordForm = () => {
    const errs = {};
    if (!currentPassword) {
      errs.currentPassword = 'Current password is required';
    }
    if (!newPassword || newPassword.length < 8) {
      errs.newPassword = 'Password must be at least 8 characters long';
    } else if (!/[a-zA-Z]/.test(newPassword)) {
      errs.newPassword = 'Password must contain at least one letter';
    } else if (!/[0-9]/.test(newPassword)) {
      errs.newPassword = 'Password must contain at least one number';
    }

    if (newPassword !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    setPasswordLoading(true);
    try {
      await api.updatePassword({ currentPassword, newPassword });
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordErrors({});
    } catch (err) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  // 3. Change Role Handler
  const handleChangeRole = () => {
    const confirmed = window.confirm(
      'Changing your career role will require completing a new diagnostic assessment to synthesize an updated roadmap. Do you want to proceed?'
    );
    if (confirmed) {
      navigate('/roles');
    }
  };

  // 4. Delete Account Handler
  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    setDeleteError(null);

    if (!deletePassword) {
      setDeleteError('Please enter your password to confirm deletion');
      return;
    }

    setDeleteLoading(true);
    try {
      await api.deleteAccount({ password: deletePassword });
      toast.success('Your PathForge account has been permanently deleted.');
      setShowDeleteModal(false);
      await logout();
      navigate('/');
    } catch (err) {
      const msg = err.message || 'Failed to delete account. Incorrect password.';
      setDeleteError(msg);
      toast.error(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  // 5. Logout Handler
  const handleLogout = async () => {
    await logout();
    toast.info('Signed out successfully');
    navigate('/login');
  };

  const roleName =
    user?.roleId === 'data-analyst'
      ? 'Data Analyst'
      : user?.roleId
        ? 'MERN Developer'
        : 'None Selected';

  return (
    <Layout maxWidth="700px">
      <div style={{ padding: 'var(--space-4) 0 var(--space-8)' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--space-4)'
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: 'var(--color-neutral-900)',
                marginBottom: 'var(--space-0-5)'
              }}
            >
              Account Settings
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>
              Manage your personal credentials, career trajectory, and account preferences.
            </p>
          </div>

          <Button variant="ghost" size="sm" onClick={handleLogout}>
            Sign Out
          </Button>
        </div>

        {/* 1. Profile Information */}
        <Card style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
          <h2
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--color-neutral-900)',
              marginBottom: 'var(--space-2)'
            }}
          >
            Profile Information
          </h2>

          <form onSubmit={handleUpdateProfile} noValidate>
            <Input
              label="Email Address"
              type="email"
              value={user?.email || ''}
              disabled
              helperText="Email is permanently linked to your diagnostic records."
            />

            <Input
              label="Display Name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (profileError) setProfileError(null);
              }}
              error={profileError}
              disabled={profileLoading}
              required
            />

            <div
              style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}
            >
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={profileLoading}
                disabled={profileLoading}
              >
                Save Name
              </Button>
            </div>
          </form>
        </Card>

        {/* 2. Current Career Role */}
        <Card style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
              gap: 'var(--space-2)'
            }}
          >
            <div>
              <h2
                style={{
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  color: 'var(--color-neutral-900)',
                  marginBottom: 'var(--space-0-5)'
                }}
              >
                Target Career Role
              </h2>

              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-text-muted)',
                  maxWidth: '440px',
                  marginBottom: 'var(--space-2)'
                }}
              >
                Changing your career role will require completing a new diagnostic assessment to
                synthesize an updated roadmap.
              </p>

              <div
                style={{
                  display: 'inline-block',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  color: 'var(--color-primary-800)',
                  backgroundColor: 'var(--color-primary-50)',
                  border: '1px solid var(--color-primary-200)',
                  padding: '4px 12px',
                  borderRadius: 'var(--radius-full)'
                }}
              >
                Current Role: {roleName}
              </div>
            </div>

            <Button variant="outline" size="md" onClick={handleChangeRole}>
              Change Role
            </Button>
          </div>
        </Card>

        {/* 3. Change Password */}
        <Card style={{ padding: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
          <h2
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--color-neutral-900)',
              marginBottom: 'var(--space-2)'
            }}
          >
            Change Password
          </h2>

          <form onSubmit={handleUpdatePassword} noValidate>
            <Input
              label="Current Password"
              type="password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                if (passwordErrors.currentPassword) {
                  setPasswordErrors((prev) => ({ ...prev, currentPassword: null }));
                }
              }}
              error={passwordErrors.currentPassword}
              disabled={passwordLoading}
              required
            />

            <Input
              label="New Password"
              type="password"
              placeholder="At least 8 characters with letter & number"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                if (passwordErrors.newPassword) {
                  setPasswordErrors((prev) => ({ ...prev, newPassword: null }));
                }
              }}
              error={passwordErrors.newPassword}
              helperText={
                !passwordErrors.newPassword
                  ? 'Must be at least 8 characters, containing letters and numbers.'
                  : null
              }
              disabled={passwordLoading}
              required
            />

            <Input
              label="Confirm New Password"
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                if (passwordErrors.confirmPassword) {
                  setPasswordErrors((prev) => ({ ...prev, confirmPassword: null }));
                }
              }}
              error={passwordErrors.confirmPassword}
              disabled={passwordLoading}
              required
            />

            <div
              style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}
            >
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={passwordLoading}
                disabled={passwordLoading}
              >
                Update Password
              </Button>
            </div>
          </form>
        </Card>

        {/* 4. Danger Zone: Delete Account */}
        <Card
          style={{
            padding: 'var(--space-4)',
            border: '1px solid var(--color-error-border)',
            backgroundColor: 'var(--color-surface)'
          }}
        >
          <h2
            style={{
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--color-error)',
              marginBottom: 'var(--space-1)'
            }}
          >
            Danger Zone: Delete Account
          </h2>

          <p
            style={{
              fontSize: '0.875rem',
              color: 'var(--color-text-muted)',
              marginBottom: 'var(--space-3)'
            }}
          >
            Permanently delete your PathForge account, diagnostic assessment scores, and AI roadmap.
            This action cannot be undone.
          </p>

          <Button
            variant="danger"
            size="md"
            onClick={() => {
              setDeletePassword('');
              setDeleteError(null);
              setShowDeleteModal(true);
            }}
          >
            Delete Account...
          </Button>
        </Card>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-dialog-title"
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              padding: 'var(--space-2)'
            }}
          >
            <div
              style={{
                backgroundColor: 'var(--color-surface)',
                borderRadius: 'var(--radius-xl)',
                padding: 'var(--space-4)',
                width: '100%',
                maxWidth: '460px',
                boxShadow: 'var(--shadow-xl)',
                border: '1px solid var(--color-border)'
              }}
            >
              <h2
                id="delete-dialog-title"
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: 'var(--color-error)',
                  marginBottom: 'var(--space-1)'
                }}
              >
                Confirm Account Deletion
              </h2>

              <p
                style={{
                  fontSize: '0.875rem',
                  color: 'var(--color-text-body)',
                  lineHeight: 1.5,
                  marginBottom: 'var(--space-3)'
                }}
              >
                This is a permanent destructive action. Enter your account password to confirm that
                you wish to delete your account.
              </p>

              <form onSubmit={handleDeleteAccount} noValidate>
                <Input
                  label="Confirm Your Password"
                  type="password"
                  placeholder="Enter your password"
                  value={deletePassword}
                  onChange={(e) => {
                    setDeletePassword(e.target.value);
                    if (deleteError) setDeleteError(null);
                  }}
                  error={deleteError}
                  disabled={deleteLoading}
                  required
                />

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    gap: 'var(--space-2)',
                    marginTop: 'var(--space-3)'
                  }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="md"
                    disabled={deleteLoading}
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    variant="danger"
                    size="md"
                    loading={deleteLoading}
                    disabled={deleteLoading}
                  >
                    Permanently Delete
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default SettingsPage;
