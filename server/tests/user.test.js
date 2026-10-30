const request = require('supertest');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Roadmap = require('../models/Roadmap');
const Diagnostic = require('../models/Diagnostic');
const env = require('../config/env');

describe('User Account & Profile Endpoints (/api/user)', () => {
  const mockUserId = '507f1f77bcf86cd799439011';
  const validToken = jwt.sign({ id: mockUserId }, env.JWT_SECRET, {
    expiresIn: '7d',
  });

  let mockUser;
  let deletedRoadmaps = false;
  let deletedDiagnostics = false;
  let deletedUser = false;

  beforeEach(async () => {
    deletedRoadmaps = false;
    deletedDiagnostics = false;
    deletedUser = false;

    const hashedPassword = await bcrypt.hash('OldPassword123', 12);
    mockUser = {
      _id: new mongoose.Types.ObjectId(mockUserId),
      name: 'Initial Name',
      email: 'user@example.com',
      passwordHash: hashedPassword,
      targetRole: 'MERN Developer',
      save: function () {
        return Promise.resolve(this);
      },
    };

    // Mock User.findById to support both .select() (in authMiddleware) and direct await (in userController)
    jest.spyOn(User, 'findById').mockImplementation((id) => {
      const isMatch = id && id.toString() === mockUserId && !deletedUser;
      return {
        select: jest.fn().mockImplementation((fields) => {
          if (!isMatch) return Promise.resolve(null);
          const copy = { ...mockUser };
          if (fields && fields.includes('-passwordHash')) {
            delete copy.passwordHash;
          }
          return Promise.resolve(copy);
        }),
        then: function (resolve, reject) {
          return Promise.resolve(isMatch ? mockUser : null).then(resolve, reject);
        },
      };
    });

    // Mock User.findByIdAndDelete
    jest.spyOn(User, 'findByIdAndDelete').mockImplementation((id) => {
      if (id.toString() === mockUserId) {
        deletedUser = true;
        return Promise.resolve(mockUser);
      }
      return Promise.resolve(null);
    });

    // Mock Roadmap.deleteMany
    jest.spyOn(Roadmap, 'deleteMany').mockImplementation((filter) => {
      if (filter.userId && filter.userId.toString() === mockUserId) {
        deletedRoadmaps = true;
        return Promise.resolve({ deletedCount: 1 });
      }
      return Promise.resolve({ deletedCount: 0 });
    });

    // Mock Diagnostic.deleteMany
    jest.spyOn(Diagnostic, 'deleteMany').mockImplementation((filter) => {
      if (filter.userId && filter.userId.toString() === mockUserId) {
        deletedDiagnostics = true;
        return Promise.resolve({ deletedCount: 2 });
      }
      return Promise.resolve({ deletedCount: 0 });
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('PATCH /api/user/profile', () => {
    it('should return 401 when called without token', async () => {
      const res = await request(app)
        .patch('/api/user/profile')
        .send({ name: 'New Name' });

      expect(res.statusCode).toBe(401);
    });

    it('should reject invalid or short names with 400', async () => {
      const res = await request(app)
        .patch('/api/user/profile')
        .set('Cookie', [`token=${validToken}`])
        .send({ name: 'A' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/at least 2 characters/i);
    });

    it('should update name successfully and return updated user', async () => {
      const res = await request(app)
        .patch('/api/user/profile')
        .set('Cookie', [`token=${validToken}`])
        .send({ name: 'Updated Full Name' });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user.name).toBe('Updated Full Name');
      expect(res.body.user.email).toBe('user@example.com');
    });
  });

  describe('PATCH /api/user/password', () => {
    it('should return 401 when unauthenticated', async () => {
      const res = await request(app).patch('/api/user/password').send({
        currentPassword: 'OldPassword123',
        newPassword: 'NewSecurePassword123',
      });

      expect(res.statusCode).toBe(401);
    });

    it('should reject when current password is incorrect (400)', async () => {
      const res = await request(app)
        .patch('/api/user/password')
        .set('Cookie', [`token=${validToken}`])
        .send({
          currentPassword: 'WrongPassword99',
          newPassword: 'NewSecurePassword123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/current password is incorrect/i);
    });

    it('should reject weak new passwords with 400', async () => {
      // password missing numbers
      const res1 = await request(app)
        .patch('/api/user/password')
        .set('Cookie', [`token=${validToken}`])
        .send({
          currentPassword: 'OldPassword123',
          newPassword: 'lettersOnly',
        });
      expect(res1.statusCode).toBe(400);

      // password too short
      const res2 = await request(app)
        .patch('/api/user/password')
        .set('Cookie', [`token=${validToken}`])
        .send({
          currentPassword: 'OldPassword123',
          newPassword: 'p1',
        });
      expect(res2.statusCode).toBe(400);
    });

    it('should update password and re-hash successfully with valid credentials', async () => {
      const res = await request(app)
        .patch('/api/user/password')
        .set('Cookie', [`token=${validToken}`])
        .send({
          currentPassword: 'OldPassword123',
          newPassword: 'BrandNewPassword456',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/password updated successfully/i);

      // Verify that mockUser passwordHash was replaced with new hash
      const isNewValid = await bcrypt.compare(
        'BrandNewPassword456',
        mockUser.passwordHash
      );
      expect(isNewValid).toBe(true);
    });
  });

  describe('DELETE /api/user', () => {
    it('should return 401 when unauthenticated', async () => {
      const res = await request(app)
        .delete('/api/user')
        .send({ password: 'OldPassword123' });

      expect(res.statusCode).toBe(401);
    });

    it('should reject deletion when password is wrong or missing with 400', async () => {
      const res = await request(app)
        .delete('/api/user')
        .set('Cookie', [`token=${validToken}`])
        .send({ password: 'WrongPassword' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/invalid password/i);
      expect(deletedUser).toBe(false);
    });

    it('should delete user, roadmap, diagnostics, and clear cookie on valid password', async () => {
      const res = await request(app)
        .delete('/api/user')
        .set('Cookie', [`token=${validToken}`])
        .send({ password: 'OldPassword123' });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toMatch(/deleted successfully/i);

      // Verify cascading data deletion
      expect(deletedUser).toBe(true);
      expect(deletedRoadmaps).toBe(true);
      expect(deletedDiagnostics).toBe(true);

      // Verify cookie cleared
      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(cookies[0]).toMatch(/token=;/);
    });
  });
});
