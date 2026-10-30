import { calculateReadiness } from '../services/readinessService.js';

describe('Readiness Service - calculateReadiness Unit Tests', () => {
  const sampleModules = [
    { moduleId: 'm1', estimatedHours: 10, status: 'active' },
    { moduleId: 'm2', estimatedHours: 20, status: 'locked' },
    { moduleId: 'm3', estimatedHours: 10, status: 'locked' }
  ]; // Total = 40 hours

  test('calculates readiness correctly when no modules are complete (baseline diagnostic only)', () => {
    // avg = 3.0 out of 5 -> 60%
    // completion = 0 / 40 -> 0%
    // readiness = 0.4 * 60 + 0.6 * 0 = 24
    const score = calculateReadiness({
      dimensionScores: { dim1: 3.0, dim2: 3.0 },
      modules: sampleModules
    });

    expect(score).toBe(24);
  });

  test('calculates 100% readiness when diagnostic is perfect and all modules are complete', () => {
    const allCompleteModules = sampleModules.map((m) => ({ ...m, status: 'complete' }));

    const score = calculateReadiness({
      dimensionScores: { dim1: 5.0, dim2: 5.0 },
      modules: allCompleteModules
    });

    expect(score).toBe(100);
  });

  test('calculates partial readiness when some modules are completed', () => {
    // 10 + 20 = 30 completed hours out of 40 = 75% module completion
    // avg dimension score = (4.0 + 2.0) / 2 = 3.0 -> 60% diagnostic
    // readiness = 0.4 * 60 + 0.6 * 75 = 24 + 45 = 69
    const partiallyComplete = [
      { moduleId: 'm1', estimatedHours: 10, status: 'complete' },
      { moduleId: 'm2', estimatedHours: 20, status: 'complete' },
      { moduleId: 'm3', estimatedHours: 10, status: 'active' }
    ];

    const score = calculateReadiness({
      dimensionScores: { dim1: 4.0, dim2: 2.0 },
      modules: partiallyComplete
    });

    expect(score).toBe(69);
  });

  test('handles Map instance of dimensionScores', () => {
    const dimMap = new Map([
      ['dim1', 5.0],
      ['dim2', 5.0]
    ]);

    const score = calculateReadiness({
      dimensionScores: dimMap,
      modules: sampleModules // 0 complete -> 0.4 * 100 = 40
    });

    expect(score).toBe(40);
  });

  test('handles zero total hours or missing modules gracefully', () => {
    const score = calculateReadiness({
      dimensionScores: { dim1: 5.0 },
      modules: []
    });

    expect(score).toBe(40);
  });

  test('clamps score between 0 and 100', () => {
    const zeroScore = calculateReadiness({
      dimensionScores: { dim1: 0.0 },
      modules: sampleModules
    });
    expect(zeroScore).toBe(0);
  });
});
