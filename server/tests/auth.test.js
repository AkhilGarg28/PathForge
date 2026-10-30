import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app.js';
import User from '../models/User.js';
import { COOKIE_NAME } from '../utils/jwt.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDbPath = path.resolve(__dirname, '.tmp-mongo-auth');

let mongoServer;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_jwt_secret_for_auth_tests_12345';

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
  await User.deleteMany({});
});

describe('Authentication API Endpoints', () => {
  const validSignupData = {
    name: 'Sarah Connor',
    email: 'sarah.connor@example.com',
    password: 'Cyberdyne2026!'
  };

  describe('POST /api/auth/signup', () => {
    test('successfully registers a user, returns 201, sets httpOnly cookie, and omits passwordHash', async () => {
      const res = await request(app).post('/api/auth/signup').send(validSignupData);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Account created successfully');
      expect(res.body.data.user.id).toBeDefined();
      expect(res.body.data.user.name).toBe('Sarah Connor');
      expect(res.body.data.user.email).toBe('sarah.connor@example.com');
      expect(res.body.data.user.roleId).toBeNull();
      expect(res.body.data.user.passwordHash).toBeUndefined();

      // Check cookie header
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const tokenCookie = cookies.find((c) => c.startsWith(`${COOKIE_NAME}=`));
      expect(tokenCookie).toBeDefined();
      expect(tokenCookie).toContain('HttpOnly');
    });

    test('returns 409 Conflict when attempting to register with an existing email', async () => {
      // First registration
      await request(app).post('/api/auth/signup').send(validSignupData);

      // Duplicate registration (with mixed case email to verify normalization)
      const res = await request(app).post('/api/auth/signup').send({
        name: 'Another User',
        email: 'SARAH.CONNOR@EXAMPLE.COM',
        password: 'Password123!'
      });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });

    test('returns 400 Bad Request when password has fewer than 8 characters', async () => {
      const res = await request(app).post('/api/auth/signup').send({
        name: 'Short Pass',
        email: 'short@example.com',
        password: 'Pass1'
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Validation failed');
      const passwordError = res.body.errors.find((e) => e.field === 'password');
      expect(passwordError).toBeDefined();
      expect(passwordError.message).toContain('at least 8 characters');
    });

    test('returns 400 Bad Request when password lacks numbers', async () => {
      const res = await request(app).post('/api/auth/signup').send({
        name: 'Letters Only',
        email: 'letters@example.com',
        password: 'PasswordOnly'
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      const passwordError = res.body.errors.find((e) => e.field === 'password');
      expect(passwordError.message).toContain('at least one number');
    });

    test('returns 400 Bad Request when password lacks letters', async () => {
      const res = await request(app).post('/api/auth/signup').send({
        name: 'Numbers Only',
        email: 'numbers@example.com',
        password: '123456789'
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      const passwordError = res.body.errors.find((e) => e.field === 'password');
      expect(passwordError.message).toContain('at least one letter');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/signup').send(validSignupData);
    });

    test('successfully authenticates with correct credentials, sets cookie, and returns user', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'sarah.connor@example.com',
        password: 'Cyberdyne2026!'
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Logged in successfully');
      expect(res.body.data.user.email).toBe('sarah.connor@example.com');
      expect(res.body.data.user.passwordHash).toBeUndefined();

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies.some((c) => c.startsWith(`${COOKIE_NAME}=`))).toBe(true);
    });

    test('returns generic 401 when password is wrong', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'sarah.connor@example.com',
        password: 'IncorrectPassword123'
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid email or password');
    });

    test('returns same generic 401 when email is unknown to prevent enumeration', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'nonexistent.user@example.com',
        password: 'Cyberdyne2026!'
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Invalid email or password');
    });
  });

  describe('GET /api/auth/me', () => {
    let authCookie;

    beforeEach(async () => {
      const signupRes = await request(app).post('/api/auth/signup').send(validSignupData);
      const cookies = signupRes.headers['set-cookie'];
      authCookie = cookies.find((c) => c.startsWith(`${COOKIE_NAME}=`));
    });

    test('returns 200 with user profile when valid httpOnly cookie is provided', async () => {
      const res = await request(app).get('/api/auth/me').set('Cookie', [authCookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('sarah.connor@example.com');
      expect(res.body.data.user.name).toBe('Sarah Connor');
      expect(res.body.data.user.passwordHash).toBeUndefined();
    });

    test('returns 401 when cookie is missing', async () => {
      const res = await request(app).get('/api/auth/me');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('No token provided');
    });

    test('returns 401 when token is tampered with', async () => {
      const tamperedCookie = `${COOKIE_NAME}=this.is.a.tampered.token; Path=/; HttpOnly`;
      const res = await request(app).get('/api/auth/me').set('Cookie', [tamperedCookie]);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid authentication token');
    });

    test('returns 401 if user account was deleted from database', async () => {
      await User.deleteMany({}); // Delete user from DB

      const res = await request(app).get('/api/auth/me').set('Cookie', [authCookie]);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('no longer exists');
    });
  });

  describe('POST /api/auth/logout', () => {
    test('clears the authentication cookie and returns 200', async () => {
      const res = await request(app).post('/api/auth/logout');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Logged out successfully');

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      const clearedCookie = cookies.find((c) => c.startsWith(`${COOKIE_NAME}=`));
      expect(clearedCookie).toBeDefined();
      // Verify cookie expiration
      expect(
        clearedCookie.includes('Expires=Thu, 01 Jan 1970') || clearedCookie.includes('Max-Age=0')
      ).toBe(true);
    });
  });
});
