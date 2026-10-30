import Roadmap from '../models/Roadmap.js';
import { calculateReadiness } from '../services/readinessService.js';

/**
 * Fetch the authenticated user's personal roadmap
 * GET /api/roadmap
 */
export const getRoadmap = async (req, res) => {
  // Enforce tenant isolation: query strictly by req.user._id with lean() optimization
  const roadmap = await Roadmap.findOne({ userId: req.user._id }).select('-__v').lean();

  if (!roadmap) {
    return res.status(404).json({
      success: false,
      message: 'No roadmap found'
    });
  }

  const modulesWithIsNew = (roadmap.modules || []).map((m) => ({
    ...m,
    isNew: Boolean(m.isNewlyAdded || (m.moduleId && m.moduleId.includes('remedial')))
  }));

  return res.status(200).json({
    success: true,
    data: {
      roadmap: {
        ...roadmap,
        id: roadmap._id.toString(),
        modules: modulesWithIsNew
      }
    }
  });
};

/**
 * Mark an active module as complete, unlock the subsequent module, and recalculate readiness
 * PATCH /api/roadmap/module/:moduleId/complete
 */
export const completeModule = async (req, res) => {
  const { moduleId } = req.params;

  // Retrieve user's personal roadmap
  const roadmap = await Roadmap.findOne({ userId: req.user._id });
  if (!roadmap) {
    return res.status(404).json({
      success: false,
      message: 'No roadmap found for user'
    });
  }

  const moduleIndex = roadmap.modules.findIndex((m) => m.moduleId === moduleId);
  if (moduleIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Module not found in user roadmap'
    });
  }

  const targetModule = roadmap.modules[moduleIndex];

  // Only an active module can be marked complete
  if (targetModule.status === 'complete') {
    return res.status(400).json({
      success: false,
      message: 'Module is already completed'
    });
  }

  if (targetModule.status === 'locked') {
    return res.status(400).json({
      success: false,
      message: 'Module is locked. You must complete preceding modules first.'
    });
  }

  // Mark current module as complete
  targetModule.status = 'complete';

  // Unlock next module sequentially if one exists
  let nextActiveModuleId = null;
  if (moduleIndex + 1 < roadmap.modules.length) {
    roadmap.modules[moduleIndex + 1].status = 'active';
    nextActiveModuleId = roadmap.modules[moduleIndex + 1].moduleId;
  }

  // Recalculate student readiness percentage
  roadmap.readinessScore = calculateReadiness({
    dimensionScores: roadmap.dimensionScores,
    modules: roadmap.modules
  });

  await roadmap.save();

  return res.status(200).json({
    success: true,
    message: 'Module marked as complete and next module unlocked',
    data: {
      completedModuleId: targetModule.moduleId,
      nextActiveModuleId,
      readinessScore: roadmap.readinessScore,
      roadmap: roadmap.toJSON()
    }
  });
};
