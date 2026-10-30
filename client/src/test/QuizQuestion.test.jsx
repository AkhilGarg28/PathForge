import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import QuizQuestion from '../components/QuizQuestion.jsx';

describe('QuizQuestion Component', () => {
  const defaultOptions = [
    'Option A: First Choice',
    'Option B: Second Choice',
    'Option C: Third Choice',
    'Option D: Fourth Choice',
  ];

  it('renders question text, number, and accessibility roles', () => {
    render(
      <QuizQuestion
        questionId="q1"
        questionNumber={1}
        questionText="What is React reconciliation?"
        subtitle="Core concept"
        options={defaultOptions}
        selectedIndex={null}
        onSelectOption={vi.fn()}
      />,
    );

    // Legend & text
    expect(screen.getByText(/Q1\.\s+What is React reconciliation\?/i)).toBeInTheDocument();
    expect(screen.getByText('Core concept')).toBeInTheDocument();

    // Radiogroup accessibility
    const radioGroup = screen.getByRole('radiogroup');
    expect(radioGroup).toBeInTheDocument();

    // Radio inputs
    const radios = screen.getAllByRole('radio');
    expect(radios).toHaveLength(4);
    expect(radios[0]).not.toBeChecked();
  });

  it('handles selecting an option via click', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();

    render(
      <QuizQuestion
        questionId="q2"
        questionNumber={2}
        questionText="Select the correct lifecycle"
        options={defaultOptions}
        selectedIndex={null}
        onSelectOption={handleSelect}
      />,
    );

    const secondOption = screen.getByLabelText(/Option B: Second Choice/i);
    await user.click(secondOption);

    expect(handleSelect).toHaveBeenCalledTimes(1);
    expect(handleSelect).toHaveBeenCalledWith(1);
  });

  it('marks selected index and allows keyboard interaction', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();

    render(
      <QuizQuestion
        questionId="q3"
        questionNumber={3}
        questionText="Pick an architecture"
        options={defaultOptions}
        selectedIndex={0}
        onSelectOption={handleSelect}
      />,
    );

    const radios = screen.getAllByRole('radio');
    expect(radios[0]).toBeChecked();
    expect(radios[1]).not.toBeChecked();

    // Focus third radio and press space
    radios[2].focus();
    expect(radios[2]).toHaveFocus();
    await user.keyboard(' ');

    expect(handleSelect).toHaveBeenCalledWith(2);
  });

  it('renders result review badges correctly', () => {
    render(
      <QuizQuestion
        questionId="q4"
        questionNumber={4}
        questionText="Which statement is true?"
        options={defaultOptions}
        selectedIndex={0}
        correctIndex={1}
        showResult={true}
        onSelectOption={vi.fn()}
      />,
    );

    expect(screen.getByText('Your Choice')).toBeInTheDocument();
    expect(screen.getByText('Correct Answer')).toBeInTheDocument();

    const radios = screen.getAllByRole('radio');
    radios.forEach((radio) => {
      expect(radio).toBeDisabled();
    });
  });

  it('respects disabled prop', async () => {
    const user = userEvent.setup();
    const handleSelect = vi.fn();

    render(
      <QuizQuestion
        questionId="q5"
        questionNumber={5}
        questionText="Disabled question"
        options={defaultOptions}
        selectedIndex={null}
        disabled={true}
        onSelectOption={handleSelect}
      />,
    );

    const firstRadio = screen.getByLabelText(/Option A: First Choice/i);
    expect(firstRadio).toBeDisabled();

    await user.click(firstRadio);
    expect(handleSelect).not.toHaveBeenCalled();
  });
});
