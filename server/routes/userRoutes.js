import { Router } from 'express';
import {
  updateUserRole,
  updateUserProfile,
  updateUserPassword,
  deleteUserAccount
} from '../controllers/userController.js';
import {
  updateProfileSchema,
  updatePasswordSchema,
  deleteUserSchema
} from '../validators/userValidators.js';
import { validate } from '../validators/authValidators.js';
import authMiddleware from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

router.post('/role', authMiddleware, asyncHandler(updateUserRole));
router.patch(
  '/profile',
  authMiddleware,
  validate(updateProfileSchema),
  asyncHandler(updateUserProfile)
);
router.patch(
  '/password',
  authMiddleware,
  validate(updatePasswordSchema),
  asyncHandler(updateUserPassword)
);
router.delete('/', authMiddleware, validate(deleteUserSchema), asyncHandler(deleteUserAccount));

export default router;
