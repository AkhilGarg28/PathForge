import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app.js';
import { User, Diagnostic, Roadmap } from '../models/index.js';
import { seedDatabase } from '../scripts/seed.js';
import { COOKIE_NAME } from '../utils/jwt.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDbPath = path.resolve(__dirname, '.tmp-mongo-diagnostic');

let mongoServer;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_jwt_secret_for_diagnostic_tests_12345';

  if (!fs.existsSync(tempDbPath)) {
    fs.mkdirSync(tempDbPath, { recursive: true });
  }

  mongoServer = await MongoMemoryServer.create({
    binary: {
      version: '4.4.29'
    },
    instance: {
      dbPath: tempDbPath
    }
  });
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
}, 60000);

afterAll(async () => {
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
  if (fs.existsSync(tempDbPath)) {
    try {
      fs.rmSync(tempDbPath, { recursive: true, force: true });
    } catch {
      // ignore
    }
  }
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

afterEach(async () => {
  delete process.env.FORCE_LLM_FAILURE;
});

describe('Diagnostic API Endpoints', () => {
  let authCookie;
  let testUser;
  let mernRole;
  let diagnosticQuestions;

  beforeEach(async () => {
    // 1. Seed database with roles and diagnostics
    const seedResult = await seedDatabase();
    mernRole = seedResult.roles.find((r) => r.slug === 'mern-developer');

    // 2. Register user
    const signupRes = await request(app).post('/api/auth/signup').send({
      name: 'Diagnostic Candidate',
      email: 'candidate@example.com',
      password: 'SecurePassword123!'
    });

    const cookies = signupRes.headers['set-cookie'];
    authCookie = cookies.find((c) => c.startsWith(`${COOKIE_NAME}=`));
    testUser = await User.findOne({ email: 'candidate@example.com' });

    // 3. Assign role to user
    await request(app)
      .post('/api/user/role')
      .set('Cookie', [authCookie])
      .send({ roleId: mernRole._id.toString() });

    // Retrieve full questions bank from DB for test answer generation
    const mernDiag = await Diagnostic.findOne({ roleId: 'mern-developer' });
    diagnosticQuestions = mernDiag.questions;
  });

  describe('GET /api/diagnostic/:roleId', () => {
    test('returns 401 when no auth token is provided', async () => {
      const res = await request(app).get('/api/diagnostic/mern-developer');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('No token provided');
    });

    test('returns 400 when requested roleId does not match user assigned role', async () => {
      const res = await request(app)
        .get('/api/diagnostic/data-analyst')
        .set('Cookie', [authCookie]);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("does not match user's assigned role");
    });

    test('successfully returns 12 diagnostic questions without leaking correctIndex or explanation', async () => {
      const res = await request(app)
        .get('/api/diagnostic/mern-developer')
        .set('Cookie', [authCookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.roleId).toBe('mern-developer');
      expect(res.body.data.roleTitle).toBe('MERN Developer');

      const questions = res.body.data.questions;
      expect(Array.isArray(questions)).toBe(true);
      expect(questions.length).toBe(12);

      // CRITICAL SECURITY ASSERTION: correctIndex and explanation must NEVER be leaked
      questions.forEach((q) => {
        expect(q.id).toBeDefined();
        expect(q.dimension).toBeDefined();
        expect(q.question).toBeDefined();
        expect(Array.isArray(q.options)).toBe(true);
        expect(q.options.length).toBe(4);

        expect(q.correctIndex).toBeUndefined();
        expect(q.explanation).toBeUndefined();
      });
    });
  });

  describe('POST /api/diagnostic/submit', () => {
    test('returns 401 when no auth token is provided', async () => {
      const res = await request(app)
        .post('/api/diagnostic/submit')
        .send({
          roleId: 'mern-developer',
          answers: [{ questionId: 'q-mern-js-01', selectedIndex: 1 }]
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('returns 400 when answers array is empty or missing', async () => {
      const res = await request(app)
        .post('/api/diagnostic/submit')
        .set('Cookie', [authCookie])
        .send({
          roleId: 'mern-developer',
          answers: []
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
    });

    test('returns 400 on invalid selectedIndex (out of bounds)', async () => {
      const res = await request(app)
        .post('/api/diagnostic/submit')
        .set('Cookie', [authCookie])
        .send({
          roleId: 'mern-developer',
          answers: [{ questionId: 'q-mern-js-01', selectedIndex: 99 }]
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('returns 400 on unknown questionId', async () => {
      const res = await request(app)
        .post('/api/diagnostic/submit')
        .set('Cookie', [authCookie])
        .send({
          roleId: 'mern-developer',
          answers: [{ questionId: 'non-existent-question-id', selectedIndex: 1 }]
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Unknown question ID');
    });

    test('returns 400 on duplicate questionId in answers', async () => {
      const firstQId = diagnosticQuestions[0].id;
      const res = await request(app)
        .post('/api/diagnostic/submit')
        .set('Cookie', [authCookie])
        .send({
          roleId: 'mern-developer',
          answers: [
            { questionId: firstQId, selectedIndex: 0 },
            { questionId: firstQId, selectedIndex: 1 }
          ]
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Duplicate answer for question ID');
    });

    test('returns 400 when submitted roleId does not match user assigned role', async () => {
      const res = await request(app)
        .post('/api/diagnostic/submit')
        .set('Cookie', [authCookie])
        .send({
          roleId: 'data-analyst',
          answers: [{ questionId: 'q-mern-js-01', selectedIndex: 1 }]
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("does not match user's assigned role");
    });

    test('successfully submits answers, scores, stores result, and returns roadmap', async () => {
      // Build 12 correct answers
      const answers = diagnosticQuestions.map((q) => ({
        questionId: q.id,
        selectedIndex: q.correctIndex
      }));

      const res = await request(app)
        .post('/api/diagnostic/submit')
        .set('Cookie', [authCookie])
        .send({
          roleId: 'mern-developer',
          answers
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('Diagnostic submitted');

      const data = res.body.data;
      expect(data.roleId).toBe('mern-developer');
      expect(data.dimensionScores.javascript).toBe(5.0);
      expect(data.avgDimensionScore).toBe(5.0);
      expect(data.readinessScore).toBe(40); // 0.4 * (5.0 / 5 * 100) = 40%

      expect(data.roadmap).toBeDefined();
      expect(data.roadmap.userId).toBe(testUser._id.toString());
      expect(data.roadmap.generatedBy).toBe('fallback');
      expect(Array.isArray(data.roadmap.modules)).toBe(true);
      expect(data.roadmap.modules.length).toBeGreaterThan(0);

      // Verify module statuses: first active, rest locked
      expect(data.roadmap.modules[0].status).toBe('active');
      for (let i = 1; i < data.roadmap.modules.length; i++) {
        expect(data.roadmap.modules[i].status).toBe('locked');
      }

      // Verify roadmap document in MongoDB
      const dbRoadmap = await Roadmap.findOne({ userId: testUser._id });
      expect(dbRoadmap).toBeDefined();
      expect(dbRoadmap.readinessScore).toBe(40);
    });

    test('resubmitting diagnostic replaces the existing roadmap rather than creating a duplicate', async () => {
      // 1. First submission (all correct -> 40% readiness)
      const perfectAnswers = diagnosticQuestions.map((q) => ({
        questionId: q.id,
        selectedIndex: q.correctIndex
      }));

      await request(app).post('/api/diagnostic/submit').set('Cookie', [authCookie]).send({
        roleId: 'mern-developer',
        answers: perfectAnswers
      });

      const countAfterFirst = await Roadmap.countDocuments({ userId: testUser._id });
      expect(countAfterFirst).toBe(1);

      // 2. Second submission (all wrong -> 0% readiness)
      const wrongAnswers = diagnosticQuestions.map((q) => ({
        questionId: q.id,
        selectedIndex: (q.correctIndex + 1) % 4
      }));

      const secondRes = await request(app)
        .post('/api/diagnostic/submit')
        .set('Cookie', [authCookie])
        .send({
          roleId: 'mern-developer',
          answers: wrongAnswers
        });

      expect(secondRes.status).toBe(200);
      expect(secondRes.body.data.readinessScore).toBe(0);
      expect(secondRes.body.data.avgDimensionScore).toBe(0.0);

      // Check roadmap count in database: must strictly remain 1!
      const countAfterSecond = await Roadmap.countDocuments({ userId: testUser._id });
      expect(countAfterSecond).toBe(1);

      const updatedRoadmap = await Roadmap.findOne({ userId: testUser._id });
      expect(updatedRoadmap.readinessScore).toBe(0);
    });

    test('returns 200 with a valid fallback roadmap under FORCE_LLM_FAILURE=true', async () => {
      process.env.FORCE_LLM_FAILURE = 'true';

      const answers = diagnosticQuestions.map((q) => ({
        questionId: q.id,
        selectedIndex: q.correctIndex
      }));

      const res = await request(app)
        .post('/api/diagnostic/submit')
        .set('Cookie', [authCookie])
        .send({
          roleId: 'mern-developer',
          answers
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.roadmap).toBeDefined();
      expect(res.body.data.roadmap.generatedBy).toBe('fallback');
      expect(res.body.data.roadmap.modules).toHaveLength(6);
      expect(res.body.data.roadmap.modules[0].status).toBe('active');
    });
  });
});
