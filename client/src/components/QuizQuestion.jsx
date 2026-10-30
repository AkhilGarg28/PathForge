import { useId, memo } from 'react';
import './QuizQuestion.css';

/**
 * Accessible question card rendering an HTML <fieldset> and 4 radio options.
 * Fully supports arrow-key navigation and optional review result states.
 * Wrapped in React.memo to prevent unnecessary re-renders during assessment progression.
 */
function QuizQuestion({
  questionId,
  questionNumber,
  questionText,
  subtitle,
  options = [],
  selectedIndex = null,
  onSelectOption,
  showResult = false,
  correctIndex = null,
  disabled = false,
  className = '',
}) {
  const autoId = useId();
  const name = `quiz-q-${questionId || autoId}`;

  return (
    <fieldset className={`pf-quiz-question ${className}`.trim()}>
      <legend className="pf-quiz-question__legend">
        {questionNumber ? `Q${questionNumber}. ` : ''}
        {questionText}
        {subtitle && <span className="pf-quiz-question__subtitle">{subtitle}</span>}
      </legend>

      <div className="pf-quiz-question__options" role="radiogroup">
        {options.map((option, index) => {
          const isSelected = selectedIndex === index;
          const optionId = `${name}-opt-${index}`;

          // Result review indicators
          let reviewClass = '';
          let badgeText = null;

          if (showResult) {
            if (correctIndex !== null && index === correctIndex) {
              reviewClass = 'pf-quiz-option--result-correct';
              badgeText = 'Correct Answer';
            } else if (isSelected && correctIndex !== null && index !== correctIndex) {
              reviewClass = 'pf-quiz-option--result-incorrect';
              badgeText = 'Your Choice';
            } else if (isSelected) {
              reviewClass = 'pf-quiz-option--selected';
              badgeText = 'Selected';
            }
          } else if (isSelected) {
            reviewClass = 'pf-quiz-option--selected';
          }

          return (
            <label
              key={index}
              htmlFor={optionId}
              className={`pf-quiz-option ${reviewClass} ${disabled || showResult ? 'pf-quiz-option--disabled' : ''}`.trim()}
            >
              <input
                id={optionId}
                type="radio"
                name={name}
                value={index}
                checked={isSelected}
                disabled={disabled || showResult}
                onChange={() => onSelectOption?.(index)}
                className="pf-quiz-option__input"
              />

              <span className="pf-quiz-option__text">
                {typeof option === 'string' ? option : option?.text || ''}
              </span>

              {badgeText && (
                <span className="pf-quiz-option__badge" aria-hidden="true">
                  {badgeText}
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export default memo(QuizQuestion);
