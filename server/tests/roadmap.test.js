const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Roadmap = require('../models/Roadmap');
const env = require('../config/env');
const {
  calculateWeightedReadiness,
  advanceModuleStatus,
} = require('../services/roadmapService');
const { sampleModules } = require('../scripts/createSampleRoadmap');

describe('Roadmap Service & Endpoints', () => {
  describe('roadmapService Unit Tests', () => {
    describe('calculateWeightedReadiness', () => {
      it('should calculate correct readiness with unequal hours', () => {
        const modules = [
          { moduleId: 'm1', estimatedHours: 10, status: 'complete' },
          { moduleId: 'm2', estimatedHours: 30, status: 'locked' },
        ];

        // 10 / (10 + 30) = 25%
        expect(calculateWeightedReadiness(modules)).toBe(25);

        // When second module is completed: (10 + 30) / 40 = 100%
        modules[1].status = 'complete';
        expect(calculateWeightedReadiness(modules)).toBe(100);
      });

      it('should return 0 when no modules are complete', () => {
        const modules = [
          { moduleId: 'm1', estimatedHours: 20, status: 'active' },
          { moduleId: 'm2', estimatedHours: 20, status: 'locked' },
        ];
        expect(calculateWeightedReadiness(modules)).toBe(0);
      });

      it('should return 0 for empty or invalid input', () => {
        expect(calculateWeightedReadiness([])).toBe(0);
        expect(calculateWeightedReadiness(null)).toBe(0);
      });
    });

    describe('advanceModuleStatus', () => {
      it('should complete active module and unlock the next locked module', () => {
        const modules = [
          { moduleId: 'm1', status: 'active' },
          { moduleId: 'm2', status: 'locked' },
          { moduleId: 'm3', status: 'locked' },
        ];

        const result = advanceModuleStatus(modules, 'm1');
        expect(result.error).toBeUndefined();
        expect(result.updatedModules[0].status).toBe('complete');
        expect(result.updatedModules[1].status).toBe('active');
        expect(result.updatedModules[2].status).toBe('locked');
      });

      it('should reject completing a locked module with 409', () => {
        const modules = [
          { moduleId: 'm1', status: 'active' },
          { moduleId: 'm2', status: 'locked' },
        ];

        const result = advanceModuleStatus(modules, 'm2');
        expect(result.code).toBe(409);
        expect(result.error).toMatch(/not active/i);
      });

      it('should reject completing an already complete module with 409', () => {
        const modules = [
          { moduleId: 'm1', status: 'complete' },
          { moduleId: 'm2', status: 'active' },
        ];

        const result = advanceModuleStatus(modules, 'm1');
        expect(result.code).toBe(409);
        expect(result.error).toMatch(/already complete/i);
      });

      it('should reject unknown module with 404', () => {
        const modules = [{ moduleId: 'm1', status: 'active' }];
        const result = advanceModuleStatus(modules, 'unknown-module');
        expect(result.code).toBe(404);
        expect(result.error).toMatch(/not found/i);
      });
    });
  });

  describe('Roadmap API Integration Tests', () => {
    const userAId = '507f1f77bcf86cd799439011';
    const userBId = '507f1f77bcf86cd799439022';
    const mockRoleId = '507f191e810c19729de860ea';

    const tokenA = jwt.sign({ id: userAId }, env.JWT_SECRET, {
      expiresIn: '7d',
    });
    const tokenB = jwt.sign({ id: userBId }, env.JWT_SECRET, {
      expiresIn: '7d',
    });

    let mockRoadmaps = [];

    beforeEach(() => {
      mockRoadmaps = [
        {
          _id: new mongoose.Types.ObjectId(),
          userId: new mongoose.Types.ObjectId(userAId),
          roleId: new mongoose.Types.ObjectId(mockRoleId),
          isArchived: false,
          readinessScore: 0,
          modules: JSON.parse(JSON.stringify(sampleModules)),
          history: [{ date: new Date(), event: 'roadmap_created', readinessScore: 0 }],
          save: function () {
            return Promise.resolve(this);
          },
        },
      ];

      // Mock User.findById for authMiddleware
      jest.spyOn(User, 'findById').mockImplementation((id) => ({
        select: jest.fn().mockImplementation((fields) => {
          const idStr = id.toString();
          if (idStr === userAId || idStr === userBId) {
            const user = {
              _id: new mongoose.Types.ObjectId(idStr),
              name: idStr === userAId ? 'User Alpha' : 'User Beta',
              email: idStr === userAId ? 'alpha@example.com' : 'beta@example.com',
            };
            if (fields && fields.includes('-passwordHash')) {
              delete user.passwordHash;
            }
            return Promise.resolve(user);
          }
          return Promise.resolve(null);
        }),
      }));

      // Mock Roadmap.findOne
      jest.spyOn(Roadmap, 'findOne').mockImplementation((query) => {
        const found = mockRoadmaps.find((rm) => {
          const matchUser = rm.userId.toString() === query.userId.toString();
          const matchArchived =
            query.isArchived === undefined || rm.isArchived === query.isArchived;
          return matchUser && matchArchived;
        });
        return Promise.resolve(found || null);
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    describe('GET /api/roadmap', () => {
      it('should return 401 when unauthenticated', async () => {
        const res = await request(app).get('/api/roadmap');
        expect(res.statusCode).toBe(401);
      });

      it("should return the user's active roadmap", async () => {
        const res = await request(app)
          .get('/api/roadmap')
          .set('Cookie', [`token=${tokenA}`]);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('roadmap');
        expect(res.body.roadmap.userId.toString()).toBe(userAId);
        expect(res.body.roadmap.modules).toHaveLength(6);
        expect(res.body.roadmap.modules[0].status).toBe('active');
      });

      it("cannot access another user's roadmap (returns 404 for User B who has no roadmap)", async () => {
        const res = await request(app)
          .get('/api/roadmap')
          .set('Cookie', [`token=${tokenB}`]);

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toBe('No roadmap yet');
      });
    });

    describe('PATCH /api/roadmap/module/:moduleId/complete', () => {
      it('completing first module unlocks second and recalculates readiness', async () => {
        const firstModuleId = sampleModules[0].moduleId;
        const secondModuleId = sampleModules[1].moduleId;

        const res = await request(app)
          .patch(`/api/roadmap/module/${firstModuleId}/complete`)
          .set('Cookie', [`token=${tokenA}`]);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('roadmap');

        const updatedModules = res.body.roadmap.modules;
        expect(updatedModules[0].status).toBe('complete');
        expect(updatedModules[1].status).toBe('active');
        expect(updatedModules[2].status).toBe('locked');

        // Readiness should be recalculated based on module 1 estimatedHours (10 / 75 = 13%)
        expect(res.body.roadmap.readinessScore).toBeGreaterThan(0);

        // History event recorded
        const history = res.body.roadmap.history;
        expect(history[history.length - 1]).toMatchObject({
          event: 'module_complete',
          readinessScore: res.body.roadmap.readinessScore,
        });
      });

      it('cannot complete a locked module (returns 409)', async () => {
        const lockedModuleId = sampleModules[1].moduleId; // Initially locked

        const res = await request(app)
          .patch(`/api/roadmap/module/${lockedModuleId}/complete`)
          .set('Cookie', [`token=${tokenA}`]);

        expect(res.statusCode).toBe(409);
        expect(res.body.message).toMatch(/not active/i);
      });

      it('cannot complete an already complete module (returns 409)', async () => {
        // Mark first module as complete first
        mockRoadmaps[0].modules[0].status = 'complete';
        mockRoadmaps[0].modules[1].status = 'active';

        const firstModuleId = sampleModules[0].moduleId;

        const res = await request(app)
          .patch(`/api/roadmap/module/${firstModuleId}/complete`)
          .set('Cookie', [`token=${tokenA}`]);

        expect(res.statusCode).toBe(409);
        expect(res.body.message).toMatch(/already complete/i);
      });

      it('returns 404 for unknown module ID', async () => {
        const res = await request(app)
          .patch('/api/roadmap/module/non-existent-module/complete')
          .set('Cookie', [`token=${tokenA}`]);

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toMatch(/not found/i);
      });
    });
  });
});
