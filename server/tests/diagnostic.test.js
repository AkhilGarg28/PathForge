const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../app');
const Role = require('../models/Role');
const User = require('../models/User');
const Diagnostic = require('../models/Diagnostic');
const Roadmap = require('../models/Roadmap');
const questionService = require('../services/questionService');
const llmService = require('../services/llmService');
const env = require('../config/env');

describe('Diagnostic Endpoints (/api/diagnostic)', () => {
  const mockUserId = '507f1f77bcf86cd799439011';
  const mockRoleId = '507f191e810c19729de860ea';
  const validToken = jwt.sign({ id: mockUserId }, env.JWT_SECRET, {
    expiresIn: '7d',
  });

  const mockRole = {
    _id: new mongoose.Types.ObjectId(mockRoleId),
    name: 'MERN Developer',
    description: 'Full stack web development',
    dimensions: [
      'Frontend React',
      'Node & Express',
      'MongoDB & Mongoose',
      'API Design & Security',
      'State Management',
      'Testing & Deployment',
    ],
  };

  let savedDiagnostics = [];
  let savedRoadmaps = [];
  let archivedRoadmaps = [];

  beforeEach(() => {
    savedDiagnostics = [];
    savedRoadmaps = [];
    archivedRoadmaps = [];

    // Mock User.findById for authMiddleware
    jest.spyOn(User, 'findById').mockImplementation((id) => {
      const idStr = id ? id.toString() : mockUserId;
      return {
        select: jest.fn().mockImplementation((fields) => {
          const user = {
            _id: new mongoose.Types.ObjectId(idStr),
            name: 'Test Student',
            email: `student-${idStr}@example.com`,
            targetRole: 'MERN Developer',
          };
          if (fields && fields.includes('-passwordHash')) {
            delete user.passwordHash;
          }
          return Promise.resolve(user);
        }),
      };
    });

    // Mock Role.findById
    jest.spyOn(Role, 'findById').mockImplementation((id) => {
      if (id.toString() === mockRoleId) {
        return Promise.resolve(mockRole);
      }
      return Promise.resolve(null);
    });

    // Mock Diagnostic.create
    jest.spyOn(Diagnostic, 'create').mockImplementation((data) => {
      const doc = {
        _id: new mongoose.Types.ObjectId(),
        ...data,
      };
      savedDiagnostics.push(doc);
      return Promise.resolve(doc);
    });

    // Mock Roadmap.updateMany (archiving active roadmaps)
    jest.spyOn(Roadmap, 'updateMany').mockImplementation((filter, update) => {
      if (filter.isArchived === false && update.isArchived === true) {
        archivedRoadmaps.push({ filter, update });
      }
      return Promise.resolve({ modifiedCount: 1 });
    });

    // Mock Roadmap.create
    jest.spyOn(Roadmap, 'create').mockImplementation((data) => {
      const doc = {
        _id: new mongoose.Types.ObjectId(),
        ...data,
      };
      savedRoadmaps.push(doc);
      return Promise.resolve(doc);
    });

    // Mock LLM call by default to avoid slow external HTTP requests
    jest.spyOn(llmService, 'callGeminiApi').mockResolvedValue([
      {
        moduleId: 'ai-mod-1',
        title: 'AI Customized Module 1',
        description: 'Tailored by Gemini',
        resourceTags: ['AI', 'React'],
        resources: [{ title: 'Doc', url: 'https://example.com', type: 'docs' }],
        estimatedHours: 10,
      },
      {
        moduleId: 'ai-mod-2',
        title: 'AI Customized Module 2',
        description: 'Tailored by Gemini',
        resourceTags: ['AI', 'Node'],
        resources: [{ title: 'Doc', url: 'https://example.com', type: 'docs' }],
        estimatedHours: 15,
      },
    ]);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/diagnostic/:roleId', () => {
    it('should return 401 when called without authentication', async () => {
      const res = await request(app).get(`/api/diagnostic/${mockRoleId}`);
      expect(res.statusCode).toBe(401);
    });

    it('should return 400 for an invalid roleId format', async () => {
      const res = await request(app)
        .get('/api/diagnostic/invalid-id')
        .set('Cookie', [`token=${validToken}`]);

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/invalid role id/i);
    });

    it('should return 404 for a non-existent roleId', async () => {
      const nonExistent = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .get(`/api/diagnostic/${nonExistent}`)
        .set('Cookie', [`token=${validToken}`]);

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toMatch(/role not found/i);
    });

    it('should return role questions and NEVER leak correctIndex', async () => {
      const res = await request(app)
        .get(`/api/diagnostic/${mockRoleId}`)
        .set('Cookie', [`token=${validToken}`]);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('questions');
      expect(Array.isArray(res.body.questions)).toBe(true);
      expect(res.body.questions.length).toBeGreaterThan(0);

      // Verify that correctIndex does not exist in any question object
      res.body.questions.forEach((q) => {
        expect(q).toHaveProperty('id');
        expect(q).toHaveProperty('question');
        expect(q).toHaveProperty('options');
        expect(q).toHaveProperty('dimension');
        expect(q).not.toHaveProperty('correctIndex');
      });

      // Strict check: correctIndex must not appear anywhere in the serialized JSON text
      expect(res.text.includes('correctIndex')).toBe(false);
    });
  });

  describe('POST /api/diagnostic/submit', () => {
    let roleQuestions;

    beforeEach(() => {
      roleQuestions = questionService.getQuestionsByRole('MERN Developer');
    });

    it('should return 401 when called without authentication', async () => {
      const res = await request(app).post('/api/diagnostic/submit').send({
        roleId: mockRoleId,
        answers: [],
      });
      expect(res.statusCode).toBe(401);
    });

    it('should reject when not all questions are answered (missing answers)', async () => {
      const partialAnswers = [{ questionId: roleQuestions[0].id, selectedIndex: 1 }];

      const res = await request(app)
        .post('/api/diagnostic/submit')
        .set('Cookie', [`token=${validToken}`])
        .send({
          roleId: mockRoleId,
          answers: partialAnswers,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/expected answers for all/i);
    });

    it('should reject duplicate answers for the same question', async () => {
      const duplicateAnswers = roleQuestions.map((q) => ({
        questionId: q.id,
        selectedIndex: 0,
      }));
      duplicateAnswers[duplicateAnswers.length - 1] = {
        questionId: roleQuestions[0].id,
        selectedIndex: 1,
      };

      const res = await request(app)
        .post('/api/diagnostic/submit')
        .set('Cookie', [`token=${validToken}`])
        .send({
          roleId: mockRoleId,
          answers: duplicateAnswers,
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/duplicate answer/i);
    });

    it('should reject invalid selectedIndex out of range', async () => {
      const invalidIndexAnswers = roleQuestions.map((q) => ({
        questionId: q.id,
        selectedIndex: 0,
      }));
      invalidIndexAnswers[0].selectedIndex = 4;

      const res = await request(app)
        .post('/api/diagnostic/submit')
        .set('Cookie', [`token=${validToken}`])
        .send({
          roleId: mockRoleId,
          answers: invalidIndexAnswers,
        });

      expect(res.statusCode).toBe(400);
    });

    it('should successfully score diagnostic, call LLM, archive old roadmap, and return roadmap', async () => {
      const userToken = jwt.sign(
        { id: '507f1f77bcf86cd799439055' },
        env.JWT_SECRET
      );

      const allCorrectAnswers = roleQuestions.map((q) => ({
        questionId: q.id,
        selectedIndex: q.correctIndex,
      }));

      const res = await request(app)
        .post('/api/diagnostic/submit')
        .set('Cookie', [`token=${userToken}`])
        .send({
          roleId: mockRoleId,
          answers: allCorrectAnswers,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('dimensionScores');
      expect(res.body).toHaveProperty('readinessScore');
      expect(res.body).toHaveProperty('roadmap');

      // Verify old active roadmap was archived
      expect(archivedRoadmaps.length).toBeGreaterThan(0);

      // Verify roadmap has modules from LLM and history entry
      expect(res.body.roadmap.modules[0].moduleId).toBe('ai-mod-1');
      expect(res.body.roadmap.modules[0].status).toBe('active');
      expect(res.body.roadmap.history[0].event).toBe('roadmap_created');
    });

    it('LLM failure path never returns 500 and returns fallback roadmap', async () => {
      // Mock LLM failure
      jest
        .spyOn(llmService, 'callGeminiApi')
        .mockRejectedValue(new Error('Gemini API Quota Exceeded'));

      const userToken = jwt.sign(
        { id: '507f1f77bcf86cd799439066' },
        env.JWT_SECRET
      );

      const allCorrectAnswers = roleQuestions.map((q) => ({
        questionId: q.id,
        selectedIndex: q.correctIndex,
      }));

      const res = await request(app)
        .post('/api/diagnostic/submit')
        .set('Cookie', [`token=${userToken}`])
        .send({
          roleId: mockRoleId,
          answers: allCorrectAnswers,
        });

      // Must NOT return 500
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('roadmap');
      expect(res.body.roadmap.modules).toBeDefined();
      expect(res.body.roadmap.modules.length).toBeGreaterThan(0);
      expect(res.body.roadmap.modules[0].status).toBe('active');
    });

    it('should enforce rate limit and return 429 when submitted twice within 2 minutes', async () => {
      const rateLimitUserId = '507f1f77bcf86cd799439077';
      const userToken = jwt.sign({ id: rateLimitUserId }, env.JWT_SECRET);

      const allCorrectAnswers = roleQuestions.map((q) => ({
        questionId: q.id,
        selectedIndex: q.correctIndex,
      }));

      // First request -> 200
      const firstRes = await request(app)
        .post('/api/diagnostic/submit')
        .set('Cookie', [`token=${userToken}`])
        .send({
          roleId: mockRoleId,
          answers: allCorrectAnswers,
        });
      expect(firstRes.statusCode).toBe(200);

      // Second immediate request from same user -> 429
      const secondRes = await request(app)
        .post('/api/diagnostic/submit')
        .set('Cookie', [`token=${userToken}`])
        .send({
          roleId: mockRoleId,
          answers: allCorrectAnswers,
        });
      expect(secondRes.statusCode).toBe(429);
      expect(secondRes.body.message).toMatch(
        /too many roadmap generation requests/i
      );
    });
  });
});
