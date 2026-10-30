import { Router } from 'express';
import {
  getReadinessQuestions,
  submitReadinessAssessment,
  getReadinessReport
} from '../controllers/readinessController.js';
import authMiddleware from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

router.get('/questions', authMiddleware, asyncHandler(getReadinessQuestions));
router.post('/submit', authMiddleware, asyncHandler(submitReadinessAssessment));
router.get('/report', authMiddleware, asyncHandler(getReadinessReport));

export default router;
