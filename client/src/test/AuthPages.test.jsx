import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../pages/LoginPage.jsx';
import SignupPage from '../pages/SignupPage.jsx';
import { renderWithProviders } from './testUtils.jsx';

describe('Auth Pages Form Validation & Error Display', () => {
  describe('LoginPage', () => {
    it('validates required fields on blur and submit', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText(/^Email/i);
      const passwordInput = screen.getByLabelText(/^Password/i);
      const submitBtn = screen.getByRole('button', { name: /^Log in$/i });

      // Blur without typing
      await user.click(emailInput);
      await user.click(passwordInput);

      expect(screen.getAllByText(/Email address is required\./i).length).toBeGreaterThan(0);

      // Submit empty
      await user.click(submitBtn);
      expect(screen.getAllByText(/Password is required\./i).length).toBeGreaterThan(0);
    });

    it('validates invalid email format', async () => {
      const user = userEvent.setup();
      renderWithProviders(<LoginPage />);

      const emailInput = screen.getByLabelText(/^Email/i);
      await user.type(emailInput, 'not-an-email');
      await user.tab();

      expect(
        screen.getAllByText(/Please enter a valid email address/i).length,
      ).toBeGreaterThan(0);
    });

    it('displays server error for invalid credentials (401)', async () => {
      const user = userEvent.setup();
      const mockLogin = vi.fn().mockRejectedValue({
        status: 401,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.',
      });

      renderWithProviders(<LoginPage />, {
        authOverrides: { login: mockLogin },
      });

      await user.type(screen.getByLabelText(/^Email/i), 'user@test.com');
      await user.type(screen.getByLabelText(/^Password/i), 'wrongpass');
      await user.click(screen.getByRole('button', { name: /^Log in$/i }));

      expect(mockLogin).toHaveBeenCalledWith('user@test.com', 'wrongpass');
      expect(
        (await screen.findAllByText(/Invalid email or password\./i)).length,
      ).toBeGreaterThan(0);
    });
  });

  describe('SignupPage', () => {
    it('validates name, email, password strength, and password matching', async () => {
      const user = userEvent.setup();
      renderWithProviders(<SignupPage />);

      const passwordInput = screen.getByLabelText(/^Password/i);
      const confirmInput = screen.getByLabelText(/Confirm Password/i);
      const submitBtn = screen.getByRole('button', { name: /^Sign up$/i });

      // Submit empty
      await user.click(submitBtn);
      expect(screen.getAllByText(/Full name is required\./i).length).toBeGreaterThan(0);
      expect(screen.getAllByText(/Email address is required\./i).length).toBeGreaterThan(0);

      // Type weak password
      await user.type(passwordInput, 'simple');
      await user.tab();
      expect(
        screen.getAllByText(/Password must be at least 8 characters long\./i).length,
      ).toBeGreaterThan(0);

      // Type password without number
      await user.clear(passwordInput);
      await user.type(passwordInput, 'passwordonly');
      await user.tab();
      expect(
        screen.getAllByText(/Password must contain at least one letter and one number\./i).length,
      ).toBeGreaterThan(0);

      // Confirm mismatch
      await user.clear(passwordInput);
      await user.type(passwordInput, 'ValidPass1');
      await user.type(confirmInput, 'DifferentPass2');
      await user.tab();
      expect(screen.getAllByText(/Passwords do not match\./i).length).toBeGreaterThan(0);
    });

    it('displays server error when duplicate email is rejected (409)', async () => {
      const user = userEvent.setup();
      const mockSignup = vi.fn().mockRejectedValue({
        status: 409,
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'An account with this email already exists.',
      });

      renderWithProviders(<SignupPage />, {
        authOverrides: { signup: mockSignup },
      });

      await user.type(screen.getByLabelText(/Full Name/i), 'Alex Doe');
      await user.type(screen.getByLabelText(/^Email/i), 'alex@existing.com');
      await user.type(screen.getByLabelText(/^Password/i), 'SecurePass1');
      await user.type(screen.getByLabelText(/Confirm Password/i), 'SecurePass1');
      await user.click(screen.getByRole('button', { name: /^Sign up$/i }));

      expect(mockSignup).toHaveBeenCalled();
      expect(
        (await screen.findAllByText(/An account with this email already exists\./i)).length,
      ).toBeGreaterThan(0);
    });
  });
});
