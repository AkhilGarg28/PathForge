const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Roadmap = require('../models/Roadmap');
const Role = require('../models/Role');
const User = require('../models/User');

const sampleModules = [
  {
    moduleId: 'mod-1-react-foundations',
    title: 'React Core Foundations & State Architecture',
    description:
      'Master functional components, hooks lifecycle, and component decomposition patterns.',
    resourceTags: ['React', 'Frontend', 'Hooks'],
    resources: [
      {
        title: 'React Official Docs: Quick Start',
        url: 'https://react.dev/learn',
        type: 'docs',
      },
      {
        title: 'Deep Dive into useState and useEffect',
        url: 'https://developer.mozilla.org/en-US/docs/Learn/Tools_and_testing/Client-side_JavaScript_frameworks/React_hooks',
        type: 'article',
      },
    ],
    estimatedHours: 10,
    status: 'active', // First module is active
    checkpointScore: null,
  },
  {
    moduleId: 'mod-2-advanced-react',
    title: 'Advanced React, Context, & State Management',
    description:
      'Scale application state using React Context, Redux Toolkit, and memoization optimizations.',
    resourceTags: ['React', 'Redux', 'Context'],
    resources: [
      {
        title: 'Redux Essentials Tutorial',
        url: 'https://redux.js.org/tutorials/essentials/part-1-overview-concepts',
        type: 'docs',
      },
    ],
    estimatedHours: 15,
    status: 'locked',
    checkpointScore: null,
  },
  {
    moduleId: 'mod-3-nodejs-express',
    title: 'Node.js Runtime & Express Server Architecture',
    description:
      'Build robust REST services, async middleware pipelines, and error handling layers.',
    resourceTags: ['Node.js', 'Express', 'Backend'],
    resources: [
      {
        title: 'Express Routing and Middleware',
        url: 'https://expressjs.com/en/guide/routing.html',
        type: 'docs',
      },
    ],
    estimatedHours: 12,
    status: 'locked',
    checkpointScore: null,
  },
  {
    moduleId: 'mod-4-mongodb-mongoose',
    title: 'Data Modeling with MongoDB & Mongoose',
    description:
      'Design schemas, indexes, aggregation pipelines, and optimize database queries.',
    resourceTags: ['MongoDB', 'Mongoose', 'Database'],
    resources: [
      {
        title: 'Mongoose Schemas and Models',
        url: 'https://mongoosejs.com/docs/guide.html',
        type: 'docs',
      },
    ],
    estimatedHours: 14,
    status: 'locked',
    checkpointScore: null,
  },
  {
    moduleId: 'mod-5-api-security',
    title: 'API Security, JWT Authentication & RBAC',
    description:
      'Secure APIs using httpOnly cookies, rate limiters, bcrypt, and CORS policies.',
    resourceTags: ['Security', 'JWT', 'Authentication'],
    resources: [
      {
        title: 'OWASP Authentication Cheat Sheet',
        url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html',
        type: 'article',
      },
    ],
    estimatedHours: 8,
    status: 'locked',
    checkpointScore: null,
  },
  {
    moduleId: 'mod-6-testing-deployment',
    title: 'Testing with Jest/Supertest & CI/CD Deployment',
    description:
      'Implement unit and integration testing pipelines, Docker containers, and production deployment.',
    resourceTags: ['Testing', 'Jest', 'DevOps', 'Docker'],
    resources: [
      {
        title: 'Jest Testing Framework Reference',
        url: 'https://jestjs.io/docs/getting-started',
        type: 'docs',
      },
    ],
    estimatedHours: 16,
    status: 'locked',
    checkpointScore: null,
  },
];

const createSampleRoadmap = async (userId, roleId) => {
  let resolvedRoleId = roleId;

  if (!resolvedRoleId) {
    const role = await Role.findOne();
    if (!role) {
      throw new Error('No role found. Please run seed script first.');
    }
    resolvedRoleId = role._id;
  }

  // Archive any existing active roadmaps for this user
  await Roadmap.updateMany(
    { userId, isArchived: false },
    { isArchived: true }
  );

  const roadmap = await Roadmap.create({
    userId,
    roleId: resolvedRoleId,
    isArchived: false,
    readinessScore: 0,
    modules: sampleModules,
    history: [
      {
        date: new Date(),
        event: 'roadmap_created',
        readinessScore: 0,
      },
    ],
  });

  return roadmap;
};

if (require.main === module) {
  const run = async () => {
    try {
      const userIdArg = process.argv[2];
      await connectDB();

      let targetUserId = userIdArg;
      if (!targetUserId) {
        const user = await User.findOne();
        if (!user) {
          console.error(
            'Usage: node scripts/createSampleRoadmap.js <userId>\nOr create a user first.'
          );
          process.exit(1);
        }
        targetUserId = user._id;
      }

      const roadmap = await createSampleRoadmap(targetUserId);
      console.log(
        `✓ Created sample roadmap for user ${targetUserId} with ID: ${roadmap._id}`
      );
      await mongoose.connection.close();
      process.exit(0);
    } catch (err) {
      console.error(`Failed to create sample roadmap: ${err.message}`);
      if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
      }
      process.exit(1);
    }
  };

  run();
}

module.exports = {
  createSampleRoadmap,
  sampleModules,
};
