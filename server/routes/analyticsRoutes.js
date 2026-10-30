import { Router } from 'express';
import { getAnalyticsOverview } from '../controllers/analyticsController.js';
import authMiddleware from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

router.get('/overview', authMiddleware, asyncHandler(getAnalyticsOverview));

export default router;
