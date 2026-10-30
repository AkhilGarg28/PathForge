const { z } = require('zod');
const env = require('../config/env');
const questionService = require('./questionService');
const { calculateReadiness } = require('./readinessService');

const resourceItemSchema = z.object({
  title: z.string().min(1),
  url: z.string().min(1),
  type: z.enum(['video', 'article', 'docs']).default('article'),
});

const compressedModuleSchema = z.object({
  moduleId: z.string().min(1),
  title: z.string().min(1),
  description: z.string().optional().default(''),
  resourceTags: z.array(z.string()).optional().default([]),
  resources: z.array(resourceItemSchema).optional().default([]),
  estimatedHours: z.number().min(1).max(50).default(10),
  status: z.enum(['locked', 'active', 'complete']).default('locked'),
  checkpointScore: z.number().nullable().optional().default(null),
});

const compressedModulesArraySchema = z.array(compressedModuleSchema);

/**
 * Calls Gemini API to compress remaining roadmap modules by removing at most one redundant module.
 *
 * @param {Array<object>} remainingModules
 * @param {number} score
 * @returns {Promise<Array<object>>}
 */
const callLLMCompression = async (remainingModules, score) => {
  const model = env.GEMINI_MODEL || 'gemini-1.5-pro';
  const apiKey = env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const prompt = `You are an expert technical curriculum designer.
The learner demonstrated high mastery on their checkpoint evaluation with a score of ${score}%.
Analyze the following remaining roadmap modules and compress them by removing at most ONE redundant module:
${JSON.stringify(remainingModules, null, 2)}

Return ONLY a valid JSON array of compressed modules.`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Gemini API returned status ${response.status}: ${errorBody}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!rawText) throw new Error('Empty response from Gemini API');

  return JSON.parse(rawText);
};

/**
 * Creates a focused remedial module (estimatedHours 3 to 6) in the same dimension.
 *
 * @param {object} currentModule
 * @returns {object} remedialModule
 */
const createRemedialModule = (currentModule) => {
  const tags = Array.isArray(currentModule.resourceTags) ? currentModule.resourceTags : [];
  const dimension = tags[0] || 'Technical';
  const slug = dimension.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const uniqueId = `remedial-${currentModule.moduleId || slug}-${Date.now().toString(36).substring(2, 6)}`;

  const resources = questionService.getResourcesByDimension(dimension);
  const selectedResources =
    resources.length > 0
      ? resources.slice(0, 2)
      : [
          {
            title: `${dimension} Fundamentals Review`,
            url: 'https://developer.mozilla.org',
            type: 'article',
          },
          {
            title: `${dimension} Core Documentation`,
            url: 'https://docs.github.com',
            type: 'docs',
          },
        ];

  return {
    moduleId: uniqueId,
    title: `Remedial: ${dimension} Foundations`,
    description: `Targeted remedial reinforcement in ${dimension} to address core concept gaps identified during checkpoint evaluation.`,
    resourceTags: [dimension, 'Remedial', ...tags.slice(1)],
    resources: selectedResources,
    estimatedHours: 4, // integer between 3 and 6
    status: 'locked',
    checkpointScore: null,
  };
};

/**
 * Compresses remaining modules using LLM with deterministic rule-based fallback.
 *
 * @param {Array<object>} remainingModules
 * @param {number} score
 * @returns {Promise<{ updatedRemaining: Array<object>, removedModule: object | null }>}
 */
const compressRemainingModules = async (remainingModules, score) => {
  if (remainingModules.length <= 1) {
    return {
      updatedRemaining: remainingModules,
      removedModule: null,
    };
  }

  try {
    if (module.exports.callLLMCompression) {
      const llmResult = await module.exports.callLLMCompression(remainingModules, score);
      if (Array.isArray(llmResult) && llmResult.length === remainingModules.length - 1) {
        const parseResult = compressedModulesArraySchema.safeParse(llmResult);
        if (parseResult.success) {
          const returnedIds = new Set(parseResult.data.map((m) => m.moduleId));
          const removed =
            remainingModules.find((m) => !returnedIds.has(m.moduleId)) ||
            remainingModules[remainingModules.length - 1];

          return {
            updatedRemaining: parseResult.data,
            removedModule: removed,
          };
        }
      }
    }
  } catch (err) {
    console.warn(
      `[Replan LLM Warning] LLM compression failed (${err.message}). Using rule-based fallback.`
    );
  }

  // Deterministic rule-based fallback: remove the last remaining locked module
  const removedModule = remainingModules[remainingModules.length - 1];
  const updatedRemaining = remainingModules.slice(0, remainingModules.length - 1);
  return {
    updatedRemaining,
    removedModule,
  };
};

/**
 * Core adaptive re-planning function.
 *
 * Rules:
 * - Completed modules are NEVER changed.
 * - Score >= 80: mark current complete, compress remaining modules with LLM (or rule-based fallback).
 * - Score < 40: keep current module active, insert one remedial module (estimatedHours 3 to 6) immediately after it.
 * - Score 40 to 79: mark current module complete and unlock next.
 *
 * @param {object} roadmap Mongoose document or plain object
 * @param {string} moduleId
 * @param {number} score (0-100)
 * @returns {Promise<{ roadmap: object, changes: Array<{type: "inserted"|"removed"|"none", moduleId: string, title: string}> }>}
 */
const replanRoadmap = async (roadmap, moduleId, score) => {
  if (!roadmap || !Array.isArray(roadmap.modules)) {
    throw new Error('Valid roadmap with modules array is required');
  }

  const moduleIndex = roadmap.modules.findIndex(
    (m) => m.moduleId === moduleId || (m._id && m._id.toString() === moduleId)
  );

  if (moduleIndex === -1) {
    const error = new Error('Module not found in roadmap');
    error.statusCode = 404;
    throw error;
  }

  const targetModule = roadmap.modules[moduleIndex];

  if (targetModule.status !== 'active') {
    const error = new Error(
      targetModule.status === 'complete'
        ? 'Module is already complete'
        : 'Module is locked and cannot take checkpoint'
    );
    error.statusCode = 400;
    throw error;
  }

  // Save the checkpointScore on the module
  targetModule.checkpointScore = score;

  let changes = [];
  let reason = '';

  if (score >= 80) {
    // 1. High Score (>= 80): Mark complete, compress remaining modules
    targetModule.status = 'complete';

    // Extract remaining modules strictly after target module
    const remainingModules = roadmap.modules.slice(moduleIndex + 1);

    const { updatedRemaining, removedModule } = await compressRemainingModules(
      remainingModules,
      score
    );

    // Unlock the first module of the remaining modules if any
    if (updatedRemaining.length > 0) {
      updatedRemaining[0].status = 'active';
    }

    // Reconstruct modules array: modules up to targetModule + updatedRemaining
    roadmap.modules = [
      ...roadmap.modules.slice(0, moduleIndex + 1),
      ...updatedRemaining,
    ];

    if (removedModule) {
      changes = [
        {
          type: 'removed',
          moduleId: removedModule.moduleId,
          title: removedModule.title,
        },
      ];
    } else {
      changes = [
        {
          type: 'none',
          moduleId: targetModule.moduleId,
          title: targetModule.title,
        },
      ];
    }

    reason = `High checkpoint score (${score}%) - compressed remaining curriculum`;
  } else if (score < 40) {
    // 2. Low Score (< 40): Keep module active, insert remedial module immediately after it
    targetModule.status = 'active'; // Kept active

    const remedialModule = createRemedialModule(targetModule);

    // Insert immediately after moduleIndex
    roadmap.modules.splice(moduleIndex + 1, 0, remedialModule);

    changes = [
      {
        type: 'inserted',
        moduleId: remedialModule.moduleId,
        title: remedialModule.title,
      },
    ];

    reason = `Low checkpoint score (${score}%) - inserted remedial module`;
  } else {
    // 3. Mid Score (40 to 79): Just complete the module and continue
    targetModule.status = 'complete';

    // Find next locked module and unlock it
    const nextLocked = roadmap.modules.find(
      (m, idx) => idx > moduleIndex && m.status === 'locked'
    );
    if (nextLocked) {
      nextLocked.status = 'active';
    }

    changes = [
      {
        type: 'none',
        moduleId: targetModule.moduleId,
        title: targetModule.title,
      },
    ];

    reason = `Satisfactory checkpoint score (${score}%) - module completed`;
  }

  // Recompute readiness
  const newReadiness = calculateReadiness(roadmap.modules);
  roadmap.readinessScore = newReadiness;

  // Append history entry
  roadmap.history.push({
    date: new Date(),
    event: 'replan',
    reason,
    readinessScore: newReadiness,
  });

  return {
    roadmap,
    changes,
  };
};

module.exports = {
  replanRoadmap,
  compressRemainingModules,
  callLLMCompression,
  createRemedialModule,
};
