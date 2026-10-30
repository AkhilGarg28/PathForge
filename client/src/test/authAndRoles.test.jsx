import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext.jsx';
import { ToastProvider } from '../context/ToastContext.jsx';
import { LandingPage } from '../pages/LandingPage.jsx';
import { SignupPage } from '../pages/SignupPage.jsx';
import { LoginPage } from '../pages/LoginPage.jsx';
import { RoleSelectionPage } from '../pages/RoleSelectionPage.jsx';
import { api, setMockMode } from '../services/api.js';

// Test wrapper providing Auth, Toast, and Router contexts
function renderWithProviders(ui, { route = '/', initialEntries = [route] } = {}) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <AuthProvider>
        <ToastProvider>{ui}</ToastProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe('Pages & User Journeys (Landing, Signup, Login, Role Selection)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    setMockMode(true);
  });

  describe('1. Landing Page', () => {
    it('renders hero, CTAs, 4-step how it works, features, and footer', () => {
      renderWithProviders(<LandingPage />);

      // Hero Elements
      expect(
        screen.getByRole('heading', {
          name: /ai-powered personalized skill roadmaps for employability/i
        })
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /start free assessment/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in to pathforge/i })).toBeInTheDocument();

      // 4-step 'how it works'
      expect(screen.getByText('01')).toBeInTheDocument();
      expect(screen.getByText('Target Your Career Role')).toBeInTheDocument();
      expect(screen.getByText('02')).toBeInTheDocument();
      expect(screen.getByText('Take the Diagnostic Quiz')).toBeInTheDocument();
      expect(screen.getByText('03')).toBeInTheDocument();
      expect(screen.getByText('AI Synthesizes Your Roadmap')).toBeInTheDocument();
      expect(screen.getByText('04')).toBeInTheDocument();
      expect(screen.getByText('Track Readiness & Prove Mastery')).toBeInTheDocument();

      // Feature Highlights
      expect(screen.getByText('Adaptive AI Sequencing')).toBeInTheDocument();
      expect(screen.getByText('Curated Official Documentation')).toBeInTheDocument();
      expect(screen.getByText('Objective Readiness Metric')).toBeInTheDocument();
      expect(screen.getByText('Deterministic Fallback Safety')).toBeInTheDocument();

      // Secondary CTA
      expect(
        screen.getByRole('heading', { name: /ready to accelerate your career trajectory/i })
      ).toBeInTheDocument();

      // Footer
      expect(screen.getByText(/all rights reserved/i)).toBeInTheDocument();
      expect(screen.getByText(/diagnostic-driven skill profiling/i)).toBeInTheDocument();
    });
  });

  describe('2. Signup Page & Form Validation', () => {
    it('shows inline validation errors when submitting invalid inputs', async () => {
      renderWithProviders(<SignupPage />);

      const submitBtn = screen.getByRole('button', { name: /sign up/i });
      fireEvent.click(submitBtn);

      // Name validation: min 2 characters
      expect(screen.getByText('Name must be at least 2 characters')).toBeInTheDocument();
      // Email validation
      expect(screen.getByText('Please provide a valid email address')).toBeInTheDocument();
      // Password validation: min 8 chars with letter and number
      expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument();
    });

    it('validates password requirements and matching confirmation', async () => {
      renderWithProviders(<SignupPage />);

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const submitBtn = screen.getByRole('button', { name: /sign up/i });

      // Enter valid name and email, but weak password (no numbers)
      fireEvent.change(nameInput, { target: { value: 'Alex Mercer' } });
      fireEvent.change(emailInput, { target: { value: 'alex@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'passwordonly' } });
      fireEvent.change(confirmInput, { target: { value: 'mismatch' } });

      fireEvent.click(submitBtn);

      expect(screen.getByText('Password must contain at least one number')).toBeInTheDocument();
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    it('submits valid registration and redirects to /roles', async () => {
      const signupSpy = vi.spyOn(api, 'signup').mockResolvedValueOnce({
        success: true,
        data: { user: { id: 'u1', name: 'Alex Mercer', email: 'alex@example.com', roleId: null } }
      });

      render(
        <MemoryRouter initialEntries={['/signup']}>
          <AuthProvider>
            <ToastProvider>
              <Routes>
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/roles" element={<div>Roles Selection View</div>} />
              </Routes>
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Alex Mercer' } });
      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'alex@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'Password123' } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'Password123' }
      });

      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

      await waitFor(() => {
        expect(signupSpy).toHaveBeenCalledWith({
          name: 'Alex Mercer',
          email: 'alex@example.com',
          password: 'Password123'
        });
        expect(screen.getByText('Roles Selection View')).toBeInTheDocument();
      });
    });

    it('displays server errors in a toast notification without crashing', async () => {
      vi.spyOn(api, 'signup').mockRejectedValueOnce(new Error('Email already registered'));

      renderWithProviders(<SignupPage />);

      fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: 'Alex Mercer' } });
      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'alex@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/^password/i), { target: { value: 'Password123' } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), {
        target: { value: 'Password123' }
      });

      fireEvent.click(screen.getByRole('button', { name: /sign up/i }));

      await waitFor(() => {
        expect(screen.getByText('Email already registered')).toBeInTheDocument();
      });
    });
  });

  describe('3. Login Page & Generic Error Display', () => {
    it('shows generic error display on invalid credentials', async () => {
      vi.spyOn(api, 'login').mockRejectedValueOnce(new Error('Invalid email or password'));

      renderWithProviders(<LoginPage />);

      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'wrong@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'WrongPass1' } });

      const submitBtn = screen
        .getAllByRole('button', { name: /sign in/i })
        .find((b) => b.getAttribute('type') === 'submit');
      fireEvent.click(submitBtn);

      await waitFor(() => {
        const alertBoxes = screen.getAllByRole('alert');
        expect(alertBoxes.length).toBeGreaterThanOrEqual(1);
        expect(alertBoxes[0]).toHaveTextContent('Invalid email or password');
      });
    });

    it('redirects to /roles if logged-in user has no assigned roleId', async () => {
      vi.spyOn(api, 'login').mockResolvedValueOnce({
        success: true,
        data: { user: { id: 'u1', name: 'Alex Mercer', email: 'alex@example.com', roleId: null } }
      });

      render(
        <MemoryRouter initialEntries={['/login']}>
          <AuthProvider>
            <ToastProvider>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/roles" element={<div>Target Role Page</div>} />
              </Routes>
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'alex@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123' } });

      const submitBtn = screen
        .getAllByRole('button', { name: /sign in/i })
        .find((b) => b.getAttribute('type') === 'submit');
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText('Target Role Page')).toBeInTheDocument();
      });
    });

    it('redirects to /dashboard if logged-in user has roleId and an existing roadmap', async () => {
      vi.spyOn(api, 'login').mockResolvedValueOnce({
        success: true,
        data: {
          user: {
            id: 'u1',
            name: 'Alex Mercer',
            email: 'alex@example.com',
            roleId: 'mern-developer'
          }
        }
      });
      vi.spyOn(api, 'getRoadmap').mockResolvedValueOnce({
        success: true,
        data: { roadmap: { id: 'rm-1', modules: [] } }
      });

      render(
        <MemoryRouter initialEntries={['/login']}>
          <AuthProvider>
            <ToastProvider>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={<div>User Dashboard View</div>} />
              </Routes>
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'alex@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123' } });

      const submitBtn = screen
        .getAllByRole('button', { name: /sign in/i })
        .find((b) => b.getAttribute('type') === 'submit');
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText('User Dashboard View')).toBeInTheDocument();
      });
    });

    it('redirects to /diagnostic if user has roleId but no roadmap yet (404)', async () => {
      vi.spyOn(api, 'login').mockResolvedValueOnce({
        success: true,
        data: {
          user: {
            id: 'u1',
            name: 'Alex Mercer',
            email: 'alex@example.com',
            roleId: 'mern-developer'
          }
        }
      });
      const notFoundErr = new Error('No roadmap generated yet');
      notFoundErr.statusCode = 404;
      vi.spyOn(api, 'getRoadmap').mockRejectedValueOnce(notFoundErr);

      render(
        <MemoryRouter initialEntries={['/login']}>
          <AuthProvider>
            <ToastProvider>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/diagnostic" element={<div>Skill Diagnostic Assessment View</div>} />
              </Routes>
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      fireEvent.change(screen.getByLabelText(/email address/i), {
        target: { value: 'alex@example.com' }
      });
      fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'Password123' } });

      const submitBtn = screen
        .getAllByRole('button', { name: /sign in/i })
        .find((b) => b.getAttribute('type') === 'submit');
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText('Skill Diagnostic Assessment View')).toBeInTheDocument();
      });
    });

    it('redirects already logged-in user away from /login', async () => {
      vi.spyOn(api, 'getMe').mockResolvedValueOnce({
        success: true,
        data: {
          user: {
            id: 'u1',
            name: 'Alex Mercer',
            email: 'alex@example.com',
            roleId: 'mern-developer'
          }
        }
      });
      vi.spyOn(api, 'getRoadmap').mockResolvedValueOnce({
        success: true,
        data: { roadmap: { id: 'rm-1', modules: [] } }
      });

      render(
        <MemoryRouter initialEntries={['/login']}>
          <AuthProvider>
            <ToastProvider>
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                <Route path="/dashboard" element={<div>Dashboard Home</div>} />
              </Routes>
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Dashboard Home')).toBeInTheDocument();
      });
    });

    it('redirects already logged-in user away from /signup to /roles if no role assigned', async () => {
      vi.spyOn(api, 'getMe').mockResolvedValueOnce({
        success: true,
        data: { user: { id: 'u1', name: 'Alex Mercer', email: 'alex@example.com', roleId: null } }
      });

      render(
        <MemoryRouter initialEntries={['/signup']}>
          <AuthProvider>
            <ToastProvider>
              <Routes>
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/roles" element={<div>Role Selection Home</div>} />
              </Routes>
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Role Selection Home')).toBeInTheDocument();
      });
    });
  });

  describe('4. Role Selection Page & Keyboard Navigation', () => {
    it('renders role cards with name, description, and dimension chips', async () => {
      renderWithProviders(<RoleSelectionPage />);

      await waitFor(() => {
        expect(screen.getByText('MERN Developer')).toBeInTheDocument();
        expect(screen.getByText('Data Analyst')).toBeInTheDocument();
      });

      // Description
      expect(
        screen.getByText(/build scalable, full-stack web applications using mongodb/i)
      ).toBeInTheDocument();

      // Dimension chips
      expect(screen.getByText('javascript')).toBeInTheDocument();
      expect(screen.getByText('react')).toBeInTheDocument();
      expect(screen.getByText('node-express')).toBeInTheDocument();
      expect(screen.getByText('databases-git')).toBeInTheDocument();
    });

    it('supports keyboard-only selection (Space and Enter keys)', async () => {
      renderWithProviders(<RoleSelectionPage />);

      await waitFor(() => {
        expect(screen.getByText('MERN Developer')).toBeInTheDocument();
      });

      const dataAnalystRadio = screen.getByRole('radio', { name: 'Data Analyst' });
      expect(dataAnalystRadio).toHaveAttribute('aria-checked', 'false');

      // Select via keyboard Space key
      fireEvent.keyDown(dataAnalystRadio, { key: ' ', code: 'Space' });
      expect(dataAnalystRadio).toHaveAttribute('aria-checked', 'true');

      // Select MERN Developer via Enter key
      const mernRadio = screen.getByRole('radio', { name: 'MERN Developer' });
      fireEvent.keyDown(mernRadio, { key: 'Enter', code: 'Enter' });
      expect(mernRadio).toHaveAttribute('aria-checked', 'true');
      expect(dataAnalystRadio).toHaveAttribute('aria-checked', 'false');
    });

    it('confirms role selection and navigates to /diagnostic', async () => {
      const setRoleSpy = vi.spyOn(api, 'setUserRole').mockResolvedValueOnce({
        success: true,
        data: { user: { id: 'u1', name: 'Alex Mercer', roleId: '64b0f9f1e1a2b3c4d5e6f7b1' } }
      });

      render(
        <MemoryRouter initialEntries={['/roles']}>
          <AuthProvider>
            <ToastProvider>
              <Routes>
                <Route path="/roles" element={<RoleSelectionPage />} />
                <Route path="/diagnostic" element={<div>Diagnostic Assessment View</div>} />
              </Routes>
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('MERN Developer')).toBeInTheDocument();
      });

      const confirmBtn = screen.getByRole('button', { name: /confirm & continue to diagnostic/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(setRoleSpy).toHaveBeenCalled();
        expect(screen.getByText('Diagnostic Assessment View')).toBeInTheDocument();
      });
    });

    it('displays error-with-retry state when loading roles fails, and retries on click', async () => {
      const getRolesSpy = vi
        .spyOn(api, 'getRoles')
        .mockRejectedValueOnce(new Error('Network unavailable'))
        .mockResolvedValueOnce({
          success: true,
          data: {
            roles: [
              {
                id: 'r1',
                name: 'MERN Developer',
                description: 'Full-stack development',
                dimensions: ['javascript']
              }
            ]
          }
        });

      renderWithProviders(<RoleSelectionPage />);

      await waitFor(() => {
        expect(screen.getByText('Failed to Load Career Roles')).toBeInTheDocument();
        expect(screen.getByText('Network unavailable')).toBeInTheDocument();
      });

      const retryBtn = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryBtn);

      await waitFor(() => {
        expect(getRolesSpy).toHaveBeenCalledTimes(2);
        expect(screen.getByText('MERN Developer')).toBeInTheDocument();
      });
    });
  });
});
