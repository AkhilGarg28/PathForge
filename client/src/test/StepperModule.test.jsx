import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StepperModule from '../components/StepperModule.jsx';

describe('StepperModule Component', () => {
  it('renders locked module as disabled and prevents clicks', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <StepperModule
        stepNumber={1}
        title="Async JavaScript & Promises"
        description="Learn Promises, async/await, and microtasks"
        estimatedHours={8}
        status="locked"
        onClick={handleClick}
      />,
    );

    expect(screen.getByText('1. Async JavaScript & Promises')).toBeInTheDocument();
    expect(screen.getByText('Locked')).toBeInTheDocument();
    expect(screen.getByText('Complete prior module to unlock')).toBeInTheDocument();

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();

    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('renders active module as interactive and invokes onClick', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <StepperModule
        stepNumber={2}
        title="React Component Patterns"
        description="Compound components and custom hooks"
        estimatedHours={12}
        status="active"
        onClick={handleClick}
      />,
    );

    expect(screen.getByText('2. React Component Patterns')).toBeInTheDocument();
    expect(screen.getByText('In Progress')).toBeInTheDocument();
    expect(screen.getByText('⏱ 12 hrs estimated')).toBeInTheDocument();

    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();

    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders completed module with appropriate badge and allows clicking to review', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();

    render(
      <StepperModule
        stepNumber={3}
        title="Database Schema Design"
        description="Normalized schemas and indexes"
        estimatedHours={10}
        status="complete"
        onClick={handleClick}
      />,
    );

    expect(screen.getByText('3. Database Schema Design')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();

    const button = screen.getByRole('button');
    expect(button).not.toBeDisabled();

    await user.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('displays the Updated badge when isUpdated is true', () => {
    render(
      <StepperModule
        stepNumber={4}
        title="Modern Cloud Architecture"
        status="active"
        isUpdated={true}
      />,
    );

    expect(screen.getByText('Updated')).toBeInTheDocument();
  });
});
