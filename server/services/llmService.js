const env = require('../config/env');
const questionService = require('./questionService');

/**
 * Generates a deterministic, curriculum-aligned fallback roadmap from local data.
 *
 * @param {string} roleName
 * @param {Record<string, number>} dimensionScores
 * @returns {Array<object>} modules
 */
const generateFallbackRoadmap = (roleName, dimensionScores = {}) => {
  // Get all unique dimensions for this role from cached questions
  const roleQuestions = questionService.getQuestionsByRole(roleName);
  const dimensionSet = new Set(roleQuestions.map((q) => q.dimension));

  // If no questions match roleName, use dimensions from scores or defaults
  if (dimensionSet.size === 0) {
    Object.keys(dimensionScores).forEach((d) => dimensionSet.add(d));
  }

  // Sort dimensions starting from weakest score to strongest
  const sortedDimensions = Array.from(dimensionSet).sort((a, b) => {
    const scoreA = dimensionScores[a] !== undefined ? dimensionScores[a] : 5;
    const scoreB = dimensionScores[b] !== undefined ? dimensionScores[b] : 5;
    return scoreA - scoreB;
  });

  const modules = sortedDimensions.map((dim, idx) => {
    const score = dimensionScores[dim] !== undefined ? dimensionScores[dim] : 2.5;
    const resources = questionService.getResourcesByDimension(dim, roleName);

    // Allocate more estimated hours for weaker dimensions (score < 3)
    const estimatedHours = score < 2.5 ? 15 : score < 4 ? 12 : 8;

    const slug = dim.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const moduleId = `mod-${idx + 1}-${slug}`;

    return {
      moduleId,
      title: `${dim} Mastery & Applications`,
      description: `Comprehensive module covering ${dim} for ${roleName}. Tailored for baseline proficiency score of ${score}/5.`,
      resourceTags: [dim, roleName, 'Curated'],
      resources: resources.length > 0 ? resources : [
        {
          title: `${dim} Overview Guide`,
          url: 'https://developer.mozilla.org',
          type: 'docs',
        },
      ],
      estimatedHours,
      status: idx === 0 ? 'active' : 'locked',
      checkpointScore: null,
    };
  });

  return modules;
};

/**
 * Calls Gemini API to generate structured roadmap modules.
 * Note: Never passes personal data (user name or email) to LLM.
 *
 * @param {string} roleName
 * @param {Record<string, number>} dimensionScores
 * @returns {Promise<Array<object>>}
 */
const callGeminiApi = async (roleName, dimensionScores) => {
  const model = env.GEMINI_MODEL || 'gemini-1.5-pro';
  const apiKey = env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '') {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  // Anonymized prompt: contains ONLY role and aggregated dimension scores
  const prompt = `You are an expert technical curriculum designer.
Generate a structured, 6-module learning roadmap for a learner pursuing the role "${roleName}".
Their diagnostic dimension scores (0.0 to 5.0 scale) are:
${JSON.stringify(dimensionScores, null, 2)}

Instructions:
1. Prioritize weaker skill dimensions earlier in the roadmap.
2. Return ONLY a valid JSON array of 6 module objects matching this schema:
[
  {
    "moduleId": "string (unique kebab-case e.g. mod-1-react-fundamentals)",
    "title": "string",
    "description": "string",
    "resourceTags": ["string"],
    "resources": [
      {
        "title": "string",
        "url": "valid url string",
        "type": "video" | "article" | "docs"
      }
    ],
    "estimatedHours": number (integer between 5 and 25)
  }
]`;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': apiKey,
    },
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
  if (!rawText) {
    throw new Error('Empty response from Gemini API');
  }

  const parsed = JSON.parse(rawText);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    throw new Error('Gemini response is not a non-empty array of modules');
  }

  return parsed.map((mod, idx) => ({
    moduleId: mod.moduleId || `mod-${idx + 1}`,
    title: mod.title || `Module ${idx + 1}`,
    description: mod.description || '',
    resourceTags: Array.isArray(mod.resourceTags) ? mod.resourceTags : [],
    resources: Array.isArray(mod.resources) ? mod.resources : [],
    estimatedHours: Number(mod.estimatedHours) || 10,
    status: idx === 0 ? 'active' : 'locked',
    checkpointScore: null,
  }));
};

/**
 * Connects LLM generation with reliable local fallback.
 * A failure of the LLM will NEVER throw or return 500.
 *
 * @param {string} roleName
 * @param {Record<string, number>} dimensionScores
 * @returns {Promise<Array<object>>}
 */
const generateWithFallback = async (roleName, dimensionScores) => {
  try {
    if (env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim() !== '') {
      const llmModules = await module.exports.callGeminiApi(
        roleName,
        dimensionScores
      );
      if (Array.isArray(llmModules) && llmModules.length > 0) {
        return llmModules.map((m, idx) => ({
          ...m,
          status: idx === 0 ? 'active' : 'locked',
          checkpointScore: null,
        }));
      }
    }
  } catch (error) {
    console.warn(
      `[LLM Service Warning] AI generation failed (${error.message}). Falling back to curriculum roadmap.`
    );
  }

  return generateFallbackRoadmap(roleName, dimensionScores);
};

module.exports = {
  generateWithFallback,
  generateFallbackRoadmap,
  callGeminiApi,
};
