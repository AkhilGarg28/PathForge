import express from 'express';
import {
  getSystemStatus,
  updateSettings,
  probeAi,
  probeDb,
  getMockAssessment,
  getRecommendations,
  resetUserProgress
} from '../controllers/systemController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Public system status & mock mode probe endpoints
router.get('/mode', getSystemStatus);
router.post('/settings', updateSettings);
router.post('/test-ai', probeAi);
router.post('/test-db', probeDb);
router.get('/mock-assessment', getMockAssessment);
router.get('/recommendations', getRecommendations);

// Protected user progress reset
router.post('/reset-quiz-history', authMiddleware, resetUserProgress);

export default router;
