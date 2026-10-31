import express, { Router } from 'express';
import {
  saveStudentProfile,
  analyzeResume,
  uploadResumeFile,
  analyzeGitHub,
  getSkillMatrix
} from '../controllers/onboardingController.js';
import authMiddleware from '../middleware/auth.js';
import asyncHandler from '../utils/asyncHandler.js';

const router = Router();

router.post('/profile', authMiddleware, asyncHandler(saveStudentProfile));
router.post('/upload-resume-file', express.json({ limit: '20mb' }), authMiddleware, asyncHandler(uploadResumeFile));
router.post('/analyze-resume', express.json({ limit: '500kb' }), authMiddleware, asyncHandler(analyzeResume));
router.post('/analyze-github', authMiddleware, asyncHandler(analyzeGitHub));
router.get('/skill-matrix', authMiddleware, asyncHandler(getSkillMatrix));

export default router;
