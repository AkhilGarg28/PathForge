import React from 'react';

export const QuizQuestion = React.memo(function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  selectedIndex = null,
  onSelectOption,
  disabled = false,
  className = ''
}) {
  const letters = ['A', 'B', 'C', 'D'];

  const handleKeyDown = (e, index) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectOption(index);
    }
  };

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--space-2)'
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span
          style={{
            fontSize: '0.8125rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'var(--color-primary)'
          }}
        >
          {question.dimension ? question.dimension.toUpperCase() : 'SKILL ASSESSMENT'}
        </span>
        {totalQuestions && (
          <span
            style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--color-text-muted)' }}
          >
            Question {questionNumber} of {totalQuestions}
          </span>
        )}
      </div>

      {/* Question Text */}
      <h2
        style={{
          fontSize: '1.125rem',
          fontWeight: 700,
          color: 'var(--color-neutral-900)',
          lineHeight: 1.4
        }}
      >
        {question.question}
      </h2>

      {/* 4 Choices */}
      <div
        role="radiogroup"
        aria-label={question.question}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-1-5)',
          marginTop: 'var(--space-1)'
        }}
      >
        {question.options.map((opt, idx) => {
          const isSelected = selectedIndex === idx;

          return (
            <div
              key={idx}
              role="radio"
              aria-checked={isSelected}
              tabIndex={disabled ? -1 : 0}
              onClick={() => !disabled && onSelectOption(idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-1-5)',
                padding: 'var(--space-1-5) var(--space-2)',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${isSelected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                backgroundColor: isSelected ? 'var(--color-primary-50)' : 'var(--color-surface)',
                cursor: disabled ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
                userSelect: 'none'
              }}
            >
              {/* Option Letter Badge */}
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.8125rem',
                  fontWeight: 700,
                  backgroundColor: isSelected ? 'var(--color-primary)' : 'var(--color-neutral-100)',
                  color: isSelected ? 'var(--color-neutral-0)' : 'var(--color-neutral-700)',
                  flexShrink: 0
                }}
              >
                {letters[idx] || idx + 1}
              </div>

              {/* Option Text */}
              <span
                style={{
                  fontSize: '0.9375rem',
                  fontWeight: isSelected ? 600 : 400,
                  color: isSelected ? 'var(--color-primary-900)' : 'var(--color-neutral-800)',
                  lineHeight: 1.4
                }}
              >
                {opt}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default QuizQuestion;
