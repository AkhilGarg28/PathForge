const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getDiagnosticQuestions,
  submitDiagnostic,
} = require('../controllers/diagnosticController');

const router = express.Router();

// GET /api/diagnostic/:roleId - protected
router.get('/:roleId', authMiddleware, getDiagnosticQuestions);

// POST /api/diagnostic/submit - protected
router.post('/submit', authMiddleware, submitDiagnostic);

module.exports = router;
