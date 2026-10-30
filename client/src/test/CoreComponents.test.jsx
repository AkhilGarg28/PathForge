import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from '../components/Modal.jsx';
import Input from '../components/Input.jsx';
import ErrorBoundary from '../components/ErrorBoundary.jsx';
import OfflineBanner from '../components/OfflineBanner.jsx';
import NotFoundPage from '../pages/NotFoundPage.jsx';
import { renderWithProviders } from './testUtils.jsx';

describe('Core Application Components', () => {
  describe('Modal Component', () => {
    it('renders dialog when isOpen is true and calls onClose on Escape key', () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Test Modal">
          <p>Modal content</p>
          <button type="button">Focusable Button</button>
        </Modal>,
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal content')).toBeInTheDocument();

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when backdrop is clicked and closeOnBackdrop is true', async () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Backdrop Test">
          <p>Inner content</p>
        </Modal>,
      );

      const backdrop = screen.getByRole('presentation');
      await userEvent.click(backdrop);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not render when isOpen is false', () => {
      render(
        <Modal isOpen={false} onClose={vi.fn()} title="Hidden Modal">
          <p>Invisible content</p>
        </Modal>,
      );

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  describe('Input Component', () => {
    it('toggles password visibility when toggle button is clicked', async () => {
      render(
        <Input
          label="Password"
          type="password"
          id="test-pwd"
          placeholder="Enter password"
        />,
      );

      const input = screen.getByLabelText(/^Password/i);
      expect(input).toHaveAttribute('type', 'password');

      const toggleBtn = screen.getByRole('button', { name: /Show password/i });
      await userEvent.click(toggleBtn);

      expect(input).toHaveAttribute('type', 'text');
      expect(
        screen.getByRole('button', { name: /Hide password/i }),
      ).toBeInTheDocument();

      await userEvent.click(screen.getByRole('button', { name: /Hide password/i }));
      expect(input).toHaveAttribute('type', 'password');
    });

    it('associates error text via aria-describedby and role=alert', () => {
      render(
        <Input
          label="Username"
          id="test-user"
          error="Username is already taken"
        />,
      );

      const input = screen.getByLabelText(/^Username/i);
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByRole('alert')).toHaveTextContent('Username is already taken');
    });
  });

  describe('ErrorBoundary Component', () => {
    const ProblematicComponent = () => {
      throw new Error('Test crash in child component');
    };

    it('catches render error and displays accessible fallback card', () => {
      // Suppress expected console.error during ErrorBoundary test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <ProblematicComponent />
        </ErrorBoundary>,
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { name: /Something went wrong/i }),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Reload page/i })).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('OfflineBanner Component', () => {
    it('displays offline notice when network connectivity is lost and restores on reconnect', () => {
      render(<OfflineBanner />);

      // Initially online (nothing rendered)
      expect(screen.queryByText(/You are currently offline/i)).not.toBeInTheDocument();

      // Trigger offline event
      act(() => {
        window.dispatchEvent(new Event('offline'));
      });

      expect(screen.getByText(/You are currently offline/i)).toBeInTheDocument();

      // Trigger online event
      act(() => {
        window.dispatchEvent(new Event('online'));
      });

      expect(screen.getByText(/Internet connection restored/i)).toBeInTheDocument();
    });
  });

  describe('NotFoundPage Component', () => {
    it('renders 404 message and link to home', () => {
      renderWithProviders(<NotFoundPage />);

      expect(
        screen.getByRole('heading', { name: /Page Not Found/i }),
      ).toBeInTheDocument();
      expect(screen.getByText(/Error 404/i)).toBeInTheDocument();
      expect(
        screen.getByRole('link', { name: /Return to Home/i }),
      ).toHaveAttribute('href', '/');
    });
  });
});
