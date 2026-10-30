import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext.jsx';
import { ToastProvider } from '../context/ToastContext.jsx';
import { DiagnosticQuizPage } from '../pages/DiagnosticQuizPage.jsx';
import { GeneratingRoadmapPage } from '../pages/GeneratingRoadmapPage.jsx';
import { api, setMockMode, setForceDiagnosticFailure } from '../services/api.js';

describe('Diagnostic Quiz & Generating Roadmap Flow', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
    setMockMode(true);
    setForceDiagnosticFailure(false);
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  describe('1. /diagnostic Screen', () => {
    it('loads questions for user role and displays one question at a time', async () => {
      render(
        <MemoryRouter initialEntries={['/diagnostic']}>
          <AuthProvider>
            <ToastProvider>
              <DiagnosticQuizPage />
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      // Loading state initially
      expect(screen.getByText(/preparing your diagnostic assessment/i)).toBeInTheDocument();

      // Once loaded, shows role assessment title and Question 1 of 12
      await waitFor(() => {
        expect(screen.getByText('Question 1 of 12')).toBeInTheDocument();
        expect(screen.getByText(/0 of 12 answered/i)).toBeInTheDocument();
      });

      // Previous button is disabled on Question 1
      const prevBtn = screen.getByRole('button', { name: /previous/i });
      expect(prevBtn).toBeDisabled();

      // Next Question button is enabled
      const nextBtn = screen.getByRole('button', { name: /next question/i });
      expect(nextBtn).toBeEnabled();
    });

    it('navigates between questions using Previous and Next buttons', async () => {
      render(
        <MemoryRouter initialEntries={['/diagnostic']}>
          <AuthProvider>
            <ToastProvider>
              <DiagnosticQuizPage />
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Question 1 of 12')).toBeInTheDocument();
      });

      const nextBtn = screen.getByRole('button', { name: /next question/i });
      fireEvent.click(nextBtn);

      await waitFor(() => {
        expect(screen.getByText('Question 2 of 12')).toBeInTheDocument();
      });

      const prevBtn = screen.getByRole('button', { name: /previous/i });
      expect(prevBtn).toBeEnabled();
      fireEvent.click(prevBtn);

      await waitFor(() => {
        expect(screen.getByText('Question 1 of 12')).toBeInTheDocument();
      });
    });

    it('saves answers in state and sessionStorage, surviving refresh', async () => {
      render(
        <MemoryRouter initialEntries={['/diagnostic']}>
          <AuthProvider>
            <ToastProvider>
              <DiagnosticQuizPage />
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Question 1 of 12')).toBeInTheDocument();
      });

      // Select Option B (index 1) for Question 1
      const optionB = screen.getByText('includes()');
      fireEvent.click(optionB);

      await waitFor(() => {
        expect(screen.getByText(/1 of 12 answered/i)).toBeInTheDocument();
      });

      // Verify answer was persisted to sessionStorage
      const savedInStorage =
        sessionStorage.getItem('pathforge_diagnostic_answers_mern-developer') ||
        sessionStorage.getItem('pathforge_diagnostic_answers_64b0f9f1e1a2b3c4d5e6f7b1');
      expect(savedInStorage).toBeTruthy();
      expect(JSON.parse(savedInStorage)['mern-js-1']).toBe(1);
    });

    it('keeps Submit button disabled until all questions are answered', async () => {
      render(
        <MemoryRouter initialEntries={['/diagnostic']}>
          <AuthProvider>
            <ToastProvider>
              <DiagnosticQuizPage />
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Question 1 of 12')).toBeInTheDocument();
      });

      // Jump to question 12
      const step12Btn = screen.getByTitle(/question 12/i);
      fireEvent.click(step12Btn);

      await waitFor(() => {
        expect(screen.getByText('Question 12 of 12')).toBeInTheDocument();
      });

      // Submit button is present on the last question but must be DISABLED because not all questions are answered
      const submitBtn = screen.getByRole('button', { name: /submit diagnostic/i });
      expect(submitBtn).toBeDisabled();
      expect(screen.getByText(/remaining to complete all dimensions/i)).toBeInTheDocument();
    });

    it('enables Submit button when all questions are answered and navigates to /generating', async () => {
      // Pre-seed 12 answers in sessionStorage
      const allAnswers = {
        'mern-js-1': 1,
        'mern-js-2': 1,
        'mern-js-3': 1,
        'mern-react-1': 0,
        'mern-react-2': 1,
        'mern-react-3': 2,
        'mern-node-1': 1,
        'mern-node-2': 2,
        'mern-node-3': 2,
        'mern-db-1': 1,
        'mern-db-2': 2,
        'mern-db-3': 1
      };
      sessionStorage.setItem(
        'pathforge_diagnostic_answers_mern-developer',
        JSON.stringify(allAnswers)
      );
      sessionStorage.setItem(
        'pathforge_diagnostic_answers_64b0f9f1e1a2b3c4d5e6f7b1',
        JSON.stringify(allAnswers)
      );
      sessionStorage.setItem('pathforge_diagnostic_answers', JSON.stringify(allAnswers));

      render(
        <MemoryRouter initialEntries={['/diagnostic']}>
          <AuthProvider>
            <ToastProvider>
              <Routes>
                <Route path="/roles" element={<div>Roles Selection View</div>} />
                <Route path="/diagnostic" element={<DiagnosticQuizPage />} />
                <Route path="/generating" element={<div>Generating Roadmap View</div>} />
              </Routes>
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Question 1 of 12')).toBeInTheDocument();
        expect(screen.getByText(/12 of 12 answered/i)).toBeInTheDocument();
      });

      // Jump to last question
      fireEvent.click(screen.getByTitle(/question 12/i));

      await waitFor(() => {
        expect(screen.getByText('Question 12 of 12')).toBeInTheDocument();
      });

      const submitBtn = screen.getByRole('button', { name: /submit diagnostic/i });
      expect(submitBtn).toBeEnabled();

      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText('Generating Roadmap View')).toBeInTheDocument();
      });

      // Verify answers were queued into pending submission
      const pending = sessionStorage.getItem('pathforge_pending_submission');
      expect(pending).toBeTruthy();
      expect(JSON.parse(pending).answers).toHaveLength(12);
    });

    it('displays ErrorState with retry when API call fails', async () => {
      vi.spyOn(api, 'getDiagnostic').mockRejectedValueOnce(new Error('Failed to fetch questions'));

      render(
        <MemoryRouter initialEntries={['/diagnostic']}>
          <AuthProvider>
            <ToastProvider>
              <DiagnosticQuizPage />
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Unable to Load Diagnostic')).toBeInTheDocument();
        expect(screen.getByText('Failed to fetch questions')).toBeInTheDocument();
      });

      const retryBtn = screen.getByRole('button', { name: /try again/i });
      expect(retryBtn).toBeInTheDocument();
    });
  });

  describe('2. /generating Screen', () => {
    it('executes submission from /generating on mount and redirects to /dashboard on success', async () => {
      const submitSpy = vi.spyOn(api, 'submitDiagnostic');
      sessionStorage.setItem(
        'pathforge_pending_submission',
        JSON.stringify({
          roleId: 'mern-developer',
          answers: [{ questionId: 'mern-js-1', selectedIndex: 1 }]
        })
      );

      render(
        <MemoryRouter initialEntries={['/generating']}>
          <AuthProvider>
            <ToastProvider>
              <Routes>
                <Route path="/generating" element={<GeneratingRoadmapPage />} />
                <Route path="/dashboard" element={<div>Dashboard Destination</div>} />
              </Routes>
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      // Verify rotating message and spinner display
      expect(screen.getByText(/analyzing your skill gaps/i)).toBeInTheDocument();

      await waitFor(() => {
        expect(submitSpy).toHaveBeenCalledTimes(1);
        expect(screen.getByText('Dashboard Destination')).toBeInTheDocument();
      });

      // Verify pending submission was cleared on success
      expect(sessionStorage.getItem('pathforge_pending_submission')).toBeNull();
    });

    it('prevents duplicate submissions on re-render', async () => {
      const submitSpy = vi.spyOn(api, 'submitDiagnostic');
      sessionStorage.setItem(
        'pathforge_pending_submission',
        JSON.stringify({
          roleId: 'mern-developer',
          answers: [{ questionId: 'mern-js-1', selectedIndex: 1 }]
        })
      );

      const { rerender } = render(
        <MemoryRouter initialEntries={['/generating']}>
          <AuthProvider>
            <ToastProvider>
              <GeneratingRoadmapPage />
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      rerender(
        <MemoryRouter initialEntries={['/generating']}>
          <AuthProvider>
            <ToastProvider>
              <GeneratingRoadmapPage />
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(submitSpy).toHaveBeenCalledTimes(1);
      });
    });

    it('handles forced failure, shows ErrorState with Retry and Back to quiz buttons, and succeeds on retry', async () => {
      sessionStorage.setItem(
        'pathforge_pending_submission',
        JSON.stringify({
          roleId: 'mern-developer',
          answers: [{ questionId: 'mern-js-1', selectedIndex: 1 }]
        })
      );

      // Enable forced failure in mock mode
      setForceDiagnosticFailure(true);

      render(
        <MemoryRouter initialEntries={['/generating']}>
          <AuthProvider>
            <ToastProvider>
              <Routes>
                <Route path="/generating" element={<GeneratingRoadmapPage />} />
                <Route path="/diagnostic" element={<div>Diagnostic Quiz View</div>} />
                <Route path="/dashboard" element={<div>Dashboard Success View</div>} />
              </Routes>
            </ToastProvider>
          </AuthProvider>
        </MemoryRouter>
      );

      // Should display failure error state
      await waitFor(() => {
        expect(screen.getByText('Roadmap Generation Failed')).toBeInTheDocument();
        expect(screen.getByText(/ai roadmap generation service timed out/i)).toBeInTheDocument();
      });

      // Verify 'Back to quiz' button works
      const backBtn = screen.getByRole('button', { name: /back to quiz/i });
      expect(backBtn).toBeInTheDocument();

      // Disable forced failure and click Retry
      setForceDiagnosticFailure(false);
      const retryBtn = screen.getByRole('button', { name: /try again/i });
      fireEvent.click(retryBtn);

      await waitFor(() => {
        expect(screen.getByText('Dashboard Success View')).toBeInTheDocument();
      });
    });
  });
});
