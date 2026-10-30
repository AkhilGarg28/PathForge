import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Routes, Route } from 'react-router-dom';
import ModuleDetailPage from '../pages/ModuleDetailPage.jsx';
import * as api from '../services/api.js';
import { renderWithProviders } from './testUtils.jsx';

vi.mock('../services/api.js', () => ({
  getRoadmap: vi.fn(),
  completeModule: vi.fn(),
}));

describe('ModuleDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockRoadmap = {
    roleId: 'mern-developer',
    modules: [
      {
        moduleId: 'mod-1',
        title: 'Modern JavaScript & Async Foundations',
        description: 'Deep dive into event loop and promises',
        estimatedHours: 8,
        status: 'complete',
        resources: [{ title: 'MDN Event Loop', url: 'https://mdn.dev', type: 'doc' }],
      },
      {
        moduleId: 'mod-2',
        title: 'Component Architecture in React',
        description: 'Deep dive into state hooks',
        estimatedHours: 12,
        status: 'active',
        resources: [{ title: 'React Hooks Guide', url: 'https://react.dev', type: 'article' }],
      },
      {
        moduleId: 'mod-3',
        title: 'Backend Systems with Node',
        description: 'Server architectures',
        estimatedHours: 14,
        status: 'locked',
        resources: [],
      },
    ],
  };

  it('renders "Mark as Complete" button ONLY for the active module', async () => {
    const user = userEvent.setup();
    api.getRoadmap.mockResolvedValueOnce({ roadmap: mockRoadmap });
    api.completeModule.mockResolvedValueOnce({ success: true, nextModuleId: 'mod-3' });

    renderWithProviders(
      <Routes>
        <Route path="/module/:moduleId" element={<ModuleDetailPage />} />
        <Route path="/dashboard" element={<div>Dashboard Target</div>} />
      </Routes>,
      {
        initialEntries: ['/module/mod-2'],
      },
    );

    expect(await screen.findByText('Component Architecture in React')).toBeInTheDocument();

    const completeBtn = screen.getByRole('button', { name: /Mark as Complete/i });
    expect(completeBtn).toBeInTheDocument();

    await user.click(completeBtn);
    await waitFor(() => {
      expect(api.completeModule).toHaveBeenCalledWith('mod-2');
    });
  });

  it('renders read-only completed state without complete button for complete module', async () => {
    api.getRoadmap.mockResolvedValueOnce({ roadmap: mockRoadmap });

    renderWithProviders(
      <Routes>
        <Route path="/module/:moduleId" element={<ModuleDetailPage />} />
        <Route path="/dashboard" element={<div>Dashboard Target</div>} />
      </Routes>,
      {
        initialEntries: ['/module/mod-1'],
      },
    );

    expect(
      await screen.findByText('Modern JavaScript & Async Foundations'),
    ).toBeInTheDocument();
    expect(screen.getByText('Milestone Complete!')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Mark as Complete/i })).not.toBeInTheDocument();
  });

  it('redirects to /dashboard if module is locked', async () => {
    api.getRoadmap.mockResolvedValueOnce({ roadmap: mockRoadmap });

    renderWithProviders(
      <Routes>
        <Route path="/module/:moduleId" element={<ModuleDetailPage />} />
        <Route path="/dashboard" element={<div>Dashboard Target</div>} />
      </Routes>,
      {
        initialEntries: ['/module/mod-3'],
      },
    );

    expect(await screen.findByText('Dashboard Target')).toBeInTheDocument();
    expect(screen.queryByText('Backend Systems with Node')).not.toBeInTheDocument();
  });
});
