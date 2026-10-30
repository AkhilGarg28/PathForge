/**
 * PathForge Analytics Controller
 * Aggregates learning telemetry: quiz score progression, skill proficiency curves,
 * daily completion consistency, and readiness evolution (Phase 8).
 */

import WeeklyQuiz from '../models/WeeklyQuiz.js';
import StudentSkill from '../models/StudentSkill.js';
import SkillAssessment from '../models/SkillAssessment.js';
import PersonalizedRoadmap from '../models/PersonalizedRoadmap.js';

export const getAnalyticsOverview = async (req, res) => {
  const userId = req.user._id;

  const [quizzes, skills, assessment, roadmap] = await Promise.all([
    WeeklyQuiz.find({ userId }).sort({ weekNumber: 1 }),
    StudentSkill.find({ userId }).sort({ proficiencyScore: -1 }),
    SkillAssessment.findOne({ userId }).sort({ createdAt: -1 }),
    PersonalizedRoadmap.findOne({ userId }).sort({ createdAt: -1 })
  ]);

  // 1. Quiz Score Trends
  const quizTrends = quizzes.map((q) => {
    const latestAttempt = q.attempts?.slice(-1)[0];
    return {
      weekNumber: q.weekNumber,
      title: q.title || `Week ${q.weekNumber}`,
      score: q.latestScore || 0,
      passed: latestAttempt ? latestAttempt.passed : (q.latestScore || 0) >= 70,
      submittedAt: latestAttempt?.submittedAt || q.updatedAt
    };
  });

  // 2. Skill Improvement (Initial vs Current)
  const skillMatrix = skills.map((s) => ({
    skill: s.skill,
    category: s.category || 'Technical',
    resumeClaim: s.resumeClaim || 'Not claimed',
    githubEvidence: s.githubEvidence || 'None',
    verifiedLevel: s.verifiedLevel || 'Beginner',
    proficiencyScore: Math.min(100, Math.max(0, s.proficiencyScore || 0)),
    historyCount: s.history?.length || 0
  }));

  // 3. Consistency and Task Completion
  let totalTasks = 0;
  let completedTasks = 0;
  if (roadmap?.weeks) {
    for (const w of roadmap.weeks) {
      if (w.dailyTasks) {
        for (const t of w.dailyTasks) {
          totalTasks += 1;
          if (t.isCompleted) completedTasks += 1;
        }
      }
    }
  }

  const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // 4. Initial vs Current Readiness
  const initialScore = assessment?.overallScore || 0;
  const currentAvgQuizScore = quizTrends.length > 0
    ? Math.round(quizTrends.reduce((acc, q) => acc + q.score, 0) / quizTrends.length)
    : initialScore;

  // Aggregate weak & strong skills across quizzes and assessment
  const allWeak = new Set(assessment?.weakSkills || []);
  const allStrong = new Set(assessment?.strongSkills || []);

  quizzes.forEach((q) => {
    q.attempts?.forEach((a) => {
      a.weakTopics?.forEach((t) => allWeak.add(t));
      a.strongTopics?.forEach((t) => allStrong.add(t));
    });
  });

  return res.status(200).json({
    success: true,
    data: {
      initialScore,
      currentReadinessScore: currentAvgQuizScore,
      totalQuizzesTaken: quizzes.filter((q) => q.isCompleted).length,
      completionPercent,
      completedTasks,
      totalTasks,
      activeWeek: roadmap?.currentWeekNumber || 1,
      roadmapVersion: roadmap?.version || 1,
      quizTrends,
      skillMatrix,
      weakTopics: Array.from(allWeak),
      strongTopics: Array.from(allStrong)
    }
  });
};

export default {
  getAnalyticsOverview
};
