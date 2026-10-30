import { Router } from 'express';
import { getDiagnostic, submitDiagnostic } from '../controllers/diagnosticController.js';
import { submitDiagnosticSchema } from '../validators/diagnosticValidators.js';
import { validate } from '../validators/authValidators.js';
import { submitLimiter } from '../middleware/rateLimiter.js';
import authMiddleware from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

router.get('/:roleId', authMiddleware, asyncHandler(getDiagnostic));
router.post(
  '/submit',
  authMiddleware,
  submitLimiter,
  validate(submitDiagnosticSchema),
  asyncHandler(submitDiagnostic)
);

export default router;
