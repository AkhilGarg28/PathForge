import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app.js';
import { User, Roadmap, DiagnosticResult } from '../models/index.js';
import { seedDatabase } from '../scripts/seed.js';
import { COOKIE_NAME } from '../utils/jwt.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDbPath = path.resolve(__dirname, '.tmp-mongo-roadmap-account');

let mongoServer;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_jwt_secret_for_roadmap_account_tests';

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

describe('Roadmap & Account Management Endpoints', () => {
  let userACookie;
  let userA;
  let userBCookie;
  let mernRole;

  beforeEach(async () => {
    // 1. Seed database
    const seedResult = await seedDatabase();
    mernRole = seedResult.roles.find((r) => r.slug === 'mern-developer');

    // 2. Register User A
    const signupARes = await request(app).post('/api/auth/signup').send({
      name: 'User A',
      email: 'usera@example.com',
      password: 'Password123!'
    });
    userACookie = signupARes.headers['set-cookie'].find((c) => c.startsWith(`${COOKIE_NAME}=`));
    userA = await User.findOne({ email: 'usera@example.com' });

    // Assign role to User A
    await request(app)
      .post('/api/user/role')
      .set('Cookie', [userACookie])
      .send({ roleId: mernRole._id.toString() });

    // 3. Register User B
    const signupBRes = await request(app).post('/api/auth/signup').send({
      name: 'User B',
      email: 'userb@example.com',
      password: 'Password123!'
    });
    userBCookie = signupBRes.headers['set-cookie'].find((c) => c.startsWith(`${COOKIE_NAME}=`));

    // Assign role to User B
    await request(app)
      .post('/api/user/role')
      .set('Cookie', [userBCookie])
      .send({ roleId: mernRole._id.toString() });
  });

  describe('GET /api/roadmap', () => {
    test('returns 401 when unauthenticated', async () => {
      const res = await request(app).get('/api/roadmap');
      expect(res.status).toBe(401);
    });

    test('returns 404 when user has no roadmap generated yet', async () => {
      const res = await request(app).get('/api/roadmap').set('Cookie', [userACookie]);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('No roadmap found');
    });

    test('returns 200 with personal roadmap for req.user ONLY (tenant isolation)', async () => {
      // User A creates a roadmap
      await Roadmap.create({
        userId: userA._id,
        roleId: 'mern-developer',
        dimensionScores: { javascript: 3.0 },
        modules: [
          {
            moduleId: 'mod-1',
            title: 'JS Basics',
            description: 'Learn JS',
            estimatedHours: 10,
            status: 'active'
          }
        ],
        readinessScore: 24,
        generatedBy: 'fallback'
      });

      // User A fetches their roadmap
      const resA = await request(app).get('/api/roadmap').set('Cookie', [userACookie]);

      expect(resA.status).toBe(200);
      expect(resA.body.data.roadmap.userId).toBe(userA._id.toString());

      // User B fetches their roadmap -> must be 404, User B cannot see User A's roadmap
      const resB = await request(app).get('/api/roadmap').set('Cookie', [userBCookie]);

      expect(resB.status).toBe(404);
      expect(resB.body.message).toContain('No roadmap found');
    });
  });

  describe('PATCH /api/roadmap/module/:moduleId/complete', () => {
    beforeEach(async () => {
      // Create a 3-module roadmap for User A
      await Roadmap.create({
        userId: userA._id,
        roleId: 'mern-developer',
        dimensionScores: { javascript: 4.0 }, // 80% diagnostic
        modules: [
          {
            moduleId: 'mod-1',
            title: 'Module 1',
            description: 'Desc 1',
            estimatedHours: 10,
            status: 'active'
          },
          {
            moduleId: 'mod-2',
            title: 'Module 2',
            description: 'Desc 2',
            estimatedHours: 10,
            status: 'locked'
          },
          {
            moduleId: 'mod-3',
            title: 'Module 3',
            description: 'Desc 3',
            estimatedHours: 10,
            status: 'locked'
          }
        ],
        readinessScore: 32, // 0.4 * 80 + 0 = 32%
        generatedBy: 'fallback'
      });
    });

    test('returns 401 when unauthenticated', async () => {
      const res = await request(app).patch('/api/roadmap/module/mod-1/complete');
      expect(res.status).toBe(401);
    });

    test('User B cannot complete User A modules (tenant isolation returns 404 for User B)', async () => {
      const res = await request(app)
        .patch('/api/roadmap/module/mod-1/complete')
        .set('Cookie', [userBCookie]);

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('No roadmap found for user');
    });

    test('returns 404 if module does not exist in roadmap', async () => {
      const res = await request(app)
        .patch('/api/roadmap/module/non-existent-module/complete')
        .set('Cookie', [userACookie]);

      expect(res.status).toBe(404);
      expect(res.body.message).toContain('Module not found');
    });

    test('returns 400 when attempting to complete a locked module', async () => {
      const res = await request(app)
        .patch('/api/roadmap/module/mod-2/complete')
        .set('Cookie', [userACookie]);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Module is locked');
    });

    test('successfully completes active module, unlocks next module, and updates readiness score', async () => {
      // Complete Module 1
      const res = await request(app)
        .patch('/api/roadmap/module/mod-1/complete')
        .set('Cookie', [userACookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.completedModuleId).toBe('mod-1');
      expect(res.body.data.nextActiveModuleId).toBe('mod-2');

      // 10 out of 30 hours completed = 33.33%
      // 0.4 * 80 + 0.6 * (10/30 * 100) = 32 + 20 = 52
      expect(res.body.data.readinessScore).toBe(52);

      const modules = res.body.data.roadmap.modules;
      expect(modules[0].status).toBe('complete');
      expect(modules[1].status).toBe('active');
      expect(modules[2].status).toBe('locked');
    });

    test('returns 400 when attempting to complete an already completed module', async () => {
      // Complete Module 1 first
      await request(app).patch('/api/roadmap/module/mod-1/complete').set('Cookie', [userACookie]);

      // Attempt to complete Module 1 again
      const res = await request(app)
        .patch('/api/roadmap/module/mod-1/complete')
        .set('Cookie', [userACookie]);

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('already completed');
    });

    test('completing the final module is valid and results in null nextActiveModuleId', async () => {
      // Complete mod-1
      await request(app).patch('/api/roadmap/module/mod-1/complete').set('Cookie', [userACookie]);
      // Complete mod-2
      await request(app).patch('/api/roadmap/module/mod-2/complete').set('Cookie', [userACookie]);
      // Complete mod-3 (final module)
      const res = await request(app)
        .patch('/api/roadmap/module/mod-3/complete')
        .set('Cookie', [userACookie]);

      expect(res.status).toBe(200);
      expect(res.body.data.completedModuleId).toBe('mod-3');
      expect(res.body.data.nextActiveModuleId).toBeNull();
      // 100% module completion -> 0.4 * 80 + 0.6 * 100 = 32 + 60 = 92
      expect(res.body.data.readinessScore).toBe(92);
      expect(res.body.data.roadmap.modules.every((m) => m.status === 'complete')).toBe(true);
    });
  });

  describe('User Profile & Password Management', () => {
    describe('PATCH /api/user/profile', () => {
      test('returns 401 when unauthenticated', async () => {
        const res = await request(app).patch('/api/user/profile').send({ name: 'New Name' });
        expect(res.status).toBe(401);
      });

      test('returns 400 on invalid name length (< 2 characters)', async () => {
        const res = await request(app)
          .patch('/api/user/profile')
          .set('Cookie', [userACookie])
          .send({ name: 'A' });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Validation failed');
      });

      test('successfully updates display name', async () => {
        const res = await request(app)
          .patch('/api/user/profile')
          .set('Cookie', [userACookie])
          .send({ name: 'Alexander Mercer' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.user.name).toBe('Alexander Mercer');

        const updated = await User.findById(userA._id);
        expect(updated.name).toBe('Alexander Mercer');
      });
    });

    describe('PATCH /api/user/password', () => {
      test('returns 401 when currentPassword is incorrect', async () => {
        const res = await request(app)
          .patch('/api/user/password')
          .set('Cookie', [userACookie])
          .send({
            currentPassword: 'WrongPassword123!',
            newPassword: 'NewSecurePassword456!'
          });

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Current password does not match');
      });

      test('returns 400 when newPassword is identical to currentPassword', async () => {
        const res = await request(app)
          .patch('/api/user/password')
          .set('Cookie', [userACookie])
          .send({
            currentPassword: 'Password123!',
            newPassword: 'Password123!'
          });

        expect(res.status).toBe(400);
        expect(res.body.message).toContain('identical');
      });

      test('returns 400 when newPassword is weak (< 8 characters or no numbers)', async () => {
        const res = await request(app)
          .patch('/api/user/password')
          .set('Cookie', [userACookie])
          .send({
            currentPassword: 'Password123!',
            newPassword: 'weak'
          });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe('Validation failed');
      });

      test('successfully updates password and enables login with new password', async () => {
        const res = await request(app)
          .patch('/api/user/password')
          .set('Cookie', [userACookie])
          .send({
            currentPassword: 'Password123!',
            newPassword: 'NewSecurePassword456!'
          });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe('Password updated successfully');

        // Test login with old password fails
        const oldLoginRes = await request(app).post('/api/auth/login').send({
          email: 'usera@example.com',
          password: 'Password123!'
        });
        expect(oldLoginRes.status).toBe(401);

        // Test login with new password succeeds
        const newLoginRes = await request(app).post('/api/auth/login').send({
          email: 'usera@example.com',
          password: 'NewSecurePassword456!'
        });
        expect(newLoginRes.status).toBe(200);
      });
    });

    describe('DELETE /api/user', () => {
      beforeEach(async () => {
        // Create associated Roadmap and DiagnosticResult for User A
        await Roadmap.create({
          userId: userA._id,
          roleId: 'mern-developer',
          dimensionScores: { javascript: 4.0 },
          modules: [
            {
              moduleId: 'm1',
              title: 'M1',
              description: 'D1',
              estimatedHours: 10,
              status: 'active'
            }
          ],
          readinessScore: 32,
          generatedBy: 'fallback'
        });

        await DiagnosticResult.create({
          userId: userA._id,
          roleId: 'mern-developer',
          answers: [{ questionId: 'q-1', selectedIndex: 0 }],
          dimensionScores: { javascript: 4.0 }
        });
      });

      test('returns 400 when password confirmation is missing', async () => {
        const res = await request(app).delete('/api/user').set('Cookie', [userACookie]).send({});

        expect(res.status).toBe(400);
      });

      test('returns 401 when password confirmation is incorrect', async () => {
        const res = await request(app)
          .delete('/api/user')
          .set('Cookie', [userACookie])
          .send({ password: 'WrongPassword123!' });

        expect(res.status).toBe(401);
        expect(res.body.message).toBe('Incorrect password');
      });

      test('successfully deletes user account, clears auth cookie, and cascades deletion to roadmaps & diagnostics', async () => {
        const res = await request(app)
          .delete('/api/user')
          .set('Cookie', [userACookie])
          .send({ password: 'Password123!' });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toContain('deleted successfully');

        // Verify cookie cleared
        const cookies = res.headers['set-cookie'];
        expect(cookies).toBeDefined();
        const clearedCookie = cookies.find((c) => c.startsWith(`${COOKIE_NAME}=`));
        expect(clearedCookie).toBeDefined();
        expect(
          clearedCookie.includes('Max-Age=0') || clearedCookie.includes('Expires=Thu, 01 Jan 1970')
        ).toBe(true);

        // Verify User A deleted from MongoDB
        const userInDb = await User.findById(userA._id);
        expect(userInDb).toBeNull();

        // Verify cascade deletion of User A's Roadmap
        const roadmapInDb = await Roadmap.findOne({ userId: userA._id });
        expect(roadmapInDb).toBeNull();

        // Verify cascade deletion of User A's DiagnosticResult
        const diagResultInDb = await DiagnosticResult.findOne({ userId: userA._id });
        expect(diagResultInDb).toBeNull();
      });
    });
  });
});
