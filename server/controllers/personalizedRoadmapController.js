/**
 * PathForge Personalized Learning Roadmap Controller
 * Coordinates creation, retrieval, daily task completion tracking,
 * and topic deep-dive learning resource generation.
 */

import PersonalizedRoadmap from '../models/PersonalizedRoadmap.js';
import SkillAssessment from '../models/SkillAssessment.js';
import UserProfile from '../models/UserProfile.js';
import StudentSkill from '../models/StudentSkill.js';
import { buildDeterministicRoadmap } from '../services/personalizedRoadmapService.js';
import { generateTopicDeepDive } from '../services/aiTutorService.js';

export const generatePersonalizedRoadmap = async (req, res) => {
  const userId = req.user._id;

  const assessment = await SkillAssessment.findOne({ userId, status: 'completed' })
    .sort({ completedAt: -1 });
  const profile = await UserProfile.findOne({ userId });
  const skills = await StudentSkill.find({ userId });

  const targetRole = profile?.targetRole || assessment?.targetRole || 'Full Stack MERN Developer';
  const claimVerifications = assessment?.claimVerifications || [];

  // Generate curriculum roadmap tailored to student
  const roadmapData = buildDeterministicRoadmap({
    targetRole,
    verifiedSkills: skills,
    claimVerifications
  });

  // Archive any prior roadmap and save new active version
  const newRoadmap = await PersonalizedRoadmap.create({
    userId,
    targetRole,
    version: 1,
    totalWeeks: roadmapData.totalWeeks,
    currentWeek: 1,
    currentWeekNumber: 1,
    progressPercent: 0,
    readinessScore: assessment?.readinessScore || 28,
    phases: roadmapData.phases,
    weeks: roadmapData.weeks,
    changeHistory: [
      {
        date: new Date(),
        version: 1,
        triggerWeek: 1,
        action: 'INITIAL_GENERATION',
        reason: `Personalized curriculum forged for ${targetRole} addressing verified skills and claim assessments.`,
        score: assessment?.overallScorePercent || null
      }
    ]
  });

  // Link active roadmap in UserProfile
  await UserProfile.findOneAndUpdate(
    { userId },
    { activeRoadmapId: newRoadmap._id }
  );

  return res.status(201).json({
    success: true,
    message: 'Personalized learning roadmap generated successfully',
    data: { roadmap: newRoadmap }
  });
};

export const getPersonalizedRoadmap = async (req, res) => {
  const userId = req.user._id;

  let roadmap = await PersonalizedRoadmap.findOne({ userId })
    .sort({ createdAt: -1 });

  // Auto-generate if student completed readiness test but doesn't have a roadmap yet
  if (!roadmap) {
    const assessment = await SkillAssessment.findOne({ userId, status: 'completed' });
    const profile = await UserProfile.findOne({ userId });
    const skills = await StudentSkill.find({ userId });

    const roadmapData = buildDeterministicRoadmap({
      targetRole: profile?.targetRole || 'Full Stack MERN Developer',
      verifiedSkills: skills,
      claimVerifications: assessment?.claimVerifications || []
    });

    roadmap = await PersonalizedRoadmap.create({
      userId,
      targetRole: profile?.targetRole || 'Full Stack MERN Developer',
      version: 1,
      totalWeeks: roadmapData.totalWeeks,
      currentWeek: 1,
      currentWeekNumber: 1,
      progressPercent: 0,
      readinessScore: assessment?.readinessScore || 30,
      phases: roadmapData.phases,
      weeks: roadmapData.weeks,
      changeHistory: [
        {
          date: new Date(),
          version: 1,
          triggerWeek: 1,
          action: 'INITIAL_GENERATION',
          reason: 'Initial personalized curriculum created.',
          score: null
        }
      ]
    });
  }

  return res.status(200).json({
    success: true,
    data: { roadmap }
  });
};

export const toggleDailyTask = async (req, res) => {
  const userId = req.user._id;
  const { weekNumber, dayIndex } = req.params;

  const roadmap = await PersonalizedRoadmap.findOne({ userId }).sort({ createdAt: -1 });
  if (!roadmap) {
    return res.status(404).json({ success: false, message: 'Roadmap not found' });
  }

  const week = roadmap.weeks.find((w) => w.weekNumber === Number(weekNumber));
  if (!week) {
    return res.status(404).json({ success: false, message: 'Week not found in roadmap' });
  }

  const task = week.dailyTasks[Number(dayIndex)];
  if (!task) {
    return res.status(404).json({ success: false, message: 'Task not found' });
  }

  const newStatus = !(task.completed || task.isCompleted);
  task.completed = newStatus;
  task.isCompleted = newStatus;
  task.completedAt = newStatus ? new Date() : null;

  // Check if all tasks in the week are complete
  const allTasksDone = week.dailyTasks.every((t) => t.completed || t.isCompleted);

  // Calculate overall roadmap progress percentage
  let totalTasks = 0;
  let completedTasks = 0;
  roadmap.weeks.forEach((w) => {
    w.dailyTasks.forEach((t) => {
      totalTasks += 1;
      if (t.completed || t.isCompleted) completedTasks += 1;
    });
  });
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  roadmap.progressPercent = progressPercent;

  await roadmap.save();

  return res.status(200).json({
    success: true,
    message: newStatus ? 'Task marked as complete' : 'Task marked as incomplete',
    data: {
      task,
      isCompleted: newStatus,
      completed: newStatus,
      progressPercent,
      allTasksDone,
      completedCount: week.dailyTasks.filter((t) => t.completed || t.isCompleted).length,
      totalCount: week.dailyTasks.length
    }
  });
};

export const getTopicGuide = async (req, res) => {
  const { topicTitle, skill, targetRole } = req.query;

  if (!topicTitle) {
    return res.status(400).json({ success: false, message: 'topicTitle query parameter is required' });
  }

  const guide = await generateTopicDeepDive({
    topicTitle,
    skill: skill || 'Full Stack Engineering',
    targetRole: targetRole || 'Software Engineer'
  });

  return res.status(200).json({
    success: true,
    data: { guide }
  });
};

export default {
  generatePersonalizedRoadmap,
  getPersonalizedRoadmap,
  toggleDailyTask,
  getTopicGuide
};
