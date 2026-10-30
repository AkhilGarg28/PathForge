import { Router } from 'express';
import {
  generatePersonalizedRoadmap,
  getPersonalizedRoadmap,
  toggleDailyTask,
  getTopicGuide
} from '../controllers/personalizedRoadmapController.js';
import authMiddleware from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

router.post('/generate', authMiddleware, asyncHandler(generatePersonalizedRoadmap));
router.get('/', authMiddleware, asyncHandler(getPersonalizedRoadmap));
router.patch('/task/:weekNumber/:dayIndex/toggle', authMiddleware, asyncHandler(toggleDailyTask));
router.get('/topic-guide', authMiddleware, asyncHandler(getTopicGuide));

export default router;
