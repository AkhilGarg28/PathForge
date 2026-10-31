import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Role from '../models/Role.js';
import User from '../models/User.js';
import UserProfile from '../models/UserProfile.js';
import PersonalizedRoadmap from '../models/PersonalizedRoadmap.js';
import { buildDeterministicRoadmap } from '../services/personalizedRoadmapService.js';
import { shuffleArray } from '../services/questionSelector.js';
import Diagnostic from '../models/Diagnostic.js';
import DiagnosticResult from '../models/DiagnosticResult.js';
import Roadmap from '../models/Roadmap.js';
import { scoreAnswers } from '../services/scoringService.js';
import { generateWithFallback } from '../services/roadmapGenerator.js';
import cache from '../utils/cache.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const resourcesPath = path.resolve(__dirname, '../../data/resources.json');

/**
 * Retrieve diagnostic questions for the user's role without leaking correctIndex
 * GET /api/diagnostic/:roleId
 */
export const getDiagnostic = async (req, res) => {
  let roleSlug = 'mern-developer';

  // 1. Check user profile for preferred targetRole from onboarding
  const profile = await UserProfile.findOne({ userId: req.user._id }).lean();
  if (profile?.targetRole) {
    const isDA = profile.targetRole.toLowerCase().includes('data') || profile.targetRole.toLowerCase().includes('analyst');
    roleSlug = isDA ? 'data-analyst' : 'mern-developer';
  } else if (req.user.roleId) {
    const r = await Role.findById(req.user.roleId).lean();
    if (r?.slug) roleSlug = r.slug;
  }

  // 2. Check URL parameter override (e.g. /api/diagnostic/data-analyst or /api/diagnostic/mern-developer)
  const requestedRoleId = (req.params.roleId || '').toLowerCase();
  if (requestedRoleId.includes('data') || requestedRoleId.includes('analyst')) {
    roleSlug = 'data-analyst';
  } else if (requestedRoleId.includes('mern')) {
    roleSlug = 'mern-developer';
  }

  // 3. Find role document and ensure User.roleId is in sync
  let userRole = await Role.findOne({ slug: roleSlug }).select('name slug dimensions').lean();
  if (!userRole) {
    userRole = await Role.findOne({}).select('name slug dimensions').lean();
  }
  if (userRole && String(req.user.roleId) !== String(userRole._id)) {
    await User.findByIdAndUpdate(req.user._id, { roleId: userRole._id });
  }

  if (!userRole) {
    return res.status(404).json({
      success: false,
      message: 'Assigned role does not exist'
    });
  }

  const diagnostic = await Diagnostic.findOne({ roleId: userRole.slug }).select('questions').lean();
  if (!diagnostic || !diagnostic.questions?.length) {
    return res.status(404).json({
      success: false,
      message: 'Diagnostic questions not found for this role'
    });
  }

  // Shuffle questions randomly per attempt so every test is dynamic
  const shuffledQuestions = shuffleArray(diagnostic.questions);

  // Strictly strip correctIndex and explanation before returning to client
  const sanitizedQuestions = shuffledQuestions.map((q) => ({
    id: q.id,
    dimension: q.dimension,
    question: q.question,
    options: q.options
  }));

  const responseData = {
    roleId: userRole.slug,
    roleTitle: userRole.name,
    questions: sanitizedQuestions
  };

  return res.status(200).json({
    success: true,
    data: responseData
  });
};

/**
 * Score diagnostic submission, persist result, generate roadmap, and calculate readiness
 * POST /api/diagnostic/submit
 */
export const submitDiagnostic = async (req, res) => {
  const { roleId, answers } = req.body;

  let activeSlug = 'mern-developer';
  const requested = (roleId || '').toLowerCase();
  if (requested.includes('data') || requested.includes('analyst')) {
    activeSlug = 'data-analyst';
  } else if (requested.includes('mern')) {
    activeSlug = 'mern-developer';
  } else {
    const profile = await UserProfile.findOne({ userId: req.user._id }).lean();
    if (profile?.targetRole) {
      const isDA = profile.targetRole.toLowerCase().includes('data') || profile.targetRole.toLowerCase().includes('analyst');
      activeSlug = isDA ? 'data-analyst' : 'mern-developer';
    } else if (req.user.roleId) {
      const r = await Role.findById(req.user.roleId).lean();
      if (r?.slug) activeSlug = r.slug;
    }
  }

  let userRole = await Role.findOne({ slug: activeSlug });
  if (!userRole) {
    userRole = await Role.findOne({});
  }

  const diagnostic = await Diagnostic.findOne({ roleId: userRole.slug });
  if (!diagnostic) {
    return res.status(404).json({
      success: false,
      message: 'Diagnostic questions not found for this role'
    });
  }

  // Score answers against stored answer key
  let scoreResult;
  try {
    scoreResult = scoreAnswers(diagnostic.questions, answers);
  } catch (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // Persist diagnostic assessment history
  await DiagnosticResult.create({
    userId: req.user._id,
    roleId: userRole.slug,
    answers,
    dimensionScores: scoreResult.dimensionScores,
    submittedAt: new Date()
  });

  // Load resources library if available
  let resourceLibrary = [];
  try {
    if (fs.existsSync(resourcesPath)) {
      resourceLibrary = JSON.parse(fs.readFileSync(resourcesPath, 'utf-8'));
    }
  } catch {
    resourceLibrary = [];
  }

  // Generate learning path modules tailored to track
  const generated = await generateWithFallback({
    role: userRole.slug,
    dimensionScores: scoreResult.dimensionScores,
    resourceLibrary
  });

  const initialReadiness = Math.round(0.4 * ((scoreResult.overall / 5) * 100));

  // Race-safe upsert: replace any previous roadmap for this user
  const roadmap = await Roadmap.findOneAndUpdate(
    { userId: req.user._id },
    {
      userId: req.user._id,
      roleId: userRole.slug,
      dimensionScores: scoreResult.dimensionScores,
      modules: generated.modules,
      readinessScore: initialReadiness,
      generatedBy: generated.generatedBy
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  // Synchronize with PersonalizedRoadmap for the multi-week view
  const targetRoleTitle = userRole.slug === 'data-analyst' ? 'Data Analyst' : 'MERN Developer';
  const personalizedRoadmapData = buildDeterministicRoadmap({
    targetRole: targetRoleTitle,
    claimVerifications: []
  });

  const personalized = await PersonalizedRoadmap.findOneAndUpdate(
    { userId: req.user._id },
    {
      userId: req.user._id,
      targetRole: targetRoleTitle,
      version: 1,
      totalWeeks: personalizedRoadmapData.totalWeeks,
      currentWeek: 1,
      currentWeekNumber: 1,
      progressPercent: 0,
      readinessScore: initialReadiness,
      phases: personalizedRoadmapData.phases,
      weeks: personalizedRoadmapData.weeks
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await UserProfile.findOneAndUpdate(
    { userId: req.user._id },
    { activeRoadmapId: personalized._id }
  );

  return res.status(200).json({
    success: true,
    message: 'Diagnostic submitted and roadmap generated successfully',
    data: {
      roleId: userRole.slug,
      dimensionScores: scoreResult.dimensionScores,
      avgDimensionScore: scoreResult.overall,
      readinessScore: initialReadiness,
      roadmap: roadmap.toJSON()
    }
  });
};
