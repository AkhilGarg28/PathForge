// Mock data for PathForge client development

export const INITIAL_USER = {
  id: 'usr-demo-1',
  email: 'learner@pathforge.dev',
  name: 'Taylor Swiftly',
  roleId: 'mern-developer',
};

export const MOCK_ROLES = [
  {
    id: 'mern-developer',
    title: 'MERN Stack Developer',
    description:
      'Master modern full-stack web engineering across MongoDB, Express, React, and Node.js with production best practices.',
    dimensions: [
      'Frontend (React & State)',
      'Backend (Node.js & Express)',
      'Database (MongoDB & Modeling)',
      'DevOps & Deployment',
      'System Architecture',
    ],
  },
  {
    id: 'data-analyst',
    title: 'Data Analyst',
    description:
      'Turn complex data into actionable business intelligence using SQL, Python, statistics, and interactive dashboards.',
    dimensions: [
      'SQL & Query Optimization',
      'Python for Analytics',
      'Data Visualization',
      'Applied Statistics',
      'Business Intelligence',
    ],
  },
];

const LIKERT_OPTIONS = [
  '1 - No familiarity or experience',
  '2 - Conceptual understanding, little hands-on',
  '3 - Can build with documentation and guides',
  '4 - Proficient and comfortable working independently',
  '5 - Advanced / Production-grade mastery and optimization',
];

// 12 diagnostic questions for MERN Developer (no right/wrong answers)
export const MOCK_DIAGNOSTIC_MERN = [
  {
    id: 'mern-q1',
    dimension: 'Frontend (React & State)',
    text: 'How confident are you configuring React hooks (useEffect, useMemo, useCallback) and preventing unnecessary re-renders?',
    options: LIKERT_OPTIONS,
  },
  {
    id: 'mern-q2',
    dimension: 'Frontend (React & State)',
    text: 'How would you rate your experience building accessible, responsive component layouts and managing global client state?',
    options: LIKERT_OPTIONS,
  },
  {
    id: 'mern-q3',
    dimension: 'Frontend (React & State)',
    text: 'How comfortable are you with client-side routing, route guards, and code-splitting with dynamic imports?',
    options: LIKERT_OPTIONS,
  },
  {
    id: 'mern-q4',
    dimension: 'Backend (Node.js & Express)',
    text: 'How familiar are you with the Node.js event loop, streams, and non-blocking asynchronous execution?',
    options: LIKERT_OPTIONS,
  },
  {
    id: 'mern-q5',
    dimension: 'Backend (Node.js & Express)',
    text: 'How proficient are you architecting RESTful APIs with Express, including middleware, validation, and error cascades?',
    options: LIKERT_OPTIONS,
  },
  {
    id: 'mern-q6',
    dimension: 'Backend (Node.js & Express)',
    text: 'How experienced are you with authentication schemes (JWT in httpOnly cookies, OAuth2, session invalidation)?',
    options: LIKERT_OPTIONS,
  },
  {
    id: 'mern-q7',
    dimension: 'Database (MongoDB & Modeling)',
    text: 'How skilled are you in schema modeling in Mongoose/MongoDB, choosing between embedding vs referencing?',
    options: LIKERT_OPTIONS,
  },
  {
    id: 'mern-q8',
    dimension: 'Database (MongoDB & Modeling)',
    text: 'How confident are you designing MongoDB aggregation pipelines, compound indexes, and diagnosing slow queries?',
    options: LIKERT_OPTIONS,
  },
  {
    id: 'mern-q9',
    dimension: 'DevOps & Deployment',
    text: 'How comfortable are you writing Dockerfiles, docker-compose configs, and managing environment variables safely?',
    options: LIKERT_OPTIONS,
  },
  {
    id: 'mern-q10',
    dimension: 'DevOps & Deployment',
    text: 'What is your level of experience setting up CI/CD pipelines (e.g. GitHub Actions) with automated linting and tests?',
    options: LIKERT_OPTIONS,
  },
  {
    id: 'mern-q11',
    dimension: 'System Architecture',
    text: 'How experienced are you with API rate limiting, caching with Redis, and resilience patterns (circuit breakers, retries)?',
    options: LIKERT_OPTIONS,
  },
  {
    id: 'mern-q12',
    dimension: 'System Architecture',
    text: 'How confident are you conducting security hardening (CORS, CSP headers, rate-limiting, sanitizing inputs against injection)?',
    options: LIKERT_OPTIONS,
  },
];

// 12 diagnostic questions for Data Analyst (no right/wrong answers)
export const MOCK_DIAGNOSTIC_DATA_ANALYST = [
  {
    id: 'da-q1',
    dimension: 'SQL & Query Optimization',
    text: 'How comfortable are you writing complex SQL queries using window functions (ROW_NUMBER, DENSE_RANK, LEAD/LAG)?',
    options: LIKERT_OPTIONS,
  },
  {
    id: 'da-q2',
    dimension: 'SQL & Query Optimization',
    text: 'How skilled are you in optimizing analytical queries (understanding query execution plans, partitioning, indexing)?',
    options: LIKERT_OPTIONS,
  },
  {
    id: 'da-q3',
    dimension: 'SQL & Query Optimization',
    text: 'How experienced are you creating and managing relational schemas, views, and automated data transformations?',
    options: LIKERT_OPTIONS,
  },
  {
    id: 'da-q4',
    dimension: 'Python for Analytics',
    text: 'How confident are you using Pandas and NumPy for reshaping, merging, and cleaning messy datasets?',
    options: LIKERT_OPTIONS,
  },
  {
    id: 'da-q5',
    dimension: 'Python for Analytics',
    text: 'How experienced are you writing reusable data analysis scripts and notebook workflows in Jupyter/Colab?',
    options: LIKERT_OPTIONS,
  },
  {
    id: 'da-q6',
    dimension: 'Data Visualization',
    text: 'How comfortable are you building visual charts and plots using tools like Matplotlib, Seaborn, or Plotly?',
    options: LIKERT_OPTIONS,
  },
  {
    id: 'da-q7',
    dimension: 'Data Visualization',
    text: 'How confident are you selecting the correct visual encoding (heatmaps, box plots, scatter plots) for stakeholder reports?',
    options: LIKERT_OPTIONS,
  },
  {
    id: 'da-q8',
    dimension: 'Applied Statistics',
    text: 'How familiar are you with hypothesis testing, p-values, confidence intervals, and A/B test sample sizing?',
    options: LIKERT_OPTIONS,
  },
  {
    id: 'da-q9',
    dimension: 'Applied Statistics',
    text: 'What is your level of experience identifying data distributions, skewness, outliers, and selecting appropriate remedies?',
    options: LIKERT_OPTIONS,
  },
  {
    id: 'da-q10',
    dimension: 'Business Intelligence',
    text: 'How skilled are you building executive dashboards in BI tools (Tableau, PowerBI, or Metabase)?',
    options: LIKERT_OPTIONS,
  },
  {
    id: 'da-q11',
    dimension: 'Business Intelligence',
    text: 'How proficient are you formulating metrics, KPIs, and cohort retention analyses to drive business decisions?',
    options: LIKERT_OPTIONS,
  },
  {
    id: 'da-q12',
    dimension: 'Business Intelligence',
    text: 'How confident are you communicating analytical findings to non-technical stakeholders with structured narratives?',
    options: LIKERT_OPTIONS,
  },
];

// Sample 7-module roadmap conforming to contract:
// First module is active, the rest are locked.
export const INITIAL_SAMPLE_ROADMAP = {
  roleId: 'mern-developer',
  generatedBy: 'llm',
  readinessScore: 42,
  modules: [
    {
      moduleId: 'mod-1',
      title: 'Modern JavaScript & Async Foundations',
      description:
        'Master closures, prototypical inheritance, the event loop, Promises, and async/await in real-world scenarios.',
      resourceTags: ['JavaScript', 'Async', 'EventLoop'],
      resources: [
        {
          title: 'MDN: Asynchronous JavaScript Deep Dive',
          url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous',
          type: 'documentation',
        },
        {
          title: 'JavaScript Event Loop Visualized',
          url: 'https://jsv9000.app/',
          type: 'interactive',
        },
      ],
      estimatedHours: 8,
      status: 'active',
      checkpointScore: null,
    },
    {
      moduleId: 'mod-2',
      title: 'Component Architecture & State in React',
      description:
        'Build performant React components with custom hooks, context, state modeling, and render optimization.',
      resourceTags: ['React', 'Hooks', 'Architecture'],
      resources: [
        {
          title: 'Official React Documentation: Thinking in React',
          url: 'https://react.dev/learn/thinking-in-react',
          type: 'documentation',
        },
      ],
      estimatedHours: 12,
      status: 'locked',
      checkpointScore: null,
    },
    {
      moduleId: 'mod-3',
      title: 'Server-Side Foundations with Node & Express',
      description:
        'Design modular RESTful APIs with Express, asynchronous route handlers, centralized error pipelines, and logging.',
      resourceTags: ['Node.js', 'Express', 'REST API'],
      resources: [
        {
          title: 'Express Guide: Writing Middleware',
          url: 'https://expressjs.com/en/guide/writing-middleware.html',
          type: 'documentation',
        },
      ],
      estimatedHours: 10,
      status: 'locked',
      checkpointScore: null,
    },
    {
      moduleId: 'mod-4',
      title: 'Secure Authentication & Cookie Sessions',
      description:
        'Implement authentication using JWT stored in httpOnly secure cookies, CSRF protection, and route authorization.',
      resourceTags: ['Security', 'JWT', 'Cookies', 'Auth'],
      resources: [
        {
          title: 'OWASP: JSON Web Token Cheat Sheet',
          url: 'https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html',
          type: 'article',
        },
      ],
      estimatedHours: 9,
      status: 'locked',
      checkpointScore: null,
    },
    {
      moduleId: 'mod-5',
      title: 'Data Persistence & Aggregation with MongoDB',
      description:
        'Design document schemas, index for query performance, and write complex data aggregation pipelines.',
      resourceTags: ['MongoDB', 'Mongoose', 'Database'],
      resources: [
        {
          title: 'MongoDB University: Aggregation Framework Basics',
          url: 'https://learn.mongodb.com/',
          type: 'course',
        },
      ],
      estimatedHours: 14,
      status: 'locked',
      checkpointScore: null,
    },
    {
      moduleId: 'mod-6',
      title: 'Full-Stack Integration & Testing',
      description:
        'Connect client and server end-to-end, write integration tests, and handle network edge-cases gracefully.',
      resourceTags: ['Integration', 'Testing', 'FullStack'],
      resources: [
        {
          title: 'Kent C. Dodds: Testing Trophy Strategy',
          url: 'https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications',
          type: 'article',
        },
      ],
      estimatedHours: 11,
      status: 'locked',
      checkpointScore: null,
    },
    {
      moduleId: 'mod-7',
      title: 'Production Deployment & Observability',
      description:
        'Containerize with Docker, configure CI/CD pipelines, and deploy frontend to Vercel and backend to cloud containers.',
      resourceTags: ['DevOps', 'Docker', 'CI/CD', 'Vercel'],
      resources: [
        {
          title: 'Vercel Production Deployment Checklist',
          url: 'https://vercel.com/docs',
          type: 'documentation',
        },
      ],
      estimatedHours: 10,
      status: 'locked',
      checkpointScore: null,
    },
  ],
};

// Checkpoint assessment questions per module
export const MOCK_CHECKPOINT_QUESTIONS = {
  'mod-1': {
    moduleId: 'mod-1',
    title: 'Modern JavaScript & Async Foundations Checkpoint',
    questions: [
      {
        id: 'cp-1-1',
        text: 'What is the order of execution between microtasks (Promise callbacks) and macrotasks (setTimeout)?',
        options: [
          'Macrotasks always execute before any pending microtask',
          'All microtasks execute immediately after the current script run, before the next macrotask',
          'They alternate one by one in chronological order',
          'Promises run in parallel on separate operating system threads',
        ],
      },
      {
        id: 'cp-1-2',
        text: 'What does Promise.all() do when one of the passed promises rejects?',
        options: [
          'Waits for the rest to resolve and returns partial results',
          'Immediately rejects with the reason of that first rejection',
          'Retries the failed promise up to 3 times',
          'Resolves with null in place of the rejected promise',
        ],
      },
      {
        id: 'cp-1-3',
        text: 'How can you prevent memory leaks when binding event listeners inside closures?',
        options: [
          'Closures in JavaScript never cause memory leaks',
          'Ensure references to unneeded outer scopes are cleared and removeEventListener is called upon teardown',
          'Always use var instead of let or const',
          'Wrap every listener in an anonymous async function',
        ],
      },
    ],
  },
  'mod-2': {
    moduleId: 'mod-2',
    title: 'Component Architecture & State Checkpoint',
    questions: [
      {
        id: 'cp-2-1',
        text: 'When should you choose React Context over local component state?',
        options: [
          'For every piece of state in an application to avoid prop drilling completely',
          'When data needs to be accessed by many components at different nesting levels and rarely changes',
          'Only when communicating with external backend services',
          'Context should only be used for animation states',
        ],
      },
    ],
  },
  default: {
    moduleId: 'generic',
    title: 'Module Progress Assessment',
    questions: [
      {
        id: 'cp-gen-1',
        text: 'How would you rate your application of the module topics in a production project?',
        options: [
          'Need more foundational practice before moving ahead',
          'Completed all exercises and understand the primary patterns',
          'Can implement and teach these concepts with confidence',
          'Have successfully integrated these concepts into a production codebase',
        ],
      },
    ],
  },
};
