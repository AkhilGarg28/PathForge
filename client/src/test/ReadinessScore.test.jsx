import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ReadinessScore from '../components/ReadinessScore.jsx';

describe('ReadinessScore Component', () => {
  it('renders score value, percentage symbol, and label in standard mode', () => {
    render(<ReadinessScore score={75} label="Employability Readiness" />);

    const meter = screen.getByRole('meter');
    expect(meter).toBeInTheDocument();
    expect(meter).toHaveAttribute('aria-valuenow', '75');
    expect(meter).toHaveAttribute('aria-label', 'Employability Readiness: 75 out of 100');

    expect(screen.getByText('75')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();
    expect(screen.getByText('Employability Readiness')).toBeInTheDocument();
  });

  it('clamps scores below 0 and above 100', () => {
    const { rerender } = render(<ReadinessScore score={-20} label="Score" />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '0');
    expect(screen.getByText('0')).toBeInTheDocument();

    rerender(<ReadinessScore score={150} label="Score" />);
    expect(screen.getByRole('meter')).toHaveAttribute('aria-valuenow', '100');
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('supports compact mode for mobile viewports without percent symbol', () => {
    render(<ReadinessScore score={88} label="Mobile Score" compact={true} />);

    const meter = screen.getByRole('meter');
    expect(meter).toHaveClass('pf-readiness-gauge--compact');
    expect(screen.getByText('88')).toBeInTheDocument();
    expect(screen.queryByText('%')).not.toBeInTheDocument();
  });
});
