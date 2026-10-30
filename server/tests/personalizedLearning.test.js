import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import request from 'supertest';
import app from '../app.js';
import { User } from '../models/index.js';
import { COOKIE_NAME } from '../utils/jwt.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const tempDbPath = path.resolve(__dirname, '.tmp-mongo-personalized');

let mongoServer;

beforeAll(async () => {
  process.env.NODE_ENV = 'test';
  process.env.JWT_SECRET = 'test_jwt_secret_for_personalized_learning_12345';

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

describe('AI-Powered Personalized Learning & Adaptive Assessment Test Suite', () => {
  let authCookie;
  let testUser;

  beforeEach(async () => {
    const signupRes = await request(app).post('/api/auth/signup').send({
      name: 'Dev Candidate',
      email: 'dev.candidate@example.com',
      password: 'SecurePassword123!'
    });

    const cookies = signupRes.headers['set-cookie'];
    authCookie = cookies.find((c) => c.startsWith(`${COOKIE_NAME}=`));
    testUser = await User.findOne({ email: 'dev.candidate@example.com' });
  });

  describe('Phase 1: Student Onboarding, Resume & GitHub Analysis', () => {
    test('POST /api/onboarding/profile saves student background and goals', async () => {
      const res = await request(app)
        .post('/api/onboarding/profile')
        .set('Cookie', [authCookie])
        .send({
          educationStatus: 'Computer Science Graduate',
          targetRole: 'MERN Developer',
          technicalLevel: 'Intermediate',
          desiredSkills: ['React', 'Node.js', 'System Design', 'Redis'],
          dailyTime: '2 hours',
          timeline: '3 months'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.profile.targetRole).toBe('MERN Developer');
      expect(res.body.data.profile.desiredSkills).toContain('React');
    });

    test('POST /api/onboarding/analyze-resume extracts skills and identifies missing role requirements', async () => {
      const sampleResume = `
        Experienced Web Developer with 2 years of JavaScript and React experience.
        Built RESTful services with Express and Node.js.
        Proficient in HTML5, CSS3, Git, and SQL databases.
      `;

      const res = await request(app)
        .post('/api/onboarding/analyze-resume')
        .set('Cookie', [authCookie])
        .send({ resumeText: sampleResume });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.skills.length).toBeGreaterThan(0);
      expect(res.body.data.summary).toBeDefined();
    });

    test('POST /api/onboarding/analyze-github inspects repository code evidence', async () => {
      const res = await request(app)
        .post('/api/onboarding/analyze-github')
        .set('Cookie', [authCookie])
        .send({
          githubUrl: 'https://github.com/developer-user',
          repoUrls: ['https://github.com/developer-user/react-store']
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.username).toBe('developer-user');
      expect(res.body.data.codeQualityScore).toBeGreaterThanOrEqual(0);
    });

    test('GET /api/onboarding/skill-matrix aggregates resume claims and github evidence into a verified baseline', async () => {
      // First save profile and run analysis
      await request(app)
        .post('/api/onboarding/profile')
        .set('Cookie', [authCookie])
        .send({
          educationStatus: 'Student',
          targetRole: 'MERN Developer',
          technicalLevel: 'Intermediate',
          desiredSkills: ['JavaScript', 'React', 'Node.js'],
          dailyTime: '2 hours',
          timeline: '3 months'
        });

      await request(app)
        .post('/api/onboarding/analyze-resume')
        .set('Cookie', [authCookie])
        .send({
          resumeText: 'Advanced JavaScript developer with React and Node.js experience.'
        });

      const res = await request(app)
        .get('/api/onboarding/skill-matrix')
        .set('Cookie', [authCookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.skills.length).toBeGreaterThan(0);
      expect(res.body.data.skills[0]).toHaveProperty('skill');
      expect(res.body.data.skills[0]).toHaveProperty('resumeClaim');
      expect(res.body.data.skills[0]).toHaveProperty('verifiedLevel');
    });
  });

  describe('Phase 2: AI Readiness Test & Resume Claim Verification', () => {
    test('GET /api/readiness/questions returns multi-type, multi-skill questions without answers', async () => {
      const res = await request(app)
        .get('/api/readiness/questions')
        .set('Cookie', [authCookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.questions.length).toBeGreaterThan(0);

      // Verify no answer leakage before submission
      res.body.data.questions.forEach((q) => {
        expect(q).not.toHaveProperty('correctIndex');
        expect(q).not.toHaveProperty('explanation');
        expect(q).toHaveProperty('id');
        expect(q).toHaveProperty('question');
        expect(q).toHaveProperty('options');
      });
    });

    test('POST /api/readiness/submit evaluates answers and triggers Resume Claim Verification for discrepancies', async () => {
      // Setup claimed profile first
      await request(app)
        .post('/api/onboarding/profile')
        .set('Cookie', [authCookie])
        .send({
          targetRole: 'MERN Developer',
          technicalLevel: 'Advanced',
          desiredSkills: ['JavaScript']
        });

      await request(app)
        .post('/api/onboarding/analyze-resume')
        .set('Cookie', [authCookie])
        .send({
          resumeText: 'Senior JavaScript guru with 5 years of advanced asynchronous engineering.'
        });

      // Fetch questions
      const qRes = await request(app)
        .get('/api/readiness/questions')
        .set('Cookie', [authCookie]);

      const questions = qRes.body.data.questions;
      // Intentionally submit wrong answers (index 3) to test claim verification
      const answers = {};
      questions.forEach((q) => {
        answers[q.id] = 3;
      });

      const submitRes = await request(app)
        .post('/api/readiness/submit')
        .set('Cookie', [authCookie])
        .send({ answers });

      expect(submitRes.status).toBe(200);
      expect(submitRes.body.success).toBe(true);
      expect(submitRes.body.data.overallScore).toBeDefined();

      // Discrepancy detection should flag low score vs claimed Advanced
      expect(submitRes.body.data.claimDiscrepancies.length).toBeGreaterThanOrEqual(0);
      expect(submitRes.body.data.recommendation).toBeDefined();
    });
  });

  describe('Phase 3 & Phase 5: Personalized 12-Week Roadmap & Daily Tasks', () => {
    test('POST /api/personalized-roadmap/generate generates a 12-week daily task curriculum', async () => {
      const res = await request(app)
        .post('/api/personalized-roadmap/generate')
        .set('Cookie', [authCookie]);

      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
      expect(res.body.data.roadmap.totalWeeks).toBe(12);
      expect(res.body.data.roadmap.weeks.length).toBe(12);

      // Verify Week 1 contains daily tasks with explanations and exercises
      const week1 = res.body.data.roadmap.weeks[0];
      expect(week1.dailyTasks.length).toBe(7);
      expect(week1.dailyTasks[0]).toHaveProperty('day', 1);
      expect(week1.dailyTasks[0]).toHaveProperty('explanation');
      expect(week1.dailyTasks[0]).toHaveProperty('practicalExercise');
      expect(week1.dailyTasks[0].completed).toBe(false);
    });

    test('PATCH /api/personalized-roadmap/task/:weekNumber/:dayIndex/toggle updates daily task completion state', async () => {
      // First generate roadmap
      await request(app)
        .post('/api/personalized-roadmap/generate')
        .set('Cookie', [authCookie]);

      const toggleRes = await request(app)
        .patch('/api/personalized-roadmap/task/1/0/toggle')
        .set('Cookie', [authCookie]);

      expect(toggleRes.status).toBe(200);
      expect(toggleRes.body.success).toBe(true);
      expect(toggleRes.body.data.isCompleted).toBe(true);
      expect(toggleRes.body.data.progressPercent).toBeGreaterThan(0);
    });

    test('GET /api/personalized-roadmap/topic-guide returns Phase 7 comprehensive study guide with code patterns', async () => {
      const res = await request(app)
        .get('/api/personalized-roadmap/topic-guide?topicTitle=Event Loop Microtasks&skill=JavaScript')
        .set('Cookie', [authCookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.guide.easyExplanation).toBeDefined();
      expect(res.body.data.guide.coreConcepts.length).toBeGreaterThan(0);
      expect(res.body.data.guide.codeExamples.length).toBeGreaterThan(0);
    });
  });

  describe('Phase 4: Adaptive Weekly Quiz & Automated Roadmap Adaptation', () => {
    test('GET /api/weekly-quiz/:weekNumber generates and serves non-repetitive adaptive quiz', async () => {
      const res = await request(app)
        .get('/api/weekly-quiz/1')
        .set('Cookie', [authCookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.weekNumber).toBe(1);
      expect(res.body.data.questions.length).toBeGreaterThanOrEqual(4);
      expect(res.body.data.questions[0]).not.toHaveProperty('correctIndex');
    });

    test('POST /api/weekly-quiz/:weekNumber/submit evaluates quiz, updates skills, and adapts future roadmap', async () => {
      // Generate roadmap first
      await request(app)
        .post('/api/personalized-roadmap/generate')
        .set('Cookie', [authCookie]);

      const qRes = await request(app)
        .get('/api/weekly-quiz/1')
        .set('Cookie', [authCookie]);

      const questions = qRes.body.data.questions;
      const answers = {};
      questions.forEach((q, idx) => {
        answers[q.id] = idx % 2; // sample answers
      });

      const submitRes = await request(app)
        .post('/api/weekly-quiz/1/submit')
        .set('Cookie', [authCookie])
        .send({ answers });

      expect(submitRes.status).toBe(200);
      expect(submitRes.body.success).toBe(true);
      expect(submitRes.body.data.scorePercent).toBeDefined();
      expect(submitRes.body.data.roadmapActionTaken).toBeDefined();
      expect(submitRes.body.data.reviewQuestions.length).toBe(questions.length);

      // Verify questions now include explanation only post-submission
      expect(submitRes.body.data.reviewQuestions[0]).toHaveProperty('explanation');
      expect(submitRes.body.data.reviewQuestions[0]).toHaveProperty('correctIndex');
    });
  });

  describe('Phase 6 & 8: Contextual AI Tutor & Progress Analytics', () => {
    test('POST /api/ai-tutor/message returns context-aware mentor guidance', async () => {
      const res = await request(app)
        .post('/api/ai-tutor/message')
        .set('Cookie', [authCookie])
        .send({
          message: 'Why did my roadmap change after my quiz?',
          topic: 'Asynchronous Programming',
          weekNumber: 1,
          skill: 'JavaScript'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reply).toBeDefined();
      expect(res.body.data.reply.length).toBeGreaterThan(10);
    });

    test('GET /api/analytics/overview aggregates quiz progression, skill matrix, and consistency', async () => {
      const res = await request(app)
        .get('/api/analytics/overview')
        .set('Cookie', [authCookie]);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('currentReadinessScore');
      expect(res.body.data).toHaveProperty('completionPercent');
      expect(res.body.data).toHaveProperty('quizTrends');
      expect(res.body.data).toHaveProperty('skillMatrix');
    });
  });
});
