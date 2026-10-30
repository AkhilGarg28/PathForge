import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app.js';
import { User, Role, Diagnostic, DiagnosticResult, Roadmap } from '../models/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDbPath = path.resolve(__dirname, '.tmp-mongo');

let mongoServer;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';

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
      // ignore cleanup error on windows if files momentarily locked
    }
  }
});

beforeEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
});

describe('Backend Foundation Endpoints', () => {
  test('GET /api/health returns 200 and standard success shape', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toBe('Server is healthy');
    expect(res.body.data.status).toBe('ok');
    expect(typeof res.body.data.timestamp).toBe('string');
  });

  test('GET /api/nonexistent returns 404 in standard error shape', async () => {
    const res = await request(app).get('/api/nonexistent');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Route not found');
  });
});

describe('Mongoose Models Validation & Creation', () => {
  describe('User Model', () => {
    test('successfully creates a user and omits passwordHash and __v in toJSON', async () => {
      const user = await User.create({
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        passwordHash: '$2a$10$hashedpasswordstringforuser'
      });

      expect(user._id).toBeDefined();
      expect(user.email).toBe('jane.doe@example.com');

      const jsonUser = user.toJSON();
      expect(jsonUser.__v).toBeUndefined();
      expect(jsonUser.passwordHash).toBeUndefined();
      expect(jsonUser.name).toBe('Jane Doe');
    });

    test('fails on duplicate email with code 11000', async () => {
      await User.create({
        name: 'User One',
        email: 'duplicate@example.com',
        passwordHash: 'hash1'
      });

      // Ensure indexes are built in memory
      await User.init();

      await expect(
        User.create({
          name: 'User Two',
          email: 'duplicate@example.com',
          passwordHash: 'hash2'
        })
      ).rejects.toThrow();
    });

    test('fails on invalid email format', async () => {
      await expect(
        User.create({
          name: 'Invalid Email',
          email: 'not-an-email',
          passwordHash: 'hash1'
        })
      ).rejects.toThrow(/valid email address/);
    });
  });

  describe('Role Model', () => {
    test('successfully creates a role and strips __v in toJSON', async () => {
      const role = await Role.create({
        name: 'MERN Developer',
        slug: 'mern-developer',
        description: 'Full-stack MERN engineering',
        dimensions: [
          { id: 'javascript', name: 'JavaScript' },
          { id: 'react', name: 'React' }
        ]
      });

      expect(role._id).toBeDefined();
      expect(role.slug).toBe('mern-developer');

      const jsonRole = role.toJSON();
      expect(jsonRole.__v).toBeUndefined();
      expect(jsonRole.dimensions.length).toBe(2);
    });

    test('fails if dimensions array is empty', async () => {
      await expect(
        Role.create({
          name: 'Empty Role',
          slug: 'empty-role',
          description: 'No dimensions',
          dimensions: []
        })
      ).rejects.toThrow(/must include at least one dimension/);
    });
  });

  describe('Diagnostic & DiagnosticResult Models', () => {
    test('successfully creates a Diagnostic document', async () => {
      const diagnostic = await Diagnostic.create({
        roleId: 'mern-developer',
        questions: [
          {
            id: 'q-01',
            dimension: 'javascript',
            question: 'What is const?',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctIndex: 1
          }
        ]
      });

      expect(diagnostic._id).toBeDefined();
      expect(diagnostic.questions[0].options.length).toBe(4);

      const jsonDiag = diagnostic.toJSON();
      expect(jsonDiag.__v).toBeUndefined();
    });

    test('fails validation when question options length is not 4', async () => {
      await expect(
        Diagnostic.create({
          roleId: 'mern-developer',
          questions: [
            {
              id: 'q-bad-options',
              dimension: 'javascript',
              question: 'Bad options count?',
              options: ['Option A', 'Option B', 'Option C'], // Only 3 options
              correctIndex: 0
            }
          ]
        })
      ).rejects.toThrow(/exactly 4 options/);
    });

    test('fails validation when correctIndex is out of bounds', async () => {
      await expect(
        Diagnostic.create({
          roleId: 'mern-developer',
          questions: [
            {
              id: 'q-bad-index',
              dimension: 'javascript',
              question: 'Bad index?',
              options: ['A', 'B', 'C', 'D'],
              correctIndex: 4 // Out of 0-3 range
            }
          ]
        })
      ).rejects.toThrow();
    });

    test('successfully creates a DiagnosticResult', async () => {
      const testUser = await User.create({
        name: 'Diag User',
        email: 'diag.user@example.com',
        passwordHash: 'hash'
      });

      const result = await DiagnosticResult.create({
        userId: testUser._id,
        roleId: 'mern-developer',
        answers: [{ questionId: 'q-01', selectedIndex: 1 }],
        dimensionScores: { javascript: 4.0, react: 3.0 }
      });

      expect(result._id).toBeDefined();
      expect(result.userId.toString()).toBe(testUser._id.toString());
      expect(result.toJSON().__v).toBeUndefined();
    });
  });

  describe('Roadmap Model', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await User.create({
        name: 'Roadmap User',
        email: 'roadmap.user@example.com',
        passwordHash: 'hash'
      });
    });

    test('successfully creates a Roadmap and omits __v in toJSON', async () => {
      const roadmap = await Roadmap.create({
        userId: testUser._id,
        roleId: 'mern-developer',
        dimensionScores: { javascript: 4.0 },
        modules: [
          {
            moduleId: 'mern-mod-1',
            title: 'JS Basics',
            description: 'Learn modern JS',
            resourceTags: ['javascript'],
            resources: [
              {
                title: 'MDN',
                url: 'https://developer.mozilla.org',
                type: 'docs'
              }
            ],
            estimatedHours: 10,
            status: 'active',
            checkpointScore: null
          }
        ],
        readinessScore: 32,
        generatedBy: 'fallback'
      });

      expect(roadmap._id).toBeDefined();
      expect(roadmap.modules[0].status).toBe('active');

      const jsonRoadmap = roadmap.toJSON();
      expect(jsonRoadmap.__v).toBeUndefined();
    });

    test('fails validation when module status is invalid enum', async () => {
      await expect(
        Roadmap.create({
          userId: testUser._id,
          roleId: 'mern-developer',
          dimensionScores: { javascript: 3.0 },
          modules: [
            {
              moduleId: 'mern-mod-1',
              title: 'JS Basics',
              description: 'Learn JS',
              estimatedHours: 5,
              status: 'invalid-status', // Bad status
              checkpointScore: null
            }
          ],
          generatedBy: 'fallback'
        })
      ).rejects.toThrow(/is not a valid module status/);
    });

    test('fails validation when generatedBy is invalid enum', async () => {
      await expect(
        Roadmap.create({
          userId: testUser._id,
          roleId: 'mern-developer',
          dimensionScores: { javascript: 3.0 },
          modules: [
            {
              moduleId: 'mern-mod-1',
              title: 'JS Basics',
              description: 'Learn JS',
              estimatedHours: 5,
              status: 'locked'
            }
          ],
          generatedBy: 'human' // Invalid enum
        })
      ).rejects.toThrow(/is not a valid generatedBy option/);
    });
  });
});
