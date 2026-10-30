import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../components/Button.jsx';
import { ProgressBar } from '../components/ProgressBar.jsx';
import { ReadinessScore } from '../components/ReadinessScore.jsx';
import { StatusCircle } from '../components/StatusCircle.jsx';
import { QuizQuestion } from '../components/QuizQuestion.jsx';
import { EmptyState } from '../components/EmptyState.jsx';
import { ErrorState } from '../components/ErrorState.jsx';
import { api } from '../services/api.js';

describe('Design System & UI Components', () => {
  describe('Button', () => {
    it('renders with children and handles clicks', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>Click Me</Button>);
      const btn = screen.getByRole('button', { name: /click me/i });
      expect(btn).toBeInTheDocument();
      fireEvent.click(btn);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('renders disabled state when disabled prop is passed', () => {
      const handleClick = vi.fn();
      render(
        <Button disabled onClick={handleClick}>
          Disabled
        </Button>
      );
      const btn = screen.getByRole('button', { name: /disabled/i });
      expect(btn).toBeDisabled();
      fireEvent.click(btn);
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('renders loading state with spinner', () => {
      render(<Button loading>Submit</Button>);
      const btn = screen.getByRole('button');
      expect(btn).toBeDisabled();
    });
  });

  describe('ProgressBar (Strict Amber Accent)', () => {
    it('calculates and displays progress percentage properly', () => {
      render(<ProgressBar value={50} max={100} label="Completion" />);
      expect(screen.getByText('Completion')).toBeInTheDocument();
      expect(screen.getByText('50%')).toBeInTheDocument();
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '50');
    });

    it('clamps negative values to 0%', () => {
      render(<ProgressBar value={-10} max={100} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '0');
    });

    it('clamps values above max to 100%', () => {
      render(<ProgressBar value={150} max={100} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '100');
    });
  });

  describe('ReadinessScore', () => {
    it('renders normalized percentage and correct readiness tier', () => {
      render(<ReadinessScore score={75} size="md" />);
      expect(screen.getByText('75%')).toBeInTheDocument();
      expect(screen.getByText('Job Competent')).toBeInTheDocument();
    });

    it('displays Interview Ready tier for high scores (>= 85)', () => {
      render(<ReadinessScore score={90} size="lg" />);
      expect(screen.getByText('90%')).toBeInTheDocument();
      expect(screen.getByText('Interview Ready')).toBeInTheDocument();
    });

    it('displays Foundational Stage for scores below 30', () => {
      render(<ReadinessScore score={20} size="sm" />);
      expect(screen.getByText('20%')).toBeInTheDocument();
      expect(screen.getByText('Foundational Stage')).toBeInTheDocument();
    });
  });

  describe('StatusCircle', () => {
    it('renders active status with accessible aria-label', () => {
      render(<StatusCircle status="active" />);
      expect(screen.getByLabelText('Module status: active')).toBeInTheDocument();
    });

    it('renders complete status with accessible aria-label', () => {
      render(<StatusCircle status="complete" />);
      expect(screen.getByLabelText('Module status: complete')).toBeInTheDocument();
    });

    it('renders locked status with accessible aria-label', () => {
      render(<StatusCircle status="locked" />);
      expect(screen.getByLabelText('Module status: locked')).toBeInTheDocument();
    });
  });

  describe('QuizQuestion (Accessible)', () => {
    const mockQuestion = {
      id: 'q-1',
      dimension: 'javascript',
      question: 'What is a closure in JavaScript?',
      options: ['Option A', 'Option B', 'Option C', 'Option D']
    };

    it('renders question text and all 4 options', () => {
      render(
        <QuizQuestion
          question={mockQuestion}
          questionNumber={1}
          totalQuestions={12}
          onSelectOption={() => {}}
        />
      );
      expect(screen.getByText('What is a closure in JavaScript?')).toBeInTheDocument();
      expect(screen.getByText('Question 1 of 12')).toBeInTheDocument();
      expect(screen.getByText('Option A')).toBeInTheDocument();
      expect(screen.getByText('Option D')).toBeInTheDocument();
    });

    it('triggers onSelectOption on option click', () => {
      const handleSelect = vi.fn();
      render(
        <QuizQuestion
          question={mockQuestion}
          questionNumber={1}
          totalQuestions={12}
          onSelectOption={handleSelect}
        />
      );
      fireEvent.click(screen.getByText('Option B'));
      expect(handleSelect).toHaveBeenCalledWith(1);
    });

    it('supports keyboard navigation via Enter key', () => {
      const handleSelect = vi.fn();
      render(
        <QuizQuestion
          question={mockQuestion}
          questionNumber={1}
          totalQuestions={12}
          onSelectOption={handleSelect}
        />
      );
      const radio = screen.getAllByRole('radio')[2];
      fireEvent.keyDown(radio, { key: 'Enter', code: 'Enter' });
      expect(handleSelect).toHaveBeenCalledWith(2);
    });
  });

  describe('EmptyState & ErrorState', () => {
    it('renders EmptyState with action', () => {
      const handleAction = vi.fn();
      render(
        <EmptyState
          title="No Data"
          description="Nothing here"
          actionLabel="Add Item"
          onAction={handleAction}
        />
      );
      expect(screen.getByText('No Data')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /add item/i }));
      expect(handleAction).toHaveBeenCalledTimes(1);
    });

    it('renders ErrorState with retry button', () => {
      const handleRetry = vi.fn();
      render(<ErrorState title="Failed" message="Something went wrong" onRetry={handleRetry} />);
      expect(screen.getByText('Failed')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('button', { name: /try again/i }));
      expect(handleRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('API Service Mock Layer', () => {
    it('returns contract mock data when VITE_USE_MOCK is active', async () => {
      const rolesRes = await api.getRoles();
      expect(rolesRes.success).toBe(true);
      expect(rolesRes.data.roles).toHaveLength(2);
      expect(rolesRes.data.roles[0].name).toBe('MERN Developer');

      const userRes = await api.getMe();
      expect(userRes.success).toBe(true);
      expect(userRes.data.user.email).toBe('alex.mercer@example.com');

      const roadmapRes = await api.getRoadmap();
      expect(roadmapRes.success).toBe(true);
      expect(roadmapRes.data.roadmap.modules.length).toBeGreaterThan(0);
    });
  });
});
