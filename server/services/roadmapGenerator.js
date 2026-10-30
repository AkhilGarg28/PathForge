import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateRoadmapModules } from './llmService.js';
import { validateRoadmapModules } from '../utils/roadmapSchema.js';
import { mapRoadmapResources } from './resourceMapper.js';
import { getFallbackRoadmap } from '../utils/fallbackRoadmap.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const defaultResourcesPath = path.resolve(__dirname, '../../data/resources.json');

/**
 * Loads resource library from disk if not provided in caller arguments.
 */
function loadDefaultResources() {
  try {
    if (fs.existsSync(defaultResourcesPath)) {
      const raw = fs.readFileSync(defaultResourcesPath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch {
    // ignore
  }
  return [];
}

/**
 * Generates a tailored learning roadmap with AI (Gemini), validated via Zod,
 * mapped to verified resources, and backed by a deterministic fallback template.
 *
 * Guaranteed to NEVER throw: on any failure, logs a safe message and returns fallback.
 *
 * @param {Object} params
 * @param {string|Object} params.role - Target career role slug or role object
 * @param {Record<string, number>} params.dimensionScores - Evaluated dimension scores { [dim]: number }
 * @param {Array<Object>} [params.resourceLibrary] - Curated resources repository
 * @returns {Promise<{ modules: Array<Object>, generatedBy: 'llm'|'fallback' }>}
 */
export async function generateWithFallback({
  role,
  dimensionScores = {},
  resourceLibrary = [],
  llmGenerator = generateRoadmapModules
}) {
  const roleSlug = typeof role === 'string' ? role : role?.slug || 'mern-developer';
  const roleName =
    typeof role === 'string'
      ? roleSlug === 'data-analyst'
        ? 'Data Analyst'
        : 'MERN Developer'
      : role?.name || (roleSlug === 'data-analyst' ? 'Data Analyst' : 'MERN Developer');

  const library =
    Array.isArray(resourceLibrary) && resourceLibrary.length > 0
      ? resourceLibrary
      : loadDefaultResources();

  // Primary AI Generation Attempt
  try {
    // 1. Check test-only forced failure hook
    if (process.env.FORCE_LLM_FAILURE === 'true') {
      throw new Error('Forced LLM failure triggered by FORCE_LLM_FAILURE environment flag');
    }

    // 2. Extract allowed tags from the resource library
    const allowedTags = Array.from(
      new Set(
        library
          .map((r) => r.tag)
          .filter(Boolean)
          .map((t) => String(t).toLowerCase().trim())
      )
    );

    // 3. Find weakest dimension from dimensionScores
    let weakestDimension = '';
    let minScore = Infinity;
    for (const [dim, score] of Object.entries(dimensionScores)) {
      const s = Number(score) || 0;
      if (s < minScore) {
        minScore = s;
        weakestDimension = dim;
      }
    }

    // 4. Generate raw modules from LLM
    const llmResult = await llmGenerator({
      roleName,
      dimensionScores,
      allowedTags
    });

    // 5. Validate strictly with Zod schema (rejects URLs, bad counts, invalid tags, non-kebab IDs)
    const validatedModules = validateRoadmapModules(llmResult.modules, allowedTags);

    // 6. Map verified resources from resource library onto modules (max 3, no duplicates)
    const mappedModules = mapRoadmapResources(validatedModules, library, weakestDimension);

    // 7. Post-processing: force status and checkpointScore (LLM never controls these)
    const finalModules = mappedModules.map((mod, index) => ({
      moduleId: mod.moduleId,
      title: mod.title,
      description: mod.description,
      resourceTags: [...mod.resourceTags],
      resources: mod.resources || [],
      estimatedHours: mod.estimatedHours,
      status: index === 0 ? 'active' : 'locked',
      checkpointScore: null
    }));

    return {
      modules: finalModules,
      generatedBy: 'llm'
    };
  } catch (err) {
    // Log short, non-sensitive message (no secrets or stack leaks)
    const reason = err?.message || 'Unknown error';
    console.warn(
      `[RoadmapGenerator] AI generation failed (${err?.name || 'Error'}: ${reason}). Serving deterministic fallback roadmap.`
    );

    // Return resilient fallback curriculum template
    try {
      const fallbackModules = getFallbackRoadmap({
        roleSlug,
        dimensionScores,
        resourceLibrary: library
      });

      return {
        modules: fallbackModules,
        generatedBy: 'fallback'
      };
    } catch (fallbackErr) {
      console.error(
        `[RoadmapGenerator] Fatal: Fallback template generation encountered error: ${fallbackErr.message}`
      );
      // Hard fallback: return default MERN template as last resort
      return {
        modules: getFallbackRoadmap({
          roleSlug: 'mern-developer',
          dimensionScores: {},
          resourceLibrary: []
        }),
        generatedBy: 'fallback'
      };
    }
  }
}

export default {
  generateWithFallback
};
