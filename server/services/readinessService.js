/**
 * Readiness Calculation Service
 *
 * Implements the contract formula for roadmap readiness:
 * Percentage of completed modules weighted by estimatedHours on a 0-100 scale.
 */

/**
 * Calculates readiness percentage (0-100) weighted by module estimatedHours.
 *
 * Formula:
 * readinessScore = round((sum of completed estimatedHours / sum of total estimatedHours) * 100)
 *
 * @param {Array<{estimatedHours?: number, status: string}>} modules
 * @returns {number} readinessScore (0-100)
 */
const calculateReadiness = (modules) => {
  if (!Array.isArray(modules) || modules.length === 0) {
    return 0;
  }

  let totalHours = 0;
  let completedHours = 0;

  modules.forEach((mod) => {
    const hours = Number(mod.estimatedHours) || 0;
    totalHours += hours;
    if (mod.status === 'complete') {
      completedHours += hours;
    }
  });

  if (totalHours === 0) {
    const totalCount = modules.length;
    const completedCount = modules.filter((m) => m.status === 'complete').length;
    return Math.round((completedCount / totalCount) * 100);
  }

  const rawScore = (completedHours / totalHours) * 100;
  const boundedScore = Math.min(100, Math.max(0, Math.round(rawScore)));

  return boundedScore;
};

module.exports = {
  calculateReadiness,
  calculateWeightedReadiness: calculateReadiness,
};
