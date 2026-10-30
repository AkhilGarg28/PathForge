import { Router } from 'express';
import {
  sendMessage,
  getConversation,
  clearConversation
} from '../controllers/aiTutorController.js';
import authMiddleware from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

router.get('/', authMiddleware, asyncHandler(getConversation));
router.post('/message', authMiddleware, asyncHandler(sendMessage));
router.delete('/clear', authMiddleware, asyncHandler(clearConversation));

export default router;
