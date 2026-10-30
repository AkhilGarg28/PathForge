const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../app');
const Role = require('../models/Role');
const User = require('../models/User');
const Roadmap = require('../models/Roadmap');
const env = require('../config/env');

describe('Role Endpoints (/api/roles and /api/user/role)', () => {
  const mockUserId = '507f1f77bcf86cd799439011';
  const mockRoleId = '507f191e810c19729de860ea';

  const mockRoleData = [
    {
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
    },
    {
      _id: new mongoose.Types.ObjectId(),
      name: 'Data Analyst',
      description: 'Analytics and Business Intelligence',
      dimensions: [
        'SQL & Databases',
        'Python & Pandas',
        'Data Visualization',
        'Statistical Analysis',
        'Data Cleaning',
        'Business Intelligence',
      ],
    },
  ];

  let mockUser;
  let activeRoadmaps;

  const validToken = jwt.sign({ id: mockUserId }, env.JWT_SECRET, {
    expiresIn: '7d',
  });

  beforeEach(() => {
    mockUser = {
      _id: new mongoose.Types.ObjectId(mockUserId),
      name: 'Test Learner',
      email: 'learner@example.com',
      targetRole: null,
    };

    activeRoadmaps = [
      {
        _id: new mongoose.Types.ObjectId(),
        userId: new mongoose.Types.ObjectId(mockUserId),
        roleId: mockRoleData[0]._id,
        isArchived: false,
      },
    ];

    // Mock Role.find
    jest.spyOn(Role, 'find').mockImplementation(() => ({
      select: jest.fn().mockResolvedValue(mockRoleData),
    }));

    // Mock Role.findById
    jest.spyOn(Role, 'findById').mockImplementation((id) => {
      const found = mockRoleData.find(
        (r) => r._id.toString() === id.toString()
      );
      return Promise.resolve(found || null);
    });

    // Mock User.findById for authMiddleware
    jest.spyOn(User, 'findById').mockImplementation((id) => ({
      select: jest.fn().mockImplementation((fields) => {
        if (id.toString() === mockUserId) {
          const copy = { ...mockUser };
          if (fields && fields.includes('-passwordHash')) {
            delete copy.passwordHash;
          }
          return Promise.resolve(copy);
        }
        return Promise.resolve(null);
      }),
    }));

    // Mock User.findByIdAndUpdate
    jest
      .spyOn(User, 'findByIdAndUpdate')
      .mockImplementation((id, update) => ({
        select: jest.fn().mockImplementation(() => {
          if (id.toString() === mockUserId) {
            mockUser = { ...mockUser, ...update };
            return Promise.resolve(mockUser);
          }
          return Promise.resolve(null);
        }),
      }));

    // Mock Roadmap.updateMany
    jest
      .spyOn(Roadmap, 'updateMany')
      .mockImplementation((filter, update) => {
        let modifiedCount = 0;
        activeRoadmaps.forEach((rm) => {
          if (
            rm.userId.toString() === filter.userId.toString() &&
            rm.isArchived === filter.isArchived
          ) {
            rm.isArchived = update.isArchived;
            modifiedCount += 1;
          }
        });
        return Promise.resolve({ modifiedCount });
      });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('GET /api/roles', () => {
    it('should be public and return a list of roles with dimensions and description', async () => {
      const res = await request(app).get('/api/roles');

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('roles');
      expect(Array.isArray(res.body.roles)).toBe(true);
      expect(res.body.roles.length).toBe(2);

      const firstRole = res.body.roles[0];
      expect(firstRole).toHaveProperty('id');
      expect(firstRole).toHaveProperty('name', 'MERN Developer');
      expect(firstRole).toHaveProperty('description');
      expect(Array.isArray(firstRole.dimensions)).toBe(true);
      expect(firstRole.dimensions).toHaveLength(6);
    });
  });

  describe('POST /api/user/role', () => {
    it('should reject unauthenticated request with 401', async () => {
      const res = await request(app)
        .post('/api/user/role')
        .send({ roleId: mockRoleId });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toMatch(/authentication required/i);
    });

    it('should reject malformed or invalid roleId with 400', async () => {
      const res = await request(app)
        .post('/api/user/role')
        .set('Cookie', [`token=${validToken}`])
        .send({ roleId: 'invalid-non-object-id' });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/invalid role id/i);
    });

    it('should reject non-existent roleId with 400', async () => {
      const nonExistentId = new mongoose.Types.ObjectId().toString();
      const res = await request(app)
        .post('/api/user/role')
        .set('Cookie', [`token=${validToken}`])
        .send({ roleId: nonExistentId });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toMatch(/role does not exist/i);
    });

    it('should successfully set targetRole and archive previous roadmap', async () => {
      expect(activeRoadmaps[0].isArchived).toBe(false);

      const res = await request(app)
        .post('/api/user/role')
        .set('Cookie', [`token=${validToken}`])
        .send({ roleId: mockRoleId });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('user');
      expect(res.body.user).toMatchObject({
        id: mockUserId,
        targetRole: 'MERN Developer',
      });

      // Verify that active roadmaps for the user were archived
      expect(activeRoadmaps[0].isArchived).toBe(true);
    });
  });
});
