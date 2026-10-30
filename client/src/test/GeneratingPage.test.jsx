import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Routes, Route } from 'react-router-dom';
import GeneratingPage from '../pages/GeneratingPage.jsx';
import * as api from '../services/api.js';
import { RoadmapGenerationContext } from '../context/roadmapGenerationContextDef.js';
import { renderWithProviders } from './testUtils.jsx';

vi.mock('../services/api.js');

describe('GeneratingPage State & Workflow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderWithCustomContext = (
    ui,
    contextValue,
    { initialEntries = ['/generating'] } = {},
  ) => {
    return renderWithProviders(
      <RoadmapGenerationContext.Provider value={contextValue}>
        <Routes>
          <Route path="/generating" element={ui} />
          <Route path="/dashboard" element={<div>Dashboard Screen</div>} />
          <Route path="/role-selection" element={<div>Role Selection Screen</div>} />
          <Route
            path="/diagnostic/:roleId"
            element={<div>Assessment Quiz Screen</div>}
          />
        </Routes>
      </RoadmapGenerationContext.Provider>,
      { initialEntries },
    );
  };

  it('renders progress animation and status message during generation', () => {
    const mockContext = {
      generationState: 'generating',
      payload: { roleId: 'frontend-dev', answers: [{ questionId: 'q1', selectedIndex: 1 }] },
      result: null,
      error: null,
      retryGeneration: vi.fn(),
      resetGeneration: vi.fn(),
    };

    renderWithCustomContext(<GeneratingPage />, mockContext);

    expect(screen.getByRole('heading', { name: /Crafting Your Roadmap/i })).toBeInTheDocument();
    expect(
      screen.getByText(/Synthesizing your assessment responses/i),
    ).toBeInTheDocument();
    expect(screen.getByText('Analyzing your skill gaps...')).toBeInTheDocument();
  });

  it('renders success state and navigates to dashboard', async () => {
    const mockContext = {
      generationState: 'success',
      payload: { roleId: 'frontend-dev', answers: [] },
      result: {
        roadmap: {
          roleId: 'frontend-dev',
          title: 'Frontend Roadmap',
          generatedBy: 'fallback',
        },
      },
      error: null,
      retryGeneration: vi.fn(),
      resetGeneration: vi.fn(),
    };

    renderWithCustomContext(<GeneratingPage />, mockContext);

    expect(
      screen.getByRole('heading', { name: /Your Roadmap is Ready!/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Taking you to your dashboard\.\.\./i),
    ).toBeInTheDocument();

    // Navigates after ~1000ms delay
    await waitFor(
      () => {
        expect(screen.getByText('Dashboard Screen')).toBeInTheDocument();
      },
      { timeout: 2000 },
    );
  });

  it('renders error state on generation failure and allows retrying', async () => {
    const retrySpy = vi.fn().mockResolvedValue({});
    const mockContext = {
      generationState: 'error',
      payload: { roleId: 'frontend-dev', answers: [] },
      result: null,
      error: { message: 'Generation service rate-limited' },
      retryGeneration: retrySpy,
      resetGeneration: vi.fn(),
    };

    renderWithCustomContext(<GeneratingPage />, mockContext);

    expect(
      screen.getByRole('heading', { name: /Roadmap Generation Failed/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Generation service rate-limited'),
    ).toBeInTheDocument();

    const retryBtn = screen.getByRole('button', { name: /Retry Generation/i });
    await userEvent.click(retryBtn);

    expect(retrySpy).toHaveBeenCalledTimes(1);
  });

  it('renders timeout guard when generation takes longer than threshold', async () => {
    const retrySpy = vi.fn().mockResolvedValue({});
    const mockContext = {
      generationState: 'generating',
      payload: { roleId: 'frontend-dev', answers: [] },
      result: null,
      error: null,
      retryGeneration: retrySpy,
      resetGeneration: vi.fn(),
    };

    // Use a very short timeoutMs for fast test execution
    renderWithCustomContext(<GeneratingPage timeoutMs={50} />, mockContext);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Taking Longer Than Expected/i }),
      ).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole('button', { name: /Retry Generation/i });
    await userEvent.click(retryBtn);

    expect(retrySpy).toHaveBeenCalledTimes(1);
  });

  it('checks existing roadmap on page refresh/direct visit and navigates to dashboard if present', async () => {
    api.getRoadmap.mockResolvedValueOnce({
      roadmap: { roleId: 'frontend-dev', modules: [] },
    });

    const mockContext = {
      generationState: 'idle',
      payload: null,
      result: null,
      error: null,
      retryGeneration: vi.fn(),
      resetGeneration: vi.fn(),
    };

    renderWithCustomContext(<GeneratingPage />, mockContext);

    expect(
      screen.getByText(/Checking your roadmap status\.\.\./i),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Dashboard Screen')).toBeInTheDocument();
    });
  });

  it('checks existing roadmap on page refresh/direct visit and navigates to role-selection if absent', async () => {
    api.getRoadmap.mockResolvedValueOnce({ roadmap: null });

    const mockContext = {
      generationState: 'idle',
      payload: null,
      result: null,
      error: null,
      retryGeneration: vi.fn(),
      resetGeneration: vi.fn(),
    };

    renderWithCustomContext(<GeneratingPage />, mockContext);

    await waitFor(() => {
      expect(screen.getByText('Role Selection Screen')).toBeInTheDocument();
    });
  });
});
