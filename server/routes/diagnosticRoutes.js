const express = require('express');
const rateLimit = require('express-rate-limit');
const authMiddleware = require('../middleware/authMiddleware');
const {
  getDiagnosticQuestions,
  submitDiagnostic,
} = require('../controllers/diagnosticController');

const router = express.Router();

// Dedicated rate limiter: 1 generation per user per 2 minutes (returns 429)
const diagnosticSubmitLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 1, // 1 generation per user per 2 minutes
  keyGenerator: (req) => req.user?._id?.toString() || req.user?.id || req.ip,
  skipFailedRequests: true, // Failed validation does not count against generation limit
  message: {
    message:
      'Too many roadmap generation requests. You can only generate 1 roadmap every 2 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => {
    // In development allow an override through an environment variable
    if (process.env.DISABLE_ROADMAP_RATE_LIMIT === 'true') return true;
    if (process.env.ROADMAP_RATE_LIMIT_OVERRIDE === 'true') return true;
    return false;
  },
});

// GET /api/diagnostic/:roleId - protected
router.get('/:roleId', authMiddleware, getDiagnosticQuestions);

// POST /api/diagnostic/submit - protected with dedicated rate limiter
router.post('/submit', authMiddleware, diagnosticSubmitLimiter, submitDiagnostic);

module.exports = router;
