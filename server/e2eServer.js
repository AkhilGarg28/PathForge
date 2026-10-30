/**
 * E2E In-Memory Mock Server for PathForge
 * Allows running full-stack integration and Playwright tests without external mongod.
 */
const mongoose = require('mongoose');
const env = require('./config/env');
const app = require('./app');
const User = require('./models/User');
const Role = require('./models/Role');
const Roadmap = require('./models/Roadmap');
const Diagnostic = require('./models/Diagnostic');

// In-memory data collections
const users = new Map();
const roles = new Map();
const roadmaps = new Map();
const diagnostics = [];

// Seed default roles matching data/questions.json
const roleMern = {
  _id: new mongoose.Types.ObjectId('507f191e810c19729de860ea'),
  name: 'MERN Developer',
  description:
    'Full-stack JavaScript engineer specializing in MongoDB, Express, React, and Node.js to design, build, and deploy production-grade web applications.',
  dimensions: [
    'Frontend React',
    'Node & Express',
    'MongoDB & Mongoose',
    'API Design & Security',
    'Testing & CI/CD',
  ],
};

const roleDataAnalyst = {
  _id: new mongoose.Types.ObjectId('507f191e810c19729de860eb'),
  name: 'Data Analyst',
  description:
    'Analytics specialist focused on SQL, Python, data visualization, and statistical modeling to translate raw data into actionable business intelligence.',
  dimensions: [
    'SQL & Databases',
    'Python for Data',
    'Data Visualization',
    'Statistical Analysis',
  ],
};

roles.set(roleMern._id.toString(), roleMern);
roles.set(roleDataAnalyst._id.toString(), roleDataAnalyst);

// Mock User methods
User.findOne = async (query) => {
  if (query.email) {
    for (const u of users.values()) {
      if (u.email.toLowerCase() === query.email.toLowerCase()) {
        return { ...u };
      }
    }
  }
  return null;
};

User.create = async (doc) => {
  const id = (doc._id || new mongoose.Types.ObjectId()).toString();
  const user = {
    _id: new mongoose.Types.ObjectId(id),
    ...doc,
    createdAt: new Date(),
  };
  users.set(id, user);
  return { ...user };
};

User.findById = (id) => {
  const idStr = id ? id.toString() : '';
  const user = users.get(idStr);
  return {
    select: (fields) => {
      if (!user) return Promise.resolve(null);
      const copy = { ...user };
      if (fields && fields.includes('-passwordHash')) {
        delete copy.passwordHash;
      }
      return Promise.resolve(copy);
    },
    then: (resolve) => resolve(user ? { ...user } : null),
  };
};

User.findByIdAndUpdate = (id, update, _opts) => {
  const idStr = id ? id.toString() : '';
  const user = users.get(idStr);
  if (user && update) {
    Object.assign(user, update);
  }
  return {
    select: (fields) => {
      if (!user) return Promise.resolve(null);
      const copy = { ...user };
      if (fields && fields.includes('-passwordHash')) {
        delete copy.passwordHash;
      }
      return Promise.resolve(copy);
    },
  };
};

User.findByIdAndDelete = async (id) => {
  const idStr = id ? id.toString() : '';
  const user = users.get(idStr);
  users.delete(idStr);
  return user || null;
};

// Mock Role methods
Role.find = () => ({
  select: () => Promise.resolve(Array.from(roles.values())),
});

Role.findById = async (id) => {
  const idStr = id ? id.toString() : '';
  return roles.get(idStr) || null;
};

// Mock Diagnostic methods
Diagnostic.create = async (doc) => {
  const item = {
    _id: new mongoose.Types.ObjectId(),
    ...doc,
  };
  diagnostics.push(item);
  return item;
};

Diagnostic.deleteMany = async (query) => {
  if (query.userId) {
    const idStr = query.userId.toString();
    for (let i = diagnostics.length - 1; i >= 0; i--) {
      if (diagnostics[i].userId.toString() === idStr) {
        diagnostics.splice(i, 1);
      }
    }
  }
  return { acknowledged: true };
};

// Mock Roadmap methods
const createRoadmapInstance = (doc) => {
  const instance = {
    ...doc,
    _id: doc._id || new mongoose.Types.ObjectId(),
    modules: doc.modules ? JSON.parse(JSON.stringify(doc.modules)) : [],
    history: doc.history ? JSON.parse(JSON.stringify(doc.history)) : [],
    save: async function () {
      roadmaps.set(this._id.toString(), { ...this });
      return this;
    },
  };
  return instance;
};

Roadmap.findOne = async (query) => {
  const userIdStr = query.userId ? query.userId.toString() : null;
  for (const rm of roadmaps.values()) {
    const matchUser = !userIdStr || rm.userId.toString() === userIdStr;
    const matchArchived =
      query.isArchived === undefined || rm.isArchived === query.isArchived;
    if (matchUser && matchArchived) {
      return createRoadmapInstance(rm);
    }
  }
  return null;
};

Roadmap.create = async (doc) => {
  const instance = createRoadmapInstance(doc);
  roadmaps.set(instance._id.toString(), { ...instance });
  return instance;
};

Roadmap.updateMany = async (query, update) => {
  const userIdStr = query.userId ? query.userId.toString() : null;
  let count = 0;
  for (const rm of roadmaps.values()) {
    const matchUser = !userIdStr || rm.userId.toString() === userIdStr;
    const matchArchived =
      query.isArchived === undefined || rm.isArchived === query.isArchived;
    if (matchUser && matchArchived) {
      Object.assign(rm, update);
      count++;
    }
  }
  return { modifiedCount: count };
};

Roadmap.deleteMany = async (query) => {
  const userIdStr = query.userId ? query.userId.toString() : null;
  for (const [id, rm] of roadmaps.entries()) {
    if (!userIdStr || rm.userId.toString() === userIdStr) {
      roadmaps.delete(id);
    }
  }
  return { acknowledged: true };
};

// Helper to reset database between tests if called via HTTP
app.post('/api/test/reset', (req, res) => {
  users.clear();
  roadmaps.clear();
  diagnostics.length = 0;
  res.status(200).json({ status: 'reset_ok' });
});

// Helper to toggle FORCE_LLM_FAILURE flag via HTTP
app.post('/api/test/llm-flag', (req, res) => {
  const { forceFailure } = req.body;
  process.env.FORCE_LLM_FAILURE = forceFailure ? 'true' : 'false';
  res.status(200).json({ status: 'flag_updated', forceFailure: process.env.FORCE_LLM_FAILURE });
});

const PORT = process.env.PORT || 5000;

let currentServer = null;

function startListen(retries = 10) {
  const s = app.listen(PORT, () => {
    console.log(`[E2E Server] Running on http://localhost:${PORT}`);
  });

  s.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && retries > 0) {
      console.warn(`[E2E Server] Port ${PORT} busy, retrying in 1s... (${retries} attempts left)`);
      setTimeout(() => startListen(retries - 1), 1000);
    } else {
      console.error('[E2E Server] Listen error:', err);
      process.exit(1);
    }
  });

  currentServer = s;
  return s;
}

process.on('SIGTERM', () => {
  if (currentServer) currentServer.close();
});
process.on('SIGINT', () => {
  if (currentServer) currentServer.close();
});

startListen();

module.exports = app;
