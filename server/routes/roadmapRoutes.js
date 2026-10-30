const express = require('express');
const rateLimit = require('express-rate-limit');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getActiveRoadmap,
  completeModule,
  getModuleCheckpoint,
  submitModuleCheckpoint,
} = require('../controllers/roadmapController');

const router = express.Router();

// Dedicated rate limiter for AI-powered checkpoint re-planning: 10 per minute per user
const checkpointSubmitLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // 10 checkpoint submissions per minute per user
  keyGenerator: (req) => req.user?._id?.toString() || req.user?.id || req.ip,
  skipFailedRequests: true,
  message: {
    message: 'Too many checkpoint submissions. Please wait a moment before trying again.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === 'test',
});

// GET /api/roadmap - protected
router.get('/', authMiddleware, getActiveRoadmap);

// PATCH /api/roadmap/module/:moduleId/complete - protected
router.patch('/module/:moduleId/complete', authMiddleware, completeModule);

// GET /api/roadmap/module/:moduleId/checkpoint - protected
router.get('/module/:moduleId/checkpoint', authMiddleware, getModuleCheckpoint);

// POST /api/roadmap/module/:moduleId/checkpoint - protected with rate limiter
router.post(
  '/module/:moduleId/checkpoint',
  authMiddleware,
  checkpointSubmitLimiter,
  submitModuleCheckpoint
);

module.exports = router;
