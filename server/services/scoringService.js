/**
 * Pure scoring functions for PathForge diagnostic assessments
 */

/**
 * Calculates dimension scores on a 0-5 scale.
 * Formula per dimension: (correct / total) * 5, rounded to 1 decimal place.
 *
 * @param {Array<{id: string, dimension: string, correctIndex: number}>} questions
 * @param {Array<{questionId: string, selectedIndex: number}>} answers
 * @returns {Record<string, number>} dimensionScores
 */
const scoreDiagnostic = (questions, answers) => {
  if (!Array.isArray(questions) || !Array.isArray(answers)) {
    throw new Error('Questions and answers must be arrays');
  }

  const answerMap = new Map();
  answers.forEach((ans) => {
    answerMap.set(ans.questionId, ans.selectedIndex);
  });

  // Tally counts per dimension: { total: number, correct: number }
  const dimensionStats = {};

  questions.forEach((q) => {
    const dim = q.dimension;
    if (!dimensionStats[dim]) {
      dimensionStats[dim] = { total: 0, correct: 0 };
    }
    dimensionStats[dim].total += 1;

    const selectedIndex = answerMap.get(q.id);
    if (selectedIndex !== undefined && selectedIndex === q.correctIndex) {
      dimensionStats[dim].correct += 1;
    }
  });

  const dimensionScores = {};

  Object.entries(dimensionStats).forEach(([dim, stats]) => {
    if (stats.total === 0) {
      dimensionScores[dim] = 0;
    } else {
      const rawScore = (stats.correct / stats.total) * 5;
      dimensionScores[dim] = Math.round(rawScore * 10) / 10;
    }
  });

  return dimensionScores;
};

/**
 * Calculates an overall readiness score from 0 to 100 based on dimension scores.
 *
 * @param {Record<string, number> | Map<string, number>} dimensionScores
 * @returns {number} readinessScore (0-100)
 */
const calculateReadiness = (dimensionScores) => {
  if (!dimensionScores) return 0;

  const scores =
    dimensionScores instanceof Map
      ? Array.from(dimensionScores.values())
      : Object.values(dimensionScores);

  if (scores.length === 0) return 0;

  const totalSum = scores.reduce((sum, score) => sum + (Number(score) || 0), 0);
  const maxPossible = scores.length * 5;

  const percentage = (totalSum / maxPossible) * 100;
  return Math.round(percentage);
};

module.exports = {
  scoreDiagnostic,
  calculateReadiness,
};
