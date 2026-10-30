import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Routes, Route } from 'react-router-dom';
import DiagnosticPage from '../pages/DiagnosticPage.jsx';
import * as api from '../services/api.js';
import { renderWithProviders } from './testUtils.jsx';

vi.mock('../services/api.js', () => ({
  getDiagnostic: vi.fn(),
  getRoles: vi.fn(),
  submitDiagnostic: vi.fn(),
}));

describe('DiagnosticPage Assessment Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  const mockQuestions = [
    {
      id: 'q-1',
      dimension: 'Frontend',
      text: 'What is the Virtual DOM in React?',
      options: ['Direct DOM copy', 'In-memory tree diffed for updates', 'Browser engine API'],
    },
    {
      id: 'q-2',
      dimension: 'Backend',
      text: 'How does Node.js handle async I/O?',
      options: ['Event loop & worker pool', 'Thread-per-request', 'Forking OS processes'],
    },
  ];

  it('restores stored answers from sessionStorage on load', async () => {
    sessionStorage.setItem('pathforge_diagnostic_mern-developer', JSON.stringify({ 'q-1': 1 }));

    api.getDiagnostic.mockResolvedValueOnce({
      roleId: 'mern-developer',
      questions: mockQuestions,
    });
    api.getRoles.mockResolvedValueOnce({ roles: [] });

    renderWithProviders(
      <Routes>
        <Route path="/diagnostic/:roleId" element={<DiagnosticPage />} />
      </Routes>,
      {
        initialEntries: ['/diagnostic/mern-developer'],
      },
    );

    expect(await screen.findByText(/What is the Virtual DOM in React\?/i)).toBeInTheDocument();

    const selectedOption = screen.getByLabelText(/In-memory tree diffed for updates/i);
    expect(selectedOption).toBeChecked();
  });

  it('displays unanswered warning and disables submit when questions are unanswered', async () => {
    const user = userEvent.setup();
    api.getDiagnostic.mockResolvedValueOnce({
      roleId: 'mern-developer',
      questions: mockQuestions,
    });
    api.getRoles.mockResolvedValueOnce({ roles: [] });

    renderWithProviders(
      <Routes>
        <Route path="/diagnostic/:roleId" element={<DiagnosticPage />} />
      </Routes>,
      {
        initialEntries: ['/diagnostic/mern-developer'],
      },
    );

    expect(await screen.findByText(/What is the Virtual DOM in React\?/i)).toBeInTheDocument();

    // Advance to question 2 without answering question 1
    const nextBtn = screen.getByRole('button', { name: /Next/i });
    await user.click(nextBtn);

    // On last question (Q2)
    expect(await screen.findByText(/How does Node\.js handle async I\/O\?/i)).toBeInTheDocument();

    // Notice unanswered warning
    expect(
      screen.getByText(/Please answer all diagnostic questions before submitting your assessment:/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Remaining/i)).toBeInTheDocument();

    const submitBtn = screen.getByRole('button', { name: /Submit diagnostic assessment/i });
    expect(submitBtn).toBeDisabled();
  });

  it('submits assessment when all questions are answered and clears sessionStorage', async () => {
    const user = userEvent.setup();
    api.getDiagnostic.mockResolvedValueOnce({
      roleId: 'mern-developer',
      questions: mockQuestions,
    });
    api.getRoles.mockResolvedValueOnce({ roles: [] });
    api.submitDiagnostic.mockResolvedValueOnce({
      roadmap: { id: 'rm-1', readinessScore: 85, modules: [] },
    });

    renderWithProviders(
      <Routes>
        <Route path="/diagnostic/:roleId" element={<DiagnosticPage />} />
        <Route path="/generating" element={<div>Generating Screen</div>} />
      </Routes>,
      {
        initialEntries: ['/diagnostic/mern-developer'],
      },
    );

    expect(await screen.findByText(/What is the Virtual DOM in React\?/i)).toBeInTheDocument();

    // Answer Q1
    await user.click(screen.getByLabelText(/In-memory tree diffed for updates/i));
    expect(
      JSON.parse(sessionStorage.getItem('pathforge_diagnostic_mern-developer') || '{}'),
    ).toHaveProperty('q-1', 1);

    // Go next
    await user.click(screen.getByRole('button', { name: /Next/i }));

    // Answer Q2
    await user.click(screen.getByLabelText(/Event loop & worker pool/i));

    // Submit Assessment button is now enabled
    const submitBtn = screen.getByRole('button', { name: /Submit diagnostic assessment/i });
    expect(submitBtn).not.toBeDisabled();
    await user.click(submitBtn);

    // Confirmation modal opens
    expect(screen.getByText(/Ready to Submit\?/i)).toBeInTheDocument();
    const confirmBtn = screen.getByRole('button', { name: /Yes, Generate Roadmap/i });
    await user.click(confirmBtn);

    await waitFor(() => {
      // Session storage cleared
      expect(
        sessionStorage.getItem('pathforge_diagnostic_mern-developer'),
      ).toBeNull();
    });
  });
});
