import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Role from '../models/Role.js';
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
  if (!req.user.roleId) {
    return res.status(400).json({
      success: false,
      message: 'No role assigned to user. Please select a role first.'
    });
  }

  const userRole = await Role.findById(req.user.roleId).select('name slug dimensions').lean();
  if (!userRole) {
    return res.status(400).json({
      success: false,
      message: 'Assigned role does not exist'
    });
  }

  const requestedRoleId = req.params.roleId;
  const matchesRole =
    requestedRoleId === userRole.slug || requestedRoleId === userRole._id.toString();

  if (!matchesRole) {
    return res.status(400).json({
      success: false,
      message: "Requested role does not match user's assigned role"
    });
  }

  // Check in-memory cache first
  const cachedDiagnostic = cache.getDiagnostic(userRole.slug);
  if (cachedDiagnostic) {
    return res.status(200).json({
      success: true,
      data: cachedDiagnostic
    });
  }

  const diagnostic = await Diagnostic.findOne({ roleId: userRole.slug }).select('questions').lean();
  if (!diagnostic) {
    return res.status(404).json({
      success: false,
      message: 'Diagnostic questions not found for this role'
    });
  }

  // Strictly strip correctIndex and explanation before returning to client
  const sanitizedQuestions = diagnostic.questions.map((q) => ({
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

  // Cache sanitized diagnostic questions
  cache.setDiagnostic(userRole.slug, responseData);

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

  if (!req.user.roleId) {
    return res.status(400).json({
      success: false,
      message: 'No role assigned to user. Please select a role first.'
    });
  }

  const userRole = await Role.findById(req.user.roleId);
  if (!userRole) {
    return res.status(400).json({
      success: false,
      message: 'Assigned role does not exist'
    });
  }

  const matchesRole = roleId === userRole.slug || roleId === userRole._id.toString();
  if (!matchesRole) {
    return res.status(400).json({
      success: false,
      message: "Submitted roleId does not match user's assigned role"
    });
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

  // Generate learning path modules
  const generated = await generateWithFallback({
    role: userRole.slug,
    dimensionScores: scoreResult.dimensionScores,
    resourceLibrary
  });

  // Calculate baseline readiness score using contract formula:
  // Readiness = round(0.4 * (avgDimensionScore / 5 * 100) + 0.6 * (completedHours / totalHours * 100))
  // Since all modules are initially active/locked (none completed), completedHours = 0
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
