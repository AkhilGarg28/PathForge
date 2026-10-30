import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import jwt from 'jsonwebtoken';
import app from '../app.js';
import { User, Role, Roadmap } from '../models/index.js';
import cache from '../utils/cache.js';

describe('Backend Regression & Edge Cases Test Suite', () => {
  let mongoServer;
  let testUser;
  let userToken;

  beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create({
      binary: {
        version: '4.4.29'
      }
    });
    const uri = mongoServer.getUri();
    await mongoose.connect(uri);

    testUser = await User.create({
      name: 'Regression Tester',
      email: 'regression@example.com',
      passwordHash: 'hashed_password_placeholder'
    });

    userToken = jwt.sign(
      { id: testUser._id.toString() },
      process.env.JWT_SECRET || 'super_secret_test_key_minimum_32_characters_long_for_security',
      { expiresIn: '1h' }
    );
  }, 60000);

  afterAll(async () => {
    await mongoose.disconnect();
    if (mongoServer) {
      await mongoServer.stop();
    }
  });

  beforeEach(() => {
    cache.clear();
  });

  // 1. Expired Token Regression
  test('returns 401 when an expired JWT token is provided', async () => {
    const expiredToken = jwt.sign(
      { id: testUser._id.toString() },
      process.env.JWT_SECRET || 'super_secret_test_key_minimum_32_characters_long_for_security',
      { expiresIn: '-10s' } // Expired 10 seconds ago
    );

    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', [`token=${expiredToken}`]);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/expired/i);
  });

  // 2. Deleted-User Token Regression
  test('returns 401 when token has valid signature but user was deleted from database', async () => {
    const nonExistentUserId = new mongoose.Types.ObjectId().toString();
    const orphanToken = jwt.sign(
      { id: nonExistentUserId },
      process.env.JWT_SECRET || 'super_secret_test_key_minimum_32_characters_long_for_security',
      { expiresIn: '1h' }
    );

    const res = await request(app)
      .get('/api/auth/me')
      .set('Cookie', [`token=${orphanToken}`]);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/no longer exists/i);
  });

  // 3. Special Characters and Unicode in Display Name
  test('handles special characters and Unicode in user profile name without error', async () => {
    const specialName = "O'Connor <Developer> 🚀 & Co.";

    const res = await request(app)
      .patch('/api/user/profile')
      .set('Cookie', [`token=${userToken}`])
      .send({ name: specialName });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.name).toBe(specialName);

    // Verify stored name matches
    const updated = await User.findById(testUser._id);
    expect(updated.name).toBe(specialName);
  });

  // 4. Very Long Text Boundary Validation
  test('rejects profile update with name exceeding 50 characters with 400 Bad Request', async () => {
    const excessivelyLongName = 'A'.repeat(51);

    const res = await request(app)
      .patch('/api/user/profile')
      .set('Cookie', [`token=${userToken}`])
      .send({ name: excessivelyLongName });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.errors[0].message).toContain('cannot exceed 50 characters');
  });

  // 5. Payload Too Large Body Limit (DoS Defense)
  test('rejects request body exceeding 10kb limit with 413 Payload Too Large', async () => {
    const largePayload = {
      name: 'Tester',
      padding: 'x'.repeat(12 * 1024) // 12kb payload
    };

    const res = await request(app)
      .patch('/api/user/profile')
      .set('Cookie', [`token=${userToken}`])
      .send(largePayload);

    expect(res.status).toBe(413);
  });

  // 6. Concurrent Module Completion
  test('prevents double completion when concurrent module-complete requests occur', async () => {
    // Setup a dummy roadmap with two modules
    await Roadmap.deleteMany({ userId: testUser._id });
    await Roadmap.create({
      userId: testUser._id,
      roleId: 'mern-developer',
      dimensionScores: { javascript: 3, react: 4 },
      readinessScore: 20,
      generatedBy: 'fallback',
      modules: [
        {
          moduleId: 'mod-concurrent-1',
          title: 'Module 1',
          description: 'Desc 1',
          resourceTags: ['tag1'],
          resources: [{ title: 'Res', url: 'https://example.com', type: 'article' }],
          estimatedHours: 5,
          status: 'active'
        },
        {
          moduleId: 'mod-concurrent-2',
          title: 'Module 2',
          description: 'Desc 2',
          resourceTags: ['tag2'],
          resources: [{ title: 'Res', url: 'https://example.com', type: 'article' }],
          estimatedHours: 5,
          status: 'locked'
        }
      ]
    });

    // Execute first completion request
    const res1 = await request(app)
      .patch('/api/roadmap/module/mod-concurrent-1/complete')
      .set('Cookie', [`token=${userToken}`]);

    expect(res1.status).toBe(200);
    expect(res1.body.success).toBe(true);
    expect(res1.body.data.completedModuleId).toBe('mod-concurrent-1');

    // Immediate second attempt on already completed module should fail with 400
    const res2 = await request(app)
      .patch('/api/roadmap/module/mod-concurrent-1/complete')
      .set('Cookie', [`token=${userToken}`]);

    expect(res2.status).toBe(400);
    expect(res2.body.success).toBe(false);
    expect(res2.body.message).toMatch(/already completed/i);
  });

  // 7. In-Memory Cache Optimization and Invalidation
  test('serves cached roles on repeat requests and invalidates cache on clear', async () => {
    await Role.deleteMany({});
    await Role.create({
      name: 'DevOps Engineer',
      slug: 'devops-engineer',
      description: 'Infrastructure automation and CI/CD pipelines',
      dimensions: [{ id: 'cloud', name: 'Cloud' }]
    });

    // First request populates cache
    const res1 = await request(app)
      .get('/api/roles')
      .set('Cookie', [`token=${userToken}`]);
    expect(res1.status).toBe(200);
    expect(cache.getRoles()).not.toBeNull();
    expect(cache.getRoles().length).toBe(1);

    // Modify database directly without touching cache
    await Role.create({
      name: 'Security Engineer',
      slug: 'security-engineer',
      description: 'AppSec and compliance',
      dimensions: [{ id: 'security', name: 'Security' }]
    });

    // Second request should still hit cache
    const res2 = await request(app)
      .get('/api/roles')
      .set('Cookie', [`token=${userToken}`]);
    expect(res2.body.data.roles.length).toBe(1); // Cached length

    // Invalidate cache
    cache.clear();
    expect(cache.getRoles()).toBeNull();

    // Third request refreshes cache from database
    const res3 = await request(app)
      .get('/api/roles')
      .set('Cookie', [`token=${userToken}`]);
    expect(res3.body.data.roles.length).toBe(2);
  });
});
