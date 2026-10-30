import { Router } from 'express';
import { getRoadmap, completeModule } from '../controllers/roadmapController.js';
import authMiddleware from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

router.get('/', authMiddleware, asyncHandler(getRoadmap));
router.patch('/module/:moduleId/complete', authMiddleware, asyncHandler(completeModule));

export default router;
