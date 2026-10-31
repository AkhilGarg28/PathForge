/**
 * PathForge LLM Integration Service
 * Provides swappable LLM provider abstractions (Groq, Gemini, OpenAI swappable),
 * prompt synthesis, JSON-mode generation, defensive response sanitization, and typed error handling.
 */

// ---------------------------------------------------------------------------
// 1. Typed Error Classes
// ---------------------------------------------------------------------------

export class LLMError extends Error {
  constructor(message, options = {}) {
    super(message);
    this.name = 'LLMError';
    this.type = options.type || 'LLM_ERROR';
    this.details = options.details;
  }
}

export class LLMTimeoutError extends LLMError {
  constructor(message = 'LLM generation request timed out', options = {}) {
    super(message, { ...options, type: 'TIMEOUT' });
    this.name = 'LLMTimeoutError';
  }
}

export class LLMApiError extends LLMError {
  constructor(message = 'LLM API request failed', options = {}) {
    super(message, { ...options, type: 'API_ERROR' });
    this.name = 'LLMApiError';
    this.statusCode = options.statusCode;
  }
}

export class LLMParseError extends LLMError {
  constructor(message = 'Failed to parse LLM response as JSON', options = {}) {
    super(message, { ...options, type: 'PARSE_ERROR' });
    this.name = 'LLMParseError';
    this.rawText = options.rawText;
  }
}

// ---------------------------------------------------------------------------
// 2. Secret Redaction Helper
// ---------------------------------------------------------------------------

export function redactSecrets(text) {
  if (!text || typeof text !== 'string') return text;
  return text.replace(
    /(?:key=|Bearer\s+|x-goog-api-key['"]?:\s*['"]?)[a-zA-Z0-9_-]{10,}/gi,
    (match) => match.slice(0, 10) + '...[REDACTED]'
  );
}

// ---------------------------------------------------------------------------
// 3. Prompt Construction
// ---------------------------------------------------------------------------

/**
 * Builds a structured, constraint-enforcing curriculum prompt for the LLM.
 *
 * @param {Object} params
 * @param {string} params.roleName - Target role name (e.g. "MERN Developer")
 * @param {Record<string, number>} params.dimensionScores - Dimension scores (0.0 to 5.0)
 * @param {string[]} params.allowedTags - Whitelist of resource tags from resources.json
 * @returns {string} Fully formulated prompt
 */
export function buildPrompt({ roleName, dimensionScores = {}, allowedTags = [] }) {
  if (!roleName || typeof roleName !== 'string') {
    throw new Error('roleName is required to build LLM prompt');
  }

  // Sort dimensions from weakest (lowest score) to strongest (highest score)
  const sortedDimensions = Object.entries(dimensionScores)
    .map(([dim, score]) => ({
      dimension: dim,
      score: Number(score) || 0
    }))
    .sort((a, b) => a.score - b.score);

  const formattedDimensions =
    sortedDimensions.length > 0
      ? sortedDimensions
          .map(
            (d) =>
              `- ${d.dimension}: ${d.score.toFixed(1)} / 5.0 ${
                d.score < 3.0 ? '(PRIORITY SKILL GAP - NEEDS REMEDIATION)' : '(COMPETENT)'
              }`
          )
          .join('\n')
      : '- General Core Competencies (score: 0.0 / 5.0)';

  const allowedTagsFormatted = JSON.stringify(allowedTags.map((t) => String(t).toLowerCase()));

  return `You are an expert career curriculum architect specializing in engineering and data science education.
Your task is to design a personalized, outcome-oriented learning roadmap for a student targeting the role of "${roleName}".

STUDENT DIAGNOSTIC ASSESSMENT RESULTS:
The student completed a skill assessment across core dimensions (scale: 0.0 to 5.0):
${formattedDimensions}

CURRICULUM ARCHITECTURE RULES (STRICT COMPLIANCE REQUIRED):
1. MODULE COUNT & SEQUENCING:
   - Generate between 5 and 8 learning modules total.
   - Modules MUST be ordered strictly from the student's WEAKEST skill dimensions to their STRONGEST dimensions.
   - Dedicate foundational, comprehensive modules to priority skill gap areas (scores < 3.0).
2. RESOURCE TAGS CONSTRAINTS:
   - Every module must include an array of "resourceTags".
   - You MUST ONLY choose tags from this explicit allowed tags list:
     ${allowedTagsFormatted}
   - NEVER invent, alter, or introduce tags outside of this list.
3. NEVER WRITE URLS OR SPECIFIC LINKS:
   - Do NOT include resource URLs, hyperlinks, or external links anywhere in the response.
   - Resource links are automatically bound by our system from verified databases using your specified "resourceTags".
4. REALISTIC ESTIMATED HOURS:
   - Assign realistic study and practice hours ("estimatedHours") as positive integers between 5 and 30 hours per module.
5. MODULE IDENTIFIERS:
   - Each module must have a distinct, URL-friendly "moduleId" formatted in lowercase kebab-case (e.g. "react-state-architecture", "node-express-rest-apis").
6. PRIVACY & SECURITY:
   - NEVER include personal identifiable information, student names, or email addresses in the output.
7. OUTPUT FORMAT:
   - Return ONLY a single raw valid JSON object matching the exact schema below.
   - DO NOT include markdown code fences (like \`\`\`json or \`\`\`), greetings, explanations, or prose.

EXACT JSON SCHEMA:
{
  "modules": [
    {
      "moduleId": "kebab-case-unique-identifier",
      "title": "Concise, descriptive title for the module",
      "description": "2-3 sentences explaining core conceptual goals, practical projects, and expected competencies.",
      "resourceTags": ["allowed-tag-1", "allowed-tag-2"],
      "estimatedHours": 10
    }
  ]
}`;
}

// ---------------------------------------------------------------------------
// 4. Defensive Response Parsing & Normalization
// ---------------------------------------------------------------------------

/**
 * Defensively cleans and parses the raw text returned by the LLM.
 * Strips code fences, enforces JSON structure, kebab-cases module IDs,
 * filters resource tags against the allowed whitelist, and validates estimated hours.
 *
 * @param {string} rawText - Raw output from model
 * @param {string[]} allowedTags - Whitelisted resource tags
 * @returns {Array<Object>} Validated module array
 */
export function cleanAndParseLLMResponse(rawText, allowedTags = []) {
  if (!rawText || typeof rawText !== 'string') {
    throw new LLMParseError('Empty or non-string response received from LLM', { rawText });
  }

  let cleaned = rawText.trim();

  // Strip leading and trailing markdown code fences if present (```json ... ``` or ``` ... ```)
  if (cleaned.startsWith('```')) {
    cleaned = cleaned
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
  }

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new LLMParseError(`Failed to parse LLM response as JSON: ${err.message}`, {
      rawText: cleaned
    });
  }

  const rawModules = Array.isArray(parsed) ? parsed : parsed?.modules;
  if (!Array.isArray(rawModules) || rawModules.length === 0) {
    throw new LLMParseError("LLM response did not contain a valid 'modules' array", {
      rawText: cleaned
    });
  }

  const allowedSet = new Set(allowedTags.map((t) => String(t).toLowerCase().trim()));

  const normalizedModules = rawModules.map((mod, index) => {
    if (!mod || typeof mod !== 'object') {
      throw new LLMParseError(`Module item at index ${index} is not a valid object`, {
        rawText: cleaned
      });
    }

    // Enforce clean kebab-case identifier
    const rawId = mod.moduleId || `module-${index + 1}`;
    const moduleId =
      String(rawId)
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, '-')
        .replace(/^-+|-+$/g, '') || `module-${index + 1}`;

    const title = String(mod.title || `Module ${index + 1}`).trim();
    const description = String(mod.description || '').trim();

    // Whitelist-filter resourceTags
    let resourceTags = Array.isArray(mod.resourceTags)
      ? mod.resourceTags.map((t) => String(t).toLowerCase().trim()).filter((t) => allowedSet.has(t))
      : [];

    // Fallback: If no valid tags survived the filter, assign first allowed tag if available
    if (resourceTags.length === 0 && allowedTags.length > 0) {
      resourceTags = [allowedTags[0].toLowerCase().trim()];
    }

    // Enforce realistic bounds on estimated hours (5 - 40 hours)
    const parsedHours = Number(mod.estimatedHours);
    const estimatedHours = Number.isFinite(parsedHours)
      ? Math.max(5, Math.min(40, Math.round(parsedHours)))
      : 10;

    return {
      moduleId,
      title,
      description,
      resourceTags,
      estimatedHours
    };
  });

  return normalizedModules;
}

// ---------------------------------------------------------------------------
// 5. Provider Implementations (Groq, Gemini, OpenAI)
// ---------------------------------------------------------------------------

/**
 * Base LLM Provider Interface
 */
export class BaseLLMProvider {
  /**
   * Generates content from prompt
   * @param {Object} options
   * @param {string} options.prompt
   * @param {number} [options.timeoutMs]
   * @param {boolean} [options.jsonMode]
   * @returns {Promise<string>} Raw text output
   */
  async generateContent(_options) {
    throw new Error('generateContent must be implemented by provider');
  }
}

/**
 * Groq Provider (Ultra-fast inference via OpenAI-compatible endpoint)
 * Communicates with api.groq.com/openai/v1/chat/completions
 */
export class GroqProvider extends BaseLLMProvider {
  constructor({
    apiKey = process.env.GROQ_API_KEY,
    model = process.env.GROQ_MODEL || 'openai/gpt-oss-120b'
  } = {}) {
    super();
    this.apiKey = apiKey;
    this.model = model;
    this.name = 'groq';
  }

  async generateContent({ prompt, timeoutMs = 15000, jsonMode = true }) {
    if (!this.apiKey) {
      throw new LLMApiError('GROQ_API_KEY is not configured');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const endpoint = 'https://api.groq.com/openai/v1/chat/completions';
    const requestBody = {
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {})
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      if (!response.ok) {
        let errMessage = `Groq API HTTP Error ${response.status}`;
        try {
          const errData = await response.json();
          if (errData?.error?.message) {
            errMessage = redactSecrets(errData.error.message);
          }
        } catch {
          // ignore
        }
        throw new LLMApiError(errMessage, { statusCode: response.status });
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;

      if (!content || typeof content !== 'string') {
        throw new LLMApiError('Groq API returned empty response content');
      }

      return content;
    } catch (err) {
      if (err.name === 'AbortError' || controller.signal.aborted) {
        throw new LLMTimeoutError(`Groq request timed out after ${timeoutMs}ms`);
      }
      if (err instanceof LLMError) {
        throw err;
      }
      throw new LLMApiError(`Groq network request failed: ${redactSecrets(err.message)}`);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * Google Gemini Provider (REST implementation via native fetch)
 * Communicates with generativelanguage.googleapis.com
 */
export class GeminiProvider extends BaseLLMProvider {
  constructor({
    apiKey = process.env.GEMINI_API_KEY,
    model = process.env.GEMINI_MODEL || 'gemini-1.5-flash'
  } = {}) {
    super();
    this.apiKey = apiKey;
    this.model = model;
    this.name = 'gemini';
  }

  async generateContent({ prompt, timeoutMs = 15000, jsonMode = true }) {
    if (!this.apiKey) {
      throw new LLMApiError('GEMINI_API_KEY is not configured');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    // Use x-goog-api-key header to prevent exposing key in query URLs
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent`;

    const requestBody = {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        ...(jsonMode ? { responseMimeType: 'application/json' } : {})
      }
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': this.apiKey
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      if (!response.ok) {
        let errMessage = `Gemini API HTTP Error ${response.status}`;
        try {
          const errData = await response.json();
          if (errData?.error?.message) {
            errMessage = redactSecrets(errData.error.message);
          }
        } catch {
          // ignore JSON parse error on error response
        }
        throw new LLMApiError(errMessage, { statusCode: response.status });
      }

      const data = await response.json();
      const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!candidateText || typeof candidateText !== 'string') {
        throw new LLMApiError('Gemini API returned empty candidate content');
      }

      return candidateText;
    } catch (err) {
      if (err.name === 'AbortError' || controller.signal.aborted) {
        throw new LLMTimeoutError(`Gemini request timed out after ${timeoutMs}ms`);
      }
      if (err instanceof LLMError) {
        throw err;
      }
      throw new LLMApiError(`Gemini network request failed: ${redactSecrets(err.message)}`);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * OpenAI Provider (Swappable alternative via native fetch)
 * Communicates with api.openai.com/v1/chat/completions
 */
export class OpenAIProvider extends BaseLLMProvider {
  constructor({
    apiKey = process.env.OPENAI_API_KEY,
    model = process.env.OPENAI_MODEL || 'gpt-4o-mini'
  } = {}) {
    super();
    this.apiKey = apiKey;
    this.model = model;
    this.name = 'openai';
  }

  async generateContent({ prompt, timeoutMs = 15000, jsonMode = true }) {
    if (!this.apiKey) {
      throw new LLMApiError('OPENAI_API_KEY is not configured');
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const endpoint = 'https://api.openai.com/v1/chat/completions';
    const requestBody = {
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
      ...(jsonMode ? { response_format: { type: 'json_object' } } : {})
    };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal
      });

      if (!response.ok) {
        let errMessage = `OpenAI API HTTP Error ${response.status}`;
        try {
          const errData = await response.json();
          if (errData?.error?.message) {
            errMessage = redactSecrets(errData.error.message);
          }
        } catch {
          // ignore
        }
        throw new LLMApiError(errMessage, { statusCode: response.status });
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;

      if (!content || typeof content !== 'string') {
        throw new LLMApiError('OpenAI API returned empty response content');
      }

      return content;
    } catch (err) {
      if (err.name === 'AbortError' || controller.signal.aborted) {
        throw new LLMTimeoutError(`OpenAI request timed out after ${timeoutMs}ms`);
      }
      if (err instanceof LLMError) {
        throw err;
      }
      throw new LLMApiError(`OpenAI network request failed: ${redactSecrets(err.message)}`);
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * Resolves the currently active AI provider based on environment variables.
 * Priority: GROQ_API_KEY -> GEMINI_API_KEY -> OPENAI_API_KEY
 * @param {Object} [options={}]
 * @returns {BaseLLMProvider|null}
 */
export function getActiveAIProvider(options = {}) {
  if (process.env.GROQ_API_KEY) {
    return new GroqProvider(options);
  }
  if (process.env.GEMINI_API_KEY) {
    return new GeminiProvider(options);
  }
  if (process.env.OPENAI_API_KEY) {
    return new OpenAIProvider(options);
  }
  return null;
}

/**
 * Factory to instantiate the desired LLM provider
 * @param {'groq'|'gemini'|'openai'} [type='gemini']
 * @param {Object} [options={}]
 * @returns {BaseLLMProvider}
 */
export function createLLMProvider(type = 'gemini', options = {}) {
  if (type === 'groq') {
    return new GroqProvider(options);
  }
  if (type === 'openai') {
    return new OpenAIProvider(options);
  }
  return new GeminiProvider(options);
}

// ---------------------------------------------------------------------------
// 6. High-Level Service Orchestrator
// ---------------------------------------------------------------------------

/**
 * End-to-end roadmap module generator using configured LLM.
 *
 * @param {Object} params
 * @param {string} params.roleName - Name of the targeted career role
 * @param {Record<string, number>} params.dimensionScores - Dimension assessment scores
 * @param {string[]} params.allowedTags - Whitelisted tags from resource library
 * @param {BaseLLMProvider} [params.provider] - Optional injected provider instance
 * @param {number} [params.timeoutMs] - Optional override timeout in ms
 * @returns {Promise<{ modules: Array<Object>, rawText: string }>}
 */
export async function generateRoadmapModules({
  roleName,
  dimensionScores,
  allowedTags = [],
  provider = null,
  timeoutMs = null
}) {
  const activeProvider = provider || getActiveAIProvider() || createLLMProvider('gemini');
  const activeTimeout = timeoutMs || Number(process.env.LLM_TIMEOUT_MS) || 15000;

  const prompt = buildPrompt({ roleName, dimensionScores, allowedTags });
  const rawText = await activeProvider.generateContent({
    prompt,
    timeoutMs: activeTimeout,
    jsonMode: true
  });

  const modules = cleanAndParseLLMResponse(rawText, allowedTags);

  return {
    modules,
    rawText
  };
}

export default {
  buildPrompt,
  cleanAndParseLLMResponse,
  createLLMProvider,
  getActiveAIProvider,
  generateRoadmapModules,
  GroqProvider,
  GeminiProvider,
  OpenAIProvider,
  LLMError,
  LLMTimeoutError,
  LLMApiError,
  LLMParseError
};
