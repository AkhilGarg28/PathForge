import React from 'react';
import Card from '../components/Card';
import Button from '../components/Button';

const SettingsPage = () => {
  return (
    <div className="page-container" style={{ maxWidth: '680px' }}>
      <div className="page-header">
        <h1 className="page-title">Account Settings</h1>
        <p className="page-subtitle">Manage your profile details, password, and account settings.</p>
      </div>

      <div className="placeholder-notice" style={{ marginBottom: '24px' }}>
        <p><strong>[Placeholder Page]</strong> Connected to <code>PATCH /api/user/profile</code>, <code>PATCH /api/user/password</code>, and <code>DELETE /api/user</code>.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <Card title="Update Profile" subtitle="Change your public name">
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label className="form-label" htmlFor="settings-name">Name</label>
              <input
                id="settings-name"
                type="text"
                className="form-input"
                placeholder="Learner Name"
                disabled
              />
            </div>
            <Button variant="primary" disabled>
              Save Profile
            </Button>
          </form>
        </Card>

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

        <Card title="Delete Account" subtitle="Permanently delete your user profile, active roadmap, and diagnostic history">
          <p style={{ fontSize: '14px', color: 'var(--color-danger)', marginBottom: '16px' }}>
            Warning: This action is irreversible. All of your progress and roadmaps will be permanently removed.
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
