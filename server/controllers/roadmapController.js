const { z } = require('zod');
const Roadmap = require('../models/Roadmap');
const Role = require('../models/Role');
const {
  calculateWeightedReadiness,
  advanceModuleStatus,
} = require('../services/roadmapService');
const questionService = require('../services/questionService');
const { scoreCheckpoint } = require('../services/scoringService');
const { replanRoadmap } = require('../services/replanService');

const moduleIdParamSchema = z.object({
  moduleId: z
    .string({ required_error: 'moduleId is required' })
    .trim()
    .min(1, 'moduleId cannot be empty'),
});

const checkpointSubmissionSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z.string({ required_error: 'questionId is required' }).min(1),
        selectedIndex: z
          .number({ required_error: 'selectedIndex is required' })
          .int('selectedIndex must be an integer')
          .min(0, 'selectedIndex must be between 0 and 3')
          .max(3, 'selectedIndex must be between 0 and 3'),
      })
    )
    .min(1, 'Answers array cannot be empty'),
});

const getActiveRoadmap = async (req, res, next) => {
  try {
    const userId = req.user._id || req.user.id;
    const roadmap = await Roadmap.findOne({
      userId,
      isArchived: false,
    });

    if (!roadmap) {
      return res.status(404).json({ message: 'No roadmap yet' });
    }

    return res.status(200).json({ roadmap });
  } catch (error) {
    return next(error);
  }
};

const completeModule = async (req, res, next) => {
  try {
    const parseResult = moduleIdParamSchema.safeParse(req.params);
    if (!parseResult.success) {
      return res.status(400).json({
        message: parseResult.error.errors[0]?.message || 'Invalid moduleId parameter',
        errors: parseResult.error.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    const { moduleId } = parseResult.data;
    const userId = req.user._id || req.user.id;

    const roadmap = await Roadmap.findOne({
      userId,
      isArchived: false,
    });

    if (!roadmap) {
      return res.status(404).json({ message: 'No roadmap yet' });
    }

    const result = advanceModuleStatus(roadmap.modules, moduleId);

    if (result.error) {
      return res.status(result.code || 400).json({ message: result.error });
    }

    // Update modules
    roadmap.modules = result.updatedModules;

    // Recalculate weighted readiness score
    const newReadiness = calculateWeightedReadiness(roadmap.modules);
    roadmap.readinessScore = newReadiness;

    // Append history entry
    roadmap.history.push({
      date: new Date(),
      event: 'module_complete',
      readinessScore: newReadiness,
    });

    await roadmap.save();

    return res.status(200).json({
      roadmap,
      message: 'Module completed successfully',
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * GET /api/roadmap/module/:moduleId/checkpoint (protected)
 * Returns the module's checkpoint questions without correctIndex.
 * If none exist, returns 404 with guidance to use plain completion.
 */
const getModuleCheckpoint = async (req, res, next) => {
  try {
    const parseResult = moduleIdParamSchema.safeParse(req.params);
    if (!parseResult.success) {
      return res.status(400).json({
        message: parseResult.error.errors[0]?.message || 'Invalid moduleId parameter',
      });
    }

    const { moduleId } = parseResult.data;
    const userId = req.user._id || req.user.id;

    const roadmap = await Roadmap.findOne({
      userId,
      isArchived: false,
    });

    if (!roadmap) {
      return res.status(404).json({ message: 'No roadmap yet' });
    }

    const targetModule = roadmap.modules.find(
      (m) => m.moduleId === moduleId || (m._id && m._id.toString() === moduleId)
    );

    if (!targetModule) {
      return res.status(404).json({ message: 'Module not found in roadmap' });
    }

    // Fetch role name for better checkpoint filtering
    let roleName = '';
    if (roadmap.roleId) {
      const role = await Role.findById(roadmap.roleId);
      if (role) roleName = role.name;
    }

    const questions = questionService.getCheckpointsForModule(targetModule, roleName);

    if (!questions || questions.length === 0) {
      return res.status(404).json({
        message:
          'No checkpoint questions found for this module. Please use plain completion instead.',
      });
    }

    // Sanitize: NEVER return correctIndex
    const sanitizedQuestions = questions.map((q) => ({
      id: q.id,
      question: q.question,
      options: q.options,
      dimension: q.dimension,
      roleName: q.roleName,
    }));

    return res.status(200).json({
      moduleId: targetModule.moduleId,
      questions: sanitizedQuestions,
    });
  } catch (error) {
    return next(error);
  }
};

/**
 * POST /api/roadmap/module/:moduleId/checkpoint (protected)
 * Body: { answers: [{ questionId, selectedIndex }] }
 * Scores checkpoint with pure function, triggers adaptive re-planning, and updates roadmap.
 */
const submitModuleCheckpoint = async (req, res, next) => {
  try {
    const paramParse = moduleIdParamSchema.safeParse(req.params);
    if (!paramParse.success) {
      return res.status(400).json({
        message: paramParse.error.errors[0]?.message || 'Invalid moduleId parameter',
      });
    }

    const bodyParse = checkpointSubmissionSchema.safeParse(req.body);
    if (!bodyParse.success) {
      return res.status(400).json({
        message: bodyParse.error.errors[0]?.message || 'Invalid submission payload',
        errors: bodyParse.error.errors,
      });
    }

    const { moduleId } = paramParse.data;
    const { answers } = bodyParse.data;
    const userId = req.user._id || req.user.id;

    const roadmap = await Roadmap.findOne({
      userId,
      isArchived: false,
    });

    if (!roadmap) {
      return res.status(404).json({ message: 'No roadmap yet' });
    }

    const targetModule = roadmap.modules.find(
      (m) => m.moduleId === moduleId || (m._id && m._id.toString() === moduleId)
    );

    if (!targetModule) {
      return res.status(404).json({ message: 'Module not found in roadmap' });
    }

    // Require that the module is active
    if (targetModule.status !== 'active') {
      return res.status(400).json({
        message:
          targetModule.status === 'complete'
            ? 'Module is already complete'
            : 'Module is locked and cannot submit a checkpoint',
      });
    }

    // Fetch role name for question matching
    let roleName = '';
    if (roadmap.roleId) {
      const role = await Role.findById(roadmap.roleId);
      if (role) roleName = role.name;
    }

    const fullQuestions = questionService.getCheckpointsForModule(targetModule, roleName);
    if (!fullQuestions || fullQuestions.length === 0) {
      return res.status(404).json({
        message: 'No checkpoint questions exist for this module. Please use plain completion.',
      });
    }

    // Score with pure function
    const score = scoreCheckpoint(fullQuestions, answers);

    // Trigger adaptive re-planning
    const { roadmap: updatedRoadmap, changes } = await replanRoadmap(
      roadmap,
      targetModule.moduleId,
      score
    );

    await updatedRoadmap.save();

    return res.status(200).json({
      score,
      roadmap: updatedRoadmap,
      changes,
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getActiveRoadmap,
  completeModule,
  getModuleCheckpoint,
  submitModuleCheckpoint,
};
