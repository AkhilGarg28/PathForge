const { z } = require('zod');
const Roadmap = require('../models/Roadmap');
const {
  calculateWeightedReadiness,
  advanceModuleStatus,
} = require('../services/roadmapService');

const moduleIdParamSchema = z.object({
  moduleId: z
    .string({ required_error: 'moduleId is required' })
    .trim()
    .min(1, 'moduleId cannot be empty'),
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

module.exports = {
  getActiveRoadmap,
  completeModule,
};
