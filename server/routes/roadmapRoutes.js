const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getActiveRoadmap,
  completeModule,
} = require('../controllers/roadmapController');

const router = express.Router();

// GET /api/roadmap - protected
router.get('/', authMiddleware, getActiveRoadmap);

// PATCH /api/roadmap/module/:moduleId/complete - protected
router.patch('/module/:moduleId/complete', authMiddleware, completeModule);

module.exports = router;
