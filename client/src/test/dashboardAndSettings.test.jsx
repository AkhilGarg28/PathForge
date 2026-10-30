import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext.jsx';
import { ToastProvider } from '../context/ToastContext.jsx';
import { DashboardPage } from '../pages/DashboardPage.jsx';
import { ModuleDetailPage } from '../pages/ModuleDetailPage.jsx';
import { SettingsPage } from '../pages/SettingsPage.jsx';
import { api, setMockMode } from '../services/api.js';

describe('Dashboard, Module Detail & Settings Workflows', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    setMockMode(true);
  });

  describe('1. Dashboard Page States', () => {
    it('renders skeleton placeholders during loading state', () => {
      // Mock an in-flight promise that never resolves immediately
      vi.spyOn(api, 'getRoadmap').mockReturnValue(new Promise(() => {}));

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <AuthProvider>
            <ToastProvider>
              <DashboardPage />
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      // Verify that skeletons are rendered
      const skeletonElements = document.querySelectorAll('[aria-hidden="true"]');
      expect(skeletonElements.length).toBeGreaterThan(0);
    });

    it('renders EmptyState when roadmap is not found (404)', async () => {
      const err = new Error('No roadmap found');
      err.statusCode = 404;
      vi.spyOn(api, 'getRoadmap').mockRejectedValueOnce(err);

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <AuthProvider>
            <ToastProvider>
              <Routes>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/diagnostic" element={<div>Diagnostic Assessment View</div>} />
              </Routes>
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('No Learning Roadmap Yet')).toBeInTheDocument();
      });

      const startBtn = screen.getByRole('button', { name: /start skill diagnostic/i });
      fireEvent.click(startBtn);

      await waitFor(() => {
        expect(screen.getByText('Diagnostic Assessment View')).toBeInTheDocument();
      });
    });

    it('renders ErrorState with retry when API fails', async () => {
      const getRoadmapSpy = vi
        .spyOn(api, 'getRoadmap')
        .mockRejectedValueOnce(new Error('Database connection failed'))
        .mockResolvedValueOnce({
          success: true,
          data: {
            roadmap: {
              id: 'rm-1',
              roleId: 'mern-developer',
              readinessScore: 30,
              generatedBy: 'llm',
              dimensionScores: { javascript: 3.0 },
              modules: []
            }
          }
        });

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <AuthProvider>
            <ToastProvider>
              <DashboardPage />
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Failed to Load Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Database connection failed')).toBeInTheDocument();
      });

      const retryBtn = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryBtn);

      await waitFor(() => {
        expect(getRoadmapSpy).toHaveBeenCalledTimes(2);
        expect(screen.getByText('AI generated roadmap')).toBeInTheDocument();
      });
    });

    it('renders loaded dashboard with pinned ReadinessScore, badge, dimension scores, and modules summary', async () => {
      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <AuthProvider>
            <ToastProvider>
              <DashboardPage />
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('AI generated roadmap')).toBeInTheDocument();
        expect(screen.getByText('MERN Developer')).toBeInTheDocument();
        expect(screen.getByText('0 of 6 modules completed')).toBeInTheDocument();
      });

      // Readiness score ring
      expect(screen.getByText('24%')).toBeInTheDocument();

      // Dimension scores bars
      expect(screen.getByText('javascript')).toBeInTheDocument();
      expect(screen.getByText('react')).toBeInTheDocument();

      // Modules in vertical stepper
      expect(screen.getByText('JavaScript Foundations & Modern ES6+')).toBeInTheDocument();
      expect(screen.getByText('React Core Principles & Hooks Architecture')).toBeInTheDocument();
    });

    it('prompts confirmation when user clicks "Retake Diagnostic"', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <AuthProvider>
            <ToastProvider>
              <Routes>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/diagnostic" element={<div>Diagnostic Assessment Route</div>} />
              </Routes>
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('AI generated roadmap')).toBeInTheDocument();
      });

      const retakeBtn = screen.getByRole('button', { name: /retake diagnostic/i });
      fireEvent.click(retakeBtn);

      expect(confirmSpy).toHaveBeenCalled();
      await waitFor(() => {
        expect(screen.getByText('Diagnostic Assessment Route')).toBeInTheDocument();
      });
    });
  });

  describe('2. Module Detail: Active, Complete, and Locked', () => {
    it('renders active module with resources and allows marking as complete', async () => {
      const completeSpy = vi.spyOn(api, 'completeModule').mockResolvedValueOnce({
        success: true,
        data: {
          readinessScore: 36,
          roadmap: { readinessScore: 36, modules: [{ moduleId: 'mern-mod-1', status: 'complete' }] }
        }
      });

      render(
        <MemoryRouter initialEntries={['/module/mern-mod-1']}>
          <AuthProvider>
            <ToastProvider>
              <Routes>
                <Route path="/module/:moduleId" element={<ModuleDetailPage />} />
              </Routes>
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('JavaScript Foundations & Modern ES6+')).toBeInTheDocument();
        expect(screen.getByText(/10 hours/i)).toBeInTheDocument();
      });

      // Check external resource links have target="_blank" and rel="noopener noreferrer"
      const resourceLink = screen.getByRole('link', {
        name: /mdn web docs: javascript reference/i
      });
      expect(resourceLink).toHaveAttribute('target', '_blank');
      expect(resourceLink).toHaveAttribute('rel', 'noopener noreferrer');

      // Click "Mark as Complete"
      const markCompleteBtn = screen.getByRole('button', { name: /mark as complete/i });
      fireEvent.click(markCompleteBtn);

      await waitFor(() => {
        expect(completeSpy).toHaveBeenCalledWith('mern-mod-1');
        expect(screen.getByText('Completed ✓')).toBeInTheDocument();
      });
    });

    it('redirects to /dashboard with an info toast when module is locked', async () => {
      render(
        <MemoryRouter initialEntries={['/module/mern-mod-2']}>
          <AuthProvider>
            <ToastProvider>
              <Routes>
                <Route path="/module/:moduleId" element={<ModuleDetailPage />} />
                <Route path="/dashboard" element={<div>Dashboard Safe Landing</div>} />
              </Routes>
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      // mern-mod-2 is locked in the sample roadmap
      await waitFor(() => {
        expect(screen.getByText('Dashboard Safe Landing')).toBeInTheDocument();
      });
    });

    it('renders EmptyState when module id is unknown', async () => {
      render(
        <MemoryRouter initialEntries={['/module/non-existent-module-xyz']}>
          <AuthProvider>
            <ToastProvider>
              <Routes>
                <Route path="/module/:moduleId" element={<ModuleDetailPage />} />
              </Routes>
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Module Not Found')).toBeInTheDocument();
      });
    });
  });

  describe('3. Settings Page: Validation, Role Change, and Delete Modal', () => {
    it('validates password requirements and displays inline errors', async () => {
      render(
        <MemoryRouter initialEntries={['/settings']}>
          <AuthProvider>
            <ToastProvider>
              <SettingsPage />
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Change Password' })).toBeInTheDocument();
      });

      const updateBtn = screen.getByRole('button', { name: /update password/i });
      fireEvent.click(updateBtn);

      // Verify inline validation errors
      expect(screen.getByText('Current password is required')).toBeInTheDocument();
      expect(screen.getByText('Password must be at least 8 characters long')).toBeInTheDocument();
    });

    it('validates mismatched new passwords', async () => {
      render(
        <MemoryRouter initialEntries={['/settings']}>
          <AuthProvider>
            <ToastProvider>
              <SettingsPage />
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('heading', { name: 'Change Password' })).toBeInTheDocument();
      });

      fireEvent.change(screen.getByLabelText(/current password/i), {
        target: { value: 'OldPass123' }
      });
      fireEvent.change(screen.getByLabelText(/^new password/i), {
        target: { value: 'NewPassword123' }
      });
      fireEvent.change(screen.getByLabelText(/confirm new password/i), {
        target: { value: 'MismatchPass123' }
      });

      fireEvent.click(screen.getByRole('button', { name: /update password/i }));

      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    it('shows role information and confirms navigation to /roles upon change', async () => {
      const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(true);

      render(
        <MemoryRouter initialEntries={['/settings']}>
          <AuthProvider>
            <ToastProvider>
              <Routes>
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/roles" element={<div>Role Selection View</div>} />
              </Routes>
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/current role: mern developer/i)).toBeInTheDocument();
      });

      const changeRoleBtn = screen.getByRole('button', { name: /change role/i });
      fireEvent.click(changeRoleBtn);

      expect(confirmSpy).toHaveBeenCalled();
      await waitFor(() => {
        expect(screen.getByText('Role Selection View')).toBeInTheDocument();
      });
    });

    it('opens delete account modal, requires password, and redirects to landing upon deletion', async () => {
      const deleteSpy = vi.spyOn(api, 'deleteAccount').mockResolvedValueOnce({
        success: true,
        message: 'Account deleted'
      });

      render(
        <MemoryRouter initialEntries={['/settings']}>
          <AuthProvider>
            <ToastProvider>
              <Routes>
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/" element={<div>Landing Page Destination</div>} />
              </Routes>
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /delete account\.\.\./i })).toBeInTheDocument();
      });

      // Click to open modal
      fireEvent.click(screen.getByRole('button', { name: /delete account\.\.\./i }));

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Confirm Account Deletion')).toBeInTheDocument();

      // Submit without password
      const confirmDeleteBtn = screen.getByRole('button', { name: /permanently delete/i });
      fireEvent.click(confirmDeleteBtn);

      expect(
        screen.getByText('Please enter your password to confirm deletion')
      ).toBeInTheDocument();

      // Enter password and confirm deletion
      fireEvent.change(screen.getByLabelText(/confirm your password/i), {
        target: { value: 'Password123' }
      });
      fireEvent.click(confirmDeleteBtn);

      await waitFor(() => {
        expect(deleteSpy).toHaveBeenCalledWith({ password: 'Password123' });
        expect(screen.getByText('Landing Page Destination')).toBeInTheDocument();
      });
    });
  });
});
