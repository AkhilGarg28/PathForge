import { Router } from 'express';
import {
  getWeeklyQuiz,
  submitWeeklyQuiz,
  getQuizHistory
} from '../controllers/weeklyQuizController.js';
import authMiddleware from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

router.get('/history', authMiddleware, asyncHandler(getQuizHistory));
router.get('/:weekNumber', authMiddleware, asyncHandler(getWeeklyQuiz));
router.post('/:weekNumber/submit', authMiddleware, asyncHandler(submitWeeklyQuiz));

export default router;
