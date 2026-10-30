import React from 'react';
import Card from './Card';

/**
 * QuizQuestion Component
 *
 * Displays a single quiz question with dimension tag, prompt, and interactive options list.
 * Reused across both the Diagnostic Quiz and Module Checkpoint Quizzes.
 *
 * Props:
 * - question: { id, question, options, dimension, roleName }
 * - selectedIndex: number | undefined
 * - onSelectOption: (index: number) => void
 * - disabled?: boolean
 * - className?: string
 */
const QuizQuestion = ({
  question,
  selectedIndex,
  onSelectOption,
  disabled = false,
  className = '',
}) => {
  if (!question) return null;

  return (
    <Card className={`diagnostic-question-card quiz-question-card ${className}`}>
      {question.dimension && (
        <div className="question-dimension-tag">
          <span className="dimension-label-pill">Dimension: {question.dimension}</span>
        </div>
      )}

      <h2 className="question-prompt-text">{question.question}</h2>

      {/* Interactive Options List */}
      <div
        className="options-container"
        role="radiogroup"
        aria-label={question.question}
      >
        {question.options.map((optionText, optIdx) => {
          const isOptionSelected = selectedIndex === optIdx;

          return (
            <div
              key={optIdx}
              className={`diagnostic-option-card ${isOptionSelected ? 'selected' : ''} ${
                disabled ? 'disabled' : ''
              }`}
              onClick={() => {
                if (!disabled && onSelectOption) {
                  onSelectOption(optIdx);
                }
              }}
              onKeyDown={(e) => {
                if (!disabled && onSelectOption && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onSelectOption(optIdx);
                }
              }}
              tabIndex={disabled ? -1 : 0}
              role="radio"
              aria-checked={isOptionSelected}
              aria-disabled={disabled}
            >
              <div className="option-indicator-bubble">
                {String.fromCharCode(65 + optIdx)}
              </div>
              <div className="option-text-content">{optionText}</div>
              {isOptionSelected && (
                <div className="option-selected-check" aria-hidden="true">
                  ✓
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default QuizQuestion;
