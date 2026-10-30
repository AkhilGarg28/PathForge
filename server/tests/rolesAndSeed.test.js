import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app.js';
import { User, Role, Diagnostic } from '../models/index.js';
import { seedDatabase } from '../scripts/seed.js';
import { COOKIE_NAME } from '../utils/jwt.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDbPath = path.resolve(__dirname, '.tmp-mongo-roles');

let mongoServer;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_jwt_secret_for_roles_12345';

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

describe('Database Seeding & Roles Endpoints', () => {
  describe('seedDatabase Idempotency', () => {
    test('running seed twice produces exactly 2 roles and 2 diagnostics with no duplicate records', async () => {
      // First seed run
      const firstRun = await seedDatabase();
      expect(firstRun.roles.length).toBe(2);
      expect(firstRun.diagnostics.length).toBe(2);

      const rolesAfterFirst = await Role.countDocuments();
      const diagsAfterFirst = await Diagnostic.countDocuments();
      expect(rolesAfterFirst).toBe(2);
      expect(diagsAfterFirst).toBe(2);

      // Second seed run
      const secondRun = await seedDatabase();
      expect(secondRun.roles.length).toBe(2);
      expect(secondRun.diagnostics.length).toBe(2);

      const rolesAfterSecond = await Role.countDocuments();
      const diagsAfterSecond = await Diagnostic.countDocuments();
      expect(rolesAfterSecond).toBe(2);
      expect(diagsAfterSecond).toBe(2);
    });
  });

  describe('GET /api/roles', () => {
    let authCookie;

    beforeEach(async () => {
      await seedDatabase();

      // Create test user and obtain auth cookie
      const signupRes = await request(app).post('/api/auth/signup').send({
        name: 'Role Viewer',
        email: 'viewer@example.com',
        password: 'ValidPassword123!'
      });

      const cookies = signupRes.headers['set-cookie'];
      authCookie = cookies.find((c) => c.startsWith(`${COOKIE_NAME}=`));
    });

    test('returns 401 when no authentication token is provided', async () => {
      const res = await request(app).get('/api/roles');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('No token provided');
    });

    test('returns 200 with list of available roles when authenticated', async () => {
      const res = await request(app).get('/api/roles').set('Cookie', [authCookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.roles)).toBe(true);
      expect(res.body.data.roles.length).toBe(2);

      const slugs = res.body.data.roles.map((r) => r.slug);
      expect(slugs).toContain('mern-developer');
      expect(slugs).toContain('data-analyst');

      const mern = res.body.data.roles.find((r) => r.slug === 'mern-developer');
      expect(mern.dimensions.length).toBe(4);
    });
  });

  describe('POST /api/user/role', () => {
    let authCookie;
    let seededRoles;

    beforeEach(async () => {
      const seedResult = await seedDatabase();
      seededRoles = seedResult.roles;

      const signupRes = await request(app).post('/api/auth/signup').send({
        name: 'Role Selector',
        email: 'selector@example.com',
        password: 'ValidPassword123!'
      });

      const cookies = signupRes.headers['set-cookie'];
      authCookie = cookies.find((c) => c.startsWith(`${COOKIE_NAME}=`));
    });

    test('returns 401 when unauthenticated', async () => {
      const res = await request(app).post('/api/user/role').send({
        roleId: seededRoles[0]._id.toString()
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    test('returns 400 Bad Request when roleId is not a valid ObjectId format', async () => {
      const res = await request(app)
        .post('/api/user/role')
        .set('Cookie', [authCookie])
        .send({ roleId: 'invalid-non-objectid-slug' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid role ID format');
    });

    test('returns 404 Not Found when roleId is valid ObjectId but role does not exist', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .post('/api/user/role')
        .set('Cookie', [authCookie])
        .send({ roleId: nonExistentId });

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Role not found');
    });

    test('returns 200 and updates user roleId when role exists', async () => {
      const targetRole = seededRoles.find((r) => r.slug === 'mern-developer');

      const res = await request(app)
        .post('/api/user/role')
        .set('Cookie', [authCookie])
        .send({ roleId: targetRole._id.toString() });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Role selection updated');
      expect(res.body.data.user.roleId).toBe(targetRole._id.toString());

      // Verify persistence in database
      const updatedUser = await User.findOne({ email: 'selector@example.com' });
      expect(updatedUser.roleId.toString()).toBe(targetRole._id.toString());
    });
  });
});
