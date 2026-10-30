import { scoreAnswers } from '../services/scoringService.js';

describe('Scoring Service - scoreAnswers Unit Tests', () => {
  // Mock 4-dimension questions set (3 questions each = 12 total)
  const mockQuestions = [
    { id: 'q-js-1', dimension: 'javascript', correctIndex: 1, options: ['A', 'B', 'C', 'D'] },
    { id: 'q-js-2', dimension: 'javascript', correctIndex: 2, options: ['A', 'B', 'C', 'D'] },
    { id: 'q-js-3', dimension: 'javascript', correctIndex: 0, options: ['A', 'B', 'C', 'D'] },

    { id: 'q-react-1', dimension: 'react', correctIndex: 3, options: ['A', 'B', 'C', 'D'] },
    { id: 'q-react-2', dimension: 'react', correctIndex: 1, options: ['A', 'B', 'C', 'D'] },
    { id: 'q-react-3', dimension: 'react', correctIndex: 2, options: ['A', 'B', 'C', 'D'] },

    { id: 'q-node-1', dimension: 'node-express', correctIndex: 0, options: ['A', 'B', 'C', 'D'] },
    { id: 'q-node-2', dimension: 'node-express', correctIndex: 1, options: ['A', 'B', 'C', 'D'] },
    { id: 'q-node-3', dimension: 'node-express', correctIndex: 2, options: ['A', 'B', 'C', 'D'] },

    { id: 'q-db-1', dimension: 'databases-git', correctIndex: 3, options: ['A', 'B', 'C', 'D'] },
    { id: 'q-db-2', dimension: 'databases-git', correctIndex: 0, options: ['A', 'B', 'C', 'D'] },
    { id: 'q-db-3', dimension: 'databases-git', correctIndex: 1, options: ['A', 'B', 'C', 'D'] }
  ];

  test('all correct answers yields 5.0 for all dimensions and overall with empty weakDimensions', () => {
    const answers = mockQuestions.map((q) => ({
      questionId: q.id,
      selectedIndex: q.correctIndex
    }));

    const result = scoreAnswers(mockQuestions, answers);

    expect(result.dimensionScores).toEqual({
      javascript: 5.0,
      react: 5.0,
      'node-express': 5.0,
      'databases-git': 5.0
    });
    expect(result.overall).toBe(5.0);
    expect(result.weakDimensions).toEqual([]);
  });

  test('all wrong answers yields 0.0 for all dimensions and marks all dimensions weak', () => {
    const answers = mockQuestions.map((q) => ({
      questionId: q.id,
      selectedIndex: (q.correctIndex + 1) % 4
    }));

    const result = scoreAnswers(mockQuestions, answers);

    expect(result.dimensionScores).toEqual({
      javascript: 0.0,
      react: 0.0,
      'node-express': 0.0,
      'databases-git': 0.0
    });
    expect(result.overall).toBe(0.0);
    expect(result.weakDimensions).toEqual(['javascript', 'react', 'node-express', 'databases-git']);
  });

  test('partial correct answers calculates fractional 0-5 scores (1 decimal) and identifies weak dimensions (< 3.0)', () => {
    // javascript: 3/3 = 5.0 (strong)
    // react: 2/3 = 3.3 (strong)
    // node-express: 1/3 = 1.7 (weak)
    // databases-git: 0/3 = 0.0 (weak)
    const answers = [
      // javascript: 3 correct
      { questionId: 'q-js-1', selectedIndex: 1 },
      { questionId: 'q-js-2', selectedIndex: 2 },
      { questionId: 'q-js-3', selectedIndex: 0 },
      // react: 2 correct, 1 wrong
      { questionId: 'q-react-1', selectedIndex: 3 },
      { questionId: 'q-react-2', selectedIndex: 1 },
      { questionId: 'q-react-3', selectedIndex: 0 }, // wrong (correct: 2)
      // node-express: 1 correct, 2 wrong
      { questionId: 'q-node-1', selectedIndex: 0 },
      { questionId: 'q-node-2', selectedIndex: 3 }, // wrong (correct: 1)
      { questionId: 'q-node-3', selectedIndex: 3 }, // wrong (correct: 2)
      // databases-git: 0 correct
      { questionId: 'q-db-1', selectedIndex: 0 }, // wrong (correct: 3)
      { questionId: 'q-db-2', selectedIndex: 1 }, // wrong (correct: 0)
      { questionId: 'q-db-3', selectedIndex: 2 } // wrong (correct: 1)
    ];

    const result = scoreAnswers(mockQuestions, answers);

    expect(result.dimensionScores.javascript).toBe(5.0);
    expect(result.dimensionScores.react).toBe(3.3);
    expect(result.dimensionScores['node-express']).toBe(1.7);
    expect(result.dimensionScores['databases-git']).toBe(0.0);
    expect(result.overall).toBe(2.5); // (5.0 + 3.3 + 1.7 + 0.0) / 4 = 2.5
    expect(result.weakDimensions).toEqual(['node-express', 'databases-git']);
  });

  test('missing answers count as wrong without throwing error', () => {
    // Only answer 2 questions (1 in javascript, 1 in react)
    const answers = [
      { questionId: 'q-js-1', selectedIndex: 1 }, // correct
      { questionId: 'q-react-1', selectedIndex: 3 } // correct
    ];

    const result = scoreAnswers(mockQuestions, answers);

    expect(result.dimensionScores.javascript).toBe(1.7); // 1/3 * 5 = 1.67 -> 1.7
    expect(result.dimensionScores.react).toBe(1.7);
    expect(result.dimensionScores['node-express']).toBe(0.0);
    expect(result.dimensionScores['databases-git']).toBe(0.0);
    expect(result.weakDimensions.length).toBe(4);
  });

  test('throws clear error on unknown question ID', () => {
    const answers = [{ questionId: 'unknown-question-id', selectedIndex: 1 }];

    expect(() => scoreAnswers(mockQuestions, answers)).toThrow(
      /Unknown question ID: unknown-question-id/
    );
  });

  test('throws clear error on out-of-range selectedIndex (negative or too large)', () => {
    const negativeIndexAnswers = [{ questionId: 'q-js-1', selectedIndex: -1 }];
    expect(() => scoreAnswers(mockQuestions, negativeIndexAnswers)).toThrow(
      /Invalid selectedIndex '-1'/
    );

    const oversizedIndexAnswers = [{ questionId: 'q-js-1', selectedIndex: 4 }];
    expect(() => scoreAnswers(mockQuestions, oversizedIndexAnswers)).toThrow(
      /Invalid selectedIndex '4'/
    );
  });

  test('throws clear error on duplicate answers for the same question', () => {
    const duplicateAnswers = [
      { questionId: 'q-js-1', selectedIndex: 1 },
      { questionId: 'q-js-1', selectedIndex: 2 }
    ];

    expect(() => scoreAnswers(mockQuestions, duplicateAnswers)).toThrow(
      /Duplicate answer for question ID: q-js-1/
    );
  });

  test('accurately scores a single dimension questions array', () => {
    const singleDimQuestions = [
      { id: 'q-stat-1', dimension: 'statistics', correctIndex: 2, options: ['A', 'B', 'C', 'D'] },
      { id: 'q-stat-2', dimension: 'statistics', correctIndex: 0, options: ['A', 'B', 'C', 'D'] }
    ];

    // 1 correct out of 2 = 50% -> 2.5 score
    const answers = [
      { questionId: 'q-stat-1', selectedIndex: 2 },
      { questionId: 'q-stat-2', selectedIndex: 3 }
    ];

    const result = scoreAnswers(singleDimQuestions, answers);

    expect(result.dimensionScores).toEqual({ statistics: 2.5 });
    expect(result.overall).toBe(2.5);
    expect(result.weakDimensions).toEqual(['statistics']);
  });
});
