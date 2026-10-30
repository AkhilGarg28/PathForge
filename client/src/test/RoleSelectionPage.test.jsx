import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RoleSelectionPage from '../pages/RoleSelectionPage.jsx';
import * as api from '../services/api.js';
import { renderWithProviders } from './testUtils.jsx';

vi.mock('../services/api.js', () => ({
  getRoles: vi.fn(),
  setUserRole: vi.fn(),
}));

describe('RoleSelectionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockRoles = [
    {
      id: 'mern-developer',
      title: 'MERN Stack Developer',
      description: 'Full-stack engineering with MongoDB, Express, React, and Node.js.',
      dimensions: ['Frontend', 'Backend', 'Database', 'DevOps'],
    },
    {
      id: 'data-analyst',
      title: 'Data Analyst',
      description: 'Data transformation, SQL querying, visualization, and Python.',
      dimensions: ['SQL', 'Python', 'BI Tools', 'Statistics'],
    },
  ];

  it('renders loading skeletons on mount', () => {
    api.getRoles.mockReturnValue(new Promise(() => {})); // pending

    renderWithProviders(<RoleSelectionPage />);

    expect(screen.getByLabelText(/Loading available career tracks/i)).toBeInTheDocument();
  });

  it('renders error state and handles retry', async () => {
    const user = userEvent.setup();
    api.getRoles.mockRejectedValueOnce(new Error('Network error loading roles'));

    renderWithProviders(<RoleSelectionPage />);

    expect(await screen.findByText('Could not load roles')).toBeInTheDocument();
    expect(screen.getAllByText('Network error loading roles').length).toBeGreaterThan(0);

    // Now mock success for retry
    api.getRoles.mockResolvedValueOnce({ roles: mockRoles });
    await user.click(screen.getByRole('button', { name: /Retry Loading Roles/i }));

    expect(await screen.findByText('MERN Stack Developer')).toBeInTheDocument();
  });

  it('renders empty state when no roles are returned', async () => {
    api.getRoles.mockResolvedValueOnce({ roles: [] });

    renderWithProviders(<RoleSelectionPage />);

    expect(await screen.findByText('No roles available yet')).toBeInTheDocument();
  });

  it('allows selecting a role card and continuing to diagnostic', async () => {
    const user = userEvent.setup();
    api.getRoles.mockResolvedValueOnce({ roles: mockRoles });
    api.setUserRole.mockResolvedValueOnce({ success: true, roleId: 'mern-developer' });
    const mockRefreshUser = vi.fn().mockResolvedValue({});

    renderWithProviders(<RoleSelectionPage />, {
      authOverrides: { refreshUser: mockRefreshUser },
    });

    expect(await screen.findByText('MERN Stack Developer')).toBeInTheDocument();

    const continueBtn = screen.getByRole('button', { name: /Continue to Diagnostic/i });
    expect(continueBtn).toBeDisabled();

    // Select MERN card
    const mernCard = screen.getByLabelText(/MERN Stack Developer/i);
    await user.click(mernCard);

    expect(continueBtn).not.toBeDisabled();

    // Click Continue
    await user.click(continueBtn);

    await waitFor(() => {
      expect(api.setUserRole).toHaveBeenCalledWith('mern-developer');
      expect(mockRefreshUser).toHaveBeenCalled();
    });
  });

  it('displays active roadmap warning when user already has an assigned role', async () => {
    api.getRoles.mockResolvedValueOnce({ roles: mockRoles });

    renderWithProviders(<RoleSelectionPage />, {
      user: { id: 'u1', name: 'Learner', roleId: 'mern-developer' },
    });

    expect(
      await screen.findByText(/Notice: Active Roadmap in Progress/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/You currently have an active roadmap for/i),
    ).toBeInTheDocument();
  });
});
