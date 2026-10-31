/**
 * PathForge Question Selector & Cryptographic/True Random Shuffler
 * Selects, filters, and dynamically shuffles questions and their answer options
 * while strictly guaranteeing that correct answers remain accurate.
 */

import { mernQuestions } from '../mockData/mernQuestions.js';
import { dataAnalystQuestions } from '../mockData/dataAnalystQuestions.js';

/**
 * Fisher-Yates array shuffle algorithm
 * @param {Array} array
 * @returns {Array} New shuffled array
 */
export function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Shuffles the answer options of a single question and updates the correctIndex
 * to strictly match the newly positioned correct option.
 *
 * @param {Object} question
 * @returns {Object} Question with shuffled options and updated correctIndex
 */
export function shuffleQuestionOptions(question) {
  if (!question || !Array.isArray(question.options) || question.options.length === 0) {
    return question;
  }

  const originalCorrectIndex = Number.isInteger(question.correctIndex) ? question.correctIndex : 0;
  const correctOptionText = question.options[originalCorrectIndex];

  // Pair each option with whether it is the correct answer
  const indexedOptions = question.options.map((opt, idx) => ({
    text: opt,
    isCorrect: idx === originalCorrectIndex
  }));

  // Shuffle the options
  const shuffledIndexed = shuffleArray(indexedOptions);

  // Determine the new correctIndex
  const newCorrectIndex = shuffledIndexed.findIndex((item) => item.isCorrect);

  return {
    ...question,
    options: shuffledIndexed.map((item) => item.text),
    correctIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0
  };
}

/**
 * Retrieves the complete question pool for a given career track
 *
 * @param {string} track - 'mern' | 'data-analyst' or role name
 * @returns {Array<Object>}
 */
export function getTrackQuestions(track = 'mern') {
  const normTrack = String(track || '').toLowerCase();
  if (normTrack.includes('data') || normTrack.includes('analyst')) {
    return dataAnalystQuestions;
  }
  return mernQuestions;
}

/**
 * Selects a customized, randomized quiz question set from the mock database
 * with anti-repetition tracking and option shuffling.
 *
 * @param {Object} options
 * @param {string} [options.track='mern'] - Career track
 * @param {string} [options.difficulty='Intermediate'] - 'Beginner' | 'Intermediate' | 'Advanced' | 'Adaptive'
 * @param {number} [options.count=8] - Number of questions to return
 * @param {Array<string>} [options.excludeIds=[]] - IDs of recently taken questions to avoid repeats
 * @param {Array<string>} [options.focusSkills=[]] - Optional skill filtering
 * @returns {{ questions: Array<Object>, source: 'mock_bank', track: string, totalAvailable: number }}
 */
export function selectQuizQuestions({
  track = 'mern',
  difficulty = 'Intermediate',
  count = 8,
  excludeIds = [],
  focusSkills = []
} = {}) {
  const allPool = getTrackQuestions(track);
  const excludeSet = new Set(excludeIds || []);

  // 1. Filter out recently seen questions if possible
  let candidatePool = allPool.filter((q) => !excludeSet.has(q.id));

  // If excluding recently seen questions leaves too few items, reset to entire pool
  if (candidatePool.length < count) {
    candidatePool = [...allPool];
  }

  // 2. Skill filtering if specified
  if (Array.isArray(focusSkills) && focusSkills.length > 0) {
    const focusLower = focusSkills.map((s) => String(s).toLowerCase());
    const skillMatches = candidatePool.filter((q) =>
      focusLower.some((f) => q.skill.toLowerCase().includes(f) || q.topic.toLowerCase().includes(f))
    );
    if (skillMatches.length >= Math.min(count, 4)) {
      candidatePool = skillMatches;
    }
  }

  // 3. Difficulty selection
  let selected = [];
  const normDiff = String(difficulty || 'Intermediate').toLowerCase();

  if (normDiff === 'adaptive' || normDiff === 'mixed') {
    // Balanced distribution: 30% Beginner, 40% Intermediate, 30% Advanced
    const beg = shuffleArray(candidatePool.filter((q) => q.difficulty === 'Beginner'));
    const inter = shuffleArray(candidatePool.filter((q) => q.difficulty === 'Intermediate'));
    const adv = shuffleArray(candidatePool.filter((q) => q.difficulty === 'Advanced'));

    const begCount = Math.max(1, Math.round(count * 0.3));
    const advCount = Math.max(1, Math.round(count * 0.3));
    const interCount = Math.max(1, count - begCount - advCount);

    selected = [
      ...beg.slice(0, begCount),
      ...inter.slice(0, interCount),
      ...adv.slice(0, advCount)
    ];

    // If still short of count, fill from remaining
    if (selected.length < count) {
      const selectedIds = new Set(selected.map((q) => q.id));
      const remaining = shuffleArray(candidatePool.filter((q) => !selectedIds.has(q.id)));
      selected = [...selected, ...remaining.slice(0, count - selected.length)];
    }
  } else {
    // Target specific difficulty
    const targetDiff =
      normDiff.includes('begin') ? 'Beginner' : normDiff.includes('adv') ? 'Advanced' : 'Intermediate';

    const matched = shuffleArray(candidatePool.filter((q) => q.difficulty === targetDiff));
    const other = shuffleArray(candidatePool.filter((q) => q.difficulty !== targetDiff));

    selected = [...matched, ...other].slice(0, count);
  }

  // 4. Shuffle selected questions order
  const shuffledQuestions = shuffleArray(selected);

  // 5. Shuffle answer options for every question while preserving correctIndex accuracy
  const finalQuestions = shuffledQuestions.map(shuffleQuestionOptions);

  return {
    questions: finalQuestions,
    source: 'mock_bank',
    track: getTrackQuestions(track) === dataAnalystQuestions ? 'data-analyst' : 'mern',
    totalAvailable: allPool.length
  };
}

export default {
  shuffleArray,
  shuffleQuestionOptions,
  getTrackQuestions,
  selectQuizQuestions
};
