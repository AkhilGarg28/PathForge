/**
 * PathForge Dynamic Weekly Quiz & Adaptive Assessment Controller
 * Serves dynamic quizzes, evaluates performance, and triggers automated roadmap adaptations.
 */

import WeeklyQuiz from '../models/WeeklyQuiz.js';
import PersonalizedRoadmap from '../models/PersonalizedRoadmap.js';
import StudentSkill from '../models/StudentSkill.js';
import {
  generateWeeklyQuiz,
  evaluateWeeklyQuizSubmission
} from '../services/adaptiveQuizService.js';
import { adaptRoadmapAfterQuiz } from '../services/personalizedRoadmapService.js';

export const getWeeklyQuiz = async (req, res) => {
  const userId = req.user._id;
  const weekNumber = Number(req.params.weekNumber) || 1;

  // Check if an existing quiz record exists for this week
  let quiz = await WeeklyQuiz.findOne({ userId, weekNumber });

  if (!quiz) {
    const roadmap = await PersonalizedRoadmap.findOne({ userId }).sort({ createdAt: -1 });
    const weekData = roadmap?.weeks?.find((w) => w.weekNumber === weekNumber);

    const targetRole = roadmap?.targetRole || 'MERN Developer';
    const isDA = targetRole.toLowerCase().includes('data') || targetRole.toLowerCase().includes('analyst');
    const defaultFocus = isDA ? ['Excel', 'SQL', 'Python'] : ['JavaScript', 'React'];
    const generated = await generateWeeklyQuiz({
      weekNumber,
      weekTitle: weekData?.title || `Week ${weekNumber} Curriculum`,
      focusSkills: weekData?.focusSkills || defaultFocus,
      difficulty: weekData?.difficulty || 'Intermediate',
      track: isDA ? 'data-analyst' : 'mern'
    });

    quiz = await WeeklyQuiz.create({
      userId,
      roadmapId: roadmap?._id || null,
      weekNumber,
      title: generated.title,
      difficulty: generated.difficulty,
      questions: generated.questions,
      attempts: [],
      isCompleted: false
    });
  }

  // Never reveal correctIndex to client before submission!
  const sanitizedQuestions = quiz.questions.map((q) => ({
    id: q.id,
    question: q.question,
    type: q.type,
    codeSnippet: q.codeSnippet || '',
    options: q.options,
    skill: q.skill,
    topic: q.topic
  }));

  return res.status(200).json({
    success: true,
    data: {
      quizId: quiz._id,
      weekNumber: quiz.weekNumber,
      title: quiz.title,
      difficulty: quiz.difficulty,
      isCompleted: quiz.isCompleted,
      latestScore: quiz.latestScore,
      questions: sanitizedQuestions
    }
  });
};

export const submitWeeklyQuiz = async (req, res) => {
  const userId = req.user._id;
  const weekNumber = Number(req.params.weekNumber) || 1;
  const { answers } = req.body; // { 'w1-q1': 1, 'w1-q2': 0, ... }

  if (!answers || typeof answers !== 'object') {
    return res.status(400).json({
      success: false,
      message: 'Quiz answers payload is required'
    });
  }

  const quiz = await WeeklyQuiz.findOne({ userId, weekNumber });
  if (!quiz) {
    return res.status(404).json({ success: false, message: 'Quiz not found for this week' });
  }

  // Evaluate candidate answers against correct indices
  const evaluation = evaluateWeeklyQuizSubmission({
    questions: quiz.questions,
    userAnswers: answers
  });

  // Record attempt in WeeklyQuiz
  const attempt = {
    attemptNumber: quiz.attempts.length + 1,
    submittedAt: new Date(),
    answers: evaluation.attemptAnswers,
    scorePercent: evaluation.scorePercent,
    passed: evaluation.passed,
    performanceCategory: evaluation.performanceCategory,
    weakTopics: evaluation.weakTopics,
    strongTopics: evaluation.strongTopics,
    feedbackMessage: evaluation.feedbackMessage,
    roadmapActionTaken: evaluation.roadmapActionTaken
  };

  quiz.attempts.push(attempt);
  quiz.latestScore = evaluation.scorePercent;
  quiz.isCompleted = true;
  await quiz.save();

  // AUTOMATIC ROADMAP ADJUSTMENT (Phase 5)
  // Adapt future roadmap based on performance category & weak topics
  const roadmap = await PersonalizedRoadmap.findOne({ userId }).sort({ createdAt: -1 });
  if (roadmap) {
    const updatedRoadmap = adaptRoadmapAfterQuiz({
      roadmap: roadmap.toObject(),
      weekNumber,
      quizScore: evaluation.scorePercent,
      weakTopics: evaluation.weakTopics
    });

    await PersonalizedRoadmap.findByIdAndUpdate(roadmap._id, updatedRoadmap, { new: true });
  }

  // Update StudentSkill proficiency records
  for (const q of quiz.questions) {
    if (q.skill) {
      const isCorrect = answers[q.id] === q.correctIndex;
      const delta = isCorrect ? 5 : -5;
      await StudentSkill.findOneAndUpdate(
        { userId, skill: q.skill },
        {
          $inc: { proficiencyScore: delta },
          $push: {
            history: {
              proficiencyScore: Math.min(100, Math.max(0, evaluation.scorePercent)),
              source: 'Weekly Quiz',
              note: `Week ${weekNumber} Quiz result: ${evaluation.scorePercent}%`
            }
          }
        }
      );
    }
  }

  // Detailed question explanations returned only AFTER submission
  const questionsWithExplanations = quiz.questions.map((q) => {
    const userAnswerIndex = answers[q.id];
    return {
      id: q.id,
      question: q.question,
      codeSnippet: q.codeSnippet || '',
      options: q.options,
      correctIndex: q.correctIndex,
      userAnswerIndex: userAnswerIndex !== undefined ? Number(userAnswerIndex) : -1,
      isCorrect: userAnswerIndex !== undefined && Number(userAnswerIndex) === q.correctIndex,
      explanation: q.explanation,
      topic: q.topic
    };
  });

  return res.status(200).json({
    success: true,
    message: 'Quiz evaluated and roadmap adapted successfully',
    data: {
      scorePercent: evaluation.scorePercent,
      passed: evaluation.passed,
      correctCount: evaluation.correctCount,
      totalQuestions: evaluation.totalQuestions,
      performanceCategory: evaluation.performanceCategory,
      feedbackMessage: evaluation.feedbackMessage,
      roadmapActionTaken: evaluation.roadmapActionTaken,
      weakTopics: evaluation.weakTopics,
      strongTopics: evaluation.strongTopics,
      reviewQuestions: questionsWithExplanations
    }
  });
};

export const getQuizHistory = async (req, res) => {
  const userId = req.user._id;
  const quizzes = await WeeklyQuiz.find({ userId }).sort({ weekNumber: 1 });

  return res.status(200).json({
    success: true,
    data: { quizzes }
  });
};

export default {
  getWeeklyQuiz,
  submitWeeklyQuiz,
  getQuizHistory
};
