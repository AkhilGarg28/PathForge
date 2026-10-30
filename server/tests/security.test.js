import express from 'express';
import request from 'supertest';
import app from '../app.js';
import { hasForbiddenMongoKey } from '../middleware/mongoSanitize.js';
import { createRateLimiter } from '../middleware/rateLimiter.js';
import { isJwtSecretStrong } from '../config/env.js';

describe('Security & Hardening Test Suite', () => {
  describe('NoSQL Injection Sanitization (Unit & Middleware)', () => {
    test('hasForbiddenMongoKey detects keys starting with $', () => {
      expect(hasForbiddenMongoKey({ $gt: '' })).toBe(true);
      expect(hasForbiddenMongoKey({ email: { $ne: null } })).toBe(true);
      expect(hasForbiddenMongoKey({ filter: { nested: { $regex: '.*' } } })).toBe(true);
    });

    test('hasForbiddenMongoKey detects keys containing dots', () => {
      expect(hasForbiddenMongoKey({ 'user.role': 'admin' })).toBe(true);
      expect(hasForbiddenMongoKey({ profile: { 'address.city': 'London' } })).toBe(true);
    });

    test('hasForbiddenMongoKey detects forbidden keys in arrays of objects', () => {
      expect(hasForbiddenMongoKey([{ valid: 1 }, { $where: 'sleep' }])).toBe(true);
      expect(hasForbiddenMongoKey([{ 'data.test': 1 }])).toBe(true);
    });

    test('hasForbiddenMongoKey allows safe keys even if values contain $ or dots', () => {
      expect(hasForbiddenMongoKey({ email: 'user.name@example.com' })).toBe(false);
      expect(hasForbiddenMongoKey({ price: '$100.50' })).toBe(false);
      expect(hasForbiddenMongoKey({ description: 'Cost is $50.00 for version 2.0.' })).toBe(false);
      expect(hasForbiddenMongoKey(null)).toBe(false);
      expect(hasForbiddenMongoKey(undefined)).toBe(false);
      expect(hasForbiddenMongoKey(123)).toBe(false);
    });

    test('rejects HTTP POST request with $ operator in body with 400 Bad Request', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: { $gt: '' },
          password: 'Password123!'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("parameter keys cannot contain '$' or '.'");
    });

    test('rejects HTTP POST request with dot in body key with 400 Bad Request', async () => {
      const res = await request(app).post('/api/auth/login').send({
        'user.email': 'test@example.com',
        password: 'Password123!'
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("parameter keys cannot contain '$' or '.'");
    });

    test('rejects HTTP GET request with query parameter key injection with 400 Bad Request', async () => {
      const res = await request(app).get('/api/health?filter[$gt]=1');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain("parameter keys cannot contain '$' or '.'");
    });

    test('allows legitimate requests with valid keys and dot/dollar values', async () => {
      const res = await request(app).get('/api/health?tag=version.1.0');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Rate Limiter Middleware', () => {
    test('enforces rate limits and returns 429 with standard error shape when exceeded', async () => {
      const testApp = express();
      const testLimiter = createRateLimiter({
        window: 60000,
        max: 2,
        message: 'Rate limit test exceeded',
        forceEnable: true
      });

      testApp.use(testLimiter);
      testApp.get('/test-limit', (req, res) => res.json({ success: true }));

      // Request 1: Allowed
      const res1 = await request(testApp).get('/test-limit');
      expect(res1.status).toBe(200);

      // Request 2: Allowed
      const res2 = await request(testApp).get('/test-limit');
      expect(res2.status).toBe(200);

      // Request 3: Rate limited
      const res3 = await request(testApp).get('/test-limit');
      expect(res3.status).toBe(429);
      expect(res3.body.success).toBe(false);
      expect(res3.body.message).toBe('Rate limit test exceeded');
    });
  });

  describe('JWT Secret Strength Validation', () => {
    test('rejects short secrets (< 32 characters)', () => {
      expect(isJwtSecretStrong('short_secret')).toBe(false);
      expect(isJwtSecretStrong('1234567890123456789012345678901')).toBe(false); // 31 chars
    });

    test('rejects known weak placeholders', () => {
      expect(isJwtSecretStrong('secret')).toBe(false);
      expect(isJwtSecretStrong('password')).toBe(false);
      expect(isJwtSecretStrong('your_jwt_secret_key_here')).toBe(false);
      expect(isJwtSecretStrong('12345678901234567890123456789012')).toBe(false);
    });

    test('accepts strong secrets with >= 32 characters', () => {
      expect(
        isJwtSecretStrong('pathforge_jwt_production_secret_key_entropy_high_2026_secure!')
      ).toBe(true);
    });
  });

  describe('Information Leak Prevention', () => {
    test('never exposes stack trace in 404 or error responses', async () => {
      const res = await request(app).get('/api/non-existent-route');
      expect(res.status).toBe(404);
      expect(res.body.stack).toBeUndefined();
      expect(res.body.success).toBe(false);
    });

    test('never exposes stack trace on validation errors', async () => {
      const res = await request(app).post('/api/auth/signup').send({
        name: 'A',
        email: 'invalid-email',
        password: '123'
      });
      expect(res.status).toBe(400);
      expect(res.body.stack).toBeUndefined();
    });
  });

  describe('Route Authentication Enforcement (401 for unauthenticated access)', () => {
    const protectedRoutes = [
      { method: 'get', path: '/api/roles' },
      { method: 'post', path: '/api/user/role', body: { roleId: '64b0f9f1e1a2b3c4d5e6f7a8' } },
      { method: 'get', path: '/api/diagnostic/mern-developer' },
      {
        method: 'post',
        path: '/api/diagnostic/submit',
        body: { roleId: 'mern-developer', answers: [] }
      },
      { method: 'get', path: '/api/roadmap' },
      { method: 'patch', path: '/api/roadmap/module/mod-1/complete' },
      { method: 'patch', path: '/api/user/profile', body: { name: 'New Name' } },
      {
        method: 'patch',
        path: '/api/user/password',
        body: { currentPassword: 'OldPassword123!', newPassword: 'NewPassword123!' }
      },
      { method: 'delete', path: '/api/user', body: { password: 'Password123!' } },
      { method: 'get', path: '/api/auth/me' }
    ];

    test.each(protectedRoutes)(
      '$method.toUpperCase() $path returns 401 without auth token',
      async ({ method, path, body }) => {
        const req = request(app)[method](path);
        if (body) {
          req.send(body);
        }
        const res = await req;
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toContain('Authentication required');
      }
    );
  });
});
