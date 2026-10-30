import React from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Card';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../hooks/useToast';

const SettingsPage = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleRetakeDiagnostic = () => {
    if (!user?.targetRole) {
      addToast('Please select a target role first.', 'info');
      navigate('/roles');
      return;
    }

    addToast('Starting fresh diagnostic assessment...', 'info');
    navigate('/diagnostic', { state: { retake: true } });
  };

  return (
    <div className="page-container" style={{ maxWidth: '680px' }}>
      <div className="page-header">
        <h1 className="page-title">Account Settings</h1>
        <p className="page-subtitle">Manage your profile, target career path, and diagnostic preferences.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Retake Diagnostic Card */}
        <Card
          title="Career Path & Skill Diagnostic"
          subtitle={`Current Target Role: ${user?.targetRole || 'Not Selected'}`}
        >
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '16px', lineHeight: '1.6' }}>
            Want to re-evaluate your technical competencies? Retaking the diagnostic allows you to answer the role assessment questions again and generates an updated roadmap.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <Button
              variant="primary"
              onClick={handleRetakeDiagnostic}
              disabled={!user?.targetRole}
            >
              Retake Diagnostic Assessment
            </Button>
            <Button
              variant="secondary"
              onClick={() => navigate('/roles')}
            >
              Switch Target Role
            </Button>
          </div>
        </Card>

        {/* Update Profile */}
        <Card title="Update Profile" subtitle="Change your public display name">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label className="form-label" htmlFor="settings-name">Name</label>
              <input
                id="settings-name"
                type="text"
                className="form-input"
                defaultValue={user?.name || ''}
                placeholder="Learner Name"
                disabled
              />
            </div>
            <Button variant="primary" disabled>
              Save Profile
            </Button>
          </form>
        </Card>

        {/* Change Password */}
        <Card title="Change Password" subtitle="Ensure your account is using a strong password">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label className="form-label" htmlFor="current-pass">Current Password</label>
              <input
                id="current-pass"
                type="password"
                className="form-input"
                placeholder="••••••••"
                disabled
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="new-pass">New Password</label>
              <input
                id="new-pass"
                type="password"
                className="form-input"
                placeholder="Min 8 characters, 1 letter, 1 number"
                disabled
              />
            </div>
            <Button variant="primary" disabled>
              Update Password
            </Button>
          </form>
        </Card>

        {/* Delete Account */}
        <Card title="Delete Account" subtitle="Permanently delete your user profile, active roadmap, and diagnostic history">
          <p style={{ fontSize: '14px', color: 'var(--color-danger)', marginBottom: '16px' }}>
            Warning: This action is irreversible. All of your progress, saved diagnostic results, and milestones will be permanently removed.
          </p>
          <Button variant="secondary" disabled style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}>
            Delete My Account
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default SettingsPage;
