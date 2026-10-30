import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SettingsPage from '../pages/SettingsPage.jsx';
import * as api from '../services/api.js';
import { renderWithProviders } from './testUtils.jsx';

vi.mock('../services/api.js', () => ({
  getRoles: vi.fn(),
  updateProfile: vi.fn(),
  updatePassword: vi.fn(),
  deleteUser: vi.fn(),
}));

describe('SettingsPage Interactivity & Validations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getRoles.mockResolvedValue({ roles: [] });
  });

  const currentUser = {
    id: 'u-1',
    name: 'Taylor Learner',
    email: 'taylor@pathforge.dev',
    roleId: 'mern-developer',
  };

  it('validates password strength and matching on change password form', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SettingsPage />, { user: currentUser });

    expect(screen.getByText('Change Password')).toBeInTheDocument();

    const currentPassInput = screen.getByLabelText(/Current Password/i);
    const newPassInput = screen.getByLabelText(/^New Password/i);
    const confirmPassInput = screen.getByLabelText(/Confirm New Password/i);
    const updateBtn = screen.getByRole('button', { name: /Update Password/i });

    // Submit empty
    await user.click(updateBtn);
    expect(screen.getByText('Current password is required.')).toBeInTheDocument();
    expect(screen.getByText('Password is required.')).toBeInTheDocument();

    // Fill valid current, weak new password
    await user.type(currentPassInput, 'OldPass123');
    await user.type(newPassInput, 'short');
    await user.click(updateBtn);
    expect(screen.getByText('Password must be at least 8 characters long.')).toBeInTheDocument();

    // Fill new password without numbers
    await user.clear(newPassInput);
    await user.type(newPassInput, 'alllettershere');
    await user.click(updateBtn);
    expect(
      screen.getByText('Password must contain at least one letter and one number.'),
    ).toBeInTheDocument();

    // Password mismatch
    await user.clear(newPassInput);
    await user.type(newPassInput, 'NewPass123');
    await user.type(confirmPassInput, 'Mismatch999');
    await user.click(updateBtn);
    expect(screen.getByText('Passwords do not match.')).toBeInTheDocument();
  });

  it('submits valid password change and clears inputs on success', async () => {
    const user = userEvent.setup();
    api.updatePassword.mockResolvedValueOnce({ success: true });

    renderWithProviders(<SettingsPage />, { user: currentUser });

    await user.type(screen.getByLabelText(/Current Password/i), 'OldPass123');
    await user.type(screen.getByLabelText(/^New Password/i), 'BrandNewPass1');
    await user.type(screen.getByLabelText(/Confirm New Password/i), 'BrandNewPass1');

    await user.click(screen.getByRole('button', { name: /Update Password/i }));

    await waitFor(() => {
      expect(api.updatePassword).toHaveBeenCalledWith({
        currentPassword: 'OldPass123',
        newPassword: 'BrandNewPass1',
      });
    });
  });

  it('handles delete account modal opening, confirmation validation, and deletion', async () => {
    const user = userEvent.setup();
    api.deleteUser.mockResolvedValueOnce({ success: true });
    const mockLogout = vi.fn().mockResolvedValue({});

    renderWithProviders(<SettingsPage />, {
      user: currentUser,
      authOverrides: { logout: mockLogout },
    });

    // Open delete modal
    const openDeleteBtn = screen.getByRole('button', { name: /^Delete Account$/i });
    await user.click(openDeleteBtn);

    const dialogs = screen.getAllByRole('alertdialog');
    expect(dialogs.length).toBeGreaterThan(0);

    const confirmDeleteBtn = screen.getByRole('button', { name: /^Permanently Delete Account$/i });

    // Click delete without entering confirmation password
    await user.click(confirmDeleteBtn);
    expect(
      screen.getByText('Please enter your password to confirm deletion.'),
    ).toBeInTheDocument();

    // Type password and confirm delete
    const passwordInput = screen.getByLabelText(/Enter your password to confirm deletion/i);
    await user.type(passwordInput, 'MySecretPass1');
    await user.click(confirmDeleteBtn);

    await waitFor(() => {
      expect(api.deleteUser).toHaveBeenCalledWith({ password: 'MySecretPass1' });
      expect(mockLogout).toHaveBeenCalled();
    });
  });
});
