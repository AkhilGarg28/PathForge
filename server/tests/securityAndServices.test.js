const request = require('supertest');
const app = require('../app');
const User = require('../models/User');
const mongoSanitize = require('../middleware/mongoSanitize');
const { errorHandler } = require('../middleware/errorHandler');
const questionService = require('../services/questionService');
const llmService = require('../services/llmService');
const {
  generateFallbackRoadmap,
  generateWithFallback,
  callGeminiApi,
} = llmService;
const env = require('../config/env');

describe('Security & Services Hardening Tests', () => {
  beforeEach(() => {
    jest.spyOn(User, 'findOne').mockResolvedValue(null);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('mongoSanitize Middleware', () => {
    it('should strip keys starting with $ or containing a dot from req.body', () => {
      const req = {
        body: {
          validField: 'hello',
          $where: 'sleep(5000)',
          nested: {
            normal: 123,
            $gt: 0,
            'dot.key': 'evil',
          },
          array: [{ $ne: null, validItem: 'item' }],
        },
        params: {
          $in: 'admin',
          validParam: '123',
        },
        query: {
          $regex: '.*',
          'filter.field': 'value',
        },
      };

      const next = jest.fn();
      mongoSanitize(req, {}, next);

      expect(next).toHaveBeenCalled();
      expect(req.body).not.toHaveProperty('$where');
      expect(req.body.validField).toBe('hello');
      expect(req.body.nested).not.toHaveProperty('$gt');
      expect(req.body.nested).not.toHaveProperty('dot.key');
      expect(req.body.nested.normal).toBe(123);
      expect(req.body.array[0]).not.toHaveProperty('$ne');
      expect(req.body.array[0].validItem).toBe('item');
      expect(req.params).not.toHaveProperty('$in');
      expect(req.params.validParam).toBe('123');
      expect(req.query).not.toHaveProperty('$regex');
      expect(req.query).not.toHaveProperty('filter.field');
    });

    it('should handle undefined or null body/params/query gracefully', () => {
      const req = {};
      const next = jest.fn();
      mongoSanitize(req, {}, next);
      expect(next).toHaveBeenCalled();
    });

    it('should sanitize real HTTP request payloads via express app', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123',
          $operator: 'injection',
        });

      // The $operator key is stripped, request completes normal auth flow (401 invalid credentials)
      expect(res.statusCode).toBe(401);
    });
  });

  describe('errorHandler Middleware', () => {
    it('should map Mongoose CastError to 400', () => {
      const err = new Error('Cast to ObjectId failed');
      err.name = 'CastError';

      const req = {};
      const res = {
        statusCode: 200,
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      errorHandler(err, req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.any(String) })
      );
    });

    it('should mask 500 error messages when in production', () => {
      const originalEnv = env.NODE_ENV;
      env.NODE_ENV = 'production';

      const err = new Error('Sensitive DB connection string leaked in error');
      const req = {};
      const res = {
        statusCode: 500,
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
      };
      const next = jest.fn();

      errorHandler(err, req, res, next);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Internal Server Error',
      });

      env.NODE_ENV = originalEnv;
    });
  });

  describe('questionService Lookup Methods', () => {
    it('should lookup questions by dimension and role', () => {
      const questions = questionService.getQuestionsByDimension(
        'MERN Developer',
        'Frontend React'
      );
      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBeGreaterThan(0);
      questions.forEach((q) => {
        expect(q.roleName).toBe('MERN Developer');
        expect(q.dimension).toBe('Frontend React');
      });
    });

    it('should lookup question by ID', () => {
      const q = questionService.getQuestionById('mern-q1');
      expect(q).toBeDefined();
      expect(q.id).toBe('mern-q1');
    });

    it('should retrieve all checkpoints and filter by role or dimension', () => {
      const allCheckpoints = questionService.getAllCheckpoints();
      expect(Array.isArray(allCheckpoints)).toBe(true);
      expect(allCheckpoints.length).toBe(24);

      const mernCheckpoints =
        questionService.getCheckpointsByRole('MERN Developer');
      expect(mernCheckpoints.length).toBe(24);

      const reactCheckpoints =
        questionService.getCheckpointsByDimension('Frontend React');
      expect(reactCheckpoints.length).toBe(4);
    });

    it('should retrieve resources by dimension and all resources', () => {
      const allResources = questionService.getAllResources();
      expect(Array.isArray(allResources)).toBe(true);
      expect(allResources.length).toBe(36);

      const resources = questionService.getResourcesByDimension(
        'Frontend React',
        'MERN Developer'
      );
      expect(resources.length).toBe(3);
    });

    it('should reload cache successfully', () => {
      expect(() => questionService.reload()).not.toThrow();
    });
  });

  describe('llmService & Fallback Generator', () => {
    it('generateFallbackRoadmap creates valid 6-module curriculum prioritizing lower scores', () => {
      const dimensionScores = {
        'Frontend React': 1.0, // weak
        'Node & Express': 4.5, // strong
      };

      const modules = generateFallbackRoadmap(
        'MERN Developer',
        dimensionScores
      );
      expect(Array.isArray(modules)).toBe(true);
      expect(modules.length).toBeGreaterThanOrEqual(6);

      // First module must be active, rest locked
      expect(modules[0].status).toBe('active');
      for (let i = 1; i < modules.length; i++) {
        expect(modules[i].status).toBe('locked');
      }

      // Weakest dimension should be placed first
      expect(modules[0].resourceTags).toContain('Frontend React');
    });

    it('callGeminiApi parses valid JSON from LLM and sets module statuses', async () => {
      const originalFetch = global.fetch;
      const originalKey = env.GEMINI_API_KEY;
      env.GEMINI_API_KEY = 'test-key';

      global.fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify([
                      {
                        moduleId: 'mod-1',
                        title: 'Title 1',
                        description: 'Desc 1',
                        resourceTags: ['Tag1'],
                        resources: [
                          {
                            title: 'Res 1',
                            url: 'https://example.com',
                            type: 'video',
                          },
                        ],
                        estimatedHours: 12,
                      },
                    ]),
                  },
                ],
              },
            },
          ],
        }),
      });

      const modules = await callGeminiApi('MERN Developer', {});
      expect(modules).toHaveLength(1);
      expect(modules[0].moduleId).toBe('mod-1');
      expect(modules[0].status).toBe('active');

      global.fetch = originalFetch;
      env.GEMINI_API_KEY = originalKey;
    });

    it('callGeminiApi throws when API returns non-200 error', async () => {
      const originalFetch = global.fetch;
      const originalKey = env.GEMINI_API_KEY;
      env.GEMINI_API_KEY = 'test-key';

      global.fetch = jest.fn().mockResolvedValue({
        ok: false,
        status: 403,
        text: async () => 'Quota exceeded',
      });

      await expect(callGeminiApi('MERN Developer', {})).rejects.toThrow(
        /Gemini API returned status 403/
      );

      global.fetch = originalFetch;
      env.GEMINI_API_KEY = originalKey;
    });

    it('generateWithFallback seamlessly returns fallback when Gemini API fails', async () => {
      jest
        .spyOn(llmService, 'callGeminiApi')
        .mockRejectedValue(new Error('Network offline'));

      const modules = await generateWithFallback('MERN Developer', {
        'Frontend React': 2.0,
      });

      expect(Array.isArray(modules)).toBe(true);
      expect(modules[0].status).toBe('active');
      expect(modules.length).toBeGreaterThanOrEqual(6);
    });
  });
});
