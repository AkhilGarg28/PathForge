import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DashboardPage from '../pages/DashboardPage.jsx';
import * as api from '../services/api.js';
import { renderWithProviders } from './testUtils.jsx';

vi.mock('../services/api.js', () => ({
  getRoadmap: vi.fn(),
  getRoles: vi.fn(),
}));

describe('DashboardPage States & Interactivity', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const sampleModules = [
    {
      moduleId: 'mod-1',
      title: 'Modern JavaScript & Async Foundations',
      description: 'Promises and event loop',
      estimatedHours: 8,
      status: 'complete',
    },
    {
      moduleId: 'mod-2',
      title: 'Component Architecture in React',
      description: 'Composition and state management',
      estimatedHours: 12,
      status: 'active',
    },
    {
      moduleId: 'mod-3',
      title: 'Server-Side APIs with Express',
      description: 'REST architecture and routing',
      estimatedHours: 14,
      status: 'locked',
    },
  ];

  it('renders loading skeleton on initial load', () => {
    api.getRoadmap.mockReturnValue(new Promise(() => {}));
    api.getRoles.mockResolvedValue({ roles: [] });

    renderWithProviders(<DashboardPage />);

    expect(screen.getByRole('main')).toHaveAttribute('aria-busy', 'true');
  });

  it('renders empty state when roadmap has no modules', async () => {
    api.getRoadmap.mockResolvedValueOnce({
      roadmap: { roleId: 'mern-developer', readinessScore: 40, modules: [] },
    });
    api.getRoles.mockResolvedValueOnce({ roles: [] });

    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText('No Modules in Roadmap')).toBeInTheDocument();
  });

  it('renders error state and retries successfully', async () => {
    const user = userEvent.setup();
    api.getRoadmap.mockRejectedValueOnce(new Error('Failed to load roadmap database'));
    api.getRoles.mockResolvedValue({ roles: [] });

    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText('Unable to Load Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Failed to load roadmap database')).toBeInTheDocument();

    // Mock successful recovery on retry
    api.getRoadmap.mockResolvedValueOnce({
      roadmap: { roleId: 'mern-developer', readinessScore: 75, modules: sampleModules },
    });

    await user.click(screen.getByRole('button', { name: /Try Again/i }));

    expect(await screen.findByText('Your Learning Dashboard')).toBeInTheDocument();
  });

  it('renders populated roadmap with metrics and modules', async () => {
    api.getRoadmap.mockResolvedValueOnce({
      roadmap: { roleId: 'mern-developer', readinessScore: 68, modules: sampleModules },
    });
    api.getRoles.mockResolvedValueOnce({
      roles: [{ id: 'mern-developer', title: 'MERN Stack Developer' }],
    });

    renderWithProviders(<DashboardPage />);

    expect(await screen.findByText('Your Learning Dashboard')).toBeInTheDocument();
    expect(screen.getByText('1. Modern JavaScript & Async Foundations')).toBeInTheDocument();
    expect(screen.getByText('2. Component Architecture in React')).toBeInTheDocument();
    expect(screen.getByText('3. Server-Side APIs with Express')).toBeInTheDocument();

    // 1 completed of 3 modules
    expect(screen.getByText('1/3')).toBeInTheDocument();
  });

  it('displays congratulations banner when all modules are complete', async () => {
    const completedModules = sampleModules.map((m) => ({ ...m, status: 'complete' }));

    api.getRoadmap.mockResolvedValueOnce({
      roadmap: { roleId: 'mern-developer', readinessScore: 100, modules: completedModules },
    });
    api.getRoles.mockResolvedValueOnce({ roles: [] });

    renderWithProviders(<DashboardPage />);

    expect(
      await screen.findByText('Outstanding Work! All Modules Complete'),
    ).toBeInTheDocument();
    expect(screen.getByText(/Explore Other Tracks/i)).toBeInTheDocument();
  });
});
