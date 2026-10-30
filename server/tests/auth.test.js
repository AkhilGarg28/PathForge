const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const app = require('../app');
const User = require('../models/User');
const env = require('../config/env');

describe('Auth Endpoints (/api/auth)', () => {
  const mockUsers = [];

  beforeEach(() => {
    mockUsers.length = 0;

    jest.spyOn(User, 'findOne').mockImplementation(({ email }) => {
      const user = mockUsers.find((u) => u.email === email);
      return Promise.resolve(user || null);
    });

    jest.spyOn(User, 'create').mockImplementation((data) => {
      const newUser = {
        _id: '507f1f77bcf86cd799439011',
        ...data,
      };
      mockUsers.push(newUser);
      return Promise.resolve(newUser);
    });

    jest.spyOn(User, 'findById').mockImplementation((id) => {
      const user = mockUsers.find((u) => u._id.toString() === id.toString());
      return {
        select: jest.fn().mockImplementation((fields) => {
          if (!user) return Promise.resolve(null);
          const copy = { ...user };
          if (fields && fields.includes('-passwordHash')) {
            delete copy.passwordHash;
          }
          return Promise.resolve(copy);
        }),
      };
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('POST /api/auth/signup', () => {
    it('should successfully sign up a new user and set an httpOnly cookie', async () => {
      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Alice Developer',
          email: 'alice@example.com',
          password: 'Password123',
          targetRole: 'Full Stack Engineer',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toMatchObject({
        name: 'Alice Developer',
        email: 'alice@example.com',
        targetRole: 'Full Stack Engineer',
      });
      expect(res.body.user).toHaveProperty('id');

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/token=/);
      expect(cookies[0]).toMatch(/HttpOnly/i);
    });

    it('should reject duplicate email with 409', async () => {
      const hashedPassword = await bcrypt.hash('Password123', 12);
      mockUsers.push({
        _id: '507f1f77bcf86cd799439011',
        name: 'Alice Developer',
        email: 'alice@example.com',
        passwordHash: hashedPassword,
        targetRole: 'Full Stack Engineer',
      });

      const res = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Another Alice',
          email: 'alice@example.com',
          password: 'Password123',
        });

      expect(res.statusCode).toBe(409);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('should reject weak password with 400', async () => {
      // password under 8 characters
      const shortRes = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Bob Developer',
          email: 'bob@example.com',
          password: 'pass1',
        });
      expect(shortRes.statusCode).toBe(400);

      // password missing numbers
      const noNumberRes = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Bob Developer',
          email: 'bob@example.com',
          password: 'onlyletters',
        });
      expect(noNumberRes.statusCode).toBe(400);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('Secret123', 12);
      mockUsers.push({
        _id: '507f1f77bcf86cd799439011',
        name: 'Charlie Dev',
        email: 'charlie@example.com',
        passwordHash: hashedPassword,
        targetRole: 'DevOps Specialist',
      });
    });

    it('should login successfully with valid credentials and return cookie', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'charlie@example.com',
          password: 'Secret123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.user).toMatchObject({
        name: 'Charlie Dev',
        email: 'charlie@example.com',
        targetRole: 'DevOps Specialist',
      });

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/token=/);
      expect(cookies[0]).toMatch(/HttpOnly/i);
    });

    it('should return 401 with generic "Invalid credentials" message on wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'charlie@example.com',
          password: 'WrongPassword99',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });

    it('should return 401 with generic "Invalid credentials" message if email does not exist', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'Secret123',
        });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    const userId = '507f1f77bcf86cd799439011';

    beforeEach(async () => {
      const hashedPassword = await bcrypt.hash('Secret123', 12);
      mockUsers.push({
        _id: userId,
        name: 'Dana Engineer',
        email: 'dana@example.com',
        passwordHash: hashedPassword,
        targetRole: 'Frontend Architect',
      });
    });

    it('should return 401 when called without cookie', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });

    it('should return 401 when called with tampered token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', ['token=tampered.invalid.token']);

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/invalid or expired token/i);
    });

    it('should return user profile when authenticated with valid cookie', async () => {
      const validToken = jwt.sign({ id: userId }, env.JWT_SECRET, {
        expiresIn: '7d',
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', [`token=${validToken}`]);

      expect(res.statusCode).toBe(200);
      expect(res.body.user).toMatchObject({
        name: 'Dana Engineer',
        email: 'dana@example.com',
        targetRole: 'Frontend Architect',
      });
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear the token cookie and return success message', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/logged out successfully/i);

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      // Clearing cookie sets it with empty value or expires in the past
      expect(cookies[0]).toMatch(/token=;/);
    });
  });
});
