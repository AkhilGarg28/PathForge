/**
 * PathForge Mock API Responses
 * Conforms strictly to docs/API_CONTRACT.md and data/sampleRoadmap.json
 */

export const mockUser = {
  id: '64b0f9f1e1a2b3c4d5e6f7a1',
  _id: '64b0f9f1e1a2b3c4d5e6f7a1',
  name: 'Alex Mercer',
  email: 'alex.mercer@example.com',
  roleId: '64b0f9f1e1a2b3c4d5e6f7b1',
  createdAt: '2026-10-30T10:00:00.000Z',
  updatedAt: '2026-10-30T10:00:00.000Z'
};

export const mockRoles = [
  {
    _id: '64b0f9f1e1a2b3c4d5e6f7b1',
    id: '64b0f9f1e1a2b3c4d5e6f7b1',
    name: 'MERN Developer',
    slug: 'mern-developer',
    description:
      'Build scalable, full-stack web applications using MongoDB, Express.js, React, and Node.js.',
    dimensions: ['javascript', 'react', 'node-express', 'databases-git']
  },
  {
    _id: '64b0f9f1e1a2b3c4d5e6f7b2',
    id: '64b0f9f1e1a2b3c4d5e6f7b2',
    name: 'Data Analyst',
    slug: 'data-analyst',
    description:
      'Transform raw business data into actionable strategic insights using SQL, Excel, Python, and BI dashboards.',
    dimensions: ['excel-sql', 'python', 'statistics', 'data-visualization']
  }
];

export const mockDiagnosticQuestions = {
  roleId: 'mern-developer',
  roleName: 'MERN Developer',
  totalQuestions: 12,
  dimensions: ['javascript', 'react', 'node-express', 'databases-git'],
  questions: [
    {
      id: 'mern-js-1',
      dimension: 'javascript',
      question:
        'Which method determines whether an array includes a certain value among its entries, returning true or false?',
      options: ['find()', 'includes()', 'indexOf()', 'some()']
    },
    {
      id: 'mern-js-2',
      dimension: 'javascript',
      question: 'What is the primary characteristic of closures in JavaScript?',
      options: [
        'They prevent variables from being garbage collected forever',
        'They allow an inner function to retain access to its outer lexical scope',
        'They require an async/await wrapper to return values',
        'They only work with variables defined via var'
      ]
    },
    {
      id: 'mern-js-3',
      dimension: 'javascript',
      question: 'What occurs when an unhandled Promise rejection is triggered in modern Node.js?',
      options: [
        'Node.js automatically re-attempts the asynchronous operation three times',
        'The process terminates with a non-zero exit code unless an event listener catches it',
        'The error is silently routed to the system syslog and execution continues',
        'The event loop pauses until user input is received'
      ]
    },
    {
      id: 'mern-react-1',
      dimension: 'react',
      question:
        'Which React hook should be utilized to cache expensive calculation values across re-renders?',
      options: ['useMemo', 'useCallback', 'useRef', 'useEffect']
    },
    {
      id: 'mern-react-2',
      dimension: 'react',
      question:
        'What occurs when a component mutates state directly (e.g. state.count = 5) instead of using the setter?',
      options: [
        'React immediately re-renders the component with a warning in console',
        'React does not detect the mutation and fails to trigger a re-render',
        'A fatal compile-time syntax error is thrown by the JSX bundler',
        'The state variable is deleted from local memory'
      ]
    },
    {
      id: 'mern-react-3',
      dimension: 'react',
      question: 'When is the cleanup function of a useEffect hook executed?',
      options: [
        'Only when the component initially mounts in the browser DOM',
        'Only if an uncaught exception is thrown inside the effect callback',
        'Before the effect runs on dependency change, and upon component unmount',
        'At the start of every single browser repaint animation frame'
      ]
    },
    {
      id: 'mern-node-1',
      dimension: 'node-express',
      question:
        'In Express.js, what is the required function signature for an error-handling middleware?',
      options: ['(req, res, next)', '(err, req, res, next)', '(err, req, res)', '(req, res, err)']
    },
    {
      id: 'mern-node-2',
      dimension: 'node-express',
      question: 'Which built-in middleware parses incoming request bodies formatted as JSON?',
      options: ['express.urlencoded()', 'express.raw()', 'express.json()', 'express.static()']
    },
    {
      id: 'mern-node-3',
      dimension: 'node-express',
      question: 'Which HTTP status code signifies that a resource was successfully created?',
      options: ['200 OK', '204 No Content', '201 Created', '304 Not Modified']
    },
    {
      id: 'mern-db-1',
      dimension: 'databases-git',
      question: 'In Mongoose, which schema option guarantees unique index enforcement in MongoDB?',
      options: ['primary: true', 'unique: true', 'indexed: true', 'required: true']
    },
    {
      id: 'mern-db-2',
      dimension: 'databases-git',
      question: 'In MongoDB aggregations, which pipeline stage filters the document stream?',
      options: ['$group', '$project', '$match', '$lookup']
    },
    {
      id: 'mern-db-3',
      dimension: 'databases-git',
      question:
        'In Git, which command creates a new feature branch and immediately switches to it?',
      options: [
        'git branch -c <name>',
        'git checkout -b <name>',
        'git merge <name>',
        'git status -b <name>'
      ]
    }
  ]
};

export const mockRoadmap = {
  id: 'sample-mern-roadmap-01',
  _id: 'sample-mern-roadmap-01',
  userId: '64b0f9f1e1a2b3c4d5e6f7a1',
  roleId: 'mern-developer',
  dimensionScores: {
    javascript: 3.0,
    react: 3.0,
    'node-express': 3.0,
    'databases-git': 3.0
  },
  readinessScore: 24,
  generatedBy: 'llm',
  createdAt: '2026-10-30T10:05:00.000Z',
  updatedAt: '2026-10-30T10:05:00.000Z',
  modules: [
    {
      moduleId: 'mern-mod-1',
      title: 'JavaScript Foundations & Modern ES6+',
      description:
        'Master asynchronous JavaScript, promises, closures, array methods, and modern ES2022+ language syntax.',
      resourceTags: ['javascript'],
      resources: [
        {
          title: 'MDN Web Docs: JavaScript Reference',
          url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
          type: 'docs'
        },
        {
          title: 'freeCodeCamp: Learn JavaScript Fundamentals for Beginners',
          url: 'https://www.freecodecamp.org/news/learn-javascript-for-beginners/',
          type: 'article'
        },
        {
          title: 'freeCodeCamp: Learn JavaScript - Full Course for Beginners',
          url: 'https://www.youtube.com/watch?v=PkZNo7MFNFg',
          type: 'video'
        }
      ],
      estimatedHours: 10,
      status: 'active',
      checkpointScore: null
    },
    {
      moduleId: 'mern-mod-2',
      title: 'React Core Principles & Hooks Architecture',
      description:
        'Build dynamic single-page applications utilizing functional components, custom hooks, reconciliation keys, and context.',
      resourceTags: ['react'],
      resources: [
        {
          title: 'React Official Documentation: Quick Start & Learn',
          url: 'https://react.dev/learn',
          type: 'docs'
        },
        {
          title: 'freeCodeCamp: React Architecture & Component Patterns',
          url: 'https://www.freecodecamp.org/news/tag/react/',
          type: 'article'
        },
        {
          title: 'freeCodeCamp: React Course for Beginners',
          url: 'https://www.youtube.com/watch?v=bMknfKXIFA8',
          type: 'video'
        }
      ],
      estimatedHours: 12,
      status: 'locked',
      checkpointScore: null
    },
    {
      moduleId: 'mern-mod-3',
      title: 'Node.js & Express RESTful API Services',
      description:
        'Architect scalable backend services, custom routing middleware, JSON validation, and error-handling hierarchies.',
      resourceTags: ['node', 'express'],
      resources: [
        {
          title: 'Node.js Official Documentation & API Reference',
          url: 'https://nodejs.org/en/docs',
          type: 'docs'
        },
        {
          title: 'Express.js Official Documentation & Routing Guide',
          url: 'https://expressjs.com/',
          type: 'article'
        },
        {
          title: 'freeCodeCamp: Node.js and Express.js Full Course',
          url: 'https://www.youtube.com/watch?v=Oe421EPjeBE',
          type: 'video'
        }
      ],
      estimatedHours: 14,
      status: 'locked',
      checkpointScore: null
    },
    {
      moduleId: 'mern-mod-4',
      title: 'MongoDB Data Modeling & Mongoose Aggregations',
      description:
        'Design performant document schemas, create compound indexes, and build multi-stage aggregation pipelines.',
      resourceTags: ['mongodb'],
      resources: [
        {
          title: 'MongoDB Official Manual & Schema Guides',
          url: 'https://www.mongodb.com/docs/',
          type: 'docs'
        },
        {
          title: 'Pro Git Book: Official Documentation & Reference',
          url: 'https://git-scm.com/book/en/v2',
          type: 'article'
        },
        {
          title: 'freeCodeCamp: Git and GitHub for Beginners',
          url: 'https://www.youtube.com/watch?v=RGOj5yH7evk',
          type: 'video'
        }
      ],
      estimatedHours: 12,
      status: 'locked',
      checkpointScore: null
    },
    {
      moduleId: 'mern-mod-5',
      title: 'Full-Stack Security, Authentication & Deployment',
      description:
        'Implement production authentication with JWT in httpOnly cookies, password hashing with bcrypt, Helmet headers, and CORS.',
      resourceTags: ['node', 'express'],
      resources: [
        {
          title: 'Node.js Official Documentation & API Reference',
          url: 'https://nodejs.org/en/docs',
          type: 'docs'
        },
        {
          title: 'Express.js Official Documentation & Routing Guide',
          url: 'https://expressjs.com/',
          type: 'article'
        }
      ],
      estimatedHours: 12,
      status: 'locked',
      checkpointScore: null
    },
    {
      moduleId: 'mern-mod-6',
      title: 'Full-Stack Capstone Project & Cloud Delivery',
      description:
        'Integrate React frontend with Express/MongoDB backend, configure CI/CD pipelines, and deploy containerized production apps.',
      resourceTags: ['git'],
      resources: [
        {
          title: 'Pro Git Book: Official Documentation & Reference',
          url: 'https://git-scm.com/book/en/v2',
          type: 'article'
        },
        {
          title: 'freeCodeCamp: Git and GitHub for Beginners',
          url: 'https://www.youtube.com/watch?v=RGOj5yH7evk',
          type: 'video'
        }
      ],
      estimatedHours: 18,
      status: 'locked',
      checkpointScore: null
    }
  ]
};

export const mockCheckpoint = {
  moduleId: 'mern-mod-1',
  roleId: 'mern-developer',
  questions: [
    {
      id: 'cp-mern-mod-1-q1',
      question: 'Which Array method determines whether at least one element satisfies a predicate?',
      options: ['some()', 'every()', 'includes()', 'find()']
    },
    {
      id: 'cp-mern-mod-1-q2',
      question: 'What occurs when an async function returns a plain primitive value?',
      options: [
        'It throws a runtime TypeError',
        'It automatically wraps the returned value in a resolved Promise',
        'It coerces the value to undefined',
        'It stops execution until garbage collected'
      ]
    },
    {
      id: 'cp-mern-mod-1-q3',
      question: 'What is preserved in a closure when an inner function is returned?',
      options: [
        'Only variables declared with var',
        'The outer physical call stack frame',
        'The outer lexical environment and variable bindings',
        'The runtime parameter types'
      ]
    },
    {
      id: 'cp-mern-mod-1-q4',
      question:
        'Which operator enables accessing nested object properties without throwing if nullish?',
      options: ['??', '&&', '||', '?.']
    }
  ]
};
