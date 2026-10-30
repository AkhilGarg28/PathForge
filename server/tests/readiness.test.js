const { calculateReadiness } = require('../services/readinessService');

describe('readinessService Unit Tests', () => {
  it('should return 0 when modules array is empty or not provided', () => {
    expect(calculateReadiness([])).toBe(0);
    expect(calculateReadiness(null)).toBe(0);
    expect(calculateReadiness(undefined)).toBe(0);
  });

  it('should return 0 when all modules are locked or active (none complete)', () => {
    const modules = [
      { moduleId: 'm1', estimatedHours: 10, status: 'active' },
      { moduleId: 'm2', estimatedHours: 20, status: 'locked' },
    ];
    expect(calculateReadiness(modules)).toBe(0);
  });

  it('should return 100 when all modules are complete', () => {
    const modules = [
      { moduleId: 'm1', estimatedHours: 10, status: 'complete' },
      { moduleId: 'm2', estimatedHours: 25, status: 'complete' },
      { moduleId: 'm3', estimatedHours: 15, status: 'complete' },
    ];
    expect(calculateReadiness(modules)).toBe(100);
  });

  it('should calculate weighted readiness accurately with unequal hours', () => {
    const modules = [
      { moduleId: 'm1', estimatedHours: 10, status: 'complete' },
      { moduleId: 'm2', estimatedHours: 30, status: 'locked' },
    ];
    // 10 / (10 + 30) = 25%
    expect(calculateReadiness(modules)).toBe(25);
  });

  it('should round readiness score to the nearest integer', () => {
    const modules = [
      { moduleId: 'm1', estimatedHours: 10, status: 'complete' },
      { moduleId: 'm2', estimatedHours: 20, status: 'locked' },
    ];
    // 10 / 30 = 33.333% -> 33
    expect(calculateReadiness(modules)).toBe(33);

    const modules2 = [
      { moduleId: 'm1', estimatedHours: 20, status: 'complete' },
      { moduleId: 'm2', estimatedHours: 10, status: 'locked' },
    ];
    // 20 / 30 = 66.666% -> 67
    expect(calculateReadiness(modules2)).toBe(67);
  });

  it('should fallback to unweighted count ratio when all estimatedHours are zero', () => {
    const modules = [
      { moduleId: 'm1', estimatedHours: 0, status: 'complete' },
      { moduleId: 'm2', estimatedHours: 0, status: 'locked' },
    ];
    // 1 out of 2 completed = 50%
    expect(calculateReadiness(modules)).toBe(50);
  });
});
