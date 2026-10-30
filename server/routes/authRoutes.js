import { Router } from 'express';
import { signup, login, logout, getMe } from '../controllers/authController.js';
import { signupSchema, loginSchema, validate } from '../validators/authValidators.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import authMiddleware from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

router.post('/signup', authLimiter, validate(signupSchema), asyncHandler(signup));
router.post('/login', authLimiter, validate(loginSchema), asyncHandler(login));
router.post('/logout', asyncHandler(logout));
router.get('/me', authMiddleware, asyncHandler(getMe));

export default router;
