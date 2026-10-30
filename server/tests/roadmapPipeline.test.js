import { jest } from '@jest/globals';
import { z } from 'zod';
import { createRoadmapModulesSchema, validateRoadmapModules } from '../utils/roadmapSchema.js';
import { mapModuleResources, mapRoadmapResources } from '../services/resourceMapper.js';
import {
  MERN_FALLBACK_MODULES,
  DATA_ANALYST_FALLBACK_MODULES,
  getFallbackRoadmap
} from '../utils/fallbackRoadmap.js';
import { generateWithFallback } from '../services/roadmapGenerator.js';
import { LLMTimeoutError, LLMApiError, LLMParseError } from '../services/llmService.js';

describe('AI Roadmap Generation Pipeline Test Suite', () => {
  const allowedTags = ['javascript', 'react', 'node', 'express', 'mongodb', 'git'];

  const sampleLibrary = [
    {
      id: 'res-js-1',
      title: 'MDN JavaScript Reference',
      url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
      type: 'docs',
      dimension: 'javascript',
      tag: 'javascript'
    },
    {
      id: 'res-js-2',
      title: 'freeCodeCamp JS Guide',
      url: 'https://www.freecodecamp.org/news/learn-js/',
      type: 'article',
      dimension: 'javascript',
      tag: 'javascript'
    },
    {
      id: 'res-react-1',
      title: 'React Official Docs',
      url: 'https://react.dev',
      type: 'docs',
      dimension: 'react',
      tag: 'react'
    },
    {
      id: 'res-react-2',
      title: 'React Architecture Video',
      url: 'https://youtube.com/watch?v=react123',
      type: 'video',
      dimension: 'react',
      tag: 'react'
    },
    {
      id: 'res-node-1',
      title: 'Node Docs',
      url: 'https://nodejs.org/docs',
      type: 'docs',
      dimension: 'node-express',
      tag: 'node'
    },
    {
      id: 'res-db-1',
      title: 'MongoDB Docs',
      url: 'https://mongodb.com/docs',
      type: 'docs',
      dimension: 'databases-git',
      tag: 'mongodb'
    },
    {
      id: 'res-git-1',
      title: 'Git Docs',
      url: 'https://git-scm.com/docs',
      type: 'docs',
      dimension: 'databases-git',
      tag: 'git'
    }
  ];

  const sampleValidModules = [
    {
      moduleId: 'js-async-mastery',
      title: 'JavaScript Async Mastery',
      description: 'Master promises, event loop, and asynchronous JavaScript patterns.',
      resourceTags: ['javascript'],
      estimatedHours: 10
    },
    {
      moduleId: 'react-component-architecture',
      title: 'React Component Architecture',
      description: 'Build composable UI trees with functional hooks and state containers.',
      resourceTags: ['react'],
      estimatedHours: 12
    },
    {
      moduleId: 'node-backend-architecture',
      title: 'Node Backend Architecture',
      description: 'Design production-grade REST APIs with Express and Node.js.',
      resourceTags: ['node'],
      estimatedHours: 14
    },
    {
      moduleId: 'mongodb-data-layer',
      title: 'MongoDB Data Layer',
      description: 'Model schemas with Mongoose and execute aggregations.',
      resourceTags: ['mongodb'],
      estimatedHours: 12
    },
    {
      moduleId: 'git-version-workflows',
      title: 'Git Version Workflows',
      description: 'Collaborate with git branching, merge requests, and feature flags.',
      resourceTags: ['git'],
      estimatedHours: 8
    },
    {
      moduleId: 'fullstack-deployment',
      title: 'Fullstack Deployment',
      description: 'Deploy full-stack applications with environment isolation and HTTPS.',
      resourceTags: ['node'],
      estimatedHours: 10
    }
  ];

  afterEach(() => {
    jest.restoreAllMocks();
    delete process.env.FORCE_LLM_FAILURE;
  });

  // -------------------------------------------------------------------------
  // 1. Roadmap Schema Validation
  // -------------------------------------------------------------------------
  describe('1. roadmapSchema.js (Zod Validation)', () => {
    test('accepts valid 5 to 8 modules matching the schema', () => {
      const customSchema = createRoadmapModulesSchema(allowedTags);
      expect(customSchema).toBeDefined();
      const validated = validateRoadmapModules(sampleValidModules, allowedTags);
      expect(validated).toHaveLength(6);
      expect(validated[0].moduleId).toBe('js-async-mastery');
    });

    test('rejects fewer than 5 modules', () => {
      const fourModules = sampleValidModules.slice(0, 4);
      expect(() => validateRoadmapModules(fourModules, allowedTags)).toThrow(z.ZodError);
    });

    test('rejects more than 8 modules', () => {
      const nineModules = [
        ...sampleValidModules,
        {
          moduleId: 'mod-7',
          title: 'Title 7',
          description: 'Description 7 at least ten chars',
          resourceTags: ['node'],
          estimatedHours: 5
        },
        {
          moduleId: 'mod-8',
          title: 'Title 8',
          description: 'Description 8 at least ten chars',
          resourceTags: ['node'],
          estimatedHours: 5
        },
        {
          moduleId: 'mod-9',
          title: 'Title 9',
          description: 'Description 9 at least ten chars',
          resourceTags: ['node'],
          estimatedHours: 5
        }
      ];
      expect(() => validateRoadmapModules(nineModules, allowedTags)).toThrow(z.ZodError);
    });

    test('rejects non-kebab-case moduleId', () => {
      const invalidIds = ['ReactModule', 'mod_1', 'react module', 'mod-1!', '-leading-hyphen'];
      invalidIds.forEach((id) => {
        const modules = sampleValidModules.map((m, i) => (i === 0 ? { ...m, moduleId: id } : m));
        expect(() => validateRoadmapModules(modules, allowedTags)).toThrow(z.ZodError);
      });
    });

    test('rejects duplicate moduleIds within the roadmap', () => {
      const duplicates = sampleValidModules.map((m, i) =>
        i === 1 ? { ...m, moduleId: 'js-async-mastery' } : m
      );
      expect(() => validateRoadmapModules(duplicates, allowedTags)).toThrow(/unique/i);
    });

    test('rejects titles and descriptions containing URLs', () => {
      const withUrlInTitle = sampleValidModules.map((m, i) =>
        i === 0 ? { ...m, title: 'Learn React at https://react.dev' } : m
      );
      expect(() => validateRoadmapModules(withUrlInTitle, allowedTags)).toThrow(z.ZodError);

      const withUrlInDesc = sampleValidModules.map((m, i) =>
        i === 0 ? { ...m, description: 'Check out www.example.com for tutorials' } : m
      );
      expect(() => validateRoadmapModules(withUrlInDesc, allowedTags)).toThrow(z.ZodError);
    });

    test('rejects empty resourceTags or tags not in allowed list', () => {
      const emptyTags = sampleValidModules.map((m, i) =>
        i === 0 ? { ...m, resourceTags: [] } : m
      );
      expect(() => validateRoadmapModules(emptyTags, allowedTags)).toThrow(z.ZodError);

      const unallowedTag = sampleValidModules.map((m, i) =>
        i === 0 ? { ...m, resourceTags: ['unauthorized-technology'] } : m
      );
      expect(() => validateRoadmapModules(unallowedTag, allowedTags)).toThrow(z.ZodError);
    });

    test('rejects estimatedHours outside 1-40 or non-integer', () => {
      const zeroHours = sampleValidModules.map((m, i) =>
        i === 0 ? { ...m, estimatedHours: 0 } : m
      );
      expect(() => validateRoadmapModules(zeroHours, allowedTags)).toThrow(z.ZodError);

      const excessHours = sampleValidModules.map((m, i) =>
        i === 0 ? { ...m, estimatedHours: 41 } : m
      );
      expect(() => validateRoadmapModules(excessHours, allowedTags)).toThrow(z.ZodError);

      const floatHours = sampleValidModules.map((m, i) =>
        i === 0 ? { ...m, estimatedHours: 10.5 } : m
      );
      expect(() => validateRoadmapModules(floatHours, allowedTags)).toThrow(z.ZodError);
    });

    test('rejects extra unexpected fields (strict validation)', () => {
      const extraField = sampleValidModules.map((m, i) =>
        i === 0 ? { ...m, extraProp: 'malicious' } : m
      );
      expect(() => validateRoadmapModules(extraField, allowedTags)).toThrow(z.ZodError);
    });
  });

  // -------------------------------------------------------------------------
  // 2. Resource Mapper
  // -------------------------------------------------------------------------
  describe('2. resourceMapper.js', () => {
    test('maps tags to real resources from the library (max 3, no duplicates)', () => {
      const mod = {
        moduleId: 'm-1',
        resourceTags: ['javascript']
      };

      const resources = mapModuleResources(mod, sampleLibrary, 'javascript');
      expect(resources).toHaveLength(2); // only 2 js resources in sampleLibrary
      expect(resources[0].title).toBe('MDN JavaScript Reference');
      expect(resources[0].url).toBe('https://developer.mozilla.org/en-US/docs/Web/JavaScript');
      expect(resources[0].type).toBe('docs');
    });

    test('emits NO unknown URLs (every URL exists in resourceLibrary)', () => {
      const libraryUrls = new Set(sampleLibrary.map((r) => r.url));
      const mapped = mapRoadmapResources(sampleValidModules, sampleLibrary, 'javascript');

      mapped.forEach((mod) => {
        expect(mod.resources.length).toBeGreaterThan(0);
        expect(mod.resources.length).toBeLessThanOrEqual(3);
        mod.resources.forEach((r) => {
          expect(libraryUrls.has(r.url)).toBe(true);
        });
      });
    });

    test('uses weakest dimension top resources when module tags have no matches', () => {
      const mod = {
        moduleId: 'unknown-tag-mod',
        resourceTags: ['non-existent-tag']
      };

      const resources = mapModuleResources(mod, sampleLibrary, 'react');
      expect(resources).toHaveLength(2);
      expect(resources[0].url).toBe('https://react.dev');
    });

    test('deduplicates resources with identical URLs', () => {
      const libraryWithDuplicates = [
        ...sampleLibrary,
        {
          id: 'res-js-dup',
          title: 'Duplicate MDN',
          url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
          type: 'docs',
          tag: 'javascript'
        }
      ];

      const mod = { moduleId: 'm-dup', resourceTags: ['javascript'] };
      const resources = mapModuleResources(mod, libraryWithDuplicates, 'javascript');
      const urls = resources.map((r) => r.url);
      expect(new Set(urls).size).toBe(urls.length);
    });
  });

  // -------------------------------------------------------------------------
  // 3. Fallback Roadmap Templates & Ordering
  // -------------------------------------------------------------------------
  describe('3. fallbackRoadmap.js', () => {
    test('both MERN and Data Analyst fallbacks produce 6 valid modules', () => {
      expect(MERN_FALLBACK_MODULES).toHaveLength(6);
      expect(DATA_ANALYST_FALLBACK_MODULES).toHaveLength(6);

      const mernFallback = getFallbackRoadmap({
        roleSlug: 'mern-developer',
        dimensionScores: { javascript: 3, react: 2, 'node-express': 4, 'databases-git': 5 },
        resourceLibrary: sampleLibrary
      });
      expect(mernFallback).toHaveLength(6);

      const daFallback = getFallbackRoadmap({
        roleSlug: 'data-analyst',
        dimensionScores: { 'excel-sql': 1, python: 3, statistics: 4, 'data-visualization': 2 },
        resourceLibrary: sampleLibrary
      });
      expect(daFallback).toHaveLength(6);
    });

    test('MERN fallback moduleIds strictly match data/checkpoints.json definitions', () => {
      const mernFallback = getFallbackRoadmap({
        roleSlug: 'mern-developer',
        dimensionScores: {},
        resourceLibrary: sampleLibrary
      });

      const mernIds = mernFallback.map((m) => m.moduleId).sort();
      const expectedIds = [
        'mern-mod-1',
        'mern-mod-2',
        'mern-mod-3',
        'mern-mod-4',
        'mern-mod-5',
        'mern-mod-6'
      ].sort();

      expect(mernIds).toEqual(expectedIds);
    });

    test('orders fallback modules starting from student weakest dimension', () => {
      // React is weakest (1.0), Databases & Git is strongest (5.0)
      const scores = {
        react: 1.0,
        javascript: 3.0,
        'node-express': 4.0,
        'databases-git': 5.0
      };

      const mernFallback = getFallbackRoadmap({
        roleSlug: 'mern-developer',
        dimensionScores: scores,
        resourceLibrary: sampleLibrary
      });

      // The react module (mern-mod-2) must be the first module in the ordered roadmap
      expect(mernFallback[0].moduleId).toBe('mern-mod-2');
    });

    test('enforces status: active on first module, locked on rest, and checkpointScore null', () => {
      const fallback = getFallbackRoadmap({
        roleSlug: 'mern-developer',
        dimensionScores: {},
        resourceLibrary: sampleLibrary
      });

      expect(fallback[0].status).toBe('active');
      expect(fallback[0].checkpointScore).toBeNull();

      for (let i = 1; i < fallback.length; i++) {
        expect(fallback[i].status).toBe('locked');
        expect(fallback[i].checkpointScore).toBeNull();
      }
    });
  });

  // -------------------------------------------------------------------------
  // 4. roadmapGenerator.js & Fallback Resilience
  // -------------------------------------------------------------------------
  describe('4. roadmapGenerator.js (AI Pipeline & Fallbacks)', () => {
    test('successfully generates roadmap with generatedBy: "llm" when LLM succeeds', async () => {
      const mockLlm = jest.fn().mockResolvedValue({
        modules: sampleValidModules,
        rawText: JSON.stringify({ modules: sampleValidModules })
      });

      const result = await generateWithFallback({
        role: 'mern-developer',
        dimensionScores: { javascript: 3, react: 1, 'node-express': 2, 'databases-git': 4 },
        resourceLibrary: sampleLibrary,
        llmGenerator: mockLlm
      });

      expect(mockLlm).toHaveBeenCalledTimes(1);
      expect(result.generatedBy).toBe('llm');
      expect(result.modules).toHaveLength(6);
      expect(result.modules[0].status).toBe('active');
      expect(result.modules[1].status).toBe('locked');
      expect(result.modules[0].resources.length).toBeGreaterThan(0);
    });

    test('overrides status and checkpointScore even if LLM output attempted to set them', async () => {
      const maliciousStatusModules = sampleValidModules.map((m) => ({
        ...m,
        status: 'complete',
        checkpointScore: 100
      }));

      const mockLlm = jest.fn().mockResolvedValue({
        modules: maliciousStatusModules,
        rawText: JSON.stringify({ modules: maliciousStatusModules })
      });

      const result = await generateWithFallback({
        role: 'mern-developer',
        dimensionScores: { javascript: 3 },
        resourceLibrary: sampleLibrary,
        llmGenerator: mockLlm
      });

      expect(result.modules[0].status).toBe('active');
      expect(result.modules[1].status).toBe('locked');
      expect(result.modules[0].checkpointScore).toBeNull();
    });

    test('returns valid fallback on LLM timeout error', async () => {
      const mockLlm = jest.fn().mockRejectedValue(new LLMTimeoutError('Timeout exceeded'));

      const result = await generateWithFallback({
        role: 'mern-developer',
        dimensionScores: { react: 1.0 },
        resourceLibrary: sampleLibrary,
        llmGenerator: mockLlm
      });

      expect(result.generatedBy).toBe('fallback');
      expect(result.modules).toHaveLength(6);
      expect(result.modules[0].status).toBe('active');
    });

    test('returns valid fallback on LLM unparseable JSON error', async () => {
      const mockLlm = jest
        .fn()
        .mockRejectedValue(new LLMParseError('Malformed JSON', { rawText: 'invalid' }));

      const result = await generateWithFallback({
        role: 'data-analyst',
        dimensionScores: { python: 1.0 },
        resourceLibrary: sampleLibrary,
        llmGenerator: mockLlm
      });

      expect(result.generatedBy).toBe('fallback');
      expect(result.modules).toHaveLength(6);
      expect(result.modules[0].status).toBe('active');
    });

    test('returns valid fallback on LLM schema-invalid output (e.g. only 3 modules)', async () => {
      const mockLlm = jest.fn().mockResolvedValue({
        modules: sampleValidModules.slice(0, 3), // too few
        rawText: ''
      });

      const result = await generateWithFallback({
        role: 'mern-developer',
        dimensionScores: { javascript: 2.0 },
        resourceLibrary: sampleLibrary,
        llmGenerator: mockLlm
      });

      expect(result.generatedBy).toBe('fallback');
      expect(result.modules).toHaveLength(6);
    });

    test('returns valid fallback on LLM API error (e.g. rate limit / network failure)', async () => {
      const mockLlm = jest
        .fn()
        .mockRejectedValue(new LLMApiError('HTTP 429 Too Many Requests', { statusCode: 429 }));

      const result = await generateWithFallback({
        role: 'mern-developer',
        dimensionScores: {},
        resourceLibrary: sampleLibrary,
        llmGenerator: mockLlm
      });

      expect(result.generatedBy).toBe('fallback');
      expect(result.modules).toHaveLength(6);
    });

    test('FORCE_LLM_FAILURE=true immediately triggers fallback generation', async () => {
      process.env.FORCE_LLM_FAILURE = 'true';
      const mockLlm = jest.fn();

      const result = await generateWithFallback({
        role: 'mern-developer',
        dimensionScores: { react: 1.0 },
        resourceLibrary: sampleLibrary,
        llmGenerator: mockLlm
      });

      expect(mockLlm).not.toHaveBeenCalled();
      expect(result.generatedBy).toBe('fallback');
      expect(result.modules).toHaveLength(6);
    });

    test('generateWithFallback never throws under completely unexpected error', async () => {
      const mockLlm = jest.fn().mockImplementation(() => {
        throw new Error('Unexpected fatal crash');
      });

      await expect(
        generateWithFallback({
          role: null,
          dimensionScores: null,
          resourceLibrary: null,
          llmGenerator: mockLlm
        })
      ).resolves.toMatchObject({
        generatedBy: 'fallback'
      });
    });
  });
});
