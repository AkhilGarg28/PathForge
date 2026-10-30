const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getActiveRoadmap,
  completeModule,
  getModuleCheckpoint,
  submitModuleCheckpoint,
} = require('../controllers/roadmapController');

const router = express.Router();

// GET /api/roadmap - protected
router.get('/', authMiddleware, getActiveRoadmap);

// PATCH /api/roadmap/module/:moduleId/complete - protected
router.patch('/module/:moduleId/complete', authMiddleware, completeModule);

// GET /api/roadmap/module/:moduleId/checkpoint - protected
router.get('/module/:moduleId/checkpoint', authMiddleware, getModuleCheckpoint);

// POST /api/roadmap/module/:moduleId/checkpoint - protected
router.post('/module/:moduleId/checkpoint', authMiddleware, submitModuleCheckpoint);

module.exports = router;
