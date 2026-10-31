const request = require('supertest');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../app');
const User = require('../models/User');
const Roadmap = require('../models/Roadmap');
const Role = require('../models/Role');
const env = require('../config/env');
const replanService = require('../services/replanService');
const { scoreCheckpoint } = require('../services/scoringService');

const createAuthCookie = (userId) => {
  const token = jwt.sign({ id: userId.toString() }, env.JWT_SECRET, { expiresIn: '1d' });
  return `token=${token}`;
};

const createMockRoadmap = (overrides = {}) => ({
  userId: new mongoose.Types.ObjectId(),
  roleId: new mongoose.Types.ObjectId(),
  isArchived: false,
  readinessScore: 0,
  modules: [
    {
      moduleId: 'mod-1-react',
      title: 'React Fundamentals',
      description: 'Learn React basics and hooks.',
      resourceTags: ['Frontend React', 'MERN Developer'],
      resources: [{ title: 'React Docs', url: 'https://react.dev', type: 'docs' }],
      estimatedHours: 10,
      status: 'active',
      checkpointScore: null,
    },
    {
      moduleId: 'mod-2-node',
      title: 'Node & Express APIs',
      description: 'Build backend APIs with Express.',
      resourceTags: ['Node & Express', 'MERN Developer'],
      resources: [{ title: 'Express Docs', url: 'https://expressjs.com', type: 'docs' }],
      estimatedHours: 15,
      status: 'locked',
      checkpointScore: null,
    },
    {
      moduleId: 'mod-3-mongo',
      title: 'MongoDB & Mongoose Data Modeling',
      description: 'Model documents in MongoDB.',
      resourceTags: ['MongoDB & Mongoose', 'MERN Developer'],
      resources: [{ title: 'MongoDB Docs', url: 'https://mongodb.com', type: 'docs' }],
      estimatedHours: 12,
      status: 'locked',
      checkpointScore: null,
    },
    {
      moduleId: 'mod-4-security',
      title: 'API Security & JWT',
      description: 'Secure REST endpoints.',
      resourceTags: ['API Design & Security', 'MERN Developer'],
      resources: [{ title: 'JWT Docs', url: 'https://jwt.io', type: 'docs' }],
      estimatedHours: 8,
      status: 'locked',
      checkpointScore: null,
    },
  ],
  history: [
    {
      date: new Date(),
      event: 'roadmap_created',
      readinessScore: 0,
      reason: 'Initial roadmap',
    },
  ],
  save: jest.fn().mockResolvedValue(true),
  ...overrides,
});

describe('Adaptive Re-planning Service & Checkpoint Endpoints', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('scoreCheckpoint pure function', () => {
    const mockQuestions = [
      { id: 'q1', correctIndex: 0 },
      { id: 'q2', correctIndex: 2 },
      { id: 'q3', correctIndex: 1 },
      { id: 'q4', correctIndex: 3 },
    ];

    it('returns 100 when all answers are correct', () => {
      const answers = [
        { questionId: 'q1', selectedIndex: 0 },
        { questionId: 'q2', selectedIndex: 2 },
        { questionId: 'q3', selectedIndex: 1 },
        { questionId: 'q4', selectedIndex: 3 },
      ];
      expect(scoreCheckpoint(mockQuestions, answers)).toBe(100);
    });

    it('returns 50 when 2 out of 4 are correct', () => {
      const answers = [
        { questionId: 'q1', selectedIndex: 0 },
        { questionId: 'q2', selectedIndex: 2 },
        { questionId: 'q3', selectedIndex: 0 }, // wrong
        { questionId: 'q4', selectedIndex: 1 }, // wrong
      ];
      expect(scoreCheckpoint(mockQuestions, answers)).toBe(50);
    });

    it('returns 25 when 1 out of 4 is correct', () => {
      const answers = [
        { questionId: 'q1', selectedIndex: 0 },
        { questionId: 'q2', selectedIndex: 0 }, // wrong
        { questionId: 'q3', selectedIndex: 0 }, // wrong
        { questionId: 'q4', selectedIndex: 0 }, // wrong
      ];
      expect(scoreCheckpoint(mockQuestions, answers)).toBe(25);
    });

    it('returns 0 when none are correct', () => {
      const answers = [
        { questionId: 'q1', selectedIndex: 1 },
        { questionId: 'q2', selectedIndex: 1 },
        { questionId: 'q3', selectedIndex: 0 },
        { questionId: 'q4', selectedIndex: 0 },
      ];
      expect(scoreCheckpoint(mockQuestions, answers)).toBe(0);
    });
  });

  describe('replanRoadmap Unit Tests', () => {
    it('high score (>= 80) with mocked LLM removes a module and marks current complete', async () => {
      const roadmap = createMockRoadmap();

      // Mock LLM compression to compress 3 remaining modules into 2 (removing mod-4-security)
      jest.spyOn(replanService, 'callLLMCompression').mockResolvedValue([
        {
          moduleId: 'mod-2-node',
          title: 'Node & Express APIs',
          description: 'Build backend APIs with Express.',
          resourceTags: ['Node & Express'],
          resources: [{ title: 'Express Docs', url: 'https://expressjs.com', type: 'docs' }],
          estimatedHours: 15,
        },
        {
          moduleId: 'mod-3-mongo',
          title: 'MongoDB & Mongoose Data Modeling',
          description: 'Model documents in MongoDB.',
          resourceTags: ['MongoDB & Mongoose'],
          resources: [{ title: 'MongoDB Docs', url: 'https://mongodb.com', type: 'docs' }],
          estimatedHours: 12,
        },
      ]);

      const result = await replanService.replanRoadmap(roadmap, 'mod-1-react', 85);

      expect(result.changes).toHaveLength(1);
      expect(result.changes[0].type).toBe('removed');
      expect(result.changes[0].moduleId).toBe('mod-4-security');

      // Current module marked complete
      const completedMod = result.roadmap.modules.find((m) => m.moduleId === 'mod-1-react');
      expect(completedMod.status).toBe('complete');
      expect(completedMod.checkpointScore).toBe(85);

      // Next module unlocked to active
      const nextMod = result.roadmap.modules.find((m) => m.moduleId === 'mod-2-node');
      expect(nextMod.status).toBe('active');

      // Total modules reduced from 4 to 3
      expect(result.roadmap.modules).toHaveLength(3);

      // History appended
      const lastHistory = result.roadmap.history[result.roadmap.history.length - 1];
      expect(lastHistory.event).toBe('replan');
      expect(lastHistory.reason).toContain('High checkpoint score');
      expect(result.roadmap.readinessScore).toBeGreaterThan(0);
    });

    it('high score (>= 80) with LLM failure uses deterministic rule-based fallback to remove a module', async () => {
      const roadmap = createMockRoadmap();

      // Mock LLM failure
      jest.spyOn(replanService, 'callLLMCompression').mockRejectedValue(
        new Error('Gemini API quota exceeded')
      );

      const result = await replanService.replanRoadmap(roadmap, 'mod-1-react', 90);

      // Rule-based fallback removes the last module (mod-4-security)
      expect(result.changes).toHaveLength(1);
      expect(result.changes[0].type).toBe('removed');
      expect(result.changes[0].moduleId).toBe('mod-4-security');

      expect(result.roadmap.modules).toHaveLength(3);
      const mod1 = result.roadmap.modules.find((m) => m.moduleId === 'mod-1-react');
      expect(mod1.status).toBe('complete');
      expect(mod1.checkpointScore).toBe(90);

      const mod2 = result.roadmap.modules.find((m) => m.moduleId === 'mod-2-node');
      expect(mod2.status).toBe('active');
    });

    it('low score (< 40) keeps module active and inserts one remedial module immediately after it', async () => {
      const roadmap = createMockRoadmap();

      const result = await replanService.replanRoadmap(roadmap, 'mod-1-react', 25);

      // Changes indicate inserted remedial module
      expect(result.changes).toHaveLength(1);
      expect(result.changes[0].type).toBe('inserted');
      expect(result.changes[0].moduleId).toContain('remedial');
      expect(result.changes[0].title).toContain('Remedial');

      // Total modules increased from 4 to 5
      expect(result.roadmap.modules).toHaveLength(5);

      // Target module remains active!
      const currentMod = result.roadmap.modules[0];
      expect(currentMod.moduleId).toBe('mod-1-react');
      expect(currentMod.status).toBe('active');
      expect(currentMod.checkpointScore).toBe(25);

      // Remedial module is inserted at index 1
      const remedialMod = result.roadmap.modules[1];
      expect(remedialMod.moduleId).toContain('remedial');
      expect(remedialMod.status).toBe('locked');
      expect(remedialMod.estimatedHours).toBeGreaterThanOrEqual(3);
      expect(remedialMod.estimatedHours).toBeLessThanOrEqual(6);
      expect(remedialMod.resourceTags[0]).toBe('Frontend React');

      // History appended
      const lastHistory = result.roadmap.history[result.roadmap.history.length - 1];
      expect(lastHistory.event).toBe('replan');
      expect(lastHistory.reason).toContain('Low checkpoint score');
    });

    it('mid score (40 to 79) completes the module and unlocks the next without inserting/removing', async () => {
      const roadmap = createMockRoadmap();

      const result = await replanService.replanRoadmap(roadmap, 'mod-1-react', 65);

      // Changes indicates none
      expect(result.changes).toHaveLength(1);
      expect(result.changes[0].type).toBe('none');

      // Total modules unchanged (4)
      expect(result.roadmap.modules).toHaveLength(4);

      // Current module completed
      const mod1 = result.roadmap.modules[0];
      expect(mod1.status).toBe('complete');
      expect(mod1.checkpointScore).toBe(65);

      // Next module unlocked
      const mod2 = result.roadmap.modules[1];
      expect(mod2.status).toBe('active');

      // History appended
      const lastHistory = result.roadmap.history[result.roadmap.history.length - 1];
      expect(lastHistory.event).toBe('replan');
      expect(lastHistory.reason).toContain('Satisfactory checkpoint score');
    });

    it('completed modules are untouched across replan operations', async () => {
      const roadmap = createMockRoadmap();
      // Mark mod-1 as already complete
      roadmap.modules[0].status = 'complete';
      roadmap.modules[0].estimatedHours = 10;
      roadmap.modules[0].title = 'Permanent React Basics';

      // Set mod-2 as active
      roadmap.modules[1].status = 'active';

      // Replan with high score on mod-2
      const result = await replanService.replanRoadmap(roadmap, 'mod-2-node', 90);

      // Completed module 0 remains completely intact
      expect(result.roadmap.modules[0].moduleId).toBe('mod-1-react');
      expect(result.roadmap.modules[0].title).toBe('Permanent React Basics');
      expect(result.roadmap.modules[0].status).toBe('complete');
      expect(result.roadmap.modules[0].estimatedHours).toBe(10);
    });

    it('locked module rejected with 400 error', async () => {
      const roadmap = createMockRoadmap();
      // mod-2 is locked
      await expect(replanService.replanRoadmap(roadmap, 'mod-2-node', 85)).rejects.toThrow(
        /locked/i
      );
    });
  });

  describe('Checkpoint API Endpoints Integration', () => {
    let testUserId;
    let authCookie;

    beforeEach(() => {
      testUserId = new mongoose.Types.ObjectId();
      authCookie = createAuthCookie(testUserId);

      jest.spyOn(User, 'findById').mockImplementation((id) => ({
        select: jest.fn().mockImplementation(() =>
          Promise.resolve({
            _id: id,
            name: 'Checkpoint Learner',
            email: 'checkpoint@pathforge.local',
          })
        ),
        then: (resolve) =>
          resolve({
            _id: id,
            name: 'Checkpoint Learner',
            email: 'checkpoint@pathforge.local',
          }),
      }));

      jest.spyOn(Role, 'findById').mockImplementation((id) =>
        Promise.resolve({
          _id: id,
          name: 'MERN Developer',
        })
      );
    });

    describe('GET /api/roadmap/module/:moduleId/checkpoint', () => {
      it('returns 401 when unauthenticated', async () => {
        const res = await request(app).get('/api/roadmap/module/mod-1-react/checkpoint');
        expect(res.status).toBe(401);
      });

      it('returns checkpoint questions without correctIndex for matching module dimension', async () => {
        const mockRoadmap = createMockRoadmap({ userId: testUserId });
        jest.spyOn(Roadmap, 'findOne').mockResolvedValue(mockRoadmap);

        const res = await request(app)
          .get('/api/roadmap/module/mod-1-react/checkpoint')
          .set('Cookie', authCookie);

        expect(res.status).toBe(200);
        expect(res.body.moduleId).toBe('mod-1-react');
        expect(Array.isArray(res.body.questions)).toBe(true);
        expect(res.body.questions.length).toBeGreaterThan(0);

        // Crucial security check: NEVER leak correctIndex
        res.body.questions.forEach((q) => {
          expect(q.correctIndex).toBeUndefined();
          expect(q.id).toBeDefined();
          expect(q.question).toBeDefined();
          expect(q.options).toHaveLength(4);
        });
      });

      it('returns 404 when no checkpoint questions match module tags and instructs plain completion', async () => {
        const mockRoadmap = createMockRoadmap({ userId: testUserId });
        mockRoadmap.modules[0].resourceTags = ['NonExistentDimension'];
        mockRoadmap.modules[0].title = 'Unmatched Topic';
        mockRoadmap.modules[0].resources = [];
        jest.spyOn(Roadmap, 'findOne').mockResolvedValue(mockRoadmap);

        const res = await request(app)
          .get('/api/roadmap/module/mod-1-react/checkpoint')
          .set('Cookie', authCookie);

        expect(res.status).toBe(404);
        expect(res.body.message).toMatch(/plain completion/i);
      });

      it('returns 404 if roadmap does not exist', async () => {
        jest.spyOn(Roadmap, 'findOne').mockResolvedValue(null);

        const res = await request(app)
          .get('/api/roadmap/module/mod-1-react/checkpoint')
          .set('Cookie', authCookie);

        expect(res.status).toBe(404);
        expect(res.body.message).toMatch(/no roadmap/i);
      });
    });

    describe('POST /api/roadmap/module/:moduleId/checkpoint', () => {
      it('returns 401 when unauthenticated', async () => {
        const res = await request(app)
          .post('/api/roadmap/module/mod-1-react/checkpoint')
          .send({ answers: [{ questionId: 'chk-react-1', selectedIndex: 0 }] });
        expect(res.status).toBe(401);
      });

      it('returns 400 when attempting to submit checkpoint on locked module', async () => {
        const mockRoadmap = createMockRoadmap({ userId: testUserId });
        jest.spyOn(Roadmap, 'findOne').mockResolvedValue(mockRoadmap);

        // mod-2 is locked
        const res = await request(app)
          .post('/api/roadmap/module/mod-2-node/checkpoint')
          .set('Cookie', authCookie)
          .send({ answers: [{ questionId: 'chk-node-1', selectedIndex: 0 }] });

        expect(res.status).toBe(400);
        expect(res.body.message).toMatch(/locked/i);
      });

      it('submits valid answers, replans roadmap, and returns score, updated roadmap, and changes', async () => {
        const mockRoadmap = createMockRoadmap({ userId: testUserId });
        jest.spyOn(Roadmap, 'findOne').mockResolvedValue(mockRoadmap);

        // Mock LLM compression for high score
        jest.spyOn(replanService, 'callLLMCompression').mockResolvedValue([
          {
            moduleId: 'mod-2-node',
            title: 'Node & Express APIs',
            estimatedHours: 15,
            resourceTags: ['Node & Express'],
            resources: [],
          },
          {
            moduleId: 'mod-3-mongo',
            title: 'MongoDB & Mongoose Data Modeling',
            estimatedHours: 12,
            resourceTags: ['MongoDB & Mongoose'],
            resources: [],
          },
        ]);

        // Submit correct answers for Frontend React checkpoints (chk-react-1:0, chk-react-2:1, chk-react-3:0, chk-react-4:1)
        const answers = [
          { questionId: 'chk-react-1', selectedIndex: 0 },
          { questionId: 'chk-react-2', selectedIndex: 1 },
          { questionId: 'chk-react-3', selectedIndex: 0 },
          { questionId: 'chk-react-4', selectedIndex: 1 },
        ];

        const res = await request(app)
          .post('/api/roadmap/module/mod-1-react/checkpoint')
          .set('Cookie', authCookie)
          .send({ answers });

        expect(res.status).toBe(200);
        expect(res.body.score).toBe(100);
        expect(res.body.roadmap).toBeDefined();
        expect(res.body.changes).toBeDefined();
        expect(res.body.changes[0].type).toBe('removed');
        expect(res.body.changes[0].moduleId).toBe('mod-4-security');
        expect(mockRoadmap.save).toHaveBeenCalled();
      });
    });
  });
});
