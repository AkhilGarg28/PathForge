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

const sampleModules = [
  {
    moduleId: 'mod-1-react',
    title: 'React Fundamentals',
    estimatedHours: 10,
    status: 'active',
  },
  {
    moduleId: 'mod-2-advanced-react',
    title: 'Advanced React',
    estimatedHours: 15,
    status: 'locked',
  },
  {
    moduleId: 'mod-3-node',
    title: 'Node & Express',
    estimatedHours: 12,
    status: 'locked',
  },
  {
    moduleId: 'mod-4-mongo',
    title: 'MongoDB & Mongoose',
    estimatedHours: 14,
    status: 'locked',
  },
  {
    moduleId: 'mod-5-security',
    title: 'API Security',
    estimatedHours: 8,
    status: 'locked',
  },
  {
    moduleId: 'mod-6-testing',
    title: 'Testing & CI/CD',
    estimatedHours: 16,
    status: 'locked',
  },
];

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

      it('should allow completing the last module', () => {
        const modules = [
          { moduleId: 'm1', status: 'complete' },
          { moduleId: 'm2', status: 'complete' },
          { moduleId: 'm3', status: 'active' },
        ];

        const result = advanceModuleStatus(modules, 'm3');
        expect(result.error).toBeUndefined();
        expect(result.updatedModules[2].status).toBe('complete');
        expect(result.nextActiveModule).toBeNull();
      });

      it('should reject completing a locked module with 400', () => {
        const modules = [
          { moduleId: 'm1', status: 'active' },
          { moduleId: 'm2', status: 'locked' },
        ];

        const result = advanceModuleStatus(modules, 'm2');
        expect(result.code).toBe(400);
        expect(result.error).toMatch(/not active/i);
      });

      it('should reject completing an already complete module with 400', () => {
        const modules = [
          { moduleId: 'm1', status: 'complete' },
          { moduleId: 'm2', status: 'active' },
        ];

        const result = advanceModuleStatus(modules, 'm1');
        expect(result.code).toBe(400);
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
      it('should return 401 when unauthenticated (no-token 401)', async () => {
        const res = await request(app).get('/api/roadmap');
        expect(res.statusCode).toBe(401);
      });

      it("should return the user's active roadmap for req.user.id ONLY", async () => {
        // Even if client passes another userId in query, it must query for tokenA user ONLY
        const res = await request(app)
          .get(`/api/roadmap?userId=${userBId}`)
          .set('Cookie', [`token=${tokenA}`]);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('roadmap');
        expect(res.body.roadmap.userId.toString()).toBe(userAId);
        expect(res.body.roadmap.modules).toHaveLength(6);
        expect(res.body.roadmap.modules[0].status).toBe('active');
      });

      it("user A cannot touch or access user B's data (returns 404 for User B with no roadmap)", async () => {
        const res = await request(app)
          .get('/api/roadmap')
          .set('Cookie', [`token=${tokenB}`]);

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toMatch(/no roadmap yet/i);
      });

      it('never trusts client-supplied userId in query parameter', async () => {
        // User B attempts to view User A's roadmap by injecting userAId in query
        const res = await request(app)
          .get(`/api/roadmap?userId=${userAId}`)
          .set('Cookie', [`token=${tokenB}`]);

        // Must strictly use token identity (User B) and return 404
        expect(res.statusCode).toBe(404);
        expect(res.body.message).toMatch(/no roadmap yet/i);
      });

      it("user B cannot complete a module in user A's roadmap", async () => {
        const firstModuleId = sampleModules[0].moduleId;

        const res = await request(app)
          .patch(`/api/roadmap/module/${firstModuleId}/complete`)
          .send({ userId: userAId })
          .set('Cookie', [`token=${tokenB}`]);

        expect(res.statusCode).toBe(404);
        expect(res.body.message).toMatch(/no roadmap yet/i);
      });
    });

    describe('PATCH /api/roadmap/module/:moduleId/complete', () => {
      it('should return 401 when called without token', async () => {
        const firstModuleId = sampleModules[0].moduleId;
        const res = await request(app).patch(
          `/api/roadmap/module/${firstModuleId}/complete`
        );
        expect(res.statusCode).toBe(401);
      });

      it('completing active module unlocks next module and updates readiness', async () => {
        const firstModuleId = sampleModules[0].moduleId;

        const res = await request(app)
          .patch(`/api/roadmap/module/${firstModuleId}/complete`)
          .set('Cookie', [`token=${tokenA}`]);

        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('roadmap');

        const updatedModules = res.body.roadmap.modules;
        expect(updatedModules[0].status).toBe('complete');
        expect(updatedModules[1].status).toBe('active');
        expect(updatedModules[2].status).toBe('locked');

        // Readiness should be recalculated based on completed hours
        expect(res.body.roadmap.readinessScore).toBeGreaterThan(0);

        // History event recorded
        const history = res.body.roadmap.history;
        expect(history[history.length - 1]).toMatchObject({
          event: 'module_complete',
          readinessScore: res.body.roadmap.readinessScore,
        });
      });

      it('cannot complete a locked module (returns 400)', async () => {
        const lockedModuleId = sampleModules[1].moduleId; // Initially locked

        const res = await request(app)
          .patch(`/api/roadmap/module/${lockedModuleId}/complete`)
          .set('Cookie', [`token=${tokenA}`]);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/not active/i);
      });

      it('cannot complete an already complete module (returns 400)', async () => {
        // Mark first module as complete
        mockRoadmaps[0].modules[0].status = 'complete';
        mockRoadmaps[0].modules[1].status = 'active';

        const firstModuleId = sampleModules[0].moduleId;

        const res = await request(app)
          .patch(`/api/roadmap/module/${firstModuleId}/complete`)
          .set('Cookie', [`token=${tokenA}`]);

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toMatch(/already complete/i);
      });

      it('completing the last module is valid and sets all modules complete', async () => {
        // Mark all except last as complete
        mockRoadmaps[0].modules.forEach((mod, idx) => {
          if (idx < mockRoadmaps[0].modules.length - 1) {
            mod.status = 'complete';
          } else {
            mod.status = 'active';
          }
        });

        const lastModuleId =
          mockRoadmaps[0].modules[mockRoadmaps[0].modules.length - 1].moduleId;

        const res = await request(app)
          .patch(`/api/roadmap/module/${lastModuleId}/complete`)
          .set('Cookie', [`token=${tokenA}`]);

        expect(res.statusCode).toBe(200);
        expect(res.body.roadmap.readinessScore).toBe(100);
        expect(
          res.body.roadmap.modules.every((m) => m.status === 'complete')
        ).toBe(true);
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
