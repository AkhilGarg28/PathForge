const {
  scoreDiagnostic,
  calculateReadiness,
} = require('../services/scoringService');

describe('Scoring Service Unit Tests', () => {
  const sampleQuestions = [
    { id: 'q1', dimension: 'Frontend React', correctIndex: 1 },
    { id: 'q2', dimension: 'Frontend React', correctIndex: 2 },
    { id: 'q3', dimension: 'Node & Express', correctIndex: 0 },
    { id: 'q4', dimension: 'Node & Express', correctIndex: 3 },
  ];

  describe('scoreDiagnostic', () => {
    it('should return 5.0 for all dimensions when all answers are correct', () => {
      const answers = [
        { questionId: 'q1', selectedIndex: 1 },
        { questionId: 'q2', selectedIndex: 2 },
        { questionId: 'q3', selectedIndex: 0 },
        { questionId: 'q4', selectedIndex: 3 },
      ];

      const scores = scoreDiagnostic(sampleQuestions, answers);
      expect(scores).toEqual({
        'Frontend React': 5,
        'Node & Express': 5,
      });

      const readiness = calculateReadiness(scores);
      expect(readiness).toBe(100);
    });

    it('should return 0 for all dimensions when all answers are wrong', () => {
      const answers = [
        { questionId: 'q1', selectedIndex: 0 },
        { questionId: 'q2', selectedIndex: 0 },
        { questionId: 'q3', selectedIndex: 1 },
        { questionId: 'q4', selectedIndex: 1 },
      ];

      const scores = scoreDiagnostic(sampleQuestions, answers);
      expect(scores).toEqual({
        'Frontend React': 0,
        'Node & Express': 0,
      });

      const readiness = calculateReadiness(scores);
      expect(readiness).toBe(0);
    });

    it('should accurately calculate mixed scores rounded to one decimal place', () => {
      const mixedQuestions = [
        { id: 'm1', dimension: 'Database', correctIndex: 0 },
        { id: 'm2', dimension: 'Database', correctIndex: 1 },
        { id: 'm3', dimension: 'Database', correctIndex: 2 },
        { id: 'm4', dimension: 'Security', correctIndex: 3 },
        { id: 'm5', dimension: 'Security', correctIndex: 0 },
      ];

      const answers = [
        { questionId: 'm1', selectedIndex: 0 }, // correct
        { questionId: 'm2', selectedIndex: 1 }, // correct
        { questionId: 'm3', selectedIndex: 0 }, // wrong -> 2/3 * 5 = 3.333 -> 3.3
        { questionId: 'm4', selectedIndex: 3 }, // correct
        { questionId: 'm5', dimension: 'Security', selectedIndex: 1 }, // wrong -> 1/2 * 5 = 2.5
      ];

      const scores = scoreDiagnostic(mixedQuestions, answers);
      expect(scores['Database']).toBe(3.3);
      expect(scores['Security']).toBe(2.5);

      const readiness = calculateReadiness(scores);
      // (3.3 + 2.5) / 10 * 100 = 58
      expect(readiness).toBe(58);
    });

    it('should handle a dimension with exactly one question (yielding 5.0 or 0)', () => {
      const singleQList = [
        { id: 'single1', dimension: 'Architecture', correctIndex: 2 },
      ];

      const correctAns = [{ questionId: 'single1', selectedIndex: 2 }];
      expect(scoreDiagnostic(singleQList, correctAns)).toEqual({
        Architecture: 5,
      });

      const wrongAns = [{ questionId: 'single1', selectedIndex: 0 }];
      expect(scoreDiagnostic(singleQList, wrongAns)).toEqual({
        Architecture: 0,
      });
    });

    it('should throw an error when inputs are not arrays', () => {
      expect(() => scoreDiagnostic(null, [])).toThrow();
      expect(() => scoreDiagnostic([], null)).toThrow();
    });

    it('should treat missing question answers as incorrect', () => {
      const answers = [
        { questionId: 'q1', selectedIndex: 1 }, // correct
        // q2 missing
        // q3 missing
        // q4 missing
      ];

      const scores = scoreDiagnostic(sampleQuestions, answers);
      expect(scores['Frontend React']).toBe(2.5); // 1 out of 2 = 2.5
      expect(scores['Node & Express']).toBe(0); // 0 out of 2 = 0
    });
  });

  describe('calculateReadiness', () => {
    it('should return 0 for empty or null dimension scores', () => {
      expect(calculateReadiness({})).toBe(0);
      expect(calculateReadiness(null)).toBe(0);
      expect(calculateReadiness(new Map())).toBe(0);
    });

    it('should handle Map instances as well as plain objects', () => {
      const scoreMap = new Map([
        ['React', 4],
        ['Node', 4],
      ]);
      expect(calculateReadiness(scoreMap)).toBe(80);
    });
  });
});
