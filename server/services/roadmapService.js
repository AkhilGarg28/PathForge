/**
 * Pure helper functions and operations for Roadmap management
 */
const { calculateReadiness } = require('./readinessService');

/**
 * Calculates readiness percentage (0-100) weighted by estimatedHours.
 *
 * @param {Array<{estimatedHours?: number, status: string}>} modules
 * @returns {number} readinessScore (0-100)
 */
const calculateWeightedReadiness = (modules) => {
  return calculateReadiness(modules);
};

/**
 * Pure function to advance module status.
 * Marks target active module as 'complete' and unlocks the next 'locked' module to 'active'.
 *
 * @param {Array<object>} modules
 * @param {string} targetModuleId
 * @returns {{ error?: string, code?: number, updatedModules?: Array<object>, completedModule?: object, nextActiveModule?: object | null }}
 */
const advanceModuleStatus = (modules, targetModuleId) => {
  if (!Array.isArray(modules)) {
    throw new Error('Modules must be an array');
  }

  const moduleIndex = modules.findIndex((m) => m.moduleId === targetModuleId);
  if (moduleIndex === -1) {
    return { error: 'Module not found', code: 404 };
  }

  const targetModule = modules[moduleIndex];
  if (targetModule.status === 'complete') {
    return { error: 'Module is already complete', code: 400 };
  }
  if (targetModule.status !== 'active') {
    return { error: 'Module is not active', code: 400 };
  }

  // Clone modules to preserve purity
  const updatedModules = modules.map((m) =>
    typeof m.toObject === 'function' ? m.toObject() : { ...m }
  );

  updatedModules[moduleIndex].status = 'complete';

  // Find next locked module (preferring the immediately following locked module)
  let nextActiveIndex = updatedModules.findIndex(
    (m, idx) => idx > moduleIndex && m.status === 'locked'
  );

  if (nextActiveIndex === -1) {
    nextActiveIndex = updatedModules.findIndex((m) => m.status === 'locked');
  }

  let nextActiveModule = null;
  if (nextActiveIndex !== -1) {
    updatedModules[nextActiveIndex].status = 'active';
    nextActiveModule = updatedModules[nextActiveIndex];
  }

  return {
    updatedModules,
    completedModule: updatedModules[moduleIndex],
    nextActiveModule,
  };
};

module.exports = {
  calculateWeightedReadiness,
  advanceModuleStatus,
};
