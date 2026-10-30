/**
 * Pure scoring function evaluating assessment answers against a set of diagnostic questions.
 *
 * @param {Array} questions - Diagnostic questions with { id, dimension, correctIndex, options }
 * @param {Array} answers - User answers with { questionId, selectedIndex }
 * @returns {Object} { dimensionScores: { [dimension]: number }, overall: number, weakDimensions: string[] }
 */
export function scoreAnswers(questions, answers) {
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new Error('questions must be a non-empty array');
  }

  if (!Array.isArray(answers)) {
    throw new Error('answers must be an array');
  }

  // 1. Build question lookup map
  const questionMap = new Map();
  for (const q of questions) {
    if (!q.id || !q.dimension || typeof q.correctIndex !== 'number') {
      throw new Error(`Invalid question structure for ID: ${q?.id}`);
    }
    questionMap.set(q.id, q);
  }

  // 2. Validate answers for duplicates, unknown question IDs, and out-of-range indices
  const seenQuestionIds = new Set();
  const answerMap = new Map();

  for (const ans of answers) {
    if (!ans || typeof ans.questionId !== 'string') {
      throw new Error('Each answer must provide a valid questionId string');
    }

    if (seenQuestionIds.has(ans.questionId)) {
      throw new Error(`Duplicate answer for question ID: ${ans.questionId}`);
    }
    seenQuestionIds.add(ans.questionId);

    const question = questionMap.get(ans.questionId);
    if (!question) {
      throw new Error(`Unknown question ID: ${ans.questionId}`);
    }

    const maxOptions = Array.isArray(question.options) ? question.options.length : 4;
    if (
      typeof ans.selectedIndex !== 'number' ||
      !Number.isInteger(ans.selectedIndex) ||
      ans.selectedIndex < 0 ||
      ans.selectedIndex >= maxOptions
    ) {
      throw new Error(
        `Invalid selectedIndex '${ans.selectedIndex}' for question ID: ${ans.questionId}. Expected integer between 0 and ${maxOptions - 1}.`
      );
    }

    answerMap.set(ans.questionId, ans.selectedIndex);
  }

  // 3. Group questions by dimension and count correct answers
  const dimensionStats = {};

  for (const q of questions) {
    if (!dimensionStats[q.dimension]) {
      dimensionStats[q.dimension] = { total: 0, correct: 0 };
    }
    dimensionStats[q.dimension].total += 1;

    // Missing answers are treated as wrong (selectedIndex will be undefined)
    const userSelected = answerMap.get(q.id);
    if (userSelected !== undefined && userSelected === q.correctIndex) {
      dimensionStats[q.dimension].correct += 1;
    }
  }

  // 4. Calculate score per dimension (0 to 5, 1 decimal place) and detect weak dimensions (< 3.0)
  const dimensionScores = {};
  const weakDimensions = [];
  let totalScoreSum = 0;
  let dimensionCount = 0;

  for (const [dimension, stats] of Object.entries(dimensionStats)) {
    const rawScore = stats.total > 0 ? (stats.correct / stats.total) * 5 : 0;
    const score = Number(rawScore.toFixed(1));

    dimensionScores[dimension] = score;
    if (score < 3.0) {
      weakDimensions.push(dimension);
    }

    totalScoreSum += score;
    dimensionCount += 1;
  }

  // Overall average across dimensions (0 to 5, 1 decimal place)
  const overall = dimensionCount > 0 ? Number((totalScoreSum / dimensionCount).toFixed(1)) : 0.0;

  return {
    dimensionScores,
    overall,
    weakDimensions
  };
}

export default { scoreAnswers };
