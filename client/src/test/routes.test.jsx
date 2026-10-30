import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext.jsx';
import { ToastProvider } from '../context/ToastContext.jsx';
import { App } from '../App.jsx';
import { setMockMode } from '../services/api.js';

describe('App Routing & Route Protection', () => {
  beforeEach(() => {
    setMockMode(true);
  });

  it('renders landing page on root route', async () => {
    window.history.pushState({}, 'Test', '/');
    render(<App />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', {
          name: /ai-powered personalized skill roadmaps for employability/i
        })
      ).toBeInTheDocument();
    });
  });

  it('renders styleguide page on /styleguide', async () => {
    window.history.pushState({}, 'Test', '/styleguide');
    render(<App />);

    await waitFor(
      () => {
        expect(screen.getByText(/pathforge component styleguide/i)).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  it('renders sign in page on /login', async () => {
    window.history.pushState({}, 'Test', '/login');
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /sign in to pathforge/i })).toBeInTheDocument();
    });
  });

  it('renders sign up page on /signup', async () => {
    window.history.pushState({}, 'Test', '/signup');
    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /create your account/i })).toBeInTheDocument();
    });
  });
});
