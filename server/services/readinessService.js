/**
 * Calculates student readiness score combining diagnostic performance and module completion progress.
 *
 * Contract Formula:
 * Readiness = round(0.4 * (avgDimensionScore / 5 * 100) + 0.6 * (completedHours / totalHours * 100))
 *
 * @param {Object} params
 * @param {Map|Object} params.dimensionScores - Dimension scores (0-5 per dimension)
 * @param {Array} params.modules - Roadmap module objects with { estimatedHours, status }
 * @returns {number} Integer between 0 and 100
 */
export function calculateReadiness({ dimensionScores, modules }) {
  // 1. Calculate average dimension score
  let avgDimensionScore = 0;
  if (dimensionScores) {
    const scores =
      dimensionScores instanceof Map
        ? Array.from(dimensionScores.values())
        : Object.values(dimensionScores);

    if (scores.length > 0) {
      const sum = scores.reduce(
        (acc, val) => acc + (typeof val === 'number' && !Number.isNaN(val) ? val : 0),
        0
      );
      avgDimensionScore = sum / scores.length;
    }
  }

  // 2. Calculate module completed hours vs total hours
  let completedHours = 0;
  let totalHours = 0;

  if (Array.isArray(modules)) {
    for (const mod of modules) {
      const hours =
        typeof mod.estimatedHours === 'number' && mod.estimatedHours > 0 ? mod.estimatedHours : 0;
      totalHours += hours;
      if (mod.status === 'complete') {
        completedHours += hours;
      }
    }
  }

  // Diagnostic score weight (40%) scaled from 0-5 to 0-100%
  const diagnosticScorePct = (avgDimensionScore / 5) * 100;

  // Module completion weight (60%)
  const completionPct = totalHours > 0 ? (completedHours / totalHours) * 100 : 0;

  const rawReadiness = 0.4 * diagnosticScorePct + 0.6 * completionPct;
  const rounded = Math.round(rawReadiness);

  return Math.max(0, Math.min(100, rounded));
}

export default { calculateReadiness };
