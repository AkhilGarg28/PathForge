import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext.jsx';
import { useAuth } from '../hooks/useAuth.js';
import * as api from '../services/api.js';

vi.mock('../services/api.js');

describe('AuthContext Session Management & Global 401 Handling', () => {
  let unauthorizedCallback = null;

  beforeEach(() => {
    vi.clearAllMocks();
    api.onUnauthorized.mockImplementation((cb) => {
      unauthorizedCallback = cb;
      return () => {
        unauthorizedCallback = null;
      };
    });
  });

  const TestConsumer = () => {
    const { user, loading, login, logout, refreshUser } = useAuth();
    const location = useLocation();

    if (loading) return <div>Auth Checking...</div>;

    return (
      <div>
        <div data-testid="user-display">
          {user ? `Logged in as: ${user.name} (${user.email})` : 'Guest'}
        </div>
        <div data-testid="location-display">Path: {location.pathname}</div>
        <div data-testid="location-state">
          State: {location.state?.message || 'none'}
        </div>

        <button
          onClick={() => login('dev@test.com', 'Valid1234')}
          type="button"
        >
          Trigger Login
        </button>
        <button onClick={() => logout()} type="button">
          Trigger Logout
        </button>
        <button onClick={() => refreshUser()} type="button">
          Trigger Refresh
        </button>
      </div>
    );
  };

  it('checks session on mount and sets user when valid session exists', async () => {
    api.getMe.mockResolvedValueOnce({
      user: { id: 'u1', name: 'Alex Johnson', email: 'alex@example.com' },
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      </MemoryRouter>,
    );

    expect(screen.getByText('Auth Checking...')).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText('Logged in as: Alex Johnson (alex@example.com)'),
      ).toBeInTheDocument();
    });
  });

  it('handles guest state when getMe rejects or returns null', async () => {
    api.getMe.mockRejectedValueOnce(new Error('Unauthorized'));

    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Guest')).toBeInTheDocument();
    });
  });

  it('updates state on successful login and logout', async () => {
    api.getMe.mockResolvedValueOnce({ user: null });
    api.login.mockResolvedValueOnce({
      user: { id: 'u2', name: 'Dev User', email: 'dev@test.com' },
    });
    api.logout.mockResolvedValueOnce({ success: true });

    render(
      <MemoryRouter initialEntries={['/']}>
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText('Guest')).toBeInTheDocument();
    });

    // Trigger Login
    await userEvent.click(screen.getByRole('button', { name: /Trigger Login/i }));

    await waitFor(() => {
      expect(
        screen.getByText('Logged in as: Dev User (dev@test.com)'),
      ).toBeInTheDocument();
    });

    // Trigger Logout
    await userEvent.click(screen.getByRole('button', { name: /Trigger Logout/i }));

    await waitFor(() => {
      expect(screen.getByText('Guest')).toBeInTheDocument();
    });
  });

  it('handles global 401 session expiration by clearing user and redirecting to /login with state message', async () => {
    api.getMe.mockResolvedValueOnce({
      user: { id: 'u3', name: 'Active User', email: 'active@test.com' },
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
          <Routes>
            <Route path="/dashboard" element={<TestConsumer />} />
            <Route path="/login" element={<TestConsumer />} />
          </Routes>
        </AuthProvider>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(
        screen.getByText('Logged in as: Active User (active@test.com)'),
      ).toBeInTheDocument();
    });

    // Simulate 401 session expiration notification from api service
    expect(unauthorizedCallback).toBeTypeOf('function');
    act(() => {
      unauthorizedCallback();
    });

    await waitFor(() => {
      expect(screen.getByText('Path: /login')).toBeInTheDocument();
      expect(
        screen.getByText('State: Session expired, please log in again'),
      ).toBeInTheDocument();
      expect(screen.getByText('Guest')).toBeInTheDocument();
    });
  });
});
