/**
 * PathForge System & Mock Mode Controller
 * Handles operational mode toggling, AI & Database health probes,
 * mock question generation, and progress reset endpoints.
 */

import {
  systemSettings,
  getSystemMode,
  updateSystemSettings,
  testAiConnection,
  testDatabaseConnection
} from '../services/aiFallbackService.js';
import { selectQuizQuestions, getTrackQuestions } from '../services/questionSelector.js';
import { getRecommendationsMock } from '../mockData/mockRecommendations.js';
import { mernQuestions } from '../mockData/mernQuestions.js';
import { dataAnalystQuestions } from '../mockData/dataAnalystQuestions.js';
import User from '../models/User.js';
import Roadmap from '../models/Roadmap.js';

/**
 * GET /api/system/mode
 * Returns active system mode, available mock question counts, and diagnostic telemetry.
 */
export async function getSystemStatus(req, res, next) {
  try {
    const activeMode = getSystemMode();
    return res.status(200).json({
      success: true,
      data: {
        activeMode,
        preferredMode: systemSettings.preferredMode,
        recentFailures: systemSettings.recentFailures,
        lastAiCheck: systemSettings.lastAiCheck,
        lastDbCheck: systemSettings.lastDbCheck,
        questionCounts: {
          mern: mernQuestions.length,
          dataAnalyst: dataAnalystQuestions.length,
          total: mernQuestions.length + dataAnalystQuestions.length
        }
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/system/settings
 * Updates preferred mode ('auto' | 'ai_only' | 'mock_only')
 */
export async function updateSettings(req, res, next) {
  try {
    const { preferredMode } = req.body;
    const updated = updateSystemSettings({ preferredMode });
    return res.status(200).json({
      success: true,
      message: `System mode updated to ${updated.preferredMode} (Active: ${updated.activeMode})`,
      data: updated
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/system/test-ai
 * Probes the configured AI provider with a lightweight prompt
 */
export async function probeAi(req, res, next) {
  try {
    const check = await testAiConnection();
    return res.status(200).json({
      success: check.status === 'healthy',
      message: check.status === 'healthy' ? 'AI Provider is active and responding!' : 'AI Provider test failed; fallback mode active.',
      data: check
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/system/test-db
 * Probes the active MongoDB connection
 */
export async function probeDb(req, res, next) {
  try {
    const check = await testDatabaseConnection();
    return res.status(200).json({
      success: check.status === 'connected',
      message: check.status === 'connected' ? 'MongoDB connection is healthy!' : 'MongoDB connection failed.',
      data: check
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/system/mock-assessment
 * Generates a fresh randomized mock assessment with shuffled questions & options
 */
export async function getMockAssessment(req, res, next) {
  try {
    const track = req.query.track || 'mern';
    const difficulty = req.query.difficulty || 'Adaptive';
    const count = Number(req.query.count) || 8;

    const result = selectQuizQuestions({
      track,
      difficulty,
      count
    });

    return res.status(200).json({
      success: true,
      data: result
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/system/recommendations
 * Returns career, resume, and interview prep suggestions
 */
export async function getRecommendations(req, res, next) {
  try {
    const role = req.query.role || req.user?.targetRole || 'MERN Developer';
    const recs = getRecommendationsMock(role);
    return res.status(200).json({
      success: true,
      data: {
        role,
        ...recs
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/system/reset-quiz-history
 * Resets the current user's quiz scores and roadmap progress back to Week 1
 */
export async function resetUserProgress(req, res, next) {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Authentication required' });
    }

    const roadmap = await Roadmap.findOne({ userId });
    if (roadmap) {
      // Reset roadmap weeks: week 1 active, rest locked, clear quiz scores
      roadmap.weeks.forEach((w, idx) => {
        w.status = idx === 0 ? 'active' : 'locked';
        w.weeklyQuizScore = null;
        w.isRemedial = false;
        if (Array.isArray(w.dailyTasks)) {
          w.dailyTasks.forEach((t) => { t.completed = false; });
        }
      });
      roadmap.currentWeek = 1;
      roadmap.version = (roadmap.version || 1) + 1;
      roadmap.changeHistory.unshift({
        date: new Date(),
        version: roadmap.version,
        triggerWeek: 1,
        action: 'PROGRESS_RESET',
        reason: 'User triggered learning progress and quiz history reset.',
        score: null
      });
      await roadmap.save();
    }

    // Also reset user readiness quiz history
    await User.findByIdAndUpdate(userId, {
      $set: {
        readinessTestPassed: false,
        'readinessAssessment.evaluatedQuestions': []
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Learning progress and quiz history successfully reset to Week 1.',
      data: { reset: true }
    });
  } catch (err) {
    next(err);
  }
}

export default {
  getSystemStatus,
  updateSettings,
  probeAi,
  probeDb,
  getMockAssessment,
  getRecommendations,
  resetUserProgress
};
