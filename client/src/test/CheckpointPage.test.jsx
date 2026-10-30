import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Routes, Route } from 'react-router-dom';
import CheckpointPage from '../pages/CheckpointPage.jsx';
import * as api from '../services/api.js';
import { renderWithProviders } from './testUtils.jsx';

vi.mock('../services/api.js');

describe('CheckpointPage Flow & Dynamic Replanning', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    import.meta.env.VITE_ENABLE_CHECKPOINT = 'true';
  });

  const mockQuestions = [
    {
      id: 'cp-q1',
      text: 'What hook is used for component side effects?',
      options: ['useState', 'useEffect', 'useMemo', 'useRef'],
    },
    {
      id: 'cp-q2',
      text: 'What does CSS flex-grow define?',
      options: [
        'Shrink factor',
        'Ability to grow relative to rest',
        'Direction of axes',
        'Baseline alignment',
      ],
    },
  ];

  const mockActiveRoadmap = {
    roadmap: {
      roleId: 'frontend-dev',
      modules: [
        { moduleId: 'mod-1', title: 'React Fundamentals', status: 'active' },
        { moduleId: 'mod-2', title: 'Advanced State', status: 'locked' },
      ],
    },
  };

  const renderCheckpoint = (moduleId = 'mod-1') => {
    return renderWithProviders(
      <Routes>
        <Route path="/checkpoint/:moduleId" element={<CheckpointPage />} />
        <Route path="/dashboard" element={<div>Dashboard Screen</div>} />
        <Route path="/role-selection" element={<div>Role Selection Screen</div>} />
      </Routes>,
      { initialEntries: [`/checkpoint/${moduleId}`] },
    );
  };

  it('redirects to dashboard when VITE_ENABLE_CHECKPOINT is not true', async () => {
    import.meta.env.VITE_ENABLE_CHECKPOINT = 'false';

    renderCheckpoint('mod-1');

    await waitFor(() => {
      expect(screen.getByText('Dashboard Screen')).toBeInTheDocument();
    });
  });

  it('redirects to dashboard if the target module is locked', async () => {
    api.getRoadmap.mockResolvedValueOnce(mockActiveRoadmap);
    api.getCheckpoint.mockResolvedValueOnce({
      title: 'Module 2 Checkpoint',
      questions: mockQuestions,
    });

    renderCheckpoint('mod-2');

    await waitFor(() => {
      expect(screen.getByText('Dashboard Screen')).toBeInTheDocument();
    });
  });

  it('renders loading skeleton and then questions for active module', async () => {
    api.getRoadmap.mockResolvedValueOnce(mockActiveRoadmap);
    api.getCheckpoint.mockResolvedValueOnce({
      title: 'React Fundamentals Checkpoint',
      questions: mockQuestions,
    });

    renderCheckpoint('mod-1');

    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');

    await waitFor(() => {
      expect(screen.getByText(/What hook is used for component side effects\?/i)).toBeInTheDocument();
    });

    expect(
      screen.getByRole('heading', { name: /React Fundamentals Checkpoint/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Question 1 of 2')).toBeInTheDocument();
  });

  it('handles error state and retries successfully', async () => {
    api.getRoadmap.mockRejectedValueOnce(new Error('Failed to load roadmap'));
    renderCheckpoint('mod-1');

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Checkpoint Assessment Unavailable/i }),
      ).toBeInTheDocument();
    });

    api.getRoadmap.mockResolvedValueOnce(mockActiveRoadmap);
    api.getCheckpoint.mockResolvedValueOnce({
      title: 'React Fundamentals Checkpoint',
      questions: mockQuestions,
    });

    const retryBtn = screen.getByRole('button', { name: /Try Again/i });
    await userEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText(/What hook is used for component side effects\?/i)).toBeInTheDocument();
    });
  });

  it('displays unanswered warning and prevents submit until all questions are answered', async () => {
    api.getRoadmap.mockResolvedValueOnce(mockActiveRoadmap);
    api.getCheckpoint.mockResolvedValueOnce({
      title: 'React Fundamentals Checkpoint',
      questions: mockQuestions,
    });

    renderCheckpoint('mod-1');

    await waitFor(() => {
      expect(screen.getByText(/What hook is used for component side effects\?/i)).toBeInTheDocument();
    });

    // Answer Q1
    const optionB = screen.getByRole('radio', { name: /useEffect/i });
    await userEvent.click(optionB);

    // Navigate to Q2
    const nextBtn = screen.getByRole('button', { name: /Next Question/i });
    await userEvent.click(nextBtn);

    expect(screen.getByText(/What does CSS flex-grow define\?/i)).toBeInTheDocument();

    // Verify submit button is disabled because Q2 is unanswered
    const submitBtn = screen.getByRole('button', { name: /Submit Checkpoint/i });
    expect(submitBtn).toBeDisabled();
    expect(screen.getByText(/Please answer all questions before submitting/i)).toBeInTheDocument();
  });

  it('submits checkpoint and renders result screen with high score / skip notice', async () => {
    api.getRoadmap.mockResolvedValueOnce(mockActiveRoadmap);
    api.getCheckpoint.mockResolvedValueOnce({
      title: 'React Fundamentals Checkpoint',
      questions: mockQuestions,
    });
    api.submitCheckpoint.mockResolvedValueOnce({
      score: 90,
      replanned: true,
      changeSummary: 'Mastery verified! Advanced Module 2 skipped directly.',
    });

    renderCheckpoint('mod-1');

    await waitFor(() => {
      expect(screen.getByText(/What hook is used for component side effects\?/i)).toBeInTheDocument();
    });

    // Answer Q1
    await userEvent.click(screen.getByRole('radio', { name: /useEffect/i }));

    // Go to Q2
    await userEvent.click(screen.getByRole('button', { name: /Next Question/i }));

    // Answer Q2
    await userEvent.click(
      screen.getByRole('radio', { name: /Ability to grow relative to rest/i }),
    );

    // Click submit
    const submitBtn = screen.getByRole('button', { name: /Submit Checkpoint/i });
    expect(submitBtn).not.toBeDisabled();
    await userEvent.click(submitBtn);

    // Confirmation modal should open
    expect(
      screen.getByRole('heading', { name: /Submit Checkpoint Assessment\?/i }),
    ).toBeInTheDocument();
    const confirmBtn = screen.getByRole('button', { name: /Confirm & Submit/i });
    await userEvent.click(confirmBtn);

    // Result card appears
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Checkpoint Complete/i })).toBeInTheDocument();
    });

    expect(screen.getByText('90%')).toBeInTheDocument();
    expect(
      screen.getByText(/Roadmap updated: 1 module skipped \/ fast-tracked/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Mastery verified! Advanced Module 2 skipped directly.'),
    ).toBeInTheDocument();

    // Return to dashboard
    const returnBtn = screen.getByRole('button', {
      name: /Return to Curriculum Dashboard/i,
    });
    await userEvent.click(returnBtn);

    expect(screen.getByText('Dashboard Screen')).toBeInTheDocument();
  });
});
