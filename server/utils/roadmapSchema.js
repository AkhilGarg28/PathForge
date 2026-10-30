import { z } from 'zod';

const URL_REGEX = /(?:https?:\/\/|www\.)[^\s]+/i;
const KEBAB_CASE_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Creates a strict Zod schema for validating raw LLM-generated roadmap modules.
 *
 * @param {string[]} [allowedTags=[]] - Whitelist of allowed resource tags.
 * @returns {z.ZodArray} Zod schema
 */
export function createRoadmapModulesSchema(allowedTags = []) {
  const allowedTagSet =
    allowedTags && allowedTags.length > 0
      ? new Set(allowedTags.map((t) => String(t).toLowerCase().trim()))
      : null;

  const singleModuleSchema = z
    .object({
      moduleId: z
        .string({ required_error: 'moduleId is required' })
        .min(1, 'moduleId is required')
        .max(60, 'moduleId too long')
        .regex(KEBAB_CASE_REGEX, 'moduleId must be in lowercase kebab-case format')
        .refine((val) => !URL_REGEX.test(val), 'moduleId must not contain URLs'),

      title: z
        .string({ required_error: 'title is required' })
        .min(3, 'title must be at least 3 characters')
        .max(100, 'title cannot exceed 100 characters')
        .refine((val) => !URL_REGEX.test(val), 'title must not contain URLs'),

      description: z
        .string({ required_error: 'description is required' })
        .min(10, 'description must be at least 10 characters')
        .max(500, 'description cannot exceed 500 characters')
        .refine((val) => !URL_REGEX.test(val), 'description must not contain URLs'),

      resourceTags: z
        .array(z.string().min(1, 'Tag cannot be empty'), {
          required_error: 'resourceTags is required'
        })
        .min(1, 'resourceTags must contain at least one tag')
        .refine((tags) => {
          if (!allowedTagSet) return true;
          return tags.every((tag) => allowedTagSet.has(String(tag).toLowerCase().trim()));
        }, 'resourceTags contains tags not present in the allowed tags whitelist'),

      estimatedHours: z
        .number({ required_error: 'estimatedHours is required' })
        .int('estimatedHours must be an integer')
        .min(1, 'estimatedHours must be at least 1')
        .max(40, 'estimatedHours cannot exceed 40'),

      status: z.enum(['active', 'locked', 'complete']).optional(),
      checkpointScore: z.number().nullable().optional()
    })
    .strict();

  return z
    .array(singleModuleSchema)
    .min(5, 'Roadmap must contain between 5 and 8 modules')
    .max(8, 'Roadmap must contain between 5 and 8 modules')
    .refine((modules) => {
      const ids = modules.map((m) => m.moduleId);
      return new Set(ids).size === ids.length;
    }, 'All moduleIds must be strictly unique within the roadmap');
}

/**
 * Validates raw LLM roadmap modules against the schema and tag whitelist.
 *
 * @param {Array|Object} input - Raw modules array or object with modules array
 * @param {string[]} [allowedTags=[]] - Whitelisted tags
 * @returns {Array<Object>} Validated modules array
 */
export function validateRoadmapModules(input, allowedTags = []) {
  const rawModules = Array.isArray(input) ? input : input?.modules;
  if (!rawModules || !Array.isArray(rawModules)) {
    throw new z.ZodError([
      {
        code: z.ZodIssueCode.custom,
        path: ['modules'],
        message: 'Expected array of modules or object with modules array'
      }
    ]);
  }

  const schema = createRoadmapModulesSchema(allowedTags);
  return schema.parse(rawModules);
}

export const defaultRoadmapModulesSchema = createRoadmapModulesSchema();
