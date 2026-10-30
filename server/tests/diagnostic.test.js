const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../app');
const Role = require('../models/Role');
const User = require('../models/User');
const Diagnostic = require('../models/Diagnostic');
const questionService = require('../services/questionService');
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

  beforeEach(() => {
    savedDiagnostics = [];

    // Mock User.findById for authMiddleware
    jest.spyOn(User, 'findById').mockImplementation((id) => ({
      select: jest.fn().mockImplementation((fields) => {
        if (id.toString() === mockUserId) {
          const user = {
            _id: new mongoose.Types.ObjectId(mockUserId),
            name: 'Test Student',
            email: 'student@example.com',
            targetRole: 'MERN Developer',
          };
          if (fields && fields.includes('-passwordHash')) {
            delete user.passwordHash;
          }
          return Promise.resolve(user);
        }
        return Promise.resolve(null);
      }),
    }));

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
      // Send only one answer when role has 12 questions
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
      // Overwrite last answer with duplicate of first
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
      invalidIndexAnswers[0].selectedIndex = 4; // Out of range for 4 options (0-3)

      const res = await request(app)
        .post('/api/diagnostic/submit')
        .set('Cookie', [`token=${validToken}`])
        .send({
          roleId: mockRoleId,
          answers: invalidIndexAnswers,
        });

      expect(res.statusCode).toBe(400);
    });

    it('should successfully score diagnostic, save document, and return scores', async () => {
      // Provide all correct answers
      const allCorrectAnswers = roleQuestions.map((q) => ({
        questionId: q.id,
        selectedIndex: q.correctIndex,
      }));

      const res = await request(app)
        .post('/api/diagnostic/submit')
        .set('Cookie', [`token=${validToken}`])
        .send({
          roleId: mockRoleId,
          answers: allCorrectAnswers,
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('dimensionScores');
      expect(res.body).toHaveProperty('readinessScore');

      // Since all answers were correct, every dimension score should be 5 and readiness 100
      expect(res.body.readinessScore).toBe(100);
      Object.values(res.body.dimensionScores).forEach((score) => {
        expect(score).toBe(5);
      });

      // Verify that Diagnostic document was saved in database
      expect(savedDiagnostics.length).toBe(1);
      expect(savedDiagnostics[0].userId.toString()).toBe(mockUserId);
      expect(savedDiagnostics[0].roleId.toString()).toBe(mockRoleId);
    });
  });
});
