import { Router } from 'express';
import { getRoles } from '../controllers/roleController.js';
import authMiddleware from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

router.get('/', authMiddleware, asyncHandler(getRoles));

export default router;
